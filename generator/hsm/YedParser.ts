
//debug in Chrome!
//node --inspect --debug-brk YedParser.js
//https://blog.hospodarets.com/nodejs-debugging-in-chrome-devtools#debug-in-devtools
//https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27#.xd1lmpcdr
//Console will not work unless you change URL to use 127.0.0.1 instead of 'localhost'
// see https://github.com/nodejs/node/issues/9382


//npm install cheerio
//typings install dt~cheerio --save --global
import cheerio = require('cheerio');

import {InputHsm, DEFAULT_TRANSITION_ORDER_NUMBER} from "./Generator"
import {InputEventHandler} from "./Generator"
import {InputState} from "./Generator"
import {MacroExpander} from "./input"
import {MyRegex} from "../ts-utils/MyRegex"
import path = require('path');

const r = new MyRegex();


const attrKeys = {
  SM:"_tagged_as_sm", //we add this attribute to a node to make it easy to find statemachine roots
  SM_NAME: "_sm_name",
  LABEL: "_label",
  IS_PSEUDO_INITIAL_STATE : "_tagged_as_pseduo_initial",
  ORTHOGONAL_STATE_ORDER : "_orthogonal_state_order",
};  //attribute keys

//something like this: typings install dt~node
import fs = require("fs"); //node filesystem
import { ROOT_STATE_LABEL } from "./Compiler";


// export class StateElement  {
//
//   doSomething(){
//     let c : CheerioElement;
//     c.
//   }
//
// }


export class YedParser {
    diagramSourceFilePath : string;
    statemachineRoots: CheerioElement[];
    edgeDescriptionKeyId: string;
    nodeDescriptionKeyId: string;
    graphDescriptionKeyId: string;
    allNodes: CheerioElement[];    //!< a yEd node like "<node id="n0" yfiles.foldertype="group">"
    graphDescription: string;
    graphDescriptionKey: CheerioElement;
    nodeDescriptionKey: CheerioElement;
    edgeDescriptionKey: CheerioElement;
    nodeGraphicsKey: CheerioElement;
    nodeGraphicsKeyId:string;
    $ : CheerioStatic;

  public run(diagramSourceFilePath) : InputHsm[]{
    this.diagramSourceFilePath = path.resolve(diagramSourceFilePath);
    let fileText = fs.readFileSync(diagramSourceFilePath).toString()    

    let parsedStateMachines : InputHsm[] = [];
    let yedParser = this;
    fileText = this.modifyXml(fileText);

    this.$ = cheerio.load(fileText, {xmlMode:true});
    let $ = this.$;

    //find id for edge descriptions
    this.edgeDescriptionKey = $("key[attr\\.name=description][for=edge]")[0];
    this.edgeDescriptionKeyId = this.edgeDescriptionKey.attribs["id"];

    //find id for node descriptions
    this.nodeDescriptionKey = $("key[attr\\.name=description][for=node]")[0];
    this.nodeDescriptionKeyId = this.nodeDescriptionKey.attribs["id"];

    //find id for node labels and graphics (folder open/closed)
    this.nodeGraphicsKey = $("key[yfiles\\.type=nodegraphics][for=node]")[0];
    this.nodeGraphicsKeyId = this.nodeGraphicsKey.attribs["id"];

    //find id for graph description
    this.graphDescriptionKey = $("key[attr\\.name=Description][for=graph]")[0];
    this.graphDescriptionKeyId = this.graphDescriptionKey.attribs["id"];

    let b = $(`data[key=${this.graphDescriptionKeyId}]`).eq(0);

    this.graphDescription = $(`data[key=${this.graphDescriptionKey.attribs["id"]}]`).text();

    this.allNodes = $("graph node").toArray();

    //expose all node labels as attributes
    for(let s of this.allNodes){
      s.attribs[attrKeys.LABEL] = this.getNodeLabel(s);
      //console.log( `NODE LABEL starts with : '${s.attribs[attrKeys.LABEL]}'`);
    }


    //find all statemachine roots
    this.statemachineRoots = $("graph node").filter(function(index: number, element : CheerioElement){
      let label = yedParser.getNodeLabel(element);
      //console.log("LABEL: " + label);
      let re = /^\s*[$]STATEMACHINE\s*:\s*(\w+)\s*(?:$|\r|\n)/i;
      let match = re.exec(label);
      if(match){
        //console.log("MATCH!: " + match);
        let statemachineName = match[1];
        element.attribs[attrKeys.SM_NAME] = statemachineName;
      }

      return match !== null;
    }).toArray(); //http://api.jquery.com/filter/



    for(let s of this.statemachineRoots){
      s.attribs[`${attrKeys.SM}`] = "yes"; //tag as a statemachine root
      //console.log("STATEMACHINE NAME: " + s.attribs[attrKeys.SM_NAME]);
    }



    this.preValidate();

    //console.log(this.statemachineRoots);

    //build HSM
    for(let s of this.statemachineRoots){
      let result : InputHsm = this.generateInputHsm(s);
      //console.log("\n\n\n\n HSM:", this.getNodeLabel(s), "\n", result);
      parsedStateMachines.push(result);
    }

    this.postValidate(parsedStateMachines);

    console.log("End of parsing");
    return parsedStateMachines;
  }



