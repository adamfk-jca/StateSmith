import {MyRegex} from "./MyRegex"
import { delimiter } from "path";
import XRegExp = require('xregexp');

const r = new MyRegex();


export class StringUtils {

  //TODOLOW consider detecting indent from first match instead of ALL lines.
  //can always use <R> or <S> set detected indent if first line should 
  //be indented from the rest.
  public static deIndent(str : string, tabWidth : number = 2) : string {
    let result : string;
    var minIndent = Infinity;
    str = str.replace(/\t/g, " ".repeat(tabWidth));

    //find spaces and tabs before first non space character
    str.replace(/^([ ]*)(?=\S)/mg, function(match : string, indent : string){
      minIndent = Math.min(minIndent, indent.length);
      return indent; //TODOLOW convert to exec loop instead
    });

    if(minIndent == 0 || minIndent == Infinity){
      return str;
    }

    let toRemove = " ".repeat(minIndent);
    result = str.replace(new RegExp("^" + toRemove, "mg"), "");
    return result;
  }

  public static indent(str : string, indentString : string) : string {
    let result : string;
    //TODO escape special characters in replacement string
    result = indentString + str.replace(/(?:\r\n|\r|\n)/g, `$&${indentString}`);  //can't match on /^/mg because it will match after \r in \r\n causing output to be \r<indent>\n<indent>
    return result;
  }

  public static properIndent(str : string, indentString : string) {
    str = StringUtils.removeBlankLinesAtTop(str);
    str = StringUtils.deIndent(str);
    str = StringUtils.indent(str, indentString);

    //remove last line
    str = str.replace( new RegExp(`${r.nl}${r.mhs}$`, "g"), "");
    return str;
  }

  public static removeBlankLinesAtTop(str : string) : string {
    str = str.replace(/\s*^/ym, "");
    return str;
  }

  public static compressBlankLines(str : string) : string {
    //bl = ^[ \t]*$(?:\r\n|\r|\n)?
    str = str.replace(/(?:^[ \t]*$(\r\n|\r|\n)?){2,}/gm, "$1");
    return str;
  }

  public static rTrim(str : string) : string {
    str = str.replace(/\s+$/, "");
    return str;
  }

  public static normalizeLineEndingsTo(text : string, lineEnding : string) : string {
    text = text.replace(/\r\n|\r|\n/g, lineEnding);
    return text;
  }

  public static removeAllComments(text : string) : string {
    text = text.replace(MyRegex.buildCommentRegex(), "");
    return text;
  }

  public static removeUnattachedComments(text : string) : string {
    //remove comments not part of an expansion line
    //rip out any comments that start a line and do not have a non comment line after them

    var lineComments = MyRegex.buildPreCommentRegex().source;
    let re = `^\\s*${lineComments}\\s*${r.blankLine}`;
    text = text.replace(new RegExp(re, "mg"), "");

    //now remove trailing comments at end of string
    re = `(\n)*${lineComments}\\s*$`;
    text = text.replace(new RegExp(re, "g"), "$1"); //put back in \n
    text = text.trim();
    return text;
  }

  public static removeBlankLinesAtBottom(str : string) : string {
    str = str.replace(/(\r\n|\r|\n)\s*$/, "$1");
    return str;
  }

  public static removeBlankLines(str : string) : string {
    str = StringUtils.removeBlankLinesAtBottom(str);
    str = StringUtils.removeBlankLinesAtTop(str);
    return str;
  }

  public static alignStringMarkersSimple(stringMarkers : string[], str : string) : string {
    let simpleRegexes : RegExp[] = [];
    for(let marker of stringMarkers) {
      simpleRegexes.push( new RegExp( MyRegex.escapeMetaChars(marker) ) );
    }
    str = this.alignRegexesInStringsSimple(simpleRegexes, str);
    return str;
  }

