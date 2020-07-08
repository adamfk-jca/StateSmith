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

#include "ButSm.h"
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
//anything you want at top of .c file like additional includes




/************************************************************************************************
* CUSTOM FUNCTIONS
************************************************************************************************/

static void event_handler_breakpoint(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event){
  (void)jxc; (void)hsm; (void)context; (void)event;
  int x = 5;  //set breakpoint here
  (void)x; //avoid compiler warning
}

/************************************************************************************************
* Handler Prototypes for ExampleSm
************************************************************************************************/
static void Root_handler                                             (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__REPEAT_handler                                 (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__REPEAT__NOT_HELD_handler                       (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__REPEAT__BEING_HELD_handler                     (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__BASIC_handler                                  (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__BASIC__NOT_PRESSED_handler                     (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__BASIC__PRESSED_handler                         (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__BASIC__PRESSED__INITIAL_PRESS_handler          (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__BASIC__PRESSED__HELD_handler                   (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
static void ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_handler        (Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);



/************************************************************************************************
* 'ExampleSm' STATE DEFINITION
************************************************************************************************/
static HsmState const states[ButSm_STATE_COUNT] = {
        
  [ButSm_StateId__ROOT] = {
    .name = "ROOT", 
    .node = {
      .id = ButSm_StateId__ROOT,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG,
      .parent_id = ButSm_StateId__ROOT,
    },
    .event_handler = Root_handler,
    .vars_sizeof = sizeof(ButSm_Root_Vars),
  },

  [ButSm_StateId__ROOT__op__REPEAT] = {
    .name = "REPEAT", 
    .node = {
      .id = ButSm_StateId__ROOT__op__REPEAT,
      .max_descendant_id = ButSm_StateId__ROOT__op__REPEAT__BEING_HELD,
      .parent_id = ButSm_StateId__ROOT,
    },
    .event_handler = ROOT__op__REPEAT_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__REPEAT_Vars),
  },

  [ButSm_StateId__ROOT__op__REPEAT__NOT_HELD] = {
    .name = "NOT_HELD", 
    .node = {
      .id = ButSm_StateId__ROOT__op__REPEAT__NOT_HELD,
      .max_descendant_id = ButSm_StateId__ROOT__op__REPEAT__NOT_HELD,
      .parent_id = ButSm_StateId__ROOT__op__REPEAT,
    },
    .event_handler = ROOT__op__REPEAT__NOT_HELD_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__REPEAT__NOT_HELD_Vars),
  },

  [ButSm_StateId__ROOT__op__REPEAT__BEING_HELD] = {
    .name = "BEING_HELD", 
    .node = {
      .id = ButSm_StateId__ROOT__op__REPEAT__BEING_HELD,
      .max_descendant_id = ButSm_StateId__ROOT__op__REPEAT__BEING_HELD,
      .parent_id = ButSm_StateId__ROOT__op__REPEAT,
    },
    .event_handler = ROOT__op__REPEAT__BEING_HELD_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__REPEAT__BEING_HELD_Vars),
  },

  [ButSm_StateId__ROOT__op__BASIC] = {
    .name = "BASIC", 
    .node = {
      .id = ButSm_StateId__ROOT__op__BASIC,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG,
      .parent_id = ButSm_StateId__ROOT,
    },
    .event_handler = ROOT__op__BASIC_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__BASIC_Vars),
  },

  [ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED] = {
    .name = "NOT_PRESSED", 
    .node = {
      .id = ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED,
      .parent_id = ButSm_StateId__ROOT__op__BASIC,
    },
    .event_handler = ROOT__op__BASIC__NOT_PRESSED_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__BASIC__NOT_PRESSED_Vars),
  },

  [ButSm_StateId__ROOT__op__BASIC__PRESSED] = {
    .name = "PRESSED", 
    .node = {
      .id = ButSm_StateId__ROOT__op__BASIC__PRESSED,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG,
      .parent_id = ButSm_StateId__ROOT__op__BASIC,
    },
    .event_handler = ROOT__op__BASIC__PRESSED_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__BASIC__PRESSED_Vars),
  },

  [ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS] = {
    .name = "INITIAL_PRESS", 
    .node = {
      .id = ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS,
      .parent_id = ButSm_StateId__ROOT__op__BASIC__PRESSED,
    },
    .event_handler = ROOT__op__BASIC__PRESSED__INITIAL_PRESS_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__BASIC__PRESSED__INITIAL_PRESS_Vars),
  },

  [ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD] = {
    .name = "HELD", 
    .node = {
      .id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG,
      .parent_id = ButSm_StateId__ROOT__op__BASIC__PRESSED,
    },
    .event_handler = ROOT__op__BASIC__PRESSED__HELD_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__BASIC__PRESSED__HELD_Vars),
  },

  [ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT] = {
    .name = "HELD__PSEUDO_INIT", 
    .node = {
      .id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT,
      .parent_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD,
    },
    .event_handler = ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_Vars),
  },

  [ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG] = {
    .name = "HELD_LONG", 
    .node = {
      .id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG,
      .max_descendant_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG,
      .parent_id = ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD,
    },
    .event_handler = ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_handler,
    .vars_sizeof = sizeof(ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_Vars),
  },

};
const HsmState * const ButSm_Root_ref                                              = &states[ButSm_StateId__ROOT];
const HsmState * const ButSm_ROOT__op__REPEAT_ref                                  = &states[ButSm_StateId__ROOT__op__REPEAT];
const HsmState * const ButSm_ROOT__op__REPEAT__NOT_HELD_ref                        = &states[ButSm_StateId__ROOT__op__REPEAT__NOT_HELD];
const HsmState * const ButSm_ROOT__op__REPEAT__BEING_HELD_ref                      = &states[ButSm_StateId__ROOT__op__REPEAT__BEING_HELD];
const HsmState * const ButSm_ROOT__op__BASIC_ref                                   = &states[ButSm_StateId__ROOT__op__BASIC];
const HsmState * const ButSm_ROOT__op__BASIC__NOT_PRESSED_ref                      = &states[ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED];
const HsmState * const ButSm_ROOT__op__BASIC__PRESSED_ref                          = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED];
const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__INITIAL_PRESS_ref           = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS];
const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__HELD_ref                    = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD];
const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_ref = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT];
const HsmState * const ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_ref         = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG];


