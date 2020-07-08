#ifdef _MSC_VER
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#endif


#include "MemBuffer.h"
#include <stdarg.h>
#include <string.h>
#include "common_macros.h"
#include "ExecContext.h"
#include <stdarg.h>
#include <stddef.h>
#include <stdio.h>


#define CHAR_STAR_CAST_AWAY_CONST(var_name) (char*)(var_name)

#define STATIC_ASSSERT_NOT_POINTER(ref) static_assert(sizeof(ref) != sizeof(NULL), "Must pass dereferenced struct and not a pointer. False positive if sizeof(struct) == sizeof(pointer).") /* will fail if struct size same as size of pointer */

//permissive version
#define ZERO_STRUCT(my_struct)  memset(&(my_struct), 0, sizeof(my_struct));
//guards against pointers being passed
#define ZERO_STRUCT_SAFER(my_struct)  ZERO_STRUCT(my_struct);  STATIC_ASSSERT_NOT_POINTER(my_struct)




/**
 * you can also simply do: "MemBuffer mb1 = { 0 };" for the time being.
 */
void MemBuffer_initialize(Jxc* jxc, MemBuffer*mb) {
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(mb == NULL, ErrId__NULL_OBJ);
  ZERO_STRUCT_SAFER(*mb);
}


void MemBuffer_from_const_string(Jxc* jxc, MemBuffer* mb, const char * string, int32_t max_allowed_string_length)
{
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(mb == NULL, ErrId__NULL_OBJ);
  vTHROW_IF(string == NULL, ErrId__NULL_ADDRESS);
  vTHROW_IF(max_allowed_string_length < 0, ErrId__NEGATIVE_LENGTH);

  int str_length = find_string_length(jxc, string, max_allowed_string_length);  //NOTE throws, but we carry on anyway

  mb->read_only = true;
  mb->address = CHAR_STAR_CAST_AWAY_CONST(string);  //OK because of above
  mb->real_buffer_length = str_length;
  mb->write_index = str_length;
  mb->write_limit_ex = INT16_MAX; //will have no effect
}


void MemBuffer_reset_write_index(MemBuffer* mb)
{
  mb->write_index = 0;
}

bool MemBuffer_is_full(MemBuffer* mb)
{
  bool is_full = mb->write_index >= MemBuffer_get_effective_limit(mb);
  return is_full;
}

//typedef struct _TempRegion
//{
//  char* buffer;
//  int length;
//  int start;
//  int end;
//} TempRegion;


void CharBuf_printf(Jxc* jxc, CharBuf* cb, const char* format, ...)
{
  vTRY_BUBBLE_EXCEPTION();
  va_list args;
  va_start(args, format);
  CharBuf_vprintf(jxc, cb, format, args);
  va_end(args);
}

/**
 * Includes the NULL terminator in result
 */
void CharBuf_vprintf(Jxc* jxc, CharBuf* cb, const char* format, va_list args)
{
  vTRY_BUBBLE_EXCEPTION();

  vTHROW_IF(cb == NULL, ErrId__NULL_OBJ);
  vTHROW_IF(format == NULL, ErrId__PRINTF_ERR);     //needed? will printf catch it?
  vTHROW_IF(cb->array == NULL, ErrId__NULL_STATE);
  vTHROW_IF(cb->size < 0, ErrId__NEGATIVE_LENGTH);
  int chars_written = vsnprintf(cb->array, cb->size, format, args); //chars_written count doesn't include null term

  vTHROW_IF(chars_written < 0, ErrId__PRINTF_ERR);
  vTHROW_IF(chars_written >= cb->size, ErrId__TRUNCATED);
}


/**
 * Allows truncation, but throws error as well
 */
void CharBuf_copy_str_no_term(Jxc* jxc, CharBuf* cb, const char* to_copy) {
  vTRY_BUBBLE_EXCEPTION();

  vTHROW_IF(cb == NULL, ErrId__NULL_OBJ);

  int16_t string_length = find_string_length(jxc, to_copy, cb->size);

  //allow truncation
  vTRY_BUBBLE_EXCEPTION_EXCEPT(ErrId__TRUNCATED);

  memcpy(cb->array, to_copy, string_length);
}

void MemBuffer_append_printf(Jxc* jxc, MemBuffer* mb, CharBuf* temp_buffer, const char* format, ...)
{
  vTRY_BUBBLE_EXCEPTION();
  bool truncated = false;

  //printf to temp
  //---------------------
  va_list args;
  va_start(args, format);
  CharBuf_vprintf(jxc, temp_buffer, format, args);
  va_end(args);
  //---------------------

  //allow truncation
  if (ERROR_IS(ErrId__TRUNCATED)) {
    truncated = true;
    CLEAR_ERROR();
  }

  MemBuffer_append_string(jxc, mb, temp_buffer->array, 100);  //TODO review

  vTRY_BUBBLE_EXCEPTION();

  if (truncated) {
    MARK_EXCEPTION(ErrId__TRUNCATED);
  }
}


