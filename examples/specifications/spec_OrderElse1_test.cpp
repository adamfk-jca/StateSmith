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

extern "C" {
#include "spec_OrderElse1.h"
}

static void step_x(Jxc * const jxc, spec_OrderElse1& sm, size_t count = 1)
{
  for (size_t i = 0; i < count; i++)
  {
    spec_OrderElse1_step(jxc, &sm);
  }
}

static void DispatchGoEventAndStep3(Jxc *const &jxc, spec_OrderElse1 &sm)
{
  spec_OrderElse1_dispatch_event(jxc, &sm, spec_OrderElse1_InputEvent_GO_EVENT);
  step_x(jxc, sm, 3);
}

TEST(spec_OrderElse1, InitAndStep) {
  spec_OrderElse1 sm = {};
  Jxc _jxc = {};
  Jxc * const jxc = &_jxc;
  spec_OrderElse1_instance_init(jxc, &sm, "instance-name");

  const int C1_output = 1;
  const int C2_output = 2;
  const int C3_output = 3;

  // else statement should be taken
  step_x(jxc, sm, 3);
  ASSERT_EQ(C3_output, sm.vars.out);

  // else statement should be taken
  DispatchGoEventAndStep3(jxc, sm);
  ASSERT_EQ(C3_output, sm.vars.out);

  // set `var1 > var2`, and `var1 == 1`.
  // Expect transitioned to C2.
  sm.vars.var1 = 1;
  sm.vars.var2 = 0;
  DispatchGoEventAndStep3(jxc, sm);
  ASSERT_EQ(C2_output, sm.vars.out);

  // set `var1 > var2`, and `var1 != 1`.
  // Expect transitioned to C1.
  sm.vars.var1 = 2;
  sm.vars.var2 = 0;
  DispatchGoEventAndStep3(jxc, sm);
  ASSERT_EQ(C1_output, sm.vars.out);
}


