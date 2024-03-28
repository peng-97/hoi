import { Symbol } from "./symbol.js";
export class SimpleLineSymbol extends Symbol{
    color = "#FF0000";//线条颜色 默认红色
    width = 5;//线条宽度
    type = "simple-line"
    style = "solid";//线条样式
    constructor(options) {
        super();
        if ( options instanceof Object) {

            this.color = options.color ? options.color : this.color;
            this.width = options.width ? options.width : this.width;
            this.style = options.style ? options.style : this.style;
        }
     }
}