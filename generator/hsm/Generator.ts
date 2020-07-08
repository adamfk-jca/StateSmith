import {MyRegex} from "../ts-utils/MyRegex"
import { State } from "./State"
import { ROOT_STATE_LABEL, ROOT_STATE_ID } from "./Compiler";
import * as Triggers from "./Triggers"
import { removeFromArray, shallowCopyInto } from "../ts-utils/Misc";


const r = new MyRegex();

//TODOLOW someday make an actual class that stores original text & casing for trigger.
export class Trigger extends String {

}

export class Guard  {
  name : string;  //TODO remove
  guardCode : string;
}

export class Action {
  name : string;  //TODO remove
  actionCode : string;
}


export const DEFAULT_TRANSITION_ORDER_NUMBER = 1000000;
export const ELSE_TRANSITION_ORDER_OFFSET_NUMBER = DEFAULT_TRANSITION_ORDER_NUMBER * 100;

export class EventHandler{
  /** if specified, it will determine which event handler should be checked first. Lower numbers take priority. */
  order = DEFAULT_TRANSITION_ORDER_NUMBER;  
  private triggers : Set<Trigger> = new Set<Trigger>(); //used because they must be unique anyway
  guard ?: Guard = null;
  action ?: Action = null;
  nextState ?: State = null;
  stopsPropagation ?: boolean = false;  //TODO support?
  noExpand : boolean = false; //TODO support?
  commentOverride = "";       //TODO support?
  markContextHandled = true;  //TODO support?

  setTriggers(triggers : Trigger[]) {
    this.triggers = new Set();
    this.addTriggers(triggers);
  }

  addTriggers(triggers : Trigger[]) {
    for (const t of triggers) {
      this.addTrigger(t);
    }
  }

  addTrigger(trigger : Trigger) {
    this.triggers.add(trigger.toUpperCase());
  }  

  triggersCount() {
    return this.triggers.size;
  }

  hasSomeTriggers() {
    return this.triggers.size > 0;
  }

  getTriggers() {
    let triggers = [...this.triggers];
    return triggers;
  }

  getTriggersSet() : ReadonlySet<Trigger> {
    return this.triggers;
  }

  hasTrigger(trigger : Trigger) {
    let result = this.triggers.has(trigger.toUpperCase());
    return result;
  }

  removeTriggers(triggers : Iterable<Trigger>){
    for(let trigger of triggers) {
      if(this.triggers.delete(trigger) == false){
        throw `failed removing trigger '${trigger}'`;
      }
    }
  }
    
  shallowCopy() {
    let newEh = new EventHandler();
    newEh.set(this);

    return newEh;
  }

  deepCopy(){
    let newEh = new EventHandler();
    shallowCopyInto(newEh, this);
    newEh.triggers = new Set(this.triggers);
    newEh.action = deepCopy(this.action); //TODOLOW not ideal
    newEh.guard = deepCopy(this.guard); //TODOLOW not ideal
    return newEh;
  }

  set(eh : EventHandler){
    shallowCopyInto(this, eh);
    return this;
  }
}

function deepCopy<T>(obj : T) : T {
  let result = <T>JSON.parse( JSON.stringify(obj) );
  return result;
}

export class InputEventHandler{
  /** if specified, it will determine which event handler should be checked first. Lower numbers take priority. */
  order : number = DEFAULT_TRANSITION_ORDER_NUMBER;
  triggers : Array<string> = [];
  guard ?: string = null;
  action ?: string = null;
  nextInputStateId ?: string = null;
  stopsPropagation ?: boolean = false;
}

export class InputState{
  label : string;
  id : string;

  /** true if state is a folder/group in yed diagram and is currently closed. */
  groupIsCollapsed = false;
  parentId : string;
  eventHandlers : Array<InputEventHandler> = [];
  orthogonal_order : number;
  isInitialState : boolean = false;

  is_orthogonal() : boolean {
    return this.orthogonal_order != null;
  }

  //TODO state context
}



export class InputParsedVar{
  type : string;
  name : string;
  preComment : string;
  lineComment : string;
}

export class StructField{

  preComment : string = "";
  type : string;
  name : string;
  arraySize : string;
  bitFieldSize : string;
  lineComment : string = "";
  fullTextMatch : string;
  //initialValue : string; //TODO maybee initial value for struct fields

  public isArray() : boolean {
    return this.arraySize.trim().length > 0;
  }
  public isBitField() : boolean {
    return this.bitFieldSize.trim().length > 0;
  }

}

