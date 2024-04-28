import { Symbol } from "./symbol.js"
import { Color } from "../support/Color.js";
export class ClusterSymbol extends Symbol {
    radius = 15;//聚合圈的半径
    fontColor = "#000000";//字体颜色
    fontFamily = "YaHei";
    fontSize = 8;
    fontWeight = "Bold";
    color = "#FFA500";//内部颜色
    warpColor = "#FFFFFF";//外部颜色
    lineWidth = 2;
    count;//聚合图文字数量显示
    //色带
    startColor = "#19caad";
    endColor = "#f4606c";
    maxCount = 100;//超出这个范围用一个概述表示
    cirleSame = false;//是否所有圆圈保持同等大小，字体也保持永登大小
    colors = [];//颜色渐变
    constructor(optines = {}) {
        super()
        this.colors = Color.ramp(Color.fromHex(this.startColor), Color.fromHex(this.endColor),10);//
        //
    }

    getInnerColor(count) {
        if (count >= this.maxCount) {
            return this.colors[9].toString();
        } else {
            return this.colors[Math.floor(count / (this.maxCount/10))].toString()
        }
    }
    /**
     * 计算当前数量下半径是多少
     */
    getRadius(count) {
        if (this.cirleSame) {
            return this.radius;
        }
        if (count >= this.maxCount) {
            return this.radius+10
        } else {
            return count / (this.maxCount/10) + this.radius;
        }
    }

    getCount(count) {
        return count < this.maxCount ? count.toString() : this.maxCount - 1 + "+";
    }

    /**
     * 计算字体大小
     * @param {*} count 
     */
    getfontSize(count) {
        if (this.cirleSame) {
           return  this.fontSize+4;
        }
        if (count >= this.maxCount) {
            return this.fontSize + 10;
        } else {
            if (count > this.maxCount) {
                return this.fontSize + 10;
            } else {
                return this.fontSize + count / (this.maxCount / 10);
            }
        }
    }

    setMaxCount(count) {
        this.maxCount = count;
    }
}