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

#include "spec_Simple2_flat.h"
#include <string.h>

#define COUNTOF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))

typedef void(*spec_Simple2_flat_EventHandler)(spec_Simple2_flat* sm, spec_Simple2_flat_EventId event_id);

#define PARENT_HANDLER_BOOKMARK(parent_handler) //allows an IDE to jump to function. nothing else

static void exit_upto(spec_Simple2_flat* sm, spec_Simple2_flat_StateId stop_before_exiting);
static void exit_state(spec_Simple2_flat* sm, spec_Simple2_flat_StateId state_id);
static void enter_chain(spec_Simple2_flat* sm, spec_Simple2_flat_StateId *state_ids, uint16_t chain_length);
static void enter_state(spec_Simple2_flat* sm, spec_Simple2_flat_StateId state_id);
static spec_Simple2_flat_StateId get_parent_id(spec_Simple2_flat_StateId state_id);




/************************************************************************************************
* CUSTOM FUNCTIONS
************************************************************************************************/



/************************************************************************************************
* Handler Prototypes for spec_Simple2_flat
************************************************************************************************/
static void ROOT_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id);
static void S_event_handler   (spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id);
static void S1_event_handler  (spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id);
static void S11_event_handler (spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id);
static void T1_event_handler  (spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id);
static void T11_event_handler (spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id);
static void T111_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id);


/************************************************************************************************
* Parent mapping for all spec_Simple2_flat state IDs
************************************************************************************************/
static const spec_Simple2_flat_StateId parent_mapping[spec_Simple2_flat_StateCount] = {
  [spec_Simple2_flat_StateId__ROOT] = spec_Simple2_flat_StateId__ROOT,
  [spec_Simple2_flat_StateId__S]    = spec_Simple2_flat_StateId__ROOT,
  [spec_Simple2_flat_StateId__S1]   = spec_Simple2_flat_StateId__S,
  [spec_Simple2_flat_StateId__S11]  = spec_Simple2_flat_StateId__S1,
  [spec_Simple2_flat_StateId__T1]   = spec_Simple2_flat_StateId__S,
  [spec_Simple2_flat_StateId__T11]  = spec_Simple2_flat_StateId__T1,
  [spec_Simple2_flat_StateId__T111] = spec_Simple2_flat_StateId__T11,
};


/************************************************************************************************
* Parent mapping for all spec_Simple2_flat state IDs
************************************************************************************************/
static const spec_Simple2_flat_EventHandler state_handlers[spec_Simple2_flat_StateCount] = {
  [spec_Simple2_flat_StateId__ROOT] = ROOT_event_handler,
  [spec_Simple2_flat_StateId__S]    = S_event_handler,
  [spec_Simple2_flat_StateId__S1]   = S1_event_handler,
  [spec_Simple2_flat_StateId__S11]  = S11_event_handler,
  [spec_Simple2_flat_StateId__T1]   = T1_event_handler,
  [spec_Simple2_flat_StateId__T11]  = T11_event_handler,
  [spec_Simple2_flat_StateId__T111] = T111_event_handler,
};


static void ROOT_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  // if true
  if ((true)){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    sm->event_handled = true; //for loop efficiency; 
  }

}

static void S_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  //ON DO
  if (event_id == spec_Simple2_flat_EventId__DO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "S: DO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "S: GO"); 
  }

}

static void S1_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  //ON DO
  if (event_id == spec_Simple2_flat_EventId__DO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "S1: DO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "S1: GO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_fail("S1: GO"); 
  }

}

static void S11_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  //ON DO
  if (event_id == spec_Simple2_flat_EventId__DO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "S11: DO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "S11: GO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "S11: GO -> T111"); 
    //transitioning from S11 to T111
    exit_upto(sm, spec_Simple2_flat_StateId__S);

    //enter states
    spec_Simple2_flat_StateId states_to_enter[] = {
      spec_Simple2_flat_StateId__T1,
      spec_Simple2_flat_StateId__T11,
      spec_Simple2_flat_StateId__T111
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

}

