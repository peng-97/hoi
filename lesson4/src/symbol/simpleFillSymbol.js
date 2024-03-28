import { SimpleLineSymbol } from "./simpleLineSymbol.js";
import { Symbol } from "./symbol.js";
export class SimpleFillSymbol extends Symbol{
    color="#0000FF";//面的填充色 //默认蓝色
    outline;//面的线条颜色
    type = "simple-fill";
    style = 'solid';
    constructor(options) {
        super();
        if (options && options instanceof Object) {
            this.color = options.color ? options.color : this.color;
            if (options.outline) {
                if (options.outline instanceof SimpleLineSymbol) {
                    this.outline = this.outline;
                } else {
                    this.outline = new SimpleLineSymbol(options.outline);
                 }
            } else {
                this.outline = new SimpleLineSymbol();
            }
        
        }
    }
}