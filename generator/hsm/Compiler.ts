

import { RenderedHsm, StructField, InputHsm, Guard, Action, Trigger, EventHandler } from "./Generator";
import { MacroExpander, StructFieldParser } from "./input";
import { StateGen } from "./StateGen";
import { State } from "./State";
import { StringUtils } from "../ts-utils/StringUtils";
import { MyRegex } from "../ts-utils/MyRegex";
import * as Triggers from "./Triggers"
import nunjucks = require("nunjucks")
import { IHashString, indent } from "../ts-utils/Misc";

const r = new MyRegex();

export const ROOT_STATE_LABEL = "ROOT";

const EXEC_CONTEXT_TYPE = "Jxc";
const EXEC_CONTEXT_USED_NAME = "jxc";
const EXEC_CONTEXT_TYPE_PARAM = "Jxc* jxc";

const insertBeforeClassInit = `TRY_BUBBLE_EXCEPTION_RET_0(${EXEC_CONTEXT_USED_NAME});\n`;

export const ROOT_STATE_ID = 0;

export class Compiler {
  hsm : RenderedHsm = new RenderedHsm();
  expander : MacroExpander = new MacroExpander();
  classFullName : string = "statemachine_123";
  classPrefix : string =  "sm123";// "my_statemachine"
  readonly sep = "_";
  enumElementsPrefix : string = "";

  stateGen : StateGen = new StateGen(this);

  /** used for resolving the integer size and signedness of typedefs */
  typedefPrintfMapping : IHashString<string> = {};
  
  inputEventEnumsPrefix : string = ``;
  inputEventEnumsPostfix : string = "";//`${this.sep}ID`;
  inputEventEnumType : string = "";

  inputValueFields : StructField[] = [];  //TODO move to hsm
  outputValueFields : StructField[] = []; //TODO move to hsm
  outputEventFields : StructField[] = []; //TODO move to hsm

  insertCodeAtStartOfEveryNonConstructorFunction : string = `vTRY_BUBBLE_EXCEPTION();`;

  public setupStrings(){
    this.enumElementsPrefix = `${this.classPrefix}${this.sep}`;

    this.stateGen.stateEnumsPostfix = ``;
    this.stateGen.stateEnumType = `${this.classPrefix}${this.sep}StateId`;

    this.inputEventEnumsPrefix = `InputEvent${this.sep}`;
    this.inputEventEnumsPostfix = "";//`${this.sep}ID`;
    this.inputEventEnumType = `${this.classPrefix}${this.sep}InputEvent`;
  }

  private expandUserMacrosAndGeneratorDirectives(text : string) : string {
    let output : string = text;
    let lastOutput = "";
    let iteration_count = 0;
    while(output != lastOutput) {
      lastOutput = output;
      output = this.replaceGeneratorDirectives(output);
      output = this.expander.expandText(output);

      iteration_count++;
      if(iteration_count > 100){
        throw "Infinite loop in expansions detected. Check your expansions...";
      }
    }

    return output;
  }

  //TODO put in infinite loop handling
  private replaceGeneratorDirectives(text : string) : string {
    let output : string;
    var tthis = this;

    //$stateNameToEnumName(PRESSED)
    output = text;
    output = this.expander.hideCommentAndStringInnards(text);
    output = output.replace(/[$]stateNameToEnumName[(]\s*(\w+)\s*[)]/g, function(match:string, stateName : string) : string {
      throw "No longer supported.";
      // let output = "";
      // output = tthis.stateGen.getStateEnumNameFromString(stateName);
      // return output;
    } );

    output = output.replace(/[$][{]smStructName[}]/g, function(match:string) : string {
      let output = "";
      output = tthis.genStatemachineStructName();
      return output;
    } );

    output = this.expander.unhideCommentAndStringInnards(output);
    return output;
  }

  compile(inputHsm : InputHsm){
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
        let state = new State();
        state.label = inputState.label;
        state.inputState = inputState;

        this.hsm.addState(state);
    }

    this.inputValueFields = StructFieldParser.parse(this.hsm.inputHsm.inputValues);
    this.outputValueFields = StructFieldParser.parse(this.hsm.inputHsm.outputValues);
    this.outputEventFields = StructFieldParser.parse(this.hsm.inputHsm.outputEvents);