export class InputHsm{
  name: string;
  prefix: string;
  states : InputState[] = [];
  varsStructInnerText : string = "";
  expansionDefinitions : string = ""; //like   'output_event(x) ====> hsm->vars.outputs.events.{{x}} == true;'
  executeBeforeCode : string = "";
  executeAfterCode : string = "";
  c_file_top: string = "";
  h_file_top: string = "";
  cFunctions: string = "";
  cFunctionsNoExp: string = "";
  cPrototypes: string = "";
  cPrototypesNoExp: string = "";
  inputValues: string = "";
  outputValues: string = "";
  outputEvents: string = "";
  imports: string = "";
  diagramSourceFilePath: string;
  output_filename : string = "";
}





export class CompileSettings{
  customEventsStartsAt : number;
}

export class Hsm{
  states : Array<State> = [];
}

export class RenderedHsm extends Hsm{
  executeBeforeDispatchCode: string;
  executeAfterCode: string;
  private eventSet : Set<string> = new Set();
  rootState : State;
  orderedStates : State[];
  inputIdToStateMapping : Map<string, State> = new Map();
  enumIdToStateMapping : Map<number, State> = new Map();
  nextStateId : number = 1;
  inputHsm : InputHsm;

  outputOldBadInitialName = true;
  shouldSimplifyInitialStateTransitions = false;
  h_file_top: string;

  //doesn't include custom event triggers
  reservedTriggers: string[] = [];

  constructor(){
    super();
  }

  addEvent(label : string){
    label = label.trim().replace(/^enter$|^entry$/ig, Triggers.ENTER);
    this.eventSet.add(label.toUpperCase());
    return label;
  }

  //allowed to return null
  getStateFromInputId_raw(inputId : string) : State{
    let state : State = this.inputIdToStateMapping.get(inputId) || null;
    return state;
  }

  getStateFromOutputId(id : number) : State {
    let state : State  = this.enumIdToStateMapping.get(id) || null;
    return state;
  }

  getStateFromInputId(inputId : string) : State{
    let state : State = this.inputIdToStateMapping.get(inputId);
    if(!state){
      console.log(inputId, state);
      throw "Not found!";
    }
    return state;
  }

  private addAndGetTrigger(triggerLabel : string) : Trigger{
    let trigger = this.addEvent(triggerLabel);
    return trigger;
  }

  private mangleCodeIntoFunctionName(code : string) : string {
    var result = code
        .replace(/\(\s*\)/g, "") //remove () for invocation
        .replace(/</g, "_is_lt_")
        .replace(/>/g, "_is_gt_")
        .replace(/==/g, "_eq_")
        .replace(/&&/g, "_and_")
        .replace(/\|\|/g, "_or_")
        .replace(/!/g, "_not_")
        .replace(/\(/g, "_Pp_")
        .replace(/\)/g, "_pP_")
        .replace(/\[/g, "_Bb_") //[ = _Bb_
        .replace(/\]/g, "_bB_")
        .replace(/\W/g, "")
        ;
        //.toLowerCase();
    return result;
  }

  private genFunctionNamePart(code : string) : string{
    let name : string;
    code = code.trim() + "_" + Math.round(Math.random()*10000); //TODO keep track of used names to ensure unique or resuse where possible
    name = this.mangleCodeIntoFunctionName(code);
    name = name.substr(0,50);
    return name;
  }

  private maybeCreateGuard(code : string){
    let guard : Guard = null;
    if(code && code.trim()){
      code = code.trim();
      let name = this.mangleCodeIntoFunctionName(code);
      guard = new Guard();
      guard.name = name;
      guard.guardCode = code;
    }
    return guard;
  }

  private maybeCreateAction(code : string){
    let action : Action = null;
    if(code && code.trim()){
      code = code.trim();
      let name = this.mangleCodeIntoFunctionName(code);
      action = new Action();
      action.name = name;
      action.actionCode = code;
    }
    return action;
  }

  private processInputEventHandler(ih : InputEventHandler){
    //look through nextInputStateId and create links
    var eh = new EventHandler();
    eh.guard = this.maybeCreateGuard(ih.guard);
    eh.action = this.maybeCreateAction(ih.action);
    eh.stopsPropagation = ih.stopsPropagation;
    eh.nextState = this.getStateFromInputId_raw(ih.nextInputStateId);
    eh.order = ih.order;

    for (let i = 0; i < ih.triggers.length; i++) {
        eh.addTrigger( this.addAndGetTrigger(ih.triggers[i]) );
    }
    //console.log(eh);
    return eh;
  }