  private postValidateState(state : InputState){
    let $ = this.$;

    for(let eh of state.eventHandlers){

      //don't allow event handlers that do nothing
      if(eh.nextInputStateId == null && eh.action == null){
        console.log("Error details:");
        console.log(state, eh);
        throw "Event handler for state has no action";
      }
    }
  }

  private postValidateInputHsm(sm : InputHsm){
    let $ = this.$;
    for(let state of sm.states){
      this.postValidateState(state);
    }
  }

  private postValidate(parsedStateMachines : InputHsm[]){
    for(let sm of parsedStateMachines){
      this.postValidateInputHsm(sm);
    }
  }

  private preValidate(){
    let $ = this.$;

    //fail on nested statemachines
    for(let s of this.statemachineRoots){
      let outerParent = $(s).parent().closest(`[${attrKeys.SM}]`).get(0);
      if(outerParent){
        console.log("Nested statemachine detected! Not yet supported.");
        console.log("Inner Statemachine label: ", this.getNodeLabel(s));
        console.log("Outer Statemachine label: ", this.getNodeLabel(outerParent));
        throw "Nested statemachine detected! Not yet supported.";
      }
    }

    //TODO do not allow edges to or from GEN directive nodes



  }

  private getAllDescendentNodes(parentNode : CheerioElement) : CheerioElement[]{
    let $ = this.$;
    let nodes = $(parentNode).find("node").toArray();
    return nodes;
  }

  private findAllStateNodes(parentNode : CheerioElement) : CheerioElement[] {
    let $ = this.$;
    let all = this.getAllDescendentNodes(parentNode);
    let special = this.findSpecialNodes(parentNode);
    let result = $(all).not($(special)).toArray();
    return result;
  }

  private findSpecialNodes(parentNode : CheerioElement) : CheerioElement[] {
    let $ = this.$;
    let nodes = $(parentNode).find(`[${attrKeys.LABEL}^="$"]`).toArray();
    //console.log("SPECIIAL NODES: ", nodes);

    return nodes;
  }

