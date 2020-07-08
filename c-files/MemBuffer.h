#pragma once
#include <stdarg.h>
#include <stdint.h>
#include <stdbool.h>
#include "ExecContext.h"
#include "common_macros.h"

//#define _SHOW_PADDING_WARNINGS  //MSVC with all warnings enabled will alert to padding of structures. Note: it uses 4 bytes for enums as default whereas IAR is smarter and will use 1 byte if able.
#ifndef _SHOW_PADDING_WARNINGS
#  ifdef _MSC_VER
#    pragma warning(disable: 4820)
#  endif
#endif


typedef enum _MemBuffer_Result
{
  MemBuffer_Result__OK,
  MemBuffer_Result__NULL_PARAM,
  MemBuffer_Result__DST_BUFFER_NULL,
  MemBuffer_Result__SRC_BUFFER_NULL,
  MemBuffer_Result__DST_MAX_LENGTH_NEGATIVE,
  MemBuffer_Result__SRC_MAX_LENGTH_NEGATIVE,
  MemBuffer_Result__DST_INDEX_NEGATIVE,
  MemBuffer_Result__SRC_INDEX_NEGATIVE,
  MemBuffer_Result__DST_NOT_BIG_ENOUGH,
  MemBuffer_Result__STRING_BEYOND_REASONABLE,
} MemBuffer_Result;

typedef struct _CharBuf
{
  char* array;
  int16_t size;
} CharBuf;

//auto allocate a char buffer of specified size

#define CharBuf_AAfs(buffer_size) {.array= &COMPOUND_LIT_ARRAY(char,buffer_size)[0], .size=buffer_size} //meant for file scope
#define CharBuf_AA(buffer_size) (CharBuf)CharBuf_AAfs(buffer_size) //Uses compound literals to automatically allocate an array of specified size and set pointer to it
#define CharBuf_AAp(buffer_size) &(CharBuf_AA(buffer_size))

/*
Big change to MemBuffer section implementation. The previous implementation was kind of silly and caused problems with anything that wrote characters one at a time like from an array (they would all be placed one after another at the section starting index). What we really need is to use the write index and a new section end index to constrain writes.
*/

/**
 * Should try to avoid putting null terminating characters in self buffer. No point as it keeps
 * track of its length already.
 */
typedef struct _MemBuffer {
  char * address;
  int16_t write_index;            //!< self is the index to write to next.
  int16_t write_limit_ex;         //!< can write up to not including self index.
  int16_t real_buffer_length;
  bool read_only;
  bool no_write_partial_on_too_small;  //!< not respected by printf function. it always prints as much as it can.

} MemBuffer;

#define MemBuffer_AALLOC(size) { .address = &(uint8_t[size]){0}, .size = size }

//#define MemBuffer_POINT_TO(memBuf, object) { .address = &object, .size = size }

/**
 * you can also simply do: "MemBuffer mb1 = { 0 };" for the time being.
 */
void MemBuffer_initialize(Jxc* jxc, MemBuffer*mb);

void MemBuffer_point_to_buffer(Jxc* jxc, MemBuffer* mb, void * buffer_address, int32_t buffer_max_length);
void MemBuffer_append_raw(Jxc* jxc, MemBuffer * const dst, MemBuffer const * const src);
void MemBuffer_append_string(Jxc* jxc, MemBuffer * const dst, char const * const string, int max_allowed_string_length);
int16_t MemBuffer_get_size(MemBuffer const * const self);
int16_t MemBuffer_get_space_left(MemBuffer const * const self);
void MemBuffer_to_string(Jxc* jxc, MemBuffer * self, char * destination, int real_buffer_length);
const char* MemBuffer_terminate_and_get_string(Jxc* jxc, MemBuffer * const dst, const char* default_string);
void MemBuffer_terminate_string(Jxc* jxc, MemBuffer * const dst);
void MemBuffer_append_char_array(Jxc* jxc, MemBuffer * const dst, char* characters, int16_t length);
void MemBuffer_append_char(Jxc* jxc, MemBuffer * const dst, char character);
void MemBuffer_append(Jxc* jxc, MemBuffer * const dst, MemBuffer const * const src);
void MemBuffer_from_const_string(Jxc* jxc, MemBuffer* mb, const char * string, int32_t max_allowed_string_length);