  private setupStateEventHandlers(state : State){
    for (let i = 0; i < state.inputState.eventHandlers.length; i++) {
      let inputEH = state.inputState.eventHandlers[i];
      state.addEventHandlers([this.processInputEventHandler(inputEH)] );
    }
  }

  public getAllStates() : State[]{
    if (this.orderedStates) {
      return this.orderedStates;
    }

    var result = Array.from(this.inputIdToStateMapping.values());
    return result;
  }

  
  public getAllNonDirectiveInputEventNames() : string[] {
    var result = Array.from(this.eventSet.keys());
    result.sort(); //to help improve git diffing

    for (var i = 0; i < result.length; i++) {
      var element = result[i];
      if(Triggers.isPseudoEventName(element)){
        result.splice(i, 1);
        i--;
      }
    }

    return result;
  }

  private setupAllStateEventHandlers(){
    for (const state of this.getAllStates()) {
      this.setupStateEventHandlers(state);
    }
  }

  addState(state : State){
    //figure out mapping from input state string ID to state so that
    //we can establish links later
    if(this.inputIdToStateMapping.has(state.inputState.id)){
      console.log(state.inputState);
      throw "Input State ID already added!!!"
    } else {
      this.inputIdToStateMapping.set(state.inputState.id, state);
    }

    //determine output IDs
    if(state.label == ROOT_STATE_LABEL){ //TODO review ==
      this.rootState = state;
    }
  }

  anyPlusSupport() {
    this.reservedTriggers = this.reservedTriggers.map(e => e.toUpperCase());    
    let anyPlusEvents = [...new Set([...this.reservedTriggers, ...this.getAllNonDirectiveInputEventNames()])];

    for (const state of this.getAllStates()) {
      let newHandlers : EventHandler[] = [];

      if (state.eventHandlers.length == 0) {
        continue;
      }

      for (const eh of state.eventHandlers) {
        if (eh.hasTrigger(Triggers.ANY_PLUS)) {
          if (eh.triggersCount() > 1) {
            throw "can't combine other events with ANY+. Doesn't make sense.";
          }
          if (eh.nextState) {
            throw "ANY+ can't be used for a transition. You'll have to use ANY instead.";
          }

          for (const anyPartTrigger of anyPlusEvents) {
            let newEh = eh.deepCopy();
            newEh.setTriggers([anyPartTrigger]);
            newHandlers.push(newEh);
          }
        } else {
          newHandlers.push(eh);
        }
      }

      while(state.eventHandlers.length > 0) {
        state.removeEventHandler(state.eventHandlers[0]);
      }
      
      for (const eh of newHandlers) {
        state.addEventHandlers([eh]);
      }
    }
  }

  numberTreeFrom(state : State){
    let next = state.outputId + 1;

    //do some other tracking while looping tree
    this.enumIdToStateMapping.set(state.outputId, state);

    for(let kid of state.kids) {
      kid.depth = state.depth + 1;
      kid.outputId = next;
      this.numberTreeFrom(kid);
      next = kid.max_descendant_id + 1;
    }

    state.max_descendant_id = next -1;
  }

  validateOrthogonalFrom(state : State){
    let orthoCount = 0;
    let otherCount = 0;
    for(let kid of state.kids) {
      if(kid.inputState.is_orthogonal()){
        orthoCount++;
        state.is_ortho_parent = true;
      }else{
        otherCount++;
      }
      this.validateOrthogonalFrom(kid);
    }

    if(orthoCount > 0 && otherCount > 0){
      console.log()
      throw new Error(`State '${state.label}' has mix of ortho/normal kids. They must all be ortho or not ortho.`);
    }
  }

  sortOrthogonalStates(state : State){
    if(state.is_ortho_parent){
      state.kids = state.kids.sort(function(a:State, b:State):number{
        let result = a.inputState.orthogonal_order - b.inputState.orthogonal_order;
        return result;
      });
    }

    for(let kid of state.kids) {
      this.sortOrthogonalStates(kid);
    }
  }

  private validateInitialStates() {
    let states = this.getAllStates();

    for (const state of states) {
      var initialStates =  state.kids.filter(state => state.isInitialState);

      if (initialStates.length > 1) {
        console.log(initialStates);
        throw `State '${state.label}' can have only up to 1 initial states but it has count=${initialStates.length}.`;
      }

      if (initialStates.length == 1) {
        if (initialStates[0].eventHandlers.length == 0) {
          throw `Initial state for '${state.label}' must have a transition`;
        }
        if (initialStates[0].incomingEventHandlers.length > 0) {
          //throw "initial state cannot have an incoming edge/transition";  //why not? It's convenient.
        }
      }
    }
  }

