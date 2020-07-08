"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MyRegex_1 = require("../ts-utils/MyRegex");
const StringUtils_1 = require("../ts-utils/StringUtils");
const Generator_1 = require("./Generator");
class MacroExpander {
    constructor() {
        this.expansions = [];
        this.HIDE_CHAR_OFFSET = 0x1000;
    }
    addMacroExpansions(text) {
        var expansions = ExpansionParser.parse(text);
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
    expandOriginalNameShorthand(exp) {
        let result;
        result = exp.expandedReplaceTemplate.replace(/[$][$]/g, exp.name);
        if (result != exp.expandedReplaceTemplate) {
            let for_breakpoint = 0; //for testing
        }
        return result;
    }
    expandText(text) {
        let result = text;
        //convert chars inside comments and strings from matching. a real hack :)
        result = this.hideCommentAndStringInnards(text);
        for (let i = 0; i < this.expansions.length; i++) {
            var exp = this.expansions[i];
            result = result.replace(exp.searchRegex, function (match, preMatch, name, p1, p2, p3, p4, p5, postMatch) {
                let result = null;
                result = exp.expandedReplaceTemplate;
                switch (exp.functionParameters.length) {
                    case 0:
                        result = result; //no changes needed
                        break;
                    case 1:
                        //console.log(`param: '${exp.functionParameters[0]}', 'p1:${p1}'`);
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`, 'g'), p1.trim());
                        break;
                    case 2:
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`, 'g'), p1.trim());
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[1]}\\s*}}`, 'g'), p2.trim());
                        break;
                    case 3:
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`, 'g'), p1.trim());
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[1]}\\s*}}`, 'g'), p2.trim());
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[2]}\\s*}}`, 'g'), p3.trim());
                        break;
                    case 4:
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[0]}\\s*}}`, 'g'), p1.trim());
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[1]}\\s*}}`, 'g'), p2.trim());
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[2]}\\s*}}`, 'g'), p3.trim());
                        result = result.replace(new RegExp(`{{\\s*${exp.functionParameters[3]}\\s*}}`, 'g'), p4.trim());
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
    ripOutComments(text) {
        let result = "";
        let r = new MyRegex_1.MyRegex();
        let re = `${r.fslash}${r.star}(${r.any}*?)${r.star}${r.fslash}|${r.fslash}${r.fslash}(.*)|"([^"]*)"`;
        var tthis = this;
        result = text.replace(new RegExp(re, "g"), function (match, starCommentInner, lineCommentInner, stringInner) {
            let result = "";
            let preResult = "";
            let postResult = "";
            if (starCommentInner) {
                preResult = "/*";
                postResult = "*/";
            }
            else if (lineCommentInner) {
                preResult = "//";
            }
            else if (stringInner) {
                preResult = postResult = '"';
            }
            else {
                throw "Unknown matching...";
            }
            let inner = starCommentInner || lineCommentInner || stringInner;
            let newInner = inner.replace(/./g, function (match) {
                return String.fromCharCode(match.charCodeAt(0) + tthis.HIDE_CHAR_OFFSET);
            });
            result = preResult + newInner + postResult;
            return result;
        });
        return result;
    }
    hideStringCharacters(text) {
        var tthis = this;
        let hidden = text.replace(/[^]/g, function (match) {
            return String.fromCharCode(match.charCodeAt(0) + tthis.HIDE_CHAR_OFFSET);
        });
        return hidden;
    }
    unhideStringCharacters(text) {
        var tthis = this;
        let unhidden = text.replace(/[^]/g, function (match) {
            return String.fromCharCode(match.charCodeAt(0) - tthis.HIDE_CHAR_OFFSET);
        });
        return unhidden;
    }
    hideCommentAndStringInnards(text) {
        let result = "";
        let r = new MyRegex_1.MyRegex();
        let re = `${r.fslash}${r.star}(${r.any}*?)${r.star}${r.fslash}|${r.fslash}${r.fslash}(.*)|"([^"]*)"`;
        var tthis = this;
        result = text.replace(new RegExp(re, "g"), function (match, starCommentInner, lineCommentInner, stringInner) {
            let result = "";
            let preResult = "";
            let postResult = "";
            let inner;
            if (starCommentInner != undefined) {
                preResult = "/*";
                postResult = "*/";
                inner = starCommentInner;
            }
            else if (lineCommentInner != undefined) {
                preResult = "//";
                inner = lineCommentInner;
            }
            else if (stringInner != undefined) {
                preResult = postResult = '"';
                inner = stringInner;
            }
            else {
                console.log({ text: text, re: re, match: match });
                throw "Unknown matching...";
            }
            let newInner = tthis.hideStringCharacters(inner);
            result = preResult + newInner + postResult;
            return result;
        });
        return result;
    }
    unhideCommentAndStringInnards(text) {
        let result = "";
        let r = new MyRegex_1.MyRegex();
        let re = `[\\u${this.HIDE_CHAR_OFFSET.toString(16)}-\\u${(this.HIDE_CHAR_OFFSET + 10000).toString(16)}]`;
        var tthis = this;
        result = text.replace(new RegExp(re, "g"), function (match) {
            let result = String.fromCharCode(match.charCodeAt(0) - tthis.HIDE_CHAR_OFFSET);
            return result;
        });
        return result;
    }
}
exports.MacroExpander = MacroExpander;
class MyInputExpansion {
    constructor() {
        this.functionParameters = [];
    }
    buildRegex() {
        var r = new MyRegex_1.MyRegex();
        //say you have expansions `state ====> MY_STATE` and `add(state) ====> x += {{state}}`. Need to prevent second expansion from becoming `add(state) ====> x += {{MY_STATE}}`.
        let preventMatchingReplacementVar = "(?!\s*}})";
        var preMatch = "(?:^|\\s|[-+;<>,%?:\\(/&|!~*={}\\[$]|::)";
        var postMatch = `${preventMatchingReplacementVar}(?:$|\\s|[-+;<>,%?:\\(\\)/&|!~*={}\\]$.]|::)`;
        var capturedName = `(${this.name})`;
        var re = `(${preMatch})${capturedName}(?=${postMatch})`;
        //
        if (this.isFunction) {
            var r = new MyRegex_1.MyRegex();
            var capturedInner = MyRegex_1.MyRegex.buildMatchedBracesCaptureParamsRegex(2, 4);
            re = `(${preMatch})${capturedName}${capturedInner.source}(?=${postMatch})`;
        }
        //console.log(re);
        //console.log(this);
        this.searchRegex = new RegExp(re, "mg");
    }
}
class ExpansionParser {
    static parse(text) {
        let result = [];
        let r = new MyRegex_1.MyRegex();
        text = text.trim();
        text = StringUtils_1.StringUtils.normalizeLineEndingsTo(text, "\n");
        //remove comments not part of an expansion line
        text = StringUtils_1.StringUtils.removeUnattachedComments(text);
        let re = MyRegex_1.MyRegex.buildExpansionRegex();
        var array;
        var lastIndex = 0;
        while ((array = re.exec(text)) !== null) {
            let match = new MyInputExpansion();
            match.preComment = array[1];
            match.name = array[2];
            var functionParameters = array[3];
            match.replaceTemplate = array[4];
            match.lineComment = array[5];
            result.push(match);
            lastIndex = re.lastIndex;
            if (functionParameters == null) {
                match.isFunction = false;
            }
            else {
                match.isFunction = true;
                functionParameters = functionParameters.trim();
                if (functionParameters) {
                    match.functionParameters = functionParameters.trim().split(/\s*,\s*/);
                }
                else {
                    match.functionParameters = []; //no actual parameters but still a function
                }
            }
            // console.log(`lastIndex: ${re.lastIndex}`);
        }
        //TODOLOW error if expansion doesn't use a passed in parameter
        if (lastIndex !== text.length) {
            // console.log(`lastIndex: ${lastIndex}`);
            // console.log(result);
            // console.log("Failed parsing at index: " + lastIndex + ": '" + text.substr(lastIndex, 30) + "'...");
            throw `Failed parsing at index: ${lastIndex}. Unrecognized 'input' starts with: '${text.substr(lastIndex, 50).replace(/\n/g, "\\n")}'...`;
        }
        return result;
    }
} //////////////////////////////////////////////////////////////////////////////
class StructFieldParser {
    static parse(text) {
        let result = [];
        let r = new MyRegex_1.MyRegex();
        text = text.trim();
        text = StringUtils_1.StringUtils.normalizeLineEndingsTo(text, "\n");
        //remove comments not part of an expansion line
        text = StringUtils_1.StringUtils.removeUnattachedComments(text);
        //captured groups: preComment, type, name, bitfieldSize, arraySize, lineComment
        let re = MyRegex_1.MyRegex.buildStructFieldRegex();
        var array;
        var lastIndex = 0;
        while ((array = re.exec(text)) !== null) {
            let i = 1;
            let match = new Generator_1.StructField();
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
        if (lastIndex !== text.length) {
            // console.log(`lastIndex: ${lastIndex}`);
            // console.log(result);
            // console.log("Failed parsing at index: " + lastIndex + ": '" + text.substr(lastIndex, 30) + "'...");
            throw `Failed parsing at index: ${lastIndex}. Unrecognized 'input' starts with: '${text.substr(lastIndex, 50).replace(/\n/g, "\\n")}'...`;
        }
        return result;
    }
} //////////////////////////////////////////////////////////////////////////////
exports.StructFieldParser = StructFieldParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUEyQztBQUczQyx5REFBbUQ7QUFDbkQsMkNBQXVDO0FBRXZDO0lBQUE7UUFDRSxlQUFVLEdBQXdCLEVBQUUsQ0FBQztRQUNyQyxxQkFBZ0IsR0FBRyxNQUFNLENBQUM7SUFtTDVCLENBQUM7SUFqTFEsa0JBQWtCLENBQUMsSUFBSTtRQUM1QixJQUFJLFVBQVUsR0FBd0IsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsRSxvRUFBb0U7UUFDcEUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0MsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuRSxHQUFHLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLDJCQUEyQixDQUFDLEdBQXNCO1FBQ3hELElBQUksTUFBZSxDQUFDO1FBRXBCLE1BQU0sR0FBRyxHQUFHLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEUsRUFBRSxDQUFBLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBLENBQUM7WUFDeEMsSUFB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