import fs = require("fs");
import { StringUtils } from "./StringUtils";

/**
 * Won't actually write file if not different from original contens.
 * Important to prevent compiler from compiling everything again and showing all warnings...
 * @param filename 
 * @param new_contents 
 */
export function update_text_file(filename : string, new_contents : string){
  new_contents = StringUtils.normalizeLineEndingsTo(new_contents, "\r\n");
  update_file(filename, new_contents);
}

export function update_file(filename, new_contents){
  let outdated = true;
  if(fs.existsSync(filename)){
    let original_contents = fs.readFileSync(filename);
    if(original_contents == new_contents){
      outdated = false;
    }
  }

  if(outdated){
    console.log("file outdated and being WRITTEN: " + filename);
    fs.writeFileSync(filename, new_contents);
  } else {
    console.log("file didn't change, NOT writing: " + filename);
  }
  
}