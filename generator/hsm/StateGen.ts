import { Compiler, ROOT_STATE_ID } from "./Compiler";
import { State } from "./State";
import { StringUtils } from "../ts-utils/StringUtils";
import { Guard, Action, Trigger, EventHandler } from "./Generator";
import * as Triggers from "./Triggers"
import nunjucks = require("nunjucks")


export class StateGen {
  stateEnumsPrefix : string = "StateId__";
  stateEnumsPostfix : string = "";
  stateEnumType : string = "";

  compiler : Compiler;

  constructor (compiler : Compiler){
    this.compiler = compiler;
  }

  genStateUniqueName(state:State) : string {
    let output = this.getFullPathNameToState(state);
    if(state == this.compiler.hsm.rootState){
      output = "Root";
    }
    return output;
  }

  genStateEventHandlerName(state :State) : string {
    return this.genStateUniqueName(state) + "_handler";
  }

  genStateVarsTypedefName(state :State) : string {
    return this.compiler.classPrefix + "_" +  this.genStateUniqueName(state) + "_Vars";
  }

  getFullPathNameToState(state : State, seperator = "__") : string {
    let output = "";
    let cur = state;
    let sep = "";
    while(cur != null){
      let prepend = "";
      prepend = cur.label.toUpperCase();
      if(cur.is_ortho_parent && cur != state){
        prepend += "__op__"; //meant to signify an ortho parent
      }else{
        prepend += sep;
      }
      output = prepend + output;
      sep = seperator;
      cur = cur.parent;
    }
    
    return output;
  }


  genStateEnumName(state : State) : string {
    let path = this.getFullPathNameToState(state);
    let output = "";
    output = this.compiler.buildClassEnumName(`${this.stateEnumsPrefix}${path}${this.stateEnumsPostfix}`);

    //let output = this.getStateEnumNameFromString(state.label) + "_S"+state.outputId;
    return output;
  }


