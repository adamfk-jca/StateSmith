#pragma once
#include <stdarg.h>

//prints output in docked and floating output window for Visual Studio
void mprintf(const char *format, ...);
void mvsprintf(const char *format, va_list args);
