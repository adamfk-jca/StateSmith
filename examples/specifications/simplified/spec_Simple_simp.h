/************************************************************************************************
* @file
* 
* @brief     State machine "spec_Simple_simp"
*            Auto generated from file: ../examples/specifications/spec_Simple.graphml
* 
* @copyright Copyright (c) 2017 JCA Electronics, Winnipeg, MB.
*            All rights reserved.
* 
************************************************************************************************/

#pragma once
void spec_Simple_simp_xS1(void);
  void spec_Simple_simp_xS11(void);
  void spec_Simple_simp_tToS1(void);
  void spec_Simple_simp_tToS11(void);
  void spec_Simple_simp_t1(void);
  void spec_Simple_simp_eT1(void);
  void spec_Simple_simp_eT11(void);
  void spec_Simple_simp_eT111(void);
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
* Enumeration for all spec_Simple_simp state IDs
************************************************************************************************/
typedef enum _spec_Simple_simp_StateId
{
  spec_Simple_simp_StateId__ROOT                   = 0,
  spec_Simple_simp_StateId__ROOT__S                = 1,
  spec_Simple_simp_StateId__ROOT__S__S1            = 2,
  spec_Simple_simp_StateId__ROOT__S__S1__S11       = 3,
  spec_Simple_simp_StateId__ROOT__S__T1            = 4,
  spec_Simple_simp_StateId__ROOT__S__T1__T11       = 5,
  spec_Simple_simp_StateId__ROOT__S__T1__T11__T111 = 6,
  //--------------------------
  spec_Simple_simp_STATE_COUNT = 7,
} spec_Simple_simp_StateId;
static_assert(spec_Simple_simp_StateId__ROOT == 0, "'spec_Simple_simp_StateId__ROOT' must equal 0 for root state");


/************************************************************************************************
* Enumeration for all spec_Simple_simp input event IDs
************************************************************************************************/
typedef enum _spec_Simple_simp_InputEvent
{
  spec_Simple_simp_InputEvent_EXIT             = HsmEventId__EXIT,
  spec_Simple_simp_InputEvent_ENTER            = HsmEventId__ENTER,
  spec_Simple_simp_InputEvent_LANDED_IN        = HsmEventId__LANDED_IN,
  spec_Simple_simp_InputEvent_DO               = HsmEventId__DO,
  spec_Simple_simp_InputEvent_TEST_TRANSITIONS = HsmEventId__TEST_TRANSITIONS,
  spec_Simple_simp_InputEvent_GO_EVENT         = HsmEventId_CUSTOM_STARTS_AT,
} spec_Simple_simp_InputEvent;
#define spec_Simple_simp_INPUT_EVENT_COUNT 1
static_assert( sizeof(spec_Simple_simp_InputEvent) == sizeof(HsmEventId), "HSM event ID type size must be increased to support more events. ");

extern const HsmState * const spec_Simple_simp_Root_ref;
extern const HsmState * const spec_Simple_simp_ROOT__S_ref;
extern const HsmState * const spec_Simple_simp_ROOT__S__S1_ref;
extern const HsmState * const spec_Simple_simp_ROOT__S__S1__S11_ref;
extern const HsmState * const spec_Simple_simp_ROOT__S__T1_ref;
extern const HsmState * const spec_Simple_simp_ROOT__S__T1__T11_ref;
extern const HsmState * const spec_Simple_simp_ROOT__S__T1__T11__T111_ref;


/************************************************************************************************
* State variable structs for spec_Simple_simp
************************************************************************************************/
typedef struct _spec_Simple_simp_ROOT__S__T1__T11__T111_Vars
{
  HsmStateBaseVars base_vars; 
} spec_Simple_simp_ROOT__S__T1__T11__T111_Vars;


typedef struct _spec_Simple_simp_ROOT__S__S1__S11_Vars
{
  HsmStateBaseVars base_vars; 
} spec_Simple_simp_ROOT__S__S1__S11_Vars;


typedef struct _spec_Simple_simp_ROOT__S__T1__T11_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    spec_Simple_simp_ROOT__S__T1__T11__T111_Vars root__s__t1__t11__t111_vars;
  }; 
} spec_Simple_simp_ROOT__S__T1__T11_Vars;


typedef struct _spec_Simple_simp_ROOT__S__S1_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    spec_Simple_simp_ROOT__S__S1__S11_Vars root__s__s1__s11_vars;
  }; 
} spec_Simple_simp_ROOT__S__S1_Vars;


typedef struct _spec_Simple_simp_ROOT__S__T1_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    spec_Simple_simp_ROOT__S__T1__T11_Vars root__s__t1__t11_vars;
  }; 
} spec_Simple_simp_ROOT__S__T1_Vars;


typedef struct _spec_Simple_simp_ROOT__S_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    spec_Simple_simp_ROOT__S__S1_Vars root__s__s1_vars;
    spec_Simple_simp_ROOT__S__T1_Vars root__s__t1_vars;
  }; 
} spec_Simple_simp_ROOT__S_Vars;


typedef struct _spec_Simple_simp_Root_Vars
{
  HsmStateBaseVars base_vars; 
  union 
  { //context variables for kids  
    spec_Simple_simp_ROOT__S_Vars root__s_vars;
  }; 
} spec_Simple_simp_Root_Vars;






/************************************************************************************************
* STRUCT for spec_Simple_simp variables 
************************************************************************************************/
typedef struct _spec_Simple_simp_Vars
{

  bool dummy_var; //this is to avoid empty struct compile failure. TODO STATE-81

} spec_Simple_simp_Vars;



/************************************************************************************************
* STRUCT for spec_Simple_simp 
************************************************************************************************/
typedef struct _spec_Simple_simp
{
  Hsm2 hsm; //MUST be first element for polymorphism

  spec_Simple_simp_Vars vars;

  spec_Simple_simp_Root_Vars root_vars;
} spec_Simple_simp;


/************************************************************************************************
* public functions
************************************************************************************************/
bool spec_Simple_simp_class_init(Jxc* jxc);
void spec_Simple_simp_instance_init(Jxc* jxc, spec_Simple_simp* sm, const char * instance_name);
void spec_Simple_simp_step(Jxc* jxc, spec_Simple_simp* sm);
void spec_Simple_simp_test_transitions(Jxc* jxc, spec_Simple_simp* sm, uint8_t dispatch_count);
void spec_Simple_simp_dispatch_event(Jxc* jxc, spec_Simple_simp* sm, spec_Simple_simp_InputEvent event_id);
void spec_Simple_simp_dispatch_if(Jxc* jxc, spec_Simple_simp* sm, bool condition, HsmEventId event_id);
const char* spec_Simple_simp_InputEvent_to_string(HsmEventId event_id);
void spec_Simple_simp_clear_output_events(Jxc* jxc, spec_Simple_simp* sm);



//******************************************************************************
// COMPILER SPECIFIC SECTION 2
//******************************************************************************
#ifdef _MSC_VER
#  pragma warning( pop )  //re-enable warnings disabled for this file
#endif