  getStateEnumNameFromString(stateName : string) : string {
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

  private allStates() {
    return this.compiler.hsm.getAllStates();
  }

  genStateVarsPrototypes() : string {
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

  genStateVarInstanceName(state:State) : string {
    return this.genStateUniqueName(state).toLowerCase() + "_vars";
  }

  genStateVarStruct(state:State) : string {
    let output = "";

    let inner = "";

    for(let kid of state.kids) {
      inner += `\n<s>  ${this.genStateVarsTypedefName(kid)} ${this.genStateVarInstanceName(kid)};`;
    }

    if(state.kids.length > 0){
      inner = inner.replace(/<s>/g,"<s>  "); //increase indent
      inner = StringUtils.alignRegexesInStringsSimple([/\b +\b/], inner); //align struct/union field names (which comes after field type).

      if(state.is_ortho_parent){
        inner = `
        <s>  HsmContext orthoKidContexts[${state.kids.length}];
        <s>  struct 
        <s>  { //context variables for kids  ${inner}
        <s>  };
        `;
      }else{
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
    output = StringUtils.processMarkers(output) + "\n\n\n";
     
    return output;
  }  

  genStateVarsStructs() : string {
    let output = "";
    let states = this.allStates();

    let depth = 0;
    for(let state of states) {
      depth = Math.max(depth, state.depth);
    }

    for (; depth >= 0; depth--) {
      let fstates = states.filter(function(state:State){
        return state.depth == depth;
      });
      for(let state of fstates) {
        output += this.genStateVarStruct(state);
      }
    }

    output = "\n\n" + this.compiler.createCommentHeader(`State variable structs for ${this.compiler.classFullName}`).trim() + "\n" + output;

    return output;
  }  



  genStateDefinition(state :State) : string{
    let parent = state.parent;
    if(state.outputId == ROOT_STATE_ID){
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

     output = StringUtils.removeBlankLinesAtBottom(output);


    return output;
  }

  genEventHandlerPrototype(state:State) : string {
    return `static void ${this.genStateEventHandlerName(state)}(Jxc* jxc, Hsm2* hsm, HsmContext* context, const HsmEvent* event)`;
  }

  genEventHandlerPrototypes() : string {
    let output = "\n\n";
    let states = this.allStates();
    output += this.compiler.createCommentHeader(`Handler Prototypes for ${this.compiler.classFullName}`).trim() + "\n";

    for(let state of states) {
      output += `${this.genEventHandlerPrototype(state)};\n`;
    }
    output = StringUtils.alignStringMarkersSimple(["("], output);
    return output;
  }

  genEventHanlderDefinitions() : string {
    let output = "";

    for(let state of this.allStates()) {
      output += "\n\n" + this.genEventHandlerDefinition(state);
    }

    return output;
  }

  genEventHandlerDefinition(state : State) : string {
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

    output = StringUtils.processMarkers(output);

    return output;
  }

  listTriggers(triggers : Iterable<Trigger>) : string {
    let output = "";
    let sep = "";
    for (let trigger of triggers){
      output += `${sep}${this.compiler.buildInputEventEnumName(trigger.toString())}`;
      sep = ", ";
    }
    return output;
  }

  listTriggersReadable(triggers : Iterable<Trigger>) : string {
    let output = this.listTriggers(triggers);
    output = output.replace(/HsmEventId__/g, "");
    return output;
  }

  private expand(textToExpand : string, preventExpand : boolean) : string {
    let output = textToExpand;
    if(preventExpand == false){
      output = this.compiler.expander.expandText(textToExpand);
    }

    return output;
  }

  genHandlersForTrigger(eventHandlers : ReadonlyArray<EventHandler>, trigger : Trigger) : string {
    let output = "";
    for(let handler of eventHandlers) {
      if(handler.hasTrigger(trigger)){
        output += this.genEventHandler(handler);
      }
    }

    return output;
  }


  genEventHandler(eh : EventHandler) {
    let output = "";
    let expandedGuardCode = "";
    let triggerCode = "";

    if(eh.hasSomeTriggers()){
      triggerCode = "(";
      let join = "";
      for(let trigger of eh.getTriggers()) {
        triggerCode += `${join}(event_id == ${this.compiler.buildInputEventEnumName(trigger.toString())})`
        join = " || ";
      }
      triggerCode += ")";
    }

    if(eh.hasTrigger(Triggers.ELSE)){
      triggerCode = "true";
    }

    let guardText = "";


    if(eh.guard){
      guardText = eh.guard.guardCode;

      if(triggerCode){ 
        expandedGuardCode += " && ";
      }
      expandedGuardCode += `(${this.expand(guardText, eh.noExpand)})`;
    }

    let actionCode = "";
    if(eh.action){
      actionCode = `${this.expand(eh.action.actionCode, eh.noExpand)};`;  //TODO someday: if external transition, use call back to call between exits and enters so that action code is actually run in middle of transition (AKA after all exits are fired).
      actionCode = "\n" + StringUtils.indent(actionCode, "<s>    ");
    }

    let transitionCode = "";
    if(eh.nextState){
      transitionCode = `\n<s>    Hsm_mark_transition_request(jxc, hsm, context, this_state, ${this.genStateEnumName(eh.nextState)});`
    }

    let if_guard_text = "";
    if(guardText){
      if_guard_text = "if " + guardText;
    }

    let if_trigger_text = "";
    if(eh.hasSomeTriggers()){
      if_trigger_text = `ON ${this.listTriggersReadable(eh.getTriggers())} `;
    }

    if(eh.hasTrigger(Triggers.ELSE)){
      if_trigger_text = `ELSE `;
    }

    output += `
    <dummy>
    <s>  //${(eh.commentOverride || if_trigger_text + if_guard_text).replace(/[\r\n]+/g, " ").replace(/[ ]{2,}|\\t/g, " ")}
    `.trim();

    if(Triggers.hasTransitionTrigger(eh.getTriggersSet())) {
      eh.markContextHandled = false; //not applicable to these events
    } else {
      output += `
      <s>
      <s>  if (Hsm_is_transition_requested(context)) { return; }    //stop processing if transitioning
      `.trim();
    }

    let context_handled_text = `
    <s>    //mark that event has handled
    <s>    context->event_handled = default_event_handled_value;
    <r>`;

    if(eh.markContextHandled == false){
      context_handled_text = "";
    }

    output += `
    <s>  if( ${triggerCode + expandedGuardCode}  ){ ${actionCode} ${transitionCode}${context_handled_text}
    <s>  }
    <s>
    `

    output = StringUtils.processMarkers(output);
    return output;    
  }

  genEventHandlersForState(state:State): string {
    let output = "";

    if(state.is_ortho_parent){
      output = this.genOrthoParentEventHandlers(state);
    } else {
      output = this.genNormalStateEventHandlers(state);
    }

    return output;
  }

  genOrthoParentEventHandlers(state : State) : string {
    let inner = "";
    let output = "";

    //add event handlers specific to being an ortho parent
    let event = new EventHandler();
    let actionCode : string; 

    //EXIT EVENT
    event = new EventHandler();
    event.action = new Action();
    event.setTriggers([Triggers.EXIT]);
    actionCode = nunjucks.renderString(`<r>
      <s>//loop through ortho kids and exit any of them that are still running
      <s>Hsm_exit_okids(jxc, hsm, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts));
      <r>`, {compiler:this, state:state});
    event.action.actionCode = StringUtils.processMarkers(actionCode);
    output += this.genEventHandler(event);
    output += this.genHandlersForTrigger(state.eventHandlers, Triggers.EXIT);


    //ENTER EVENT
    //generate this state's regular user defined enter action
    output += this.genHandlersForTrigger(state.eventHandlers, Triggers.ENTER);  //BUG FIX! the enter event for the parent must come before childrens.

    //generate special entry code for being an ortho parent
    event = new EventHandler();
    event.action = new Action();
    event.setTriggers([Triggers.ENTER]);
    actionCode = nunjucks.renderString(`<r>
      <s>//setup orthogonal kid contexts
      <s>Hsm_set_contexts_region_parent_id(jxc, hsm, this_state->node.id, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts));
      {%- for kid in state.kids %}
      <s>vars->orthoKidContexts[{{loop.index0}}].region_top_state_id = {{compiler.stateGen.genStateEnumName(kid)}};
      {%- endfor %}      
      <s>Hsm_handle_ortho_kids_enter(jxc, hsm, context, vars->orthoKidContexts, COUNTOF(vars->orthoKidContexts)); 

    `, {compiler:this.compiler, state:state});
    event.action.actionCode = StringUtils.processMarkers(actionCode);
    output += this.genEventHandler(event);


    //LANDED_IN EVENT
    output += this.genHandlersForTrigger(state.eventHandlers, Triggers.LANDED_IN);    


    //rest of events.
    let nonTransitionHandlers = Triggers.getNonTransitionTriggerHandlers(state);
    let customEventHandlers : EventHandler[] = [];
    let doEventHandlers : EventHandler[] = [];

    //render 
    nonTransitionHandlers.filter(function(handler: EventHandler){
      if(handler.hasTrigger(Triggers.DO)){  
        //TODO HIGH - do not differentiate! It causes problems if DO event is joined with something custom like "(DO || MY_EVENT) / action".
        // why? Because being lumped in with the DO event prevents the check of event already handled.
        doEventHandlers.push(handler);
      }else{
        customEventHandlers.push(handler);
      }
    });

    //EVENT proxying + do
    event = new EventHandler();
    event.action = new Action();
    //enterEvent.triggers = new Set<Trigger>([Triggers.ORTHO_PROXY]);
    event.guard = new Guard();
    event.noExpand = true;
    event.commentOverride = "Proxy events to orthogonal kids"
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
    event.action.actionCode = StringUtils.processMarkers(actionCode);
    event.markContextHandled = false; //not applicable to this event
    output += this.genEventHandler(event);

    return output;
  }

  private genEventHandlersForArray(eventHandlers : EventHandler[]){
    let output = "";

    for(let eh of eventHandlers) {
      output += this.genEventHandler(eh);
    }

    return output;
  }

  private genNormalStateEventHandlers(state:State): string {
    let output = "";
    let joiner = "\n  ";

    let handlers = state.eventHandlers.slice(0);

    let restOfEvents = new Set<EventHandler>(state.eventHandlers);
    let hh : Set<EventHandler>;

    var tthis = this;

    //render EXIT first
    hh = new Set<EventHandler>(restOfEvents);
    hh.forEach(function(e: EventHandler, notNeeded: EventHandler, set: Set<EventHandler>){
      if(e.hasTrigger(Triggers.EXIT)){
        output += joiner + tthis.genEventHandler(e);
        restOfEvents.delete(e);
      }
    });

    //render ENTER next
    hh = new Set<EventHandler>(restOfEvents);
    hh.forEach(function(e: EventHandler, notNeeded: EventHandler, set: Set<EventHandler>){
      if(e.hasTrigger(Triggers.ENTER)){
        output += joiner + tthis.genEventHandler(e);
        restOfEvents.delete(e);
      }
    });

    //render LANDED_IN next
    hh = new Set<EventHandler>(restOfEvents);
    hh.forEach(function(e: EventHandler, notNeeded: EventHandler, set: Set<EventHandler>){
      if(e.hasTrigger(Triggers.LANDED_IN)){
        output += joiner + tthis.genEventHandler(e);
        restOfEvents.delete(e);
      }
    });

    output += StringUtils.processMarkers(`
      <s>
      <s>  //------------- END OF TRANSITION HANDLERS --------------------
      <s>  if (Hsm_event_part_of_transition(event)) { 
      <s>    return; 
      <s>  }    
      <s>
    `);

    //render DO next
    //FUTURE TODO - don't treat do any differently. This will help for upcoming event ordering.
    hh = new Set<EventHandler>(restOfEvents);
    hh.forEach(function(e: EventHandler, notNeeded: EventHandler, set: Set<EventHandler>){
      if(e.hasTrigger(Triggers.DO)){
        output += joiner + tthis.genEventHandler(e);
        restOfEvents.delete(e);
      }
    });

    //render normal rest
    hh = new Set<EventHandler>(restOfEvents);
    hh.forEach(function(e: EventHandler, notNeeded: EventHandler, set: Set<EventHandler>){
      output += joiner + tthis.genEventHandler(e);
      restOfEvents.delete(e);
    });


    return output;
  }




  classPrefix(){ return this.compiler.classPrefix; }

  sep(){ return this.compiler.sep; }


  isRoot(state: State) {
    return state == this.compiler.hsm.rootState;
  }

  genStateTempVarPathFromRoot(state : State) : string {
    let output = "";
    let joiner = "";
    do{
       output = this.genStateVarInstanceName(state) + joiner + output;
       state = state.parent;
       joiner = ".";
    }while(state != null)

    return output;
  }

  

  genStateIdCountEnumName() : string {
    return this.compiler.buildClassEnumName("STATE_COUNT");
  }

  genStateEnums(states : State[]){
    let output = "";
    output += this.compiler.createCommentHeader(`Enumeration for all ${this.compiler.classFullName} state IDs`).trim() + "\n";
    output += `typedef enum _${this.stateEnumType}\n{\n`;

    let rootState;
    let inner = "";
    for (let i = 0; i < states.length; i++) {
        let state = states[i];
        if(state === this.compiler.hsm.rootState){  //TODO create is root function
          rootState = state;
          //inner += `  ${this.getStateEnumName(state)} = ${HSM_ROOT_STATE_ENUM_ID},\n`;
        }
          inner += `  ${this.genStateEnumName(state)} = ${state.outputId},\n`;
    }
    inner = StringUtils.alignRegexInStringsSimple(/=/, inner);
    output += inner;
    output += "  //--------------------------\n"
    output += `  ${this.genStateIdCountEnumName()} = ${states.length},\n`;
    output += `} ${this.stateEnumType};\n`
    output += `static_assert(${this.genStateEnumName(rootState)} == ${ROOT_STATE_ID}, "'${this.genStateEnumName(rootState)}' must equal ${ROOT_STATE_ID} for root state");`
    return output;
  }

  public genStateInstanceName(state : State) : string {
    return this.compiler.classPrefix + "_" + this.genStateUniqueName(state) + "_ref";
  }

  public genStateExternStateInstances(states : State[]) : string {
    //const HsmState * const ButSm_State_ROOT_STATE_S0 = &states[ButSm_StateId__ROOT_STATE_S0];
    let moreOutput = `\n`;
    for(let state of states) {
      moreOutput += `extern const HsmState * const ${this.genStateInstanceName(state)};\n`  
    }
    return moreOutput;
  }

  public genStateDefinitions(states : State[]): string {
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
    for(let state of states) {
      moreOutput += `const HsmState * const ${this.genStateInstanceName(state)} = &states[${this.genStateEnumName(state)}];\n`  
    }
    moreOutput = StringUtils.alignStringMarkersSimple(["="], moreOutput);
    output += moreOutput;


    output = StringUtils.processMarkers(output);
    output =  this.compiler.createCommentHeader(`'${this.compiler.classFullName}' STATE DEFINITION`) + output;
    return output;
  }

}


