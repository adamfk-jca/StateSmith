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
#include "flat/spec_OrderElse1_flat.h"
}

static void step_x(spec_OrderElse1_flat& sm, size_t count = 1)
{
  for (size_t i = 0; i < count; i++)
  {
    spec_OrderElse1_flat_dispatch_event(&sm, spec_OrderElse1_flat_EventId__DO);
  }
}

static void DispatchGoEventAndStep3(spec_OrderElse1_flat &sm)
{
  spec_OrderElse1_flat_dispatch_event(&sm, spec_OrderElse1_flat_EventId__GO_EVENT);
  step_x(sm, 3);
}

TEST(spec_OrderElse1_flat, InitAndStep) {
  spec_OrderElse1_flat sm = {};
  spec_OrderElse1_flat_instance_init(&sm);

  const int C1_output = 1;
  const int C2_output = 2;
  const int C3_output = 3;

  // else statement should be taken
  step_x(sm, 3);
  ASSERT_EQ(C3_output, sm.vars.out);

  // else statement should be taken
  DispatchGoEventAndStep3(sm);
  ASSERT_EQ(C3_output, sm.vars.out);

  // set `var1 > var2`, and `var1 == 1`.
  // Expect transitioned to C2.
  sm.vars.var1 = 1;
  sm.vars.var2 = 0;
  DispatchGoEventAndStep3(sm);
  ASSERT_EQ(C2_output, sm.vars.out);

  // set `var1 > var2`, and `var1 != 1`.
  // Expect transitioned to C1.
  sm.vars.var1 = 2;
  sm.vars.var2 = 0;
  DispatchGoEventAndStep3(sm);
  ASSERT_EQ(C1_output, sm.vars.out);
}


