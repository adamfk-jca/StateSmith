"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MyRegex_1 = require("../ts-utils/MyRegex");
const State_1 = require("./State");
const Compiler_1 = require("./Compiler");
const Triggers = require("./Triggers");
const Misc_1 = require("../ts-utils/Misc");
const r = new MyRegex_1.MyRegex();
//TODOLOW someday make an actual class that stores original text & casing for trigger.
class Trigger extends String {
}
exports.Trigger = Trigger;
class Guard {
}
exports.Guard = Guard;
class Action {
}
exports.Action = Action;
exports.DEFAULT_TRANSITION_ORDER_NUMBER = 1000000;
exports.ELSE_TRANSITION_ORDER_OFFSET_NUMBER = exports.DEFAULT_TRANSITION_ORDER_NUMBER * 100;
class EventHandler {
    constructor() {
        /** if specified, it will determine which event handler should be checked first. Lower numbers take priority. */
        this.order = exports.DEFAULT_TRANSITION_ORDER_NUMBER;
        this.triggers = new Set(); //used because they must be unique anyway
        this.guard = null;
        this.action = null;
        this.nextState = null;
        this.stopsPropagation = false; //TODO support?
        this.noExpand = false; //TODO support?
        this.commentOverride = ""; //TODO support?
        this.markContextHandled = true; //TODO support?
    }
    setTriggers(triggers) {
        this.triggers = new Set();
        this.addTriggers(triggers);
    }
    addTriggers(triggers) {
        for (const t of triggers) {
            this.addTrigger(t);
        }
    }
    addTrigger(trigger) {
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
    getTriggersSet() {
        return this.triggers;
    }
    hasTrigger(trigger) {
        let result = this.triggers.has(trigger.toUpperCase());
        return result;
    }
    removeTriggers(triggers) {
        for (let trigger of triggers) {
            if (this.triggers.delete(trigger) == false) {
                throw `failed removing trigger '${trigger}'`;
            }
        }
    }
    shallowCopy() {
        let newEh = new EventHandler();
        newEh.set(this);
        return newEh;
    }
    deepCopy() {
        let newEh = new EventHandler();
        Misc_1.shallowCopyInto(newEh, this);
        newEh.triggers = new Set(this.triggers);
        newEh.action = deepCopy(this.action); //TODOLOW not ideal
        newEh.guard = deepCopy(this.guard); //TODOLOW not ideal
        return newEh;
    }
    set(eh) {
        Misc_1.shallowCopyInto(this, eh);
        return this;
    }
}
exports.EventHandler = EventHandler;
function deepCopy(obj) {
    let result = JSON.parse(JSON.stringify(obj));
    return result;
}
class InputEventHandler {
    constructor() {
        /** if specified, it will determine which event handler should be checked first. Lower numbers take priority. */
        this.order = exports.DEFAULT_TRANSITION_ORDER_NUMBER;
        this.triggers = [];
        this.guard = null;
        this.action = null;
        this.nextInputStateId = null;
        this.stopsPropagation = false;
    }
}
exports.InputEventHandler = InputEventHandler;
class InputState {
    constructor() {
        /** true if state is a folder/group in yed diagram and is currently closed. */
        this.groupIsCollapsed = false;
        this.eventHandlers = [];
        this.isInitialState = false;
        //TODO state context
    }
    is_orthogonal() {
        return this.orthogonal_order != null;
    }
}
exports.InputState = InputState;
class InputParsedVar {
}
exports.InputParsedVar = InputParsedVar;
class StructField {
    constructor() {
        this.preComment = "";
        this.lineComment = "";
    }
    //initialValue : string; //TODO maybee initial value for struct fields
    isArray() {
        return this.arraySize.trim().length > 0;
    }
    isBitField() {
        return this.bitFieldSize.trim().length > 0;
    }
}
exports.StructField = StructField;
class InputHsm {
    constructor() {
        this.states = [];
        this.varsStructInnerText = "";
        this.expansionDefinitions = ""; //like   'output_event(x) ====> hsm->vars.outputs.events.{{x}} == true;'
        this.executeBeforeCode = "";
        this.executeAfterCode = "";
        this.c_file_top = "";
        this.h_file_top = "";
        this.cFunctions = "";
        this.cFunctionsNoExp = "";
        this.cPrototypes = "";
        this.cPrototypesNoExp = "";
        this.inputValues = "";
        this.outputValues = "";
        this.outputEvents = "";
        this.imports = "";
        this.output_filename = "";
    }
}
exports.InputHsm = InputHsm;
class CompileSettings {
}
exports.CompileSettings = CompileSettings;
class Hsm {
    constructor() {
        this.states = [];
    }
}
exports.Hsm = Hsm;
class RenderedHsm extends Hsm {
    constructor() {
        super();
        this.eventSet = new Set();
        this.inputIdToStateMapping = new Map();
        this.enumIdToStateMapping = new Map();
        this.nextStateId = 1;
        this.outputOldBadInitialName = true;
        this.shouldSimplifyInitialStateTransitions = false;
        //doesn't include custom event triggers
        this.reservedTriggers = [];
    }
    addEvent(label) {
        label = label.trim().replace(/^enter$|^entry$/ig, Triggers.ENTER);
        this.eventSet.add(label.toUpperCase());
        return label;
    }
    //allowed to return null
    getStateFromInputId_raw(inputId) {
        let state = this.inputIdToStateMapping.get(inputId) || null;
        return state;
    }
    getStateFromOutputId(id) {
        let state = this.enumIdToStateMapping.get(id) || null;
        return state;
    }
    getStateFromInputId(inputId) {
        let state = this.inputIdToStateMapping.get(inputId);
        if (!state) {
            console.log(inputId, state);
            throw "Not found!";
        }
        return state;
    }
    addAndGetTrigger(triggerLabel) {
        let trigger = this.addEvent(triggerLabel);
        return trigger;
    }
    mangleCodeIntoFunctionName(code) {
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
            .replace(/\W/g, "");
        //.toLowerCase();
        return result;
    }
    genFunctionNamePart(code) {
        let name;
        code = code.trim() + "_" + Math.round(Math.random() * 10000); //TODO keep track of used names to ensure unique or resuse where possible
        name = this.mangleCodeIntoFunctionName(code);
        name = name.substr(0, 50);
        return name;
    }
    maybeCreateGuard(code) {
        let guard = null;
        if (code && code.trim()) {
            code = code.trim();
            let name = this.mangleCodeIntoFunctionName(code);
            guard = new Guard();
            guard.name = name;
            guard.guardCode = code;
        }
        return guard;
    }
    maybeCreateAction(code) {
        let action = null;
        if (code && code.trim()) {
            code = code.trim();
            let name = this.mangleCodeIntoFunctionName(code);
            action = new Action();
            action.name = name;
            action.actionCode = code;
        }
        return action;
    }
    processInputEventHandler(ih) {
        //look through nextInputStateId and create links
        var eh = new EventHandler();
        eh.guard = this.maybeCreateGuard(ih.guard);
        eh.action = this.maybeCreateAction(ih.action);
        eh.stopsPropagation = ih.stopsPropagation;
        eh.nextState = this.getStateFromInputId_raw(ih.nextInputStateId);
        eh.order = ih.order;
        for (let i = 0; i < ih.triggers.length; i++) {
            eh.addTrigger(this.addAndGetTrigger(ih.triggers[i]));
        }
        //console.log(eh);
        return eh;
    }
    setupStateEventHandlers(state) {
        for (let i = 0; i < state.inputState.eventHandlers.length; i++) {
            let inputEH = state.inputState.eventHandlers[i];
            state.addEventHandlers([this.processInputEventHandler(inputEH)]);
        }
    }
    getAllStates() {
        if (this.orderedStates) {
            return this.orderedStates;
        }
        var result = Array.from(this.inputIdToStateMapping.values());
        return result;
    }
    getAllNonDirectiveInputEventNames() {
        var result = Array.from(this.eventSet.keys());
        result.sort(); //to help improve git diffing
        for (var i = 0; i < result.length; i++) {
            var element = result[i];
            if (Triggers.isPseudoEventName(element)) {
                result.splice(i, 1);
                i--;
            }
        }
        return result;
    }
    setupAllStateEventHandlers() {
        for (const state of this.getAllStates()) {
            this.setupStateEventHandlers(state);
        }
    }
    addState(state) {
        //figure out mapping from input state string ID to state so that
        //we can establish links later
        if (this.inputIdToStateMapping.has(state.inputState.id)) {
            console.log(state.inputState);
            throw "Input State ID already added!!!";
        }
        else {
            this.inputIdToStateMapping.set(state.inputState.id, state);
        }
        //determine output IDs
        if (state.label == Compiler_1.ROOT_STATE_LABEL) {
            this.rootState = state;
        }
    }
    anyPlusSupport() {
        this.reservedTriggers = this.reservedTriggers.map(e => e.toUpperCase());
        let anyPlusEvents = [...new Set([...this.reservedTriggers, ...this.getAllNonDirectiveInputEventNames()])];
        for (const state of this.getAllStates()) {
            let newHandlers = [];
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
                }
                else {
                    newHandlers.push(eh);
                }
            }
            while (state.eventHandlers.length > 0) {
                state.removeEventHandler(state.eventHandlers[0]);
            }
            for (const eh of newHandlers) {
                state.addEventHandlers([eh]);
            }
        }
    }
    numberTreeFrom(state) {
        let next = state.outputId + 1;
        //do some other tracking while looping tree
        this.enumIdToStateMapping.set(state.outputId, state);
        for (let kid of state.kids) {
            kid.depth = state.depth + 1;
            kid.outputId = next;
            this.numberTreeFrom(kid);
            next = kid.max_descendant_id + 1;
        }
        state.max_descendant_id = next - 1;
    }
    validateOrthogonalFrom(state) {
        let orthoCount = 0;
        let otherCount = 0;
        for (let kid of state.kids) {
            if (kid.inputState.is_orthogonal()) {
                orthoCount++;
                state.is_ortho_parent = true;
            }
            else {
                otherCount++;
            }
            this.validateOrthogonalFrom(kid);
        }
        if (orthoCount > 0 && otherCount > 0) {
            console.log();
            throw new Error(`State '${state.label}' has mix of ortho/normal kids. They must all be ortho or not ortho.`);
        }
    }
    sortOrthogonalStates(state) {
        if (state.is_ortho_parent) {
            state.kids = state.kids.sort(function (a, b) {
                let result = a.inputState.orthogonal_order - b.inputState.orthogonal_order;
                return result;
            });
        }
        for (let kid of state.kids) {
            this.sortOrthogonalStates(kid);
        }
    }
    validateInitialStates() {
        let states = this.getAllStates();
        for (const state of states) {
            var initialStates = state.kids.filter(state => state.isInitialState);
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
    processAndValidateStateTransitions() {
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
                    if (eh.order >= exports.ELSE_TRANSITION_ORDER_OFFSET_NUMBER) {
                        throw "order exceeds limit";
                    }
                    if (eh.hasSomeTriggers()) {
                        eventTriggerCount += eh.triggersCount();
                    }
                }
                else {
                    //has else
                    if (elseCount > 0) {
                        throw "Can only have one transition with `else`";
                    }
                    elseCount++;
                    if (eh.nextState == null) {
                        console.log(state, eh);
                        throw "'else' keyword only valid on external transitions";
                    }
                    if (eh.order != exports.DEFAULT_TRANSITION_ORDER_NUMBER) {
                        console.log(state, eh);
                        throw "don't specify an order for else. It will always be last.";
                    }
                    if (eh.triggersCount() > 1) {
                        console.log(state, eh);
                        throw "can't combine any other triggers with 'else'";
                    }
                    if (eh.guard != null) {
                        console.log(state, eh);
                        throw "can't combine guard with 'else'";
                    }
                    eh.order = exports.ELSE_TRANSITION_ORDER_OFFSET_NUMBER;
                }
            } //end of event handlers
            if (elseCount > 0 && eventTriggerCount > 0) {
                console.log(state, state.eventHandlers);
                console.log(`Warning: Probably doesn't make sense to mix event triggers and else statements as the else will accept any event.`);
            }
        }
    }
    splitBadlyGroupedEventHandlers() {
        for (const state of this.getAllStates()) {
            //need to split apart any event handlers that have both a transition trigger and a normal trigger
            let toAdd = [];
            for (let eh of state.eventHandlers) {
                let grouping = Triggers.groupTransitionTriggers(eh.getTriggers());
                if (grouping.isMixed()) {
                    let newEh = eh.deepCopy();
                    eh.setTriggers(grouping.transitional); //leave original object with transitional triggers
                    newEh.setTriggers(grouping.normal); //cloned object keeps normal triggers
                    toAdd.push(newEh);
                }
            }
            state.addEventHandlers(toAdd);
        }
    }
    sortTransitionsForStates() {
        //sort transitions
        for (const state of this.getAllStates()) {
            state.sortEventHandlers(function (a, b) {
                let result = a.order - b.order;
                return result;
            });
        }
    }
    setupHeirachyLinks() {
        var rootFound = false;
        for (const state of this.getAllStates()) {
            if (state === this.rootState) {
                rootFound = true;
            }
            else {
                let parentState = this.getStateFromInputId(state.inputState.parentId);
                state.parent = parentState;
                state.parent.kids.push(state);
            }
        }
        if (!rootFound) {
            console.log(this);
            throw "Failed to find root! Must match name: " + Compiler_1.ROOT_STATE_LABEL;
        }
    }
    moveInitialStatesBehindParents() {
        this.orderedStates = this.getAllStates();
        var statesToMove = this.getAllStates().filter(state => state.isInitialState);
        for (const stateToMove of statesToMove) {
            Misc_1.removeFromArray(this.orderedStates, stateToMove);
            let parentIndex = this.orderedStates.indexOf(stateToMove.parent);
            if (parentIndex < 0) {
                throw "couldn't find parent??? wut wut?";
            }
            let insertIndex = parentIndex + 1;
            this.orderedStates.splice(insertIndex, 0, stateToMove);
            Misc_1.removeFromArray(stateToMove.parent.kids, stateToMove);
            stateToMove.parent.kids.unshift(stateToMove);
            //see STATE-8
            if (this.outputOldBadInitialName) {
                stateToMove.label = stateToMove.parent.label + `__` + stateToMove.label; //hack to make output the same as previous. Should someday clean up.
            }
        }
    }
    makeBlankAction() {
        let a = new Action();
        a.actionCode = "";
        return a;
    }
    simplifyInitialStateTransitions() {
        let initialStates = this.getAllStates().filter(state => state.isInitialState);
        let actionCodeToAdd;
        for (const initialState of initialStates) {
            if (!initialState.parent.is_ortho_parent && initialState.parent.incomingEventHandlers.length > 0) {
                let eventualTarget;
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
                        }
                        else {
                            transitionToParent.action = new Action();
                            transitionToParent.action.actionCode = actionCodeToAdd;
                        }
                    }
                    State_1.State.retargetTransition(transitionToParent, eventualTarget);
                }
                //TODOLOW consider putting some kind of handler back in for any skipped states to allow for dynamically setting state
                //ex: `S --> S1 --> S11` becomes `S --> S11` and `S1` has no handler to go to `S11` anymore.
            }
        }
    }
    removeState(state) {
        this.inputIdToStateMapping.delete(state.inputState.id);
        Misc_1.removeFromArray(this.orderedStates, state);
        Misc_1.removeFromArray(state.parent.kids, state);
        for (const eh of state.eventHandlers.filter(e => e.nextState)) {
            state.removeEventHandler(eh);
        }
        if (state.incomingEventHandlers.length > 0) {
            console.log(state.incomingEventHandlers);
            throw "can't remove state while it still has incoming edges";
        }
    }
    initialProcessAndValidate() {
        this.rootState.outputId = Compiler_1.ROOT_STATE_ID;
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
        if (this.shouldSimplifyInitialStateTransitions) {
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
            if (state.isComplexInitialState()) {
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
        this.sortOrthogonalStates(this.rootState); //needs to be done after `numberTreeFrom()` to keep same output as before
    }
    genSummaryText() {
        let output = "";
        let event_names = this.getAllNonDirectiveInputEventNames();
        event_names.sort();
        output += "INPUT EVENTS:\n";
        for (let input of event_names) {
            output += `  ${input}\n`;
        }
        output += "\n------------------------------------------\n\n";
        output += "this.hsm.inputHsm : \n";
        output += JSON.stringify(this.inputHsm, null, "\t");
        return output;
    }
} /////////////////
exports.RenderedHsm = RenderedHsm;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiR2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaURBQTJDO0FBQzNDLG1DQUErQjtBQUMvQix5Q0FBNkQ7QUFDN0QsdUNBQXNDO0FBQ3RDLDJDQUFvRTtBQUdwRSxNQUFNLENBQUMsR0FBRyxJQUFJLGlCQUFPLEVBQUUsQ0FBQztBQUV4QixzRkFBc0Y7QUFDdEYsYUFBcUIsU0FBUSxNQUFNO0NBRWxDO0FBRkQsMEJBRUM7QUFFRDtDQUdDO0FBSEQsc0JBR0M7QUFFRDtDQUdDO0FBSEQsd0JBR0M7QUFHWSxRQUFBLCtCQUErQixHQUFHLE9BQU8sQ0FBQztBQUMxQyxRQUFBLG1DQUFtQyxHQUFHLHVDQUErQixHQUFHLEdBQUcsQ0FBQztBQUV6RjtJQUFBO1FBQ0UsZ0hBQWdIO1FBQ2hILFVBQUssR0FBRyx1Q0FBK0IsQ0FBQztRQUNoQyxhQUFRLEdBQWtCLElBQUksR0FBRyxFQUFXLENBQUMsQ0FBQyx5Q0FBeUM7UUFDL0YsVUFBSyxHQUFZLElBQUksQ0FBQztRQUN0QixXQUFNLEdBQWEsSUFBSSxDQUFDO1FBQ3hCLGNBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIscUJBQWdCLEdBQWMsS0FBSyxDQUFDLENBQUUsZUFBZTtRQUNyRCxhQUFRLEdBQWEsS0FBSyxDQUFDLENBQUMsZUFBZTtRQUMzQyxvQkFBZSxHQUFHLEVBQUUsQ0FBQyxDQUFPLGVBQWU7UUFDM0MsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLENBQUUsZUFBZTtJQW1FN0MsQ0FBQztJQWpFQyxXQUFXLENBQUMsUUFBb0I7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFvQjtRQUM5QixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFR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