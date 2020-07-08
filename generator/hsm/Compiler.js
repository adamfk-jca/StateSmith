"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Generator_1 = require("./Generator");
const input_1 = require("./input");
const StateGen_1 = require("./StateGen");
const State_1 = require("./State");
const StringUtils_1 = require("../ts-utils/StringUtils");
const MyRegex_1 = require("../ts-utils/MyRegex");
const Triggers = require("./Triggers");
const Misc_1 = require("../ts-utils/Misc");
const r = new MyRegex_1.MyRegex();
exports.ROOT_STATE_LABEL = "ROOT";
const EXEC_CONTEXT_TYPE = "Jxc";
const EXEC_CONTEXT_USED_NAME = "jxc";
const EXEC_CONTEXT_TYPE_PARAM = "Jxc* jxc";
const insertBeforeClassInit = `TRY_BUBBLE_EXCEPTION_RET_0(${EXEC_CONTEXT_USED_NAME});\n`;
exports.ROOT_STATE_ID = 0;
class Compiler {
    constructor() {
        this.hsm = new Generator_1.RenderedHsm();
        this.expander = new input_1.MacroExpander();
        this.classFullName = "statemachine_123";
        this.classPrefix = "sm123"; // "my_statemachine"
        this.sep = "_";
        this.enumElementsPrefix = "";
        this.stateGen = new StateGen_1.StateGen(this);
        /** used for resolving the integer size and signedness of typedefs */
        this.typedefPrintfMapping = {};
        this.inputEventEnumsPrefix = ``;
        this.inputEventEnumsPostfix = ""; //`${this.sep}ID`;
        this.inputEventEnumType = "";
        this.inputValueFields = []; //TODO move to hsm
        this.outputValueFields = []; //TODO move to hsm
        this.outputEventFields = []; //TODO move to hsm
        this.insertCodeAtStartOfEveryNonConstructorFunction = `vTRY_BUBBLE_EXCEPTION();`;
    }
    setupStrings() {
        this.enumElementsPrefix = `${this.classPrefix}${this.sep}`;
        this.stateGen.stateEnumsPostfix = ``;
        this.stateGen.stateEnumType = `${this.classPrefix}${this.sep}StateId`;
        this.inputEventEnumsPrefix = `InputEvent${this.sep}`;
        this.inputEventEnumsPostfix = ""; //`${this.sep}ID`;
        this.inputEventEnumType = `${this.classPrefix}${this.sep}InputEvent`;
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
        this.hsm.executeAfterCode = this.removeYedCommentsAndExpand(inputHsm.executeAfterCode);
        this.hsm.executeBeforeDispatchCode = this.removeYedCommentsAndExpand(inputHsm.executeBeforeCode);
        this.hsm.h_file_top = this.removeYedCommentsAndExpand(inputHsm.h_file_top);
        //TODO expand and replace generator directives execute_after
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
        this.hsm.initialProcessAndValidate();
        this.hsm.convertPseudoInitialStates();
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
    buildClassEnumName(namePart) {
        let output = `${this.enumElementsPrefix}${namePart}`;
        return output;
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
                output = this.buildClassEnumName(`${this.inputEventEnumsPrefix}${label.toUpperCase()}${this.inputEventEnumsPostfix}`);
                break;
        }
        return output;
    }
    getInputEventEnumTypeName() {
        return this.inputEventEnumType;
    }
    genInputEventEnums() {
        let output = "";
        output += this.createCommentHeader(`Enumeration for all ${this.classFullName} input event IDs`);
        output += `typedef enum _${this.getInputEventEnumTypeName()}\n{\n`;
        let inputEvents = this.hsm.getAllNonDirectiveInputEventNames();
        let customCount = 0;
        let firstId = 10;
        let inner = "";
        let firstCustomEvent;
        //add in standard events first
        inner += `  ${this.buildInputEventEnumName("EXIT")}             = HsmEventId__EXIT,\n`;
        inner += `  ${this.buildInputEventEnumName("ENTER")}            = HsmEventId__ENTER,\n`;
        inner += `  ${this.buildInputEventEnumName("LANDED_IN")}        = HsmEventId__LANDED_IN,\n`;
        inner += `  ${this.buildInputEventEnumName("DO")}               = HsmEventId__DO,\n`;
        inner += `  ${this.buildInputEventEnumName("TEST_TRANSITIONS")} = HsmEventId__TEST_TRANSITIONS,\n`;
        for (let i = 0; i < inputEvents.length; i++) {
            let eventName = inputEvents[i];
            if (Triggers.isHsmEvent(eventName) || Triggers.isPseudoEventName(eventName)) {
            }
            else {
                if (customCount == 0) {
                    firstCustomEvent = eventName;
                    inner += `  ${this.buildInputEventEnumName(eventName)} = HsmEventId_CUSTOM_STARTS_AT,\n`;
                }
                else {
                    inner += `  ${this.buildInputEventEnumName(eventName)},\n`;
                }
                customCount++;
            }
        }
        inner = StringUtils_1.StringUtils.alignRegexInStringsSimple(/=/, inner);
        output += inner;
        output += `} ${this.getInputEventEnumTypeName()};\n`;
        output += `#define ${this.buildClassEnumName("INPUT_EVENT_COUNT")} ${customCount}\n`;
        //TODO do below check for output events.
        output += `static_assert( sizeof(${this.getInputEventEnumTypeName()}) == sizeof(HsmEventId), "HSM event ID type size must be increased to support more events. ");\n`;
        if (firstCustomEvent != null) {
            //output += `static_assert(${this.buildInputEventEnumName(firstCustomEvent)} == HSM_CUSTOM_EVENT_START_AT, "'${this.buildInputEventEnumName(firstCustomEvent)}' must equal HSM_CUSTOM_EVENT_START_AT");`
        }
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
    genStepFunctionName() {
        return `${this.classPrefix}${this.sep}step`;
    }
    genStepPrototype() {
        let output = "";
        //hsm_t* hsm, uint32_t current_time
        output = `void ${this.genStepFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm)`;
        return output;
    }
    genStepDefinition() {
        let output;
        output = this.createCommentHeader(`Public step function for ${this.classFullName} state machine`);
        //hsm_t* hsm, uint32_t current_time
        output += `${this.genStepPrototype()}\n{\n`;
        output += `  ${this.insertCodeAtStartOfEveryNonConstructorFunction}\n`;
        output += `  ${this.genDispatchEventFunctionName()}(jxc, sm, HsmEventId__DO);\n`;
        output += `}\n`;
        return output;
    }
    genTestTransitionsFunctionName() {
        return `${this.classPrefix}${this.sep}test_transitions`;
    }
    genTestTransitionsPrototype() {
        let output = "";
        //hsm_t* hsm, uint32_t current_time
        output = `void ${this.genTestTransitionsFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, uint8_t dispatch_count)`;
        return output;
    }
    genTestTransitionsDefinition() {
        let output;
        output = this.createCommentHeader(`Public test transitions function for ${this.classFullName} state machine`);
        //hsm_t* hsm, uint32_t current_time
        output += `${this.genTestTransitionsPrototype()}\n{\n`;
        output += `  ${this.insertCodeAtStartOfEveryNonConstructorFunction}\n`;
        output += `  for (uint8_t i = 0; i < dispatch_count; i++){\n`;
        output += `    ${this.genDispatchEventFunctionName()}(jxc, sm, HsmEventId__TEST_TRANSITIONS);\n`;
        output += `  }\n`;
        output += `}\n`;
        return output;
    }
    genDispatchIfFunctionName() {
        return `${this.classPrefix}${this.sep}dispatch_if`;
    }
    genDispatchIfPrototype() {
        let output = "";
        //hsm_t* hsm, uint32_t current_time
        output = `void ${this.genDispatchIfFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, bool condition, HsmEventId event_id)`;
        return output;
    }
    genDispatchIfDefinition() {
        let output;
        output = this.createCommentHeader(`Public function to dispatch event upon a condition`);
        output += StringUtils_1.StringUtils.properIndent(`
      ${this.genDispatchIfPrototype()}
      {
        ${this.insertCodeAtStartOfEveryNonConstructorFunction}
        if(condition)
        {
          ${this.genDispatchEventFunctionName()}(jxc, sm, event_id);\n
        }
      }
      `, "");
        return output;
    }
    genStaticDispatchEventFunctionName() {
        return `dispatch_event`;
    }
    genStaticDispatchEventPrototype() {
        let output = "";
        //hsm_t* hsm, uint32_t current_time, const HsmEvent* event
        output = `static void ${this.genStaticDispatchEventFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, const HsmEvent* event)`;
        return output;
    }
    genStaticDispatchEventDefinition() {
        let output;
        output = this.createCommentHeader(`Private dispatch event function for ${this.classFullName} state machine`);
        let executeBeforeCode = "";
        if (this.hsm.executeBeforeDispatchCode) {
            executeBeforeCode = `${this.genExecuteBeforeFunctionName()}(jxc, sm, event);`;
        }
        else {
            executeBeforeCode = `//Note: no code to run before state machine event dispatch`;
        }
        let executeAfterCode = "";
        if (this.hsm.executeAfterCode) {
            executeAfterCode = `${this.genExecuteAfterFunctionName()}(jxc, sm, event);`;
        }
        else {
            executeAfterCode = `//Note: no code to run after state machine event dispatch`;
        }
        //hsm_t* hsm, uint32_t current_time
        output += StringUtils_1.StringUtils.properIndent(`
      ${this.genStaticDispatchEventPrototype()}
      {
        ${this.insertCodeAtStartOfEveryNonConstructorFunction}
        ${executeBeforeCode}
        Hsm_dispatch_event(jxc, &sm->hsm, event);
        ${executeAfterCode}
      }\n
    `, "");
        return output;
    }
    genDispatchEventFunctionName() {
        return `${this.classPrefix}${this.sep}dispatch_event`;
    }
    genDispatchEventPrototype() {
        let output = "";
        //hsm_t* hsm, uint32_t current_time
        output = `void ${this.genDispatchEventFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, ${this.getInputEventEnumTypeName()} event_id)`;
        return output;
    }
    genDispatchEventDefinition() {
        let output;
        output = this.createCommentHeader(`Public dispatch event function for ${this.classFullName} state machine`);
        //hsm_t* hsm, uint32_t current_time
        output += StringUtils_1.StringUtils.properIndent(`
      ${this.genDispatchEventPrototype()}
      {
        ${this.insertCodeAtStartOfEveryNonConstructorFunction}
        HsmEvent event = { .event_id = event_id };
        dispatch_event(jxc, sm, &event);
      }\n
    `, "");
        return output;
    }
    //not a public function
    //TODOLOW generate prototype for c file. For now just put above uses.
    genExecuteAfterFunctionName() {
        return `execute_after_dispatch`;
    }
    genExecuteAfterPrototype() {
        let output = this.genExecuteBeforeAfterPrototype(this.genExecuteAfterFunctionName());
        return output;
    }
    genExecuteAfterDefinition() {
        let output = this.genExecuteBeforeAfterDefinition(this.hsm.executeAfterCode, this.genExecuteAfterPrototype(), `Function called after state machine event dispatch`);
        return output;
    }
    //not a public function
    //TODOLOW generate prototype for c file. For now just put above uses.
    genExecuteBeforeFunctionName() {
        return `execute_before_dispatch`;
    }
    genExecuteBeforePrototype() {
        let output = this.genExecuteBeforeAfterPrototype(this.genExecuteBeforeFunctionName());
        return output;
    }
    genExecuteBeforeDefinition() {
        let output = this.genExecuteBeforeAfterDefinition(this.hsm.executeBeforeDispatchCode, this.genExecuteBeforePrototype(), `Function called before event dispatched to SM `);
        return output;
    }
    genExecuteBeforeAfterPrototype(functionName) {
        let output = "";
        //hsm_t* hsm, uint32_t current_time
        output = `static void ${functionName}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, const HsmEvent* event)`;
        return output;
    }
    genExecuteBeforeAfterDefinition(dispatchCode, cPrototype, comment) {
        let output;
        if (dispatchCode.trim().length == 0) {
            return "";
        }
        output = this.createCommentHeader(comment);
        let indent = "        ";
        dispatchCode = StringUtils_1.StringUtils.indent(dispatchCode, indent);
        dispatchCode = StringUtils_1.StringUtils.rTrim(dispatchCode);
        indent = indent.replace(new RegExp("^" + indent), "  ");
        //hsm_t* hsm, uint32_t current_time
        output += StringUtils_1.StringUtils.properIndent(`
        ${cPrototype}
        {
          ${this.insertCodeAtStartOfEveryNonConstructorFunction}
          Hsm2* hsm = &sm->hsm;
          (void)hsm; (void)${EXEC_CONTEXT_USED_NAME}; (void)event;
          ${dispatchCode.trim()}
        }

      `, "");
        return output;
    }
    genEventIdToStringFunctionName() {
        return `${this.classPrefix}${this.sep}InputEvent_to_string`;
    }
    genEventIdToStringPrototype() {
        let output = "";
        //hsm_t* hsm, uint32_t current_time
        output = `const char* ${this.genEventIdToStringFunctionName()}(HsmEventId event_id)`; //leave as HsmEventId to avoid warnings
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
        //hsm_t* hsm, uint32_t current_time
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
    /*
    bool BBH__print_input_events(button_basic_hsm_t* sm)
    {
      sm->hsm.debug(0, "inputs: button_input=%u", sm->input_values.button_input);
    }*/
    genPrintGenericValuesDefinition(valuesName, valueFields, prototype) {
        if (valueFields.length == 0) {
            return "";
        }
        let output;
        output = this.createCommentHeader(`Function that prints all ${valuesName}`);
        let formatString = "";
        let values = "";
        let sep = "";
        for (let field of valueFields) {
            formatString += `${sep}${field.name} = %${this.getPrintfFormatString(field.type)}`;
            values += `${sep}sm->${valuesName}.${field.name}`;
            sep = ", ";
        }
        output += StringUtils_1.StringUtils.properIndent(`
        ${prototype}
        {
          //TODOLOW update generator to implement this feature
          (void)sm;
          //hsm_print_debug_msg(&sm->hsm, 0, "${valuesName}: ${formatString}", ${values});
        }
        `, "");
        return output;
    }
    getPrintfFormatString(type) {
        let signed;
        let size;
        let formatterString;
        let match;
        type = this.typedefPrintfMapping[type] || type;
        //make booleans look like uint8_t
        if (match = type.match(/^bool$|^boolean$/i)) {
            type = "uint8_t";
        }
        if (match = type.match(/^float$|^double$/)) {
            formatterString = "f";
        }
        else if (match = type.match(/^(u)?int(\d+)_t$/)) {
            //if type is un/signed integer, use PRIsx `Format macro constants`. See http://en.cppreference.com/w/c/types/integer 
            let signed = match[1] == null;
            let size = match[2];
            let priName = "PRI";
            priName += signed ? "i" : "u";
            priName += size;
            formatterString = `"${priName}"`; //need to surround in quotes to break out of existing string, concatenate PRI macro, then concatenate rest of string
        }
        else {
            throw `Don't know printf symbol for ${type}`;
        }
        return formatterString;
    }
    genPrintInputValuesFunctionName() {
        return `${this.classPrefix}${this.sep}print_input_values`;
    }
    genPrintInputValuesPrototype() {
        let output = `void ${this.genPrintInputValuesFunctionName()}(${this.genStatemachineStructName()}* sm)`;
        return output;
    }
    genPrintInputValuesDefinition() {
        let output = this.genPrintGenericValuesDefinition("input_values", this.inputValueFields, this.genPrintInputValuesPrototype());
        return output;
    }
    genPrintOutputValuesFunctionName() {
        return `${this.classPrefix}${this.sep}print_output_values`;
    }
    genPrintOutputValuesPrototype() {
        let output = `void ${this.genPrintOutputValuesFunctionName()}(${this.genStatemachineStructName()}* sm)`;
        return output;
    }
    genPrintOutputValuesDefinition() {
        let output = this.genPrintGenericValuesDefinition("output_values", this.outputValueFields, this.genPrintOutputValuesPrototype());
        return output;
    }
    genPrintOutputEventsFunctionName() {
        return `${this.classPrefix}${this.sep}print_output_events`;
    }
    genPrintOutputEventsPrototype() {
        let output = `void ${this.genPrintOutputEventsFunctionName()}(${this.genStatemachineStructName()}* sm)`;
        return output;
    }
    genPrintOutputEventsDefinition() {
        let output = this.genPrintGenericValuesDefinition("output_events", this.outputEventFields, this.genPrintOutputEventsPrototype());
        return output;
    }
    genClearOutputEventsFunctionName() {
        return `${this.classPrefix}${this.sep}clear_output_events`;
    }
    genClearOutputEventsPrototype() {
        let output = `void ${this.genClearOutputEventsFunctionName()}(Jxc* jxc, ${this.genStatemachineStructName()}* sm)`;
        return output;
    }
    genClearOutputEventsDefinition() {
        let output = "\n";
        output += this.createCommentHeader(`Function that clears all output_events`);
        let innards = "";
        for (let field of this.outputEventFields) {
            innards += `sm->output_events.${field.name} = 0;\n`;
        }
        output += StringUtils_1.StringUtils.properIndent(`
        ${this.genClearOutputEventsPrototype()}
        {
          (void)jxc; (void)sm;
          ${this.insertCodeAtStartOfEveryNonConstructorFunction}
          <innards_insert_point>
        }
        `, "");
        output = output.replace(/^([ \t]*)<innards_insert_point>[ \t]*/gm, function (match, indent) {
            return StringUtils_1.StringUtils.properIndent(innards, indent);
        });
        return output;
    }
    genClassInitFunctionName() {
        //TODO have it set a flag when class initialized? Then other calls can return error if flag not set.
        //can't safely do singleton in constructor without blocking and semaphores...
        return `${this.classPrefix}${this.sep}class_init`;
    }
    genClassInitFunctionPrototype() {
        let output = "";
        output = `bool ${this.genClassInitFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM})`;
        return output;
    }
    genClassInitDefinition() {
        let output;
        output = this.createCommentHeader(`Public class initialization function for ${this.classFullName} state machine.`);
        // output += `${this.genClassInitFunctionPrototype()}\n{\n`;
        // output += StringUtils.properIndent(`
        //   ${insertBeforeClassInit}
        //   bool result = hsm_init_tree(&${this.getStatemachineTreeArrayName()}[0], ${this.stateGen.getStateIdCountEnumName()});
        //   return result;
        // }
        // `, "");
        output += `\n`;
        return output;
    }
    genConstructorFunctionName() {
        return `${this.classPrefix}${this.sep}instance_init`;
    }
    genConstructorPrototype() {
        let output = "";
        output = `void ${this.genConstructorFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, const char * instance_name)`;
        return output;
    }
    genConstructorDefinition() {
        let output;
        output = this.createCommentHeader(`Public constructor function for ${this.classFullName} state machine`);
        output += `${this.genConstructorPrototype()}\n{\n`;
        output += StringUtils_1.StringUtils.properIndent(`
      ${this.insertCodeAtStartOfEveryNonConstructorFunction}
      sm->hsm.instance_name = instance_name;
      sm->hsm.tree = &${this.genHsmTreeName()};
      sm->hsm.get_state_vars = get_state_vars;
      //sm->hsm.listener = &hsmListener;
      Hsm_construct(jxc, &sm->hsm);      
    }
    `, "");
        output += `\n`;
        return output;
    }
    // private genPrepareToRunFunctionName() : string {
    //   return `${this.classPrefix}${this.sep}prepare_to_run`;
    // }
    // private genPrepareToRunPrototype() : string{
    //   let output = "";
    //   output = `void ${this.genPrepareToRunFunctionName()}(${this.genStatemachineStructName()}* sm, uint32_t current_time)`;
    //   return output;
    // }
    // private genPrepareToRunDefinition() : string {
    //   let output;
    //   output = this.createCommentHeader(`Public function to prepare running '${this.classFullName}' state machine`)
    //   let execAfter;
    //   if(this.hsm.executeAfterCode){
    //     execAfter = `${this.genExecuteAfterFunctionName()}(sm);`
    //   } else {
    //     execAfter = `//Note: no code to run after state machine iteration`
    //   }
    //   output += `${this.genPrepareToRunPrototype()}\n{\n`;
    //   output += StringUtils.properIndent(`
    //     ${this.insertCodeAtStartOfEveryNonConstructorFunction}
    //     hsm_prepare_to_run(&sm->hsm, current_time);
    //     ${execAfter}
    //   }
    //   `, "");
    //   output += `\n`;
    //   return output;
    // }
    genStatemachineVarStructName() {
        let output = `${this.classPrefix}_Vars`;
        return output;
    }
    genStatemachineVarsStruct() {
        let output = "\n";
        output += this.createCommentHeader(`STRUCT for ${this.classFullName} variables `);
        output += `typedef struct _${this.genStatemachineVarStructName()}\n{\n`;
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
        let output = `${this.classPrefix}_InputValues`;
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
        let output = `${this.classPrefix}_OutputValues`;
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
        let output = `${this.classPrefix}_OutputEvents`;
        return output;
    }
    genStatemachineOutputEventsStruct() {
        if (this.outputEventFields.length == 0) {
            return "";
        }
        let output = this.genStatemachineStructFieldsDefintion(`output_events`, this.genStatemachineOutputEventsStructName(), this.outputEventFields);
        return output;
    }
    genStateContextArrayName() {
        let output = `state_contexts`;
        return output;
    }
    genStateContextPointersArrayName() {
        let output = `state_contexts_p`;
        return output;
    }
    genHsmTreeName() {
        let output = this.classFullName + "Tree";
        return output;
    }
    genHsmTree() {
        let output = "";
        output = `
    <s>const HsmTree ${this.genHsmTreeName()} = {
    <s>  .htree = {
    <s>    .nodes = (HTreeNode*)&states[0],
    <s>    .node_sizeof = sizeof(states[0]),
    <s>  },
    <s>  .name = "${this.classFullName}",
    <s>};    
    `;
        output = StringUtils_1.StringUtils.processMarkers(output);
        output = this.createCommentHeader(`STRUCT for ${this.classFullName} `) + output + "\n\n\n";
        return output;
    }
    genGetStateTempVarsFunction() {
        let inner = "";
        for (let state of this.hsm.getAllStates()) {
            inner += `
      <s>    case ${this.stateGen.genStateEnumName(state)}:
      <s>      ptr = &sm->${this.stateGen.genStateTempVarPathFromRoot(state)}.base_vars;
      <s>      break;
      `;
        }
        let output = this.createCommentHeader("Function to get state's temporary variables by ID") +
            `
      
    <s>static HsmStateBaseVars* get_state_vars(Jxc* jxc, Hsm2* hsm, int id)
    <s>{
    <s>  (void)jxc; //remove compiler warning
    <s>  void* ptr = NULL;
    <s>  ${this.genStatemachineStructName()}* sm = (${this.genStatemachineStructName()}*)hsm;
    <s> 
    <s>  switch(id){ ${inner}
    <s>  }
    <s>
    <s>  return ptr;
    <s>}

    `.trim();
        output = StringUtils_1.StringUtils.processMarkers(output);
        return output;
    }
    genStatemachineStructName() {
        return `${this.classPrefix}`;
    }
    genStructRootStateVarsInstanceName() {
        return this.stateGen.genStateVarInstanceName(this.hsm.rootState);
    }
    genStatemachineStruct() {
        let output = this.createCommentHeader(`STRUCT for ${this.classFullName} `);
        let inputValues = this.inputValueFields.length == 0 ? "" : `${this.genStatemachineInputValuesStructName()} input_values;\n\n`;
        let outputValues = this.outputValueFields.length == 0 ? "" : `${this.genStatemachineOutputValuesStructName()} output_values;\n\n`;
        let outputEvents = this.outputEventFields.length == 0 ? "" : `${this.genStatemachineOutputEventsStructName()} output_events;\n\n`;
        output += StringUtils_1.StringUtils.properIndent(`
      typedef struct _${this.genStatemachineStructName()}
      {
        Hsm2 hsm; //MUST be first element for polymorphism

        ${inputValues}

        ${outputValues}

        ${outputEvents}

        ${this.genStatemachineVarStructName()} vars;

        ${this.stateGen.genStateVarsTypedefName(this.hsm.rootState)} ${this.genStructRootStateVarsInstanceName()};
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
        let printInputValuesPrototype = this.inputValueFields.length > 0 ? this.genPrintInputValuesPrototype() + ";\n" : "";
        let printOutputValuesPrototype = this.outputValueFields.length > 0 ? this.genPrintOutputValuesPrototype() + ";\n" : "";
        let printOutputEventsPrototype = this.outputEventFields.length > 0 ? this.genPrintOutputEventsPrototype() + ";\n" : "";
        let fullOutput = this.genFileHeaderInfo() +
            `
#pragma once
${this.hsm.h_file_top.trim()}
#include <stdint.h>
#include <stdbool.h>
#include "hsm2.h"

//******************************************************************************
// COMPILER SPECIFIC SECTION
//******************************************************************************

//disable specific Visual Studio warnings for this file
#ifdef _MSC_VER
#  pragma warning( push )
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#  pragma warning(disable: 4201)  //Warning	C4201	nonstandard extension used: nameless struct/union	
#endif


//#define _SHOW_PADDING_WARNINGS  //MSVC with all warnings enabled will alert to padding of structures. Note: it uses 4 bytes for enums as default whereas IAR is smarter and will use 1 byte if able.
#ifndef _SHOW_PADDING_WARNINGS
#  ifdef _MSC_VER
#    pragma warning(disable: 4820)
#  endif
#endif

\n
` +
            this.stateGen.genStateEnums(this.hsm.getAllStates()) +
            this.genInputEventEnums() +
            this.stateGen.genStateExternStateInstances(this.hsm.getAllStates()) +
            this.stateGen.genStateVarsPrototypes() +
            this.stateGen.genStateVarsStructs() +
            this.genStatemachineInputValuesStruct() +
            this.genStatemachineOutputValuesStruct() +
            this.genStatemachineOutputEventsStruct() +
            this.genStatemachineVarsStruct() +
            this.genStatemachineStruct() +
            this.createCommentHeader("public functions") +
            this.genClassInitFunctionPrototype() + ";\n" +
            this.genConstructorPrototype() + ";\n" +
            // this.genPrepareToRunPrototype() + ";\n" +
            this.genStepPrototype() + ";\n" +
            this.genTestTransitionsPrototype() + ";\n" +
            this.genDispatchEventPrototype() + ";\n" +
            this.genDispatchIfPrototype() + ";\n" +
            this.genEventIdToStringPrototype() + ";\n" +
            this.genClearOutputEventsPrototype() + ";\n" +
            printInputValuesPrototype +
            printOutputValuesPrototype +
            printOutputEventsPrototype +
            `\n\n
//******************************************************************************
// COMPILER SPECIFIC SECTION 2
//******************************************************************************
#ifdef _MSC_VER
#  pragma warning( pop )  //re-enable warnings disabled for this file
#endif
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
    genCustomFunctions() {
        let output = "";
        output += this.buildExpandedSection("CUSTOM FUNCTIONS", this.hsm.inputHsm.cFunctions);
        output += this.hsm.inputHsm.cFunctionsNoExp + "\n";
        output += StringUtils_1.StringUtils.processMarkers(`
    <s>static void event_handler_breakpoint(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event){
    <s>  (void)jxc; (void)hsm; (void)context; (void)event;
    <s>  int x = 5;  //set breakpoint here
    <s>  (void)x; //avoid compiler warning
    <s>}
    `);
        return output;
    }
    genFileHeaderInfo() {
        let output = "";
        let text = `
    @file

    @brief     State machine "${this.classFullName}"
               Auto generated from file: ${this.hsm.inputHsm.diagramSourceFilePath}

    @copyright Copyright (c) 2017 JCA Electronics, Winnipeg, MB.
               All rights reserved.
    `;
        text = StringUtils_1.StringUtils.removeBlankLinesAtTop(text);
        text = StringUtils_1.StringUtils.deIndent(text);
        output = this.createCommentHeader(text).trim() + "\n";
        return output;
    }
    /*
    FULL.NAME{op}.STATE:
      parent:
      is_ortho_parent:
      is_ortho_kid:
      immediate kid names (sorted alphabetically):
      event handlers
    */
    genStatesSummary(state) {
    }
    genSourceFile() {
        //TODO generate doxygen for file
        let fullOutput = this.genFileHeaderInfo() +
            `
#include "${this.getHeaderFilename()}"
#include "hsm2.h"
#include <inttypes.h> //for printf format macro constants like 'PRIu32'

//******************************************************************************
// COMPILER SPECIFIC SECTION
//******************************************************************************
//disable specific Visual Studio warnings for this file
#ifdef _MSC_VER
#  pragma warning(disable: 4214)  //allow bools to be used in bit fields: Warning	C4214	nonstandard extension used : bit field types other than int
#  pragma warning(disable: 4221)  //Warning for old code. Warning	C4221	nonstandard extension used: 'p': cannot be initialized using address of automatic variable 'buffer'
#  pragma warning(disable: 4204)  //Warning for old code. Warning	C4204	nonstandard extension used: non-constant aggregate initialize
#endif
` +
            this.hsm.inputHsm.c_file_top.trim() + "\n" +
            this.genCustomPrototypes() +
            this.genCustomFunctions() +
            this.stateGen.genEventHandlerPrototypes() +
            this.stateGen.genStateDefinitions(this.hsm.getAllStates()) +
            this.genHsmTree() +
            this.genGetStateTempVarsFunction() +
            this.stateGen.genEventHanlderDefinitions() +
            this.genClassInitDefinition() +
            this.genConstructorDefinition() +
            this.genExecuteBeforeDefinition() + //no prototype generated for this so it must be above
            this.genExecuteAfterDefinition() + //no prototype generated for this so it must be above
            this.genStaticDispatchEventDefinition() +
            // this.genPrepareToRunDefinition() +
            this.genStepDefinition() +
            this.genTestTransitionsDefinition() +
            this.genDispatchEventDefinition() +
            this.genDispatchIfDefinition() +
            this.genEventIdToStringDefinition() +
            this.genPrintInputValuesDefinition() + ";\n" +
            this.genPrintOutputValuesDefinition() + ";\n" +
            this.genPrintOutputEventsDefinition() + ";\n" +
            this.genClearOutputEventsDefinition() + ";\n" +
            "";
        fullOutput = this.postProcessCode(fullOutput);
        return fullOutput;
    }
} ////////////////////////////////////////////////
exports.Compiler = Compiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDJDQUF1RztBQUN2RyxtQ0FBMkQ7QUFDM0QseUNBQXNDO0FBQ3RDLG1DQUFnQztBQUNoQyx5REFBc0Q7QUFDdEQsaURBQThDO0FBQzlDLHVDQUFzQztBQUV0QywyQ0FBdUQ7QUFFdkQsTUFBTSxDQUFDLEdBQUcsSUFBSSxpQkFBTyxFQUFFLENBQUM7QUFFWCxRQUFBLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztBQUV2QyxNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUNoQyxNQUFNLHNCQUFzQixHQUFHLEtBQUssQ0FBQztBQUNyQyxNQUFNLHVCQUF1QixHQUFHLFVBQVUsQ0FBQztBQUUzQyxNQUFNLHFCQUFxQixHQUFHLDhCQUE4QixzQkFBc0IsTUFBTSxDQUFDO0FBRTVFLFFBQUEsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUUvQjtJQUFBO1FBQ0UsUUFBRyxHQUFpQixJQUFJLHVCQUFXLEVBQUUsQ0FBQztRQUN0QyxhQUFRLEdBQW1CLElBQUkscUJBQWEsRUFBRSxDQUFDO1FBQy9DLGtCQUFhLEdBQVksa0JBQWtCLENBQUM7UUFDNUMsZ0JBQVcsR0FBYSxPQUFPLENBQUMsQ0FBQSxvQkFBb0I7UUFDM0MsUUFBRyxHQUFHLEdBQUcsQ0FBQztRQUNuQix1QkFBa0IsR0FBWSxFQUFFLENBQUM7UUFFakMsYUFBUSxHQUFjLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6QyxxRUFBcUU7UUFDckUseUJBQW9CLEdBQXlCLEVBQUUsQ0FBQztRQUVoRCwwQkFBcUIsR0FBWSxFQUFFLENBQUM7UUFDcEMsMkJBQXNCLEdBQVksRUFBRSxDQUFDLENBQUEsa0JBQWtCO1FBQ3ZELHVCQUFrQixHQUFZLEVBQUUsQ0FBQztRQUVqQyxxQkFBZ0IsR0FBbUIsRUFBRSxDQUFDLENBQUUsa0JBQWtCO1FBQzFELHNCQUFp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