    this.hsm.initialProcessAndValidate();
    this.hsm.convertPseudoInitialStates();
    this.hsm.finalizeStates();
  }

  private removeYedCommentsAndExpand(code) : string {
    let outputCode = ""; 

    if(code){
      outputCode = code;
      outputCode = this.expandUserMacrosAndGeneratorDirectives(outputCode);
      outputCode = this.removeYedComments(outputCode);
      outputCode = StringUtils.removeBlankLines(outputCode);
    }

    return outputCode;
  }


  buildClassEnumName(namePart : string) : string {
    let output = `${this.enumElementsPrefix}${namePart}`;
    return output;
  }



  buildInputEventEnumName(label : string) : string{
    let output = "";
    switch(label.toUpperCase()){
      case "ANY":
        let shouldThrow = 1;
        if(shouldThrow){
          throw "This should not be getting called";
        }
      break;

      default:
        output = this.buildClassEnumName(`${this.inputEventEnumsPrefix}${label.toUpperCase()}${this.inputEventEnumsPostfix}`);
      break;
    }
    return output;
  }

  getInputEventEnumTypeName() : string {
    return this.inputEventEnumType;
  }

  genInputEventEnums(){
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
      if(Triggers.isHsmEvent(eventName) || Triggers.isPseudoEventName(eventName)){
      } else {
        if(customCount == 0){
          firstCustomEvent = eventName;
          inner += `  ${this.buildInputEventEnumName(eventName)} = HsmEventId_CUSTOM_STARTS_AT,\n`;
        } else {
          inner += `  ${this.buildInputEventEnumName(eventName)},\n`;
        }
        customCount++;
      }
    }

    inner = StringUtils.alignRegexInStringsSimple(/=/, inner);
    output += inner;
    output += `} ${this.getInputEventEnumTypeName()};\n`
    output += `#define ${this.buildClassEnumName("INPUT_EVENT_COUNT")} ${customCount}\n`;

    //TODO do below check for output events.
    output += `static_assert( sizeof(${this.getInputEventEnumTypeName()}) == sizeof(HsmEventId), "HSM event ID type size must be increased to support more events. ");\n`

    if(firstCustomEvent != null){
      //output += `static_assert(${this.buildInputEventEnumName(firstCustomEvent)} == HSM_CUSTOM_EVENT_START_AT, "'${this.buildInputEventEnumName(firstCustomEvent)}' must equal HSM_CUSTOM_EVENT_START_AT");`
    }

    return output;
  }


  createCommentHeader(header : string){
    header = header.replace(new RegExp(r.nl, "g"), "\n* "); //replace all new lines so that we keep "*" on left side
    var output = `\n\n
/************************************************************************************************
* ${header}
************************************************************************************************/\n`;
    return output;
  }

  private genStepFunctionName() : string {
    return `${this.classPrefix}${this.sep}step`;
  }
  private genStepPrototype() : string{
    let output = "";
    //hsm_t* hsm, uint32_t current_time
    output = `void ${this.genStepFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm)`;
    return output;
  }
  private genStepDefinition() : string{
    let output;
    output = this.createCommentHeader(`Public step function for ${this.classFullName} state machine`)

    //hsm_t* hsm, uint32_t current_time
    output += `${this.genStepPrototype()}\n{\n`;
    output += `  ${this.insertCodeAtStartOfEveryNonConstructorFunction}\n`;
    output += `  ${this.genDispatchEventFunctionName()}(jxc, sm, HsmEventId__DO);\n`;
    output += `}\n`;
    return output;
  }


  private genTestTransitionsFunctionName() : string {
    return `${this.classPrefix}${this.sep}test_transitions`;
  }
  private genTestTransitionsPrototype() : string{
    let output = "";
    //hsm_t* hsm, uint32_t current_time
    output = `void ${this.genTestTransitionsFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, uint8_t dispatch_count)`;
    return output;
  }
  private genTestTransitionsDefinition() : string{
    let output;
    output = this.createCommentHeader(`Public test transitions function for ${this.classFullName} state machine`)

    //hsm_t* hsm, uint32_t current_time
    output += `${this.genTestTransitionsPrototype()}\n{\n`;
    output += `  ${this.insertCodeAtStartOfEveryNonConstructorFunction}\n`;
    output += `  for (uint8_t i = 0; i < dispatch_count; i++){\n`;
    output += `    ${this.genDispatchEventFunctionName()}(jxc, sm, HsmEventId__TEST_TRANSITIONS);\n`;
    output += `  }\n`;
    output += `}\n`;
    return output;
  }


  private genDispatchIfFunctionName() : string {
    return `${this.classPrefix}${this.sep}dispatch_if`;
  }
  private genDispatchIfPrototype() : string{
    let output = "";
    //hsm_t* hsm, uint32_t current_time
    output = `void ${this.genDispatchIfFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, bool condition, HsmEventId event_id)`;
    return output;
  }
  private genDispatchIfDefinition() : string{
    let output;
    output = this.createCommentHeader(`Public function to dispatch event upon a condition`)

    output += StringUtils.properIndent(`
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



  private genStaticDispatchEventFunctionName() : string {
    return `dispatch_event`;
  }
  private genStaticDispatchEventPrototype() : string{
    let output = "";
    //hsm_t* hsm, uint32_t current_time, const HsmEvent* event
    output = `static void ${this.genStaticDispatchEventFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, const HsmEvent* event)`;
    return output;
  }
  private genStaticDispatchEventDefinition() : string{
    let output;
    output = this.createCommentHeader(`Private dispatch event function for ${this.classFullName} state machine`)

    let executeBeforeCode = "";
    if(this.hsm.executeBeforeDispatchCode){
      executeBeforeCode = `${this.genExecuteBeforeFunctionName()}(jxc, sm, event);`
    } else {
      executeBeforeCode = `//Note: no code to run before state machine event dispatch`
    }

    let executeAfterCode = "";
    if(this.hsm.executeAfterCode){
      executeAfterCode = `${this.genExecuteAfterFunctionName()}(jxc, sm, event);`
    } else {
      executeAfterCode = `//Note: no code to run after state machine event dispatch`
    }

    //hsm_t* hsm, uint32_t current_time
    output += StringUtils.properIndent(`
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


  private genDispatchEventFunctionName() : string {
    return `${this.classPrefix}${this.sep}dispatch_event`;
  }
  private genDispatchEventPrototype() : string{
    let output = "";
    //hsm_t* hsm, uint32_t current_time
    output = `void ${this.genDispatchEventFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, ${this.getInputEventEnumTypeName()} event_id)`;
    return output;
  }
  private genDispatchEventDefinition() : string{
    let output;
    output = this.createCommentHeader(`Public dispatch event function for ${this.classFullName} state machine`)


    //hsm_t* hsm, uint32_t current_time
    output += StringUtils.properIndent(`
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
    private genExecuteAfterFunctionName() : string {
      return `execute_after_dispatch`;
    }
    private genExecuteAfterPrototype() : string{
      let output = this.genExecuteBeforeAfterPrototype( this.genExecuteAfterFunctionName() );
      return output;
    }
    private genExecuteAfterDefinition() : string{
      let output = this.genExecuteBeforeAfterDefinition(this.hsm.executeAfterCode, this.genExecuteAfterPrototype(), `Function called after state machine event dispatch`);
      return output;
    }


    //not a public function
    //TODOLOW generate prototype for c file. For now just put above uses.
    private genExecuteBeforeFunctionName() : string {
      return `execute_before_dispatch`;
    }
    private genExecuteBeforePrototype() : string{
      let output = this.genExecuteBeforeAfterPrototype( this.genExecuteBeforeFunctionName() );
      return output;
    }
    private genExecuteBeforeDefinition() : string{
      let output = this.genExecuteBeforeAfterDefinition(this.hsm.executeBeforeDispatchCode, this.genExecuteBeforePrototype(), `Function called before event dispatched to SM `);
      return output;
    }


    private genExecuteBeforeAfterPrototype(functionName) : string {
      let output = "";
      //hsm_t* hsm, uint32_t current_time
      output = `static void ${functionName}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, const HsmEvent* event)`;
      return output;
    }
    private genExecuteBeforeAfterDefinition(dispatchCode, cPrototype, comment) : string {
      let output;
      if(dispatchCode.trim().length == 0){
        return "";
      }

      output = this.createCommentHeader(comment)

      let indent = "        ";
      dispatchCode = StringUtils.indent(dispatchCode, indent);
      dispatchCode = StringUtils.rTrim(dispatchCode);
      indent = indent.replace(new RegExp("^" + indent), "  ");

      //hsm_t* hsm, uint32_t current_time
      output += StringUtils.properIndent(`
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


    private genEventIdToStringFunctionName() : string {
      return `${this.classPrefix}${this.sep}InputEvent_to_string`;
    }
    private genEventIdToStringPrototype() : string{
      let output = "";
      //hsm_t* hsm, uint32_t current_time
      output = `const char* ${this.genEventIdToStringFunctionName()}(HsmEventId event_id)`;  //leave as HsmEventId to avoid warnings
      return output;
    }
    private genEventIdToStringDefinition() : string{
      let output;
      output = this.createCommentHeader(`Function that translates a custom input event ID to a string\nNOTE: actual passed in enum values should be from '${this.getInputEventEnumTypeName()}'`)

      let inputEvents = this.hsm.getAllNonDirectiveInputEventNames();

      let switchInner = "";
      for (let i = 0; i < inputEvents.length; i++) {
        let eventName = inputEvents[i];
        if(Triggers.isHsmEvent(eventName) == false){
          switchInner += `            case ${this.buildInputEventEnumName(eventName)}: str = "${eventName}"; break;\n`;
        }
      }

      if(switchInner.length == 0){
        switchInner = "//no custom input events defined for this state machine";
      } else {
        switchInner = StringUtils.alignCompressedSwitch(switchInner).trim() + "\n";
      }

      //hsm_t* hsm, uint32_t current_time
      output += StringUtils.properIndent(`
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
    private genPrintGenericValuesDefinition(valuesName : string, valueFields : StructField[], prototype : string) : string{
      if(valueFields.length == 0) { return "";}
      let output;
      output = this.createCommentHeader(`Function that prints all ${valuesName}`)

      let formatString = "";
      let values = "";
      let sep = "";
      for(let field of valueFields){
        formatString += `${sep}${field.name} = %${this.getPrintfFormatString(field.type)}`
        values +=`${sep}sm->${valuesName}.${field.name}`;
        sep = ", ";
      }

      output += StringUtils.properIndent(`
        ${prototype}
        {
          //TODOLOW update generator to implement this feature
          (void)sm;
          //hsm_print_debug_msg(&sm->hsm, 0, "${valuesName}: ${formatString}", ${values});
        }
        `, "");
      return output;
    }


    public getPrintfFormatString(type : string): string {
      let signed : boolean;
      let size : number;

      let formatterString : string;
      let match : RegExpMatchArray;

      type = this.typedefPrintfMapping[type] || type;

      //make booleans look like uint8_t
      if( match = type.match(/^bool$|^boolean$/i)  ){
        type = "uint8_t";
      }

      if( match = type.match(/^float$|^double$/)  ){
        formatterString = "f";
      }   
      else if( match = type.match(/^(u)?int(\d+)_t$/)  ){
        //if type is un/signed integer, use PRIsx `Format macro constants`. See http://en.cppreference.com/w/c/types/integer 
        let signed = match[1] == null;
        let size = match[2];

        let priName = "PRI";  
        priName += signed? "i": "u";
        priName += size;
        formatterString = `"${priName}"`; //need to surround in quotes to break out of existing string, concatenate PRI macro, then concatenate rest of string
      } else {
        throw `Don't know printf symbol for ${type}`;
      }

      return formatterString;
    }


    private genPrintInputValuesFunctionName() : string {
      return `${this.classPrefix}${this.sep}print_input_values`;
    }
    private genPrintInputValuesPrototype() : string{
      let output = `void ${this.genPrintInputValuesFunctionName()}(${this.genStatemachineStructName()}* sm)`;
      return output;
    }
    private genPrintInputValuesDefinition() : string{
      let output = this.genPrintGenericValuesDefinition("input_values", this.inputValueFields, this.genPrintInputValuesPrototype());
      return output;
    }


    private genPrintOutputValuesFunctionName() : string {
      return `${this.classPrefix}${this.sep}print_output_values`;
    }
    private genPrintOutputValuesPrototype() : string{
      let output = `void ${this.genPrintOutputValuesFunctionName()}(${this.genStatemachineStructName()}* sm)`;
      return output;
    }
    private genPrintOutputValuesDefinition() : string{
      let output = this.genPrintGenericValuesDefinition("output_values", this.outputValueFields, this.genPrintOutputValuesPrototype());
      return output;
    }


    private genPrintOutputEventsFunctionName() : string {
      return `${this.classPrefix}${this.sep}print_output_events`;
    }
    private genPrintOutputEventsPrototype() : string{
      let output = `void ${this.genPrintOutputEventsFunctionName()}(${this.genStatemachineStructName()}* sm)`;
      return output;
    }
    private genPrintOutputEventsDefinition() : string{
      let output = this.genPrintGenericValuesDefinition("output_events", this.outputEventFields, this.genPrintOutputEventsPrototype());
      return output;
    }


    private genClearOutputEventsFunctionName() : string {
      return `${this.classPrefix}${this.sep}clear_output_events`;
    }
    private genClearOutputEventsPrototype() : string{
      let output = `void ${this.genClearOutputEventsFunctionName()}(Jxc* jxc, ${this.genStatemachineStructName()}* sm)`;
      return output;
    }
    public genClearOutputEventsDefinition(): string {
      let output = "\n";
      output += this.createCommentHeader(`Function that clears all output_events`);

      let innards = "";
      for(let field of this.outputEventFields){
        innards += `sm->output_events.${field.name} = 0;\n`;
      }

      output += StringUtils.properIndent(`
        ${this.genClearOutputEventsPrototype()}
        {
          (void)jxc; (void)sm;
          ${this.insertCodeAtStartOfEveryNonConstructorFunction}
          <innards_insert_point>
        }
        `, "");

      output = output.replace(/^([ \t]*)<innards_insert_point>[ \t]*/gm, function(match, indent){
        return StringUtils.properIndent(innards, indent);
      });

      return output;
    }




  private genClassInitFunctionName() : string {
    //TODO have it set a flag when class initialized? Then other calls can return error if flag not set.
    //can't safely do singleton in constructor without blocking and semaphores...
    return `${this.classPrefix}${this.sep}class_init`;
  }
  private genClassInitFunctionPrototype() : string{
    let output = "";
    output = `bool ${this.genClassInitFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM})`;
    return output;
  }
  private genClassInitDefinition() : string {
    let output;
    output = this.createCommentHeader(`Public class initialization function for ${this.classFullName} state machine.`)

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

  private genConstructorFunctionName() : string {
    return `${this.classPrefix}${this.sep}instance_init`;
  }
  private genConstructorPrototype() : string{
    let output = "";
    output = `void ${this.genConstructorFunctionName()}(${EXEC_CONTEXT_TYPE_PARAM}, ${this.genStatemachineStructName()}* sm, const char * instance_name)`;
    return output;
  }
  private genConstructorDefinition() : string {
    let output;
    output = this.createCommentHeader(`Public constructor function for ${this.classFullName} state machine`)

    output += `${this.genConstructorPrototype()}\n{\n`;
    output += StringUtils.properIndent(`
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



  public genStatemachineVarStructName() : string{
    let output = `${this.classPrefix}_Vars`;
    return output;
  }
  public genStatemachineVarsStruct(): string {
    let output = "\n";
    output += this.createCommentHeader(`STRUCT for ${this.classFullName} variables `)

    output += `typedef struct _${this.genStatemachineVarStructName()}\n{\n`;
    let innards = this.hsm.inputHsm.varsStructInnerText || "  bool _unused;";
    output +=  indent(innards, " ", 0); //TODO auto detect if indentation required.
    output +=  "\n";
    output += `} ${this.genStatemachineVarStructName()};\n\n\n`;
    return output;
  }
  public genStatemachineStructFieldsDefintion(headerText : string, structName : string, fields : StructField[]): string {
    let output = "\n";
    output += this.createCommentHeader(`Struct for ${headerText}`);

    let innards = "";
    for(let field of fields){
      innards += field.fullTextMatch.trim() + "\n";
    }

    output += StringUtils.properIndent(`
      typedef struct _${structName}
      {
        <innards_insert_point>
      } ${structName};
      `, "");

    output = output.replace(/^([ \t]*)<innards_insert_point>[ \t]*/gm, function(match, indent){
      //console.log(`match: '${match}', indent:'${indent}'`);
      return StringUtils.properIndent(innards, indent);
    });

    //console.log(`output: '${output}'`);

    return output;
  }

  public genStatemachineInputValuesStructName() : string{
    let output = `${this.classPrefix}_InputValues`;
    return output;
  }
  public genStatemachineInputValuesStruct() : string{
    if(this.inputValueFields.length == 0){return "";}
    let output = this.genStatemachineStructFieldsDefintion(`input_values`, this.genStatemachineInputValuesStructName(), this.inputValueFields);
    return output;
  }

  public genStatemachineOutputValuesStructName() : string{
    let output = `${this.classPrefix}_OutputValues`;
    return output;
  }
  public genStatemachineOutputValuesStruct() : string{
    if(this.outputValueFields.length == 0){return "";}
    let output = this.genStatemachineStructFieldsDefintion(`output_values`, this.genStatemachineOutputValuesStructName(), this.outputValueFields);
    return output;
  }


  public genStatemachineOutputEventsStructName() : string{
    let output = `${this.classPrefix}_OutputEvents`;
    return output;
  }
  public genStatemachineOutputEventsStruct() : string{
    if(this.outputEventFields.length == 0){return "";}
    let output = this.genStatemachineStructFieldsDefintion(`output_events`, this.genStatemachineOutputEventsStructName(), this.outputEventFields);
    return output;
  }

  public genStateContextArrayName(): string{
    let output = `state_contexts`;
    return output;
  }

  public genStateContextPointersArrayName(): string{
    let output = `state_contexts_p`;
    return output;
  }

  public genHsmTreeName() : string {
    let output = this.classFullName + "Tree";
    return output;
  }

  public genHsmTree() : string {
    let output = "";

    output = `
    <s>const HsmTree ${this.genHsmTreeName()} = {
    <s>  .htree = {
    <s>    .nodes = (HTreeNode*)&states[0],
    <s>    .node_sizeof = sizeof(states[0]),
    <s>  },
    <s>  .name = "${this.classFullName}",
    <s>};    
    `
    output = StringUtils.processMarkers(output);

    output = this.createCommentHeader(`STRUCT for ${this.classFullName} `) + output + "\n\n\n";

    return output;
  }



  public genGetStateTempVarsFunction() : string {
    let inner = "";

    for(let state of this.hsm.getAllStates()) {
      inner += `
      <s>    case ${this.stateGen.genStateEnumName(state)}:
      <s>      ptr = &sm->${this.stateGen.genStateTempVarPathFromRoot(state)}.base_vars;
      <s>      break;
      `
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

    output = StringUtils.processMarkers(output);

    return output;
  }

  public genStatemachineStructName() : string {
    return `${this.classPrefix}`;
  }
  
  public genStructRootStateVarsInstanceName() {
    return this.stateGen.genStateVarInstanceName(this.hsm.rootState);
  }
  

  public genStatemachineStruct(): string {
    let output = this.createCommentHeader(`STRUCT for ${this.classFullName} `)

    let inputValues  = this.inputValueFields.length == 0 ? "" : `${this.genStatemachineInputValuesStructName()} input_values;\n\n`;
    let outputValues = this.outputValueFields.length == 0 ? "" :`${this.genStatemachineOutputValuesStructName()} output_values;\n\n`;
    let outputEvents = this.outputEventFields.length == 0 ? "" :`${this.genStatemachineOutputEventsStructName()} output_events;\n\n`;

    output += StringUtils.properIndent(`
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

    output = "" + StringUtils.compressBlankLines(output);

    return output;
  }

  private getOutputFilenameBase() : string {
    let result : string;
    if(this.hsm.inputHsm.output_filename){
      result = this.hsm.inputHsm.output_filename;
    }else{
      //result = this.classFullName.toLowerCase().trim()
      result = this.classFullName.trim()
    }
    return result;
  }

  public getSummaryFilename() : string {
    return this.getOutputFilenameBase() + "_summary.txt";
  }

  public getHeaderFilename() : string {
    return this.getOutputFilenameBase() + ".h";
  }

  public getSourceFilename() : string {
    return this.getOutputFilenameBase() + ".c";
  }


  public removeYedComments(code : string, already_hidden = false) : string {
    if(already_hidden == false){
      code = this.expander.hideCommentAndStringInnards(code);
    }

    //remove yed comments
    let tilde = this.expander.hideStringCharacters("~"); //tilde exists inside hidden comments. Need to hide it as well to match.
    code = code.replace(new RegExp(`^${r.mhs}//${tilde}.*${r.nl}`, "mg"), ""); //a full yed comment line "//~"
    code = code.replace(new RegExp(`^${r.mhs}/[*]${tilde}[^]*[*]/${r.nl}`, "mg"), ""); //a full yed comment line "/*~...*/"
    code = code.replace(new RegExp(`${r.mhs}//${tilde}.*$`, "mg"), ""); //a partial yed comment line "//~"
    code = code.replace(new RegExp(`${r.mhs}/[*]${tilde}[^]*[*]/`, "mg"), ""); //a partial yed comment line "/*~...*/"

    if(already_hidden == false){
      code = this.expander.unhideCommentAndStringInnards(code);
    }
    
    return code;
  }


  public postProcessCode(code : string) : string {
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


  public genPublicHeaderFile() : string {

    let printInputValuesPrototype  = this.inputValueFields.length  > 0 ? this.genPrintInputValuesPrototype()  + ";\n": "";
    let printOutputValuesPrototype = this.outputValueFields.length > 0 ? this.genPrintOutputValuesPrototype() + ";\n": "";
    let printOutputEventsPrototype = this.outputEventFields.length > 0 ? this.genPrintOutputEventsPrototype() + ";\n": "";

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
    this.stateGen.genStateExternStateInstances(this.hsm.getAllStates())+
    this.stateGen.genStateVarsPrototypes()+
    this.stateGen.genStateVarsStructs()+
    this.genStatemachineInputValuesStruct()+
    this.genStatemachineOutputValuesStruct()+
    this.genStatemachineOutputEventsStruct()+
    this.genStatemachineVarsStruct() +
    this.genStatemachineStruct() +

    this.createCommentHeader("public functions") +
    this.genClassInitFunctionPrototype() + ";\n" +
    this.genConstructorPrototype() + ";\n" +
    // this.genPrepareToRunPrototype() + ";\n" +
    this.genStepPrototype()  + ";\n" +
    this.genTestTransitionsPrototype()  + ";\n" +
    this.genDispatchEventPrototype() + ";\n" +
    this.genDispatchIfPrototype() + ";\n" +
    this.genEventIdToStringPrototype() + ";\n" +
    this.genClearOutputEventsPrototype() + ";\n" +
    printInputValuesPrototype  +
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

  private genCustomPrototypes() : string {
    let output = this.buildExpandedSection("CUSTOM PROTOTYPES", this.hsm.inputHsm.cPrototypes);
    output += this.hsm.inputHsm.cPrototypesNoExp + "\n";
    return output;
  }

  private buildExpandedSection(title : string, toExpand : string) : string {
    let output = "";
    toExpand = toExpand.trim();
    let text = this.expandUserMacrosAndGeneratorDirectives(toExpand);
    if(text){
      output += this.createCommentHeader(title);
      output += text + "\n";
    }
    return output;
  }

  private genCustomFunctions() : string {
    let output = "";

    output += this.buildExpandedSection("CUSTOM FUNCTIONS", this.hsm.inputHsm.cFunctions);
    output += this.hsm.inputHsm.cFunctionsNoExp + "\n";

    output += StringUtils.processMarkers(`
    <s>static void event_handler_breakpoint(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event){
    <s>  (void)jxc; (void)hsm; (void)context; (void)event;
    <s>  int x = 5;  //set breakpoint here
    <s>  (void)x; //avoid compiler warning
    <s>}
    `);

    return output;
  }

  private genFileHeaderInfo() : string {
    let output = "";
    let text = `
    @file

    @brief     State machine "${this.classFullName}"
               Auto generated from file: ${this.hsm.inputHsm.diagramSourceFilePath}

    @copyright Copyright (c) 2017 JCA Electronics, Winnipeg, MB.
               All rights reserved.
    `;
    text  = StringUtils.removeBlankLinesAtTop(text);
    text = StringUtils.deIndent(text);

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
  public genStatesSummary(state : State){

  }


  public genSourceFile() : string {
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
      this.genGetStateTempVarsFunction()+
      this.stateGen.genEventHanlderDefinitions()+
      this.genClassInitDefinition() +
      this.genConstructorDefinition() +
      this.genExecuteBeforeDefinition() +  //no prototype generated for this so it must be above
      this.genExecuteAfterDefinition() +  //no prototype generated for this so it must be above
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
      ""
      ;
    fullOutput = this.postProcessCode(fullOutput);
    return fullOutput;
  }

}////////////////////////////////////////////////