static void T1_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  //ON DO if num > 0
  if (event_id == spec_Simple2_flat_EventId__DO && (sm->vars.num > 0)){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T1: DO [num > 0] -> T111"); 
    //transitioning from T1 to T111
    exit_upto(sm, spec_Simple2_flat_StateId__T1);

    //enter states
    spec_Simple2_flat_StateId states_to_enter[] = {
      spec_Simple2_flat_StateId__T11,
      spec_Simple2_flat_StateId__T111
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

  //ON DO
  if (event_id == spec_Simple2_flat_EventId__DO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T1: DO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T1: GO"); 
  }

  //ON DO if num < 0
  if (event_id == spec_Simple2_flat_EventId__DO && (sm->vars.num < 0)){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_fail("T1: DO [num < 0]"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_fail("T1: GO -> T1"); 
    //transitioning from T1 to T1
    exit_upto(sm, spec_Simple2_flat_StateId__S);

    //enter states
    spec_Simple2_flat_StateId states_to_enter[] = {
      spec_Simple2_flat_StateId__T1
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

}

static void T11_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  //ON DO
  if (event_id == spec_Simple2_flat_EventId__DO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T11: DO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T11: GO"); 
  }

  //ON DO if num < 0
  if (event_id == spec_Simple2_flat_EventId__DO && (sm->vars.num < 0)){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_fail("T11: DO [num < 0]"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_fail("T11: GO -> S11");
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "#3"); 
    //transitioning from T11 to S11
    exit_upto(sm, spec_Simple2_flat_StateId__S);

    //enter states
    spec_Simple2_flat_StateId states_to_enter[] = {
      spec_Simple2_flat_StateId__S1,
      spec_Simple2_flat_StateId__S11
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

}

static void T111_event_handler(spec_Simple2_flat *sm, spec_Simple2_flat_EventId event_id)
{
  //TODO copy paste in entry and exit code in comments
    
  //ON DO if num == 0
  if (event_id == spec_Simple2_flat_EventId__DO && (sm->vars.num == 0)){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T111: DO [num == 0] -> T111"); 
    //transitioning from T111 to T111
    exit_upto(sm, spec_Simple2_flat_StateId__T11);

    //enter states
    spec_Simple2_flat_StateId states_to_enter[] = {
      spec_Simple2_flat_StateId__T111
    };
    enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

  //ON DO if num > 0
  if (event_id == spec_Simple2_flat_EventId__DO && (sm->vars.num > 0)){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T111: DO [num > 0] -> T1"); 
    //transitioning from T111 to T1
    exit_upto(sm, spec_Simple2_flat_StateId__T1);

    //enter states
    

    sm->event_handled = true;
    return; //stop processing because it transitioned
  }

  //ON DO if num < 0
  if (event_id == spec_Simple2_flat_EventId__DO && (sm->vars.num < 0)){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_fail("T111: DO [num < 0]"); 
  }

  //ON DO
  if (event_id == spec_Simple2_flat_EventId__DO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T111: DO"); 
  }

  //ON GO
  if (event_id == spec_Simple2_flat_EventId__GO){ 
    if (event_id != spec_Simple2_flat_EventId__DO) {
        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
    }
      
    spec_Simple2_flat_test_trace(sm->vars.trace_object, "T111: GO"); 
  }

}


/************************************************************************************************
* Public constructor function for spec_Simple2_flat state machine
************************************************************************************************/
void spec_Simple2_flat_instance_init(spec_Simple2_flat* sm)
{
  spec_Simple2_flat_test_trace(sm->vars.trace_object, "#1");
  spec_Simple2_flat_test_trace(sm->vars.trace_object, "#2");
  spec_Simple2_flat_test_trace(sm->vars.trace_object, "#3");
  enter_state(sm, spec_Simple2_flat_StateId__ROOT);
  spec_Simple2_flat_StateId states_to_enter[] = {
    spec_Simple2_flat_StateId__S,
    spec_Simple2_flat_StateId__S1,
    spec_Simple2_flat_StateId__S11
  };
  enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));
}


/************************************************************************************************
* TODO spec_Simple2_flat 
************************************************************************************************/
static void enter_state(spec_Simple2_flat* sm, spec_Simple2_flat_StateId state_id)
{
  switch(state_id)
  {
    case spec_Simple2_flat_StateId__ROOT:
      break;

    case spec_Simple2_flat_StateId__S:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "S: ENTER");
      break;

    case spec_Simple2_flat_StateId__S1:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "S1: ENTER");
      break;

    case spec_Simple2_flat_StateId__S11:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "S11: ENTER");
      break;

    case spec_Simple2_flat_StateId__T1:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "T1: ENTER");
      break;

    case spec_Simple2_flat_StateId__T11:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "T11: ENTER");
      break;

    case spec_Simple2_flat_StateId__T111:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "T111: ENTER");
      break;
  }
};


/************************************************************************************************
* TODO spec_Simple2_flat 
************************************************************************************************/
static void exit_state(spec_Simple2_flat* sm, spec_Simple2_flat_StateId state_id)
{
  switch(state_id)
  {
    case spec_Simple2_flat_StateId__ROOT:
      break;

    case spec_Simple2_flat_StateId__S:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "S: EXIT");
      break;

    case spec_Simple2_flat_StateId__S1:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "S1: EXIT");
      break;

    case spec_Simple2_flat_StateId__S11:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "S11: EXIT");
      break;

    case spec_Simple2_flat_StateId__T1:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "T1: EXIT");
      break;

    case spec_Simple2_flat_StateId__T11:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "T11: EXIT");
      break;

    case spec_Simple2_flat_StateId__T111:
      //trace();
      spec_Simple2_flat_test_trace(sm->vars.trace_object, "T111: EXIT");
      break;
  }
};



/************************************************************************************************
* Function that translates a custom input event ID to a string
* NOTE: actual passed in enum values should be from 'spec_Simple2_flat_EventId'
************************************************************************************************/
const char* spec_Simple2_flat_InputEvent_to_string(spec_Simple2_flat_EventId event_id)
{
  const char * str;
  switch(event_id)
  {
    case spec_Simple2_flat_EventId__GO: str = "GO"; break;

    default: str = "??CUSTOM"; break;
  }

  return str;
}


void spec_Simple2_flat_dispatch_event(spec_Simple2_flat* sm, spec_Simple2_flat_EventId event_id)
{
    spec_Simple2_flat_StateId state_id_to_rx_event = sm->state_id;
    sm->event_handled = false;

    do
    {
        spec_Simple2_flat_EventHandler event_handler = state_handlers[state_id_to_rx_event];
        event_handler(sm, event_id);
        state_id_to_rx_event = get_parent_id(state_id_to_rx_event);
    }
    while(!sm->event_handled);
}


static void enter_chain(spec_Simple2_flat* sm, spec_Simple2_flat_StateId *state_ids, uint16_t chain_length)
{
    for(uint16_t i = 0; i < chain_length; i++)
    {
        spec_Simple2_flat_StateId to_enter = state_ids[i];
        enter_state(sm, to_enter);
        sm->state_id = to_enter;
    }
}


static spec_Simple2_flat_StateId get_parent_id(spec_Simple2_flat_StateId state_id)
{
    spec_Simple2_flat_StateId parent = parent_mapping[state_id];
    return parent;
}


static void exit_upto(spec_Simple2_flat* sm, spec_Simple2_flat_StateId stop_before_exiting)
{
    while(sm->state_id != spec_Simple2_flat_StateId__ROOT && sm->state_id != stop_before_exiting)
    {
        exit_state(sm, sm->state_id);
        sm->state_id = get_parent_id(sm->state_id);
    }
}
