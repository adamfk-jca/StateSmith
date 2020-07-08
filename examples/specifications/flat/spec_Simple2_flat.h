/************************************************************************************************
* @file
* 
* @brief     State machine "spec_Simple2_flat"
*            Auto generated from file: ../examples/specifications/spec_Simple2.graphml
* 
* @copyright Copyright (c) 2019 JCA Electronics, Winnipeg, MB.
*            All rights reserved.
* 
************************************************************************************************/

#pragma once
#include <stdint.h>
#include <stdbool.h>

void spec_Simple2_flat_test_trace(void* trace_object, const char* const description);
void spec_Simple2_flat_fail(const char* const description);


/************************************************************************************************
* Enumeration for all spec_Simple2_flat state IDs
************************************************************************************************/
typedef enum spec_Simple2_flat_StateId
{
  spec_Simple2_flat_StateId__ROOT,
  spec_Simple2_flat_StateId__S,
  spec_Simple2_flat_StateId__S1,
  spec_Simple2_flat_StateId__S11,
  spec_Simple2_flat_StateId__T1,
  spec_Simple2_flat_StateId__T11,
  spec_Simple2_flat_StateId__T111,
  //--------------------------
  spec_Simple2_flat_StateCount,
} spec_Simple2_flat_StateId;



/************************************************************************************************
* Enumeration for all spec_Simple2_flat input event IDs
************************************************************************************************/
typedef enum spec_Simple2_flat_EventId
{
  spec_Simple2_flat_EventId__DO,
  spec_Simple2_flat_EventId__GO,
} spec_Simple2_flat_EventId;




/************************************************************************************************
* STRUCT for spec_Simple2_flat variables 
************************************************************************************************/
typedef struct spec_Simple2_flat_Vars
{

  void* trace_object;
  int num;

} spec_Simple2_flat_Vars;



/************************************************************************************************
* STRUCT for spec_Simple2_flat 
************************************************************************************************/
typedef struct spec_Simple2_flat
{
  bool event_handled;
  spec_Simple2_flat_StateId state_id;

  spec_Simple2_flat_Vars vars;
} spec_Simple2_flat;


/************************************************************************************************
* public functions
************************************************************************************************/
void spec_Simple2_flat_instance_init(spec_Simple2_flat* sm);
const char* spec_Simple2_flat_InputEvent_to_string(spec_Simple2_flat_EventId event_id);
void spec_Simple2_flat_dispatch_event(spec_Simple2_flat* sm, spec_Simple2_flat_EventId event_id);
