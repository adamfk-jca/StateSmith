/*

*/

import { RenderedHsm, EventHandler } from "./Generator";
import { State } from "./State";
import { StateGen } from "./StateGen";
import { StringUtils } from "../ts-utils/StringUtils";
import { readFileSync } from "fs";



export class StateTsExporter {

  /** 
   * if true, it will use the shortest possible name that uniquely identifies a state.
   * if false, the name for a state will be the full path.
   * 
   * There are advantages to both, but shorter names can make source diagrams easier
   * to read and git diff. It is also has the benefit of being more immune to renaming
   * of parent states far up the change. If full path used and top most state renamed,
   * then you may have 100 states show up with changes in git diff which makes it very
   * difficult to see any other changes.
   */
  useShortUniqueNames = true;

  /** primarily used for anonymizing a structure before posting online */
  useIdsAsNames = false;

  shortUniqueNames = new Map<State, string>();

  getShortUniqueName(state : State){
    let name = this.shortUniqueNames.get(state);

    if(name == null){
      throw "No state found. make sure to preprocess.";
    }

    return name;
  }


  /**
   * Builds name by ascending up ancestry
   * @param state 
   * @param maxLength 
   */
  getUpwardChainName(state : State, maxLength : number) {
    let chainName = state.label;
    let curState = state;
    let count = 0;
    while(count < maxLength && curState.parent != null){
      count++;
      curState = curState.parent;
      chainName = curState.label + "." + chainName; //can't use "__" as plant uml uses that to create __underlines__.
    }

    return chainName;
  }

  /**
   * 
   * @param state 
   */
  preProcess(inputStates : State[], upwardLength : number){
    let leafNames = new Map<string, State[]>();

    for(let state of inputStates) {
      let label = this.getUpwardChainName(state, upwardLength);
      let states = leafNames.get(label) || [];
      states.push(state);
      leafNames.set(label, states);
    }

    for (let [key, states] of leafNames) {
      if (states.length == 1) {
        this.shortUniqueNames.set(states[0], key);
      }
      else if (states.length > 1){
        //we have a conflict. recurse upwards until unique names generated.
        this.preProcess(states, upwardLength + 1);
      }
      else {
        throw "programming mistake...";
      }
    }
  }

  /** mostly copied from StateGen.ts */
  getStateFullName(state : State, separator = ".") : string {

    let output = "";
    let cur = state;
    let sep = "";
    while(cur != null){
      let prepend = "";
      prepend = cur.label.toUpperCase();
      prepend += sep;
      output = prepend + output;
      sep = separator;
      cur = cur.parent;
    }
    
    return output;
  }

  
  getShownName(state : State){
    let shownName = state.label;

    if(this.useIdsAsNames){
      shownName = "State " + state.outputId;
    }

    return shownName;
  }

  /**
   * 
   * @param resultArray 
   * @param startingState 
   */
  addStatesRecursivelyFrom(resultArray : State[], startingState : State){
    resultArray.push(startingState);

    for(let kid of startingState.kids) {
      this.addStatesRecursivelyFrom(resultArray, kid);
    }
    return resultArray;
  }

  /**
   * {
   *    root:{
   *    },
   *    uniqueNameStates:{
   *    }
   * }
   * @param hsm 
   */
  public buildOutput(startingState : State, smName : string) : string {

    //let allStates = this.addStatesRecursivelyFrom([], startingState);
    // this.preProcess(allStates, 0); for unique names
    let inner = this.renderSub(startingState);
    inner = StringUtils.indent(inner, "  ");
    inner = inner.replace(/[ \t]+$/,"");
    
    let output = readFileSync(__dirname + "/views/doc-content/states/template.ts").toString();
    output += `\nexport const ${smName} = {\n`;
    output += inner;
    output += "};";

    return output;
  }


  /**
   * 
   * @param input 
   */
  escape(input : String) : string {
    return input.replace(/(\r\n|\r|\n)/g, "\\n");
  }


  getUniqueName(state : State){
    let result : string;

    if(this.useIdsAsNames){
      return `State_${state.outputId}`;
    }

    if(this.shortUniqueNames){
      result = this.getShortUniqueName(state);
    }else{
      result = this.getStateFullName(state);
    }

    return result;
  }


  public renderSub(state : State) : string {
    let output = ""; 
  
    let inner = "";   

    inner += `getFc : getFullPathCode,\n`;
    inner += `getSc : getShortPathCode,\n`;

    for(let kid of state.kids) {
      inner += this.renderSub(kid);
    }

    if(inner){
      inner = StringUtils.indent(inner, "  ");
      inner = inner.replace(/[ \t]+$/,"");
    }

    output  = `${state.label} : {\n`;
    output += inner;
    output += "},\n";

    return output;
  }

}