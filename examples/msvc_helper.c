#include "msvc_helper.h"


#include <stdio.h>
#include <stdarg.h>
#include <stddef.h>

#ifdef _MSC_VER
#include <windows.h>


//prints output in 2 places for Visual Studio
void mprintf(const char *format, ...)
{
  va_list args;
  static char temp_buffer[2048];

  va_start(args, format);
  mvsprintf(format, args);
  va_end(args);
}

void mvsprintf(const char *format, va_list args)
{
  static char temp_buffer[2048];
  vsnprintf(temp_buffer, 255 - 2, format, args);
  printf(temp_buffer);
  OutputDebugString(temp_buffer);
}

#endif
