#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include <string>     // std::string, std::to_string
#include <time.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include <typeinfo>       // operator typeid
#include <vector>
#include "hsm_test_utils.hpp"
#include <stdexcept>
#include <string>
#include <functional>

using std::vector;
using std::string;
using namespace testing;
#include <type_traits>

//TODO add namespace

extern "C" {
  #include "flat/spec_Simple2_flat.h"
}

class spec_Simple2_flatF;

//needed because TestF doesn't have a standard layout
struct Bridge {
  spec_Simple2_flatF *testF;
};

class spec_Simple2_flatF : public ::testing::Test {

protected:
  vector<string> records;
  spec_Simple2_flat sm;
  Bridge bridge;

  void SetUp() override {
    bridge.testF = this;
    sm.vars.trace_object = &bridge;
  }

public:
  void buildSm() {
    spec_Simple2_flat_instance_init(&sm);
  }

  void addRecord(const char * const description) {
    records.push_back(description);
  }

  void clearRecords() {
    records.clear();
  }

  void dispatchDo() {
    spec_Simple2_flat_dispatch_event(&sm, spec_Simple2_flat_EventId__DO);
  }

  void dispatchGo() {
    spec_Simple2_flat_dispatch_event(&sm, spec_Simple2_flat_EventId__GO);
  }
};

extern "C" {
  void spec_Simple2_flat_test_trace(void* trace_object, const char* const description) {
    ((Bridge*)trace_object)->testF->addRecord(description);
  }
  void spec_Simple2_flat_fail(const char* const description) { FAIL() << "at handler:`" << description << "`"; }
}


TEST_F(spec_Simple2_flatF, test1) {
  buildSm();

  {
    vector<string> expected = {
      "#1",
      "#2",
      "#3",
      "S: ENTER",
      "S1: ENTER",
      "S11: ENTER"
    };
    ASSERT_EQ(expected, records);
  }

  {
    clearRecords();
    dispatchDo();
    vector<string> expected = {
      "S11: DO",
      "S1: DO",
      "S: DO"
    };
    ASSERT_EQ(expected, records);
  }

  {
    clearRecords();
    dispatchGo();
    vector<string> expected = {
      "S11: GO",
      "S11: GO -> T111",
      "S11: EXIT",
      "S1: EXIT",
      "T1: ENTER",
      "T11: ENTER",
      "T111: ENTER",
    };
    ASSERT_EQ(expected, records);
  }

  {
    clearRecords();
    dispatchDo();
    vector<string> expected = {
      "T111: DO [num == 0] -> T111",
      "T111: EXIT",
      "T111: ENTER",
    };
    ASSERT_EQ(expected, records);
  }

  {
    clearRecords();
    sm.vars.num = 1;
    dispatchDo();
    vector<string> expected = {
      "T111: DO [num > 0] -> T1",
      "T111: EXIT",
      "T11: EXIT",
    };
    ASSERT_EQ(expected, records);
  }

  {
    clearRecords();
    sm.vars.num = 0;
    dispatchDo();
    vector<string> expected = {
      "T1: DO",
      "S: DO",
    };
    ASSERT_EQ(expected, records);
  }

  {
    clearRecords();
    sm.vars.num = 1;
    dispatchDo();
    vector<string> expected = {
      "T1: DO [num > 0] -> T111",
      "T11: ENTER",
      "T111: ENTER",
    };
    ASSERT_EQ(expected, records);
  }

  {
    clearRecords();
    sm.vars.num = 0;
    dispatchGo();
    vector<string> expected = {
      "T111: GO",
    };
    ASSERT_EQ(expected, records);
  }
}