  private handleSpecialDirectives(hsm : InputHsm, rootNode : CheerioElement) : void {
    //find all directive strings
    let directiveString = "";
    let directiveNodes = this.findSpecialNodes(rootNode);

    for(let d of directiveNodes){
      let label = this.getNodeLabel(d);
      //console.log("SPECIAL NODE LABEL: ", label);
      let directiveName =  label.match(/^\s*[$](\w+)\b/)[1];

      switch(directiveName.toUpperCase()){
        case "GEN":
          //console.log("GENNNNNNNNN");
          this.parseGenDirectiveNode(hsm, d);
        break;

        case "NOTES":
        break;

        case "PARENT_ALIAS":
        {
          let parentNode = this.findParentNode(d);
          //remove PARENT_ALIAS part and then copy the rest over to the parent's label
          let restOfLabel = label.replace(/^\s*[$]PARENT_ALIAS\b\s*/i, "");
          let parentLabel = this.getNodeLabel(parentNode);
          let newLabel = parentLabel + "\n" + restOfLabel;
          this.setNodeLabel(parentNode, newLabel);
        }
        break;

        case "GEN_INCLUDE":
        {
          //syntax: $GEN_INCLUDE : "<filename>"
          //get file name to try and import
          let match = label.match(/^\s*[$]GEN_INCLUDE\s*:\s*"(.+)"\s*$/i);
          if(!match){
            console.log(label);
            throw new Error(`Invalid syntax for GEN_INCLUDE. Must be: $GEN_INCLUDE:"<relative_file_path>"`);
          }
          let sourceDirectory = path.dirname(this.diagramSourceFilePath);
          let filename = match[1];
          let filePath = sourceDirectory + path.sep + filename;

          try {
            let text = fs.readFileSync(filePath).toString();
            this.parseGenDirectiveText(hsm, text);
          } catch (error) {
            console.log("Tried reading path: " + filePath);
            throw new Error(`Failed reading file '${filename}' for for GEN_INCLUDE `);
          }
        }
        break;

        case "INITIAL_STATE":
          d.attribs[attrKeys.IS_PSEUDO_INITIAL_STATE] = "yes";
          d.attribs[attrKeys.LABEL] = "PSEUDO_INIT";
        break;

        case "ORTHO":{
          let order = d.attribs[attrKeys.LABEL].match(/^\s*[$]ORTHO\s*(-?\d+)?\s*:\s*/i)[1] || 1000000; //TODOLOW document 1000000 as default ordering number
          //rip off "ORTHO digit : " from label
          d.attribs[attrKeys.LABEL] = d.attribs[attrKeys.LABEL].replace(/^\s*[$]ORTHO\s*(-?\d+)?\s*:\s*/i, "");
          d.attribs[attrKeys.ORTHOGONAL_STATE_ORDER] = order.toString();
        }
        break;

        case "STATEMACHINE":
          //nothing needed to be done
        break;

        default:
        throw `Unknown directive name : '${directiveName}'`;
      }
    }
  }



  private parseGenDirectiveNodeSectionShorthand(hsm : InputHsm, sectionName: string, sectionContents : string){
    //sectionContents = sectionContents.replace(/^[ \t]*(?:\r\n|\n|\r)/g, "");//rip out empty leading lines
    sectionContents += "\n";

    try{
      this.addTextToHsmField(hsm, sectionName, sectionContents);
    } catch(e){
      let msg = `Invalid section name: '${sectionName}'`
      console.log("\n\n" + msg);
      console.log("<failure_details>");
      console.log(sectionName, sectionContents);
      console.log("Original exception", e);
      console.log("</failure_details>\n\n");
      throw msg;
    }
  }

  private addTextToHsmField(hsm : InputHsm, fieldName : string, contents : string) : void {
    switch(fieldName){
      case "input_values":
        hsm.inputValues += contents;
      break;

      case "output_values":
        hsm.outputValues += contents;
      break;

      case "output_events":
        hsm.outputEvents += contents;
      break;

      case "c_functions":
        hsm.cFunctions += contents;
      break;

      case "c_functions_no_exp":
        hsm.cFunctionsNoExp += contents;
      break;

      case "c_prototypes":
        hsm.cPrototypes += contents;
      break;

      case "c_prototypes_no_exp":
        hsm.cPrototypesNoExp += contents;
      break;

      case "expansions":
        hsm.expansionDefinitions += contents;
      break;

      case "vars":
        hsm.varsStructInnerText += contents;
      break;

      case "execute_after_dispatch":
        hsm.executeAfterCode += contents;
      break;

      case "execute_before_dispatch":
        hsm.executeBeforeCode += contents;
      break;

      case "imports":
        hsm.imports += contents;
      break;

      case "h_file_top":
        hsm.h_file_top += contents;
      break;

      case "c_file_top":
        hsm.c_file_top += contents;
      break;

      default:
        throw "Unknown InputHsm field: '" + fieldName + "'";
    }
  }