void MemBuffer_append_printf_with_null(Jxc* jxc, MemBuffer* mb, const char* format, ...) 
{
  vTRY_BUBBLE_EXCEPTION();

  int space_left = MemBuffer_get_space_left(mb);
  vTHROW_IF(space_left <= 0, ErrId__MEMBUF_DST_NOT_BIG_ENOUGH);

  char* address = mb->address + mb->write_index;

  //---------------------
  va_list args;
  va_start(args, format);
  int chars_written = vsnprintf(address, space_left, format, args); //chars_written doesn't include null term
  va_end(args);
  //---------------------

  vTHROW_IF(chars_written < 0, ErrId__PRINTF_ERR);

  mb->write_index += chars_written;
  vTHROW_IF(chars_written >= space_left, ErrId__MEMBUF_DST_NOT_BIG_ENOUGH);
}


//void mprintf(char *format, ...)
//{
//  va_list args;
//  static char temp_buffer[2048];
//
//  va_start(args, format);
//
//  vsnprintf(temp_buffer, 255 - 2, format, args);
//  printf(temp_buffer);
//  OutputDebugString(temp_buffer);
//  va_end(args);
//}
void MemBuffer_append_fill_with_char(Jxc* jxc, MemBuffer* mb, char c)
{
  vTRY_BUBBLE_EXCEPTION();

  while (MemBuffer_is_full(mb) == false) {
    vTRY_BUBBLE_EXCEPTION();
    MemBuffer_append_char(jxc, mb, c);    //TODOLOW improve performance
  }
}

void MemBuffer_set_section_start_and_length(Jxc* jxc, MemBuffer* mb, int16_t start_index, int16_t length) {
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(start_index < 0, ErrId__VALUE_BELOW_MIN);
  vTHROW_IF(length < 0, ErrId__NEGATIVE_LENGTH);

  mb->write_index = start_index;
  mb->write_limit_ex = start_index + length;
}

void MemBuffer_remove_section_limit(Jxc* jxc, MemBuffer* mb) {
  vTRY_BUBBLE_EXCEPTION();
  mb->write_limit_ex = INT16_MAX;
}

void MemBuffer_clear_with(Jxc* jxc, MemBuffer* mb, char clear_char)
{
  vTRY_BUBBLE_EXCEPTION();
  MemBuffer_reset_write_index(mb);
  MemBuffer_append_fill_with_char(jxc, mb, clear_char);
  MemBuffer_reset_write_index(mb);
}

void MemBuffer_clear(Jxc* jxc, MemBuffer* mb)
{
  vTRY_BUBBLE_EXCEPTION();
  MemBuffer_clear_with(jxc, mb, '\0');
}

void MemBuffer_set_write_index(Jxc* jxc, MemBuffer* mb, int16_t write_index)
{
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(write_index < 0, ErrId__VALUE_BELOW_MIN);
  vTHROW_IF(write_index >= MemBuffer_get_effective_limit(mb), ErrId__EXCEEDED_LIMIT);
  mb->write_index = write_index;
}

void MemBuffer_point_to_buffer(Jxc* jxc, MemBuffer* mb, void * buffer_address, int32_t buffer_max_length)
{
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(mb == NULL, ErrId__NULL_OBJ);
  vTHROW_IF(buffer_address == NULL, ErrId__NULL_ADDRESS);
  vTHROW_IF(buffer_max_length < 0, ErrId__NEGATIVE_LENGTH);

  mb->address    = buffer_address;
  mb->real_buffer_length = buffer_max_length;
  mb->write_limit_ex = buffer_max_length;
  mb->write_index = 0;
}

/**
 * Returns number of bytes written in buffer.
 * Does not return underlying buffer size.
 */
int16_t MemBuffer_get_size(MemBuffer const * const self)
{
  int16_t result = self->write_index;
  return result;
}

int16_t MemBuffer_get_effective_limit(MemBuffer const * const self)
{
  int16_t result = MIN(self->write_limit_ex, self->real_buffer_length);
  return result;
}

/**
 * Returns number of bytes available for buffer
 */
int16_t MemBuffer_get_space_left(MemBuffer const * const self)
{
  int16_t result = MemBuffer_get_effective_limit(self) - self->write_index;

  if (result < 0)
  {
    result = 0;
  }
  return result;
}

