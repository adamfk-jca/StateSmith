"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const StringUtils_1 = require("./StringUtils");
/**
 * Won't actually write file if not different from original contens.
 * Important to prevent compiler from compiling everything again and showing all warnings...
 * @param filename
 * @param new_contents
 */
function update_text_file(filename, new_contents) {
    new_contents = StringUtils_1.StringUtils.normalizeLineEndingsTo(new_contents, "\r\n");
    update_file(filename, new_contents);
}
exports.update_text_file = update_text_file;
function update_file(filename, new_contents) {
    let outdated = true;
    if (fs.existsSync(filename)) {
        let original_contents = fs.readFileSync(filename);
        if (original_contents == new_contents) {
            outdated = false;
        }
    }
    if (outdated) {
        console.log("file outdated and being WRITTEN: " + filename);
        fs.writeFileSync(filename, new_contents);
    }
    else {
        console.log("file didn't change, NOT writing: " + filename);
    }
}
exports.update_file = update_file;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZVV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRmlsZVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUJBQTBCO0FBQzFCLCtDQUE0QztBQUU1Qzs7Ozs7R0FLRztBQUNILDBCQUFpQyxRQUFpQixFQUFFLFlBQXFCO0lBQ3ZFLFlBQVksR0FBRyx5QkFBVyxDQUFDLHNCQUFzQixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4RSxXQUFXLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFIRCw0Q0FHQztBQUVELHFCQUE0QixRQUFRLEVBQUUsWUFBWTtJQUNoRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDcEIsRUFBRSxDQUFBLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLENBQUM7UUFDMUIsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQSxDQUFDLGlCQUFpQixJQUFJLFlBQVksQ0FBQyxDQUFBLENBQUM7WUFDcEMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNuQixDQUFDO0lBQ0gsQ0FBQztJQUVELEVBQUUsQ0FBQSxDQUFDLFFBQVEsQ0FBQyxDQUFBLENBQUM7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBQzVELEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEdBQUcsUUFBUSxDQUFDLENBQUM7SUFDOUQsQ0FBQztBQUVILENBQUM7QUFoQkQsa0NBZ0JDIn0=