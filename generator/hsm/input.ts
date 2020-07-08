import {MyRegex} from "../ts-utils/MyRegex"
//import XR from "xregexp"
import XRegExp = require('xregexp');
import {StringUtils} from "../ts-utils/StringUtils"
import {StructField} from "./Generator"

export class MacroExpander {
  expansions : MyInputExpansion[] = [];
  HIDE_CHAR_OFFSET = 0x1000;

  public addMacroExpansions(text){
    var expansions : MyInputExpansion[] = ExpansionParser.parse(text);

    //add each expansion one at a time, trying to expand it's definition
    for (let i = 0; i < expansions.length; i++) {
      let exp = expansions[i];
      exp.expandedReplaceTemplate = this.expandText(exp.replaceTemplate);
      exp.expandedReplaceTemplate = this.expandOriginalNameShorthand(exp);
      exp.buildRegex();
      this.expansions.push(exp);
    }
  }

  /**
   * Allows using the name of the expansion in the expansion replace template as $$. 
   * Makes for easier writing/reading and less error prone for copy paste.
   * Example. The below 2 examples are equivalent.
   *   EX1: is_mas_nand_outdated( ) ====> sp_Private_$$(jxc, sm)
   *   EX2: is_mas_nand_outdated( ) ====> sp_Private_is_mas_nand_outdated(jxc, sm)
   */
  private expandOriginalNameShorthand(exp : MyInputExpansion) : string {
    let result : string;
    
    result = exp.expandedReplaceTemplate.replace(/[$][$]/g, exp.name);

    if(result != exp.expandedReplaceTemplate){
      let for_breakpoint = 0; //for testing
    }

    return result;
  }

  public expandText(text : string) : string {
    let result = text;

    //convert chars inside comments and strings from matching. a real hack :)
    result = this.hideCommentAndStringInnards(text);

    for (let i = 0; i < this.expansions.length; i++) {
        var exp = this.expansions[i];

        result = result.replace(exp.searchRegex, function(match : string, preMatch : string,  name : string, p1 : string, p2 : string, p3 : string, p4 : string, p5 : string, postMatch : string ){
          let result = null;

          result = exp.expandedReplaceTemplate;
          switch(exp.functionParameters.length){
           case 0:
              result = result; //no changes needed
            break;

            case 1:
              //console.log(`param: '${exp.functionParameters[0]}', 'p1:${p1}'`);
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`,'g'), p1.trim());
            break;

            case 2:
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`,'g'), p1.trim());
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[1]}\\s*}}`,'g'), p2.trim());
            break;

            case 3:
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`,'g'), p1.trim());
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[1]}\\s*}}`,'g'), p2.trim());
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[2]}\\s*}}`,'g'), p3.trim());
            break;

            case 4:
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`,'g'), p1.trim());
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[1]}\\s*}}`,'g'), p2.trim());
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[2]}\\s*}}`,'g'), p3.trim());
              result = result.replace( new RegExp(`{{\\s*${exp.functionParameters[3]}\\s*}}`,'g'), p4.trim());
            break;

            default: throw "not implemented yet";
          }

          result = preMatch + result;
          return result;
        });
    }

    result = this.unhideCommentAndStringInnards(result);

    return result;
  }

  public ripOutComments(text : string ) : string {
    let result = "";
    let r = new MyRegex();
    let re = `${r.fslash}${r.star}(${r.any}*?)${r.star}${r.fslash}|${r.fslash}${r.fslash}(.*)|"([^"]*)"`;
    var tthis = this;

    result = text.replace(new RegExp(re, "g"), function(match : string, starCommentInner : string, lineCommentInner : string, stringInner : string){
      let result = "";
      let preResult = "";
      let postResult = "";
      if(starCommentInner){
        preResult = "/*"; postResult = "*/";
      } else if(lineCommentInner){
        preResult = "//";
      } else if (stringInner){
        preResult = postResult = '"';
      } else {
        throw "Unknown matching...";
      }

      let inner = starCommentInner || lineCommentInner || stringInner;
      let newInner = inner.replace(/./g, function(match:string){
        return String.fromCharCode(match.charCodeAt(0)+tthis.HIDE_CHAR_OFFSET);
      });
      result = preResult + newInner + postResult;
      return result;
    });
    return result;
  }

  public hideStringCharacters(text : string) : string {
    var tthis = this;
    let hidden = text.replace(/[^]/g, function(match:string){
      return String.fromCharCode(match.charCodeAt(0)+tthis.HIDE_CHAR_OFFSET);
    });
    return hidden;
  }

  public unhideStringCharacters(text : string) : string {
    var tthis = this;
    let unhidden = text.replace(/[^]/g, function(match:string){
      return String.fromCharCode(match.charCodeAt(0)-tthis.HIDE_CHAR_OFFSET);
    });
    return unhidden;
  }

  public hideCommentAndStringInnards(text : string) : string {
    let result = "";
    let r = new MyRegex();
    let re = `${r.fslash}${r.star}(${r.any}*?)${r.star}${r.fslash}|${r.fslash}${r.fslash}(.*)|"([^"]*)"`;
    var tthis = this;

    result = text.replace(new RegExp(re, "g"), function(match : string, starCommentInner : string, lineCommentInner : string, stringInner : string){
      let result = "";
      let preResult = "";
      let postResult = "";
      let inner : string;
      if(starCommentInner != undefined){
        preResult = "/*"; postResult = "*/";
        inner = starCommentInner;
      } else if(lineCommentInner != undefined){
        preResult = "//";
        inner = lineCommentInner;
      } else if (stringInner != undefined){
        preResult = postResult = '"';
        inner = stringInner;
      } else {
        console.log({text:text, re:re, match:match});
        throw "Unknown matching...";
      }

      let newInner = tthis.hideStringCharacters(inner);
      result = preResult + newInner + postResult;
      return result;
    });
    return result;
  }

  public unhideCommentAndStringInnards(text : string) : string {
    let result = "";
    let r = new MyRegex();
    let re = `[\\u${this.HIDE_CHAR_OFFSET.toString(16)}-\\u${(this.HIDE_CHAR_OFFSET+10000).toString(16)}]`;

    var tthis = this;
    result = text.replace(new RegExp(re, "g"), function(match : string){
      let result = String.fromCharCode(match.charCodeAt(0)-tthis.HIDE_CHAR_OFFSET);
      return result;
    });
    return result;
  }

}

