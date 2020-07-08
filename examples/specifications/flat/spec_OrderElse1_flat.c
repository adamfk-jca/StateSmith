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

#include "spec_OrderElse1_flat.h"
#include <string.h>

#define COUNTOF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))

typedef void(*spec_OrderElse1_flat_EventHandler)(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_EventId event_id);

#define PARENT_HANDLER_BOOKMARK(parent_handler) //allows an IDE to jump to function. nothing else

static void exit_upto(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId stop_before_exiting);
static void exit_state(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId state_id);
static void enter_chain(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId *state_ids, uint16_t chain_length);
static void enter_state(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId state_id);
static spec_OrderElse1_flat_StateId get_parent_id(spec_OrderElse1_flat_StateId state_id);




/************************************************************************************************
* CUSTOM FUNCTIONS
************************************************************************************************/



/************************************************************************************************
* Handler Prototypes for spec_OrderElse1_flat
************************************************************************************************/
static void ROOT_event_handler          (spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id);
static void C_event_handler             (spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id);
static void C__PSEUDO_INIT_event_handler(spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id);
static void C1_event_handler            (spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id);
static void C2_event_handler            (spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id);
static void C3_event_handler            (spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id);


/************************************************************************************************
* Parent mapping for all spec_OrderElse1_flat state IDs
************************************************************************************************/
static const spec_OrderElse1_flat_StateId parent_mapping[spec_OrderElse1_flat_StateCount] = {
  [spec_OrderElse1_flat_StateId__ROOT]           = spec_OrderElse1_flat_StateId__ROOT,
  [spec_OrderElse1_flat_StateId__C]              = spec_OrderElse1_flat_StateId__ROOT,
  [spec_OrderElse1_flat_StateId__C__PSEUDO_INIT] = spec_OrderElse1_flat_StateId__C,
  [spec_OrderElse1_flat_StateId__C1]             = spec_OrderElse1_flat_StateId__C,
  [spec_OrderElse1_flat_StateId__C2]             = spec_OrderElse1_flat_StateId__C,
  [spec_OrderElse1_flat_StateId__C3]             = spec_OrderElse1_flat_StateId__C,
};


/************************************************************************************************
* Parent mapping for all spec_OrderElse1_flat state IDs
************************************************************************************************/
static const spec_OrderElse1_flat_EventHandler state_handlers[spec_OrderElse1_flat_StateCount] = {
  [spec_OrderElse1_flat_StateId__ROOT]           = ROOT_event_handler,
  [spec_OrderElse1_flat_StateId__C]              = C_event_handler,
  [spec_OrderElse1_flat_StateId__C__PSEUDO_INIT] = C__PSEUDO_INIT_event_handler,
  [spec_OrderElse1_flat_StateId__C1]             = C1_event_handler,
  [spec_OrderElse1_flat_StateId__C2]             = C2_event_handler,
  [spec_OrderElse1_flat_StateId__C3]             = C3_event_handler,
};


