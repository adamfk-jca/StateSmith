import commander = require("commander")
import { ToProcess, generateFor } from "./runner";


// commander
//   .version('0.0.1')
//   .usage('test')
//   .option('-s --size <size>', 'Pizza size', /^(large|medium|small)$/i, 'medium')
//   .option('-d --drink [drink]', 'Drink', /^(coke|pepsi|izze)$/i)
//   .parse(process.argv);
  
// console.log(' size: %j', commander.size);
// console.log(' drink: %j', commander.drink);




let toProcess = new ToProcess();

commander.version("0.1.0")
         .option("--input-directory <path>",            "required")
         .option("--input-file <path>",                 "required. Relative to `input-directory`.")
         .option("--compiler <type>",                   "required.")
         .option("--simplify-initial-states <boolean>", "optional")
         .option("--output-directory <path>",           "optional")
         .parse(process.argv);

toProcess.inputDirectory = commander.inputDirectory;
toProcess.inputFile = commander.inputFile;
toProcess.compiler = commander.compiler;
toProcess.simplifyInitialStates = commander.simplifyInitialStates;
toProcess.outputDirectory = commander.outputDirectory;

try {
  generateFor([toProcess]);
} catch(e){
  console.log(e);
  console.log();
  commander.outputHelp(() => commander.help());
  process.exitCode = 1;
}
