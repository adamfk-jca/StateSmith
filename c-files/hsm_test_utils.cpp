/*
 This file alleviates the pain of having to create a bunch of global event listeners
 with global data all over the place. Now you can use normal C++ class listeners
 without all the global hacks spread everywhere.

 This wouldn't be needed if JIRA STATE-50 ticket were implemented. Then the class instance
 could be passed along as a void*.
*/

#include "hsm_test_utils.hpp"

#include <list>
#include <set>
using std::list;
using std::set;

static void routing_event_listener(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event);
static void routing_transition_request_listener(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id, bool accepted);

class RoutingListener;

static map<Hsm2*, RoutingListener> registered_listeners;


class RoutingListener {
public:
  Hsm2* hsm = nullptr;
  HsmListener hsm_listener;
  set<HsmCppListener*> cpp_listeners;

  void add_cpp_listener(Hsm2* hsm, HsmCppListener* listener)
  {
    this->hsm = hsm; //TODOLOW throw if different
    if (hsm->listener == nullptr) {
      hsm->listener = &hsm_listener;
      hsm_listener.event_listener = routing_event_listener;
      hsm_listener.transition_request_listener = routing_transition_request_listener;
    }
    cpp_listeners.insert(listener);
  }

  void remove_cpp_listener(HsmCppListener* listener)
  {
    cpp_listeners.erase(listener);
  }

  void notify_event_listeners(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event)
  {
    for (auto cpp_listener : cpp_listeners) {
      cpp_listener->event_listen(hsm, context, state, event, pre_event);
    }
  }

  void notify_transition_request_listeners(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id, bool accepted)
  {
    for (auto cpp_listener : cpp_listeners) {
      cpp_listener->transition_request_listen(hsm, context, requesting_state, desired_state_id, accepted);
    }
  }
};



static void routing_event_listener(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event)
{
  RoutingListener& routing_listener = registered_listeners[hsm];
  routing_listener.notify_event_listeners(hsm, context, state, event, pre_event);
}

static void routing_transition_request_listener(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id, bool accepted)
{
  RoutingListener& routing_listener = registered_listeners[hsm];
  routing_listener.notify_transition_request_listeners(hsm, context, requesting_state, desired_state_id, accepted);
}



void hsm_test_utils_register_listener(Hsm2* hsm, HsmCppListener* listener)
{
  RoutingListener& routing_listener = registered_listeners[hsm];
  routing_listener.add_cpp_listener(hsm, listener);
}

void hsm_test_utils_remove_listener(Hsm2* hsm, HsmCppListener* listener)
{
  RoutingListener& routing_listener = registered_listeners[hsm];
  routing_listener.remove_cpp_listener(listener);
}


RecordingListener* RecordingListener::current_listener = nullptr;
