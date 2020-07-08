"use strict";
/*
TODO
[ ] detect if state real or logical
[ ] ANY+ support
[ ] trace() support

*/
Object.defineProperty(exports, "__esModule", { value: true });
const Generator_1 = require("./Generator");
const input_1 = require("./input");
const State_1 = require("./State");
const StringUtils_1 = require("../ts-utils/StringUtils");
const MyRegex_1 = require("../ts-utils/MyRegex");
const Triggers = require("./Triggers");
const Misc_1 = require("../ts-utils/Misc");
const r = new MyRegex_1.MyRegex();
exports.ROOT_STATE_LABEL = "ROOT";
exports.ROOT_STATE_ID = 0;
class FlatCompiler {
    constructor() {
        this.hsm = new Generator_1.RenderedHsm();
        this.expander = new input_1.MacroExpander();
        this.inputValueFields = []; //TODO move to hsm
        this.outputValueFields = []; //TODO move to hsm
        this.outputEventFields = []; //TODO move to hsm
        this.classFullName = "ns_MySm";
        this.initialEntryActionCode = "";
    }
    expandUserMacrosAndGeneratorDirectives(text) {
        let output = text;
        let lastOutput = "";
        let iteration_count = 0;
        while (output != lastOutput) {
            lastOutput = output;
            output = this.replaceGeneratorDirectives(output);
            output = this.expander.expandText(output);
            iteration_count++;
            if (iteration_count > 100) {
                throw "Infinite loop in expansions detected. Check your expansions...";
            }
        }
        return output;
    }
    //TODO put in infinite loop handling
    replaceGeneratorDirectives(text) {
        let output;
        var tthis = this;
        //$stateNameToEnumName(PRESSED)
        output = text;
        output = this.expander.hideCommentAndStringInnards(text);
        output = output.replace(/[$]stateNameToEnumName[(]\s*(\w+)\s*[)]/g, function (match, stateName) {
            throw "No longer supported.";
            // let output = "";
            // output = tthis.stateGen.getStateEnumNameFromString(stateName);
            // return output;
        });
        output = output.replace(/[$][{]smStructName[}]/g, function (match) {
            let output = "";
            output = tthis.genStatemachineStructName();
            return output;
        });
        output = this.expander.unhideCommentAndStringInnards(output);
        return output;
    }
    compile(inputHsm) {
        this.hsm.inputHsm = inputHsm;
        let expansions = this.expandUserMacrosAndGeneratorDirectives(inputHsm.expansionDefinitions);
        this.expander.addMacroExpansions(expansions);
        //expand macros and remove yed //~ comments
        this.hsm.h_file_top = this.removeYedCommentsAndExpand(inputHsm.h_file_top);
        for (let i = 0; i < inputHsm.states.length; i++) {
            let inputState = inputHsm.states[i];
            let state = new State_1.State();
            state.label = inputState.label;
            state.inputState = inputState;
            this.hsm.addState(state);
        }
        this.inputValueFields = input_1.StructFieldParser.parse(this.hsm.inputHsm.inputValues);
        this.outputValueFields = input_1.StructFieldParser.parse(this.hsm.inputHsm.outputValues);
        this.outputEventFields = input_1.StructFieldParser.parse(this.hsm.inputHsm.outputEvents);
        this.hsm.reservedTriggers = [Triggers.ENTER, Triggers.EXIT, Triggers.DO];
        this.hsm.initialProcessAndValidate();
        //TODO don't render ROOT state. no point in having handlers in it.
        //optimization hack for now
        {
            let eh = new Generator_1.EventHandler();
            eh.guard = new Generator_1.Guard();
            eh.guard.guardCode = "true";
            eh.action = new Generator_1.Action();
            eh.action.actionCode = `sm->event_handled = true; //for loop efficiency`;
            this.hsm.rootState.addEventHandlers([eh]);
        }
        {
            let initial_states = this.hsm.getAllStates().filter(state => state.isInitialState);
            let tthis = this;
            function setInitialActionCode(state) {
                tthis.initialEntryActionCode = (state.eventHandlers[0].action || new Generator_1.Action()).actionCode || "";
            }
            for (const state of initial_states) {
                if (state.parent == this.hsm.rootState) {
                    this.rootInitialState = state;
                    setInitialActionCode(state);
                }
                if (state.isComplexInitialState()) {
                }
                else {
                    //simple initial state that can be removed
                    if (state.parent == this.hsm.rootState) {
                        this.rootInitialState = state.eventHandlers[0].nextState; //we know that the initial state has 1 event handler because of prior validation
                        setInitialActionCode(state);
                        this.hsm.removeState(state);
                    }
                }
            }
        }
        this.hsm.finalizeStates();
    }
    removeYedCommentsAndExpand(code) {
        let outputCode = "";
        if (code) {
            outputCode = code;
            outputCode = this.expandUserMacrosAndGeneratorDirectives(outputCode);
            outputCode = this.removeYedComments(outputCode);
            outputCode = StringUtils_1.StringUtils.removeBlankLines(outputCode);
        }
        return outputCode;
    }
    buildInputEventEnumName(label) {
        let output = "";
        switch (label.toUpperCase()) {
            case "ANY":
                let shouldThrow = 1;
                if (shouldThrow) {
                    throw "This should not be getting called";
                }
                break;
            default:
                output = `${this.getInputEventEnumTypeName()}__${label.toUpperCase()}`;
                break;
        }
        return output;
    }
    getInputEventEnumTypeName() {
        return `${this.classFullName}_EventId`;
    }
    genInputEventEnums() {
        let output = "";
        output += this.createCommentHeader(`Enumeration for all ${this.classFullName} input event IDs`);
        output += `typedef enum ${this.getInputEventEnumTypeName()}\n{\n`;
        let inputEvents = this.hsm.getAllNonDirectiveInputEventNames();
        let inner = "";
        //add in standard events first
        inner += `  ${this.buildInputEventEnumName(Triggers.DO)},\n`;
        for (let i = 0; i < inputEvents.length; i++) {
            let eventName = inputEvents[i];
            if (Triggers.isHsmEvent(eventName) || Triggers.isPseudoEventName(eventName)) {
                //do nothing
            }
            else {
                inner += `  ${this.buildInputEventEnumName(eventName)},\n`;
            }
        }
        inner = StringUtils_1.StringUtils.alignRegexInStringsSimple(/=/, inner);
        output += inner;
        output += `} ${this.getInputEventEnumTypeName()};\n`;
        return output;
    }
    createCommentHeader(header) {
        header = header.replace(new RegExp(r.nl, "g"), "\n* "); //replace all new lines so that we keep "*" on left side
        var output = `\n\n
/************************************************************************************************
* ${header}
************************************************************************************************/\n`;
        return output;
    }
    genEventHandlerType() {
        return `${this.classFullName}_EventHandler`;
    }
    genEventIdToStringFunctionName() {
        return `${this.classFullName}_InputEvent_to_string`;
    }
    genEventIdToStringPrototype() {
        let output = "";
        //hsm_t* hsm, uint32_t current_time
        output = `const char* ${this.genEventIdToStringFunctionName()}(${this.getInputEventEnumTypeName()} event_id)`;
        return output;
    }
    genEventIdToStringDefinition() {
        let output;
        output = this.createCommentHeader(`Function that translates a custom input event ID to a string\nNOTE: actual passed in enum values should be from '${this.getInputEventEnumTypeName()}'`);
        let inputEvents = this.hsm.getAllNonDirectiveInputEventNames();
        let switchInner = "";
        for (let i = 0; i < inputEvents.length; i++) {
            let eventName = inputEvents[i];
            if (Triggers.isHsmEvent(eventName) == false) {
                switchInner += `            case ${this.buildInputEventEnumName(eventName)}: str = "${eventName}"; break;\n`;
            }
        }
        if (switchInner.length == 0) {
            switchInner = "//no custom input events defined for this state machine";
        }
        else {
            switchInner = StringUtils_1.StringUtils.alignCompressedSwitch(switchInner).trim() + "\n";
        }
        output += StringUtils_1.StringUtils.properIndent(`
        ${this.genEventIdToStringPrototype()}
        {
          const char * str;
          switch(event_id)
          {
            ${switchInner}
            default: str = "??CUSTOM"; break;
          }

          return str;
        }
      `, "");
        return output;
    }
    genConstructorFunctionName() {
        return `${this.classFullName}_instance_init`;
    }
    genConstructorPrototype() {
        let output = "";
        output = `void ${this.genConstructorFunctionName()}(${this.genStatemachineStructName()}* sm)`;
        return output;
    }
    genConstructorDefinition() {
        let output = this.createCommentHeader(`Public constructor function for ${this.classFullName} state machine`);
        let peak = this.hsm.rootState;
        let actionCode = this.expandUserMacrosAndGeneratorDirectives(this.initialEntryActionCode);
        output += `${this.genConstructorPrototype()}\n{\n`;
        output += StringUtils_1.StringUtils.properIndent(`
${StringUtils_1.StringUtils.indent(actionCode, "      ")}
      enter_state(sm, ${this.classFullName}_StateId__${this.hsm.rootState.label});
${StringUtils_1.StringUtils.indent(this.genEnterCode(null, peak, this.rootInitialState), "      ")}
    }
    `, "");
        output += `\n`;
        return output;
    }
    genStatemachineVarStructName() {
        let output = `${this.classFullName}_Vars`;
        return output;
    }
    genStatemachineVarsStruct() {
        let output = "\n";
        output += this.createCommentHeader(`STRUCT for ${this.classFullName} variables `);
        output += `typedef struct ${this.genStatemachineVarStructName()}\n{\n`;
        let innards = this.hsm.inputHsm.varsStructInnerText || "  bool _unused;";
        output += Misc_1.indent(innards, " ", 0); //TODO auto detect if indentation required.
        output += "\n";
        output += `} ${this.genStatemachineVarStructName()};\n\n\n`;
        return output;
    }
    genStatemachineStructFieldsDefintion(headerText, structName, fields) {
        let output = "\n";
        output += this.createCommentHeader(`Struct for ${headerText}`);
        let innards = "";
        for (let field of fields) {
            innards += field.fullTextMatch.trim() + "\n";
        }
        output += StringUtils_1.StringUtils.properIndent(`
      typedef struct _${structName}
      {
        <innards_insert_point>
      } ${structName};
      `, "");
        output = output.replace(/^([ \t]*)<innards_insert_point>[ \t]*/gm, function (match, indent) {
            //console.log(`match: '${match}', indent:'${indent}'`);
            return StringUtils_1.StringUtils.properIndent(innards, indent);
        });
        //console.log(`output: '${output}'`);
        return output;
    }
    genStatemachineInputValuesStructName() {
        let output = `${this.classFullName}_InputValues`;
        return output;
    }
    genStatemachineInputValuesStruct() {
        if (this.inputValueFields.length == 0) {
            return "";
        }
        let output = this.genStatemachineStructFieldsDefintion(`input_values`, this.genStatemachineInputValuesStructName(), this.inputValueFields);
        return output;
    }
    genStatemachineOutputValuesStructName() {
        let output = `${this.classFullName}_OutputValues`;
        return output;
    }
    genStatemachineOutputValuesStruct() {
        if (this.outputValueFields.length == 0) {
            return "";
        }
        let output = this.genStatemachineStructFieldsDefintion(`output_values`, this.genStatemachineOutputValuesStructName(), this.outputValueFields);
        return output;
    }
    genStatemachineOutputEventsStructName() {
        let output = `${this.classFullName}_OutputEvents`;
        return output;
    }
    genStatemachineOutputEventsStruct() {
        if (this.outputEventFields.length == 0) {
            return "";
        }
        let output = this.genStatemachineStructFieldsDefintion(`output_events`, this.genStatemachineOutputEventsStructName(), this.outputEventFields);
        return output;
    }
    genStatemachineStructName() {
        return `${this.classFullName}`;
    }
    genStateIdTypeName() {
        return `${this.classFullName}_StateId`;
    }
    genStatemachineStruct() {
        let output = this.createCommentHeader(`STRUCT for ${this.classFullName} `);
        let inputValues = this.inputValueFields.length == 0 ? "" : `${this.genStatemachineInputValuesStructName()} input_values;\n\n`;
        let outputValues = this.outputValueFields.length == 0 ? "" : `${this.genStatemachineOutputValuesStructName()} output_values;\n\n`;
        let outputEvents = this.outputEventFields.length == 0 ? "" : `${this.genStatemachineOutputEventsStructName()} output_events;\n\n`;
        output += StringUtils_1.StringUtils.properIndent(`
      typedef struct ${this.genStatemachineStructName()}
      {
        bool event_handled;
        ${this.genStateIdTypeName()} state_id;

        ${inputValues}

        ${outputValues}

        ${outputEvents}

        ${this.genStatemachineVarStructName()} vars;
      } ${this.genStatemachineStructName()};
      `, "");
        output = "" + StringUtils_1.StringUtils.compressBlankLines(output);
        return output;
    }
    getOutputFilenameBase() {
        let result;
        if (this.hsm.inputHsm.output_filename) {
            result = this.hsm.inputHsm.output_filename;
        }
        else {
            //result = this.classFullName.toLowerCase().trim()
            result = this.classFullName.trim();
        }
        return result;
    }
    getSummaryFilename() {
        return this.getOutputFilenameBase() + "_summary.txt";
    }
    getHeaderFilename() {
        return this.getOutputFilenameBase() + ".h";
    }
    getSourceFilename() {
        return this.getOutputFilenameBase() + ".c";
    }
    genStateEnums() {
        let output = "";
        output += this.createCommentHeader(`Enumeration for all ${this.classFullName} state IDs`).trim() + "\n";
        output += `typedef enum ${this.genStateIdTypeName()}\n{\n`;
        let states = this.hsm.getAllStates();
        let inner = "";
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            inner += `  ${this.genStateIdTypeName()}__${state.label},\n`;
        }
        inner = StringUtils_1.StringUtils.alignRegexInStringsSimple(/=/, inner);
        output += inner;
        output += "  //--------------------------\n";
        output += `  ${this.classFullName}_StateCount,\n`;
        output += `} ${this.genStateIdTypeName()};\n`;
        return output;
    }
    removeYedComments(code, already_hidden = false) {
        if (already_hidden == false) {
            code = this.expander.hideCommentAndStringInnards(code);
        }
        //remove yed comments
        let tilde = this.expander.hideStringCharacters("~"); //tilde exists inside hidden comments. Need to hide it as well to match.
        code = code.replace(new RegExp(`^${r.mhs}//${tilde}.*${r.nl}`, "mg"), ""); //a full yed comment line "//~"
        code = code.replace(new RegExp(`^${r.mhs}/[*]${tilde}[^]*[*]/${r.nl}`, "mg"), ""); //a full yed comment line "/*~...*/"
        code = code.replace(new RegExp(`${r.mhs}//${tilde}.*$`, "mg"), ""); //a partial yed comment line "//~"
        code = code.replace(new RegExp(`${r.mhs}/[*]${tilde}[^]*[*]/`, "mg"), ""); //a partial yed comment line "/*~...*/"
        if (already_hidden == false) {
            code = this.expander.unhideCommentAndStringInnards(code);
        }
        return code;
    }
    postProcessCode(code) {
        code = this.expander.hideCommentAndStringInnards(code);
        //remove multiple redundant semicolons
        code = code.replace(/;(\s*;)+/g, ";");
        //remove yed comments
        code = this.removeYedComments(code, true);
        code = this.expander.unhideCommentAndStringInnards(code);
        //ensure file ends with a new line to avoid compiler warnings
        code = code.trim() + "\n";
        code = code.replace(new RegExp(`${r.nl}`, "g"), "\r\n");
        return code;
    }
    genPublicHeaderFile() {
        let fullOutput = this.genFileHeaderInfo() +
            `
#pragma once
#include <stdint.h>
#include <stdbool.h>

${this.hsm.h_file_top.trim()}
\n
` +
            this.genStateEnums() +
            this.genInputEventEnums() +
            this.genStatemachineInputValuesStruct() +
            this.genStatemachineOutputValuesStruct() +
            this.genStatemachineOutputEventsStruct() +
            this.genStatemachineVarsStruct() +
            this.genStatemachineStruct() +
            this.createCommentHeader("public functions") +
            this.genConstructorPrototype() + ";\n" +
            this.genEventIdToStringPrototype() + ";" +
            `
void ${this.classFullName}_dispatch_event(${this.classFullName}* sm, ${this.classFullName}_EventId event_id);

` +
            "";
        fullOutput = this.postProcessCode(fullOutput);
        return fullOutput;
    }
    genCustomPrototypes() {
        let output = this.buildExpandedSection("CUSTOM PROTOTYPES", this.hsm.inputHsm.cPrototypes);
        output += this.hsm.inputHsm.cPrototypesNoExp + "\n";
        return output;
    }
    buildExpandedSection(title, toExpand) {
        let output = "";
        toExpand = toExpand.trim();
        let text = this.expandUserMacrosAndGeneratorDirectives(toExpand);
        if (text) {
            output += this.createCommentHeader(title);
            output += text + "\n";
        }
        return output;
    }
    genEventHandlerPrototype(state) {
        return `static void ${state.label}_event_handler(${this.classFullName} *sm, ${this.classFullName}_EventId event_id)`;
    }
    genEventHandlerPrototypes() {
        let output = "\n\n";
        let states = this.hsm.getAllStates();
        output += this.createCommentHeader(`Handler Prototypes for ${this.classFullName}`).trim() + "\n";
        for (let state of states) {
            output += `${this.genEventHandlerPrototype(state)};\n`;
        }
        output = StringUtils_1.StringUtils.alignStringMarkersSimple(["("], output);
        return output;
    }
    genEventHanlderDefinitions() {
        let output = "";
        for (let state of this.hsm.getAllStates()) {
            output += "\n\n" + this.genEventHandlerDefinition(state);
        }
        return output;
    }
    genEventHandlerDefinition(state) {
        let inner = this.genNormalStateEventHandlers(state);
        let output = `
    <s>${this.genEventHandlerPrototype(state)}
    <s>{
    <s>  //TODO copy paste in entry and exit code in comments
    ${inner}
    <s>}

    `;
        output = StringUtils_1.StringUtils.processMarkers(output);
        return output;
    }
    genNormalStateEventHandlers(state) {
        let output = "";
        let joiner = "";
        // //render LANDED_IN next
        // hh = new Set<EventHandler>(restOfEvents);
        // hh.forEach(function(e: EventHandler, notNeeded: EventHandler, set: Set<EventHandler>){
        //   if(e.hasTrigger(Triggers.LANDED_IN)){
        //     output += joiner + tthis.genEventHandler(e);
        //     restOfEvents.delete(e);
        //   }
        // });
        for (const e of state.eventHandlers.filter(eh => !eh.hasTrigger(Triggers.ENTER) && !eh.hasTrigger(Triggers.EXIT))) {
            output += joiner + this.genEventHandler(state, e);
        }
        return output;
    }
    genEnterExitHandler(state, eh, skipEventTest = false) {
        let output = "";
        let expandedGuardCode = "";
        let guardText = "";
        let actionCode = "";
        if (eh.action) {
            actionCode += `${StringUtils_1.StringUtils.indent(eh.action.actionCode, "//")}\n`;
            actionCode += `${this.expandActionCode(state, eh, eh.noExpand)};`;
        }
        if (eh.guard && eh.guard.guardCode) {
            guardText = eh.guard.guardCode;
            expandedGuardCode += `(${this.expand(guardText, eh.noExpand)})`;
            output += `
      <s>      //if ${guardText}
      <s>      if ${expandedGuardCode}
      <s>      {
                  ${StringUtils_1.StringUtils.indent(actionCode, "<s>        ")}
      <s>      }
      `;
        }
        else if (actionCode) {
            output += `
        ${StringUtils_1.StringUtils.indent(actionCode, "<s>      ")}
      `;
        }
        if (eh.nextState) {
            throw "enter & exit can't transition"; //TODOLOW move to generator
        }
        output = StringUtils_1.StringUtils.processMarkers(output);
        return output;
    }
    getTxPeakState(from, dst) {
        if (from == dst) {
            return from.parent; //special case for self transitions
        }
        let peak = from;
        while (!peak.isAncestorOf(dst) && peak != dst) {
            peak = peak.parent;
        }
        return peak;
    }
    getStatesDownToDst(from, peak, dst) {
        let chain = [];
        let cur = dst;
        //special case for when self transitions
        if (from == dst) {
            return [from];
        }
        while (cur != peak) {
            chain.unshift(cur);
            cur = cur.parent;
        }
        return chain;
    }
    genEnterCode(from, peak, dst) {
        let inner = "";
        let chain = this.getStatesDownToDst(from, peak, dst);
        //may happen which child transitioning to parent
        if (chain.length == 0) {
            return "";
        }
        inner = chain.map(state => `  ${this.classFullName}_StateId__${state.label}`).join(",\n");
        //TODOLOW cleanup indenting
        let output = `${this.classFullName}_StateId states_to_enter[] = {
${inner}
};
enter_chain(sm, states_to_enter, COUNTOF(states_to_enter));`;
        return output;
    }
    genEventHandler(state, eh) {
        let output = "";
        let expandedGuardCode = "";
        let triggerCode = "";
        let triggerConditionWouldNeedBrackets = eh.triggersCount() > 1;
        let join = "";
        for (let trigger of eh.getTriggers()) {
            triggerCode += `${join}event_id == ${this.buildInputEventEnumName(trigger.toString())}`;
            join = " || ";
        }
        if (eh.hasTrigger(Triggers.ELSE)) {
            triggerCode = "true";
        }
        let guardText = "";
        if (eh.guard) {
            guardText = eh.guard.guardCode;
            if (triggerCode) {
                if (triggerConditionWouldNeedBrackets) {
                    triggerCode = `(${triggerCode})`; //surround in brackets so the && works properly
                }
                expandedGuardCode += " && ";
            }
            expandedGuardCode += `(${this.expand(guardText, eh.noExpand)})`;
        }
        let actionCode = "";
        if (eh.action) {
            actionCode = `${this.expandActionCode(state, eh, eh.noExpand)};`; //TODO someday: if external transition, use call back to call between exits and enters so that action code is actually run in middle of transition (AKA after all exits are fired).
            actionCode = "\n" + StringUtils_1.StringUtils.indent(actionCode, "<s>    ");
            //if check on DO at runtime because we can have multiple events together for a single handler
            actionCode = `
      <s>    if (event_id != ${this.classFullName}_EventId__DO) {
      <s>        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
      <s>    }
      ` + actionCode;
        }
        let transitionCode = "";
        if (eh.nextState) {
            let tthis = this;
            const peak = this.getTxPeakState(state, eh.nextState);
            transitionCode = `
        <s>    //transitioning from ${state.label} to ${eh.nextState.label}
        <s>    exit_upto(sm, ${tthis.classFullName}_StateId__${peak.label});
        <s>
        <s>    //enter states
                ${StringUtils_1.StringUtils.indent(this.genEnterCode(state, peak, eh.nextState), "<s>    ")}
        <s>
        <s>    sm->event_handled = true;
        <s>    return; //stop processing because it transitioned
        <r>`;
        }
        let if_guard_text = "";
        if (guardText) {
            if_guard_text = " if " + guardText;
        }
        let if_trigger_text = "";
        if (eh.hasSomeTriggers()) {
            if_trigger_text = `ON ${Array.from(eh.getTriggers()).join(" or ")}`;
        }
        if (eh.hasTrigger(Triggers.ELSE)) {
            if_trigger_text = `ELSE `;
        }
        output += `
    <dummy>
    <s>  //${(if_trigger_text + if_guard_text).replace(/[\r\n]+/g, " ").replace(/[ ]{2,}|\\t/g, " ")}
    `.trim();
        output += `
    <s>  if (${triggerCode + expandedGuardCode}){ ${actionCode} ${transitionCode}
    <s>  }
    <s>
    `;
        output = StringUtils_1.StringUtils.processMarkers(output);
        return output;
    }
    expandActionCode(state, eh, noExpand) {
        if (noExpand) {
            return eh.action.actionCode;
        }
        let code = eh.action.actionCode;
        for (let i = 0; i < 10; i++) {
            code = this.expand(code, noExpand); //TODOLOW clean up & detect when done      
        }
        code = code.replace(/[$](handlerDescriptionString|handlerDescriptionStringNoAction)[$]/g, function (_, directive) {
            let handlerDescription = `${state.label}: `;
            let spacer = "";
            if (eh.hasSomeTriggers()) {
                if (eh.triggersCount() == 1) {
                    handlerDescription += `${eh.getTriggers()[0]}`;
                }
                else {
                    handlerDescription += `(${eh.getTriggers().join(",")})`;
                }
                spacer = " ";
            }
            if (eh.guard) {
                handlerDescription += spacer;
                handlerDescription += `[${eh.guard.guardCode}]`;
                spacer = " ";
            }
            if (eh.action && directive != "handlerDescriptionStringNoAction") {
                handlerDescription += spacer;
                handlerDescription += `/ {${eh.action.actionCode.replace(/\r|\n/g, "\\n")}}`;
                spacer = " ";
            }
            if (eh.nextState) {
                handlerDescription += spacer;
                handlerDescription += `-> ${eh.nextState.label}`;
            }
            return `"${handlerDescription}"`;
        });
        return code;
    }
    expand(textToExpand, preventExpand) {
        let output = textToExpand;
        if (preventExpand == false) {
            output = this.expander.expandText(textToExpand);
        }
        return output;
    }
    genCustomFunctions() {
        let output = "";
        output += this.buildExpandedSection("CUSTOM FUNCTIONS", this.hsm.inputHsm.cFunctions);
        output += this.hsm.inputHsm.cFunctionsNoExp + "\n";
        return output;
    }
    genParentMapping() {
        let output = "\n\n";
        output += this.createCommentHeader(`Parent mapping for all ${this.classFullName} state IDs`).trim() + "\n";
        output += `static const ${this.classFullName}_StateId parent_mapping[${this.classFullName}_StateCount] = {\n`;
        let states = this.hsm.getAllStates();
        let inner = "";
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            inner += `  [${this.genStateIdTypeName()}__${state.label}] = ${this.genStateIdTypeName()}__${(state.parent || state).label},\n`; //funkyness for root state that doesn't have a parent
        }
        inner = StringUtils_1.StringUtils.alignRegexInStringsSimple(/=/, inner);
        output += inner;
        output += `};\n`;
        return output;
    }
    genStateHandlerMapping() {
        let output = "\n\n";
        output += this.createCommentHeader(`Parent mapping for all ${this.classFullName} state IDs`).trim() + "\n";
        output += `static const ${this.classFullName}_EventHandler state_handlers[${this.classFullName}_StateCount] = {\n`;
        let states = this.hsm.getAllStates();
        let inner = "";
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            inner += `  [${this.genStateIdTypeName()}__${state.label}] = ${state.label}_event_handler,\n`;
        }
        inner = StringUtils_1.StringUtils.alignRegexInStringsSimple(/=/, inner);
        output += inner;
        output += `};\n`;
        return output;
    }
    genEnterStateDefinition() {
        let output = "\n\n";
        output += this.createCommentHeader(`TODO ${this.classFullName} `).trim() + "\n";
        output += `static void enter_state(${this.classFullName}* sm, ${this.classFullName}_StateId state_id)\n{\n`;
        output += `  switch(state_id)\n  {`;
        let states = this.hsm.getAllStates();
        let inner = "";
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            inner += `\n    case ${this.genStateIdTypeName()}__${state.label}:\n`;
            for (const eh of state.eventHandlers.filter(eh => eh.hasTrigger(Triggers.ENTER))) {
                inner += `${this.genEnterExitHandler(state, eh, true)}\n`;
            }
            inner += `      break;\n`;
        }
        output += inner;
        output += `  }\n`;
        output += `};\n`;
        return output;
    }
    genExitStateDefinition() {
        let output = "\n\n";
        output += this.createCommentHeader(`TODO ${this.classFullName} `).trim() + "\n";
        output += `static void exit_state(${this.classFullName}* sm, ${this.classFullName}_StateId state_id)\n{\n`;
        output += `  switch(state_id)\n  {`;
        let states = this.hsm.getAllStates();
        let inner = "";
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            inner += `\n    case ${this.genStateIdTypeName()}__${state.label}:\n`;
            for (const eh of state.eventHandlers.filter(eh => eh.hasTrigger(Triggers.EXIT))) {
                inner += `${this.genEnterExitHandler(state, eh, true)}\n`;
            }
            inner += `      break;\n`;
        }
        output += inner;
        output += `  }\n`;
        output += `};\n`;
        return output;
    }
    genFileHeaderInfo() {
        let output = "";
        let text = `
    @file

    @brief     State machine "${this.classFullName}"
               Auto generated from file: ${this.hsm.inputHsm.diagramSourceFilePath}

    @copyright Copyright (c) 2019 JCA Electronics, Winnipeg, MB.
               All rights reserved.
    `;
        text = StringUtils_1.StringUtils.removeBlankLinesAtTop(text);
        text = StringUtils_1.StringUtils.deIndent(text);
        output = this.createCommentHeader(text).trim() + "\n";
        return output;
    }
    genSourceFile() {
        //TODO generate doxygen for file
        let fullOutput = this.genFileHeaderInfo() +
            `
#include "${this.getHeaderFilename()}"
#include <string.h>

#define COUNTOF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))

typedef void(*${this.classFullName}_EventHandler)(${this.classFullName}* sm, ${this.classFullName}_EventId event_id);

#define PARENT_HANDLER_BOOKMARK(parent_handler) //allows an IDE to jump to function. nothing else

static void exit_upto(${this.classFullName}* sm, ${this.classFullName}_StateId stop_before_exiting);
static void exit_state(${this.classFullName}* sm, ${this.classFullName}_StateId state_id);
static void enter_chain(${this.classFullName}* sm, ${this.classFullName}_StateId *state_ids, uint16_t chain_length);
static void enter_state(${this.classFullName}* sm, ${this.classFullName}_StateId state_id);
static ${this.classFullName}_StateId get_parent_id(${this.classFullName}_StateId state_id);
` +
            this.hsm.inputHsm.c_file_top.trim() + "\n" +
            this.genCustomPrototypes() +
            this.genCustomFunctions() +
            this.genEventHandlerPrototypes() +
            this.genParentMapping() +
            this.genStateHandlerMapping() +
            this.genEventHanlderDefinitions() +
            this.genConstructorDefinition() +
            this.genEnterStateDefinition() +
            this.genExitStateDefinition() +
            this.genEventIdToStringDefinition() +
            `


void ${this.classFullName}_dispatch_event(${this.classFullName}* sm, ${this.classFullName}_EventId event_id)
{
    ${this.classFullName}_StateId state_id_to_rx_event = sm->state_id;
    sm->event_handled = false;

    do
    {
        ${this.classFullName}_EventHandler event_handler = state_handlers[state_id_to_rx_event];
        event_handler(sm, event_id);
        state_id_to_rx_event = get_parent_id(state_id_to_rx_event);
    }
    while(!sm->event_handled);
}


static void enter_chain(${this.classFullName}* sm, ${this.classFullName}_StateId *state_ids, uint16_t chain_length)
{
    for(uint16_t i = 0; i < chain_length; i++)
    {
        ${this.classFullName}_StateId to_enter = state_ids[i];
        enter_state(sm, to_enter);
        sm->state_id = to_enter;
    }
}


static ${this.classFullName}_StateId get_parent_id(${this.classFullName}_StateId state_id)
{
    ${this.classFullName}_StateId parent = parent_mapping[state_id];
    return parent;
}


static void exit_upto(${this.classFullName}* sm, ${this.classFullName}_StateId stop_before_exiting)
{
    while(sm->state_id != ${this.classFullName}_StateId__ROOT && sm->state_id != stop_before_exiting)
    {
        exit_state(sm, sm->state_id);
        sm->state_id = get_parent_id(sm->state_id);
    }
}
`;
        fullOutput = this.postProcessCode(fullOutput);
        return fullOutput;
    }
} ////////////////////////////////////////////////
exports.FlatCompiler = FlatCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhdENvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRmxhdENvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0VBTUU7O0FBR0YsMkNBQThGO0FBQzlGLG1DQUEyRDtBQUMzRCxtQ0FBZ0M7QUFDaEMseURBQXNEO0FBQ3RELGlEQUE4QztBQUM5Qyx1Q0FBc0M7QUFFdEMsMkNBQXVEO0FBRXZELE1BQU0sQ0FBQyxHQUFHLElBQUksaUJBQU8sRUFBRSxDQUFDO0FBRVgsUUFBQSxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7QUFHMUIsUUFBQSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBRS9CO0lBQUE7UUFDRSxRQUFHLEdBQWlCLElBQUksdUJBQVcsRUFBRSxDQUFDO1FBQ3RDLGFBQVEsR0FBbUIsSUFBSSxxQkFBYSxFQUFFLENBQUM7UUFFL0MscUJBQWdCLEdBQW1CLEVBQUUsQ0FBQyxDQUFFLGtCQUFrQjtRQUMxRCxzQkFBaUIsR0FBbUIsRUFBRSxDQUFDLENBQUMsa0JBQWtCO1FBQzFELHNCQUFpQixHQUFtQixFQUFFLENBQUMsQ0FBQyxrQkFBa0I7UUFFMUQsa0JBQWEsR0FBWSxTQUFTLENBQUM7UUFFbkMsMkJBQXNCLEdBQUcsRUFBRSxDQUFDO0lBay9COUIsQ0FBQztJQWgvQlMsc0NBQXNDLENBQUMsSUFBYTtRQUMxRCxJQUFJLE1BQU0sR0FBWSxJQUFJLENBQUM7UUFDM0IsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN4QixPQUFNLE1BQU0sSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUMzQixVQUFVLEdBQUcsTUFBTSxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTFDLGVBQWUs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