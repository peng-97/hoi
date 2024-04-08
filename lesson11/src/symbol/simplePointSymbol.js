import { Symbol } from "./symbol.js";
import { SimpleLineSymbol } from "./simpleLineSymbol.js";
/**
 * marker 一般用于点
 */
export class SimplePointSymbol extends Symbol {
    color = "#00FF00";//默认绿色
    outline = '';//线条
    size = 8;
    xoffset = 0;//x偏移
    yoffset = 0; //偏移
    type = "simple-point"
    constructor(options) {
        super()
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
            this.size = options.size ? options.size : this.size;
            this.xoffset = options.xoffset ? options.xoffset : this.xoffset;
            this.yoffset = options.yoffset ? options.yoffset : this.yoffset;
        }
    }
}
