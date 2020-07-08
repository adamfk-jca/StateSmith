"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runner_1 = require("../runner");
const assert = require("assert");
describe("Generate Examples", function () {
    it("should generate without problem", function () {
        let yedFilesToProcess = [
            { inputDirectory: `../examples/1`, inputFile: "ExampleSm.graphml", compiler: "hsm2", simplifyInitialStates: true },
            { inputDirectory: `../examples/specifications`, inputFile: "spec_Simple.graphml", compiler: "hsm2", simplifyInitialStates: false },
            { inputDirectory: `../examples/specifications`, inputFile: "spec_Simple.graphml", compiler: "hsm2", simplifyInitialStates: true, appendToSmName: "_simp", outputDirectory: `../examples/specifications/simplified` },
            { inputDirectory: `../examples/specifications`, inputFile: "spec_OrderElse1.graphml", compiler: "hsm2", simplifyInitialStates: true },
            { inputDirectory: `../examples/specifications`, inputFile: "spec_OrderElse1.graphml", compiler: "flat", appendToSmName: "_flat", outputDirectory: `../examples/specifications/flat` },
            { inputDirectory: `../examples/specifications`, inputFile: "spec_Simple2.graphml", compiler: "flat", appendToSmName: "_flat", outputDirectory: `../examples/specifications/flat` },
        ];
        //TODOLOW add to examples
        let typedefPrintfMapping = {
            i32: "int32_t",
        };
        runner_1.generateFor(yedFilesToProcess, typedefPrintfMapping);
        assert(true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuLWV4YW1wbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2VuLWV4YW1wbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0NBQTRFO0FBQzVFLGlDQUFrQztBQUVsQyxRQUFRLENBQUMsbUJBQW1CLEVBQUU7SUFDNUIsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO1FBQ3BDLElBQUksaUJBQWlCLEdBQWlCO1lBQ3BDLEVBQUUsY0FBYyxFQUFHLGVBQWUsRUFBZSxTQUFTLEVBQUcsbUJBQW1CLEVBQVEsUUFBUSxFQUFHLE1BQU0sRUFBRSxxQkFBcUIsRUFBRyxJQUFJLEVBQUM7WUFDeEksRUFBRSxjQUFjLEVBQUcsNEJBQTRCLEVBQUUsU0FBUyxFQUFHLHFCQUFxQixFQUFNLFFBQVEsRUFBRyxNQUFNLEVBQUUscUJBQXFCLEVBQUcsS0FBSyxFQUFDO1lBQ3pJLEVBQUUsY0FBYyxFQUFHLDRCQUE0QixFQUFFLFNBQVMsRUFBRyxxQkFBcUIsRUFBTSxRQUFRLEVBQUcsTUFBTSxFQUFFLHFCQUFxQixFQUFHLElBQUksRUFBRSxjQUFjLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSx1Q0FBdUMsRUFBRTtZQUMzTixFQUFFLGNBQWMsRUFBRyw0QkFBNEIsRUFBRSxTQUFTLEVBQUcseUJBQXlCLEVBQUUsUUFBUSxFQUFHLE1BQU0sRUFBRSxxQkFBcUIsRUFBRyxJQUFJLEVBQUM7WUFDeEksRUFBRSxjQUFjLEVBQUcsNEJBQTRCLEVBQUUsU0FBUyxFQUFHLHlCQUF5QixFQUFFLFFBQVEsRUFBRyxNQUFNLEVBQUUsY0FBYyxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsaUNBQWlDLEVBQUM7WUFDdEwsRUFBRSxjQUFjLEVBQUcsNEJBQTRCLEVBQUUsU0FBUyxFQUFHLHNCQUFzQixFQUFLLFFBQVEsRUFBRyxNQUFNLEVBQUUsY0FBYyxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsaUNBQWlDLEVBQUM7U0FDdkwsQ0FBQztRQUVGLHlCQUF5QjtRQUN6QixJQUFJLG9CQUFvQixHQUF3QjtZQUM5QyxHQUFHLEVBQUUsU0FBUztTQUNmLENBQUM7UUFFRixvQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRS9ELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==