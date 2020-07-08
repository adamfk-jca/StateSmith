#include "hsm2.h"
#include <stdbool.h>
#include "ExecContext.h"
#include <string.h>
#include "MemBuffer.h"
#include <stdio.h>
#include "common_macros.h"

/*

TODO: 

  Need to create a function to see if a state is active
    -> requires traversing ortho tree



Design decisions:

- by default, child consumes event.
- the "DO" event is not consumed by child and is sent all the way up tree-

- Specify function pointer because we already know it and it's easier to step through code
and easier to follow relations in code.
- Specify ID so framework can provide detailed information like full state name ROOT>Blah>blah>Hot_State
and also so that it can figure out which entry/exit handlers to fire when transitioning.
ex: LET_PARENT_HANDLE_EVENT(ROOT__event_handler, HsmButHeld_StateId_ROOT );
ex: SET_TRANSITION_TO(NOT_HELD__event_handler, HsmButHeld_StateId_NOT_HELD);


Implement "landed in" equivalent by checking context for current state against state handling event

Make property in state struct boolean is_ortho_parent
- TODOLOW remove?

need to update this: Would be nice if Terminated/finished state was an actual state so we could track


Code generated needs to account for two scenarios:
1) root state isn't not an orthogonal parent
use as normal
2) root state IS an orthogonal parent
requires contexts for children and different handling.
*/

void Hsm_construct(Jxc* jxc, Hsm2* hsm)
{
  vTRY_BUBBLE_EXCEPTION();

  const HsmState* root = Hsm_getStateFromId(jxc, hsm, HTree_NodeId__ROOT);
  vTRY_BUBBLE_EXCEPTION();

  HsmContext* context = &hsm->root_context;

  context->region_parent_id = HTree_NodeId_MAX_NODE_ID; //set to ID that should never occur
  context->region_top_state_id = HTree_NodeId__ROOT;
  context->current_state = root;
  context->transition_to = root;
  context->transition_completed = false;
  
  _Hsm_send_event_directly_to_state(jxc, hsm, context, &Hsm_EnterEvent, root);
  vTRY_BUBBLE_EXCEPTION();

  _Hsm_complete_transition(jxc, hsm, context);
  vTRY_BUBBLE_EXCEPTION();

  if (context->transition_to != NULL)
  {
    //handle transition
    Hsm_finish_transition_request(jxc, hsm, context);
    vTRY_BUBBLE_EXCEPTION();
  }
}



const HsmState* hTreeNode_to_HsmState(HTreeNode const * htreeNode)
{
  const HsmState* hsmState = (HsmState const *)htreeNode;
  return hsmState;
}

const HsmState* Hsm_getStateFromId(Jxc* jxc, Hsm2 const * const hsm, HsmStateId id)
{
  SET_DEFAULT_RETURN(HsmState*, NULL);
  TRY_BUBBLE_EXCEPTION();
  const HTreeNode* node = HTree_getNodeFromId(jxc, &hsm->tree->htree, id);
  TRY_BUBBLE_EXCEPTION();
  const HsmState* state = hTreeNode_to_HsmState(node);
  return state;
}

int16_t Hsm2_getStateCount(Hsm2* hsm)
{
  int16_t result = HTree_getNodeCount(&hsm->tree->htree);
  return result;
}

//silly just use node property
//const HTreeNode * hsmState_to_hTreeNode(HsmState const * hsmState)
//{
//  const HTreeNode * hsmState = (const HTreeNode*)hsmState;
//  return hsmState;
//}

HsmState const * Hsm_getParentState(Jxc* jxc, Hsm2 const * const hsm, HsmState const * const state)
{
  SET_DEFAULT_RETURN_TO_NULL();
  TRY_BUBBLE_EXCEPTION();
  HTreeNode const * parent_node = HTree_getParent(jxc, &hsm->tree->htree, &state->node);
  TRY_BUBBLE_EXCEPTION();
  HsmState const * parent_state = hTreeNode_to_HsmState(parent_node);
  return parent_state;
}

void _Hsm_set_context_current_state_by_id(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmStateId id)
{
  vTRY_BUBBLE_EXCEPTION();
  const HsmState* state = Hsm_getStateFromId(jxc, hsm, id);
  vTRY_BUBBLE_EXCEPTION();
  context->current_state = state;
}