void MemBuffer_to_string(Jxc* jxc, MemBuffer * self, char * destination, int real_buffer_length)
{
  vTRY_BUBBLE_EXCEPTION();

  vTHROW_IF(self->write_index > MemBuffer_get_effective_limit(self), ErrId__INVALID_STATE);
  vTHROW_IF(real_buffer_length < 1, ErrId__UNSAFE_REQUEST); //need room for null terminator
  vTHROW_IF(real_buffer_length < MemBuffer_get_size(self) + 1, ErrId__MEMBUF_DST_NOT_BIG_ENOUGH); //+1 because we need room for null terminator

  int i = 0;
  for (; i < real_buffer_length - 1 && i < self->write_index; i++)
  {
    char c = self->address[i];
    destination[i] = c;
  }
  destination[i] = '\0';
}

void MemBuffer_append_raw(Jxc* jxc, MemBuffer * const dst, MemBuffer const * const src)
{
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(dst->read_only, ErrId__READ_ONLY_ACCESS);

  int16_t space_left = MemBuffer_get_space_left(dst);
  int16_t desired_append_length = MemBuffer_get_size(src);

  int16_t actual_append_length = 0;
  if(desired_append_length <= space_left || dst->no_write_partial_on_too_small == false){
    actual_append_length = MIN(space_left, desired_append_length);
  }

  if(actual_append_length > 0){
    memcpy((uint8_t*)dst->address + dst->write_index, src->address, actual_append_length);
    dst->write_index += actual_append_length;
  }

  vTHROW_IF(desired_append_length > space_left, ErrId__TRUNCATED);
}

/**
 * Does lots of error checking on source and destination that shouldn't be necessary, 
 * but may help catch usage errors during development.
 */
void MemBuffer_append(Jxc* jxc, MemBuffer * const dst, MemBuffer const * const src)
{
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(dst == NULL || src == NULL, ErrId__MEMBUF_NULL_PARAM);
  
  vTHROW_IF(dst->address == NULL, ErrId__MEMBUF_DST_BUFFER_NULL);
  vTHROW_IF(src->address == NULL, ErrId__MEMBUF_SRC_BUFFER_NULL);

  vTHROW_IF(dst->real_buffer_length < 0, ErrId__MEMBUF_DST_MAX_LENGTH_NEGATIVE);
  vTHROW_IF(dst->write_limit_ex     < 0, ErrId__NEGATIVE_LENGTH);
  vTHROW_IF(src->real_buffer_length < 0, ErrId__MEMBUF_SRC_MAX_LENGTH_NEGATIVE);

  vTHROW_IF(dst->write_index < 0, ErrId__MEMBUF_DST_INDEX_NEGATIVE);
  vTHROW_IF(src->write_index < 0, ErrId__MEMBUF_SRC_INDEX_NEGATIVE);

  MemBuffer_append_raw(jxc, dst, src);
}


void MemBuffer_append_string(Jxc* jxc, MemBuffer * const dst, char const * const string, int max_allowed_string_length)
{
  vTRY_BUBBLE_EXCEPTION();
  MemBuffer string_buf = { 0 }; //not needed in self case, but safe practice to zero struct.
  MemBuffer_from_const_string(jxc, &string_buf, string, max_allowed_string_length);
  vTRY_BUBBLE_EXCEPTION();
  MemBuffer_append(jxc, dst, &string_buf);
}

const char* MemBuffer_terminate_and_get_string(Jxc* jxc, MemBuffer * const dst, const char* default_string)
{
  MemBuffer_terminate_string(jxc, dst);
  if (ERROR_IS_SET()) {
    return default_string;
  }
  return dst->address;
}

void MemBuffer_terminate_string(Jxc* jxc, MemBuffer * const dst)
{
  //vTRY_BUBBLE_EXCEPTION(); not needed as call below does it

  //TODO check if needs it first
  MemBuffer_append_char(jxc, dst, '\0');
}

void MemBuffer_append_char_array(Jxc* jxc, MemBuffer * const dst, char* characters, int16_t length)
{
  vTRY_BUBBLE_EXCEPTION();
  vTHROW_IF(characters == NULL, ErrId__NULL_ADDRESS);
  vTHROW_IF(length < 0, ErrId__NEGATIVE_LENGTH);

  for (int16_t i = 0; i < length; i++)
  {
    char c = characters[i];
    MemBuffer_append_char(jxc, dst, c);
  }
}

void MemBuffer_append_char(Jxc* jxc, MemBuffer * const dst, char character)
{
  vTRY_BUBBLE_EXCEPTION();
  MemBuffer string_buf = { 0 };
  MemBuffer_point_to_buffer(jxc, &string_buf, &character, 1);
  vTRY_BUBBLE_EXCEPTION();
  string_buf.write_index = 1;
  MemBuffer_append(jxc, dst, &string_buf);
}





