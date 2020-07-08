/**
* @file
*
* @brief     TODOLOW doxygen brief description
*
* @copyright Copyright (c) 2017 JCA Electronics, Winnipeg, MB. All rights
*            reserved.
*
* @addtogroup TODOLOW finish doxygen parent group
* @{
*
* @addtogroup HTree
* @{
***************************************************************************************************/
#define ___BKMARK(defined_bookmark_name) //Used to put links to #define bookmarks.
#define BKMARK(defined_bookmark_name)    //Used to put links to #define bookmarks.
#define TEST_BKMARK(defined_bookmark_name)    //Used to put links to #define bookmarks.
#define TESTABLE(anyting)

 //bookmarks to bookmark tables
___BKMARK(_IDE__HTree_C__BOOKMARK_TABLE)  //c file bookmark table
___BKMARK(_IDE__HTree_H__BOOKMARK_TABLE)  //h file bookmark table




//#################################################################################################
// HTree.c COMPILER SPECIFIC SECTION
#  define _IDE__HTree_C__COMPILER_SPECIFIC_SECTION
___BKMARK(_IDE__HTree_H__COMPILER_SPECIFIC_SECTION)
//#################################################################################################

//disable Visual Studio warnings
#ifdef _MSC_VER
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#endif






//#################################################################################################
// HTree.c INCLUDES SECTION
#  define _IDE__HTree_C__INCLUDES_SECTION
___BKMARK(_IDE__HTree_H__INCLUDES_SECTION)
//#################################################################################################
#include <stdint.h>
#include <stdbool.h>
#include "HTree.h"
#include "common_macros.h"
#include "ExecContext.h"



//#################################################################################################
// HTree.c PRIVATE DEFINES
#  define _IDE__HTree_C__PRIVATE_DEFINES
___BKMARK(_IDE__HTree_H__PUBLIC_DEFINES)
//#################################################################################################


 



//#################################################################################################
// HTree.c PRIVATE ENUMS
#  define _IDE__HTree_C__PRIVATE_ENUMS
___BKMARK(_IDE__HTree_H__PUBLIC_ENUMS)
//#################################################################################################






//#################################################################################################
// HTree.c PRIVATE STRUCTS
#  define _IDE__HTree_C__PRIVATE_STRUCTS
___BKMARK(_IDE__HTree_H__PUBLIC_STRUCTS)
//#################################################################################################







//#################################################################################################
// HTree.c PRIVATE FUNCTION PROTOTYPES
#  define _IDE__HTree_C__PRIVATE_FUNCTION_PROTOTYPES
___BKMARK(_IDE__HTree_C__PRIVATE_FUNCTIONS)
//#################################################################################################







//#################################################################################################
// HTree.c EXTERNAL VARIABLES
#  define _IDE__HTree_C__EXTERNAL_VARIABLES
___BKMARK(_IDE__HTree_H__EXTERNAL_VARIABLE_PROTOTYPES)
//#################################################################################################







//#################################################################################################
// HTree.c PUBLIC FUNCTION DEFINITIONS
#  define _IDE__HTree_C__PUBLIC_FUNCTIONS
___BKMARK(_IDE__HTree_H__PUBLIC_FUNCTION_PROTOTYPES)
//#################################################################################################


int16_t HTree_getNodeCount(HTree const * const tree)
{
  const HTreeNode* root = &tree->nodes[0];
  int16_t result = root->max_descendant_id + 1;
  return result;
}
TEST_BKMARK(_IDE__HTree_getNodeCount_Test);


/**
 * Does no parameter checking. Assumes that 'id' is valid.
 * @returns the HTreeNode corresponding to the id
 */
HTreeNode const * HTree_getNodeFromIdRaw(HTree const * const tree, HTree_NodeId id)
{
  if (id >= HTree_getNodeCount(tree))
  {
    return NULL;
  }

  uint8_t * byte_pointer = ((uint8_t*)tree->nodes) + (id * tree->node_sizeof);
  HTreeNode const * node = (HTreeNode const*)byte_pointer;
  return node;
}
TEST_BKMARK(_IDE__HTree_getNodeFromIdRaw_Test);


/**
* Does no parameter checking. Assumes that 'id' is valid.
* @returns the HTreeNode corresponding to the id
*/
HTreeNode const * HTree_getNodeFromId(Jxc* jxc, HTree const * const tree, HTree_NodeId id)
{
  SET_DEFAULT_RETURN_TO_NULL();
  HTreeNode const * node = HTree_getNodeFromIdRaw(tree, id);
  THROW_IF(node == NULL, ErrId__HSM_UNKNOWN_STATE_ID);
  return node;
}
TEST_BKMARK(_IDE__HTree_getNodeFromId_Test);


/**
 * Returns NULL if node is ROOT or its parent otherwise.
 */
HTreeNode const * HTree_getParentRaw(HTree const * const tree, HTreeNode const * const node)
{
  //special case for root node. It may not have ANY siblings
  if (node->id == HTree_NodeId__ROOT) {
    return NULL;
  }

  HTreeNode const * parent = HTree_getNodeFromIdRaw(tree, node->parent_id);
  return parent;
}
TEST_BKMARK(_IDE__HTree_getParentRaw_Test);



/**
 * throws exception if found parent is NULL.
 * Do not call on root node as it will throw.
 */
HTreeNode const * HTree_getParent(Jxc* jxc, HTree const * const tree, HTreeNode const * const node)
{
  SET_DEFAULT_RETURN(HTreeNode const *, NULL);

  HTreeNode const * parent = HTree_getNodeFromIdRaw(tree, node->parent_id);

  THROW_IF(parent == NULL, ErrId__HSM_NULL_PARENT);

  return parent;
}
TEST_BKMARK(_IDE__HTree_getParent_Test);