  private processAndValidateStateTransitions() {
    let states = this.getAllStates();

    for (const state of states) {
      let elseCount = 0;
      let eventTriggerCount = 0;

      for (const eh of state.eventHandlers) {

        if (Triggers.hasTransitionTrigger(eh.getTriggersSet()) && eh.nextState != null) {
          console.log(state, eh);
          throw "Cannot initiate a transition on a transition event";
        }

        if (eh.hasTrigger(Triggers.ELSE) == false) {
          //doesn't have else
          if (eh.order >= ELSE_TRANSITION_ORDER_OFFSET_NUMBER){
            throw "order exceeds limit";
          }

          if (eh.hasSomeTriggers()) {
            eventTriggerCount += eh.triggersCount();
          }
        } else {
          //has else
          if (elseCount > 0) {
            throw "Can only have one transition with `else`";
          }
          elseCount++;

          if (eh.nextState == null) {
            console.log(state, eh);
            throw "'else' keyword only valid on external transitions";
          }
          if (eh.order != DEFAULT_TRANSITION_ORDER_NUMBER) {
            console.log(state, eh);
            throw "don't specify an order for else. It will always be last.";
          }
          if(eh.triggersCount() > 1){
            console.log(state, eh);
            throw "can't combine any other triggers with 'else'";
          }
          if(eh.guard != null){
            console.log(state, eh);
            throw "can't combine guard with 'else'";
          }
          eh.order = ELSE_TRANSITION_ORDER_OFFSET_NUMBER;
        }
      } //end of event handlers

      if (elseCount > 0 && eventTriggerCount > 0) {
        console.log(state, state.eventHandlers);
        console.log(`Warning: Probably doesn't make sense to mix event triggers and else statements as the else will accept any event.`);
      }
    }
  }

  private splitBadlyGroupedEventHandlers() {

    for (const state of this.getAllStates()) {
      //need to split apart any event handlers that have both a transition trigger and a normal trigger
      let toAdd : EventHandler[] = [];
      for(let eh of state.eventHandlers) {
        let grouping = Triggers.groupTransitionTriggers(eh.getTriggers());
        if(grouping.isMixed()){
          let newEh = eh.deepCopy();
          eh.setTriggers(grouping.transitional); //leave original object with transitional triggers
          newEh.setTriggers(grouping.normal);    //cloned object keeps normal triggers
          toAdd.push(newEh);
        }
      }
      state.addEventHandlers(toAdd);
    }
  }

  private sortTransitionsForStates() {
    //sort transitions
    for (const state of this.getAllStates()) {
      state.sortEventHandlers(function(a:EventHandler, b:EventHandler):number{
        let result = a.order - b.order;
        return result;
      });
    }
  }

  private setupHeirachyLinks() {
    var rootFound = false;

    for (const state of this.getAllStates()) {
      if(state === this.rootState){
        rootFound = true;
      } else {
        let parentState = this.getStateFromInputId(state.inputState.parentId); 
        state.parent = parentState;
        state.parent.kids.push(state);
      }
    }

    if(!rootFound){
      console.log(this);
      throw "Failed to find root! Must match name: " + ROOT_STATE_LABEL;
    }
  }

  private moveInitialStatesBehindParents() {
    this.orderedStates = this.getAllStates();
    var statesToMove = this.getAllStates().filter(state => state.isInitialState);
    for (const stateToMove of statesToMove) {
      removeFromArray(this.orderedStates, stateToMove);
      let parentIndex = this.orderedStates.indexOf(stateToMove.parent);
      if (parentIndex < 0) {
        throw "couldn't find parent??? wut wut?";
      }
      let insertIndex = parentIndex + 1;
      this.orderedStates.splice(insertIndex, 0, stateToMove);
      removeFromArray(stateToMove.parent.kids, stateToMove);
      stateToMove.parent.kids.unshift(stateToMove);

      //see STATE-8
      if (this.outputOldBadInitialName) {
        stateToMove.label = stateToMove.parent.label + `__` + stateToMove.label;  //hack to make output the same as previous. Should someday clean up.
      }
    }
  }

  private makeBlankAction() : Action {
    let a = new Action();
    a.actionCode = "";
    return a;
  }

