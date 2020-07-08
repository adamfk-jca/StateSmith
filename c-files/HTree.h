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
#pragma once
#define ___BKMARK(defined_bookmark_name) //Used to put links to #define bookmarks.

 //bookmarks to bookmark tables
___BKMARK(_IDE__HTree_H__BOOKMARK_TABLE)  //h file bookmark table
___BKMARK(_IDE__HTree_C__BOOKMARK_TABLE)  //c file bookmark table

 

//#################################################################################################
// HTree.h COMPILER SPECIFIC SECTION
#  define _IDE__HTree_H__COMPILER_SPECIFIC_SECTION
___BKMARK(_IDE__HTree_C__COMPILER_SPECIFIC_SECTION)
//#################################################################################################

//disable Visual Studio warnings
#ifdef _MSC_VER
#  pragma warning( push )
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#endif

//#define HTree_H__SHOW_PADDING_WARNINGS  //MSVC with all warnings enabled will alert to padding of structures. Note: it uses 4 bytes for enums as default whereas IAR is smarter and will use 1 byte if able.
#ifndef HTree_H__SHOW_PADDING_WARNINGS
#  ifdef _MSC_VER
#    pragma warning(disable: 4820)
#  endif
#endif







//#################################################################################################
// HTree.c INCLUDES SECTION
#  define _IDE__HTree_H__INCLUDES_SECTION
___BKMARK(_IDE__HTree_C__INCLUDES_SECTION)
//#################################################################################################
#include <stdint.h>
#include <stdbool.h>
#include "ExecContext.h"




//#################################################################################################
// HTree.h PUBLIC DEFINES
#  define _IDE__HTree_H__PUBLIC_DEFINES
___BKMARK(_IDE__HTree_C__PRIVATE_DEFINES)
//#################################################################################################






//#################################################################################################
// HTree.h PUBLIC TYPEDEFS
#  define _IDE__HTree_H__PUBLIC_TYPEDEFS
___BKMARK(_IDE__HTree_C__PRIVATE_TYPEDEFS)
//#################################################################################################






//#################################################################################################
// HTree.h PUBLIC ENUMS
#  define _IDE__HTree_H__PUBLIC_ENUMS
___BKMARK(_IDE__HTree_C__PRIVATE_ENUMS)
//#################################################################################################

/**
 * The allowable IDs for an HTree node
 */
  typedef enum _HTree_NodeId
{
  HTree_NodeId__ROOT = 0,
  HTree_NodeId_MAX_NODE_ID = UINT16_MAX, //useful for forcing to uint16_t representation of enum.
} HTree_NodeId;








//#################################################################################################
// HTree.h PUBLIC STRUCTS
#  define _IDE__HTree_H__PUBLIC_STRUCTS
___BKMARK(_IDE__HTree_C__PRIVATE_STRUCTS)
//#################################################################################################


/**
 * Main struct for the HTree object
 */
typedef struct _HTreeNode
{
  /**
   * The nodes ID. The value is important. All children of this node must have an ID > than this ID.
   * This 'id' is also the index of the node in the tree nodes array.
   */
  HTree_NodeId id;

  /**
   * All children of this node must have an ID <= this value.
   * Children of this node must have IDs between (id, max_descendant_id]
   * A node with id == max_descendant_id has no children.
   * A node (aa) with parent (a) has no siblings if aa.max_descendant_id == a.max_descendant_id 
   */
  HTree_NodeId max_descendant_id;


  /**
   * The ROOT node should have a parent_id equal to its ID.
   */
  HTree_NodeId parent_id;

} HTreeNode;


/**
 * An HTree is hierarchy tree made up of a collection of nodes.
 */
typedef struct _HTree
{
  uint8_t node_sizeof;

  /**
   * A valid tree must have at least a root node.
   */
  HTreeNode * nodes;  //TODO determine if needs to be const const
} HTree;




//#################################################################################################
// HTree.h PUBLIC EXTERNAL VARIABLE PROTOTYPES
#  define _IDE__HTree_H__EXTERNAL_VARIABLE_PROTOTYPES
___BKMARK(_IDE__HTree_C__EXTERNAL_VARIABLES)
//#################################################################################################











//#################################################################################################
// HTree.h PUBLIC FUNCTION PROTOTYPES
#  define _IDE__HTree_H__PUBLIC_FUNCTION_PROTOTYPES
___BKMARK(_IDE__HTree_C__PUBLIC_FUNCTIONS)
//#################################################################################################

int16_t HTree_getNodeCount(HTree const * const tree);
HTreeNode const * HTree_getNodeFromId(Jxc* jxc, HTree const * const tree, HTree_NodeId id);
HTreeNode const * HTree_getParent(Jxc* jxc, HTree const * const tree, HTreeNode const * const node);
HTreeNode const * HTree_getFirstChildRaw(HTree const * const tree, HTreeNode const * const node);
HTreeNode const * HTree_getNextSiblingRaw(HTree const * const tree, HTreeNode const * const node);
HTreeNode const * HTree_getNodeFromIdRaw(HTree const * const tree, HTree_NodeId id);
HTreeNode const * HTree_getParentRaw(HTree const * const tree, HTreeNode const * const node);
bool HTree_isDescendant(HTreeNode const * const target_node, HTreeNode const * const a_node);
bool HTree_isDescendantById(Jxc* jxc, HTree const * htree, HTree_NodeId target_node_id, HTree_NodeId a_node_id);
bool HTree_isSameOrDescendant(HTreeNode const * const target_node, HTreeNode const * const a_node);
bool HTree_nodeHasChildren(HTreeNode const * const node);
bool HTree_nodeHasFollowingSibling(HTree const * const tree, HTreeNode const * const node);





//#################################################################################################
// HTree.h PUBLIC GETTER/SETTER PROTOTYPES
#  define _IDE__HTree_H__GETTER_SETTER_PROTOTYPES
___BKMARK(_IDE__HTree_C__GETTER_SETTERS)
//#################################################################################################










//#################################################################################################
// HTree.h COMPILER SPECIFIC SECTION BOTTOM
#  define _IDE__HTree_H__COMPILER_SPECIFIC_SECTION_BOTTOM
//#################################################################################################
#ifdef _MSC_VER
#  pragma warning( pop )  //re-enable warnings disabled for this file
#endif





/***************************************************************************//**
 * @}
 * @}
 ******************************************************************************/