/**
* Looks through children and finds the appropriate one to transition to
*/
const HsmState* Hsm_find_next_state_towards_target(Jxc* jxc, Hsm2* hsm, HsmContext* context)
{
  SET_DEFAULT_RETURN_TO_NULL();
  TRY_BUBBLE_EXCEPTION();

  const HsmState* state = _Hsm_getFirstChild(jxc, hsm, context->current_state);
  TRY_BUBBLE_EXCEPTION();

  //keep going to next child until one of them is or contains the desired state
  while (state != NULL && Hsm_isSameOrDescendant(jxc, hsm, state, context->transition_to) == false)
  {
    TRY_BUBBLE_EXCEPTION();
    state = _Hsm_getNextSibling(jxc, hsm, state);
    TRY_BUBBLE_EXCEPTION();
  }

  THROW_IF(state == NULL, ErrId__HSM_NO_PATH_FOUND);

  return state;
}

const HsmState* Hsm_find_next_state_from_to(Jxc* jxc, Hsm2* hsm, const HsmState* from, const HsmState* to)
{
  SET_DEFAULT_RETURN_TO_NULL();
  TRY_BUBBLE_EXCEPTION();

  const HsmState* state = _Hsm_getFirstChild(jxc, hsm, from);
  TRY_BUBBLE_EXCEPTION();

  while (state != NULL && Hsm_isSameOrDescendant(jxc, hsm, state, to) == false)
  {
    TRY_BUBBLE_EXCEPTION();
    state = _Hsm_getNextSibling(jxc, hsm, state);
    TRY_BUBBLE_EXCEPTION();
  }

  THROW_IF(state == NULL, ErrId__HSM_NO_PATH_FOUND);

  return state;
}

/**
* Returns NULl if no children
*/
const HsmState * _Hsm_getNextSibling(Jxc* jxc, Hsm2* hsm, const HsmState* state)
{
  SET_DEFAULT_RETURN_TO_NULL();
  TRY_BUBBLE_EXCEPTION();
  (void)hsm; //TODOLOW cleanup
  const HTreeNode* node = HTree_getNextSiblingRaw(&hsm->tree->htree, &state->node);
  const HsmState* sibling_state = hTreeNode_to_HsmState(node);
  return sibling_state;
}

const HsmState * _Hsm_getFirstChild(Jxc* jxc, Hsm2* hsm, const HsmState* state)
{  
  SET_DEFAULT_RETURN_TO_NULL();
  TRY_BUBBLE_EXCEPTION();
  (void)hsm; //TODOLOW cleanup
  const HTreeNode* node = HTree_getFirstChildRaw(&hsm->tree->htree, &state->node);
  const HsmState* sibling_state = hTreeNode_to_HsmState(node);
  return sibling_state;
}

bool Hsm_isCurrentStateSameOrDescendant(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor)
{
  SET_DEFAULT_RETURN(bool, false);
  TRY_BUBBLE_EXCEPTION();
  bool result = Hsm_isSameOrDescendant(jxc, hsm, potential_ancestor, hsm->root_context.current_state);
  TRY_BUBBLE_EXCEPTION();
  return result;
}

bool Hsm_isCurrentStateSameOrDescendantById(Jxc* jxc, Hsm2* hsm, const HsmStateId potential_ancestor_id)
{
  SET_DEFAULT_RETURN(bool, false);
  TRY_BUBBLE_EXCEPTION();
  const HsmState* potential_ancestor = Hsm_getStateFromId(jxc, hsm, potential_ancestor_id);
  bool result = Hsm_isSameOrDescendant(jxc, hsm, potential_ancestor, hsm->root_context.current_state);
  TRY_BUBBLE_EXCEPTION();
  return result;
}

bool Hsm_isSameOrDescendantById(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor, const HsmStateId a_state_id)
{
  SET_DEFAULT_RETURN(bool, false);
  TRY_BUBBLE_EXCEPTION();

  const HsmState* state = Hsm_getStateFromId(jxc, hsm, a_state_id);
  TRY_BUBBLE_EXCEPTION();
  bool result = HTree_isSameOrDescendant(&potential_ancestor->node, &state->node);
  return result;
}

bool Hsm_isSameOrDescendant(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor, const HsmState* a_state)
{
  (void)hsm; //TODOLOW cleanup
  SET_DEFAULT_RETURN(bool, false);
  TRY_BUBBLE_EXCEPTION(); 

  bool result = HTree_isSameOrDescendant(&potential_ancestor->node, &a_state->node);
  return result;
}

