
#pragma once

#include <string.h> //for memset

/**
* Macro for getting the size of an array that is known at compile time. Code from Google's Chromium project.
* Taken from http://stackoverflow.com/questions/4415524/common-array-length-macro-for-c
*
* Helps guard against taking the size of a pointer to an array and some other C++ stuff;
*/
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#define COUNTOF(x) COUNT_OF(x)
#define COUNTOF_i(x) ((int)COUNT_OF(x))

#define MIN(a,b) ((a)<(b)?(a):(b))
#define MAX(a,b) ((a)>(b)?(a):(b))

#define ENSURE_NOT_LOWER_THAN(var, min)  if((var)<(min)){ var = min;}
#define ENSURE_NOT_HIGHER_THAN(var, max) if((var)>(max)){ var = max;}
#define ENSURE_BETWEEN(min, var, max) ENSURE_NOT_LOWER_THAN(var, min); ENSURE_NOT_HIGHER_THAN(var, max)

#define IS_WITHIN_INC(number, lower_limit, upper_limit) ( (number >= lower_limit) && (number <= upper_limit) )
#define IS_OUTSIDE(number, lower_limit, upper_limit) ( (number < lower_limit) || (number > upper_limit) )

