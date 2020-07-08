"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MyRegex {
    constructor() {
        this.bs = "\\";
        this.fslash = `/`;
        this.star = "[*]";
        this.any = "[^]";
        this.nl = "(?:\\r\\n|\\r|\\n)"; //newline
        this.hspace = "[ \\t]"; //horizontal space
        this.hs = "[ \\t]"; //horizontal space
        this.mhs = "[ \\t]*"; //maybe horizontal space
        this.ms = "\\s*"; //maybe space
        this.blankLine = `(?:^${this.mhs}$\\n)`;
        this.varName = `(?:[_a-zA-Z]\\w*)`;
        this.openP = "\\(";
        this.closeP = "\\)";
        this.openB = "\\[";
        this.closeB = "\\]";
        /** opening curly brace */
        this.openCB = "\\{";
        /** closing curly brace */
        this.closeCB = "\\}";
        this.word = "\\w";
        this.space = "\\s";
        this.d = "\\d";
    }
    static getNlRegex(flags = "g") {
        return new RegExp(new MyRegex().nl, flags);
    }
    static escapeMetaChars(text) {
        let result;
        let reMetaChars = /[\[\\^$.|?*+(){}]/g;
        result = text.replace(reMetaChars, '\\$&');
        return result;
    }
    static buildMatchedCharRecursiveRegex(openingChar, closingChar, depth) {
        var r = new MyRegex();
        if (openingChar.length !== 1) {
            throw "Invalid opening char: " + openingChar;
        }
        ;
        if (closingChar.length !== 1) {
            throw "Invalid closing char: " + closingChar;
        }
        ;
        let escapedOpeningChar = this.escapeMetaChars(openingChar);
        let escapedClosingChar = this.escapeMetaChars(closingChar);
        let matchedBraces = "";
        let matchedBracesWithPipe = "";
        let stuff = "";
        let anythingButOpeningClosing = `[^${escapedOpeningChar}${escapedClosingChar}]`;
        for (let i = 0; i < depth; i++) {
            stuff = `(?:${matchedBracesWithPipe}|${anythingButOpeningClosing})*?`;
            matchedBraces = `${escapedOpeningChar}${stuff}${escapedClosingChar}`;
            matchedBracesWithPipe = matchedBraces + "|";
            //console.log(matchedBraces);
        }
        let re = new RegExp(matchedBraces, "g");
        return re;
    }
    static buildMatchedSquareBracketsRegex(depth) {
        var r = new MyRegex();
        let matchedBraces = "";
        let matchedBracesWithPipe = "";
        let stuff = "";
        let anythingButSquareBrackets = `[^${r.openB}${r.closeB}]`;
        for (let i = 0; i < depth; i++) {
            stuff = `(?:${matchedBracesWithPipe}|${anythingButSquareBrackets})*?`;
            matchedBraces = `${r.openB}${stuff}${r.closeB}`;
            matchedBracesWithPipe = matchedBraces + "|";
            //console.log(matchedBraces);
        }
        let re = new RegExp(matchedBraces, "g");
        return re;
    }
    static buildMatchedBracesRegex(depth) {
        var r = new MyRegex();
        let stringRe = `(?:"[^"]*")|(?:'[^']*')`;
        let symbols = `[-+*/%=!<>&|^~:,{}.]`;
        let number = `(?:\\d[\\d\\w.]*)`;
        let varName = r.varName;
        let matchedBraces = "";
        let matchedBracesWithPipe = "";
        let stuff = "";
        for (let i = 0; i < depth; i++) {
            stuff = `(?:${matchedBracesWithPipe}${stringRe}|${symbols}|${number}|${varName}|[ \\t]+)*?`;
            matchedBraces = `${r.openP}${stuff}${r.closeP}`;
            matchedBracesWithPipe = matchedBraces + "|";
            //console.log(matchedBraces);
        }
        let re = new RegExp(matchedBraces, "g");
        return re;
    }
    static buildMatchedBracesCaptureParamsRegex(depth, maxParams) {
        // let str = 'do_stuff(this(), andthis(bb))';
        // console.log(XRegExp.matchRecursive(str, '\\(', '\\)', 'g'));
        var r = new MyRegex();
        let stringRe = `(?:"[^"]*")|(?:'[^']*')`;
        let symbols = `[-+*/%=!<>&|^~:,{}.$]`;
        let symbolsNoComma = `[-+*/%=!<>&|^~:{}.$]`;
        let number = `(?:\\d[\\d\\w.]*)`;
        let varName = r.varName;
        let matchedBraces = "";
        let matchedBracesWithPipe = "";
        let stuff = "";
        for (let i = 0; i < depth; i++) {
            stuff = `(?:${matchedBracesWithPipe}${stringRe}|${symbols}|${number}|${varName}|[ \\t]+)*?`;
            matchedBraces = `${r.openP}${stuff}${r.closeP}`;
            matchedBracesWithPipe = matchedBraces + "|";
        }
        stuff = `(?:${matchedBracesWithPipe}${stringRe}|${symbolsNoComma}|${number}|${varName}|[ \\t]+)*?`;
        let params = `(${stuff})?`;
        for (let i = 0; i < maxParams; i++) {
            params += `(?:,(${stuff}))?`;
        }
        matchedBraces = `${r.openP}${params}${r.closeP}`;
        let re = new RegExp(matchedBraces, "g");
        return re;
    }
    static buildCommentRegex() {
        var r = new MyRegex();
        var starComment = `${r.fslash}${r.star}+${r.any}*?${r.star}+${r.fslash}`; //match /*anything*/
        var ffComment = `${r.fslash}${r.fslash}.*(?=${r.nl})`;
        var anyComment = `(?:${starComment}|${ffComment})`;
        var regex = new RegExp(anyComment, "mg");
        return regex;
    }
    static buildPreCommentRegex() {
        var r = new MyRegex();
        var starComment = `${r.fslash}${r.star}+${r.any}*?${r.star}+${r.fslash}`; //match /*anything*/
        var ffComment = `${r.fslash}${r.fslash}.*$`;
        var xComment = `(?:${starComment}|${ffComment})`;
        var xCommentsSameLine = `(?:(?:${xComment}${r.mhs})+)`;
        var anyLineComment = `(?:${ffComment}|${xCommentsSameLine})`;
        var blockLineComment = `${ffComment}(?:\\n${r.mhs}${ffComment})*`;
        var blockStarsComment = `${xCommentsSameLine}${r.mhs}(?:\\n${r.mhs}${xCommentsSameLine})*`; //match /* blah */ newline /* more blah */
        var blockAnyComment = `${xCommentsSameLine}(?:\\n${r.mhs}${xCommentsSameLine})*`;
        var anyComment = `(?:${blockStarsComment}|${blockLineComment})`;
        var regex = new RegExp(blockAnyComment, "mg");
        return regex;
    }
    static buildPostCommentRegex() {
        var r = new MyRegex();
        var starComment = `${r.fslash}${r.star}${r.any}*?${r.star}${r.fslash}`; //match /*anything*/
        var allowedMultipleStarCommentsSameLine = `(?:${starComment}${r.mhs})+`;
        var ffComment = `${r.fslash}${r.fslash}.*?$`;
        var anyLineComment = `(?:${allowedMultipleStarCommentsSameLine}|${ffComment})`; //allow '/* comment */ /* another comment */'' on same line
        var regex = new RegExp(anyLineComment, "mg");
        return regex;
    }
    static buildExpansionRegex() {
        var r = new MyRegex();
        var preComment = this.buildPreCommentRegex().source;
        var postComment = this.buildPostCommentRegex().source;
        var varName = r.varName;
        var functionParameters = `(?:${varName}(?:${r.mhs},${r.mhs}${varName})*)`;
        var cFP = `(?:${r.openP}${r.mhs}(${functionParameters}?)${r.mhs}${r.closeP})`; //capturedFunctionParams
        var div = `====+>`;
        var ungreedyRest = `(?:.+?)`;
        var re = `^${r.mhs}(${varName})${r.mhs}${cFP}?${r.mhs}${div}${r.mhs}(${ungreedyRest})${r.mhs}`;
        var expWithComment = `(?:^${r.mhs}(${preComment})${r.mhs}\\n)?${re}${r.mhs}(${postComment})?${r.mhs}$(?:\\n${r.blankLine}*)?`;
        var regExp = new RegExp(expWithComment, "gmy"); //yayy for the sticky flag!!!
        return regExp;
    }
    static buildStructFieldRegex() {
        /*
          examples to match:
            bool is_active : 1;
            uint8_t counts[SOME_SIZE];
        */
        //captured groups: preComment, type, name, bitfieldSize, arraySize, lineComment
        var r = new MyRegex();
        var hs = r.hs;
        var mhs = r.mhs;
        var capturedType = /(?:\b(\w+)\b)/.source; //no pointers allowed
        var capturedVarName = `(${r.varName})`;
        var capturedBitFieldSize = /(?:[:][ \t]*(\d+)\b)/.source;
        var capturedArrayLength = /(?:[\[][ \t]*(\w+)[ \t]*[\]])/.source;
        var ending = /(?:[;])/.source;
        var preComment = this.buildPreCommentRegex().source;
        var postComment = this.buildPostCommentRegex().source;
        var ungreedyRest = `(?:.+?)`;
        var re = `^${mhs}${capturedType}${hs}${capturedVarName}${mhs}(?:${capturedBitFieldSize}|${capturedArrayLength})?${mhs}${ending}`;
        var expWithComment = `(?:^${r.mhs}(${preComment})${r.mhs}\\n)?${re}${r.mhs}(${postComment})?${r.mhs}$(?:\\n${r.blankLine}*)?`;
        var regExp = new RegExp(expWithComment, "gmy"); //yayy for the sticky flag!!!
        return regExp;
    }
}
exports.MyRegex = MyRegex;
//console.log(MyRegex.buildStructFieldRegex());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlSZWdleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk15UmVnZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtJQUFBO1FBQ0UsT0FBRSxHQUFHLElBQUksQ0FBQztRQUNWLFdBQU0sR0FBRyxHQUFHLENBQUM7UUFDYixTQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2IsUUFBRyxHQUFHLEtBQUssQ0FBQztRQUNaLE9BQUUsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLFNBQVM7UUFDcEMsV0FBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLGtCQUFrQjtRQUNyQyxPQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsa0JBQWtCO1FBQ2pDLFFBQUcsR0FBRyxTQUFTLENBQUMsQ0FBRSx3QkFBd0I7UUFDMUMsT0FBRSxHQUFHLE1BQU0sQ0FBQyxDQUFFLGFBQWE7UUFDM0IsY0FBUyxHQUFHLE9BQU8sSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQ25DLFlBQU8sR0FBRyxtQkFBbUIsQ0FBQztRQUM5QixVQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2QsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUNmLFVBQUssR0FBRyxLQUFLLENBQUM7UUFDZCxXQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsMEJBQTBCO1FBQzFCLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFDZiwwQkFBMEI7UUFDMUIsWUFBTyxHQUFHLEtBQUssQ0FBQztRQUNoQixTQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2IsVUFBSyxHQUFHLEtBQUssQ0FBQztRQUNkLE1BQUMsR0FBRyxLQUFLLENBQUE7SUFvTFgsQ0FBQztJQWxMQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQWlCLEdBQUc7UUFDcEMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQWE7UUFDbEMsSUFBSSxN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