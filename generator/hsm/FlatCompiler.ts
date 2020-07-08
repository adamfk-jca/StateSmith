/*
TODO
[ ] detect if state real or logical
[ ] ANY+ support
[ ] trace() support

*/


import { RenderedHsm, StructField, InputHsm, Guard, Action, EventHandler } from "./Generator";
import { MacroExpander, StructFieldParser } from "./input";
import { State } from "./State";
import { StringUtils } from "../ts-utils/StringUtils";
import { MyRegex } from "../ts-utils/MyRegex";
import * as Triggers from "./Triggers"
import nunjucks = require("nunjucks")
import { IHashString, indent } from "../ts-utils/Misc";

const r = new MyRegex();

export const ROOT_STATE_LABEL = "ROOT";


export const ROOT_STATE_ID = 0;

export class FlatCompiler {
  hsm : RenderedHsm = new RenderedHsm();
  expander : MacroExpander = new MacroExpander();

  inputValueFields : StructField[] = [];  //TODO move to hsm
  outputValueFields : StructField[] = []; //TODO move to hsm
  outputEventFields : StructField[] = []; //TODO move to hsm

  classFullName : string = "ns_MySm";
  rootInitialState: State;
  initialEntryActionCode = "";
 
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
    this.hsm.h_file_top = this.removeYedCommentsAndExpand(inputHsm.h_file_top);

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

    this.hsm.reservedTriggers = [Triggers.ENTER, Triggers.EXIT, Triggers.DO];
    this.hsm.initialProcessAndValidate();

    //TODO don't render ROOT state. no point in having handlers in it.
    //optimization hack for now
    {
      let eh = new EventHandler();
      eh.guard = new Guard();
      eh.guard.guardCode = "true";
      eh.action = new Action();
      eh.action.actionCode = `sm->event_handled = true; //for loop efficiency`
      this.hsm.rootState.addEventHandlers([eh]);
    }


