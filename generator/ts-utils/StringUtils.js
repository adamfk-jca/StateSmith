"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MyRegex_1 = require("./MyRegex");
const XRegExp = require("xregexp");
const r = new MyRegex_1.MyRegex();
class StringUtils {
    //TODOLOW consider detecting indent from first match instead of ALL lines.
    //can always use <R> or <S> set detected indent if first line should 
    //be indented from the rest.
    static deIndent(str, tabWidth = 2) {
        let result;
        var minIndent = Infinity;
        str = str.replace(/\t/g, " ".repeat(tabWidth));
        //find spaces and tabs before first non space character
        str.replace(/^([ ]*)(?=\S)/mg, function (match, indent) {
            minIndent = Math.min(minIndent, indent.length);
            return indent; //TODOLOW convert to exec loop instead
        });
        if (minIndent == 0 || minIndent == Infinity) {
            return str;
        }
        let toRemove = " ".repeat(minIndent);
        result = str.replace(new RegExp("^" + toRemove, "mg"), "");
        return result;
    }
    static indent(str, indentString) {
        let result;
        //TODO escape special characters in replacement string
        result = indentString + str.replace(/(?:\r\n|\r|\n)/g, `$&${indentString}`); //can't match on /^/mg because it will match after \r in \r\n causing output to be \r<indent>\n<indent>
        return result;
    }
    static properIndent(str, indentString) {
        str = StringUtils.removeBlankLinesAtTop(str);
        str = StringUtils.deIndent(str);
        str = StringUtils.indent(str, indentString);
        //remove last line
        str = str.replace(new RegExp(`${r.nl}${r.mhs}$`, "g"), "");
        return str;
    }
    static removeBlankLinesAtTop(str) {
        str = str.replace(/\s*^/ym, "");
        return str;
    }
    static compressBlankLines(str) {
        //bl = ^[ \t]*$(?:\r\n|\r|\n)?
        str = str.replace(/(?:^[ \t]*$(\r\n|\r|\n)?){2,}/gm, "$1");
        return str;
    }
    static rTrim(str) {
        str = str.replace(/\s+$/, "");
        return str;
    }
    static normalizeLineEndingsTo(text, lineEnding) {
        text = text.replace(/\r\n|\r|\n/g, lineEnding);
        return text;
    }
    static removeAllComments(text) {
        text = text.replace(MyRegex_1.MyRegex.buildCommentRegex(), "");
        return text;
    }
    static removeUnattachedComments(text) {
        //remove comments not part of an expansion line
        //rip out any comments that start a line and do not have a non comment line after them
        var lineComments = MyRegex_1.MyRegex.buildPreCommentRegex().source;
        let re = `^\\s*${lineComments}\\s*${r.blankLine}`;
        text = text.replace(new RegExp(re, "mg"), "");
        //now remove trailing comments at end of string
        re = `(\n)*${lineComments}\\s*$`;
        text = text.replace(new RegExp(re, "g"), "$1"); //put back in \n
        text = text.trim();
        return text;
    }
    static removeBlankLinesAtBottom(str) {
        str = str.replace(/(\r\n|\r|\n)\s*$/, "$1");
        return str;
    }
    static removeBlankLines(str) {
        str = StringUtils.removeBlankLinesAtBottom(str);
        str = StringUtils.removeBlankLinesAtTop(str);
        return str;
    }
    static alignStringMarkersSimple(stringMarkers, str) {
        let simpleRegexes = [];
        for (let marker of stringMarkers) {
            simpleRegexes.push(new RegExp(MyRegex_1.MyRegex.escapeMetaChars(marker)));
        }
        str = this.alignRegexesInStringsSimple(simpleRegexes, str);
        return str;
    }
    static alignRegexInStringsSimple(simpleRegexes, str) {
        str = this.alignRegexesInStringsSimple([simpleRegexes], str);
        return str;
    }
    static alignRegexesInStringsSimple(simpleRegexes, str) {
        let pointRegexes = [];
        for (let re of simpleRegexes) {
            let newRe = new RegExp(`(^.*?)(${re.source})(.*$)`, "m"); // /(^.*?)( break;)(.*$)/m
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
    static alignPointsInStrings(pointRegexes, str) {
        for (let re of pointRegexes) {
            str = this.alignPointInStrings(re, str);
        }
        return str;
    }
    /**
     *
     * @param pointRegex Regex must have only 3 capturing groups: 1) before align point, 2) point to align, 3) after point to align
     * @param str
     */
    static alignPointInStrings(pointRegex, str) {
        let re = new RegExp(pointRegex, pointRegex.flags.replace("g", "") + "g"); //ensure we have the g flag set
        var maxIndex = 0;
        //capture groups: beforeAlign, pointToAlign, afterAlign
        let match;
        while (match = re.exec(str)) {
            let beforeAlign = match[1];
            let pointToAlign = match[2];
            let afterAlign = match[3];
            maxIndex = Math.max(maxIndex, beforeAlign.length);
        }
        str = str.replace(re, function (match, beforeAlign, pointToAlign, afterAlign) {
            let alignedLine;
            let linePointIndex = beforeAlign.length;
            let padLength = maxIndex - linePointIndex;
            alignedLine = beforeAlign + " ".repeat(padLength) + pointToAlign + afterAlign;
            return alignedLine;
        });
        return str;
    }
    static alignCompressedSwitch(switchInner) {
        let regexes = [
            /(^.*)(:)(.*$)/m,
            /(^.*)( break;)(.*$)/m,
        ];
        let output = StringUtils.alignPointsInStrings(regexes, switchInner);
        return output;
    }
    static removeRLineMarkers(str) {
        str = str.replace(/(?:\r\n|\r|\n).*<R>.*/g, ""); //instructs to remove line
        return str;
    }
    //all characters on a line with <C> are cleared to " "
    static clearCLineMarkers(str) {
        str = str.replace(/^.*<C>.*$/gm, (g0) => " ".repeat(g0.length));
        return str;
    }
    //TODOLOW: replace with better parser.
    static changeParagraphDivToSpan(str) {
        let inParagraph = false;
        str = str.replace(/<(\/)?(div|p)(\s|>)/ig, function (g0, tagEndFs = "", divOrP, delimiter) {
            let result = "";
            let outType = divOrP;
            if (divOrP.toLowerCase() == "p") {
                inParagraph = (tagEndFs != "/");
            }
            else {
                //it's a div
                if (inParagraph) {
                    outType = "span";
                }
            }
            result = `<${tagEndFs}${outType}${delimiter}`;
            return result;
        });
        return str;
    }
    static processMarkers(str) {
        function getIntOrDefault(string, defaultValue) {
            if (string == null) {
                return defaultValue;
            }
            return parseInt(string);
        }
        str = str.trim().replace(/[ \t]*<s>/g, "");
        str = str.replace(/(?:\r\n|\r|\n).*<[rR]>.*/g, ""); //instructs to remove line
        str = str.replace(/([ \t]*(?:\r\n|\r|\n))*[ \t]*<removeBlankLines\/?>([ \t]*(?:\r\n|\r|\n))*/g, "");
        str = str.replace(/(?:[ \t]*(?:\r\n|\r|\n))*[ \t]*<setBlankLines[*](\d+)\/?>(?:[ \t]*(?:\r\n|\r|\n))*/g, function (substring, repeat) {
            return "\r\n".repeat(getIntOrDefault(repeat, 1));
        });
        str = str.replace(/<n(?:ewline)?(?:[*](\d+))?\/?>/g, function (substring, repeat) {
            return "\r\n".repeat(getIntOrDefault(repeat, 1));
        });
        str = str.replace(/<space(?:[*](\d+))?\/?>/g, function (substring, repeat) {
            return " ".repeat(getIntOrDefault(repeat, 1));
        });
        str = str.replace(/<dummy\/?>/g, "");
        return str;
    }
    static makeCssClassName(desiredName) {
        let result = desiredName.replace(/[^-\w]/g, function (group0) {
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
    static escapeUnattachedAmpLtGt(str) {
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
        let result = XRegExp.replace(str, XRegExp(re, "igx"), function (g0, validHtmlTag, lt, gt) {
            let result = "";
            if (validHtmlTag) {
                result = validHtmlTag;
            }
            else if (lt) {
                result = "&lt;";
            }
            else if (gt) {
                result = "&gt;";
            }
            else {
                throw "???";
            }
            ;
            return result;
        });
        //str = str.replace(/<(?![a-z])/ig, "&lt;");
        return result;
    }
    static useAmpLtGtEntities(str) {
        str = this.useAmpEntity(str);
        str = this.useLtGtEntities(str);
        return str;
    }
    static useLtGtEntities(str) {
        str = str.replace(/</g, "&lt;");
        str = str.replace(/>/g, "&gt;");
        return str;
    }
    static useAmpEntity(str) {
        str = str.replace(/&/g, "&amp;");
        return str;
    }
    static makeSafeForHtmlTitle(str) {
        str = this.simpleRemoveHtmlTags(str);
        str = this.escapeForHtmlAttributeValue(str);
        return str;
    }
    /**
     * escapes double quotes and ampersand
     * https://stackoverflow.com/questions/5320177/what-values-can-i-put-in-an-html-attribute-value
     */
    static escapeForHtmlAttributeValue(str) {
        str = str.replace(/"/g, "&quot;");
        str = this.useAmpEntity(str);
        return str;
    }
    static simpleRemoveHtmlTags(str) {
        //consider which characters are allowed in an attributes string
        //https://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
        let result = str.replace(/<\/?.*?>/g, "");
        return result;
    }
    static getAllIndexes(str, char) {
        if (char.length !== 1) {
            throw "searched for char must be single character";
        }
        let result = [];
        for (let i = 0; i < str.length; i++) {
            if (str[i] === char) {
                result.push(i);
            }
        }
        return result;
    }
    static escapeForCString(str) {
        let result = str;
        result = result.replace('"', '\\"'); // '\\"' is to escape double quotes for generated c
        result = result.replace(/([\x00-\x1F]|[\x80-\xFF])/g, function (fullMatch, capture) {
            let hexDigits = capture.charCodeAt(0).toString(16);
            if (hexDigits.length < 2) {
                hexDigits = '0' + hexDigits;
            }
            return `" "\\x${hexDigits}" "`; //relies on 'eager catenation' to avoid hex escape accidentally grabbing more than it should
        });
        return result;
    }
}
exports.StringUtils = StringUtils;
function demo() {
    let output;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTdHJpbmdVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUFpQztBQUVqQyxtQ0FBb0M7QUFFcEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxpQkFBTyxFQUFFLENBQUM7QUFHeEI7SUFFRSwwRUFBMEU7SUFDMUUscUVBQXFFO0lBQ3JFLDRCQUE0QjtJQUNyQixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQVksRUFBRSxXQUFvQixDQUFDO1FBQ3hELElBQUksTUFBZSxDQUFDO1FBQ3BCLElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUN6QixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRS9DLHVEQUF1RDtRQUN2RCxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLFVBQVMsS0FBYyxFQUFFLE1BQWU7WUFDckUsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsc0NBQXNDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFBLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxTQUFTLElBQUksUUFBUSxDQUFDLENBQUEsQ0FBQztZQUMxQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2IsQ0FBQztRQUVELElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFHLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENB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