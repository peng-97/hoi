import { Geometry } from "./index.js"
import { SimpleMarkerSymbol, PictureMarkerSymbol } from "../../index.js"
export class Point extends Geometry {
    x = null;
    y = null;
    type = Geometry.GeometryType.Point;
    constructor(point) {
        super()
        this.x = point[0];
        this.y = point[1]
    }

     draw(map, symbol) {
        let ctx = map.ctx;
       
        let projectPoint = map.projection.project([this.x, this.y])
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
                    ctx.drawImage(symbol.icon, matrix.a * projectPoint[0] + matrix.e - symbol.xoffset, matrix.d * projectPoint[1] + matrix.f - yoffset, symbol.width, symbol.height);
                } catch (ex) {
                    console.log(ex)
                }
            } else {
                ctx.lineWidth = symbol.outline.width;
                ctx.strokeStyle = symbol.outline.color;
                ctx.fillStyle = symbol.color;
                ctx.beginPath();
                let scx = matrix.a * projectPoint[0] + matrix.e - symbol.xoffset;
                let scy = matrix.d * projectPoint[1] + matrix.f - symbol.yoffset;
                console.log(scx,scy)
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

            // if (!symbol.picture) {
            //     symbol.loadImg();  //需要设置成同步
            // }
            // if (symbol.picture) {
            //     ctx.drawImage(symbol.picture, matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f, symbol.width, symbol.height);
             // }

    
             let matrix = ctx.getTransform();
             if (symbol.picture) {
                 ctx.save();
                 ctx.setTransform(1, 0, 0, 1, 0, 0);
                 ctx.drawImage(symbol.picture, matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f, symbol.width, symbol.height);
                 ctx.restore();
             }
             symbol.loadImg().then(res => {
                 if (res) {
                     ctx.save();
                     ctx.setTransform(1, 0, 0, 1, 0, 0);
                     ctx.drawImage(symbol.picture, matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f, symbol.width, symbol.height);
                     ctx.restore();
                 }
             })
        }
    
    }

}