/**
 * Safe version of strncpy that forces null terminator. Very similar to strncpy_s which is available in C11.
 * See http://stackoverflow.com/questions/25746400/why-is-strncpy-marked-as-unsafe
 */
int16_t safe_strncpy_s(char* dst, const char* src, int16_t max_buffer_size) {
  int effective_length = -1;
  int16_t max_copy_length = max_buffer_size - 1;  //-1 to make room for NULL terminator in dst
  
  if (max_buffer_size == 0) {
    return safe_str_Error__NO_ROOM_FOR_TERM;
  }

  if (dst == NULL) {
    return safe_str_Error__DST_NULL;
  }

  int str_code = safe_strlen(src, max_copy_length);

  if (str_code >= 0) {
    //no error
    effective_length = MIN(str_code, max_copy_length);
  } else {
    //allow partial copy
    if (str_code == safe_str_Error__TRUNCATED) {
      effective_length = max_copy_length;
    }
  }

  if (effective_length >= 0) {
    memcpy(dst, src, effective_length);
  }

  dst[effective_length + 1] = '\0'; //add in the NULL term
  
  return str_code;
}


/**
 * Will return length of string or length_limit if truncated error also thrown.
 */
int16_t find_string_length(Jxc* jxc, const char * const string, int16_t length_limit) {
  SET_DEFAULT_RETURN(int16_t, 0);

  THROW_IF(string == NULL, ErrId__NULL_STR);
  THROW_IF(length_limit < 0, ErrId__NEGATIVE_LENGTH);

  int16_t index = 0;
  while (index <= length_limit && string[index] != 0)
  {
    index++;
  }

  if (index > length_limit) {
    MARK_EXCEPTION(ErrId__TRUNCATED);
  }

  return index;
}

/**
 * Safe version of strlen. Finds length of null terminated string, but allows specifying a max length.
 * Returns negative number if error see safe_str_Error.
 */
int16_t safe_strlen(const char * const string, int16_t length_limit) {
  if (string == NULL)   { return safe_str_Error__STRING_NULL;     }
  if (length_limit < 0) { return safe_str_Error__NEGATIVE_LENGTH; }

  int16_t index = 0;
  while (index <= length_limit && string[index] != 0)
  {
    index++;
  }

  if (index > length_limit) {
    return safe_str_Error__TRUNCATED;
  }
  return index;
}

my_memcpy_result_t my_memcpy_string(my_memcpy_t* mem, const char * string)
{
  int16_t length = safe_strlen(string, 2048);
  my_memcpy_result_t result;
  mem->source = string;
  mem->source_max_length = length;
  mem->desired_bytes_to_copy = length;
  result = my_memcpy(mem);
  return result;
}

//simply appends null terminating char
my_memcpy_result_t my_memcpy_end_string(my_memcpy_t* mem)
{
  my_memcpy_result_t result;
  mem->source = "\0";
  mem->source_max_length = 1;
  mem->desired_bytes_to_copy = 1;
  result = my_memcpy(mem);
  return result;
}




//TODO unit testing & optimization
my_memcpy_result_t my_memcpy(my_memcpy_t* mem)
{
  int16_t max_allowed_store = mem->destination_max_size - mem->destination_offset;
  int16_t max_allowed_read = MIN(mem->source_max_length, mem->desired_bytes_to_copy);
  mem->_actual_length = MIN(max_allowed_store, mem->desired_bytes_to_copy);

  //validation
  if (mem->destination_offset < 0) { return MY_MEMCPY_RESULT__ERROR_DST_OFFSET_INVALID; }
  if (mem->destination == NULL) { return MY_MEMCPY_RESULT__ERROR_DST_NULL; }
  if (mem->source == NULL) { return MY_MEMCPY_RESULT__ERROR_SRC_NULL; }
  if (max_allowed_store < 0) { return MY_MEMCPY_RESULT__ERROR_MAX_STORE_LENGTH_NEGATIVE; }
  if (max_allowed_read < 0) { return MY_MEMCPY_RESULT__ERROR_MAX_READ_LENGTH_NEGATIVE; }

  if (mem->source_max_length < mem->desired_bytes_to_copy) { return MY_MEMCPY_RESULT__ERROR_SRC_TOO_SMALL; }
  if (mem->_actual_length < mem->desired_bytes_to_copy) { return MY_MEMCPY_RESULT__ERROR_DST_CANNOT_FIT_SRC; }


  memcpy((uint8_t*)mem->destination + mem->destination_offset, mem->source, mem->_actual_length);
  mem->destination_offset += mem->_actual_length;

  return MY_MEMCPY_RESULT__OK;
}
