#pragma once
#include <stdint.h>
#include <stdbool.h>
#include "ErrId.h"


typedef struct Jxc
{
  struct //private variables
  {
    ErrId exception;

    ErrId caused_by;
    /**
    * the location ID to help explain where error was first encountered
    */
    uint16_t originating_location_id;
    //uint64_t value_errored_on;  //can explain or maybe actually do a malloc to get object of x size?
    //exception_context - the values that were compared and failed
    //ErrId* traces;
    //uint8_t traces_array_size;
    //uint8_t call_depth; //can keep track of depth even if we fill traces array

    ErrId other_error;


  } priv;
} Jxc;

#define JXC_VAR jxc
#define JXC_DEFAULT_RETURN jxc_default_return


void Jxc_clear_error(Jxc* jxc);
bool Jxc_has_error(Jxc* jxc);
void Jxc_set_error(Jxc* jxc, ErrId exception);
ErrId Jxc_get_error(Jxc* jxc);
ErrId Jxc_get_caused_by(Jxc* jxc);
bool Jxc_error_is(Jxc* jxc, ErrId some_error);
void Jxc_push_error_keep_origin(Jxc* jxc, ErrId some_error);
void Jxc_push_error_may_lose_origin(Jxc* jxc, ErrId some_error);
const char* Jxc_get_current_error_string(Jxc* jxc);
void Jxc_set_other_error(Jxc* jxc, ErrId some_error);


#define POP_IF_ERROR_INTO(temp_jxc) temp_jxc = (*JXC_VAR); CLEAR_ERROR();
#define IF_ERROR_POP_INTO(temp_jxc) temp_jxc = (*JXC_VAR); CLEAR_ERROR();

#define POP_ERROR_CODE_INTO(store_in) store_in = GET_ERROR(); CLEAR_ERROR();
#define COPY_ERROR_CODE_INTO(store_in) store_in = GET_ERROR();

#define CLEAR_ERROR() Jxc_clear_error(JXC_VAR)

#define GET_ERROR() Jxc_get_error(JXC_VAR)
#define GET_CAUSED_BY() Jxc_get_caused_by(JXC_VAR)

#define IGNORE_EXCEPTION(exception_code) if(JXC_VAR->priv.exception == (exception_code)){ Jxc_clear_error(JXC_VAR); }

#define SET_DEFAULT_RETURN(type, value) type JXC_DEFAULT_RETURN = value;

#define SET_DEFAULT_RETURN_TO_NULL() void* JXC_DEFAULT_RETURN = NULL;

#define JUMP_TO_IF_ERROR(label) if(JXC_VAR->priv.exception != 0){ goto label;}

#define JUMP_TO_IF_ERROR_IS(label, error_code) if(JXC_VAR->priv.exception == error_code){ goto label;}

#define TRY_BUBBLE_EXCEPTION()  if(JXC_VAR->priv.exception != 0){return JXC_DEFAULT_RETURN;}
#define vTRY_BUBBLE_EXCEPTION() if(JXC_VAR->priv.exception != 0){return;}

#define TRY_BUBBLE_EXCEPTION_EXCEPT(allowed_exception_code)  if(JXC_VAR->priv.exception != ErrId__NO_ERROR && JXC_VAR->priv.exception != allowed_exception_code ){return JXC_DEFAULT_RETURN;}
#define vTRY_BUBBLE_EXCEPTION_EXCEPT(allowed_exception_code) if(JXC_VAR->priv.exception != ErrId__NO_ERROR && JXC_VAR->priv.exception != allowed_exception_code ){return;}


//#define MARK_EXCEPTION(exception_code)       JXC_VAR->priv.exception = exception_code
#define MARK_EXCEPTION(exception_code)       Jxc_set_error(JXC_VAR, exception_code)

#define THROW_EXCEPTION(exception_code)      Jxc_push_error_keep_origin(JXC_VAR, exception_code); return JXC_DEFAULT_RETURN
/** Use this macro to throw an exception from a function with void return. "V" stands for VOID. */
#define vTHROW_EXCEPTION(exception_code)     Jxc_push_error_keep_origin(JXC_VAR, exception_code); return

#define RETHROW_AS(exception_code)       Jxc_push_error_keep_origin(JXC_VAR, exception_code); return JXC_DEFAULT_RETURN
/** Use this macro to throw an exception from a function with void return. "V" stands for VOID. */
#define vRETHROW_AS(exception_code)      Jxc_push_error_keep_origin(JXC_VAR, exception_code); return

#define TRY_RETHROW_AS(exception_code)  if(JXC_VAR->priv.exception != 0){RETHROW_AS(exception_code); }
/** Use this macro to re-throw an exception from a function with void return. "V" stands for VOID.  */
#define vTRY_RETHROW_AS(exception_code)  if(JXC_VAR->priv.exception != 0){ vRETHROW_AS(exception_code); }

#define ASSERT_TRUE_OR_MARK_ERROR(condition, exception_code) if(!(condition)){ MARK_EXCEPTION(exception_code); }

#define ASSERT_TRUE_OR_THROW(condition, to_throw) if(!(condition)){ THROW_EXCEPTION(to_throw); }
/** Use this macro to assert true and throw an exception from a function with void return. "V" stands for VOID.  */
#define vASSERT_TRUE_OR_THROW(condition, to_throw) if(!(condition)){ vTHROW_EXCEPTION(to_throw); }

#define ASSERT_FALSE_OR_THROW(condition, to_throw) if((condition)){ THROW_EXCEPTION(to_throw); }
/** Use this macro to assert false and throw an exception from a function with void return. "V" stands for VOID.  */
#define vASSERT_FALSE_OR_THROW(condition, to_throw) if((condition)){ vTHROW_EXCEPTION(to_throw); }

#define IF_TRUE_THROW(condition, to_throw)  ASSERT_FALSE_OR_THROW(condition, to_throw)
//throws if, returns no value
#define vIF_TRUE_THROW(condition, to_throw) vASSERT_FALSE_OR_THROW(condition, to_throw)

#define THROW_IF(condition, to_throw)  ASSERT_FALSE_OR_THROW(condition, to_throw)
//throws if, returns no value
#define vTHROW_IF(condition, to_throw)  vASSERT_FALSE_OR_THROW(condition, to_throw)

#define ERROR_IS(error_code) Jxc_error_is(JXC_VAR, error_code)

#define ERROR_IS_SET() Jxc_has_error(JXC_VAR)

#define ERROR_IS_NOT_SET() (Jxc_has_error(JXC_VAR) == false)

/**
 * Auto Allocate Jxc object and get pointer to it. 
 * TODOLOW: Not a fan of this style. Tried it - no likey. Want to refactor.
 */
#define Jxc_AALOC() &(Jxc){ErrId__NO_ERROR}

#define Jxc_NO_ERROR_STRUCT() (Jxc){ErrId__NO_ERROR}