class MyInputExpansion{
  name : string;            //if is a function, then searches for function and matching braces
  functionParameters: string[] = [];
  replaceTemplate : string; //{{}} based
  expandedReplaceTemplate : string;
  preComment : string;
  lineComment : string;
  searchRegex : RegExp; //only looks for name, nothing else.
  isFunction : boolean;

  buildRegex() : void {
    var r = new MyRegex();
    
    //say you have expansions `state ====> MY_STATE` and `add(state) ====> x += {{state}}`. Need to prevent second expansion from becoming `add(state) ====> x += {{MY_STATE}}`.
    let preventMatchingReplacementVar = "(?!\s*}})"; 

    var preMatch  = "(?:^|\\s|[-+;<>,%?:\\(/&|!~*={}\\[$]|::)";
    var postMatch = `${preventMatchingReplacementVar}(?:$|\\s|[-+;<>,%?:\\(\\)/&|!~*={}\\]$.]|::)`;
    var capturedName = `(${this.name})`;
    var re = `(${preMatch})${capturedName}(?=${postMatch})`;
    //
    if(this.isFunction)
    {
      var r = new MyRegex();
      var capturedInner = MyRegex.buildMatchedBracesCaptureParamsRegex(2,4);
      re = `(${preMatch})${capturedName}${capturedInner.source}(?=${postMatch})`;
    }
    //console.log(re);
    //console.log(this);
    this.searchRegex = new RegExp(re, "mg");
  }
}

class ExpansionParser{
  static parse(text : string) : MyInputExpansion[]{
    let result = [];
    let r = new MyRegex();

    text = text.trim();
    text = StringUtils.normalizeLineEndingsTo(text, "\n");

    //remove comments not part of an expansion line
    text = StringUtils.removeUnattachedComments(text);


    let re = MyRegex.buildExpansionRegex();
    var array;
    var lastIndex = 0;
    while((array = re.exec(text)) !== null){
      let match = new MyInputExpansion();
      match.preComment = array[1];
      match.name = array[2];
      var functionParameters = array[3];
      match.replaceTemplate = array[4];
      match.lineComment = array[5];
      result.push(match);
      lastIndex = re.lastIndex;

      if(functionParameters == null){
        match.isFunction = false;
      }else{
        match.isFunction = true;
        functionParameters = functionParameters.trim();
        if(functionParameters){
          match.functionParameters = functionParameters.trim().split(/\s*,\s*/);
        }else{
          match.functionParameters = []; //no actual parameters but still a function
        }
      }

      // console.log(`lastIndex: ${re.lastIndex}`);
    }

    //TODOLOW error if expansion doesn't use a passed in parameter

    if(lastIndex !== text.length){
      // console.log(`lastIndex: ${lastIndex}`);
      // console.log(result);
      // console.log("Failed parsing at index: " + lastIndex + ": '" + text.substr(lastIndex, 30) + "'...");
      throw `Failed parsing at index: ${lastIndex}. Unrecognized 'input' starts with: '${text.substr(lastIndex, 50).replace(/\n/g, "\\n")}'...`;
    }

    return result;
  }
} //////////////////////////////////////////////////////////////////////////////



export class StructFieldParser{
  static parse(text : string) : StructField[]{
    let result = [];
    let r = new MyRegex();

    text = text.trim();
    text = StringUtils.normalizeLineEndingsTo(text, "\n");

    //remove comments not part of an expansion line
    text = StringUtils.removeUnattachedComments(text);

    //captured groups: preComment, type, name, bitfieldSize, arraySize, lineComment
    let re = MyRegex.buildStructFieldRegex();
    var array;
    var lastIndex = 0;
    while((array = re.exec(text)) !== null){
      let i = 1;
      let match = new StructField();
      match.preComment = array[i++] || "";
      match.type = array[i++] || "";
      match.name = array[i++] || "";
      match.bitFieldSize = array[i++] || "";
      match.arraySize = array[i++] || "";
      match.lineComment = array[i++] || "";
      match.fullTextMatch = array[0];
      result.push(match);
      lastIndex = re.lastIndex;
    }

    if(lastIndex !== text.length){
      // console.log(`lastIndex: ${lastIndex}`);
      // console.log(result);
      // console.log("Failed parsing at index: " + lastIndex + ": '" + text.substr(lastIndex, 30) + "'...");
      throw `Failed parsing at index: ${lastIndex}. Unrecognized 'input' starts with: '${text.substr(lastIndex, 50).replace(/\n/g, "\\n")}'...`;
    }

    return result;
  }
} //////////////////////////////////////////////////////////////////////////////
