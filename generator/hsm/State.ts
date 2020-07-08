
import { InputState, EventHandler, RenderedHsm } from "./Generator";
import { removeFromArray } from "../ts-utils/Misc";

export class State {
  inputState : InputState;
  outputId : number;
  parent : State;
  private _eventHandlers : Array<EventHandler> = [];
  eventHandlers : ReadonlyArray<EventHandler> = this._eventHandlers;
  private _incomingEventHandlers : Array<EventHandler> = [];
  incomingEventHandlers : ReadonlyArray<EventHandler> = this._incomingEventHandlers;

  label: string;
  kids : State[] = [];
  max_descendant_id : number;
  is_ortho_kid : boolean;
  is_ortho_parent : boolean = false;
  depth : number = 0;
  //unique_label: string;
  //TODO state context
  isInitialState : boolean;

  isAncestorOf(otherState : State)
  {
    if (otherState.outputId == null || this.outputId == null) {
      throw "tree needs to be setup first";
    }
    return otherState.outputId > this.outputId && otherState.outputId <= this.max_descendant_id;
  }

  isComplexInitialState() {
    if (!this.isInitialState) {
      throw "you should check `isInitialState` first";
    }

    //TODOLOW optimize here for when it has an else statement
    return this.eventHandlers.length > 1 || this.eventHandlers[0].hasSomeTriggers() || this.eventHandlers[0].guard.guardCode != "true";
  }

  isSimpleInitialState() {
    return !this.isComplexInitialState();
  }

  getSimpleInitialStateTranstion() {
    if (!this.isSimpleInitialState()) {
      throw "you should check `isInitialState` first";
    }

    if (this.eventHandlers.length != 1) {
      throw "unexpected";
    }

    return this.eventHandlers[0].nextState;
  }

  static retargetTransition(transition : EventHandler, newTarget : State) {
    removeFromArray(transition.nextState._incomingEventHandlers, transition);
    transition.nextState = newTarget;
    newTarget._incomingEventHandlers.push(transition);
  }

  removeEventHandler(eh : EventHandler) {
    if (eh.nextState) {
      removeFromArray(eh.nextState._incomingEventHandlers, eh);
    }
    removeFromArray(this._eventHandlers, eh);
  }

  addEventHandlers(handlers : EventHandler[]) {
    for (const eh of handlers) {
      this._eventHandlers.push(eh);
      if (eh.nextState) {
        eh.nextState._incomingEventHandlers.push(eh);
      }
    }
  }


  sortEventHandlers(compareFunc:(a: EventHandler, b: EventHandler) => number) {
    this._eventHandlers.sort(compareFunc);
  }
}