/**
 * Returns pointer to next sibling or NULL 
 */
HTreeNode const * HTree_getNextSiblingRaw(HTree const * const tree, HTreeNode const * const node)
{
  HTreeNode const * sibling = NULL;

  if (HTree_nodeHasFollowingSibling(tree, node))
  {
    sibling = HTree_getNodeFromIdRaw(tree, node->max_descendant_id + 1);
  }

  return sibling;
}
TEST_BKMARK(_IDE__HTree_getNextSiblingRaw_Test);



/**
 * Returns pointer to first child or NULL
 */
HTreeNode const * HTree_getFirstChildRaw(HTree const * const tree, HTreeNode const * const node)
{
  HTreeNode const * first_child = NULL;

  if (HTree_nodeHasChildren(node))
  {
    first_child = HTree_getNodeFromIdRaw(tree, node->id + 1);
  }

  return first_child;
}
TEST_BKMARK(_IDE__HTree_getFirstChildRaw_Test)


/**
* returns true if node has a following sibling
*/
bool HTree_nodeHasFollowingSibling(HTree const * const tree, HTreeNode const * const node)
{
  bool result;

  //special case for root node. It may not have ANY siblings
  if (node->id == HTree_NodeId__ROOT) {
    return false;
  }

  HTreeNode const * const parent = HTree_getParentRaw(tree, node);
  result = parent->max_descendant_id > node->max_descendant_id;

  return result;
}
TEST_BKMARK(_IDE__HTree_nodeHasFollowingSibling_Test);



/**
 * returns true if node has children
 */
bool HTree_nodeHasChildren(HTreeNode const * const node)
{
  bool result;
  result = node->max_descendant_id > node->id;
  return result;
}
TEST_BKMARK(_IDE__HTree_nodeHasChildren_Test);



/**
* returns true if a_node is equal to or descended from target_node
*/
bool HTree_isSameOrDescendant(HTreeNode const * const target_node, HTreeNode const * const a_node)
{
  bool result;
  result = IS_WITHIN_INC(a_node->id, target_node->id, target_node->max_descendant_id);
  return result;
}
TEST_BKMARK(_IDE__HTree_isSameOrDescendant_Test);


/**
* returns true if a_node is descended from target_node
*/
bool HTree_isDescendant(HTreeNode const * const target_node, HTreeNode const * const a_node)
{
  bool result;
  result = IS_WITHIN_INC(a_node->id, target_node->id+1, target_node->max_descendant_id);
  return result;
}
TEST_BKMARK(_IDE__HTree_isDescendant_Test);

/**
* returns true if a_node is descended from target_node
*/
bool HTree_isDescendantById(Jxc* jxc, HTree const * htree, HTree_NodeId target_node_id, HTree_NodeId a_node_id)
{
  bool result;
  HTreeNode const * target_node = HTree_getNodeFromId(jxc, htree, target_node_id);
  result = IS_WITHIN_INC(a_node_id, target_node->id + 1, target_node->max_descendant_id);
  return result;
}
TEST_BKMARK(_IDE__HTree_isDescendantById_Test);


//#################################################################################################
// HTree.c PUBLIC GETTER/SETTERS DEFINITIONS
#  define _IDE__HTree_C__GETTER_SETTERS
___BKMARK(_IDE__HTree_H__GETTER_SETTER_PROTOTYPES)
//#################################################################################################





//#################################################################################################
// HTree.c PRIVATE FUNCTION DEFINITIONS
#  define _IDE__HTree_C__PRIVATE_FUNCTIONS
___BKMARK(_IDE__HTree_C__PRIVATE_FUNCTION_PROTOTYPES)
//#################################################################################################







//#################################################################################################
// HTree.c IDE BOOKMARK TABLE
#  define _IDE__HTree_C__BOOKMARK_TABLE

___BKMARK(_IDE__HTree_C__COMPILER_SPECIFIC_SECTION)
___BKMARK(_IDE__HTree_C__INCLUDES_SECTION)
___BKMARK(_IDE__HTree_C__PRIVATE_DEFINES)
___BKMARK(_IDE__HTree_C__PRIVATE_ENUMS)
___BKMARK(_IDE__HTree_C__PRIVATE_STRUCTS)
___BKMARK(_IDE__HTree_C__PRIVATE_FUNCTION_PROTOTYPES)
___BKMARK(_IDE__HTree_C__EXTERNAL_VARIABLES)
___BKMARK(_IDE__HTree_C__PUBLIC_FUNCTIONS)
___BKMARK(_IDE__HTree_C__GETTER_SETTERS)
___BKMARK(_IDE__HTree_C__PRIVATE_FUNCTIONS)

___BKMARK(_IDE__HTree_H__BOOKMARK_TABLE)
___BKMARK(_IDE__HTree_H__COMPILER_SPECIFIC_SECTION)
___BKMARK(_IDE__HTree_H__INCLUDES_SECTION)
___BKMARK(_IDE__HTree_H__PUBLIC_DEFINES)
___BKMARK(_IDE__HTree_H__PUBLIC_ENUMS)
___BKMARK(_IDE__HTree_H__PUBLIC_STRUCTS)
___BKMARK(_IDE__HTree_H__EXTERNAL_VARIABLE_PROTOTYPES)
___BKMARK(_IDE__HTree_H__PUBLIC_FUNCTION_PROTOTYPES)
___BKMARK(_IDE__HTree_H__GETTER_SETTER_PROTOTYPES)
___BKMARK(_IDE__HTree_H__COMPILER_SPECIFIC_SECTION_BOTTOM)
//################################################################################################# 











/**
* @}
* @}
*/