  private parseGenDirectiveText(hsm : InputHsm, directiveContents : string){

    directiveContents = directiveContents.trim();
    let re : RegExp;
    let match : RegExpExecArray;

    //hide comment and string innards
    let m = new MacroExpander();
    let s = m.hideCommentAndStringInnards(directiveContents);

    {
      let field = `^${r.mhs}(\\w+)${r.mhs}=${r.mhs}"(.*)"${r.mhs}$`;
      let ignored = `((?:\\s+|${MyRegex.buildCommentRegex().source})+)`;
      let section = /\s*^(\w+)\s*(?:\r\n|\n|\r)[ \t]*====+[ \t]*$([^]*?)^[ \t]*\/====+[ \t]*$/.source;
      let invalid = /([^]{1,30})/.source;
      let reStr = `${ignored}|${section}|${field}|${invalid}`;
      re = new RegExp(reStr, "mgy");
    }

    let previousIgnored = "";

    while(match = re.exec(s)){
      let ignored = match[1];
      let sectionName = match[2];
      let sectionContents  = match[3];
      let field = match[4];
      let fieldContents = match[5];
      let unknownStuff = match[6];

      if(ignored != undefined){
        previousIgnored += ignored;
        continue; //skip ignored stuff
      }

      if(unknownStuff != undefined){
        console.log("Error details:");
        console.log(re, match);
        throw "Invalid gen directive section. Format should be <section_name>\\n======\\nstuff\\n/======\\n";
      }

      //TODOLOW ensure field and section not filled out

      if(field){
        fieldContents = m.unhideCommentAndStringInnards(fieldContents);

        //is a single field directive
        field = field.trim();
        switch(field) {
          case "prefix":
            hsm.prefix = fieldContents;
          break;

          case "output_filename":
            hsm.output_filename = fieldContents;
          break;

          default:
            console.log("Error details:");
            console.log(re, match);
            throw "Unknown gen directive field";
        }
      } else {
        //is a directive section
        sectionContents = m.unhideCommentAndStringInnards(sectionContents);

        //TODOLOW remove the pre comments detection... probably no use.
        let comments = previousIgnored.trim();
        if(comments){
          comments = m.unhideCommentAndStringInnards(comments) + "\n";
        }
        let sectionContentsAndPreComments = comments + sectionContents;

        try{
          this.addTextToHsmField(hsm, sectionName, sectionContents);
        } catch(e){
          let msg = `Invalid section name: '${sectionName}'`
          console.log("\n\n" + msg);
          console.log("<failure_details>");
          console.log(re, match);
          console.log("Original exception", e);
          console.log("</failure_details>\n\n");
          throw msg;
        }

      }

      previousIgnored = ""; //clear it
    }
  }


  private parseGenDirectiveNode(hsm : InputHsm, node : CheerioElement){
    //"vars", "expansions", "execute_after_dispatch"
    let string;
    string = node.attribs[attrKeys.LABEL];
    let re = /^\s*[$](\w+)\b(?:[ \t]*:[ \t]*(\w+)[ \t]+section\b[ \t]*(?:\r\n|\n|\r|$))?/;

    let match = re.exec(string);
    let directiveName = match[1];
    let sectionName = match[2];
    let directiveContents = string.substr(match.index + match[0].length);

    if(sectionName != null){
      this.parseGenDirectiveNodeSectionShorthand(hsm, sectionName, directiveContents);
      return;
    }else{
      this.parseGenDirectiveText(hsm, directiveContents);
    }
  }

  private preprocessEventHandlerText(text : string) : string {
    let followingGuards : string = MyRegex.buildMatchedSquareBracketsRegex(5).source;
    let mainRe : string = /\bafterMs\s*\(\s*([^)]*)\s*\)/g.source;
    let reStr  : string = `${mainRe}\\s*(${followingGuards})?`;
    let re = new RegExp(reStr, "g");

    //convert afterMs(x) to become another guard expression
    text = text.replace(re, function(match : string, afterMsParameter : string, optionalFollowingGuards : string) : string {
      let result = `[ (time_in_state >= ${afterMsParameter}) `;
      if(optionalFollowingGuards != null){
        optionalFollowingGuards = optionalFollowingGuards.trim().replace(/^\[|\]$/g, "");  //remove outer most square brackets
        result += "&& (" + optionalFollowingGuards + ")]";
      } else {
        result += "]";
      }
      return result;
    });