  public static alignRegexInStringsSimple(simpleRegexes : RegExp, str : string) : string {
    str = this.alignRegexesInStringsSimple([simpleRegexes], str);
    return str;
  }

  public static alignRegexesInStringsSimple(simpleRegexes : RegExp[], str : string) : string {
    let pointRegexes : RegExp[] = [];
    for(let re of simpleRegexes){
      let newRe = new RegExp(`(^.*?)(${re.source})(.*$)`, "m");// /(^.*?)( break;)(.*$)/m
      pointRegexes.push(newRe);
    }
    str = this.alignPointsInStrings(pointRegexes, str);
    return str;
  }

  /**
   * 
   * @param pointRegexes Regexes must have only 3 capturing groups: 1) before align point, 2) point to align, 3) after point to align
   * @param str 
   */
  public static alignPointsInStrings(pointRegexes : RegExp[], str : string) : string {
    for(let re of pointRegexes){
      str = this.alignPointInStrings(re, str);
    }
    return str;
  }

  /**
   * 
   * @param pointRegex Regex must have only 3 capturing groups: 1) before align point, 2) point to align, 3) after point to align
   * @param str 
   */
  public static alignPointInStrings(pointRegex : RegExp, str : string) : string {
    let re = new RegExp(pointRegex, pointRegex.flags.replace("g", "") + "g"); //ensure we have the g flag set

    var maxIndex = 0;

    //capture groups: beforeAlign, pointToAlign, afterAlign
    let match : RegExpExecArray;
    while(match = re.exec(str)){
      let beforeAlign = match[1];
      let pointToAlign = match[2];
      let afterAlign = match[3];
      maxIndex = Math.max(maxIndex, beforeAlign.length);
    }

    str = str.replace(re, function(match, beforeAlign, pointToAlign, afterAlign){
      let alignedLine : string;
      let linePointIndex = beforeAlign.length;
      let padLength = maxIndex - linePointIndex;
      alignedLine = beforeAlign + " ".repeat(padLength) + pointToAlign + afterAlign;
      return alignedLine;
    });

    return str;
  }

  public static alignCompressedSwitch(switchInner : string) : string {
    let regexes = [
      /(^.*)(:)(.*$)/m,
      /(^.*)( break;)(.*$)/m,
    ];
    let output = StringUtils.alignPointsInStrings(regexes, switchInner);
    return output;
  }

  
  static removeRLineMarkers(str:string) : string {
    str = str.replace(/(?:\r\n|\r|\n).*<R>.*/g, ""); //instructs to remove line
    return str;
  }

  //all characters on a line with <C> are cleared to " "
  static clearCLineMarkers(str:string) : string {
    str = str.replace(/^.*<C>.*$/gm, (g0) => " ".repeat(g0.length));
    return str;
  }  


  //TODOLOW: replace with better parser.
  static changeParagraphDivToSpan(str:string) : string {
    let inParagraph = false;
    str = str.replace(/<(\/)?(div|p)(\s|>)/ig, function(g0, tagEndFs = "", divOrP, delimiter){
      let result = "";
      let outType = divOrP;
      if (divOrP.toLowerCase() == "p") {
        inParagraph = (tagEndFs != "/");
      } else {
        //it's a div
        if (inParagraph){
          outType = "span";
        }
      }
      result = `<${tagEndFs}${outType}${delimiter}`;
      return result;
    });
    return str;
  }  


