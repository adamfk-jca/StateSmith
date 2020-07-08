/**
* @file
*
* @brief     TODOLOW doxygen brief description
*
**************************************************************************************************/
#pragma once

//disable Visual Studio warnings
#ifdef _MSC_VER
#  pragma warning( push )
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#endif

//#define Hsm_H__SHOW_PADDING_WARNINGS  //MSVC with all warnings enabled will alert to padding of structures. Note: it uses 4 bytes for enums as default whereas IAR is smarter and will use 1 byte if able.
#ifndef Hsm_H__SHOW_PADDING_WARNINGS
#  ifdef _MSC_VER
#    pragma warning(disable: 4820)
#  endif
#endif


//#################################################################################################
// Hsm.c INCLUDES SECTION
//#################################################################################################

#include <stdint.h>
#include <stdbool.h>
#include "HTree.h"
#include "ExecContext.h"



//#################################################################################################
// Hsm.c PUBLIC TYPEDEFS
//#################################################################################################

typedef HTree_NodeId HsmStateId;



//#################################################################################################
// Hsm.h PUBLIC ENUMS
//#################################################################################################

typedef enum _HsmEventId
{
  HsmEventId__EXIT,
  HsmEventId__ENTER,
  HsmEventId__LANDED_IN,
  HsmEventId__DO,
  HsmEventId__TEST_TRANSITIONS, //!< used for "super-stepping" which allows other ready transitions to complete instead of waiting for next 'DO' event. Reduces unnecessary latency.
  //---------------
  HsmEventId_AFTER_LAST,
  HsmEventId_CUSTOM_STARTS_AT = 10
} HsmEventId;



//#################################################################################################
// Hsm.h PUBLIC STRUCTS
//#################################################################################################

typedef struct _Hsm2 Hsm2;
typedef struct _HsmContext HsmContext;
typedef struct _HsmEvent HsmEvent;


/**
 * HSM State
 */
typedef struct HsmState
{
  HTreeNode node;               //MUST BE first item in struct as we cast between HTreeNode and HsmState. It's like HTreeNode is the base class
  bool is_ortho_parent;         //!< set to true for a state that is comprised of orthogonal region children
  const char * const name;      //!< Name of the state  //TODOLOW just provide a to_string function instead for the ID?
  void(*event_handler)(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmEvent const * event);
  int vars_sizeof;
} HsmState;


/**
 * This is simply an HTree with a name
 */
typedef struct HsmTree
{
  HTree const htree;        //MUST be first item in struct for polymorphism
  char const * const name;
  uint32_t* (*get_state_context)(int hsm_state_id); //!< used to get state context from union
} HsmTree;

extern const HsmEvent Hsm_ExitEvent;
extern const HsmEvent Hsm_EnterEvent;
extern const HsmEvent Hsm_LandedInEvent;
extern const HsmEvent Hsm_DoEvent;


struct _HsmEvent
{
  HsmEventId event_id;  //TODO put in real number
};


typedef struct _HsmStateBaseVars
{
  uint32_t time_state_entered;
} HsmStateBaseVars;


//typedef enum _HsmContextStatus
//{
//  HsmContextExitStatus__NOT_RUNNING,
//  HsmContextExitStatus__RUNNING,
//} HsmContextStatus;


struct _HsmContext
{
  const HsmState* current_state;
  const HsmState* transition_to;
  HsmStateId region_parent_id;
  HsmStateId region_top_state_id;
    //transition_event, TODOH put back in 
  struct { //flags
    bool running : 1;
    bool event_handled : 1;
    bool transition_completed : 1;  //TODO actually use
  };
};


typedef struct _HsmListener
{
  void (*event_listener)(Hsm2* hsm, HsmContext* context, const HsmState* state, HsmEvent const* event, bool pre_event);
  void (*transition_request_listener)(Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId state_id, bool accepted);
} HsmListener;


struct _Hsm2
{
  HsmTree const * tree;

  HsmContext root_context;

  const HsmListener* listener;

  const char* instance_name;

  /**
   * Allows HSM to auto manage state vars clearing
   */
  HsmStateBaseVars* (*get_state_vars)(Jxc* jxc, Hsm2* hsm, int id);

