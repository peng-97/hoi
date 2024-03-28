import { Geometry } from "./index.js"
import { SimpleMarkerSymbol, PictureMarkerSymbol } from "../index.js"
import { Bounds } from "./bound.js";
export class Point extends Geometry {
    x = null;
    y = null;
    coordinates= [];
    type = Geometry.GeometryType.Point;
    _pro_coordinates = [];
    constructor(point) {
        super()
        this.x = point[0];
        this.y = point[1];
        this.coordinates = point;
    }

     draw(ctx,map, symbol) {
         if (this.coordinates.length == 0) {
             return;
         }
         if (this._pro_coordinates.length == 0) {  //不用每次重新投影计算
             this._pro_coordinates = map.projection.project([this.x, this.y])
             this.bound=new Bounds([this._pro_coordinates[0],this._pro_coordinates[1]],[this._pro_coordinates[0],this._pro_coordinates[1]])
         }
         if (!map.bound.intersect(this.bound)) return;
    
        if (!symbol) {
            symbol = new SimpleMarkerSymbol()
        }
         
         if (symbol.type == "simple-marker") {
            
             ctx.save();
             let matrix = ctx.getTransform();
             ctx.setTransform(1, 0, 0, 1, 0, 0);
        
            if (symbol.icon) { //有图标片的话
                
                //xy偏移 正值 向上向下
                try {
                    ctx.drawImage(symbol.icon, matrix.a * this._pro_coordinates[0] + matrix.e - symbol.xoffset, matrix.d * this._pro_coordinates[1] + matrix.f - yoffset, symbol.width, symbol.height);
                } catch (ex) {
                    console.log(ex)
                }
            } else {
                ctx.lineWidth = symbol.outline.width;
                ctx.strokeStyle = symbol.outline.color;
                ctx.fillStyle = symbol.color;
                ctx.beginPath();
                let scx = matrix.a * this._pro_coordinates[0] + matrix.e - symbol.xoffset;
                let scy = matrix.d * this._pro_coordinates[1] + matrix.f - symbol.yoffset;
                // console.log(scx,scy)
                ctx.arc(scx, scy, symbol.size, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill()
            }
             ctx.stroke()
             ctx.restore();
        } else {
            if (!(symbol instanceof PictureMarkerSymbol)) {
                symbol = new PictureMarkerSymbol(symbol);
            }
             let matrix = ctx.getTransform();
             if (symbol.picture) {
                 ctx.save();
                 ctx.setTransform(1, 0, 0, 1, 0, 0);
                 ctx.drawImage(symbol.picture, matrix.a * this._pro_coordinates[0] + matrix.e, matrix.d * this._pro_coordinates[1] + matrix.f, symbol.width, symbol.height);
                 ctx.restore();
             }
             symbol.loadImg().then(res => {
                 if (res) {
                     ctx.save();
                     ctx.setTransform(1, 0, 0, 1, 0, 0);
                     ctx.drawImage(symbol.picture, matrix.a * this._pro_coordinates[0] + matrix.e, matrix.d * this._pro_coordinates[1] + matrix.f, symbol.width, symbol.height);
                     ctx.restore();
                 }
             })
        }
    
    }

}