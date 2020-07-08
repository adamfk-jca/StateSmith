"use strict";
/*

*/
Object.defineProperty(exports, "__esModule", { value: true });
const StringUtils_1 = require("../ts-utils/StringUtils");
const fs_1 = require("fs");
class StateTsExporter {
    constructor() {
        /**
         * if true, it will use the shortest possible name that uniquely identifies a state.
         * if false, the name for a state will be the full path.
         *
         * There are advantages to both, but shorter names can make source diagrams easier
         * to read and git diff. It is also has the benefit of being more immune to renaming
         * of parent states far up the change. If full path used and top most state renamed,
         * then you may have 100 states show up with changes in git diff which makes it very
         * difficult to see any other changes.
         */
        this.useShortUniqueNames = true;
        /** primarily used for anonymizing a structure before posting online */
        this.useIdsAsNames = false;
        this.shortUniqueNames = new Map();
    }
    getShortUniqueName(state) {
        let name = this.shortUniqueNames.get(state);
        if (name == null) {
            throw "No state found. make sure to preprocess.";
        }
        return name;
    }
    /**
     * Builds name by ascending up ancestry
     * @param state
     * @param maxLength
     */
    getUpwardChainName(state, maxLength) {
        let chainName = state.label;
        let curState = state;
        let count = 0;
        while (count < maxLength && curState.parent != null) {
            count++;
            curState = curState.parent;
            chainName = curState.label + "." + chainName; //can't use "__" as plant uml uses that to create __underlines__.
        }
        return chainName;
    }
    /**
     *
     * @param state
     */
    preProcess(inputStates, upwardLength) {
        let leafNames = new Map();
        for (let state of inputStates) {
            let label = this.getUpwardChainName(state, upwardLength);
            let states = leafNames.get(label) || [];
            states.push(state);
            leafNames.set(label, states);
        }
        for (let [key, states] of leafNames) {
            if (states.length == 1) {
                this.shortUniqueNames.set(states[0], key);
            }
            else if (states.length > 1) {
                //we have a conflict. recurse upwards until unique names generated.
                this.preProcess(states, upwardLength + 1);
            }
            else {
                throw "programming mistake...";
            }
        }
    }
    /** mostly copied from StateGen.ts */
    getStateFullName(state, separator = ".") {
        let output = "";
        let cur = state;
        let sep = "";
        while (cur != null) {
            let prepend = "";
            prepend = cur.label.toUpperCase();
            prepend += sep;
            output = prepend + output;
            sep = separator;
            cur = cur.parent;
        }
        return output;
    }
    getShownName(state) {
        let shownName = state.label;
        if (this.useIdsAsNames) {
            shownName = "State " + state.outputId;
        }
        return shownName;
    }
    /**
     *
     * @param resultArray
     * @param startingState
     */
    addStatesRecursivelyFrom(resultArray, startingState) {
        resultArray.push(startingState);
        for (let kid of startingState.kids) {
            this.addStatesRecursivelyFrom(resultArray, kid);
        }
        return resultArray;
    }
    /**
     * {
     *    root:{
     *    },
     *    uniqueNameStates:{
     *    }
     * }
     * @param hsm
     */
    buildOutput(startingState, smName) {
        //let allStates = this.addStatesRecursivelyFrom([], startingState);
        // this.preProcess(allStates, 0); for unique names
        let inner = this.renderSub(startingState);
        inner = StringUtils_1.StringUtils.indent(inner, "  ");
        inner = inner.replace(/[ \t]+$/, "");
        let output = fs_1.readFileSync(__dirname + "/views/doc-content/states/template.ts").toString();
        output += `\nexport const ${smName} = {\n`;
        output += inner;
        output += "};";
        return output;
    }
    /**
     *
     * @param input
     */
    escape(input) {
        return input.replace(/(\r\n|\r|\n)/g, "\\n");
    }
    getUniqueName(state) {
        let result;
        if (this.useIdsAsNames) {
            return `State_${state.outputId}`;
        }
        if (this.shortUniqueNames) {
            result = this.getShortUniqueName(state);
        }
        else {
            result = this.getStateFullName(state);
        }
        return result;
    }
    renderSub(state) {
        let output = "";
        let inner = "";
        inner += `getFc : getFullPathCode,\n`;
        inner += `getSc : getShortPathCode,\n`;
        for (let kid of state.kids) {
            inner += this.renderSub(kid);
        }
        if (inner) {
            inner = StringUtils_1.StringUtils.indent(inner, "  ");
            inner = inner.replace(/[ \t]+$/, "");
        }
        output = `${state.label} : {\n`;
        output += inner;
        output += "},\n";
        return output;
    }
}
exports.StateTsExporter = StateTsExporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVUc0V4cG9ydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU3RhdGVUc0V4cG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7RUFFRTs7QUFLRix5REFBc0Q7QUFDdEQsMkJBQWtDO0FBSWxDO0lBQUE7UUFFRTs7Ozs7Ozs7O1dBU0c7UUFDSCx3QkFBbUIsR0FBRyxJQUFJLENBQUM7UUFFM0IsdUVBQXVFO1FBQ3ZFLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBRXRCLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO0lBa0w5QyxDQUFDO0lBaExDLGtCQUFrQixDQUFDLEtBQWE7UUFDOUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU1QyxFQUFFLENBQUEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBQztZQUNmLE1BQU0sMENBQTBDLENBQUM7UUFDbkQsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILGtCQUFrQixDQUFDLEtBQWEsRUFBRSxTQUFrQjtRQUNsRCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzVCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxPQUFNLEtBQUssR0FBRyxTQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUNsRCxLQUFLLEVBQUUsQ0FBQztZQUNSLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzNCLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQyxpRUFBaUU7UUFDakgsQ0FBQztRQUVELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVEOzs7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