bool _Hsm_isDescendant(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor, const HsmState* a_state)
{
  SET_DEFAULT_RETURN(bool, false);
  TRY_BUBBLE_EXCEPTION();
  (void)hsm; //TODOLOW cleanup
  bool result = HTree_isDescendant(&potential_ancestor->node, &a_state->node);
  return result;
}

/**
 * Starts at current_node and looks at kids to find target.
 * Also fires Landed IN event.
 */
void _Hsm_walk_towards_target(Jxc* jxc, Hsm2* hsm, HsmContext* context)
{
  while (context->transition_completed == false)
  {
    vTRY_BUBBLE_EXCEPTION();
    const HsmState* state = Hsm_find_next_state_towards_target(jxc, hsm, context);
    vTRY_BUBBLE_EXCEPTION();

    context->current_state = state;

    //enter the new state
    _Hsm_send_event_directly_to_current_state(jxc, hsm, context, &Hsm_EnterEvent);
    vTRY_BUBBLE_EXCEPTION();

    //figure out if we have completed the transition now
    if (context->transition_to == context->current_state) {
      context->transition_completed = true;  //TODOLOW use context.eventHandled instead?
    }
  }

  _Hsm_complete_transition(jxc, hsm, context);
  //vTRY_BUBBLE_EXCEPTION(); //don't need to bubble as it is already at the bottom
}

void Hsm_handle_ortho_kids_event(Jxc* jxc, Hsm2* hsm, HsmContext * context, HsmContext* orthoKidContexts, int oKidCount, const HsmEvent* event)
{
  vTRY_BUBBLE_EXCEPTION();

  //fire events to kids
  for (int i = 0; i < oKidCount && context->transition_to == NULL; i++)
  {
    HsmContext* oCtx = &orthoKidContexts[i];

    _Hsm_dispatch_event(jxc, hsm, oCtx, event);
    vTRY_BUBBLE_EXCEPTION();

    //if at least one kid handles event, then we consider it handled
    if (oCtx->event_handled) {
      context->event_handled = true;
    }

    //handle ortho kid transition requests
    if (oCtx->transition_to != NULL)
    {
      //handle transition
      Hsm_finish_transition_request(jxc, hsm, oCtx);
      vTRY_BUBBLE_EXCEPTION();

      //if oCtx current state is this state, this parent state needs to figure out what to do
      if (oCtx->current_state->node.id == oCtx->region_parent_id)
      {
        const HsmState* this_state = Hsm_getStateFromId(jxc, hsm, oCtx->region_parent_id);
        vTRY_BUBBLE_EXCEPTION();

        //3 possibilities: 1) it is transitioning back to ortho parent, 2) it wants to transition beyond parent, 3) it wants to transition to an ortho sibling which is strange
        //in either case, all other kids needs to be exited
        Hsm_exit_okids(jxc, hsm, orthoKidContexts, oKidCount);
        vTRY_BUBBLE_EXCEPTION();

        //if transition_to is a descendant of this state, we know it's between ortho regions
        //we could fire this states entry event and allow transition
        if (_Hsm_isDescendant(jxc, hsm, this_state, oCtx->transition_to))
        {
          vTHROW_EXCEPTION(ErrId__HSM_ORTHO_SIBLING_TX);
        }
        vTRY_BUBBLE_EXCEPTION();

        //mark parent context
        //context->transition_to = oCtx->transition_to; BUG! need to actually make the request so that the transition_complete flag gets set as well!
        Hsm_mark_transition_request(jxc, hsm, context, context->current_state, oCtx->transition_to->node.id);
        vTRY_BUBBLE_EXCEPTION();
      }
    }
  }
}

void Hsm_exit_okids(Jxc* jxc, Hsm2* hsm, HsmContext* oKidContexts, int oKidCount)
{
  vTRY_BUBBLE_EXCEPTION();

  for (int i = 0; i < oKidCount; i++)
  {
    HsmContext* oKidContext = &oKidContexts[i];
    Hsm_exit_okid(jxc, hsm, oKidContext);
    vTRY_BUBBLE_EXCEPTION();
  }
}

