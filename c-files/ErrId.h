#pragma once
#include <stdint.h>
#include <stdbool.h>

typedef enum _ErrId
{
  ErrId__NO_ERROR = 0,
 
  ErrId__INVALID_INDEX,
  ErrId__INVALID_INDEX2,
  ErrId__INVALID_STATE,
  ErrId__TOO_MANY_PARAMS,
  ErrId__PROG_OOPS, //!< generic programmer mistake
  ErrId__NULL_OBJ,
  ErrId__NULL_STATE,
  ErrId__NULL_ADDRESS,
  ErrId__EXCEEDED_LIMIT,
  ErrId__OBJECT_NOT_SETUP,
  ErrId__NEGATIVE_LENGTH,
  ErrId__ILLEGAL_ARGUMENT,
  ErrId__UNSAFE_REQUEST,
  ErrId__PRINTF_ERR,
  ErrId__CANT_TERM,
  ErrId__TRUNCATED,
  ErrId__SECTION_TRUNCATED,
  ErrId__UNEXPECTED_CHAR,
  ErrId__UNEXPECTED_NULL,
  ErrId__NULL_STR,

  //-----------------------------
  ErrId_PARSE_FAILURE_START = 2000,
  ErrId__MISSING_TOKEN_START,
  ErrId__MISSING_TOKEN,
  ErrId__REACHED_END,
  ErrId__UNSUPPORTED_ESCAPE,
  ErrId__MISSING_TOKEN_END,
  ErrId__PARSE_FAIL,
  ErrId_PARSE_FAILURE_END,
  //-----------------------------

  ErrId_VALUE_LIMITS_START = 3000,
  ErrId__VALUE_EXCEEDS_MAX,
  ErrId__VALUE_BELOW_MIN,

  ErrId__BEYOND_long,
  ErrId__BEYOND_i32,
  ErrId__BEYOND_i16,
  ErrId__BEYOND_i8,
  ErrId__BEYOND_u32,
  ErrId__BEYOND_u16,
  ErrId__BEYOND_u8,
  ErrId__FLOAT_NAN,
  ErrId_VALUE_LIMITS_END,

  ErrId__READ_ONLY_ACCESS,
  ErrId__WRONG_TYPE,
  ErrId__WRONG_TYPE_INT_REQUIRED,
  ErrId__WRONG_TYPE_STRING_REQUIRED,
  ErrId__UNSUPPORTED_PARAMETER,
  ErrId__NOT_IMPLEMENTED,
  ErrId__NOT_APPLICABLE,
  ErrId__DEPRECATED,

  ErrId__MEMBUF_NULL_PARAM,
  ErrId__MEMBUF_DST_BUFFER_NULL,
  ErrId__MEMBUF_SRC_BUFFER_NULL,
  ErrId__MEMBUF_DST_MAX_LENGTH_NEGATIVE,
  ErrId__MEMBUF_SRC_MAX_LENGTH_NEGATIVE,
  ErrId__MEMBUF_DST_INDEX_NEGATIVE,
  ErrId__MEMBUF_SRC_INDEX_NEGATIVE,
  ErrId__MEMBUF_DST_NOT_BIG_ENOUGH,
  ErrId__MEMBUF_FULL,
  ErrId__MEMBUF_STRING_BEYOND_REASONABLE,

  //Htree
  //-----------------------------------
  ErrId__HSM_NULL_PARENT,
  ErrId__HSM_UNKNOWN_STATE_ID,
  ErrId__HSM_NO_PATH_FOUND,
  ErrId__HSM_UNEXPECTED,
  ErrId__HSM_ORTHO_SIBLING_TX,  //!< when one orthogonal region tries to transition into one of its sibling ortogonal regions
  //-----------------------------------

  ErrId_AFTER_LAST_VALUE,
} ErrId;