static void ROOT_event_handler(spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  // if true
  if ((true)){ 
    if (event_id != spec_OrderElse1_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    sm->event_handled = true; //for loop efficiency; 
  }

}

static void C_event_handler(spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  //ON GO_EVENT if true
  if (event_id == spec_OrderElse1_flat_EventId__GO_EVENT && (true)){ 
    if (event_id != spec_OrderElse1_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    sm->vars.var1 = sm->vars.var1; 
  }

  //ON GO_EVENT
  if (event_id == spec_OrderElse1_flat_EventId__GO_EVENT){  
    //transitioning from C to C__PSEUDO_INIT
    exit_upto(sm, spec_OrderElse1_flat_StateId__C);

    //enter states
    spec_OrderElse1_flat_StateId states_to_enter[] = {
      spec_OrderElse1_flat_StateId__C__PSEUDO_INIT
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

}

static void C__PSEUDO_INIT_event_handler(spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  // if var1 == 1
  if ((sm->vars.var1 == 1)){  
    //transitioning from C__PSEUDO_INIT to C2
    exit_upto(sm, spec_OrderElse1_flat_StateId__C);

    //enter states
    spec_OrderElse1_flat_StateId states_to_enter[] = {
      spec_OrderElse1_flat_StateId__C2
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

  // if var1 > var2
  if ((sm->vars.var1 > sm->vars.var2)){  
    //transitioning from C__PSEUDO_INIT to C1
    exit_upto(sm, spec_OrderElse1_flat_StateId__C);

    //enter states
    spec_OrderElse1_flat_StateId states_to_enter[] = {
      spec_OrderElse1_flat_StateId__C1
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

  //ELSE
  if (true){  
    //transitioning from C__PSEUDO_INIT to C3
    exit_upto(sm, spec_OrderElse1_flat_StateId__C);

    //enter states
    spec_OrderElse1_flat_StateId states_to_enter[] = {
      spec_OrderElse1_flat_StateId__C3
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

}

static void C1_event_handler(spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
}

static void C2_event_handler(spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
}

static void C3_event_handler(spec_OrderElse1_flat *sm, spec_OrderElse1_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
}


/************************************************************************************************
* Public constructor function for spec_OrderElse1_flat state machine
************************************************************************************************/
void spec_OrderElse1_flat_instance_init(spec_OrderElse1_flat* sm)
{
  enter_state(sm, spec_OrderElse1_flat_StateId__ROOT);
  spec_OrderElse1_flat_StateId states_to_enter[] = {
    spec_OrderElse1_flat_StateId__C,
    spec_OrderElse1_flat_StateId__C__PSEUDO_INIT
  };
  enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));
}


/************************************************************************************************
* TODO spec_OrderElse1_flat 
************************************************************************************************/
static void enter_state(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId state_id)
{
  switch(state_id)
  {
    case spec_OrderElse1_flat_StateId__ROOT:
      break;

    case spec_OrderElse1_flat_StateId__C:
      break;

    case spec_OrderElse1_flat_StateId__C__PSEUDO_INIT:
      break;

    case spec_OrderElse1_flat_StateId__C1:
      //if false
      if (false)
      {
        //out = 99;
        sm->vars.out = 99;
      }
      //if true
      if (true)
      {
        //out = 1;
        sm->vars.out = 1;
      }
      break;

    case spec_OrderElse1_flat_StateId__C2:
      //out = 2;
      sm->vars.out = 2;
      break;

    case spec_OrderElse1_flat_StateId__C3:
      //out = 3;
      sm->vars.out = 3;
      break;
  }
};


/************************************************************************************************
* TODO spec_OrderElse1_flat 
************************************************************************************************/
static void exit_state(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId state_id)
{
  switch(state_id)
  {
    case spec_OrderElse1_flat_StateId__ROOT:
      break;

    case spec_OrderElse1_flat_StateId__C:
      break;

    case spec_OrderElse1_flat_StateId__C__PSEUDO_INIT:
      break;

    case spec_OrderElse1_flat_StateId__C1:
      break;

    case spec_OrderElse1_flat_StateId__C2:
      //out = 2;
      sm->vars.out = 2;
      break;

    case spec_OrderElse1_flat_StateId__C3:
      break;
  }
};



/************************************************************************************************
* Function that translates a custom input event ID to a string
* NOTE: actual passed in enum values should be from 'spec_OrderElse1_flat_EventId'
************************************************************************************************/
const char* spec_OrderElse1_flat_InputEvent_to_string(spec_OrderElse1_flat_EventId event_id)
{
  const char * str;
  switch(event_id)
  {
    case spec_OrderElse1_flat_EventId__GO_EVENT: str = "GO_EVENT"; break;

    default: str = "??CUSTOM"; break;
  }

  return str;
}


void spec_OrderElse1_flat_dispatch_event(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_EventId event_id)
{
    spec_OrderElse1_flat_StateId state_id_to_rx_event = sm->state_id;
    sm->event_handled = false;

    do
    {
        spec_OrderElse1_flat_EventHandler event_handler = state_handlers[state_id_to_rx_event];
        event_handler(sm, event_id);
        state_id_to_rx_event = get_parent_id(state_id_to_rx_event);
    }
    while(!sm->event_handled);
}


static void enter_chain(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId *state_ids, uint16_t chain_length)
{
    for(uint16_t i = 0; i < chain_length; i++)
    {
        spec_OrderElse1_flat_StateId to_enter = state_ids[i];
        enter_state(sm, to_enter);
        sm->state_id = to_enter;
    }
}


static spec_OrderElse1_flat_StateId get_parent_id(spec_OrderElse1_flat_StateId state_id)
{
    spec_OrderElse1_flat_StateId parent = parent_mapping[state_id];
    return parent;
}


static void exit_upto(spec_OrderElse1_flat* sm, spec_OrderElse1_flat_StateId stop_before_exiting)
{
    while(sm->state_id != spec_OrderElse1_flat_StateId__ROOT && sm->state_id != stop_before_exiting)
    {
        exit_state(sm, sm->state_id);
        sm->state_id = get_parent_id(sm->state_id);
    }
}