  //TODO make separate step function that allows you to set how many iterations can be run for a single dispatch
};

//node_id_t Hsm2_getStateCount(Hsm2* tree);





//#################################################################################################
// Hsm.h PUBLIC FUNCTION PROTOTYPES
//#################################################################################################

void Hsm_construct(Jxc* jxc, Hsm2* hsm);
void Hsm2_step(Jxc* jxc, Hsm2* hsm);
const HsmState* hTreeNode_to_HsmState(HTreeNode const * htreeNode);
const HsmState* Hsm_getStateFromId(Jxc* jxc, Hsm2 const * const hsm, HsmStateId id);
HsmState const * Hsm_getParentState(Jxc* jxc, Hsm2 const * const hsm, HsmState const * const state);
void _Hsm_set_context_current_state_by_id(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmStateId id);
void Hsm_dispatch_event(Jxc* jxc, Hsm2* hsm, const HsmEvent* event);
int16_t Hsm2_getStateCount(Hsm2* hsm);

const HsmState* Hsm_find_next_state_towards_target(Jxc* jxc, Hsm2* hsm, HsmContext* context);
const HsmState* Hsm_find_next_state_from_to(Jxc* jxc, Hsm2* hsm, const HsmState* from, const HsmState* to);
const HsmState * _Hsm_getNextSibling(Jxc* jxc, Hsm2* hsm, const HsmState* state);
const HsmState * _Hsm_getFirstChild(Jxc* jxc, Hsm2* hsm, const HsmState* state);
bool Hsm_isCurrentStateSameOrDescendantById(Jxc* jxc, Hsm2* hsm, const HsmStateId potential_ancestor_id);
bool Hsm_isCurrentStateSameOrDescendant(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor);
bool Hsm_is_transition_requested(HsmContext* context);
bool Hsm_isSameOrDescendant(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor, const HsmState* a_state);
bool _Hsm_isDescendant(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor, const HsmState* a_state);
void _Hsm_walk_towards_target(Jxc* jxc, Hsm2* hsm, HsmContext* context);
bool Hsm_isSameOrDescendantById(Jxc* jxc, Hsm2* hsm, const HsmState* potential_ancestor, const HsmStateId a_state_id);

void _Hsm_complete_transition(Jxc* jxc, Hsm2* hsm, HsmContext* context);
void _Hsm_clear_transition(Jxc* jxc, Hsm2* hsm, HsmContext* context);
void _Hsm_dispatch_event(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event);
void _Hsm_send_event_directly_to_state(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmEvent const * event, HsmState const * state);
void _Hsm_handle_ortho_kid_enter(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmContext* oKidContext);
void Hsm_handle_ortho_kids_enter(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmContext* oKidContexts, int oKidCount);
void Hsm_set_contexts_region_parent_id(Jxc* jxc, Hsm2* hsm, HsmStateId region_parent_id, HsmContext* oKidContexts, int oKidCount);
void Hsm_exit_okid(Jxc* jxc, Hsm2* hsm, HsmContext* orthoKidContext);
void Hsm_exit_okids(Jxc* jxc, Hsm2* hsm, HsmContext* oKidContexts, int oKidCount);
void Hsm_handle_ortho_kids_event(Jxc* jxc, Hsm2* hsm, HsmContext * context, HsmContext* orthoKidContexts, int oKidCount, const HsmEvent* event);

void Hsm_mark_transition_request(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmState* requesting_state, HsmStateId state_id);
void Hsm_finish_transition_request(Jxc* jxc, Hsm2* hsm, HsmContext* context);
void _Hsm_send_event_directly_to_current_state(Jxc* jxc, Hsm2* hsm, HsmContext* context, HsmEvent const * event);

bool Hsm_event_part_of_transition(const HsmEvent * event);

const char* Hsm_event_to_string(const HsmEventId event_id, const char* default_str);


//#################################################################################################
// Hsm.h COMPILER SPECIFIC SECTION BOTTOM
#  define _IDE__Hsm_H__COMPILER_SPECIFIC_SECTION_BOTTOM
//#################################################################################################
#ifdef _MSC_VER
#  pragma warning( pop )  //re-enable warnings disabled for this file
#endif
