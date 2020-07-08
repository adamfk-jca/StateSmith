
/**
 * Interface that allows specifying types for when using a JS object like a hash map
 */
export interface IHashString<T> {
  [index: string] : T; //https://www.typescriptlang.org/docs/handbook/interfaces.html see `Indexable Types` or `index signatures`
} 

export function indent(input : string, char : string, charTimes : number) : string {
  let result = input;
  result = input.replace(/(\r\n|\r|\n)|^/g, "$1" + char.repeat(charTimes)); //TODOLOW escape replace text
  return result;
}

export function shallowCopyInto<T>(into : T , from: T) : T{
  for(var key in from){
    let property = from[key];
    //if(from.hasOwnProperty(key)){
    if(typeof property !== "function"){  //don't copy over functions
      into[key] = property;
    }
  }
  return into;
}

export function removeFromArray<T>(arr:T[], toRemove:T) {
  let deleteIndex = arr.indexOf(toRemove);

  if (deleteIndex < 0) {
    console.log(toRemove);
    throw "Failed to delete!";
  }

  arr.splice(deleteIndex, 1);
}