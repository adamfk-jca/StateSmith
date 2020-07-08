/************************************************************************************************
* @file
* 
* @brief     State machine "spec_OrderElse1"
*            Auto generated from file: ../examples/specifications/spec_OrderElse1.graphml
* 
* @copyright Copyright (c) 2017 JCA Electronics, Winnipeg, MB.
*            All rights reserved.
* 
************************************************************************************************/

#pragma once

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
* Enumeration for all spec_OrderElse1 state IDs
************************************************************************************************/
typedef enum _spec_OrderElse1_StateId
{
  spec_OrderElse1_StateId__ROOT                    = 0,
  spec_OrderElse1_StateId__ROOT__C                 = 1,
  spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT = 2,
  spec_OrderElse1_StateId__ROOT__C__C1             = 3,
  spec_OrderElse1_StateId__ROOT__C__C2             = 4,
  spec_OrderElse1_StateId__ROOT__C__C3             = 5,
  //--------------------------
  spec_OrderElse1_STATE_COUNT = 6,
} spec_OrderElse1_StateId;
static_assert(spec_OrderElse1_StateId__ROOT == 0, "'spec_OrderElse1_StateId__ROOT' must equal 0 for root state");


/************************************************************************************************
* Enumeration for all spec_OrderElse1 input event IDs
************************************************************************************************/
typedef enum _spec_OrderElse1_InputEvent
{
  spec_OrderElse1_InputEvent_EXIT             = HsmEventId__EXIT,
  spec_OrderElse1_InputEvent_ENTER            = HsmEventId__ENTER,
  spec_OrderElse1_InputEvent_LANDED_IN        = HsmEventId__LANDED_IN,
  spec_OrderElse1_InputEvent_DO               = HsmEventId__DO,
  spec_OrderElse1_InputEvent_TEST_TRANSITIONS = HsmEventId__TEST_TRANSITIONS,
  spec_OrderElse1_InputEvent_GO_EVENT         = HsmEventId_CUSTOM_STARTS_AT,
} spec_OrderElse1_InputEvent;
#define spec_OrderElse1_INPUT_EVENT_COUNT 1
static_assert( sizeof(spec_OrderElse1_InputEvent) == sizeof(HsmEventId), "HSM event ID type size must be increased to support more events. ");

extern const HsmState * const spec_OrderElse1_Root_ref;
extern const HsmState * const spec_OrderElse1_ROOT__C_ref;
extern const HsmState * const spec_OrderElse1_ROOT__C__C__PSEUDO_INIT_ref;
extern const HsmState * const spec_OrderElse1_ROOT__C__C1_ref;
extern const HsmState * const spec_OrderElse1_ROOT__C__C2_ref;
extern const HsmState * const spec_OrderElse1_ROOT__C__C3_ref;


/************************************************************************************************
* State variable structs for spec_OrderElse1
************************************************************************************************/
typedef struct _spec_OrderElse1_ROOT__C__C__PSEUDO_INIT_Vars
{
  HsmStateBaseVars base_vars; 
} spec_OrderElse1_ROOT__C__C__PSEUDO_INIT_Vars;


typedef struct _spec_OrderElse1_ROOT__C__C1_Vars
{
  HsmStateBaseVars base_vars; 
} spec_OrderElse1_ROOT__C__C1_Vars;


typedef struct _spec_OrderElse1_ROOT__C__C2_Vars
{
  HsmStateBaseVars base_vars; 
} spec_OrderElse1_ROOT__C__C2_Vars;


typedef struct _spec_OrderElse1_ROOT__C__C3_Vars
{
  HsmStateBaseVars base_vars; 
} spec_OrderElse1_ROOT__C__C3_Vars;


typedef struct _spec_OrderElse1_ROOT__C_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    spec_OrderElse1_ROOT__C__C__PSEUDO_INIT_Vars root__c__c__pseudo_init_vars;
    spec_OrderElse1_ROOT__C__C1_Vars             root__c__c1_vars;
    spec_OrderElse1_ROOT__C__C2_Vars             root__c__c2_vars;
    spec_OrderElse1_ROOT__C__C3_Vars             root__c__c3_vars;
  }; 
} spec_OrderElse1_ROOT__C_Vars;


typedef struct _spec_OrderElse1_Root_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    spec_OrderElse1_ROOT__C_Vars root__c_vars;
  }; 
} spec_OrderElse1_Root_Vars;






/************************************************************************************************
* STRUCT for spec_OrderElse1 variables 
************************************************************************************************/
typedef struct _spec_OrderElse1_Vars
{

  int var1;
  int var2;
  int out;

} spec_OrderElse1_Vars;



/************************************************************************************************
* STRUCT for spec_OrderElse1 
************************************************************************************************/
typedef struct _spec_OrderElse1
{
  Hsm2 hsm; //MUST be first element for polymorphism

  spec_OrderElse1_Vars vars;

  spec_OrderElse1_Root_Vars root_vars;
} spec_OrderElse1;


/************************************************************************************************
* public functions
************************************************************************************************/
bool spec_OrderElse1_class_init(Jxc* jxc);
void spec_OrderElse1_instance_init(Jxc* jxc, spec_OrderElse1* sm, const char * instance_name);
void spec_OrderElse1_step(Jxc* jxc, spec_OrderElse1* sm);
void spec_OrderElse1_test_transitions(Jxc* jxc, spec_OrderElse1* sm, uint8_t dispatch_count);
void spec_OrderElse1_dispatch_event(Jxc* jxc, spec_OrderElse1* sm, spec_OrderElse1_InputEvent event_id);
void spec_OrderElse1_dispatch_if(Jxc* jxc, spec_OrderElse1* sm, bool condition, HsmEventId event_id);
const char* spec_OrderElse1_InputEvent_to_string(HsmEventId event_id);
void spec_OrderElse1_clear_output_events(Jxc* jxc, spec_OrderElse1* sm);



//******************************************************************************
// COMPILER SPECIFIC SECTION 2
//******************************************************************************
#ifdef _MSC_VER
#  pragma warning( pop )  //re-enable warnings disabled for this file
#endif