void Hsm_exit_okid(Jxc* jxc, Hsm2* hsm, HsmContext* oKidContext)
{
  vTRY_BUBBLE_EXCEPTION();

  if (oKidContext->running)
  {
    //set it to transition to root knowing that it will stop at region parent
    oKidContext->transition_to = Hsm_getStateFromId(jxc, hsm, HTree_NodeId__ROOT);
    vTRY_BUBBLE_EXCEPTION();

    Hsm_finish_transition_request(jxc, hsm, oKidContext);
    vTRY_BUBBLE_EXCEPTION();
  }
}

void Hsm_set_contexts_region_parent_id(Jxc* jxc, Hsm2* hsm, HsmStateId region_parent_id, HsmContext* oKidContexts, int oKidCount)
{
  vTRY_BUBBLE_EXCEPTION();
  (void)hsm; //TODOLOW cleanup
  
  //loop through ortho kids
  for (int i = 0; i < oKidCount; i++)
  {
    HsmContext* oKidContext = &oKidContexts[i];
    oKidContext->region_parent_id = region_parent_id;
  }
}

void Hsm_handle_ortho_kids_enter(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmContext* oKidContexts, int oKidCount)
{
  vTRY_BUBBLE_EXCEPTION();

  //loop through ortho kids
  for (int i = 0; i < oKidCount; i++)
  {
    HsmContext* oKidContext = &oKidContexts[i];
    _Hsm_handle_ortho_kid_enter(jxc, hsm, context, oKidContext);
    vTRY_BUBBLE_EXCEPTION();
  }
}


void _Hsm_handle_ortho_kid_enter(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmContext* oKidContext)
{
  vTRY_BUBBLE_EXCEPTION();

  //have it start in correct state
  HsmStateId okid_top_state_id = oKidContext->region_top_state_id;
  _Hsm_set_context_current_state_by_id(jxc, hsm, oKidContext, okid_top_state_id);
  vTRY_BUBBLE_EXCEPTION();

  //copy over so kid knows where we are trying to get to
  oKidContext->transition_to = context->transition_to;

  //send enter event
  _Hsm_send_event_directly_to_current_state(jxc, hsm, oKidContext, &Hsm_EnterEvent);
  vTRY_BUBBLE_EXCEPTION();

  //determine if ortho child completed desired transition
  if (oKidContext->transition_to->node.id == okid_top_state_id || oKidContext->transition_completed)
  {
    context->transition_completed = true;  //TODOLOW use context.eventHandled instead?
    _Hsm_complete_transition(jxc, hsm, oKidContext);
    vTRY_BUBBLE_EXCEPTION();
  }
  else
  {
    //ortho child did not complete transition, try walking towards it until complete
    bool oKid_contains_target = HTree_isDescendantById(jxc, &hsm->tree->htree, okid_top_state_id, context->transition_to->node.id);
    vTRY_BUBBLE_EXCEPTION();

    if (oKid_contains_target)
    {
      _Hsm_walk_towards_target(jxc, hsm, oKidContext);
      vTRY_BUBBLE_EXCEPTION();
      _Hsm_complete_transition(jxc, hsm, context);      //we know that it must have reached it's target because it walked towards it above.
      vTRY_BUBBLE_EXCEPTION();
    }
    else
    {
      _Hsm_complete_transition(jxc, hsm, oKidContext);
      vTRY_BUBBLE_EXCEPTION();
    }
  }

  //handle ortho kid transition requests
  if (oKidContext->transition_to != NULL)
  {
    //handle transition
    Hsm_finish_transition_request(jxc, hsm, oKidContext);
    vTRY_BUBBLE_EXCEPTION();
  }
}


void _Hsm_send_event_directly_to_current_state(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmEvent const * event)
{
  vTRY_BUBBLE_EXCEPTION();

  _Hsm_send_event_directly_to_state(jxc, hsm, context, event, context->current_state);
}


static void notify_event_listener(Hsm2* hsm, HsmContext* context, const HsmState* state, const HsmEvent * event, bool pre_event)
{
  if (hsm->listener != NULL) {
    if (hsm->listener->event_listener != NULL) {
      hsm->listener->event_listener(hsm, context, state, event, pre_event);
    }
  }
}

static void notify_transition_request_listener(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id, bool accepted)
{
  if (hsm->listener != NULL) {
    if (hsm->listener->transition_request_listener != NULL) {
      hsm->listener->transition_request_listener(hsm, context, requesting_state, desired_state_id, accepted);
    }
  }
}


