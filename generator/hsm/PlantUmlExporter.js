"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const StringUtils_1 = require("../ts-utils/StringUtils");
const Triggers = require("./Triggers");
class DividedEventHandlers {
    constructor() {
        this.normal = [];
    }
}
exports.DividedEventHandlers = DividedEventHandlers;
class PlantUmlExporter {
    constructor() {
        this.stopAtCollapsed = true;
        this.showTransitions = true;
        this.showEventGuardActions = true;
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
        this.useShortUniqueNames = true;
        /** primarily used for anonymizing a structure before posting online */
        this.useIdsAsNames = false;
        this.shortUniqueNames = new Map();
    }
    getShortUniqueName(state) {
        let name = this.shortUniqueNames.get(state);
        if (name == null) {
            throw "No state found. make sure to preprocess.";
        }
        return name;
    }
    /**
     * Builds name by ascending up ancestry
     * @param state
     * @param maxLength
     */
    getUpwardChainName(state, maxLength) {
        let chainName = state.label;
        let curState = state;
        let count = 0;
        while (count < maxLength && curState.parent != null) {
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
    preProcess(inputStates, upwardLength) {
        let leafNames = new Map();
        for (let state of inputStates) {
            let label = this.getUpwardChainName(state, upwardLength);
            let states = leafNames.get(label) || [];
            states.push(state);
            leafNames.set(label, states);
        }
        for (let [key, states] of leafNames) {
            if (states.length == 1) {
                this.shortUniqueNames.set(states[0], key);
            }
            else if (states.length > 1) {
                //we have a conflict. recurse upwards until unique names generated.
                this.preProcess(states, upwardLength + 1);
            }
            else {
                throw "programming mistake...";
            }
        }
    }
    /** mostly copied from StateGen.ts */
    getStateFullName(state, seperator = ".") {
        let output = "";
        let cur = state;
        let sep = "";
        while (cur != null) {
            let prepend = "";
            prepend = cur.label.toUpperCase();
            prepend += sep;
            output = prepend + output;
            sep = seperator;
            cur = cur.parent;
        }
        return output;
    }
    getShownName(state) {
        let shownName = state.label;
        if (this.useIdsAsNames) {
            shownName = "State " + state.outputId;
        }
        return shownName;
    }
    /**
     *
     * @param resultArray
     * @param startingState
     */
    addStatesRecursivelyFrom(resultArray, startingState) {
        resultArray.push(startingState);
        for (let kid of startingState.kids) {
            this.addStatesRecursivelyFrom(resultArray, kid);
        }
        return resultArray;
    }
    buildOutputRecursively(startingState) {
        let output = this.buildOutput(startingState);
        let collapsedStates = this.collapsedStates;
        for (let state of collapsedStates) {
            output += "\n\n\n";
            output += this.buildOutputRecursively(state);
        }
        return output;
    }
    /**
     *
     * @param hsm
     */
    buildOutput(startingState) {
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
        let styles = { text: "" };
        let inner = this.renderSub(startingState, 0);
        output += styles.text;
        output += inner;
        output += "@enduml\n";
        return output;
    }
    /**
     *
     * @param input
     */
    escape(input) {
        return input.replace(/(\r\n|\r|\n)/g, "\\n");
    }
    /**
     *
     * @param state
     */
    divideEventHandlers(state) {
        let result = new DividedEventHandlers();
        for (let eh of state.eventHandlers) {
            if (eh.hasTrigger(Triggers.LANDED_IN)) {
                if (result.landed_in) {
                    throw "can't handle multiple!";
                }
                let newEh = eh.shallowCopy();
                result.landed_in = newEh;
                result.landed_in.setTriggers([]); //don't want "landed_in" trigger showing up
            }
            else {
                result.normal.push(eh);
            }
        }
        return result;
    }
    /**
     *
     * @param eh
     */
    getTriggerGuardActionTextParts(eh) {
        let result = { trigger: "", guard: "", action: "" };
        if (this.showEventGuardActions == false) {
            return result;
        }
        if (eh.hasSomeTriggers()) {
            result.trigger = `${eh.getTriggers().join(" || ")}`;
            if (eh.triggersCount() > 1) {
                result.trigger = `(${result.trigger})`;
            }
        }
        result.guard = (eh.guard) ? `[${eh.guard.guardCode}]` : "";
        result.action = (eh.action) ? ` / ${eh.action.actionCode}` : "";
        result.trigger = this.escape(result.trigger);
        result.guard = this.escape(result.guard);
        result.action = this.escape(result.action);
        return result;
    }
    getTriggerGuardActionText(eh) {
        let et = this.getTriggerGuardActionTextParts(eh);
        let output = `${et.trigger}${et.guard}${et.action}`;
        return output;
    }
    getTransitionText(eh) {
        let output = this.getTriggerGuardActionText(eh);
        if (output) {
            output = " : " + output;
        }
        return output;
    }
    getUniqueName(state) {
        let result;
        if (this.useIdsAsNames) {
            return `State_${state.outputId}`;
        }
        if (this.shortUniqueNames) {
            result = this.getShortUniqueName(state);
        }
        else {
            result = this.getStateFullName(state);
        }
        return result;
    }
    renderSub(state, depthCount) {
        let output = "";
        let thisUniqueName = this.getUniqueName(state);
        let eventHandlers = this.divideEventHandlers(state);
        let shownName = this.getShownName(state);
        let className = "";
        if (state.is_ortho_kid) {
            shownName = "ORTHO : " + shownName;
            className = "<<class_ortho>>";
        }
        let inner = "";
        //determine whether to show expanded state or not.
        //don't hide if this is the top of the current diagram being built.
        if (depthCount > 0 && this.stopAtCollapsed && state.inputState.groupIsCollapsed && state.kids.length > 0) {
            inner += `${thisUniqueName} : //COLLAPSED IN DIAGRAM\n`;
            this.collapsedStates.push(state);
        }
        else {
            //group is not collapsed in view or we should expand anyway
            if (eventHandlers.landed_in && this.showTransitions) {
                inner += `[*] --> ${this.getUniqueName(eventHandlers.landed_in.nextState)} ${this.getTransitionText(eventHandlers.landed_in)}\n`;
            }
            for (let kid of state.kids) {
                inner += this.renderSub(kid, depthCount + 1);
            }
            if (this.showEventGuardActions) {
                for (let eh of eventHandlers.normal) {
                    if (eh.nextState == null) {
                        inner += `${thisUniqueName} ${this.getTransitionText(eh)}\n`;
                    }
                }
            }
        }
        output += `state "${shownName}" as ${thisUniqueName}${className}`;
        output += ` {\n`; //NOTE: a state definition must always have brackets, otherwise plantuml will interpret it as a "weak" definition which leads to bugs as states can be defined by transitions. See `INIT` state of `ROOT.SYSTEM_STARTED.STUBBLE` in previous commit.
        if (inner) {
            inner = StringUtils_1.StringUtils.indent(inner, "  ");
            output += inner.replace(/[ \t]+$/, "");
        }
        output += `}`;
        output += `\n`;
        if (this.showTransitions) {
            for (let eh of eventHandlers.normal) {
                if (eh.nextState) {
                    //state --> next_state : action
                    output += `${thisUniqueName} --> ${this.getUniqueName(eh.nextState)} ${this.getTransitionText(eh)}\n`;
                }
            }
        }
        //output += "\n";
        return output;
    }
}
exports.PlantUmlExporter = PlantUmlExporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRVbWxFeHBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBsYW50VW1sRXhwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW1DRTs7QUFLRix5REFBc0Q7QUFDdEQsdUNBQXNDO0FBRXRDO0lBQUE7UUFFRSxXQUFNLEdBQWtCLEVBQUUsQ0FBQztJQUM3QixDQUFDO0NBQUE7QUFIRCxvREFHQztBQUVEO0lBQUE7UUFFRSxvQkFBZSxHQUFHLElBQUksQ0FBQztRQUN2QixvQkFBZSxHQUFHLElBQUksQ0FBQztRQUN2QiwwQkFBcUIsR0FBRyxJQUFJLENBQUM7UUFFN0I7Ozs7Ozs7OztXQVNHO1FBQ0gsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1FBRTNCLHVFQUF1RTtRQUN2RSxrQkFBYSxHQUFHLEtBQUssQ0FBQztRQUV0QixxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBaUIsQ0FBQztJQW9UOUMsQ0FBQztJQWhUQyxrQkFBa0IsQ0FBQyxLQUFhO1FBQzlCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFNUMsRUFBRSxDQUFBLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUM7WUFDZixNQUFNLDBDQUEwQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUdEOzs7O09BSUc7SUFDSCxrQkFBa0IsQ0FBQyxLQUFhLEVBQUUsU0FBa0I7UUFDbEQsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUM1QixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsT0FBTSxLQUFLLEdBQUcsU0FBUyxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFDLENB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