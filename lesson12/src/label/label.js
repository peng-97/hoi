import { SimpleTextSymbol } from "../symbol/simpleTextSymol.js";
import { Bounds } from "../geometry/bound.js";
import { CoverCollision } from "./collsion/coverCollision.js";
export class Label{
    symbol = new SimpleTextSymbol();
    field;
    collision=new CoverCollision();//label默认采用掩盖检测
    /**
     * 更具要素获取标注的范围,当要素加入图层之后，才能计算出来
     * @param {} feature 
     */
    getBounds(feature) {
        this.symbol.text = feature.properties[this.field.name];//标注的文本
        if (!this.field && !this.symbol.text && !feature.layer) {
              return null
        }
        let symbol = this.symbol;
        let ctx = feature.layer.ctx;
        ctx.save();
        ctx.font = this.symbol.fontSize + "px/1 " + this.symbol.fontFamily + " " + this.symbol.fontWeight;
        const center =feature.geometry.getCenter();//获取当前要素中心
        const matrix = feature.layer.map.matrix;
        //keep pixel
      
        const array = this.symbol.text.split("/r/n");
        let widths = array.map(str => ctx.measureText(str).width + symbol.padding * 2);
        let width = Math.max(...widths);
        let height = symbol.fontSize * array.length + this.symbol.padding * 2 + this.symbol.padding * (array.length - 1);
        const screenX = (matrix.a * center[0] + matrix.e);
        const screenY = (matrix.d * center[1] + matrix.f);
        ctx.restore();
        return new Bounds([screenX + symbol.offsetX - symbol.padding, screenY + symbol.offsetY - symbol.padding], [screenX + symbol.offsetX - symbol.padding + width, screenY + symbol.offsetY - symbol.padding + height]);
    }

     /**
      * 绘制的要素，感觉label应该算是特殊的图形，文本的图形,要在要素绘制之后再绘制标注
      */
    draw(feature) {
        if (!this.field) return;
        let text = feature.properties[this.field.name];//标注的文本
        if (!text) return;
        let ctx = feature.layer.ctx;
        ctx.save();
        let symbol = this.symbol;
        
        ctx.strokeStyle = symbol.lineColor;
        ctx.fillStyle = symbol.color;
        ctx.lineWidth = symbol.lineWidth;
        ctx.lineJoin = "round";
        ctx.font = symbol.fontSize + "px/1 " + symbol.fontFamily + " " + symbol.fontWeight;
        const center =feature.geometry.getCenter();
        const matrix = feature.layer.map.matrix;
        //keep pixel
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const array = text.split("/r/n");
        let widths = array.map(str => ctx.measureText(str).width + symbol.padding * 2);
        let width = Math.max(...widths);
        let height = symbol.fontSize * array.length + symbol.padding * 2 + symbol.padding * (array.length - 1);
        const screenX = (matrix.a * center[0] + matrix.e);
        const screenY = (matrix.d * center[1] + matrix.f);
        ctx.strokeRect(screenX + symbol.offsetX - symbol.padding, screenY + symbol.offsetY - symbol.padding, width, height);
        ctx.fillRect(screenX + symbol.offsetX - symbol.padding, screenY + symbol.offsetY - symbol.padding, width, height);
        ctx.textBaseline = "top";
        ctx.fillStyle = symbol.fontColor;

        array.forEach((str, index) => {
            ctx.fillText(str, screenX + symbol.offsetX + (width - widths[index]) / 2, screenY + symbol.offsetY + index * (symbol.fontSize + symbol.padding));
        });
        ctx.restore();
    };
}