void _Hsm_send_event_directly_to_state(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent * event, const HsmState * state)
{
  vTRY_BUBBLE_EXCEPTION();
  bool pre_event;

  //pre handler
  switch (event->event_id) {
    case HsmEventId__ENTER:
    {
      HsmStateBaseVars* base_vars = hsm->get_state_vars(jxc, hsm, state->node.id);
      vTRY_BUBBLE_EXCEPTION();

      memset(base_vars, 0, state->vars_sizeof);
      uint32_t time = get_general_ms_counts();  //TODO refactor out
      base_vars->time_state_entered = time;

      //determine if HSM is running or not
      const HsmState* top_state = Hsm_getStateFromId(jxc, hsm, context->region_top_state_id);
      vTRY_BUBBLE_EXCEPTION();

      if (Hsm_isSameOrDescendant(jxc, hsm, top_state, state)) {
        context->running = true;
      }
      vTRY_BUBBLE_EXCEPTION();

    }break;
  }

  pre_event = true;
  notify_event_listener(hsm, context, state, event, pre_event);

  vTRY_BUBBLE_EXCEPTION();
  state->event_handler(jxc, hsm, context, event);
  //TODOH TODO HIGH - consider "catching" all exceptions here instead of allowing to bubble up. Needs thought.
  vTRY_BUBBLE_EXCEPTION(); //TODO allow event listener

  pre_event = false;
  notify_event_listener(hsm, context, state, event, pre_event);


  //post handler
  switch (event->event_id) {
    case HsmEventId__EXIT:
    {
      HsmStateBaseVars* base_vars = hsm->get_state_vars(jxc, hsm, state->node.id);
      vTRY_BUBBLE_EXCEPTION();
      memset(base_vars, 0, state->vars_sizeof);

      //if this context has just exited it's top state, it is no longer running
      if (context->region_top_state_id == state->node.id)
      {
        context->running = false;
      }
    }break;
  }
}

bool Hsm_is_transition_requested(HsmContext* context)
{
  bool is_requested = context->transition_to != NULL;
  return is_requested;
}

void Hsm_mark_transition_request(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id)
{
  vTRY_BUBBLE_EXCEPTION();

  bool accepted;

  if (context->transition_to != NULL) {
    accepted = false;
    notify_transition_request_listener(hsm, context, requesting_state, desired_state_id, accepted);
    vTHROW_EXCEPTION(ErrId__HSM_UNEXPECTED); //TODOLOW make more explicit error id
  } else {
    accepted = true;
  }

  const HsmState* state = Hsm_getStateFromId(jxc, hsm, desired_state_id);
  vTRY_BUBBLE_EXCEPTION();
  context->transition_completed = false;
  context->transition_to = state;

  notify_transition_request_listener(hsm, context, requesting_state, desired_state_id, accepted);
}


void Hsm_finish_transition_request(Jxc* jxc, Hsm2* hsm, HsmContext* context)
{
  vTRY_BUBBLE_EXCEPTION();

  vTHROW_IF(context->transition_to == NULL, ErrId__HSM_UNEXPECTED); //TODOLOW make more explicit error id

  //special case for when target == current, fire exit and then enter
  if (context->current_state == context->transition_to) {
    //fire exit event
    _Hsm_send_event_directly_to_current_state(jxc, hsm, context, &Hsm_ExitEvent);
    vTRY_BUBBLE_EXCEPTION();
  }
  else
  {
    //target != current 
    //continue exiting while current state does not contain target
    while (Hsm_isSameOrDescendant(jxc, hsm, context->current_state, context->transition_to) == false)
    {
      //fire exit event
      _Hsm_send_event_directly_to_current_state(jxc, hsm, context, &Hsm_ExitEvent);
      vTRY_BUBBLE_EXCEPTION();

      //get parent
      context->current_state = Hsm_getParentState(jxc, hsm, context->current_state);
      vTRY_BUBBLE_EXCEPTION();

      //don't try to exit if we have left region and are at region parent
      if ((context->current_state->node.id == context->region_parent_id) ) //&& ( context != &hsm->root_context )
      {
        return; //TODOLOW make code nicer :)
      }
    }
    vTRY_BUBBLE_EXCEPTION();
  }

  if (context->current_state == context->transition_to)
  {
    //TODOH: fire transition action if applicable
    _Hsm_send_event_directly_to_current_state(jxc, hsm, context, &Hsm_EnterEvent);
    vTRY_BUBBLE_EXCEPTION();
    _Hsm_complete_transition(jxc, hsm, context);
    vTRY_BUBBLE_EXCEPTION();
  }
  else
  {
    //start walking downwards to target firing enter event
    _Hsm_walk_towards_target(jxc, hsm, context);
    vTRY_BUBBLE_EXCEPTION();
  }
}

