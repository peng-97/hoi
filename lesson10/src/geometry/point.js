import { Geometry } from "./index.js"
import { SimpleMarkerSymbol, SimplePointSymbol } from "../index.js"
import { Bounds } from "./bound.js";
export class Point extends Geometry {
    x = null;
    y = null;
    coordinates = [];
    type = Geometry.GeometryType.Point;
    _pro_coordinates = [];
    screen = [];
    _distance = 0;//外边距的距离
    bound;
    constructor(point) {
        super()
        this.x = point[0];
        this.y = point[1];
        this.coordinates = point;
    }
    draw(ctx, map, symbol) {
        let listPara = [];
        if (this.coordinates.length == 0) {
            return;
        }
        if (this._pro_coordinates.length == 0) {  //不用每次重新投影计算
            this._pro_coordinates = map.projection.project([this.x, this.y])
            this.bound = new Bounds([this._pro_coordinates[0], this._pro_coordinates[1]], [this._pro_coordinates[0], this._pro_coordinates[1]])
        }
        if (!map.bound.intersect(this.bound)) return;

        if (!symbol) {
            symbol = new SimplePointSymbol()
        }

        if (symbol.type == "simple-point") {

            ctx.save();
            let matrix = ctx.getTransform();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.lineWidth = symbol.outline.width;
            ctx.strokeStyle = symbol.outline.color;
            ctx.fillStyle = symbol.color;
            ctx.beginPath();
            this.screen = [matrix.a * this._pro_coordinates[0] + matrix.e - symbol.xoffset, matrix.d * this._pro_coordinates[1] + matrix.f - symbol.yoffset];
            this._distance = symbol.size + ctx.lineWidth;
            ctx.arc(this.screen[0], this.screen[1], symbol.size, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill()
            ctx.stroke()
            ctx.restore();
        } else {
            if (!(symbol instanceof SimpleMarkerSymbol)) {
                symbol = new SimplePointSymbol(symbol);
            }
            let matrix = ctx.getTransform(); 
            this._distance = Math.max(symbol.width, symbol.height);
            if (symbol.picture) {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.screen = [matrix.a * this._pro_coordinates[0] + matrix.e, matrix.d * this._pro_coordinates[1] + matrix.f];
                ctx.drawImage(symbol.picture, this.screen[0], this.screen[1], symbol.width, symbol.height);
                ctx.restore();
            }
            symbol.loadImg().then(res => {
                if (res) {
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    this.screen = [matrix.a * this._pro_coordinates[0] + matrix.e, matrix.d * this._pro_coordinates[1] + matrix.f];
                    ctx.drawImage(symbol.picture, this.screen[0], this.screen[1], symbol.width, symbol.height);
                    ctx.restore();
                }
            })
        }

    }

    /**
     * 判断点是否在点内，marker使用  width*heidth, simple使用 size
     */
    contains(screenX, screenY) {
         return  Math.sqrt((this.screen[0] - screenX) * (this.screen[0] - screenX) + (this.screen[1] - screenY) * (this.screen[1]- screenY))<=this._distance;
    }


    getCenter() {
        return this.coordinates;
    }
}