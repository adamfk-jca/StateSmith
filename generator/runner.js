"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YedParser_1 = require("./hsm/YedParser");
const Compiler_1 = require("./hsm/Compiler");
const FileUtils_1 = require("./ts-utils/FileUtils");
const StateTsExporter_1 = require("./hsm/StateTsExporter");
const PlantUmlExporter_1 = require("./hsm/PlantUmlExporter");
const FlatCompiler_1 = require("./hsm/FlatCompiler");
class ToProcess {
    constructor() {
        this.appendToSmName = "";
    }
}
exports.ToProcess = ToProcess;
function generateFor(toProcess, typedefPrintfMapping = {}) {
    for (const item of toProcess) {
        generateInner(item, typedefPrintfMapping);
    }
}
exports.generateFor = generateFor;
//https://stackoverflow.com/questions/50470025/nameof-keyword-in-typescript
const nameof = (name) => name;
function validate(toProcess) {
    let fieldsToValidate = [
        nameof("inputDirectory"),
        nameof("inputFile"),
        nameof("compiler"),
    ];
    for (const mapping of fieldsToValidate) {
        if (toProcess[mapping] === undefined) {
            throw `field '${mapping}' must be defined`;
        }
    }
}
function generateInner(toProcess, typedefPrintfMapping = {}) {
    validate(toProcess);
    let inputDirectory = toProcess.inputDirectory;
    let outputDirectory = toProcess.outputDirectory || toProcess.inputDirectory;
    let filePath = inputDirectory + "/" + toProcess.inputFile;
    let appendToSmName = toProcess.appendToSmName || "";
    let compType = toProcess.compiler;
    let yedParser = new YedParser_1.YedParser();
    console.log("\r\nProcessing file: " + toProcess.inputFile);
    let parsedStateMachines = yedParser.run(filePath);
    let stateTsExporter = new StateTsExporter_1.StateTsExporter();
    for (let inputHsm of parsedStateMachines) {
        inputHsm.diagramSourceFilePath = filePath;
        let compiler;
        switch (compType) {
            default:
                throw `unknown compiler type ${compType}`;
            case "hsm2":
                compiler = new Compiler_1.Compiler();
                compiler.hsm.shouldSimplifyInitialStateTransitions = toProcess.simplifyInitialStates || false;
                compiler.typedefPrintfMapping = typedefPrintfMapping;
                compiler.classFullName = inputHsm.name + appendToSmName;
                compiler.classPrefix = (inputHsm.prefix || inputHsm.name) + appendToSmName;
                console.log(inputHsm.prefix);
                console.log(compiler.classPrefix);
                compiler.setupStrings();
                break;
            case "flat":
                compiler = new FlatCompiler_1.FlatCompiler();
                compiler.hsm.shouldSimplifyInitialStateTransitions = true; //toProcess.simplifyInitialStates;
                compiler.classFullName = inputHsm.name + appendToSmName;
                break;
        }
        compiler.compile(inputHsm);
        FileUtils_1.update_text_file(`${outputDirectory}/${compiler.getSummaryFilename()}`, compiler.hsm.genSummaryText());
        FileUtils_1.update_text_file(`${outputDirectory}/${compiler.getHeaderFilename()}`, compiler.genPublicHeaderFile());
        FileUtils_1.update_text_file(`${outputDirectory}/${compiler.getSourceFilename()}`, compiler.genSourceFile());
        let plantUmlExporter = new PlantUmlExporter_1.PlantUmlExporter();
        let plantUml = plantUmlExporter.buildOutputRecursively(compiler.hsm.rootState);
        FileUtils_1.update_text_file(`${outputDirectory}/${compiler.getSourceFilename()}.plantuml`, plantUml);
        //let ts = stateTsExporter.buildOutput(compiler.hsm.rootState, inputHsm.name);
        //update_text_file(`views/doc-content/states/${inputHsm.name}.ts`, ts);          
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0NBQTJDO0FBQzNDLDZDQUEwQztBQUMxQyxvREFBd0Q7QUFFeEQsMkRBQXdEO0FBQ3hELDZEQUEwRDtBQUMxRCxxREFBa0Q7QUFHbEQ7SUFBQTtRQVFFLG1CQUFjLEdBQUksRUFBRSxDQUFDO0lBR3ZCLENBQUM7Q0FBQTtBQVhELDhCQVdDO0FBR0QscUJBQTRCLFNBQXVCLEVBQUUsdUJBQTRDLEVBQUU7SUFDakcsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM3QixhQUFhLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDNUMsQ0FBQztBQUNILENBQUM7QUFKRCxrQ0FJQztBQUVELDJFQUEyRTtBQUMzRSxNQUFNLE1BQU0sR0FBRyxDQUFJLElBQThCLEVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQztBQUVuRSxrQkFBa0IsU0FBb0I7SUFFcEMsSUFBSSxnQkFBZ0IsR0FBRztRQUNyQixNQUFNLENBQVksZ0JBQWdCLENBQUM7UUFDbkMsTUFBTSxDQUFZLFdBQVcsQ0FBQztRQUM5QixNQUFNLENBQVksVUFBVSxDQUFDO0tBQzlCLENBQUM7SUFFRixHQUFHLENBQUMsQ0FBQyxNQUFNLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUNyQyxDQUFDO1lBQ0MsTUFBTSxVQUFVLE9BQU8sbUJBQW1CLENBQUM7UUFDN0MsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBR0QsdUJBQXVCLFNBQXFCLEVBQUUsdUJBQTRDLEVBQUU7SUFDMUYsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXBCLElBQUksY0FBYyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUM7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