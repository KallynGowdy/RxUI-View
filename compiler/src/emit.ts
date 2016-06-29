import {transform, TransformOptions, defaultTransformOptions} from "./transform";
import * as escodegen from "escodegen";

export default function (tree: ESTree.Program, options?: TransformOptions): string {
    return escodegen.generate(transform(tree, options));
}