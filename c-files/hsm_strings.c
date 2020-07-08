#include "hsm_strings.h"


void Hsm_getHsmFullName(Jxc* jxc, Hsm2* hsm, const HsmState* state, MemBuffer* mb)
{
  vTRY_BUBBLE_EXCEPTION();
  (void)hsm; (void)state; //TODOLOW cleanup

  int max_exp_len = 100; //max_expected_string_length

  //example format: ButtonSm(Info)
  MemBuffer_append_string(jxc, mb, hsm->tree->name, max_exp_len);
  MemBuffer_append_char(jxc, mb, '(');
  MemBuffer_append_string(jxc, mb, hsm->instance_name, max_exp_len);
  MemBuffer_append_string(jxc, mb, ")", max_exp_len);
}


void Hsm_getStatePartialName(Jxc* jxc, Hsm2* hsm, const HsmState* state, MemBuffer* mb, int depth_above)
{
  vTRY_BUBBLE_EXCEPTION();

  const HsmState* cur = state;

  vTHROW_IF(state == NULL, ErrId__NULL_STATE);

  for (int i = 0; i < depth_above && cur->node.id != HTree_NodeId__ROOT; i++)
  {
    cur = Hsm_getParentState(jxc, hsm, cur);
  }
  vTRY_BUBBLE_EXCEPTION();

  int max_exp_len = 100; //max_expected_string_length

  char* dots = cur->node.id != HTree_NodeId__ROOT ? "..." : "";

  //Example format: ...S1.S2.S4#4
  MemBuffer_append_string(jxc, mb, dots, max_exp_len);

  MemBuffer_append_string(jxc, mb, cur->name, max_exp_len);

  while (cur != state) {
    vTRY_BUBBLE_EXCEPTION();
    cur = Hsm_find_next_state_from_to(jxc, hsm, cur, state);
    vTRY_BUBBLE_EXCEPTION();
    MemBuffer_append_char(jxc, mb, '.');
    MemBuffer_append_string(jxc, mb, cur->name, max_exp_len);
  }

  //TODO allow printing partial even on error

  //vTRY_BUBBLE_EXCEPTION();
  //char state_num_buffer[7];
  //snprintf(&state_num_buffer, COUNTOF(state_num_buffer), "#%i");
  //MemBuffer_append_string(jxc, mb, cur->name, max_exp_len);
}


void Hsm_getStateFullName(Jxc* jxc, Hsm2* hsm, const HsmState* state, MemBuffer* mb)
{
  vTRY_BUBBLE_EXCEPTION();
  const HsmState* cur = Hsm_getStateFromId(jxc, hsm, HTree_NodeId__ROOT);
  vTRY_BUBBLE_EXCEPTION();

  int max_exp_len = 100; //max_expected_string_length for a single string

  //Example format: ROOT.S1.S2#2
  MemBuffer_append_string(jxc, mb, cur->name, max_exp_len);

  while (cur != state) {
    vTRY_BUBBLE_EXCEPTION();
    cur = Hsm_find_next_state_from_to(jxc, hsm, cur, state);
    MemBuffer_append_char(jxc, mb, '.');
    MemBuffer_append_string(jxc, mb, cur->name, max_exp_len);
  }

  //vTRY_BUBBLE_EXCEPTION();
  //char state_num_buffer[7];
  //snprintf(&state_num_buffer, COUNTOF(state_num_buffer), "#%i");
  //MemBuffer_append_string(jxc, mb, cur->name, max_exp_len);
}