  static processMarkers(str:string) : string {
    function getIntOrDefault(string : string, defaultValue : number) : number {
      if(string == null){
        return defaultValue;
      }
      return parseInt(string);
    }

    str = str.trim().replace(/[ \t]*<s>/g, "");
    str = str.replace(/(?:\r\n|\r|\n).*<[rR]>.*/g, ""); //instructs to remove line
    str = str.replace(/([ \t]*(?:\r\n|\r|\n))*[ \t]*<removeBlankLines\/?>([ \t]*(?:\r\n|\r|\n))*/g, "");
    str = str.replace(/(?:[ \t]*(?:\r\n|\r|\n))*[ \t]*<setBlankLines[*](\d+)\/?>(?:[ \t]*(?:\r\n|\r|\n))*/g, function(substring, repeat){
      return "\r\n".repeat( getIntOrDefault(repeat, 1) );
    });        
    str = str.replace(/<n(?:ewline)?(?:[*](\d+))?\/?>/g, function(substring, repeat){
      return "\r\n".repeat( getIntOrDefault(repeat, 1) );
    });
    str = str.replace(/<space(?:[*](\d+))?\/?>/g, function(substring, repeat){
      return " ".repeat( getIntOrDefault(repeat, 1) );
    });
    str = str.replace(/<dummy\/?>/g, "");  
    return str;
  }  

  static makeCssClassName(desiredName : string) {
    let result = desiredName.replace(/[^-\w]/g, function(group0){
      return `-0x${group0.charCodeAt(0).toString(16).toUpperCase()}-`;
    });
    return result;
  }