/**
 * Clears transition and fires landed in event
 */
void _Hsm_complete_transition(Jxc* jxc, Hsm2* hsm, HsmContext* context)
{
  _Hsm_clear_transition(jxc, hsm, context);
  vTRY_BUBBLE_EXCEPTION();
  _Hsm_send_event_directly_to_current_state(jxc, hsm, context, &Hsm_LandedInEvent);
  vTRY_BUBBLE_EXCEPTION();
}

void _Hsm_clear_transition(Jxc* jxc, Hsm2* hsm, HsmContext* context)
{
  (void)jxc; (void)hsm; //TODOLOW cleanup
  context->transition_completed = true;
  context->transition_to = NULL;
}

void _Hsm_dispatch_event(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)
{
  vTRY_BUBBLE_EXCEPTION();

  context->event_handled = false;

  bool is_do_event = (event->event_id == HsmEventId__DO);

  //send event from current child all the way up until handled
  HsmState const * state;

  state = context->current_state;

  while (true)
  {
    _Hsm_send_event_directly_to_state(jxc, hsm, context, event, state);
    vTRY_BUBBLE_EXCEPTION();

    //stop if a transition has been requested
    if (context->transition_to != NULL) {
      break;
    }

    //stop if event handled
    if (context->event_handled && !is_do_event) {
      break;
    }

    //stop if already at root and dealing with root context
    if (context == &hsm->root_context && state->node.id == HTree_NodeId__ROOT) {
      break;
    }

    state = Hsm_getParentState(jxc, hsm, state);
    vTRY_BUBBLE_EXCEPTION();

    //stop if already at region root
    //must stop here otherwise will cause infinite loop
    if (state->node.id == context->region_parent_id) {
      break;
    }
  }
}


void Hsm2_step(Jxc* jxc, Hsm2* hsm)
{
  vTRY_BUBBLE_EXCEPTION();
  Hsm_dispatch_event(jxc, hsm, &Hsm_DoEvent);
}

void Hsm_dispatch_event(Jxc* jxc, Hsm2* hsm, const HsmEvent* event)
{
  HsmContext* context = &hsm->root_context;
  //const HsmState* rootState = Hsm_getStateFromId(jxc, hsm, HTree_NodeId__ROOT);

  _Hsm_dispatch_event(jxc, hsm, context, event);
  vTRY_BUBBLE_EXCEPTION();
  
  if (context->transition_to != NULL)
  {
    //handle transition
    Hsm_finish_transition_request(jxc, hsm, context);
    vTRY_BUBBLE_EXCEPTION();
  }

  //_Hsm_send_event_directly_to_current_state(jxc, hsm, &hsm->root_context, event);
}


const HsmEvent Hsm_EnterEvent = {
  .event_id = HsmEventId__ENTER,
};

const HsmEvent Hsm_LandedInEvent = {
  .event_id = HsmEventId__LANDED_IN,
};

const HsmEvent Hsm_ExitEvent = {
  .event_id = HsmEventId__EXIT,
};

const HsmEvent Hsm_DoEvent = {
  .event_id = HsmEventId__DO,
};

bool Hsm_event_part_of_transition(const HsmEvent * event) {
  bool is_part_of_transition = false;;
  switch (event->event_id) {
    case HsmEventId__ENTER:
    case HsmEventId__LANDED_IN:
    case HsmEventId__EXIT:
      is_part_of_transition = true;
      break;
  }
  return is_part_of_transition;
}


const char* Hsm_event_to_string(const HsmEventId event_id, const char* default_str)
{
  switch (event_id)
  {
    case HsmEventId__ENTER:             return "ENTER";
    case HsmEventId__LANDED_IN:         return "LANDED_IN";
    case HsmEventId__DO:                return "DO";
    case HsmEventId__EXIT:              return "EXIT";
    case HsmEventId__TEST_TRANSITIONS:  return "TEST_TRANSITIONS";
  }

  return default_str;
}
