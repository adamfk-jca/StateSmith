/************************************************************************************************
* @file
* 
* @brief     State machine "ExampleSm"
*            Auto generated from file: ../examples/1/ExampleSm.graphml
* 
* @copyright Copyright (c) 2017 JCA Electronics, Winnipeg, MB.
*            All rights reserved.
* 
************************************************************************************************/

#pragma once
//anything you want at top of .h file like additional includes
#include <stdint.h>
#include <stdbool.h>
#include "hsm2.h"

//******************************************************************************
// COMPILER SPECIFIC SECTION
//******************************************************************************

//disable specific Visual Studio warnings for this file
#ifdef _MSC_VER
#  pragma warning( push )
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#  pragma warning(disable: 4201)  //Warning	C4201	nonstandard extension used: nameless struct/union	
#endif


//#define _SHOW_PADDING_WARNINGS  //MSVC with all warnings enabled will alert to padding of structures. Note: it uses 4 bytes for enums as default whereas IAR is smarter and will use 1 byte if able.
#ifndef _SHOW_PADDING_WARNINGS
#  ifdef _MSC_VER
#    pragma warning(disable: 4820)
#  endif
#endif



/************************************************************************************************
* Enumeration for all ExampleSm state IDs
************************************************************************************************/
typedef enum _ButSm_StateId
{
  ButSm_StateId__ROOT                                              = 0,
  ButSm_StateId__ROOT__op__REPEAT                                  = 1,
  ButSm_StateId__ROOT__op__REPEAT__NOT_HELD                        = 2,
  ButSm_StateId__ROOT__op__REPEAT__BEING_HELD                      = 3,
  ButSm_StateId__ROOT__op__BASIC                                   = 4,
  ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED                      = 5,
  ButSm_StateId__ROOT__op__BASIC__PRESSED                          = 6,
  ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS           = 7,
  ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD                    = 8,
  ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT = 9,
  ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG         = 10,
  //--------------------------
  ButSm_STATE_COUNT = 11,
} ButSm_StateId;
static_assert(ButSm_StateId__ROOT == 0, "'ButSm_StateId__ROOT' must equal 0 for root state");


/************************************************************************************************
* Enumeration for all ExampleSm input event IDs
************************************************************************************************/
typedef enum _ButSm_InputEvent
{
  ButSm_InputEvent_EXIT             = HsmEventId__EXIT,
  ButSm_InputEvent_ENTER            = HsmEventId__ENTER,
  ButSm_InputEvent_LANDED_IN        = HsmEventId__LANDED_IN,
  ButSm_InputEvent_DO               = HsmEventId__DO,
  ButSm_InputEvent_TEST_TRANSITIONS = HsmEventId__TEST_TRANSITIONS,
} ButSm_InputEvent;
#define ButSm_INPUT_EVENT_COUNT 0
static_assert( sizeof(ButSm_InputEvent) == sizeof(HsmEventId), "HSM event ID type size must be increased to support more events. ");

extern const HsmState * const ButSm_Root_ref;
extern const HsmState * const ButSm_ROOT__op__REPEAT_ref;
extern const HsmState * const ButSm_ROOT__op__REPEAT__NOT_HELD_ref;
extern const HsmState * const ButSm_ROOT__op__REPEAT__BEING_HELD_ref;
extern const HsmState * const ButSm_ROOT__op__BASIC_ref;
extern const HsmState * const ButSm_ROOT__op__BASIC__NOT_PRESSED_ref;
extern const HsmState * const ButSm_ROOT__op__BASIC__PRESSED_ref;
extern const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__INITIAL_PRESS_ref;
extern const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__HELD_ref;
extern const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_ref;
extern const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_ref;


/************************************************************************************************
* State variable structs for ExampleSm
************************************************************************************************/
typedef struct _ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_Vars
{
  HsmStateBaseVars base_vars; 
} ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_Vars;


typedef struct _ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_Vars
{
  HsmStateBaseVars base_vars; 
} ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_Vars;


typedef struct _ButSm_ROOT__op__BASIC__PRESSED__INITIAL_PRESS_Vars
{
  HsmStateBaseVars base_vars; 
} ButSm_ROOT__op__BASIC__PRESSED__INITIAL_PRESS_Vars;


typedef struct _ButSm_ROOT__op__BASIC__PRESSED__HELD_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_Vars root__op__basic__pressed__held__held__pseudo_init_vars;
    ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_Vars         root__op__basic__pressed__held__held_long_vars;
  }; 
} ButSm_ROOT__op__BASIC__PRESSED__HELD_Vars;


typedef struct _ButSm_ROOT__op__REPEAT__NOT_HELD_Vars
{
  HsmStateBaseVars base_vars; 
} ButSm_ROOT__op__REPEAT__NOT_HELD_Vars;


