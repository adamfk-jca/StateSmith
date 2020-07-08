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

#include "spec_Simple_simp.h"
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
* Handler Prototypes for spec_Simple_simp
************************************************************************************************/
static void Root_handler                  (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__S_handler               (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__S__S1_handler           (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__S__S1__S11_handler      (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__S__T1_handler           (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__S__T1__T11_handler      (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__S__T1__T11__T111_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);



/************************************************************************************************
* 'spec_Simple_simp' STATE DEFINITION
************************************************************************************************/
static HsmState const states[spec_Simple_simp_STATE_COUNT] = {
        
  [spec_Simple_simp_StateId__ROOT] = {
    .name = "ROOT", 
    .node = {
      .id = spec_Simple_simp_StateId__ROOT,
      .max_descendant_id = spec_Simple_simp_StateId__ROOT__S__T1__T11__T111,
      .parent_id = spec_Simple_simp_StateId__ROOT,
    },
    .event_handler = Root_handler,
    .vars_sizeof = sizeof(spec_Simple_simp_Root_Vars),
  },

  [spec_Simple_simp_StateId__ROOT__S] = {
    .name = "S", 
    .node = {
      .id = spec_Simple_simp_StateId__ROOT__S,
      .max_descendant_id = spec_Simple_simp_StateId__ROOT__S__T1__T11__T111,
      .parent_id = spec_Simple_simp_StateId__ROOT,
    },
    .event_handler = ROOT__S_handler,
    .vars_sizeof = sizeof(spec_Simple_simp_ROOT__S_Vars),
  },

  [spec_Simple_simp_StateId__ROOT__S__S1] = {
    .name = "S1", 
    .node = {
      .id = spec_Simple_simp_StateId__ROOT__S__S1,
      .max_descendant_id = spec_Simple_simp_StateId__ROOT__S__S1__S11,
      .parent_id = spec_Simple_simp_StateId__ROOT__S,
    },
    .event_handler = ROOT__S__S1_handler,
    .vars_sizeof = sizeof(spec_Simple_simp_ROOT__S__S1_Vars),
  },

  [spec_Simple_simp_StateId__ROOT__S__S1__S11] = {
    .name = "S11", 
    .node = {
      .id = spec_Simple_simp_StateId__ROOT__S__S1__S11,
      .max_descendant_id = spec_Simple_simp_StateId__ROOT__S__S1__S11,
      .parent_id = spec_Simple_simp_StateId__ROOT__S__S1,
    },
    .event_handler = ROOT__S__S1__S11_handler,
    .vars_sizeof = sizeof(spec_Simple_simp_ROOT__S__S1__S11_Vars),
  },

  [spec_Simple_simp_StateId__ROOT__S__T1] = {
    .name = "T1", 
    .node = {
      .id = spec_Simple_simp_StateId__ROOT__S__T1,
      .max_descendant_id = spec_Simple_simp_StateId__ROOT__S__T1__T11__T111,
      .parent_id = spec_Simple_simp_StateId__ROOT__S,
    },
    .event_handler = ROOT__S__T1_handler,
    .vars_sizeof = sizeof(spec_Simple_simp_ROOT__S__T1_Vars),
  },

  [spec_Simple_simp_StateId__ROOT__S__T1__T11] = {
    .name = "T11", 
    .node = {
      .id = spec_Simple_simp_StateId__ROOT__S__T1__T11,
      .max_descendant_id = spec_Simple_simp_StateId__ROOT__S__T1__T11__T111,
      .parent_id = spec_Simple_simp_StateId__ROOT__S__T1,
    },
    .event_handler = ROOT__S__T1__T11_handler,
    .vars_sizeof = sizeof(spec_Simple_simp_ROOT__S__T1__T11_Vars),
  },

  [spec_Simple_simp_StateId__ROOT__S__T1__T11__T111] = {
    .name = "T111", 
    .node = {
      .id = spec_Simple_simp_StateId__ROOT__S__T1__T11__T111,
      .max_descendant_id = spec_Simple_simp_StateId__ROOT__S__T1__T11__T111,
      .parent_id = spec_Simple_simp_StateId__ROOT__S__T1__T11,
    },
    .event_handler = ROOT__S__T1__T11__T111_handler,
    .vars_sizeof = sizeof(spec_Simple_simp_ROOT__S__T1__T11__T111_Vars),
  },

};
const HsmState * const spec_Simple_simp_Root_ref                   = &states[spec_Simple_simp_StateId__ROOT];
const HsmState * const spec_Simple_simp_ROOT__S_ref                = &states[spec_Simple_simp_StateId__ROOT__S];
const HsmState * const spec_Simple_simp_ROOT__S__S1_ref            = &states[spec_Simple_simp_StateId__ROOT__S__S1];
const HsmState * const spec_Simple_simp_ROOT__S__S1__S11_ref       = &states[spec_Simple_simp_StateId__ROOT__S__S1__S11];
const HsmState * const spec_Simple_simp_ROOT__S__T1_ref            = &states[spec_Simple_simp_StateId__ROOT__S__T1];
const HsmState * const spec_Simple_simp_ROOT__S__T1__T11_ref       = &states[spec_Simple_simp_StateId__ROOT__S__T1__T11];
const HsmState * const spec_Simple_simp_ROOT__S__T1__T11__T111_ref = &states[spec_Simple_simp_StateId__ROOT__S__T1__T11__T111];


/************************************************************************************************
* STRUCT for spec_Simple_simp 
************************************************************************************************/
const HsmTree spec_Simple_simpTree = {
  .htree = {
    .nodes = (HTreeNode*)&states[0],
    .node_sizeof = sizeof(states[0]),
  },
  .name = "spec_Simple_simp",
};


/************************************************************************************************
* Function to get state's temporary variables by ID
************************************************************************************************/
static HsmStateBaseVars* get_state_vars(Jxc* jxc, Hsm2* hsm, int id)
{
  (void)jxc; //remove compiler warning
  void* ptr = NULL;
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
 
  switch(id){ 
    case spec_Simple_simp_StateId__ROOT:
      ptr = &sm->root_vars.base_vars;
      break;
      
    case spec_Simple_simp_StateId__ROOT__S:
      ptr = &sm->root_vars.root__s_vars.base_vars;
      break;
      
    case spec_Simple_simp_StateId__ROOT__S__S1:
      ptr = &sm->root_vars.root__s_vars.root__s__s1_vars.base_vars;
      break;
      
    case spec_Simple_simp_StateId__ROOT__S__S1__S11:
      ptr = &sm->root_vars.root__s_vars.root__s__s1_vars.root__s__s1__s11_vars.base_vars;
      break;
      
    case spec_Simple_simp_StateId__ROOT__S__T1:
      ptr = &sm->root_vars.root__s_vars.root__s__t1_vars.base_vars;
      break;
      
    case spec_Simple_simp_StateId__ROOT__S__T1__T11:
      ptr = &sm->root_vars.root__s_vars.root__s__t1_vars.root__s__t1__t11_vars.base_vars;
      break;
      
    case spec_Simple_simp_StateId__ROOT__S__T1__T11__T111:
      ptr = &sm->root_vars.root__s_vars.root__s__t1_vars.root__s__t1__t11_vars.root__s__t1__t11__t111_vars.base_vars;
      break;
      
  }

  return ptr;
}

static void Root_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
  spec_Simple_simp_Root_Vars* vars = &sm->root_vars;
  const HsmState* this_state = &states[spec_Simple_simp_StateId__ROOT];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_Simple_simp_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_Simple_simp_InputEvent_LANDED_IN
  if( ((event_id == spec_Simple_simp_InputEvent_LANDED_IN))  ){ 
    spec_Simple_simp_tToS1();
    spec_Simple_simp_tToS11(); 
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_Simple_simp_StateId__ROOT__S__S1__S11);
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__S_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
  spec_Simple_simp_ROOT__S_Vars* vars = &sm->root_vars.root__s_vars;
  const HsmState* this_state = &states[spec_Simple_simp_StateId__ROOT__S];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_Simple_simp_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__S__S1_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
  spec_Simple_simp_ROOT__S__S1_Vars* vars = &sm->root_vars.root__s_vars.root__s__s1_vars;
  const HsmState* this_state = &states[spec_Simple_simp_StateId__ROOT__S__S1];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_Simple_simp_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_Simple_simp_InputEvent_EXIT
  if( ((event_id == spec_Simple_simp_InputEvent_EXIT))  ){ 
    spec_Simple_simp_xS1(); 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__S__S1__S11_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
  spec_Simple_simp_ROOT__S__S1__S11_Vars* vars = &sm->root_vars.root__s_vars.root__s__s1_vars.root__s__s1__s11_vars;
  const HsmState* this_state = &states[spec_Simple_simp_StateId__ROOT__S__S1__S11];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_Simple_simp_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_Simple_simp_InputEvent_EXIT
  if( ((event_id == spec_Simple_simp_InputEvent_EXIT))  ){ 
    spec_Simple_simp_xS11(); 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //ON spec_Simple_simp_InputEvent_GO_EVENT
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( ((event_id == spec_Simple_simp_InputEvent_GO_EVENT))  ){ 
    spec_Simple_simp_t1(); 
    Hsm_mark_transition_request(jxc, hsm, context, this_state, spec_Simple_simp_StateId__ROOT__S__T1__T11__T111);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__S__T1_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
  spec_Simple_simp_ROOT__S__T1_Vars* vars = &sm->root_vars.root__s_vars.root__s__t1_vars;
  const HsmState* this_state = &states[spec_Simple_simp_StateId__ROOT__S__T1];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_Simple_simp_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_Simple_simp_InputEvent_ENTER
  if( ((event_id == spec_Simple_simp_InputEvent_ENTER))  ){ 
    spec_Simple_simp_eT1(); 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__S__T1__T11_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
  spec_Simple_simp_ROOT__S__T1__T11_Vars* vars = &sm->root_vars.root__s_vars.root__s__t1_vars.root__s__t1__t11_vars;
  const HsmState* this_state = &states[spec_Simple_simp_StateId__ROOT__S__T1__T11];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_Simple_simp_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_Simple_simp_InputEvent_ENTER
  if( ((event_id == spec_Simple_simp_InputEvent_ENTER))  ){ 
    spec_Simple_simp_eT11(); 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__S__T1__T11__T111_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  spec_Simple_simp* sm = (spec_Simple_simp*)hsm;
  spec_Simple_simp_ROOT__S__T1__T11__T111_Vars* vars = &sm->root_vars.root__s_vars.root__s__t1_vars.root__s__t1__t11_vars.root__s__t1__t11__t111_vars;
  const HsmState* this_state = &states[spec_Simple_simp_StateId__ROOT__S__T1__T11__T111];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const spec_Simple_simp_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON spec_Simple_simp_InputEvent_ENTER
  if( ((event_id == spec_Simple_simp_InputEvent_ENTER))  ){ 
    spec_Simple_simp_eT111(); 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}


/************************************************************************************************
* Public class initialization function for spec_Simple_simp state machine.
************************************************************************************************/




/************************************************************************************************
* Public constructor function for spec_Simple_simp state machine
************************************************************************************************/
void spec_Simple_simp_instance_init(Jxc* jxc, spec_Simple_simp* sm, const char * instance_name)
{
  vTRY_BUBBLE_EXCEPTION();
  sm->hsm.instance_name = instance_name;
  sm->hsm.tree = &spec_Simple_simpTree;
  sm->hsm.get_state_vars = get_state_vars;
  //sm->hsm.listener = &hsmListener;
  Hsm_construct(jxc, &sm->hsm);      
}



/************************************************************************************************
* Private dispatch event function for spec_Simple_simp state machine
************************************************************************************************/
static void dispatch_event(Jxc* jxc, spec_Simple_simp* sm, const HsmEvent* event)
{
  vTRY_BUBBLE_EXCEPTION();
  //Note: no code to run before state machine event dispatch
  Hsm_dispatch_event(jxc, &sm->hsm, event);
  //Note: no code to run after state machine event dispatch
}



/************************************************************************************************
* Public step function for spec_Simple_simp state machine
************************************************************************************************/
void spec_Simple_simp_step(Jxc* jxc, spec_Simple_simp* sm)
{
  vTRY_BUBBLE_EXCEPTION();
  spec_Simple_simp_dispatch_event(jxc, sm, HsmEventId__DO);
}



/************************************************************************************************
* Public test transitions function for spec_Simple_simp state machine
************************************************************************************************/
void spec_Simple_simp_test_transitions(Jxc* jxc, spec_Simple_simp* sm, uint8_t dispatch_count)
{
  vTRY_BUBBLE_EXCEPTION();
  for (uint8_t i = 0; i < dispatch_count; i++){
    spec_Simple_simp_dispatch_event(jxc, sm, HsmEventId__TEST_TRANSITIONS);
  }
}



/************************************************************************************************
* Public dispatch event function for spec_Simple_simp state machine
************************************************************************************************/
void spec_Simple_simp_dispatch_event(Jxc* jxc, spec_Simple_simp* sm, spec_Simple_simp_InputEvent event_id)
{
  vTRY_BUBBLE_EXCEPTION();
  HsmEvent event = { .event_id = event_id };
  dispatch_event(jxc, sm, &event);
}



/************************************************************************************************
* Public function to dispatch event upon a condition
************************************************************************************************/
void spec_Simple_simp_dispatch_if(Jxc* jxc, spec_Simple_simp* sm, bool condition, HsmEventId event_id)
{
  vTRY_BUBBLE_EXCEPTION();
  if(condition)
  {
    spec_Simple_simp_dispatch_event(jxc, sm, event_id);

  }
}


/************************************************************************************************
* Function that translates a custom input event ID to a string
* NOTE: actual passed in enum values should be from 'spec_Simple_simp_InputEvent'
************************************************************************************************/
const char* spec_Simple_simp_InputEvent_to_string(HsmEventId event_id)
{
  const char * str;
  switch(event_id)
  {
    case spec_Simple_simp_InputEvent_GO_EVENT: str = "GO_EVENT"; break;

    default: str = "??CUSTOM"; break;
  }

  return str;
};




/************************************************************************************************
* Function that clears all output_events
************************************************************************************************/
void spec_Simple_simp_clear_output_events(Jxc* jxc, spec_Simple_simp* sm)
{
  (void)jxc; (void)sm;
  vTRY_BUBBLE_EXCEPTION();
  
};
