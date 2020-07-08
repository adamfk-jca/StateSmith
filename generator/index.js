"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const runner_1 = require("./runner");
// commander
//   .version('0.0.1')
//   .usage('test')
//   .option('-s --size <size>', 'Pizza size', /^(large|medium|small)$/i, 'medium')
//   .option('-d --drink [drink]', 'Drink', /^(coke|pepsi|izze)$/i)
//   .parse(process.argv);
// console.log(' size: %j', commander.size);
// console.log(' drink: %j', commander.drink);
let toProcess = new runner_1.ToProcess();
commander.version("0.1.0")
    .option("--input-directory <path>", "required")
    .option("--input-file <path>", "required. Relative to `input-directory`.")
    .option("--compiler <type>", "required.")
    .option("--simplify-initial-states <boolean>", "optional")
    .option("--output-directory <path>", "optional")
    .parse(process.argv);
toProcess.inputDirectory = commander.inputDirectory;
toProcess.inputFile = commander.inputFile;
toProcess.compiler = commander.compiler;
toProcess.simplifyInitialStates = commander.simplifyInitialStates;
toProcess.outputDirectory = commander.outputDirectory;
try {
    runner_1.generateFor([toProcess]);
}
catch (e) {
    console.log(e);
    console.log();
    commander.outputHelp(() => commander.help());
    process.exitCode = 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1QztBQUN2QyxxQ0FBa0Q7QUFHbEQsWUFBWTtBQUNaLHNCQUFzQjtBQUN0QixtQkFBbUI7QUFDbkIsbUZBQW1GO0FBQ25GLG1FQUFtRTtBQUNuRSwwQkFBMEI7QUFFMUIsNENBQTRDO0FBQzVDLDhDQUE4QztBQUs5QyxJQUFJLFNBQVMsR0FBRyxJQUFJLGtCQUFTLEVBQUUsQ0FBQztBQUVoQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztLQUNoQixNQUFNLENBQUMsMEJBQTBCLEVBQWEsVUFBVSxDQUFDO0tBQ3pELE1BQU0sQ0FBQyxxQkFBcUIsRUFBa0IsMENBQTBDLENBQUM7S0FDekYsTUFBTSxDQUFDLG1CQUFtQixFQUFvQixXQUFXLENBQUM7S0FDMUQsTUFBTSxDQUFDLHFDQUFxQyxFQUFFLFVBQVUsQ0FBQztLQUN6RCxNQUFNLENBQUMsMkJBQTJCLEVBQVksVUFBVSxDQUFDO0tBQ3pELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFOUIsU0FBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDO0FBQ3BELFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUMxQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDeEMsU0FBUyxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztBQUNsRSxTQUFTLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUM7QUFFdEQsSUFBSSxDQUFDO0lBQ0gsb0JBQVcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUM7SUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2YsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2QsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM3QyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUN2QixDQUFDIn0=