typedef struct _ButSm_ROOT__op__REPEAT__BEING_HELD_Vars
{
  HsmStateBaseVars base_vars; 
} ButSm_ROOT__op__REPEAT__BEING_HELD_Vars;


typedef struct _ButSm_ROOT__op__BASIC__NOT_PRESSED_Vars
{
  HsmStateBaseVars base_vars; 
} ButSm_ROOT__op__BASIC__NOT_PRESSED_Vars;


typedef struct _ButSm_ROOT__op__BASIC__PRESSED_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    ButSm_ROOT__op__BASIC__PRESSED__INITIAL_PRESS_Vars root__op__basic__pressed__initial_press_vars;
    ButSm_ROOT__op__BASIC__PRESSED__HELD_Vars          root__op__basic__pressed__held_vars;
  }; 
} ButSm_ROOT__op__BASIC__PRESSED_Vars;


typedef struct _ButSm_ROOT__op__REPEAT_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    ButSm_ROOT__op__REPEAT__NOT_HELD_Vars   root__op__repeat__not_held_vars;
    ButSm_ROOT__op__REPEAT__BEING_HELD_Vars root__op__repeat__being_held_vars;
  }; 
} ButSm_ROOT__op__REPEAT_Vars;


typedef struct _ButSm_ROOT__op__BASIC_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    ButSm_ROOT__op__BASIC__NOT_PRESSED_Vars root__op__basic__not_pressed_vars;
    ButSm_ROOT__op__BASIC__PRESSED_Vars     root__op__basic__pressed_vars;
  }; 
} ButSm_ROOT__op__BASIC_Vars;


typedef struct _ButSm_Root_Vars
{
  HsmStateBaseVars base_vars; 
  HsmContext orthoKidContexts[2];
  struct 
  { //context variables for kids  
    ButSm_ROOT__op__BASIC_Vars  root__op__basic_vars;
    ButSm_ROOT__op__REPEAT_Vars root__op__repeat_vars;
  };
        
} ButSm_Root_Vars;






/************************************************************************************************
* Struct for input_values
************************************************************************************************/
typedef struct _ButSm_InputValues
{
  bool input;
  uint16_t repeat_delay_ms;
} ButSm_InputValues;



/************************************************************************************************
* Struct for output_values
************************************************************************************************/
typedef struct _ButSm_OutputValues
{
  bool is_not_pressed : 1;
  bool is_pressed     : 1;
  bool is_held        : 1;
  bool is_held_long   : 1;
  uint32_t time_held;
} ButSm_OutputValues;



/************************************************************************************************
* Struct for output_events
************************************************************************************************/
typedef struct _ButSm_OutputEvents
{
  bool RELEASED    : 1;
  bool PRESSED     : 1;
  bool HELD        : 1;
  bool HELD_LONG   : 1;
  bool PRETAP      : 1;
  bool HELD_REPEAT : 1;
} ButSm_OutputEvents;



/************************************************************************************************
* STRUCT for ExampleSm variables 
************************************************************************************************/
typedef struct _ButSm_Vars
{

  uint32_t debounced_at_ms;

} ButSm_Vars;



/************************************************************************************************
* STRUCT for ExampleSm 
************************************************************************************************/
typedef struct _ButSm
{
  Hsm2 hsm; //MUST be first element for polymorphism

  ButSm_InputValues input_values;

  ButSm_OutputValues output_values;

  ButSm_OutputEvents output_events;

  ButSm_Vars vars;

  ButSm_Root_Vars root_vars;
} ButSm;


/************************************************************************************************
* public functions
************************************************************************************************/
bool ButSm_class_init(Jxc* jxc);
void ButSm_instance_init(Jxc* jxc, ButSm* sm, const char * instance_name);
void ButSm_step(Jxc* jxc, ButSm* sm);
void ButSm_test_transitions(Jxc* jxc, ButSm* sm, uint8_t dispatch_count);
void ButSm_dispatch_event(Jxc* jxc, ButSm* sm, ButSm_InputEvent event_id);
void ButSm_dispatch_if(Jxc* jxc, ButSm* sm, bool condition, HsmEventId event_id);
const char* ButSm_InputEvent_to_string(HsmEventId event_id);
void ButSm_clear_output_events(Jxc* jxc, ButSm* sm);
void ButSm_print_input_values(ButSm* sm);
void ButSm_print_output_values(ButSm* sm);
void ButSm_print_output_events(ButSm* sm);



//******************************************************************************
// COMPILER SPECIFIC SECTION 2
//******************************************************************************
#ifdef _MSC_VER
#  pragma warning( pop )  //re-enable warnings disabled for this file
#endif
