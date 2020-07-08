"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Misc_1 = require("../ts-utils/Misc");
class State {
    constructor() {
        this._eventHandlers = [];
        this.eventHandlers = this._eventHandlers;
        this._incomingEventHandlers = [];
        this.incomingEventHandlers = this._incomingEventHandlers;
        this.kids = [];
        this.is_ortho_parent = false;
        this.depth = 0;
    }
    isAncestorOf(otherState) {
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
    static retargetTransition(transition, newTarget) {
        Misc_1.removeFromArray(transition.nextState._incomingEventHandlers, transition);
        transition.nextState = newTarget;
        newTarget._incomingEventHandlers.push(transition);
    }
    removeEventHandler(eh) {
        if (eh.nextState) {
            Misc_1.removeFromArray(eh.nextState._incomingEventHandlers, eh);
        }
        Misc_1.removeFromArray(this._eventHandlers, eh);
    }
    addEventHandlers(handlers) {
        for (const eh of handlers) {
            this._eventHandlers.push(eh);
            if (eh.nextState) {
                eh.nextState._incomingEventHandlers.push(eh);
            }
        }
    }
    sortEventHandlers(compareFunc) {
        this._eventHandlers.sort(compareFunc);
    }
}
exports.State = State;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDJDQUFtRDtBQUVuRDtJQUFBO1FBSVUsbUJBQWMsR0FBeUIsRUFBRSxDQUFDO1FBQ2xELGtCQUFhLEdBQWlDLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDMUQsMkJBQXNCLEdBQXlCLEVBQUUsQ0FBQztRQUMxRCwwQkFBcUIsR0FBaUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1FBR2xGLFNBQUksR0FBYSxFQUFFLENBQUM7UUFHcEIsb0JBQWUsR0FBYSxLQUFLLENBQUM7UUFDbEMsVUFBSyxHQUFZLENBQUMsQ0FBQztJQWdFckIsQ0FBQztJQTNEQyxZQUFZLENBQUMsVUFBa0I7UUFFN0IsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sOEJBQThCLENBQUM7UUFDdkMsQ0FBQztRQUNELE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFDOUYsQ0FBQztJQUVELHFCQUFxQjtRQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0seUNBQXlDLENBQUM7UUFDbEQsQ0FBQztRQUVELHlEQUF5RDtRQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQztJQUNySSxDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCw4QkFBOEI7UUFDNUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSx5Q0FBeUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxNQUFNLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBeUIsRUFBRSxTQUFpQjtRQUNwRSxzQkFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDekUsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDakMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsRUFBaUI7UUFDbEMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDakIsc0JBQWUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFDRCxzQkFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGdCQUFnQixDQUFDLFFBQXlCO1FBQ3hDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEVBQUUsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUdELGlCQUFpQixDQUFDLFdBQXdEO1FBQ3hFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7Q0FDRjtBQTlFRCxzQkE4RUMifQ==