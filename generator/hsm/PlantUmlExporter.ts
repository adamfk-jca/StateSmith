/*

Bug. Not recursing into ROOT.SYSTEM_STARTED.REGULAR_SCREENS.NORMAL.HOME_VIEW.RUNNING in view_MainSm

Lots of room for efficiency gains.

How to see dot markup?
  can try adding `!pragma svek_trace on` but it doesn't seem to work.

for generating large diagrams, see http://plantuml.com/faq 


http://plantuml.com/state-diagram

@startuml

[*] -> State3
state "BASIC" as ROOT__op__BASIC {
[*] --> ROOT__op__BASIC 
}
state "long name" as State3 {
state "Accumulate Enough Data\nLong State Name" as long1
long1 : Just a test
[*] --> long1
long1 --> long1 : New Data
long1 --> ProcessData : TICK [condition] / { x++;\ny++; }
long1 --> AO1
state "another one" as AO1 {

}
}
State3 --> [*] : Aborted
 
@enduml

*/

import { RenderedHsm, EventHandler } from "./Generator";
import { State } from "./State";
import { StateGen } from "./StateGen";
import { StringUtils } from "../ts-utils/StringUtils";
import * as Triggers from "./Triggers"

export class DividedEventHandlers {
  landed_in: EventHandler;
  normal:EventHandler[] = [];
}

export class PlantUmlExporter {

  stopAtCollapsed = true;
  showTransitions = true;
  showEventGuardActions = true;

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

  collapsedStates : State[];

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
  getStateFullName(state : State, seperator = ".") : string {

    let output = "";
    let cur = state;
    let sep = "";
    while(cur != null){
      let prepend = "";
      prepend = cur.label.toUpperCase();
      prepend += sep;
      output = prepend + output;
      sep = seperator;
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


  public buildOutputRecursively(startingState : State) : string {
    let output = this.buildOutput(startingState);
    let collapsedStates = this.collapsedStates;

    for(let state of collapsedStates) {
      output += "\n\n\n";
      output += this.buildOutputRecursively(state);
    }

    return output;
  }

  /**
   * 
   * @param hsm 
   */
  public buildOutput(startingState : State) : string {

    this.collapsedStates = [];

    //starting from    

    let allStates = this.addStatesRecursivelyFrom([], startingState);
    this.preProcess(allStates, 0);

    let output = "@startuml\n";
    output += `
skinparam state {
 FontName<<class_ortho>>    Impact
 BorderColor<<class_ortho>> #AA0000
 BorderColor Black
}

note top of ${this.getUniqueName(startingState)}
Full state path to current diagram being exported:
${this.getStateFullName(startingState)}
end note\n\n`;

    let styles = {text:""};
    let inner = this.renderSub(startingState, 0);

    output += styles.text;
    output += inner;
    output += "@enduml\n"
    return output;
  }

  /**
   * 
   * @param input 
   */
  escape(input : String) : string {
    return input.replace(/(\r\n|\r|\n)/g, "\\n");
  }

  /**
   * 
   * @param state 
   */
  divideEventHandlers(state : State) : DividedEventHandlers {
    let result = new DividedEventHandlers();

    for(let eh of state.eventHandlers) {
      if(eh.hasTrigger(Triggers.LANDED_IN)){
        if(result.landed_in){throw "can't handle multiple!";}
        let newEh = eh.shallowCopy();
        result.landed_in = newEh;
        result.landed_in.setTriggers([]); //don't want "landed_in" trigger showing up
      }else{
        result.normal.push(eh);
      }
    }

    return result;
  }
  
  /**
   * 
   * @param eh 
   */
  public getTriggerGuardActionTextParts(eh : EventHandler) {
    let result = {trigger:"", guard:"", action:""};

    if(this.showEventGuardActions == false){
      return result;
    }

    if(eh.hasSomeTriggers()){
      result.trigger = `${eh.getTriggers().join(" || ")}`;
      if(eh.triggersCount() > 1){
        result.trigger = `(${result.trigger})`;
      }
    }

    result.guard = (eh.guard) ? `[${eh.guard.guardCode}]` : "" ;
    result.action = (eh.action) ? ` / ${eh.action.actionCode}` : "";

    result.trigger = this.escape(result.trigger);
    result.guard = this.escape(result.guard);
    result.action = this.escape(result.action);

    return result;
  }

  public getTriggerGuardActionText(eh : EventHandler) : string {
    let et = this.getTriggerGuardActionTextParts(eh);
    let output = `${et.trigger}${et.guard}${et.action}`;
    return output;
  }

  public getTransitionText(eh : EventHandler) : string {
    let output = this.getTriggerGuardActionText(eh)
    if(output){
      output = " : " + output;
    }
    return output;
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

  public renderSub(state : State, depthCount : number) : string {
    let output = ""; 

    let thisUniqueName = this.getUniqueName(state);
    let eventHandlers = this.divideEventHandlers(state);
    
    let shownName = this.getShownName(state);
    let className = "";
    
    if(state.is_ortho_kid){
      shownName = "ORTHO : " + shownName;
      className = "<<class_ortho>>";
    }


    let inner = "";   

    //determine whether to show expanded state or not.
    //don't hide if this is the top of the current diagram being built.
    if(depthCount > 0 && this.stopAtCollapsed && state.inputState.groupIsCollapsed && state.kids.length > 0) {
      inner += `${thisUniqueName} : //COLLAPSED IN DIAGRAM\n`;
      this.collapsedStates.push(state);
    } else {
      //group is not collapsed in view or we should expand anyway
      if(eventHandlers.landed_in && this.showTransitions){
        inner += `[*] --> ${this.getUniqueName(eventHandlers.landed_in.nextState)} ${this.getTransitionText(eventHandlers.landed_in)}\n`;
      }
      
      for(let kid of state.kids) {
        inner += this.renderSub(kid, depthCount + 1);
      }
  
      if(this.showEventGuardActions) {
        for(let eh of eventHandlers.normal) {
          if(eh.nextState == null){
            inner += `${thisUniqueName} ${this.getTransitionText(eh)}\n`;
          }
        }
      }
  
    }

    output += `state "${shownName}" as ${thisUniqueName}${className}`;
    output += ` {\n`; //NOTE: a state definition must always have brackets, otherwise plantuml will interpret it as a "weak" definition which leads to bugs as states can be defined by transitions. See `INIT` state of `ROOT.SYSTEM_STARTED.STUBBLE` in previous commit.

    if(inner){
      inner = StringUtils.indent(inner, "  ");
      output += inner.replace(/[ \t]+$/,"");
    }
    output += `}`;
    output += `\n`;
    

    if(this.showTransitions) {
      for(let eh of eventHandlers.normal) {
        
        if(eh.nextState){
          //state --> next_state : action
          output += `${thisUniqueName} --> ${this.getUniqueName(eh.nextState)} ${this.getTransitionText(eh)}\n`;
        }
      }
    }


    //output += "\n";

    return output;
  }

}