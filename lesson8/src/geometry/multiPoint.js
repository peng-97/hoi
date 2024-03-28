import { Geometry } from "./index.js";
export class MultiPoint extends Geometry{
    type = Geometry.GeometryType.MultiPoint;
    coordinates = [];
    _pro_coordinates = [];
    bound;//数据的四至范围
    constructor(multiPoint) {
        super();
        this.coordinates = multiPoint;
    }
    draw(ctx, map, symbol) {
        if (this.coordinates.length == 0) return;
        if (this._pro_coordinates.length == 0) {
            if (this._pro_coordinates.length == 0) {
                let xMin, xMax, yMin, yMax;
                this._pro_coordinates = this.coordinates.map((point, index) => {
                    let pPoint = map.projection.project(point);
                    if (index == 0) {
                        xMax = xMin = pPoint[0];
                        yMax = yMin = pPoint[1];
                    } else {
                        yMin = Math.min(yMin, pPoint[1])
                        yMax = Math.max(yMax, pPoint[1])
                        xMin = Math.min(xMin, pPoint[0])
                        xMax = Math.max(xMax, pPoint[0])
                    }
                    return pPoint;
                })
                this.bound = new Bounds([xMin, yMin], [xMax, yMax])
            }
        }
        if (!map.bound.intersect(this.bound)) return;
        if (!symbol) {
            symbol = new SimpleMarkerSymbol()
        }
        this._pro_coordinates.forEach(point => {
            let projectPoint = point;
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
        })
    }
    

}