/************************************************************************************************
* STRUCT for ExampleSm 
************************************************************************************************/
const HsmTree ExampleSmTree = {
  .htree = {
    .nodes = (HTreeNode*)&states[0],
    .node_sizeof = sizeof(states[0]),
  },
  .name = "ExampleSm",
};


/************************************************************************************************
* Function to get state's temporary variables by ID
************************************************************************************************/
static HsmStateBaseVars* get_state_vars(Jxc* jxc, Hsm2* hsm, int id)
{
  (void)jxc; //remove compiler warning
  void* ptr = NULL;
  ButSm* sm = (ButSm*)hsm;
 
  switch(id){ 
    case ButSm_StateId__ROOT:
      ptr = &sm->root_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__REPEAT:
      ptr = &sm->root_vars.root__op__repeat_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__REPEAT__NOT_HELD:
      ptr = &sm->root_vars.root__op__repeat_vars.root__op__repeat__not_held_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__REPEAT__BEING_HELD:
      ptr = &sm->root_vars.root__op__repeat_vars.root__op__repeat__being_held_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__BASIC:
      ptr = &sm->root_vars.root__op__basic_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED:
      ptr = &sm->root_vars.root__op__basic_vars.root__op__basic__not_pressed_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__BASIC__PRESSED:
      ptr = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS:
      ptr = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__initial_press_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD:
      ptr = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__held_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT:
      ptr = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__held_vars.root__op__basic__pressed__held__held__pseudo_init_vars.base_vars;
      break;
      
    case ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG:
      ptr = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__held_vars.root__op__basic__pressed__held__held_long_vars.base_vars;
      break;
      
  }

  return ptr;
}

static void Root_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_Root_Vars* vars = &sm->root_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  //ON ButSm_InputEvent_EXIT
  if( ((event_id == ButSm_InputEvent_EXIT))  ){ 
    //loop through ortho kids and exit any of them that are still running
    Hsm_exit_okids(jxc, hsm, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts)); 
  }

  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    //setup orthogonal kid contexts
    Hsm_set_contexts_region_parent_id(jxc, hsm, this_state->node.id, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts));
    vars->orthoKidContexts[0].region_top_state_id = ButSm_StateId__ROOT__op__BASIC;
    vars->orthoKidContexts[1].region_top_state_id = ButSm_StateId__ROOT__op__REPEAT;      
    Hsm_handle_ortho_kids_enter(jxc, hsm, context, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts)); 
  }

  //Proxy events to orthogonal kids
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (Hsm_event_part_of_transition(event) == false)  ){ 
    Hsm_handle_ortho_kids_event(jxc, hsm, context, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts), event);
    vTRY_BUBBLE_EXCEPTION();
    
    //break if ortho kids triggered a transition above their level
    if (Hsm_is_transition_requested(context)) {
      return;
    }
    
    //this ortho parent state should only do something with the event if none of its ortho kids has handled it
    if (event->event_id == HsmEventId__DO) 
    {
      //ortho parent does the DO event like normal
      
    } 
    if (event->event_id == HsmEventId__DO || context->event_handled == false || event->event_id == HsmEventId__TEST_TRANSITIONS) 
    {
      //only handle events in parent state if kids hadn't already dealt with it
      
    }; 
  }

}

static void ROOT__op__REPEAT_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__REPEAT_Vars* vars = &sm->root_vars.root__op__repeat_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__REPEAT];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON ButSm_InputEvent_LANDED_IN
  if( ((event_id == ButSm_InputEvent_LANDED_IN))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__REPEAT__NOT_HELD);
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__op__REPEAT__NOT_HELD_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__REPEAT__NOT_HELD_Vars* vars = &sm->root_vars.root__op__repeat_vars.root__op__repeat__not_held_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__REPEAT__NOT_HELD];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //if is_held
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (sm->output_values.is_held)  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__REPEAT__BEING_HELD);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__op__REPEAT__BEING_HELD_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__REPEAT__BEING_HELD_Vars* vars = &sm->root_vars.root__op__repeat_vars.root__op__repeat__being_held_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__REPEAT__BEING_HELD];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //if is_not_pressed
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (sm->output_values.is_not_pressed)  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__REPEAT__NOT_HELD);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

  
  //if (time_in_state >= repeat_delay )
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( ((time_in_state >= sm->input_values.repeat_delay_ms ))  ){ 
    sm->output_events.HELD_REPEAT = true; 
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__REPEAT__BEING_HELD);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__op__BASIC_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__BASIC_Vars* vars = &sm->root_vars.root__op__basic_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__BASIC];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON ButSm_InputEvent_LANDED_IN
  if( ((event_id == ButSm_InputEvent_LANDED_IN))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED);
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}

static void ROOT__op__BASIC__NOT_PRESSED_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__BASIC__NOT_PRESSED_Vars* vars = &sm->root_vars.root__op__basic_vars.root__op__basic__not_pressed_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->vars.debounced_at_ms = current_time + 100; 
  }

  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->output_values.time_held = 0; 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //if input == 1 && is_debounced( )
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (sm->input_values.input == 1 && (current_time >= sm->vars.debounced_at_ms))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__op__BASIC__PRESSED_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__BASIC__PRESSED_Vars* vars = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON ButSm_InputEvent_EXIT
  if( ((event_id == ButSm_InputEvent_EXIT))  ){ 
    sm->output_events.RELEASED = true; 
  }

  
  //ON ButSm_InputEvent_EXIT
  if( ((event_id == ButSm_InputEvent_EXIT))  ){ 
    sm->output_values.is_pressed = false; 
  }

  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->output_events.PRESSED = true; 
  }

  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->output_values.is_pressed = true; 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //if input == 0 && is_debounced( )
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (sm->input_values.input == 0 && (current_time >= sm->vars.debounced_at_ms))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__op__BASIC__PRESSED__INITIAL_PRESS_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__BASIC__PRESSED__INITIAL_PRESS_Vars* vars = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__initial_press_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__INITIAL_PRESS];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->vars.debounced_at_ms = current_time + 100; 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //if (time_in_state >= 500)
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( ((time_in_state >= 500))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

  
  //if input == 0 && is_debounced( )
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( (sm->input_values.input == 0 && (current_time >= sm->vars.debounced_at_ms))  ){ 
    sm->output_events.PRETAP = true; 
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__BASIC__NOT_PRESSED);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__op__BASIC__PRESSED__HELD_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__BASIC__PRESSED__HELD_Vars* vars = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__held_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON ButSm_InputEvent_EXIT
  if( ((event_id == ButSm_InputEvent_EXIT))  ){ 
    sm->output_values.is_held = false; 
  }

  
  //ON ButSm_InputEvent_EXIT
  if( ((event_id == ButSm_InputEvent_EXIT))  ){ 
    sm->output_values.time_held = 0; 
  }

  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->output_events.HELD = true; 
  }

  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->output_values.is_held = true; 
  }

  
  //ON ButSm_InputEvent_LANDED_IN
  if( ((event_id == ButSm_InputEvent_LANDED_IN))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT);
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //ON ButSm_InputEvent_DO
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( ((event_id == ButSm_InputEvent_DO))  ){ 
    sm->output_values.time_held = time_in_state; 
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT_Vars* vars = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__held_vars.root__op__basic__pressed__held__held__pseudo_init_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD__PSEUDO_INIT];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

  
  //if (time_in_state >= 500)
  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
  if( ((time_in_state >= 500))  ){  
    Hsm_mark_transition_request(jxc, hsm, context, this_state, ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG);
    //mark that event has handled
    context->event_handled = default_event_handled_value;
  }

}

