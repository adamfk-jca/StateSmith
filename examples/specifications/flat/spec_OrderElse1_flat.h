/************************************************************************************************
* @file
* 
* @brief     State machine "spec_OrderElse1_flat"
*            Auto generated from file: ../examples/specifications/spec_OrderElse1.graphml
* 
* @copyright Copyright (c) 2019 JCA Electronics, Winnipeg, MB.
*            All rights reserved.
* 
************************************************************************************************/

#pragma once
#include <stdint.h>
#include <stdbool.h>




/************************************************************************************************
* Enumeration for all spec_OrderElse1_flat state IDs
************************************************************************************************/
typedef enum spec_OrderElse1_flat_StateId
{
  spec_OrderElse1_flat_StateId__ROOT,
  spec_OrderElse1_flat_StateId__C,
  spec_OrderElse1_flat_StateId__C__PSEUDO_INIT,
  spec_OrderElse1_flat_StateId__C1,
  spec_OrderElse1_flat_StateId__C2,
  spec_OrderElse1_flat_StateId__C3,
  //--------------------------
  spec_OrderElse1_flat_StateCount,
} spec_OrderElse1_flat_StateId;



/************************************************************************************************
* Enumeration for all spec_OrderElse1_flat input event IDs
************************************************************************************************/
typedef enum spec_OrderElse1_flat_EventId
{
  spec_OrderElse1_flat_EventId__DO,
  spec_OrderElse1_flat_EventId__GO_EVENT,
} spec_OrderElse1_flat_EventId;




/************************************************************************************************
* STRUCT for spec_OrderElse1_flat variables 
************************************************************************************************/
typedef struct spec_OrderElse1_flat_Vars
{

  int var1;
  int var2;
  int out;

} spec_OrderElse1_flat_Vars;



/************************************************************************************************
* STRUCT for spec_OrderElse1_flat 
************************************************************************************************/
typedef struct spec_OrderElse1_flat
{
  bool event_handled;
  spec_OrderElse1_flat_StateId state_id;

  spec_OrderElse1_flat_Vars vars;
} spec_OrderElse1_flat;


/************************************************************************************************
* public functions
************************************************************************************************/
void spec_OrderElse1_flat_instance_init(spec_OrderElse1_flat* sm);
const char* spec_OrderElse1_flat_InputEvent_to_string(spec_OrderElse1_flat_EventId event_id);
void spec_OrderElse1_flat_dispatch_event(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_EventId event_id);
