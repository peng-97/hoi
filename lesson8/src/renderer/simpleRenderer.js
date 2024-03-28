import { Renderer } from "./renderer.js"
import { Symbol } from "../symbol/symbol.js";
export class SimpleRenderer extends Renderer{
    type = "simple";
    symbol;
    constructor(options={}) {
        super();
        this.symbol = options.symbol ? options.symbol : new Symbol();//默认值
    }
}