static void ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_handler(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  event_handler_breakpoint(jxc, hsm, context, event);
  ButSm* sm = (ButSm*)hsm;
  ButSm_ROOT__op__BASIC__PRESSED__HELD__HELD_LONG_Vars* vars = &sm->root_vars.root__op__basic_vars.root__op__basic__pressed_vars.root__op__basic__pressed__held_vars.root__op__basic__pressed__held__held_long_vars;
  const HsmState* this_state = &states[ButSm_StateId__ROOT__op__BASIC__PRESSED__HELD__HELD_LONG];
  uint32_t current_time = get_general_ms_counts();
  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
  const ButSm_InputEvent event_id = event->event_id;
  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    
  
  //ON ButSm_InputEvent_EXIT
  if( ((event_id == ButSm_InputEvent_EXIT))  ){ 
    sm->output_values.is_held_long = false; 
  }

  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->output_events.HELD_LONG = true; 
  }

  
  //ON ButSm_InputEvent_ENTER
  if( ((event_id == ButSm_InputEvent_ENTER))  ){ 
    sm->output_values.is_held_long = true; 
  }

  //------------- END OF TRANSITION HANDLERS --------------------
  if (Hsm_event_part_of_transition(event)) { 
    return; 
  }    

}


/************************************************************************************************
* Public class initialization function for ExampleSm state machine.
************************************************************************************************/




/************************************************************************************************
* Public constructor function for ExampleSm state machine
************************************************************************************************/
void ButSm_instance_init(Jxc* jxc, ButSm* sm, const char * instance_name)
{
  vTRY_BUBBLE_EXCEPTION();
  sm->hsm.instance_name = instance_name;
  sm->hsm.tree = &ExampleSmTree;
  sm->hsm.get_state_vars = get_state_vars;
  //sm->hsm.listener = &hsmListener;
  Hsm_construct(jxc, &sm->hsm);      
}



/************************************************************************************************
* Function called after state machine event dispatch
************************************************************************************************/
static void execute_after_dispatch(Jxc* jxc, ButSm* sm, const HsmEvent* event)
{
  vTRY_BUBBLE_EXCEPTION();
  Hsm2* hsm = &sm->hsm;
  (void)hsm; (void)jxc; (void)event;
  sm->output_values.is_not_pressed = !sm->output_values.is_pressed;
}



/************************************************************************************************
* Private dispatch event function for ExampleSm state machine
************************************************************************************************/
static void dispatch_event(Jxc* jxc, ButSm* sm, const HsmEvent* event)
{
  vTRY_BUBBLE_EXCEPTION();
  //Note: no code to run before state machine event dispatch
  Hsm_dispatch_event(jxc, &sm->hsm, event);
  execute_after_dispatch(jxc, sm, event);
}