void MemBuffer_reset_write_index(MemBuffer* mb);
void MemBuffer_set_write_index(Jxc* jxc, MemBuffer* mb, int16_t write_index);

void MemBuffer_append_fill_with_char(Jxc* jxc, MemBuffer* mb, char c);
bool MemBuffer_is_full(MemBuffer* mb);
void MemBuffer_clear(Jxc* jxc, MemBuffer* mb);
void MemBuffer_clear_with(Jxc* jxc, MemBuffer* mb, char clear_char);
void MemBuffer_append_printf(Jxc* jxc, MemBuffer* mb, CharBuf* temp_buf, const char* format, ...);
void MemBuffer_append_printf_with_null(Jxc* jxc, MemBuffer* mb, const char* format, ...);

void CharBuf_copy_str_no_term(Jxc* jxc, CharBuf* cb, const char* to_copy);
void CharBuf_printf(Jxc* jxc, CharBuf* cb, const char* format, ...);
void CharBuf_vprintf(Jxc* jxc, CharBuf* cb, const char* format, va_list args);
int16_t MemBuffer_get_effective_limit(MemBuffer const * const self);
void MemBuffer_set_section_start_and_length(Jxc* jxc, MemBuffer* mb, int16_t start_index, int16_t length);
void MemBuffer_remove_section_limit(Jxc* jxc, MemBuffer* mb);


//uint8_t MemBuffer_append_format(char* const format, ...)
//{
//  va_list args;
//}




typedef struct {
  void * destination;
  const void * source;
  int16_t destination_offset;
  int16_t destination_max_size;
  int16_t source_max_length;
  int16_t desired_bytes_to_copy;
  int16_t _actual_length;
} my_memcpy_t;


typedef enum {
  MY_MEMCPY_RESULT__OK,
  MY_MEMCPY_RESULT__ERROR_MAX_STORE_LENGTH_NEGATIVE,
  MY_MEMCPY_RESULT__ERROR_MAX_READ_LENGTH_NEGATIVE,
  MY_MEMCPY_RESULT__ERROR_DST_CANNOT_FIT_SRC,
  MY_MEMCPY_RESULT__ERROR_SRC_TOO_SMALL,
  MY_MEMCPY_RESULT__ERROR_DST_NULL,
  MY_MEMCPY_RESULT__ERROR_SRC_NULL,
  MY_MEMCPY_RESULT__ERROR_DST_OFFSET_INVALID,
} my_memcpy_result_t;



my_memcpy_result_t my_memcpy_end_string(my_memcpy_t* mem);
my_memcpy_result_t my_memcpy_string(my_memcpy_t* mem, const char * string);
my_memcpy_result_t my_memcpy(my_memcpy_t* mem);

typedef enum _safe_str_Error
{
  safe_str_Error__TRUNCATED = -1,
  safe_str_Error__STRING_NULL = -2,
  safe_str_Error__NEGATIVE_LENGTH = -3,
  safe_str_Error__DST_NULL = -4,
  safe_str_Error__NO_ROOM_FOR_TERM = -5,
} safe_str_Error;

int16_t safe_strlen(const char * const string, int16_t length_limit);
int16_t safe_strncpy_s(char* dst, const char* src, int16_t max_buffer_size);

int16_t find_string_length(Jxc* jxc, const char * const string, int16_t length_limit);

#define STRNCPYS_INTO_ARRAY(dst, src)   safe_strncpy_s(dst, src, COUNTOF(dst)); static_assert(COUNTOF(dst) != sizeof(NULL), "Make sure destination is an array and not a pointer")


