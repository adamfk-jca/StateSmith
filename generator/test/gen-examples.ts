import { IHashString } from "../ts-utils/Misc";
import { ToProcess, generateFor as generateStateMachines } from "../runner";
import assert = require("assert");

describe("Generate Examples", function() {
  it("should generate without problem", function(){
    let yedFilesToProcess : ToProcess[] = [
      { inputDirectory : `../examples/1`,              inputFile : "ExampleSm.graphml",       compiler : "hsm2", simplifyInitialStates : true},
      { inputDirectory : `../examples/specifications`, inputFile : "spec_Simple.graphml",     compiler : "hsm2", simplifyInitialStates : false},
      { inputDirectory : `../examples/specifications`, inputFile : "spec_Simple.graphml",     compiler : "hsm2", simplifyInitialStates : true, appendToSmName:"_simp", outputDirectory: `../examples/specifications/simplified` },
      { inputDirectory : `../examples/specifications`, inputFile : "spec_OrderElse1.graphml", compiler : "hsm2", simplifyInitialStates : true},
      { inputDirectory : `../examples/specifications`, inputFile : "spec_OrderElse1.graphml", compiler : "flat", appendToSmName:"_flat", outputDirectory: `../examples/specifications/flat`},
      { inputDirectory : `../examples/specifications`, inputFile : "spec_Simple2.graphml",    compiler : "flat", appendToSmName:"_flat", outputDirectory: `../examples/specifications/flat`},
    ];
    
    //TODOLOW add to examples
    let typedefPrintfMapping: IHashString<string> = {
      i32: "int32_t",
    };
    
    generateStateMachines(yedFilesToProcess, typedefPrintfMapping);
  
    assert(true);
  });
});