  /**
   * Still allows html.
   * 
   * @static
   * @param {string} str 
   * @memberof StringUtils
   */
  static escapeUnattachedAmpLtGt(str : string) {
    str = str.replace(/&(?!(?:\w+|#\d+);)/g, "&amp;");
    let re = `
      (
        <
          /?
          ${r.word}+
          (?:
            ${r.space}+
            [a-z]+(?:[:${r.word}]*)
            (?:
              ${r.space}* = ${r.space}*
              (?:
                ${r.word}+
                |
                "[^"]*"
              )
            )*
          )*
          /?
        >
      )
      |
      (<)
      |
      (>)
    `;
    
    let result = XRegExp.replace(str, XRegExp(re, "igx"), 
      function(g0, validHtmlTag, lt, gt){
        let result = "";
        if (validHtmlTag) {
          result = validHtmlTag;
        } else if (lt){
          result = "&lt;";
        } else if (gt){
          result = "&gt;";
        } else {throw "???"};
        return result;
      }
    );

    //str = str.replace(/<(?![a-z])/ig, "&lt;");
    return result;
  }

  static useAmpLtGtEntities(str : string) : string {
    str = this.useAmpEntity(str);
    str = this.useLtGtEntities(str);
    return str;
  }

  private static useLtGtEntities(str : string) : string {
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    return str;
  }

  static useAmpEntity(str : string) : string {
    str = str.replace(/&/g, "&amp;");
    return str;
  }


  static makeSafeForHtmlTitle(str:string){
    str = this.simpleRemoveHtmlTags(str);
    str = this.escapeForHtmlAttributeValue(str);
    return str;
  }

  /**
   * escapes double quotes and ampersand
   * https://stackoverflow.com/questions/5320177/what-values-can-i-put-in-an-html-attribute-value
   */
  static escapeForHtmlAttributeValue(str : string) : string {
    str = str.replace(/"/g, "&quot;");
    str = this.useAmpEntity(str);
    return str;
  }  

  static simpleRemoveHtmlTags(str : string) : string {
    //consider which characters are allowed in an attributes string
    //https://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
    let result = str.replace(/<\/?.*?>/g, "");
    return result;
  }  

  static getAllIndexes(str : string, char : string) : number[]{
    if(char.length !== 1){
      throw "searched for char must be single character";
    }

    let result : number[] = [];
    for(let i=0; i < str.length; i++) {
      if (str[i] === char) {
        result.push(i);
      }
    }

    return result;
  }

  static escapeForCString(str : string) : string {
    let result = str;
    result = result.replace('"','\\"'); // '\\"' is to escape double quotes for generated c
    result = result.replace(/([\x00-\x1F]|[\x80-\xFF])/g, function(fullMatch, capture:string){
      let hexDigits = capture.charCodeAt(0).toString(16);
      if(hexDigits.length < 2){
        hexDigits = '0' + hexDigits;
      }
      return `" "\\x${hexDigits}" "`; //relies on 'eager catenation' to avoid hex escape accidentally grabbing more than it should
    });
    return result;
  }

}

function demo(){
  let output : string;
  let input = "";
  input = `

      @file

      @brief     State machine
                Auto generated from file:

     @copyright Copyright (c) 2017 JCA Electronics, Winnipeg, MB. All rights
                reserved.
  `;
  console.log("'" + StringUtils.removeBlankLinesAtTop(input) + "'");
  console.log("'" + StringUtils.deIndent(input) + "'");

  input = `
  [HSM_ID_TO_INDEX(BBH__ROOT_STATE__ID)] =   { .defs = &root_state_tree_def},
  [HSM_ID_TO_INDEX(BBH__NOT_PRESSED__ID)] =   { .defs = &not_pressed_tree_def},
  [HSM_ID_TO_INDEX(BBH__PRESSED__ID)] =   { .defs = &pressed_tree_def},
  [HSM_ID_TO_INDEX(BBH__INITIAL_PRESS__ID)] =   { .defs = &initial_press_tree_def},
  [HSM_ID_TO_INDEX(BBH__HELD__ID)] =   { .defs = &held_tree_def},
  [HSM_ID_TO_INDEX(BBH__HELD_LONG__ID)] =   { .defs = &held_long_tree_def},
  [HSM_ID_TO_INDEX(BBH__HELD__PSEUDO_INIT__ID)] =   { .defs = &held__pseudo_init_tree_def},
  `;

  output = StringUtils.alignPointInStrings(/(^.*\]\s*)(=)(\s*{.*$)/m, input);
  console.log("\n<aligned>\n", output, "\n</aligned>\n");

  ///////////////////////////////////////////////////////////////////////////////////////////
  {
    input = `
    case HSM_EVENT_NULL: str = "NULL"; break;
    case HSM_EVENT_STATE_ENTRY: str = "STATE_ENTRY"; break;
    case HSM_EVENT_STATE_LANDED_IN: str = "STATE_LANDED_IN"; break;
    case HSM_EVENT_STATE_EXIT: str = "STATE_EXIT"; break;
    case HSM_EVENT_TRY_PRE_ENTER_TRANSITIONS: str = "TRY_PRE_ENTER_TRANSITIONS"; break;
    case HSM_EVENT_STATE_DO_WORK: str = "STATE_DO_WORK"; break;
    case HSM_EVENT_ANY: str = "ANY"; break;
    `;
    let regexes = [
      /(^.*)(:)(.*$)/m,
      /(^.*)( break;)(.*$)/m,
    ];
    output = StringUtils.alignPointsInStrings(regexes, input);
    console.log("\n<alignedPoints>\n", output, "\n</alignedPoints>\n");
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  {
    input = `
    if (mem->destination_offset < 0) { return MY_MEMCPY_RESULT__ERROR_DST_OFFSET_INVALID; }
    if (mem->destination == NULL) { return MY_MEMCPY_RESULT__ERROR_DST_NULL;           }
    if (mem->source == NULL) { return MY_MEMCPY_RESULT__ERROR_SRC_NULL;           }
    if (max_allowed_store < 0) { return MY_MEMCPY_RESULT__ERROR_MAX_STORE_LENGTH_NEGATIVE; }
    if (max_allowed_read < 0) { return MY_MEMCPY_RESULT__ERROR_MAX_READ_LENGTH_NEGATIVE; }

    `;
    output = StringUtils.alignRegexesInStringsSimple([/[{]/, /[}]/], input);
    console.log("\n<alignRegexInStringsSimple>", output, "</alignRegexInStringsSimple>\n");
  }


  {
    input = `

    blankLine


    blank

    already spaced

    `;
    output = StringUtils.compressBlankLines(input);

  }
  console.log("\n<compressBlankLines>", output, "</compressBlankLines>\n");

}

//demo();
