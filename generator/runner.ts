import { YedParser } from "./hsm/YedParser"
import { Compiler } from "./hsm/Compiler";
import { update_text_file } from "./ts-utils/FileUtils";
import { IHashString } from "./ts-utils/Misc";
import { StateTsExporter } from "./hsm/StateTsExporter";
import { PlantUmlExporter } from "./hsm/PlantUmlExporter";
import { FlatCompiler } from "./hsm/FlatCompiler";


export class ToProcess {
  inputDirectory : string;

  /** if left out, it will be assumed to be  `inputDirectory` */
  outputDirectory? : string;
  inputFile : string;
  simplifyInitialStates? : boolean;

  appendToSmName? = "";

  compiler : "hsm2" | "flat";
}


export function generateFor(toProcess : ToProcess[], typedefPrintfMapping: IHashString<string> = {}){
  for (const item of toProcess) {
    generateInner(item, typedefPrintfMapping);
  }
}

//https://stackoverflow.com/questions/50470025/nameof-keyword-in-typescript
const nameof = <T>(name: Extract<keyof T, string>): string => name;

function validate(toProcess: ToProcess)
{
  let fieldsToValidate = [
    nameof<ToProcess>("inputDirectory"),
    nameof<ToProcess>("inputFile"),
    nameof<ToProcess>("compiler"),
  ];

  for (const mapping of fieldsToValidate) {
    if (toProcess[mapping] === undefined)
    {
      throw `field '${mapping}' must be defined`;
    }
  }
}


function generateInner(toProcess : ToProcess, typedefPrintfMapping: IHashString<string> = {}){
  validate(toProcess);

  let inputDirectory = toProcess.inputDirectory;
  let outputDirectory = toProcess.outputDirectory || toProcess.inputDirectory;
  let filePath = inputDirectory + "/" + toProcess.inputFile;
  let appendToSmName = toProcess.appendToSmName || "";
  let compType = toProcess.compiler;

  let yedParser = new YedParser();
  console.log("\r\nProcessing file: " + toProcess.inputFile);
  let parsedStateMachines = yedParser.run(filePath);
  let stateTsExporter = new StateTsExporter();

  for(let inputHsm of parsedStateMachines){
    inputHsm.diagramSourceFilePath = filePath;

    let compiler : Compiler | FlatCompiler;

    switch(compType) {
      default:
      throw `unknown compiler type ${compType}`;

      case "hsm2":
      compiler = new Compiler();
      compiler.hsm.shouldSimplifyInitialStateTransitions = toProcess.simplifyInitialStates || false;
      compiler.typedefPrintfMapping = typedefPrintfMapping;
      compiler.classFullName = inputHsm.name + appendToSmName;
      compiler.classPrefix = (inputHsm.prefix || inputHsm.name) + appendToSmName;
      console.log(inputHsm.prefix);
      console.log(compiler.classPrefix);
      compiler.setupStrings();
      break;

      case "flat":
      compiler = new FlatCompiler();
      compiler.hsm.shouldSimplifyInitialStateTransitions = true;//toProcess.simplifyInitialStates;
      compiler.classFullName = inputHsm.name + appendToSmName;
      break;
    }

    compiler.compile(inputHsm);
    update_text_file(`${outputDirectory}/${compiler.getSummaryFilename()}`, compiler.hsm.genSummaryText());
    update_text_file(`${outputDirectory}/${compiler.getHeaderFilename()}`, compiler.genPublicHeaderFile());
    update_text_file(`${outputDirectory}/${compiler.getSourceFilename()}`, compiler.genSourceFile());

    let plantUmlExporter = new PlantUmlExporter();
    let plantUml = plantUmlExporter.buildOutputRecursively(compiler.hsm.rootState);
    update_text_file(`${outputDirectory}/${compiler.getSourceFilename()}.plantuml`, plantUml);

    //let ts = stateTsExporter.buildOutput(compiler.hsm.rootState, inputHsm.name);
    //update_text_file(`views/doc-content/states/${inputHsm.name}.ts`, ts);          
  }
}