/************************************************************************************************
* Public step function for ExampleSm state machine
************************************************************************************************/
void ButSm_step(Jxc* jxc, ButSm* sm)
{
  vTRY_BUBBLE_EXCEPTION();
  ButSm_dispatch_event(jxc, sm, HsmEventId__DO);
}



/************************************************************************************************
* Public test transitions function for ExampleSm state machine
************************************************************************************************/
void ButSm_test_transitions(Jxc* jxc, ButSm* sm, uint8_t dispatch_count)
{
  vTRY_BUBBLE_EXCEPTION();
  for (uint8_t i = 0; i < dispatch_count; i++){
    ButSm_dispatch_event(jxc, sm, HsmEventId__TEST_TRANSITIONS);
  }
}



/************************************************************************************************
* Public dispatch event function for ExampleSm state machine
************************************************************************************************/
void ButSm_dispatch_event(Jxc* jxc, ButSm* sm, ButSm_InputEvent event_id)
{
  vTRY_BUBBLE_EXCEPTION();
  HsmEvent event = { .event_id = event_id };
  dispatch_event(jxc, sm, &event);
}



/************************************************************************************************
* Public function to dispatch event upon a condition
************************************************************************************************/
void ButSm_dispatch_if(Jxc* jxc, ButSm* sm, bool condition, HsmEventId event_id)
{
  vTRY_BUBBLE_EXCEPTION();
  if(condition)
  {
    ButSm_dispatch_event(jxc, sm, event_id);

  }
}


/************************************************************************************************
* Function that translates a custom input event ID to a string
* NOTE: actual passed in enum values should be from 'ButSm_InputEvent'
************************************************************************************************/
const char* ButSm_InputEvent_to_string(HsmEventId event_id)
{
  const char * str;
  switch(event_id)
  {
    //no custom input events defined for this state machine
    default: str = "??CUSTOM"; break;
  }

  return str;
}


/************************************************************************************************
* Function that prints all input_values
************************************************************************************************/
void ButSm_print_input_values(ButSm* sm)
{
  //TODOLOW update generator to implement this feature
  (void)sm;
  //hsm_print_debug_msg(&sm->hsm, 0, "input_values: input = %"PRIu8", repeat_delay_ms = %"PRIu16"", sm->input_values.input, sm->input_values.repeat_delay_ms);
};



/************************************************************************************************
* Function that prints all output_values
************************************************************************************************/
void ButSm_print_output_values(ButSm* sm)
{
  //TODOLOW update generator to implement this feature
  (void)sm;
  //hsm_print_debug_msg(&sm->hsm, 0, "output_values: is_not_pressed = %"PRIu8", is_pressed = %"PRIu8", is_held = %"PRIu8", is_held_long = %"PRIu8", time_held = %"PRIu32"", sm->output_values.is_not_pressed, sm->output_values.is_pressed, sm->output_values.is_held, sm->output_values.is_held_long, sm->output_values.time_held);
};



/************************************************************************************************
* Function that prints all output_events
************************************************************************************************/
void ButSm_print_output_events(ButSm* sm)
{
  //TODOLOW update generator to implement this feature
  (void)sm;
  //hsm_print_debug_msg(&sm->hsm, 0, "output_events: RELEASED = %"PRIu8", PRESSED = %"PRIu8", HELD = %"PRIu8", HELD_LONG = %"PRIu8", PRETAP = %"PRIu8", HELD_REPEAT = %"PRIu8"", sm->output_events.RELEASED, sm->output_events.PRESSED, sm->output_events.HELD, sm->output_events.HELD_LONG, sm->output_events.PRETAP, sm->output_events.HELD_REPEAT);
};




/************************************************************************************************
* Function that clears all output_events
************************************************************************************************/
void ButSm_clear_output_events(Jxc* jxc, ButSm* sm)
{
  (void)jxc; (void)sm;
  vTRY_BUBBLE_EXCEPTION();
  sm->output_events.RELEASED = 0;
  sm->output_events.PRESSED = 0;
  sm->output_events.HELD = 0;
  sm->output_events.HELD_LONG = 0;
  sm->output_events.PRETAP = 0;
  sm->output_events.HELD_REPEAT = 0;
};
