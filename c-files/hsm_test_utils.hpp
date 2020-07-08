#pragma once

#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include <stdio.h>
#include <vector>
#include <map>

#define STRINGIFY(x) #x


using namespace testing;
using std::vector;
using std::map;

extern "C" {
  #include "common_macros.h"
  #include "msvc_helper.h"
  #include "hsm2.h"
}

class HsmCppListener;

void hsm_test_utils_register_listener(Hsm2* hsm, HsmCppListener* listener);
void hsm_test_utils_remove_listener(Hsm2* hsm, HsmCppListener* listener);

typedef void(*event_listener_func)(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event);
typedef void(*transition_request_listener_func)(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id, bool accepted);

class HsmCppListener 
{
public:
  Hsm2* hsm;
  virtual void event_listen(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event) { }
  virtual void transition_request_listen(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id, bool accepted) { }

  HsmCppListener() {

  }

  HsmCppListener(Hsm2* hsm)
  {
    set_hsm(hsm);
  }

  void set_hsm(Hsm2* hsm)
  {
    if (this->hsm != nullptr) {
      throw std::exception("unexpected!");
    }

    this->hsm = hsm;
    hsm_test_utils_register_listener(hsm, this);
  }

  virtual ~HsmCppListener() {
    hsm_test_utils_remove_listener(hsm, this);
  }
};


class HsmEventPrinter : HsmCppListener 
{
public:
  HsmEventPrinter(Hsm2* hsm) : HsmCppListener(hsm) {  }

protected:
  void transition_request_listen(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId desired_state_id, bool accepted)
  {
    const char * accepted_text = accepted ? "ACCEPTED" : "REJECTED";

    mprintf("HSM: %s(%s) ctx_root=%3i transition request from %s#%i to %s#%i : %s\n",
      hsm->tree->name, hsm->instance_name,
      context->region_top_state_id,
      requesting_state->name,       requesting_state->node.id,
      context->transition_to->name, desired_state_id,
      accepted_text);
  }
};



template <class CustomEventType>
struct state_stats_t
{
public:
  const char * name;
  bool is_region_current_state;
  map<HsmEventId, int> hsm_event_counts;
  map<CustomEventType, int> custom_event_counts;
  HsmContext* containing_context;

  void add_hsm_event(HsmEventId id) {
    hsm_event_counts[id]++;
  }

  void add_custom_event(CustomEventType id) {
    custom_event_counts[id]++;
  }

  bool is_active() {
    bool active = hsm_event_counts[HsmEventId__ENTER] > hsm_event_counts[HsmEventId__EXIT];
    return active;
  }
};


template <class CustomEventType>
class TrackingListener : public HsmCppListener
{
public:
  map<int, state_stats_t<CustomEventType>> state_stats;  //maps state_id to stat. Using int to avoid crazy long names

  TrackingListener(Hsm2* hsm) : HsmCppListener(hsm)
  {

  }

  state_stats_t<CustomEventType>& operator[](int index)
  {
    return state_stats[index];
  }

  void event_listen(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event) override
  {
    HsmEventId event_id = event->event_id;
    if (pre_event) { return; }

    auto stat = &state_stats[state->node.id];
    stat->name = state->name;

    if (event_id < HsmEventId_CUSTOM_STARTS_AT) {
      stat->add_hsm_event(event_id);
    }
    else {
      stat->add_custom_event((CustomEventType)event_id);
    }

    stat->containing_context = context;

    stat->is_region_current_state = context->current_state == state;

    if (event_id == HsmEventId__EXIT) {
      stat->is_region_current_state = false;
    }

  }
};


class Record {
public:
  virtual std::string toString() = 0;
};

class CalledFunctionRecord : public Record {
public:
  const char* const called_function_name;

  CalledFunctionRecord(const char* called_function_name) : called_function_name(called_function_name) {
  }

  std::string toString() override {
    return std::string("func call: ") + called_function_name;
  }
};

class EventRecord : public Record {
public:
  const HsmState * const receiving_state;
  const int event_id;
  //bool pre_event;

