import { Symbol } from "./symbol.js";
export class SimpleTextSymbol extends Symbol{
    lineWidth = 3;
    lineColor = "#ff0000"; //#ffffff
    text = "";//文字内容
    color="#ffffff"
    offsetX = 0;
    offsetY= 1;
    padding= 5;
    fontColor="#ff0000";
    fontSize=12;
    fontFamily= "YaHei";
    fontWeight = "Bold";
}