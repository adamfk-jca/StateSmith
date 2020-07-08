"use strict";
//debug in Chrome!
//node --inspect --debug-brk YedParser.js
//https://blog.hospodarets.com/nodejs-debugging-in-chrome-devtools#debug-in-devtools
//https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27#.xd1lmpcdr
//Console will not work unless you change URL to use 127.0.0.1 instead of 'localhost'
// see https://github.com/nodejs/node/issues/9382
Object.defineProperty(exports, "__esModule", { value: true });
//npm install cheerio
//typings install dt~cheerio --save --global
const cheerio = require("cheerio");
const Generator_1 = require("./Generator");
const Generator_2 = require("./Generator");
const Generator_3 = require("./Generator");
const input_1 = require("./input");
const MyRegex_1 = require("../ts-utils/MyRegex");
const path = require("path");
const r = new MyRegex_1.MyRegex();
const attrKeys = {
    SM: "_tagged_as_sm",
    SM_NAME: "_sm_name",
    LABEL: "_label",
    IS_PSEUDO_INITIAL_STATE: "_tagged_as_pseduo_initial",
    ORTHOGONAL_STATE_ORDER: "_orthogonal_state_order",
}; //attribute keys
//something like this: typings install dt~node
const fs = require("fs"); //node filesystem
const Compiler_1 = require("./Compiler");
// export class StateElement  {
//
//   doSomething(){
//     let c : CheerioElement;
//     c.
//   }
//
// }
class YedParser {
    run(diagramSourceFilePath) {
        this.diagramSourceFilePath = path.resolve(diagramSourceFilePath);
        let fileText = fs.readFileSync(diagramSourceFilePath).toString();
        let parsedStateMachines = [];
        let yedParser = this;
        fileText = this.modifyXml(fileText);
        this.$ = cheerio.load(fileText, { xmlMode: true });
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
        for (let s of this.allNodes) {
            s.attribs[attrKeys.LABEL] = this.getNodeLabel(s);
            //console.log( `NODE LABEL starts with : '${s.attribs[attrKeys.LABEL]}'`);
        }
        //find all statemachine roots
        this.statemachineRoots = $("graph node").filter(function (index, element) {
            let label = yedParser.getNodeLabel(element);
            //console.log("LABEL: " + label);
            let re = /^\s*[$]STATEMACHINE\s*:\s*(\w+)\s*(?:$|\r|\n)/i;
            let match = re.exec(label);
            if (match) {
                //console.log("MATCH!: " + match);
                let statemachineName = match[1];
                element.attribs[attrKeys.SM_NAME] = statemachineName;
            }
            return match !== null;
        }).toArray(); //http://api.jquery.com/filter/
        for (let s of this.statemachineRoots) {
            s.attribs[`${attrKeys.SM}`] = "yes"; //tag as a statemachine root
            //console.log("STATEMACHINE NAME: " + s.attribs[attrKeys.SM_NAME]);
        }
        this.preValidate();
        //console.log(this.statemachineRoots);
        //build HSM
        for (let s of this.statemachineRoots) {
            let result = this.generateInputHsm(s);
            //console.log("\n\n\n\n HSM:", this.getNodeLabel(s), "\n", result);
            parsedStateMachines.push(result);
        }
        this.postValidate(parsedStateMachines);
        console.log("End of parsing");
        return parsedStateMachines;
    }
    postValidateState(state) {
        let $ = this.$;
        for (let eh of state.eventHandlers) {
            //don't allow event handlers that do nothing
            if (eh.nextInputStateId == null && eh.action == null) {
                console.log("Error details:");
                console.log(state, eh);
                throw "Event handler for state has no action";
            }
        }
    }
    postValidateInputHsm(sm) {
        let $ = this.$;
        for (let state of sm.states) {
            this.postValidateState(state);
        }
    }
    postValidate(parsedStateMachines) {
        for (let sm of parsedStateMachines) {
            this.postValidateInputHsm(sm);
        }
    }
    preValidate() {
        let $ = this.$;
        //fail on nested statemachines
        for (let s of this.statemachineRoots) {
            let outerParent = $(s).parent().closest(`[${attrKeys.SM}]`).get(0);
            if (outerParent) {
                console.log("Nested statemachine detected! Not yet supported.");
                console.log("Inner Statemachine label: ", this.getNodeLabel(s));
                console.log("Outer Statemachine label: ", this.getNodeLabel(outerParent));
                throw "Nested statemachine detected! Not yet supported.";
            }
        }
        //TODO do not allow edges to or from GEN directive nodes
    }
    getAllDescendentNodes(parentNode) {
        let $ = this.$;
        let nodes = $(parentNode).find("node").toArray();
        return nodes;
    }
    findAllStateNodes(parentNode) {
        let $ = this.$;
        let all = this.getAllDescendentNodes(parentNode);
        let special = this.findSpecialNodes(parentNode);
        let result = $(all).not($(special)).toArray();
        return result;
    }
    findSpecialNodes(parentNode) {
        let $ = this.$;
        let nodes = $(parentNode).find(`[${attrKeys.LABEL}^="$"]`).toArray();
        //console.log("SPECIIAL NODES: ", nodes);
        return nodes;
    }
    handleSpecialDirectives(hsm, rootNode) {
        //find all directive strings
        let directiveString = "";
        let directiveNodes = this.findSpecialNodes(rootNode);
        for (let d of directiveNodes) {
            let label = this.getNodeLabel(d);
            //console.log("SPECIAL NODE LABEL: ", label);
            let directiveName = label.match(/^\s*[$](\w+)\b/)[1];
            switch (directiveName.toUpperCase()) {
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
                        if (!match) {
                            console.log(label);
                            throw new Error(`Invalid syntax for GEN_INCLUDE. Must be: $GEN_INCLUDE:"<relative_file_path>"`);
                        }
                        let sourceDirectory = path.dirname(this.diagramSourceFilePath);
                        let filename = match[1];
                        let filePath = sourceDirectory + path.sep + filename;
                        try {
                            let text = fs.readFileSync(filePath).toString();
                            this.parseGenDirectiveText(hsm, text);
                        }
                        catch (error) {
                            console.log("Tried reading path: " + filePath);
                            throw new Error(`Failed reading file '${filename}' for for GEN_INCLUDE `);
                        }
                    }
                    break;
                case "INITIAL_STATE":
                    d.attribs[attrKeys.IS_PSEUDO_INITIAL_STATE] = "yes";
                    d.attribs[attrKeys.LABEL] = "PSEUDO_INIT";
                    break;
                case "ORTHO":
                    {
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
    parseGenDirectiveNodeSectionShorthand(hsm, sectionName, sectionContents) {
        //sectionContents = sectionContents.replace(/^[ \t]*(?:\r\n|\n|\r)/g, "");//rip out empty leading lines
        sectionContents += "\n";
        try {
            this.addTextToHsmField(hsm, sectionName, sectionContents);
        }
        catch (e) {
            let msg = `Invalid section name: '${sectionName}'`;
            console.log("\n\n" + msg);
            console.log("<failure_details>");
            console.log(sectionName, sectionContents);
            console.log("Original exception", e);
            console.log("</failure_details>\n\n");
            throw msg;
        }
    }
    addTextToHsmField(hsm, fieldName, contents) {
        switch (fieldName) {
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
    parseGenDirectiveText(hsm, directiveContents) {
        directiveContents = directiveContents.trim();
        let re;
        let match;
        //hide comment and string innards
        let m = new input_1.MacroExpander();
        let s = m.hideCommentAndStringInnards(directiveContents);
        {
            let field = `^${r.mhs}(\\w+)${r.mhs}=${r.mhs}"(.*)"${r.mhs}$`;
            let ignored = `((?:\\s+|${MyRegex_1.MyRegex.buildCommentRegex().source})+)`;
            let section = /\s*^(\w+)\s*(?:\r\n|\n|\r)[ \t]*====+[ \t]*$([^]*?)^[ \t]*\/====+[ \t]*$/.source;
            let invalid = /([^]{1,30})/.source;
            let reStr = `${ignored}|${section}|${field}|${invalid}`;
            re = new RegExp(reStr, "mgy");
        }
        let previousIgnored = "";
        while (match = re.exec(s)) {
            let ignored = match[1];
            let sectionName = match[2];
            let sectionContents = match[3];
            let field = match[4];
            let fieldContents = match[5];
            let unknownStuff = match[6];
            if (ignored != undefined) {
                previousIgnored += ignored;
                continue; //skip ignored stuff
            }
            if (unknownStuff != undefined) {
                console.log("Error details:");
                console.log(re, match);
                throw "Invalid gen directive section. Format should be <section_name>\\n======\\nstuff\\n/======\\n";
            }
            //TODOLOW ensure field and section not filled out
            if (field) {
                fieldContents = m.unhideCommentAndStringInnards(fieldContents);
                //is a single field directive
                field = field.trim();
                switch (field) {
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
            }
            else {
                //is a directive section
                sectionContents = m.unhideCommentAndStringInnards(sectionContents);
                //TODOLOW remove the pre comments detection... probably no use.
                let comments = previousIgnored.trim();
                if (comments) {
                    comments = m.unhideCommentAndStringInnards(comments) + "\n";
                }
                let sectionContentsAndPreComments = comments + sectionContents;
                try {
                    this.addTextToHsmField(hsm, sectionName, sectionContents);
                }
                catch (e) {
                    let msg = `Invalid section name: '${sectionName}'`;
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
    parseGenDirectiveNode(hsm, node) {
        //"vars", "expansions", "execute_after_dispatch"
        let string;
        string = node.attribs[attrKeys.LABEL];
        let re = /^\s*[$](\w+)\b(?:[ \t]*:[ \t]*(\w+)[ \t]+section\b[ \t]*(?:\r\n|\n|\r|$))?/;
        let match = re.exec(string);
        let directiveName = match[1];
        let sectionName = match[2];
        let directiveContents = string.substr(match.index + match[0].length);
        if (sectionName != null) {
            this.parseGenDirectiveNodeSectionShorthand(hsm, sectionName, directiveContents);
            return;
        }
        else {
            this.parseGenDirectiveText(hsm, directiveContents);
        }
    }
    preprocessEventHandlerText(text) {
        let followingGuards = MyRegex_1.MyRegex.buildMatchedSquareBracketsRegex(5).source;
        let mainRe = /\bafterMs\s*\(\s*([^)]*)\s*\)/g.source;
        let reStr = `${mainRe}\\s*(${followingGuards})?`;
        let re = new RegExp(reStr, "g");
        //convert afterMs(x) to become another guard expression
        text = text.replace(re, function (match, afterMsParameter, optionalFollowingGuards) {
            let result = `[ (time_in_state >= ${afterMsParameter}) `;
            if (optionalFollowingGuards != null) {
                optionalFollowingGuards = optionalFollowingGuards.trim().replace(/^\[|\]$/g, ""); //remove outer most square brackets
                result += "&& (" + optionalFollowingGuards + ")]";
            }
            else {
                result += "]";
            }
            return result;
        });
        return text;
    }
    parseEventHandlers(text) {
        let result = [];
        let m = new input_1.MacroExpander();
        text = m.hideCommentAndStringInnards(text).trim();
        text = this.preprocessEventHandlerText(text);
        let re = ParseRegexes.getEventHandlerRegex("y"); //get it with a sticky flag
        let match;
        while (match = re.exec(text)) {
            //captured groups: event ordering, simple event trigger, multi eventTrigger, guard outer, action simple, action multiline, invalid
            let i = 1;
            let eventOrder = match[i++];
            let eventTrigger = match[i++];
            let multiEventTrigger = match[i++];
            let guardOuter = match[i++];
            let actionSimple = match[i++];
            let actionMulti = match[i++];
            let invalid = match[i++];
            if (match[0] == "") {
                break;
            }
            if (invalid) {
                console.log("Error details:");
                console.log(re, match);
                throw "Invalid event handler syntax";
            }
            function process(str) {
                str = str || "";
                let result = m.unhideCommentAndStringInnards(str.trim()).trim();
                return result;
            }
            let ieh = new Generator_2.InputEventHandler();
            let triggers = process(eventTrigger || multiEventTrigger).trim();
            if (triggers.length == 0) {
                ieh.triggers = [];
            }
            else {
                ieh.triggers = triggers.split(/\s*[|][|]\s*/);
            }
            ieh.guard = process(guardOuter).replace(/^\s*\[|\]\s*$/g, "").trim() || null;
            ieh.action = process(actionSimple || actionMulti) || null;
            ieh.order = parseInt(eventOrder) || Generator_1.DEFAULT_TRANSITION_ORDER_NUMBER;
            result.push(ieh);
        }
        return result;
    }
    escapeCss(string) {
        let result = string.replace(/(?=[.:])/g, "\\");
        return result;
    }
    generateRootState(hsm, stateNode) {
        let $ = this.$;
        let state = new Generator_3.InputState();
        let stateLabelEventHandlerText;
        state.id = this.getNodeId(stateNode);
        state.label = Compiler_1.ROOT_STATE_LABEL;
        //make sure it is a valid statemachine name
        let label = this.getNodeLabel(stateNode);
        state.parentId = null; //
        let match = label.match(/^\s*[$]STATEMACHINE\s*:\s*.*$/);
        if (!match) {
            throw `Root node didn't have matching label. Label: '${label}'`;
        }
        stateLabelEventHandlerText = label.substr(match[0].length);
        //add internal event handlers (stuff like entry/exit stuff in label definition)
        let newHandlers = this.parseEventHandlers(stateLabelEventHandlerText);
        state.eventHandlers = newHandlers.concat(state.eventHandlers); //make state label handlers come first
        //fail if root state has any edges
        if ($(`edge[source=${this.escapeCss(state.id)}]`).length > 0) {
            throw "You cannot have any edges from Root Node";
        }
        if ($(`edge[target=${this.escapeCss(state.id)}]`).length > 0) {
            throw "You cannot have any edges to Root Node";
        }
        return state;
    }
    generateState(hsm, stateNode) {
        let $ = this.$;
        let state = new Generator_3.InputState();
        let stateLabelEventHandlerText;
        let label = this.getNodeLabel(stateNode);
        state.id = this.getNodeId(stateNode);
        //make sure it is a valid statemachine name
        let match = label.match(/^\s*(\w+)\s*(?:\r\n|\r|\n|$)/);
        if (match == null) {
            throw `State node (id:'${stateNode.attribs["id"]}') had invalid label. Requires proper name. Label was: ${label}'`;
        }
        let stateName = match[1];
        let parentNode = this.findParentNode(stateNode);
        if (parentNode == null) {
            throw "couldn't find parent node!";
        }
        ;
        state.parentId = this.getNodeId(parentNode);
        if (state.parentId == null) {
            throw "couldn't find parent node ID!";
        }
        ;
        state.label = stateName;
        stateLabelEventHandlerText = label.substr(match[0].length);
        //add internal event handlers (stuff like entry/exit stuff in label definition)
        let newHandlers = this.parseEventHandlers(stateLabelEventHandlerText);
        state.eventHandlers = state.eventHandlers.concat(newHandlers);
        //now find all exiting edges and add their event handlers to the state
        let edges = $(`edge[source=${this.escapeCss(state.id)}]`).toArray();
        //determine if initial state
        if (stateNode.attribs[attrKeys.IS_PSEUDO_INITIAL_STATE]) {
            state.isInitialState = true;
        }
        for (let edge of edges) {
            let edgeLabel = $(edge).find("y\\:EdgeLabel").eq(0).text().trim();
            //hack for edges with no trigger or guard
            if (edgeLabel.trim() == "") {
                if (!state.isInitialState) {
                    console.log("WARNING: accidental? edge with no EVENT[GUARD] found from " + stateName);
                }
                edgeLabel = "[true]"; //an always condition. Currently needed so that edge will be added.
            }
            let targetId = edge.attribs["target"].trim();
            let eventHandlers = this.parseEventHandlers(edgeLabel);
            for (let handler of eventHandlers) {
                handler.nextInputStateId = targetId;
                state.eventHandlers.push(handler);
            }
        }
        //determine if ortho state
        let ortho_order = stateNode.attribs[attrKeys.ORTHOGONAL_STATE_ORDER];
        state.orthogonal_order = (ortho_order != null) ? parseFloat(ortho_order) : null;
        //determine if group open or closed
        state.groupIsCollapsed = this.getNodeIsCollapsed(stateNode);
        return state;
    }
    getNodeId(node) {
        return node.attribs["id"];
    }
    findParentNode(node) {
        let parentNode = this.$(node).parent().closest("node").get(0);
        return parentNode;
    }
    findInputStateByXmlNode(hsm, element) {
        let state = this.findInputStateById(hsm, this.getNodeId(element));
        return state;
    }
    findInputStateById(hsm, id) {
        for (let state of hsm.states) {
            if (state.id == id) {
                return state;
            }
        }
        return null;
    }
    generateAllStates(hsm, rootNode) {
        let stateNodes = this.findAllStateNodes(rootNode);
        let state;
        state = this.generateRootState(hsm, rootNode);
        hsm.states.push(state);
        for (let s of stateNodes) {
            if (s !== rootNode) {
                state = this.generateState(hsm, s);
                hsm.states.push(state);
            }
        }
    }
    generateInputHsm(rootNode) {
        let hsm = new Generator_1.InputHsm();
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
    setNodeLabel(node, newlabel) {
        node.attribs[attrKeys.LABEL] = newlabel;
    }
    getNodeIsCollapsed(node) {
        let isCollapsed;
        let nodegraphics = this.$(node).children(`data[key=${this.escapeCss(this.nodeGraphicsKeyId)}]`);
        let realizers = nodegraphics.find("y\\:Realizers").eq(0);
        let groupNodeIndex = parseInt(realizers.attr("active"));
        let activeGroupNode = realizers.children("y\\:GroupNode").eq(groupNodeIndex);
        isCollapsed = activeGroupNode.children("y\\:State[closed=true]").length > 0;
        return isCollapsed;
    }
    getNodeLabel(node) {
        var label;
        label = node.attribs[attrKeys.LABEL];
        if (label === undefined) {
            let nodegraphics = this.$(node).children(`data[key=${this.escapeCss(this.nodeGraphicsKeyId)}]`);
            let realizers = nodegraphics.find("y\\:Realizers").eq(0);
            let nodeLabel;
            //more accurately find group node
            if (realizers.length == 0) {
                //not a group node
                nodeLabel = nodegraphics.find("y\\:NodeLabel");
            }
            else {
                //label is in a group node which has individual labels for closed and open states. Find the open one.
                //find `<y:State closed="false"`, then parent, then `<y:NodeLabel`
                nodeLabel = realizers.find(" > y\\:GroupNode > y\\:State[closed=false]").parent().children("y\\:NodeLabel");
            }
            label = nodeLabel.eq(0).text().trim();
        }
        if (label.match(/^\s*<html>/i)) {
            label = removeHtmlTags(label).trim();
        }
        return label;
    }
    getNodeDescription(node) {
        var descriptionNode = this.$(node).find(`data[key=${this.nodeDescriptionKeyId}]`).eq(0).text().trim();
        return descriptionNode;
    }
    findNodesWithMatchingLabels(parent, regex, limitToImmediateChildren = false) {
        let result = [];
        let $ = this.$;
        let nodes;
        if (!parent) {
            parent = this.allNodes[0];
        }
        if (limitToImmediateChildren) {
            nodes = $(parent).children().toArray();
        }
        else {
            nodes = this.getAllDescendentNodes(parent);
        }
        for (let node of nodes) {
            let label = this.getNodeLabel(node);
            label = removeHtmlTags(label);
            if (label.match(regex) !== null) {
                result.push(node);
            }
        }
        return result;
    }
    findStatemachineNodes() {
        let result = [];
        result = this.findNodesWithMatchingLabels(null, /^\s*[$]STATEMACHINE\s*:\s*\w/i);
        return result;
    }
    modifyXml(xmlText) {
        xmlText = xmlText.replace(/<!\[CDATA\[([^]*?)\]\]>(?=\s*<)/ig, "$1"); //bug in cheerio strips CDATA http://stackoverflow.com/questions/15472213/nodejs-using-cheerio-parsing-xml-returns-empty-cdata
        return xmlText;
    }
}
exports.YedParser = YedParser;
class ParseRegexes {
    static getEventHandlerRegex(additionalReFlags = "") {
        if (ParseRegexes.eventHandlerRegex == null) {
            ParseRegexes.eventHandlerRegex = ParseRegexes._buildEventHandlerRegex();
        }
        let result = new RegExp(ParseRegexes.eventHandlerRegex, ParseRegexes.eventHandlerRegex.flags + additionalReFlags);
        return result;
    }
    static _buildEventHandlerRegex() {
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
        let orderRe = /(?:(\d+)\s*[.]\s*)/.source; //ordering for transitions
        let eventTriggerRe = `(\\w+|ANY[+])`;
        let multiEventTriggerRe = /(?:\(\s*(\w+(?:\s*[|][|]\s*\w+)*)\s*\))/.source; //(EVENT1 || EVENT2)
        let guardRe = `(?:(${MyRegex_1.MyRegex.buildMatchedSquareBracketsRegex(4).source}))`;
        let actionSimpleRe = `([^{\\s].+)(?:${r.nl}|$)`; //can start with anything but { or white space.
        let actionMulitLineRe = `(${MyRegex_1.MyRegex.buildMatchedCharRecursiveRegex('{', '}', 4).source})${r.mhs}(?:${r.nl}|$)`;
        let action = `(?:${actionSimpleRe}|${actionMulitLineRe})`;
        let ender = `(?:${r.nl}|$)`;
        let invalid = "([^]{1,30})";
        let reStr = `\\s*^\\s*${orderRe}?(?:${eventTriggerRe}|${multiEventTriggerRe})?\\s*${guardRe}?(?:\\s*/\\s*${action})?\s*${ender}|${invalid}`;
        return new RegExp(reStr, 'mg'); //TODO rewrite with xregexp so that we can use named capturing groups.
    }
}
//TODO respect strings. hide?
function removeHtmlTags(text) {
    text = text.replace(/<\/?[^>]+?>/ig, ""); //rip out html tags
    //text = text.replace(/<\/?[a-z]\w*?>/ig, "");  //rip out html tags
    return text;
}
// console.log(ParseRegexes.getEventHandlerRegex());
// let y = new YedParser();
// let fileText = fs.readFileSync(`buttons.graphml`).toString();
// y.run(fileText);
// console.log("END....");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWWVkUGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiWWVkUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxrQkFBa0I7QUFDbEIseUNBQXlDO0FBQ3pDLG9GQUFvRjtBQUNwRix5R0FBeUc7QUFDekcscUZBQXFGO0FBQ3JGLGlEQUFpRDs7QUFHakQscUJBQXFCO0FBQ3JCLDRDQUE0QztBQUM1QyxtQ0FBb0M7QUFFcEMsMkNBQXFFO0FBQ3JFLDJDQUE2QztBQUM3QywyQ0FBc0M7QUFDdEMsbUNBQXFDO0FBQ3JDLGlEQUEyQztBQUMzQyw2QkFBOEI7QUFFOUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxpQkFBTyxFQUFFLENBQUM7QUFHeEIsTUFBTSxRQUFRLEdBQUc7SUFDZixFQUFFLEVBQUMsZUFBZTtJQUNsQixPQUFPLEVBQUUsVUFBVTtJQUNuQixLQUFLLEVBQUUsUUFBUTtJQUNmLHVCQUF1QixFQUFHLDJCQUEyQjtJQUNyRCxzQkFBc0IsRUFBRyx5QkFBeUI7Q0FDbkQsQ0FBQyxDQUFFLGdCQUFnQjtBQUVwQiw4Q0FBOEM7QUFDOUMseUJBQTBCLENBQUMsaUJBQWlCO0FBQzVDLHlDQUE4QztBQUc5QywrQkFBK0I7QUFDL0IsRUFBRTtBQUNGLG1CQUFtQjtBQUNuQiw4QkFBOEI7QUFDOUIsU0FBUztBQUNULE1BQU07QUFDTixFQUFFO0FBQ0YsSUFBSTtBQUdKO0lBZVMsR0FBRyxDQUFDLHFCQUFxQjtRQUM5QixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pFLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUVoRSxJQUFJLG1CQUFtQixHQUFnQixFQUFFLENBQUM7UUFDMUMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFD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