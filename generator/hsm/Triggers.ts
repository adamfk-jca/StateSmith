import { Trigger, EventHandler } from "./Generator";
import { State } from "./State";

//ALL CONST EVENT NAMES MUST BE UPPER CASE!

export const EXIT = "EXIT";
export const ENTER = "ENTER";
export const LANDED_IN = "LANDED_IN";
export const TEST_TRANSITIONS = "TEST_TRANSITIONS"
export const DO = "DO";

export const ANY_PLUS = "ANY+";
export const ELSE = "ELSE";

export const ANY_NORMAL = "ANY";  //TODO use?


export function isHsmEvent(eventName : string) : boolean{
  let reserved = false;
  switch(eventName.toUpperCase()){
    case EXIT:
    case ENTER:
    case LANDED_IN:
    case DO:
    case TEST_TRANSITIONS:
      reserved = true;
    break;
  }
  return reserved;
}

export function isPseudoEventName(eventName : string) : boolean{
  let reserved = false;
  switch(eventName.toUpperCase()){
    case ELSE:
    case ANY_PLUS:
      reserved = true;
    break;
  }
  return reserved;
}

export function getNonTransitionTriggerHandlers(state : State) : EventHandler[]{
  let result : EventHandler[] = [];
  for(let eh of state.eventHandlers) {
    if(hasTransitionTrigger(eh.getTriggersSet()) == false){
      result.push(eh);
    }
  }
  return result;
}


export class CategorizedTrigger {
  transitional : Trigger[] = [];
  normal : Trigger[] = [];

  public isMixed() : boolean {
    let result = this.transitional.length > 0 && this.normal.length > 0;
    return result;
  }
}

export function groupTransitionTriggers(triggers: Trigger[]) : CategorizedTrigger {
  let result = new CategorizedTrigger();

  for(let trigger of triggers) {
    if(isTransitionEventName(trigger)){
      result.transitional.push(trigger);
    } else {
      result.normal.push(trigger);
    }
  }

  return result;
}

export function getHandlersByTrigger(state : State, triggerName : Trigger) : EventHandler[]{
  let result : EventHandler[] = [];
  for(let eh of state.eventHandlers) {
    if(eh.hasTrigger(triggerName)){
      result.push(eh);
    }
  }

  return result;
}


export function hasTransitionTrigger(triggers: ReadonlySet<Trigger>){
  if(triggers.has(EXIT)){ return true; }
  if(triggers.has(ENTER)){ return true; }
  if(triggers.has(LANDED_IN)){ return true; }
  return false;
}

export function isTransitionEventName(eventName : String) : boolean{
  let reserved = false;
  switch(eventName.toUpperCase()){
    case EXIT:
    case ENTER:
    case LANDED_IN:
      reserved = true;
    break;
  }
  return reserved;
}