  private simplifyInitialStateTransitions() {
    let initialStates = this.getAllStates().filter(state => state.isInitialState);
    let actionCodeToAdd : string;

    for (const initialState of initialStates) {
      if (!initialState.parent.is_ortho_parent && initialState.parent.incomingEventHandlers.length > 0) {
        let eventualTarget : State;
        if (initialState.isComplexInitialState()) {
          eventualTarget = initialState;
        }
        else {
          eventualTarget = initialState.getSimpleInitialStateTranstion();

          let onlyTransition = initialState.eventHandlers[0];

          if (initialState.eventHandlers.length != 1) {
            throw "???";
          }

          if (onlyTransition.action && onlyTransition.action.actionCode) {
            actionCodeToAdd = onlyTransition.action.actionCode;
          }
          this.removeState(initialState);
        }

        //find all transitions to parent and move to optimized destination
        while (initialState.parent.incomingEventHandlers.length > 0) {
          let transitionToParent = initialState.parent.incomingEventHandlers[0]; //loop this way because retargetting will affect `intialState.parent.incomingEventHandlers`

          //add initialState's transition action code to transition if needed
          if (actionCodeToAdd) {
            if (transitionToParent.action) {
              transitionToParent.action.actionCode += "\n" + actionCodeToAdd;
            } else {
              transitionToParent.action = new Action();
              transitionToParent.action.actionCode = actionCodeToAdd;
            }
          }
          State.retargetTransition(transitionToParent, eventualTarget);
        }

        //TODOLOW consider putting some kind of handler back in for any skipped states to allow for dynamically setting state
        //ex: `S --> S1 --> S11` becomes `S --> S11` and `S1` has no handler to go to `S11` anymore.
      }
    }
  }

  removeState(state:State) {
    this.inputIdToStateMapping.delete(state.inputState.id);
    removeFromArray(this.orderedStates, state);
    removeFromArray(state.parent.kids, state);

    for (const eh of state.eventHandlers.filter(e => e.nextState)) {
      state.removeEventHandler(eh);
    }
    
    if (state.incomingEventHandlers.length > 0) {
      console.log(state.incomingEventHandlers);
      throw "can't remove state while it still has incoming edges";
    }
  }

  initialProcessAndValidate() {
    this.rootState.outputId = ROOT_STATE_ID;

    for (const state of this.getAllStates()) {
      state.is_ortho_kid = state.inputState.is_orthogonal();
      state.isInitialState = state.inputState.isInitialState;
    }
    
    this.setupHeirachyLinks();

    this.moveInitialStatesBehindParents();
    this.validateOrthogonalFrom(this.rootState);
    this.setupAllStateEventHandlers();
    this.anyPlusSupport();
    this.validateInitialStates();

    if (this.shouldSimplifyInitialStateTransitions)
    {
      this.simplifyInitialStateTransitions();
    }

    this.validateInitialStates();


    this.splitBadlyGroupedEventHandlers();
    this.processAndValidateStateTransitions();
    this.sortTransitionsForStates(); //has to happen after event handlers split and processed above
  }

  convertPseudoInitialStates() {
    let initial_states = this.getAllStates().filter(state => state.isInitialState);

    for (const state of initial_states) {
      let newParentEh = new EventHandler();

      //we know that the initial state has 1 or more event handlers because of prior validation
      if (state.isComplexInitialState())
      {
        //need to add event handler to transition parent state to pseudo initial state
        newParentEh.nextState = state;
        newParentEh.addTrigger(Triggers.LANDED_IN);
      }
      else {
        //simple initial state that can be removed
        newParentEh = state.eventHandlers[0]; //need to keep original transition's possible action code
        //newParentEh.nextState = state.eventHandlers[0].nextState;
        newParentEh.addTrigger(Triggers.LANDED_IN);
        newParentEh.guard = null; //we know it was just "true" or null at this point
        this.removeState(state);
      }

      state.parent.addEventHandlers([newParentEh]);
    }
  }


  /**
   * done so that states can be added and removed
   */
  finalizeStates() {
    this.numberTreeFrom(this.rootState);
    this.sortOrthogonalStates(this.rootState);  //needs to be done after `numberTreeFrom()` to keep same output as before
  }

  genSummaryText() : string {
    let output = "";
    
    let event_names = this.getAllNonDirectiveInputEventNames();
    event_names.sort();
    output += "INPUT EVENTS:\n"
    for(let input of event_names) {
      output += `  ${input}\n`;
    }
    output += "\n------------------------------------------\n\n"
    
    output += "this.hsm.inputHsm : \n";
    output += JSON.stringify(this.inputHsm, null, "\t");

    

    return output;
  }

}/////////////////