    return text;
  }

  private parseEventHandlers(text : string) : InputEventHandler[] {
    let result : InputEventHandler[] = [];

    let m = new MacroExpander();
    text = m.hideCommentAndStringInnards(text).trim();
    text = this.preprocessEventHandlerText(text);

    let re = ParseRegexes.getEventHandlerRegex("y"); //get it with a sticky flag
    let match;
    while(match = re.exec(text)){
      //captured groups: event ordering, simple event trigger, multi eventTrigger, guard outer, action simple, action multiline, invalid
      let i = 1;
      let eventOrder = match[i++];
      let eventTrigger = match[i++];
      let multiEventTrigger = match[i++];
      let guardOuter = match[i++];
      let actionSimple = match[i++];
      let actionMulti = match[i++];
      let invalid = match[i++];

      if(match[0] == ""){
        break;
      }

      if(invalid){
        console.log("Error details:");
        console.log(re, match);
        throw "Invalid event handler syntax";
      }

      function process(str : string) : string {
        str = str || "";
        let result = m.unhideCommentAndStringInnards( str.trim() ).trim();
        return result;
      }

      let ieh = new InputEventHandler();
      let triggers = process(eventTrigger || multiEventTrigger).trim();
      if(triggers.length == 0){
        ieh.triggers = [];
      } else {
        ieh.triggers = triggers.split(/\s*[|][|]\s*/);
      }

      ieh.guard    = process(guardOuter).replace(/^\s*\[|\]\s*$/g, "").trim() || null;
      ieh.action   = process(actionSimple || actionMulti) || null;

      ieh.order = parseInt(eventOrder) || DEFAULT_TRANSITION_ORDER_NUMBER;


      result.push(ieh);
    }
    return result;
  }

  escapeCss(string : String){
    let result = string.replace(/(?=[.:])/g, "\\");
    return result;
  }

  private generateRootState(hsm : InputHsm, stateNode : CheerioElement) : InputState {
    let $ = this.$;
    let state = new InputState();
    let stateLabelEventHandlerText;

    state.id = this.getNodeId(stateNode);
    state.label = ROOT_STATE_LABEL;

    //make sure it is a valid statemachine name
    let label = this.getNodeLabel(stateNode);
    state.parentId = null;  //
    let match = label.match(/^\s*[$]STATEMACHINE\s*:\s*.*$/);
    if(!match){ throw `Root node didn't have matching label. Label: '${label}'` }

    stateLabelEventHandlerText = label.substr(match[0].length);

    //add internal event handlers (stuff like entry/exit stuff in label definition)
    let newHandlers = this.parseEventHandlers(stateLabelEventHandlerText);
    state.eventHandlers = newHandlers.concat(state.eventHandlers);  //make state label handlers come first

    //fail if root state has any edges
    if($(`edge[source=${this.escapeCss(state.id)}]`).length > 0){
      throw "You cannot have any edges from Root Node";
    }
    if($(`edge[target=${this.escapeCss(state.id)}]`).length > 0){
      throw "You cannot have any edges to Root Node";
    }

    return state;
  }

  private generateState(hsm : InputHsm, stateNode : CheerioElement) : InputState {
    let $ = this.$;
    let state = new InputState();
    let stateLabelEventHandlerText;

    let label = this.getNodeLabel(stateNode);

    state.id = this.getNodeId(stateNode);

    //make sure it is a valid statemachine name
    let match = label.match(/^\s*(\w+)\s*(?:\r\n|\r|\n|$)/);
    if(match == null){
      throw `State node (id:'${stateNode.attribs["id"]}') had invalid label. Requires proper name. Label was: ${label}'`;
    }
    let stateName = match[1];

    let parentNode = this.findParentNode(stateNode);
    if(parentNode == null){throw "couldn't find parent node!"};
    state.parentId = this.getNodeId(parentNode);
    if(state.parentId == null){throw "couldn't find parent node ID!"};
    state.label = stateName;
    stateLabelEventHandlerText = label.substr(match[0].length);

    //add internal event handlers (stuff like entry/exit stuff in label definition)
    let newHandlers = this.parseEventHandlers(stateLabelEventHandlerText);
    state.eventHandlers = state.eventHandlers.concat(newHandlers);

    //now find all exiting edges and add their event handlers to the state
    let edges = $(`edge[source=${this.escapeCss(state.id)}]`).toArray();

    //determine if initial state
    if (stateNode.attribs[attrKeys.IS_PSEUDO_INITIAL_STATE])
    {
      state.isInitialState = true;
    }

    for(let edge of edges){
      let edgeLabel = $(edge).find("y\\:EdgeLabel").eq(0).text().trim();

      //hack for edges with no trigger or guard
      if(edgeLabel.trim() == "") {
        if (!state.isInitialState) {
          console.log("WARNING: accidental? edge with no EVENT[GUARD] found from " + stateName);
        }
        edgeLabel = "[true]"; //an always condition. Currently needed so that edge will be added.
      }

      let targetId = edge.attribs["target"].trim();
      let eventHandlers = this.parseEventHandlers(edgeLabel);
      for(let handler of eventHandlers){
        handler.nextInputStateId = targetId;
        state.eventHandlers.push(handler);
      }
    }

    //determine if ortho state
    let ortho_order = stateNode.attribs[attrKeys.ORTHOGONAL_STATE_ORDER];
    state.orthogonal_order = (ortho_order != null)? parseFloat(ortho_order) : null;

    //determine if group open or closed
    state.groupIsCollapsed = this.getNodeIsCollapsed(stateNode);
    return state;
  }

  private getNodeId(node : CheerioElement) : string {
    return node.attribs["id"];
  }

  private findParentNode(node : CheerioElement) : CheerioElement{
    let parentNode = this.$(node).parent().closest("node").get(0);
    return parentNode;
  }

  private findInputStateByXmlNode(hsm : InputHsm, element : CheerioElement){
    let state = this.findInputStateById(hsm, this.getNodeId(element));
    return state;
  }

  private findInputStateById(hsm : InputHsm, id : string){
    for(let state of hsm.states){
      if(state.id == id){
        return state;
      }
    }
    return null;
  }

  private generateAllStates(hsm : InputHsm, rootNode : CheerioElement) : void {
    let stateNodes = this.findAllStateNodes(rootNode);
    let state : InputState;

    state = this.generateRootState(hsm, rootNode);
    hsm.states.push(state);

    for(let s of stateNodes){
      if(s !== rootNode){
        state = this.generateState(hsm, s);
        hsm.states.push(state);
      }
    }
  }

  public generateInputHsm(rootNode : CheerioElement) : InputHsm {
    let hsm = new InputHsm();
    hsm.name = rootNode.attribs[attrKeys.SM_NAME];
    this.handleSpecialDirectives(hsm, rootNode);
    this.generateAllStates(hsm, rootNode);
    return hsm;
  }

  /**
   * Must be run after labels stored in attributes
   * @param {CheerioElement} node
   * @param {string} newlabel
   */
  setNodeLabel(node : CheerioElement, newlabel : string) : void {
    node.attribs[attrKeys.LABEL] = newlabel;
  }

  getNodeIsCollapsed(node : CheerioElement){
    let isCollapsed : boolean;
    let nodegraphics = this.$(node).children(`data[key=${this.escapeCss(this.nodeGraphicsKeyId)}]`);
    let realizers = nodegraphics.find("y\\:Realizers").eq(0);
    let groupNodeIndex = parseInt( realizers.attr("active") );
    let activeGroupNode = realizers.children("y\\:GroupNode").eq(groupNodeIndex);
    isCollapsed = activeGroupNode.children("y\\:State[closed=true]").length > 0;
    return isCollapsed;
  }

  getNodeLabel(node : CheerioElement) : string {
    var label : string;
    label = node.attribs[attrKeys.LABEL];

    if(label === undefined){
      let nodegraphics = this.$(node).children(`data[key=${this.escapeCss(this.nodeGraphicsKeyId)}]`);
      let realizers = nodegraphics.find("y\\:Realizers").eq(0);
      let nodeLabel : Cheerio;

      //more accurately find group node
      if(realizers.length == 0){
        //not a group node
        nodeLabel = nodegraphics.find("y\\:NodeLabel");
      }
      else{
        //label is in a group node which has individual labels for closed and open states. Find the open one.
        //find `<y:State closed="false"`, then parent, then `<y:NodeLabel`
        nodeLabel = realizers.find(" > y\\:GroupNode > y\\:State[closed=false]").parent().children("y\\:NodeLabel");       
      }
      
      label = nodeLabel.eq(0).text().trim();
    }

    if(label.match(/^\s*<html>/i)){
      label = removeHtmlTags(label).trim();
    }

    return label;
  }

  getNodeDescription(node) : string{
    var descriptionNode = this.$(node).find(`data[key=${this.nodeDescriptionKeyId}]`).eq(0).text().trim();
    return descriptionNode;
  }

  private findNodesWithMatchingLabels(parent : CheerioElement, regex : RegExp,  limitToImmediateChildren : boolean = false) : CheerioElement[]{
    let result : CheerioElement[] = [];
    let $ = this.$;

    let nodes;

    if(!parent){
      parent = this.allNodes[0];
    }

    if(limitToImmediateChildren){
      nodes = $(parent).children().toArray();
    }else{
      nodes = this.getAllDescendentNodes(parent);
    }

    for(let node of nodes){
      let label = this.getNodeLabel(node);
      label = removeHtmlTags(label);
      if(label.match(regex) !== null){
        result.push(node);
      }
    }
    return result;
  }

  private findStatemachineNodes() : CheerioElement[]{
    let result : CheerioElement[] = [];
    result = this.findNodesWithMatchingLabels(null, /^\s*[$]STATEMACHINE\s*:\s*\w/i);
    return result;
  }

  private modifyXml(xmlText : string) : string {
    xmlText = xmlText.replace(/<!\[CDATA\[([^]*?)\]\]>(?=\s*<)/ig, "$1"); //bug in cheerio strips CDATA http://stackoverflow.com/questions/15472213/nodejs-using-cheerio-parsing-xml-returns-empty-cdata
    return xmlText;
  }



}

