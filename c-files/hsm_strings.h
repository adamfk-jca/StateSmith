#pragma once

#include "hsm2.h"
#include "MemBuffer.h"

void Hsm_getHsmFullName(Jxc* jxc, Hsm2* hsm, const HsmState* state, MemBuffer* mb);
void Hsm_getStatePartialName(Jxc* jxc, Hsm2* hsm, const  HsmState* state, MemBuffer* mb, int depth_above);
void Hsm_getStateFullName(Jxc* jxc, Hsm2* hsm, const HsmState* state, MemBuffer* mb);