  EventRecord(const HsmState* receiving_state, int const event_id) : receiving_state(receiving_state), event_id(event_id) {
  }

  std::string toString() override {
    auto default_event_name = std::to_string(event_id);
    const char* event_name = Hsm_event_to_string((HsmEventId)event_id, default_event_name.c_str());
    return std::string("event `") + event_name + "` sent to state `" + receiving_state->name + "`";
  }

};




class RecordingListener : public HsmCppListener
{
private:
public:
  vector<Record*> records;
  static RecordingListener* current_listener;


  RecordingListener(Hsm2* hsm) : HsmCppListener(hsm)
  {
    current_listener = this;
  }

  void event_listen(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event) override
  {
    if (!pre_event) {
      return;
    }

    HsmEventId event_id = event->event_id;
    records.push_back(new EventRecord(state, event_id));
  }

  void add_func_record(const char* func_name) 
  {
    records.push_back(new CalledFunctionRecord(func_name));
  }

  ~RecordingListener() {
    for (Record* record : records) {
      free(record);
    }
  }

};



template <class CustomEventType>
class ForceTransitionListener : public HsmCppListener
{
public:
  HsmContext* context_to_receive_transition_request;
  HsmStateId target_state;
  bool target_reached;
  HsmContext* context_containing_target;

  ForceTransitionListener(Hsm2* hsm) : HsmCppListener(hsm)
  {
  }

  void event_listen(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event) override
  {
    if (!pre_event) { return; }

    if (event->event_id == HsmEventId__ENTER && state->node.id == target_state) {
      target_reached = true;
      context_containing_target = context;
      return;
    }

    if (event->event_id != HsmEventId__DO || context != context_to_receive_transition_request || Hsm_is_transition_requested(context)) {
      return;
    }

    Jxc _jxc = {};
    Jxc* jxc = &_jxc;

    Hsm_mark_transition_request(jxc, hsm, context, state, (HsmStateId)target_state);
    ASSERT_TRUE(ERROR_IS_NOT_SET());
  }
};

//essentially a template typedef
template <typename T>
using step_func_t = void (*)(Jxc* jxc, T* sm);


//you have to be careful with this method as it can violate HSM assumptions.
//easiest to use correctly after initialization with the root context.
template <class CustomEventType, class SmType>
static void force_sm_to_state_within_context(SmType* sm, step_func_t<SmType> step_func, HsmContext* context_to_receive_transition_request, int target_state_id)
{
  ForceTransitionListener<CustomEventType> force_tx_listener((Hsm2*)sm);
  TrackingListener<CustomEventType> tracker((Hsm2*)sm);


  force_tx_listener.target_state = (HsmStateId)target_state_id;
  force_tx_listener.context_to_receive_transition_request = context_to_receive_transition_request;

  Jxc _jxc = {};
  Jxc* jxc = &_jxc;

  int attempts_left = 30;
  while (!force_tx_listener.target_reached && attempts_left > 0) {
    step_func(jxc, sm);
    ASSERT_TRUE(ERROR_IS_NOT_SET());
    attempts_left--;
  }

  ASSERT_GT(attempts_left, 0);
  ASSERT_TRUE(tracker[target_state_id].is_active());

  //can't do below because some states auto transition upon LANDED_IN. 
  //Think states that have a pseudo starting state with transitions.
  //ASSERT_EQ(force_tx_listener.context_containing_target->current_state->node.id, target_state_id);
}


//you have to be careful with this method as it can violate HSM assumptions.
//easiest to use correctly after initialization with the root context.
template <class CustomEventType, class SmType>
static void force_sm_root_to_state(SmType* sm, step_func_t<SmType> step_func, int target_state)
{
  Hsm2* hsm = (Hsm2*)sm;
  HsmContext* context_to_receive_transition_request = &hsm->root_context;
  force_sm_to_state_within_context<CustomEventType>(sm, step_func, context_to_receive_transition_request, target_state);
}

