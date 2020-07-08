#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include <string>     // std::string, std::to_string
#include <time.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>

using namespace testing;

uint32_t time_ms;

extern "C" {
  uint32_t get_general_ms_counts(void)
  {
    return time_ms;
  }
}

int main(int argc, char** argv) 
{
  srand((unsigned int)time(NULL));   // should only be called once

  InitGoogleMock(&argc, argv);
  int result = RUN_ALL_TESTS();
  return result;
}



TEST(ExampleTests, Test1) {
  EXPECT_TRUE(true);
}
