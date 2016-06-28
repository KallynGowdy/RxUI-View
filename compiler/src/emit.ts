import transform from "./transform";
import * as escodegen from "escodegen";

export default function (tree: ESTree.Program): string {
    return escodegen.generate(transform(tree));
}