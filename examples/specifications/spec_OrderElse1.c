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

#include "spec_OrderElse1.h"
#include "hsm2.h"
#include <inttypes.h> //for printf format macro constants like 'PRIu32'

//******************************************************************************
// COMPILER SPECIFIC SECTION
//******************************************************************************
//disable specific Visual Studio warnings for this file
#ifdef _MSC_VER
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#endif




/************************************************************************************************
* CUSTOM FUNCTIONS
************************************************************************************************/

static void event_handler_breakpoint(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event){
  (void)jxc; (void)hsm; (void)context; (void)event;
  int x = 5;  //set breakpoint here
  (void)x; //avoid compiler warning
}

/************************************************************************************************
* Handler Prototypes for spec_OrderElse1
************************************************************************************************/
static void Root_handler                   (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__C_handler                (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__C__C__PSEUDO_INIT_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__C__C1_handler            (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__C__C2_handler            (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__C__C3_handler            (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);



/************************************************************************************************
* 'spec_OrderElse1' STATE DEFINITION
************************************************************************************************/
static HsmState const states[spec_OrderElse1_STATE_COUNT] = {
        
  [spec_OrderElse1_StateId__ROOT] = {
    .name = "ROOT", 
    .node = {
      .id = spec_OrderElse1_StateId__ROOT,
      .max_descendant_id = spec_OrderElse1_StateId__ROOT__C__C3,
      .parent_id = spec_OrderElse1_StateId__ROOT,
    },
    .event_handler = Root_handler,
    .vars_sizeof = sizeof(spec_OrderElse1_Root_Vars),
  },

  [spec_OrderElse1_StateId__ROOT__C] = {
    .name = "C", 
    .node = {
      .id = spec_OrderElse1_StateId__ROOT__C,
      .max_descendant_id = spec_OrderElse1_StateId__ROOT__C__C3,
      .parent_id = spec_OrderElse1_StateId__ROOT,
    },
    .event_handler = ROOT__C_handler,
    .vars_sizeof = sizeof(spec_OrderElse1_ROOT__C_Vars),
  },

  [spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT] = {
    .name = "C__PSEUDO_INIT", 
    .node = {
      .id = spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT,
      .max_descendant_id = spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT,
      .parent_id = spec_OrderElse1_StateId__ROOT__C,
    },
    .event_handler = ROOT__C__C__PSEUDO_INIT_handler,
    .vars_sizeof = sizeof(spec_OrderElse1_ROOT__C__C__PSEUDO_INIT_Vars),
  },

  [spec_OrderElse1_StateId__ROOT__C__C1] = {
    .name = "C1", 
    .node = {
      .id = spec_OrderElse1_StateId__ROOT__C__C1,
      .max_descendant_id = spec_OrderElse1_StateId__ROOT__C__C1,
      .parent_id = spec_OrderElse1_StateId__ROOT__C,
    },
    .event_handler = ROOT__C__C1_handler,
    .vars_sizeof = sizeof(spec_OrderElse1_ROOT__C__C1_Vars),
  },

  [spec_OrderElse1_StateId__ROOT__C__C2] = {
    .name = "C2", 
    .node = {
      .id = spec_OrderElse1_StateId__ROOT__C__C2,
      .max_descendant_id = spec_OrderElse1_StateId__ROOT__C__C2,
      .parent_id = spec_OrderElse1_StateId__ROOT__C,
    },
    .event_handler = ROOT__C__C2_handler,
    .vars_sizeof = sizeof(spec_OrderElse1_ROOT__C__C2_Vars),
  },

  [spec_OrderElse1_StateId__ROOT__C__C3] = {
    .name = "C3", 
    .node = {
      .id = spec_OrderElse1_StateId__ROOT__C__C3,
      .max_descendant_id = spec_OrderElse1_StateId__ROOT__C__C3,
      .parent_id = spec_OrderElse1_StateId__ROOT__C,
    },
    .event_handler = ROOT__C__C3_handler,
    .vars_sizeof = sizeof(spec_OrderElse1_ROOT__C__C3_Vars),
  },

};
const HsmState * const spec_OrderElse1_Root_ref                    = &states[spec_OrderElse1_StateId__ROOT];
const HsmState * const spec_OrderElse1_ROOT__C_ref                 = &states[spec_OrderElse1_StateId__ROOT__C];
const HsmState * const spec_OrderElse1_ROOT__C__C__PSEUDO_INIT_ref = &states[spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT];
const HsmState * const spec_OrderElse1_ROOT__C__C1_ref             = &states[spec_OrderElse1_StateId__ROOT__C__C1];
const HsmState * const spec_OrderElse1_ROOT__C__C2_ref             = &states[spec_OrderElse1_StateId__ROOT__C__C2];
const HsmState * const spec_OrderElse1_ROOT__C__C3_ref             = &states[spec_OrderElse1_StateId__ROOT__C__C3];


/************************************************************************************************
* STRUCT for spec_OrderElse1 
************************************************************************************************/
const HsmTree spec_OrderElse1Tree = {
  .htree = {
    .nodes = (HTreeNode*)&states[0],
    .node_sizeof = sizeof(states[0]),
  },
  .name = "spec_OrderElse1",
};


/************************************************************************************************
* Function to get state's temporary variables by ID
************************************************************************************************/
static HsmStateBaseVars* get_state_vars(Jxc* jxc, Hsm2* hsm, int id)
{
  (void)jxc; //remove compiler warning
  void* ptr = NULL;
  spec_OrderElse1* sm = (spec_OrderElse1*)hsm;
 
  switch(id){ 
    case spec_OrderElse1_StateId__ROOT:
      ptr = &sm->root_vars.base_vars;
      break;
      
    case spec_OrderElse1_StateId__ROOT__C:
      ptr = &sm->root_vars.root__c_vars.base_vars;
      break;
      
    case spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT:
      ptr = &sm->root_vars.root__c_vars.root__c__c__pseudo_init_vars.base_vars;
      break;
      
    case spec_OrderElse1_StateId__ROOT__C__C1:
      ptr = &sm->root_vars.root__c_vars.root__c__c1_vars.base_vars;
      break;
      
    case spec_OrderElse1_StateId__ROOT__C__C2:
      ptr = &sm->root_vars.root__c_vars.root__c__c2_vars.base_vars;
      break;
      
    case spec_OrderElse1_StateId__ROOT__C__C3:
      ptr = &sm->root_vars.root__c_vars.root__c__c3_vars.base_vars;
      break;
      
  }

  return ptr;
}

static void Root_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_OrderElse1* sm = (spec_OrderElse1*)hsm;
  spec_OrderElse1_Root_Vars* vars = &sm->root_vars;
  const HsmState* this_state = &states[spec_OrderElse1_StateId__ROOT];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_OrderElse1_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_OrderElse1_InputEvent_LANDED_IN
  if( ((event_id == spec_OrderElse1_InputEvent_LANDED_IN))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT);
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__C_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_OrderElse1* sm = (spec_OrderElse1*)hsm;
  spec_OrderElse1_ROOT__C_Vars* vars = &sm->root_vars.root__c_vars;
  const HsmState* this_state = &states[spec_OrderElse1_StateId__ROOT__C];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_OrderElse1_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_OrderElse1_InputEvent_LANDED_IN
  if( ((event_id == spec_OrderElse1_InputEvent_LANDED_IN))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT);
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //ON spec_OrderElse1_InputEvent_GO_EVENT if true
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( ((event_id == spec_OrderElse1_InputEvent_GO_EVENT)) && (true)  ){ 
    sm->vars.var1 = sm->vars.var1; 
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

  
  //ON spec_OrderElse1_InputEvent_GO_EVENT
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( ((event_id == spec_OrderElse1_InputEvent_GO_EVENT))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__C__C__PSEUDO_INIT_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_OrderElse1* sm = (spec_OrderElse1*)hsm;
  spec_OrderElse1_ROOT__C__C__PSEUDO_INIT_Vars* vars = &sm->root_vars.root__c_vars.root__c__c__pseudo_init_vars;
  const HsmState* this_state = &states[spec_OrderElse1_StateId__ROOT__C__C__PSEUDO_INIT];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_OrderElse1_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //if var1 == 1
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (sm->vars.var1 == 1)  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_OrderElse1_StateId__ROOT__C__C2);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

  
  //if var1 > var2
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (sm->vars.var1 > sm->vars.var2)  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_OrderElse1_StateId__ROOT__C__C1);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

  
  //ELSE
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( true  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_OrderElse1_StateId__ROOT__C__C3);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__C__C1_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_OrderElse1* sm = (spec_OrderElse1*)hsm;
  spec_OrderElse1_ROOT__C__C1_Vars* vars = &sm->root_vars.root__c_vars.root__c__c1_vars;
  const HsmState* this_state = &states[spec_OrderElse1_StateId__ROOT__C__C1];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_OrderElse1_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_OrderElse1_InputEvent_ENTER if false
  if( ((event_id == spec_OrderElse1_InputEvent_ENTER)) && (false)  ){ 
    sm->vars.out = 99; 
  }

  
  //ON spec_OrderElse1_InputEvent_ENTER if true
  if( ((event_id == spec_OrderElse1_InputEvent_ENTER)) && (true)  ){ 
    sm->vars.out = 1; 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__C__C2_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_OrderElse1* sm = (spec_OrderElse1*)hsm;
  spec_OrderElse1_ROOT__C__C2_Vars* vars = &sm->root_vars.root__c_vars.root__c__c2_vars;
  const HsmState* this_state = &states[spec_OrderElse1_StateId__ROOT__C__C2];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_OrderElse1_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_OrderElse1_InputEvent_EXIT
  if( ((event_id == spec_OrderElse1_InputEvent_EXIT))  ){ 
    sm->vars.out = 2; 
  }

  
  //ON spec_OrderElse1_InputEvent_ENTER
  if( ((event_id == spec_OrderElse1_InputEvent_ENTER))  ){ 
    sm->vars.out = 2; 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__C__C3_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_OrderElse1* sm = (spec_OrderElse1*)hsm;
  spec_OrderElse1_ROOT__C__C3_Vars* vars = &sm->root_vars.root__c_vars.root__c__c3_vars;
  const HsmState* this_state = &states[spec_OrderElse1_StateId__ROOT__C__C3];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_OrderElse1_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_OrderElse1_InputEvent_ENTER
  if( ((event_id == spec_OrderElse1_InputEvent_ENTER))  ){ 
    sm->vars.out = 3; 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}


/************************************************************************************************
* Public class initialization function for spec_OrderElse1 state machine.
************************************************************************************************/




/************************************************************************************************
* Public constructor function for spec_OrderElse1 state machine
************************************************************************************************/
void spec_OrderElse1_instance_init(Jxc* jxc, spec_OrderElse1* sm, const char * instance_name)
{
  vTRY_BUBBLE_EXCEPTION();
  sm->hsm.instance_name = instance_name;
  sm->hsm.tree = &spec_OrderElse1Tree;
  sm->hsm.get_state_vars = get_state_vars;
  //sm->hsm.listener = &hsmListener;
  Hsm_construct(jxc, &sm->hsm);      
}



/************************************************************************************************
* Private dispatch event function for spec_OrderElse1 state machine
************************************************************************************************/
static void dispatch_event(Jxc* jxc, spec_OrderElse1* sm, const HsmEvent* event)
{
  vTRY_BUBBLE_EXCEPTION();
  //Note: no code to run before state machine event dispatch
  Hsm_dispatch_event(jxc, &sm->hsm, event);
  //Note: no code to run after state machine event dispatch
}



/************************************************************************************************
* Public step function for spec_OrderElse1 state machine
************************************************************************************************/
void spec_OrderElse1_step(Jxc* jxc, spec_OrderElse1* sm)
{
  vTRY_BUBBLE_EXCEPTION();
  spec_OrderElse1_dispatch_event(jxc, sm, HsmEventId__DO);
}



/************************************************************************************************
* Public test transitions function for spec_OrderElse1 state machine
************************************************************************************************/
void spec_OrderElse1_test_transitions(Jxc* jxc, spec_OrderElse1* sm, uint8_t dispatch_count)
{
  vTRY_BUBBLE_EXCEPTION();
  for (uint8_t i = 0; i < dispatch_count; i++){
    spec_OrderElse1_dispatch_event(jxc, sm, HsmEventId__TEST_TRANSITIONS);
  }
}



/************************************************************************************************
* Public dispatch event function for spec_OrderElse1 state machine
************************************************************************************************/
void spec_OrderElse1_dispatch_event(Jxc* jxc, spec_OrderElse1* sm, spec_OrderElse1_InputEvent event_id)
{
  vTRY_BUBBLE_EXCEPTION();
  HsmEvent event = { .event_id = event_id };
  dispatch_event(jxc, sm, &event);
}



/************************************************************************************************
* Public function to dispatch event upon a condition
************************************************************************************************/
void spec_OrderElse1_dispatch_if(Jxc* jxc, spec_OrderElse1* sm, bool condition, HsmEventId event_id)
{
  vTRY_BUBBLE_EXCEPTION();
  if(condition)
  {
    spec_OrderElse1_dispatch_event(jxc, sm, event_id);

  }
}


/************************************************************************************************
* Function that translates a custom input event ID to a string
* NOTE: actual passed in enum values should be from 'spec_OrderElse1_InputEvent'
************************************************************************************************/
const char* spec_OrderElse1_InputEvent_to_string(HsmEventId event_id)
{
  const char * str;
  switch(event_id)
  {
    case spec_OrderElse1_InputEvent_GO_EVENT: str = "GO_EVENT"; break;

    default: str = "??CUSTOM"; break;
  }

  return str;
};




/************************************************************************************************
* Function that clears all output_events
************************************************************************************************/
void spec_OrderElse1_clear_output_events(Jxc* jxc, spec_OrderElse1* sm)
{
  (void)jxc; (void)sm;
  vTRY_BUBBLE_EXCEPTION();
  
};
