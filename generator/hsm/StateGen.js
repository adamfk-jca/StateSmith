"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Compiler_1 = require("./Compiler");
const StringUtils_1 = require("../ts-utils/StringUtils");
const Generator_1 = require("./Generator");
const Triggers = require("./Triggers");
const nunjucks = require("nunjucks");
class StateGen {
    constructor(compiler) {
        this.stateEnumsPrefix = "StateId__";
        this.stateEnumsPostfix = "";
        this.stateEnumType = "";
        this.compiler = compiler;
    }
    genStateUniqueName(state) {
        let output = this.getFullPathNameToState(state);
        if (state == this.compiler.hsm.rootState) {
            output = "Root";
        }
        return output;
    }
    genStateEventHandlerName(state) {
        return this.genStateUniqueName(state) + "_handler";
    }
    genStateVarsTypedefName(state) {
        return this.compiler.classPrefix + "_" + this.genStateUniqueName(state) + "_Vars";
    }
    getFullPathNameToState(state, seperator = "__") {
        let output = "";
        let cur = state;
        let sep = "";
        while (cur != null) {
            let prepend = "";
            prepend = cur.label.toUpperCase();
            if (cur.is_ortho_parent && cur != state) {
                prepend += "__op__"; //meant to signify an ortho parent
            }
            else {
                prepend += sep;
            }
            output = prepend + output;
            sep = seperator;
            cur = cur.parent;
        }
        return output;
    }
    genStateEnumName(state) {
        let path = this.getFullPathNameToState(state);
        let output = "";
        output = this.compiler.buildClassEnumName(`${this.stateEnumsPrefix}${path}${this.stateEnumsPostfix}`);
        //let output = this.getStateEnumNameFromString(state.label) + "_S"+state.outputId;
        return output;
    }
    getStateEnumNameFromString(stateName) {
        // let output = "";
        // switch(stateName){
        //   // case ROOT_STATE_LABEL:
        //   //   output = "HSM_ROOT_ID";
        //   // break;
        //   default:
        //   output = this.compiler.buildClassEnumName(`${this.stateEnumsPrefix}${stateName.toUpperCase()}${this.stateEnumsPostfix}`);
        //   break;
        // }
        // return output;
        throw "not supported.";
    }
    allStates() {
        return this.compiler.hsm.getAllStates();
    }
    genStateVarsPrototypes() {
        // let output = "";
        // let states = this.allStates();
        // for(let state of states) {
        //   output += `typedef struct _${this.genStateVarsTypedefName(state)} ${this.genStateVarsTypedefName(state)};\n`;
        // }
        // output = StringUtils.alignStringMarkersSimple([" "," "," "], output);
        // output = "\n\n" + this.compiler.createCommentHeader(`State variable typedef prototypes for ${this.compiler.classFullName}`).trim() + "\n" + output;
        // return output;
        return "";
    }
    genStateVarInstanceName(state) {
        return this.genStateUniqueName(state).toLowerCase() + "_vars";
    }
    genStateVarStruct(state) {
        let output = "";
        let inner = "";
        for (let kid of state.kids) {
            inner += `\n<s>  ${this.genStateVarsTypedefName(kid)} ${this.genStateVarInstanceName(kid)};`;
        }
        if (state.kids.length > 0) {
            inner = inner.replace(/<s>/g, "<s>  "); //increase indent
            inner = StringUtils_1.StringUtils.alignRegexesInStringsSimple([/\b +\b/], inner); //align struct/union field names (which comes after field type).
            if (state.is_ortho_parent) {
                inner = `
        <s>  HsmContext orthoKidContexts[${state.kids.length}];
        <s>  struct 
        <s>  { //context variables for kids  ${inner}
        <s>  };
        `;
            }
            else {
                inner = `
        <s>  union 
        <s>  { //context variables for kids  ${inner}
        <s>  }; `;
            }
        }
        output += `
    <s>typedef struct _${this.genStateVarsTypedefName(state)}
    <s>{
    <s>  HsmStateBaseVars base_vars; ${inner}
    <s>} ${this.genStateVarsTypedefName(state)};
      `;
        output = StringUtils_1.StringUtils.processMarkers(output) + "\n\n\n";
        return output;
    }
    genStateVarsStructs() {
        let output = "";
        let states = this.allStates();
        let depth = 0;
        for (let state of states) {
            depth = Math.max(depth, state.depth);
        }
        for (; depth >= 0; depth--) {
            let fstates = states.filter(function (state) {
                return state.depth == depth;
            });
            for (let state of fstates) {
                output += this.genStateVarStruct(state);
            }
        }
        output = "\n\n" + this.compiler.createCommentHeader(`State variable structs for ${this.compiler.classFullName}`).trim() + "\n" + output;
        return output;
    }
    genStateDefinition(state) {
        let parent = state.parent;
        if (state.outputId == Compiler_1.ROOT_STATE_ID) {
            parent = state;
        }
        var output = `
    <s>  [${this.genStateEnumName(state)}] = {
    <s>    .name = "${state.label}", 
    <s>    .node = {
    <s>      .id = ${this.genStateEnumName(state)},
    <s>      .max_descendant_id = ${this.genStateEnumName(this.compiler.hsm.getStateFromOutputId(state.max_descendant_id))},
    <s>      .parent_id = ${this.genStateEnumName(parent)},
    <s>    },
    <s>    .event_handler = ${this.genStateEventHandlerName(state)},
    <s>    .vars_sizeof = sizeof(${this.genStateVarsTypedefName(state)}),
    <s>  },
     `;
        output = StringUtils_1.StringUtils.removeBlankLinesAtBottom(output);
        return output;
    }
    genEventHandlerPrototype(state) {
        return `static void ${this.genStateEventHandlerName(state)}(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)`;
    }
    genEventHandlerPrototypes() {
        let output = "\n\n";
        let states = this.allStates();
        output += this.compiler.createCommentHeader(`Handler Prototypes for ${this.compiler.classFullName}`).trim() + "\n";
        for (let state of states) {
            output += `${this.genEventHandlerPrototype(state)};\n`;
        }
        output = StringUtils_1.StringUtils.alignStringMarkersSimple(["("], output);
        return output;
    }
    genEventHanlderDefinitions() {
        let output = "";
        for (let state of this.allStates()) {
            output += "\n\n" + this.genEventHandlerDefinition(state);
        }
        return output;
    }
    genEventHandlerDefinition(state) {
        let inner = this.genEventHandlersForState(state);
        let output = `
    <s>${this.genEventHandlerPrototype(state)}
    <s>{
    <s>  event_handler_breakpoint(jxc, hsm, context, event);
    <s>  ${this.compiler.genStatemachineStructName()}* sm = (${this.compiler.genStatemachineStructName()}*)hsm;
    <s>  ${this.genStateVarsTypedefName(state)}* vars = &sm->${this.genStateTempVarPathFromRoot(state)};
    <s>  const HsmState* this_state = &states[${this.genStateEnumName(state)}];
    <s>  uint32_t current_time = get_general_ms_counts();
    <s>  uint32_t time_in_state = current_time - vars->base_vars.time_state_entered;
    <s>  const ${this.compiler.getInputEventEnumTypeName()} event_id = event->event_id;
    <s>  bool default_event_handled_value = true; //used to allow handlers to "not consume" an event and allow parent to process it.
    <s>  (void)jxc; (void)hsm; (void)context; (void)event; (void)this_state; (void)time_in_state; (void)event_id; (void)default_event_handled_value; //prevent compiler warnings
    ${inner}
    <s>}

    `;
        output = StringUtils_1.StringUtils.processMarkers(output);
        return output;
    }
    listTriggers(triggers) {
        let output = "";
        let sep = "";
        for (let trigger of triggers) {
            output += `${sep}${this.compiler.buildInputEventEnumName(trigger.toString())}`;
            sep = ", ";
        }
        return output;
    }
    listTriggersReadable(triggers) {
        let output = this.listTriggers(triggers);
        output = output.replace(/HsmEventId__/g, "");
        return output;
    }
    expand(textToExpand, preventExpand) {
        let output = textToExpand;
        if (preventExpand == false) {
            output = this.compiler.expander.expandText(textToExpand);
        }
        return output;
    }
    genHandlersForTrigger(eventHandlers, trigger) {
        let output = "";
        for (let handler of eventHandlers) {
            if (handler.hasTrigger(trigger)) {
                output += this.genEventHandler(handler);
            }
        }
        return output;
    }
    genEventHandler(eh) {
        let output = "";
        let expandedGuardCode = "";
        let triggerCode = "";
        if (eh.hasSomeTriggers()) {
            triggerCode = "(";
            let join = "";
            for (let trigger of eh.getTriggers()) {
                triggerCode += `${join}(event_id == ${this.compiler.buildInputEventEnumName(trigger.toString())})`;
                join = " || ";
            }
            triggerCode += ")";
        }
        if (eh.hasTrigger(Triggers.ELSE)) {
            triggerCode = "true";
        }
        let guardText = "";
        if (eh.guard) {
            guardText = eh.guard.guardCode;
            if (triggerCode) {
                expandedGuardCode += " && ";
            }
            expandedGuardCode += `(${this.expand(guardText, eh.noExpand)})`;
        }
        let actionCode = "";
        if (eh.action) {
            actionCode = `${this.expand(eh.action.actionCode, eh.noExpand)};`; //TODO someday: if external transition, use call back to call between exits and enters so that action code is actually run in middle of transition (AKA after all exits are fired).
            actionCode = "\n" + StringUtils_1.StringUtils.indent(actionCode, "<s>    ");
        }
        let transitionCode = "";
        if (eh.nextState) {
            transitionCode = `\n<s>    Hsm_mark_transition_request(jxc, hsm, context, this_state, ${this.genStateEnumName(eh.nextState)});`;
        }
        let if_guard_text = "";
        if (guardText) {
            if_guard_text = "if " + guardText;
        }
        let if_trigger_text = "";
        if (eh.hasSomeTriggers()) {
            if_trigger_text = `ON ${this.listTriggersReadable(eh.getTriggers())} `;
        }
        if (eh.hasTrigger(Triggers.ELSE)) {
            if_trigger_text = `ELSE `;
        }
        output += `
    <dummy>
    <s>  //${(eh.commentOverride || if_trigger_text + if_guard_text).replace(/[\r\n]+/g, " ").replace(/[ ]{2,}|\\t/g, " ")}
    `.trim();
        if (Triggers.hasTransitionTrigger(eh.getTriggersSet())) {
            eh.markContextHandled = false; //not applicable to these events
        }
        else {
            output += `
      <s>
      <s>  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
      `.trim();
        }
        let context_handled_text = `
    <s>    //mark that event has handled
    <s>    context->event_handled = default_event_handled_value;
    <r>`;
        if (eh.markContextHandled == false) {
            context_handled_text = "";
        }
        output += `
    <s>  if( ${triggerCode + expandedGuardCode}  ){ ${actionCode} ${transitionCode}${context_handled_text}
    <s>  }
    <s>
    `;
        output = StringUtils_1.StringUtils.processMarkers(output);
        return output;
    }
    genEventHandlersForState(state) {
        let output = "";
        if (state.is_ortho_parent) {
            output = this.genOrthoParentEventHandlers(state);
        }
        else {
            output = this.genNormalStateEventHandlers(state);
        }
        return output;
    }
    genOrthoParentEventHandlers(state) {
        let inner = "";
        let output = "";
        //add event handlers specific to being an ortho parent
        let event = new Generator_1.EventHandler();
        let actionCode;
        //EXIT EVENT
        event = new Generator_1.EventHandler();
        event.action = new Generator_1.Action();
        event.setTriggers([Triggers.EXIT]);
        actionCode = nunjucks.renderString(`<r>
      <s>//loop through ortho kids and exit any of them that are still running
      <s>Hsm_exit_okids(jxc, hsm, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts));
      <r>`, { compiler: this, state: state });
        event.action.actionCode = StringUtils_1.StringUtils.processMarkers(actionCode);
        output += this.genEventHandler(event);
        output += this.genHandlersForTrigger(state.eventHandlers, Triggers.EXIT);
        //ENTER EVENT
        //generate this state's regular user defined enter action
        output += this.genHandlersForTrigger(state.eventHandlers, Triggers.ENTER); //BUG FIX! the enter event for the parent must come before childrens.
        //generate special entry code for being an ortho parent
        event = new Generator_1.EventHandler();
        event.action = new Generator_1.Action();
        event.setTriggers([Triggers.ENTER]);
        actionCode = nunjucks.renderString(`<r>
      <s>//setup orthogonal kid contexts
      <s>Hsm_set_contexts_region_parent_id(jxc, hsm, this_state->node.id, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts));
      {%- for kid in state.kids %}
      <s>vars->orthoKidContexts[{{loop.index0}}].region_top_state_id = {{compiler.stateGen.genStateEnumName(kid)}};
      {%- endfor %}      
      <s>Hsm_handle_ortho_kids_enter(jxc, hsm, context, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts)); 

    `, { compiler: this.compiler, state: state });
        event.action.actionCode = StringUtils_1.StringUtils.processMarkers(actionCode);
        output += this.genEventHandler(event);
        //LANDED_IN EVENT
        output += this.genHandlersForTrigger(state.eventHandlers, Triggers.LANDED_IN);
        //rest of events.
        let nonTransitionHandlers = Triggers.getNonTransitionTriggerHandlers(state);
        let customEventHandlers = [];
        let doEventHandlers = [];
        //render 
        nonTransitionHandlers.filter(function (handler) {
            if (handler.hasTrigger(Triggers.DO)) {
                //TODO HIGH - do not differentiate! It causes problems if DO event is joined with something custom like "(DO || MY_EVENT) / action".
                // why? Because being lumped in with the DO event prevents the check of event already handled.
                doEventHandlers.push(handler);
            }
            else {
                customEventHandlers.push(handler);
            }
        });
        //EVENT proxying + do
        event = new Generator_1.EventHandler();
        event.action = new Generator_1.Action();
        //enterEvent.triggers = new Set<Trigger>([Triggers.ORTHO_PROXY]);
        event.guard = new Generator_1.Guard();
        event.noExpand = true;
        event.commentOverride = "Proxy events to orthogonal kids";
        event.guard.guardCode = "Hsm_event_part_of_transition(event) == false";
        actionCode = `<r>
      <s>Hsm_handle_ortho_kids_event(jxc, hsm, context, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts), event);
      <s>vTRY_BUBBLE_EXCEPTION();
      <s>
      <s>//break if ortho kids triggered a transition above their level
      <s>if (Hsm_is_transition_requested(context)) {
      <s>  return;
      <s>}
      <s>
      <s>//this ortho parent state should only do something with the event if none of its ortho kids has handled it
      <s>if (event->event_id == HsmEventId__DO) 
      <s>{
      <s>  //ortho parent does the DO event like normal
      <s>  ${this.genEventHandlersForArray(doEventHandlers)}
      <s>} 
      <s>if (event->event_id == HsmEventId__DO || context->event_handled == false || event->event_id == HsmEventId__TEST_TRANSITIONS) 
      <s>{
      <s>  //only handle events in parent state if kids hadn't already dealt with it
      <s>  ${this.genEventHandlersForArray(customEventHandlers)}
      <s>}
      <s><r>`;
        event.action.actionCode = StringUtils_1.StringUtils.processMarkers(actionCode);
        event.markContextHandled = false; //not applicable to this event
        output += this.genEventHandler(event);
        return output;
    }
    genEventHandlersForArray(eventHandlers) {
        let output = "";
        for (let eh of eventHandlers) {
            output += this.genEventHandler(eh);
        }
        return output;
    }
    genNormalStateEventHandlers(state) {
        let output = "";
        let joiner = "\n  ";
        let handlers = state.eventHandlers.slice(0);
        let restOfEvents = new Set(state.eventHandlers);
        let hh;
        var tthis = this;
        //render EXIT first
        hh = new Set(restOfEvents);
        hh.forEach(function (e, notNeeded, set) {
            if (e.hasTrigger(Triggers.EXIT)) {
                output += joiner + tthis.genEventHandler(e);
                restOfEvents.delete(e);
            }
        });
        //render ENTER next
        hh = new Set(restOfEvents);
        hh.forEach(function (e, notNeeded, set) {
            if (e.hasTrigger(Triggers.ENTER)) {
                output += joiner + tthis.genEventHandler(e);
                restOfEvents.delete(e);
            }
        });
        //render LANDED_IN next
        hh = new Set(restOfEvents);
        hh.forEach(function (e, notNeeded, set) {
            if (e.hasTrigger(Triggers.LANDED_IN)) {
                output += joiner + tthis.genEventHandler(e);
                restOfEvents.delete(e);
            }
        });
        output += StringUtils_1.StringUtils.processMarkers(`
      <s>
      <s>  //------------- END OF TRANSITION HANDLERS --------------------
      <s>  if (Hsm_event_part_of_transition(event)) { 
      <s>    return; 
      <s>  }    
      <s>
    `);
        //render DO next
        //FUTURE TODO - don't treat do any differently. This will help for upcoming event ordering.
        hh = new Set(restOfEvents);
        hh.forEach(function (e, notNeeded, set) {
            if (e.hasTrigger(Triggers.DO)) {
                output += joiner + tthis.genEventHandler(e);
                restOfEvents.delete(e);
            }
        });
        //render normal rest
        hh = new Set(restOfEvents);
        hh.forEach(function (e, notNeeded, set) {
            output += joiner + tthis.genEventHandler(e);
            restOfEvents.delete(e);
        });
        return output;
    }
    classPrefix() { return this.compiler.classPrefix; }
    sep() { return this.compiler.sep; }
    isRoot(state) {
        return state == this.compiler.hsm.rootState;
    }
    genStateTempVarPathFromRoot(state) {
        let output = "";
        let joiner = "";
        do {
            output = this.genStateVarInstanceName(state) + joiner + output;
            state = state.parent;
            joiner = ".";
        } while (state != null);
        return output;
    }
    genStateIdCountEnumName() {
        return this.compiler.buildClassEnumName("STATE_COUNT");
    }
    genStateEnums(states) {
        let output = "";
        output += this.compiler.createCommentHeader(`Enumeration for all ${this.compiler.classFullName} state IDs`).trim() + "\n";
        output += `typedef enum _${this.stateEnumType}\n{\n`;
        let rootState;
        let inner = "";
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            if (state === this.compiler.hsm.rootState) {
                rootState = state;
                //inner += `  ${this.getStateEnumName(state)} = ${HSM_ROOT_STATE_ENUM_ID},\n`;
            }
            inner += `  ${this.genStateEnumName(state)} = ${state.outputId},\n`;
        }
        inner = StringUtils_1.StringUtils.alignRegexInStringsSimple(/=/, inner);
        output += inner;
        output += "  //--------------------------\n";
        output += `  ${this.genStateIdCountEnumName()} = ${states.length},\n`;
        output += `} ${this.stateEnumType};\n`;
        output += `static_assert(${this.genStateEnumName(rootState)} == ${Compiler_1.ROOT_STATE_ID}, "'${this.genStateEnumName(rootState)}' must equal ${Compiler_1.ROOT_STATE_ID} for root state");`;
        return output;
    }
    genStateInstanceName(state) {
        return this.compiler.classPrefix + "_" + this.genStateUniqueName(state) + "_ref";
    }
    genStateExternStateInstances(states) {
        //const HsmState * const ButSm_State_ROOT_STATE_S0 = &states[ButSm_StateId__ROOT_STATE_S0];
        let moreOutput = `\n`;
        for (let state of states) {
            moreOutput += `extern const HsmState * const ${this.genStateInstanceName(state)};\n`;
        }
        return moreOutput;
    }
    genStateDefinitions(states) {
        let innerString = "";
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            innerString += this.genStateDefinition(state);
        }
        let output = "";
        output += `
      <s>static HsmState const states[${this.genStateIdCountEnumName()}] = {
        ${innerString}
      <s>};
    <r>`;
        //const HsmState * const ButSm_State_ROOT_STATE_S0 = &states[ButSm_StateId__ROOT_STATE_S0];
        let moreOutput = `\n`;
        for (let state of states) {
            moreOutput += `const HsmState * const ${this.genStateInstanceName(state)} = &states[${this.genStateEnumName(state)}];\n`;
        }
        moreOutput = StringUtils_1.StringUtils.alignStringMarkersSimple(["="], moreOutput);
        output += moreOutput;
        output = StringUtils_1.StringUtils.processMarkers(output);
        output = this.compiler.createCommentHeader(`'${this.compiler.classFullName}' STATE DEFINITION`) + output;
        return output;
    }
}
exports.StateGen = StateGen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVHZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTdGF0ZUdlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxRDtBQUVyRCx5REFBc0Q7QUFDdEQsMkNBQW1FO0FBQ25FLHVDQUFzQztBQUN0QyxxQ0FBcUM7QUFHckM7SUFPRSxZQUFhLFFBQW1CO1FBTmhDLHFCQUFnQixHQUFZLFdBQVcsQ0FBQztRQUN4QyxzQkFBaUIsR0FBWSxFQUFFLENBQUM7UUFDaEMsa0JBQWEsR0FBWSxFQUFFLENBQUM7UUFLMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUVELGtCQUFrQixDQUFDLEtBQVc7UUFDNUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELEVBQUUsQ0FBQSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQSxDQUFDO1lBQ3ZDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELHdCQUF3QixDQUFDLEtBQVk7UUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDckQsQ0FBQztJQUVELHVCQUF1QixDQUFDLEtBQVk7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxLQUFhLEVBQUUsU0FBUyxHQUFHLElBQUk7UUFDcEQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztRQUNoQixJQUFJLEdB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