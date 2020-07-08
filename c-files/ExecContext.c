#include "ExecContext.h"

void Jxc_clear_error(Jxc* jxc)
{
  jxc->priv.exception = ErrId__NO_ERROR;
  jxc->priv.caused_by = ErrId__NO_ERROR;
}

bool Jxc_has_error(Jxc* jxc)
{
  return jxc->priv.exception != ErrId__NO_ERROR;
}

void Jxc_set_error(Jxc* jxc, ErrId exception)
{
  jxc->priv.exception = exception;
}

ErrId Jxc_get_error(Jxc* jxc)
{
  return jxc->priv.exception;
}

ErrId Jxc_get_caused_by(Jxc* jxc)
{
  return jxc->priv.caused_by;
}

bool Jxc_error_is(Jxc* jxc, ErrId some_error) 
{
  return jxc->priv.exception == some_error;
}

void Jxc_push_error_keep_origin(Jxc* jxc, ErrId some_error)
{
  if(jxc->priv.caused_by == ErrId__NO_ERROR)
  {
    jxc->priv.caused_by = jxc->priv.exception;
  }
  Jxc_set_error(jxc, some_error);
}

void Jxc_push_error_may_lose_origin(Jxc* jxc, ErrId some_error)
{
  jxc->priv.caused_by = jxc->priv.exception;
  Jxc_set_error(jxc, some_error);
}

/**
 * Useful to keep track of earlier error that would be lost during clean up that also threw an error.
 */
void Jxc_set_other_error(Jxc* jxc, ErrId some_error) {
  jxc->priv.other_error = some_error;
}

