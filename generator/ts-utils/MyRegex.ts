export class MyRegex{
  bs = "\\";
  fslash = `/`;
  star = "[*]";
  any = "[^]";
  nl = "(?:\\r\\n|\\r|\\n)"; //newline
  hspace = "[ \\t]"; //horizontal space
  hs = "[ \\t]"; //horizontal space
  mhs = "[ \\t]*";  //maybe horizontal space
  ms = "\\s*";  //maybe space
  blankLine = `(?:^${this.mhs}$\\n)`;
  varName = `(?:[_a-zA-Z]\\w*)`;
  openP = "\\(";
  closeP = "\\)";
  openB = "\\[";
  closeB = "\\]";
  /** opening curly brace */
  openCB = "\\{";
  /** closing curly brace */
  closeCB = "\\}";  
  word = "\\w";
  space = "\\s";
  d = "\\d"

  static getNlRegex(flags : string = "g") : RegExp {
    return new RegExp(new MyRegex().nl, flags);
  }

  static escapeMetaChars(text : string){
    let result : string;
    let reMetaChars = /[\[\\^$.|?*+(){}]/g;
    result =  text.replace(reMetaChars, '\\$&');
    return result;
  }

  static buildMatchedCharRecursiveRegex(openingChar : string, closingChar : string, depth : number) : RegExp{
    var r = new MyRegex();
    if(openingChar.length !== 1){throw "Invalid opening char: " + openingChar};
    if(closingChar.length !== 1){throw "Invalid closing char: " + closingChar};
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

  static buildMatchedSquareBracketsRegex(depth : number) : RegExp{
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

  static buildMatchedBracesRegex(depth : number) : RegExp{
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

  static buildMatchedBracesCaptureParamsRegex(depth : number, maxParams : number) : RegExp{
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

  static buildCommentRegex() : RegExp{
    var r = new MyRegex();
    var starComment = `${r.fslash}${r.star}+${r.any}*?${r.star}+${r.fslash}`; //match /*anything*/
    var ffComment = `${r.fslash}${r.fslash}.*(?=${r.nl})`;
    var anyComment = `(?:${starComment}|${ffComment})`;
    var regex = new RegExp(anyComment, "mg");
    return regex;
  }

  static buildPreCommentRegex() : RegExp{
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

  static buildPostCommentRegex() : RegExp{
    var r = new MyRegex();
    var starComment = `${r.fslash}${r.star}${r.any}*?${r.star}${r.fslash}`; //match /*anything*/
    var allowedMultipleStarCommentsSameLine = `(?:${starComment}${r.mhs})+`;
    var ffComment = `${r.fslash}${r.fslash}.*?$`;
    var anyLineComment = `(?:${allowedMultipleStarCommentsSameLine}|${ffComment})`;  //allow '/* comment */ /* another comment */'' on same line
    var regex = new RegExp(anyLineComment, "mg");
    return regex;
  }

  static buildExpansionRegex() : RegExp{
    var r = new MyRegex();
    var preComment = this.buildPreCommentRegex().source;
    var postComment = this.buildPostCommentRegex().source;
    var varName = r.varName;
    var functionParameters = `(?:${varName}(?:${r.mhs},${r.mhs}${varName})*)`;
    var cFP = `(?:${r.openP}${r.mhs}(${functionParameters}?)${r.mhs}${r.closeP})`; //capturedFunctionParams
    var div = `====+>`;
    var ungreedyRest = `(?:.+?)`;
    var re = `^${r.mhs}(${varName})${r.mhs}${cFP}?${r.mhs}${div}${r.mhs}(${ungreedyRest})${r.mhs}`;
    var expWithComment = `(?:^${r.mhs}(${preComment})${r.mhs}\\n)?${re}${r.mhs}(${postComment})?${r.mhs}$(?:\\n${r.blankLine}*)?`
    var regExp = new RegExp(expWithComment, "gmy"); //yayy for the sticky flag!!!
    return regExp;
  }

  static buildStructFieldRegex() : RegExp{
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
    var expWithComment = `(?:^${r.mhs}(${preComment})${r.mhs}\\n)?${re}${r.mhs}(${postComment})?${r.mhs}$(?:\\n${r.blankLine}*)?`
    var regExp = new RegExp(expWithComment, "gmy"); //yayy for the sticky flag!!!

    return regExp;
  }
}

//console.log(MyRegex.buildStructFieldRegex());