    {
      let initial_states = this.hsm.getAllStates().filter(state => state.isInitialState);
      let tthis = this;
      function setInitialActionCode(state: State) {
        tthis.initialEntryActionCode = (state.eventHandlers[0].action || new Action()).actionCode || "";
      }

      for (const state of initial_states) {  
        if (state.parent == this.hsm.rootState) {
          this.rootInitialState = state;
          setInitialActionCode(state);
        }
        
        if (state.isComplexInitialState())
        {

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
        output = `${this.getInputEventEnumTypeName()}__${label.toUpperCase()}`;
      break;
    }
    return output;
  }

  getInputEventEnumTypeName() : string {
    return `${this.classFullName}_EventId`;
  }

  genInputEventEnums(){
    let output = "";
    output += this.createCommentHeader(`Enumeration for all ${this.classFullName} input event IDs`);
    output += `typedef enum ${this.getInputEventEnumTypeName()}\n{\n`;

    let inputEvents = this.hsm.getAllNonDirectiveInputEventNames();

    let inner = "";

    //add in standard events first
    inner += `  ${this.buildInputEventEnumName(Triggers.DO)},\n`;

    for (let i = 0; i < inputEvents.length; i++) {
      let eventName = inputEvents[i];
      if(Triggers.isHsmEvent(eventName) || Triggers.isPseudoEventName(eventName)){
        //do nothing
      } else {
        inner += `  ${this.buildInputEventEnumName(eventName)},\n`;
      }
    }

    inner = StringUtils.alignRegexInStringsSimple(/=/, inner);
    output += inner;
    output += `} ${this.getInputEventEnumTypeName()};\n`

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


  private genEventHandlerType() : string
  {
    return `${this.classFullName}_EventHandler`;
  }

    private genEventIdToStringFunctionName() : string {
      return `${this.classFullName}_InputEvent_to_string`;
    }
    private genEventIdToStringPrototype() : string{
      let output = "";
      //hsm_t* hsm, uint32_t current_time
      output = `const char* ${this.genEventIdToStringFunctionName()}(${this.getInputEventEnumTypeName()} event_id)`;
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




  private genConstructorFunctionName() : string {
    return `${this.classFullName}_instance_init`;
  }
  private genConstructorPrototype() : string{
    let output = "";
    output = `void ${this.genConstructorFunctionName()}(${this.genStatemachineStructName()}* sm)`;
    return output;
  }
  private genConstructorDefinition() : string {
    let output = this.createCommentHeader(`Public constructor function for ${this.classFullName} state machine`)
    let peak = this.hsm.rootState;

    let actionCode = this.expandUserMacrosAndGeneratorDirectives(this.initialEntryActionCode);

    output += `${this.genConstructorPrototype()}\n{\n`;
    output += StringUtils.properIndent(`
${StringUtils.indent(actionCode, "      ")}
      enter_state(sm, ${this.classFullName}_StateId__${this.hsm.rootState.label});
${StringUtils.indent(this.genEnterCode(null, peak, this.rootInitialState), "      ")}
    }
    `, "");

    output += `\n`;
    return output;
  }


  public genStatemachineVarStructName() : string{
    let output = `${this.classFullName}_Vars`;
    return output;
  }
  public genStatemachineVarsStruct(): string {
    let output = "\n";
    output += this.createCommentHeader(`STRUCT for ${this.classFullName} variables `)

    output += `typedef struct ${this.genStatemachineVarStructName()}\n{\n`;
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
    let output = `${this.classFullName}_InputValues`;
    return output;
  }
  public genStatemachineInputValuesStruct() : string{
    if(this.inputValueFields.length == 0){return "";}
    let output = this.genStatemachineStructFieldsDefintion(`input_values`, this.genStatemachineInputValuesStructName(), this.inputValueFields);
    return output;
  }

  public genStatemachineOutputValuesStructName() : string{
    let output = `${this.classFullName}_OutputValues`;
    return output;
  }
  public genStatemachineOutputValuesStruct() : string{
    if(this.outputValueFields.length == 0){return "";}
    let output = this.genStatemachineStructFieldsDefintion(`output_values`, this.genStatemachineOutputValuesStructName(), this.outputValueFields);
    return output;
  }


  public genStatemachineOutputEventsStructName() : string{
    let output = `${this.classFullName}_OutputEvents`;
    return output;
  }
  public genStatemachineOutputEventsStruct() : string{
    if(this.outputEventFields.length == 0){return "";}
    let output = this.genStatemachineStructFieldsDefintion(`output_events`, this.genStatemachineOutputEventsStructName(), this.outputEventFields);
    return output;
  }


  public genStatemachineStructName() : string {
    return `${this.classFullName}`;
  }
  

  private genStateIdTypeName() : string 
  {
    return `${this.classFullName}_StateId`;
  }

  public genStatemachineStruct(): string {
    let output = this.createCommentHeader(`STRUCT for ${this.classFullName} `)

    let inputValues  = this.inputValueFields.length == 0 ? "" : `${this.genStatemachineInputValuesStructName()} input_values;\n\n`;
    let outputValues = this.outputValueFields.length == 0 ? "" :`${this.genStatemachineOutputValuesStructName()} output_values;\n\n`;
    let outputEvents = this.outputEventFields.length == 0 ? "" :`${this.genStatemachineOutputEventsStructName()} output_events;\n\n`;

    output += StringUtils.properIndent(`
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


  genStateEnums(){
    let output = "";
    output += this.createCommentHeader(`Enumeration for all ${this.classFullName} state IDs`).trim() + "\n";
    output += `typedef enum ${this.genStateIdTypeName()}\n{\n`;

    let states = this.hsm.getAllStates();

    let inner = "";
    for (let i = 0; i < states.length; i++) {
        let state = states[i];
        inner += `  ${this.genStateIdTypeName()}__${state.label},\n`;
    }
    inner = StringUtils.alignRegexInStringsSimple(/=/, inner);
    output += inner;
    output += "  //--------------------------\n"
    output += `  ${this.classFullName}_StateCount,\n`;
    output += `} ${this.genStateIdTypeName()};\n`
    return output;
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


  public genPublicHeaderFile() : string 
  {
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
    this.genStatemachineInputValuesStruct()+
    this.genStatemachineOutputValuesStruct()+
    this.genStatemachineOutputEventsStruct()+
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


  genEventHandlerPrototype(state:State) : string {
    return `static void ${state.label}_event_handler(${this.classFullName} *sm, ${this.classFullName}_EventId event_id)`;
  }

  genEventHandlerPrototypes() : string {
    let output = "\n\n";
    let states = this.hsm.getAllStates();
    output += this.createCommentHeader(`Handler Prototypes for ${this.classFullName}`).trim() + "\n";

    for(let state of states) {
      output += `${this.genEventHandlerPrototype(state)};\n`;
    }
    output = StringUtils.alignStringMarkersSimple(["("], output);
    return output;
  }

  genEventHanlderDefinitions() : string {
    let output = "";

    for(let state of this.hsm.getAllStates()) {
      output += "\n\n" + this.genEventHandlerDefinition(state);
    }

    return output;
  }

  genEventHandlerDefinition(state : State) : string {
    let inner = this.genNormalStateEventHandlers(state);

    let output = `
    <s>${this.genEventHandlerPrototype(state)}
    <s>{
    <s>  //TODO copy paste in entry and exit code in comments
    ${inner}
    <s>}

    `;

    output = StringUtils.processMarkers(output);

    return output;
  }

  private genNormalStateEventHandlers(state:State): string {
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

  genEnterExitHandler(state: State, eh : EventHandler, skipEventTest = false) {
    let output = "";
    let expandedGuardCode = "";

    let guardText = "";

    let actionCode = "";
    if(eh.action){
      actionCode += `${StringUtils.indent(eh.action.actionCode, "//")}\n`;
      actionCode += `${this.expandActionCode(state, eh, eh.noExpand)};`;
    }

    if(eh.guard && eh.guard.guardCode){
      guardText = eh.guard.guardCode;
      expandedGuardCode += `(${this.expand(guardText, eh.noExpand)})`;

      output += `
      <s>      //if ${guardText}
      <s>      if ${expandedGuardCode}
      <s>      {
                  ${StringUtils.indent(actionCode, "<s>        ")}
      <s>      }
      `;
    }
    else if(actionCode) {
      output += `
        ${StringUtils.indent(actionCode, "<s>      ")}
      `;
    }

    if(eh.nextState){
      throw "enter & exit can't transition"; //TODOLOW move to generator
    }

    output = StringUtils.processMarkers(output);
    return output;    
  }

  getTxPeakState(from:State, dst:State)
  {
    if (from == dst){
      return from.parent; //special case for self transitions
    }

    let peak = from;
    while (!peak.isAncestorOf(dst) && peak != dst) {
      peak = peak.parent;
    }
    return peak;
  }

  getStatesDownToDst(from:State, peak:State, dst:State)
  {
    let chain : State[] = [];
    let cur = dst;

    //special case for when self transitions
    if (from == dst) {
      return [from];
    }

    while(cur != peak) {  //might be true right away from child to parent transition
      chain.unshift(cur);
      cur = cur.parent;      
    }
    return chain;
  }

  genEnterCode(from:State, peak:State, dst:State) : string {
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

  genEventHandler(state: State, eh : EventHandler) {
    let output = "";
    let expandedGuardCode = "";
    let triggerCode = "";
    let triggerConditionWouldNeedBrackets = eh.triggersCount() > 1;

    let join = "";
    for(let trigger of eh.getTriggers()) {
      triggerCode += `${join}event_id == ${this.buildInputEventEnumName(trigger.toString())}`
      join = " || ";
    }

    if(eh.hasTrigger(Triggers.ELSE)){
      triggerCode = "true";
    }

    let guardText = "";


    if(eh.guard){
      guardText = eh.guard.guardCode;

      if (triggerCode){
        if (triggerConditionWouldNeedBrackets) {
          triggerCode = `(${triggerCode})`; //surround in brackets so the && works properly
        }
        expandedGuardCode += " && ";
      }
      expandedGuardCode += `(${this.expand(guardText, eh.noExpand)})`;
    }

    let actionCode = "";
    if(eh.action){
      actionCode = `${this.expandActionCode(state, eh, eh.noExpand)};`;  //TODO someday: if external transition, use call back to call between exits and enters so that action code is actually run in middle of transition (AKA after all exits are fired).
      actionCode = "\n" + StringUtils.indent(actionCode, "<s>    ");

      //if check on DO at runtime because we can have multiple events together for a single handler
      actionCode = `
      <s>    if (event_id != ${this.classFullName}_EventId__DO) {
      <s>        sm->event_handled = true;  //done before action code to allow action code to allow bubbling
      <s>    }
      ` + actionCode;
    }

    let transitionCode = "";
    if(eh.nextState){
      let tthis = this;
      const peak = this.getTxPeakState(state, eh.nextState);

      transitionCode = `
        <s>    //transitioning from ${state.label} to ${eh.nextState.label}
        <s>    exit_upto(sm, ${tthis.classFullName}_StateId__${peak.label});
        <s>
        <s>    //enter states
                ${StringUtils.indent(this.genEnterCode(state, peak, eh.nextState), "<s>    ")}
        <s>
        <s>    sm->event_handled = true;
        <s>    return; //stop processing because it transitioned
        <r>`
    }

    let if_guard_text = "";
    if(guardText){
      if_guard_text = " if " + guardText;
    }

    let if_trigger_text = "";
    if(eh.hasSomeTriggers()){
      if_trigger_text = `ON ${Array.from(eh.getTriggers()).join(" or ")}`;
    }

    if(eh.hasTrigger(Triggers.ELSE)){
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
    `

    output = StringUtils.processMarkers(output);
    return output;    
  }

  private expandActionCode(state: State, eh: EventHandler, noExpand: boolean): any {
    if (noExpand) {
      return eh.action.actionCode;
    }
    
    let code = eh.action.actionCode;
    for (let i = 0; i < 10; i++) {
      code = this.expand(code, noExpand); //TODOLOW clean up & detect when done      
    }

    code = code.replace(/[$](handlerDescriptionString|handlerDescriptionStringNoAction)[$]/g, function(_, directive){
      let handlerDescription = `${state.label}: `;
      let spacer = "";

      if (eh.hasSomeTriggers()) {
        if (eh.triggersCount() == 1) {
          handlerDescription += `${eh.getTriggers()[0]}`;
        } else {
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
        handlerDescription += `-> ${eh.nextState.label}`  ;
      }

      return `"${handlerDescription}"`;
    });

    return code;
  }


  private expand(textToExpand : string, preventExpand : boolean) : string {
    let output = textToExpand;
    if(preventExpand == false){
      output = this.expander.expandText(textToExpand);
    }

    return output;
  }


  private genCustomFunctions() : string {
    let output = "";

    output += this.buildExpandedSection("CUSTOM FUNCTIONS", this.hsm.inputHsm.cFunctions);
    output += this.hsm.inputHsm.cFunctionsNoExp + "\n";

    return output;
  }

  
  genParentMapping(): string {
    let output = "\n\n";
    output += this.createCommentHeader(`Parent mapping for all ${this.classFullName} state IDs`).trim() + "\n";
    output += `static const ${this.classFullName}_StateId parent_mapping[${this.classFullName}_StateCount] = {\n`;

    let states = this.hsm.getAllStates();

    let inner = "";
    for (let i = 0; i < states.length; i++) {
        let state = states[i];
        inner += `  [${this.genStateIdTypeName()}__${state.label}] = ${this.genStateIdTypeName()}__${(state.parent || state).label},\n`;  //funkyness for root state that doesn't have a parent
    }
    inner = StringUtils.alignRegexInStringsSimple(/=/, inner);
    output += inner;
    output += `};\n`
    return output;  
  }

  genStateHandlerMapping(): string {
    let output = "\n\n";
    output += this.createCommentHeader(`Parent mapping for all ${this.classFullName} state IDs`).trim() + "\n";
    output += `static const ${this.classFullName}_EventHandler state_handlers[${this.classFullName}_StateCount] = {\n`;

    let states = this.hsm.getAllStates();

    let inner = "";
    for (let i = 0; i < states.length; i++) {
        let state = states[i];
        inner += `  [${this.genStateIdTypeName()}__${state.label}] = ${state.label}_event_handler,\n`;
    }
    inner = StringUtils.alignRegexInStringsSimple(/=/, inner);
    output += inner;
    output += `};\n`
    return output;  
  }

  genEnterStateDefinition() : string {
    let output = "\n\n";
    output += this.createCommentHeader(`TODO ${this.classFullName} `).trim() + "\n";
    output += `static void enter_state(${this.classFullName}* sm, ${this.classFullName}_StateId state_id)\n{\n`;
    output += `  switch(state_id)\n  {`
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
    output += `  }\n`
    output += `};\n`
    return output;  
  }

  genExitStateDefinition() : string {
    let output = "\n\n";
    output += this.createCommentHeader(`TODO ${this.classFullName} `).trim() + "\n";
    output += `static void exit_state(${this.classFullName}* sm, ${this.classFullName}_StateId state_id)\n{\n`;
    output += `  switch(state_id)\n  {`
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
    output += `  }\n`
    output += `};\n`
    return output;  
  }
  private genFileHeaderInfo() : string {
    let output = "";
    let text = `
    @file

    @brief     State machine "${this.classFullName}"
               Auto generated from file: ${this.hsm.inputHsm.diagramSourceFilePath}

    @copyright Copyright (c) 2019 JCA Electronics, Winnipeg, MB.
               All rights reserved.
    `;
    text  = StringUtils.removeBlankLinesAtTop(text);
    text = StringUtils.deIndent(text);

    output = this.createCommentHeader(text).trim() + "\n";
    return output;
  }


  public genSourceFile() : string {
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
      this.genEventHanlderDefinitions()+
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
`
      ;
    fullOutput = this.postProcessCode(fullOutput);
    return fullOutput;
  }


}////////////////////////////////////////////////