class ParseRegexes {

  private static eventHandlerRegex : RegExp; 

  public static getEventHandlerRegex(additionalReFlags : string = "") : RegExp {
    if(ParseRegexes.eventHandlerRegex == null){
      ParseRegexes.eventHandlerRegex = ParseRegexes._buildEventHandlerRegex();
    }
    let result = new RegExp(ParseRegexes.eventHandlerRegex, ParseRegexes.eventHandlerRegex.flags + additionalReFlags);
    return result;
  }

  private static _buildEventHandlerRegex(){
    /*
     may have examples like

     new syntax for ordering event handlers
       1. EVENT [my_condition] / action

     or

       enter / output_event( PRESSED )
       exit / output_event( RELEASED )

     or
        enter / action1(); action2();

     or
        enter / action1();
        action2();

     or the below which is parsed as "X_PRESS [mm_preview_timedout]"
       X_PRESS
       [mm_preview_timedout]

     or the below which is still parsed as "X_PRESS [mm_preview_timedout]", but seems sketchy. to review.
       X_PRESS

       [mm_preview_timedout]

     or the below which is parsed as two separate conditions "X_PRESS" "[mm_preview_timedout]"
       X_PRESS / {}
       [mm_preview_timedout] / { }

     or 
       (EVENT1 || EVENT2) 


    or
       enter / action1(); myvar =
       number / x
       exit / grumble();

     or
        enter / { action1(); myvar =
        number / x }
        exit / grumble();

    Event trigger
      Required
      format: must be a simple word with no spaces like \w+

    Guard condition
      optional
      may be on another line and span lines
      format: anything inside matching square brackets

    Actions
      optional
      may be on another line and span lines if in curly braces.
      simple format: anything on rest of line
      multiline format: '{' then anything until matching '}'
    */

    //captured groups: event trigger, multi event trigger, guard outer, action simple, action multiline, invalid

    //TODO HIGH UNIT TEST THIS! This is one of the most important places.
    let orderRe = /(?:(\d+)\s*[.]\s*)/.source;   //ordering for transitions
    let eventTriggerRe =  `(\\w+|ANY[+])`;
    let multiEventTriggerRe = /(?:\(\s*(\w+(?:\s*[|][|]\s*\w+)*)\s*\))/.source; //(EVENT1 || EVENT2)
    let guardRe = `(?:(${MyRegex.buildMatchedSquareBracketsRegex(4).source}))`;
    let actionSimpleRe = `([^{\\s].+)(?:${r.nl}|$)`;  //can start with anything but { or white space.
    let actionMulitLineRe = `(${MyRegex.buildMatchedCharRecursiveRegex('{','}', 4).source})${r.mhs}(?:${r.nl}|$)`;
    let action = `(?:${actionSimpleRe}|${actionMulitLineRe})`;
    let ender = `(?:${r.nl}|$)`
    let invalid = "([^]{1,30})"

    let reStr = `\\s*^\\s*${orderRe}?(?:${eventTriggerRe}|${multiEventTriggerRe})?\\s*${guardRe}?(?:\\s*/\\s*${action})?\s*${ender}|${invalid}`;

    return new RegExp(reStr, 'mg'); //TODO rewrite with xregexp so that we can use named capturing groups.
  }
}


//TODO respect strings. hide?
function removeHtmlTags(text : string) : string {
  text = text.replace(/<\/?[^>]+?>/ig, "");  //rip out html tags
  //text = text.replace(/<\/?[a-z]\w*?>/ig, "");  //rip out html tags
  return text;
}

// console.log(ParseRegexes.getEventHandlerRegex());



// let y = new YedParser();
// let fileText = fs.readFileSync(`buttons.graphml`).toString();
// y.run(fileText);
// console.log("END....");
