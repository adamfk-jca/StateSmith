"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function indent(input, char, charTimes) {
    let result = input;
    result = input.replace(/(\r\n|\r|\n)|^/g, "$1" + char.repeat(charTimes)); //TODOLOW escape replace text
    return result;
}
exports.indent = indent;
function shallowCopyInto(into, from) {
    for (var key in from) {
        let property = from[key];
        //if(from.hasOwnProperty(key)){
        if (typeof property !== "function") {
            into[key] = property;
        }
    }
    return into;
}
exports.shallowCopyInto = shallowCopyInto;
function removeFromArray(arr, toRemove) {
    let deleteIndex = arr.indexOf(toRemove);
    if (deleteIndex < 0) {
        console.log(toRemove);
        throw "Failed to delete!";
    }
    arr.splice(deleteIndex, 1);
}
exports.removeFromArray = removeFromArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlzYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1pc2MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSxnQkFBdUIsS0FBYyxFQUFFLElBQWEsRUFBRSxTQUFrQjtJQUN0RSxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDbkIsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLDZCQUE2QjtJQUN2RyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFKRCx3QkFJQztBQUVELHlCQUFtQyxJQUFRLEVBQUcsSUFBTztJQUNuRCxHQUFHLENBQUEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO1FBQ25CLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QiwrQkFBK0I7UUFDL0IsRUFBRSxDQUFBLENBQUMsT0FBTyxRQUFRLEtBQUssVUFBVSxDQUFDLENBQUEsQ0FBQztZQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ3ZCLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUM7QUFURCwwQ0FTQztBQUVELHlCQUFtQyxHQUFPLEVBQUUsUUFBVTtJQUNwRCxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXhDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsTUFBTSxtQkFBbUIsQ0FBQztJQUM1QixDQUFDO0lBRUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQVRELDBDQVNDIn0=