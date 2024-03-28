import { Geometry } from "./index.js";
import { Bounds } from "./bound.js";
import { SimpleLineSymbol } from "../symbol/simpleLineSymbol.js";
export class MultiPolyline extends Geometry {
    type = Geometry.GeometryType.MultiPolyline;
    coordinates = [];
    _pro_coordinates = [];
    bound
    constructor(multiPolyline) {
        super();
        this.coordinates = multiPolyline
    }
    draw(ctx, map, symbol) {
        if (this.coordinates.length == 0) return;
        if (this._pro_coordinates.length == 0) {
            let xMin, xMax, yMin, yMax;
            this._pro_coordinates = this.coordinates.map(lines => lines.map((point, index) => {
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
            }))
            this.bound = new Bounds([xMin, yMin], [xMax, yMax])
        }
        if (!map.bound.intersect(this.bound)) return;
        ctx.save();
        if (!(symbol instanceof SimpleLineSymbol)) {
            symbol = new SimpleLineSymbol(symbol);
        }
        ctx.lineWidth = symbol.width;
        // 设置直线的颜色
        ctx.strokeStyle = symbol.color;
        let matrix = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.coordinates.forEach(lines => {
            ctx.beginPath()
            lines.forEach((point, index) => {
                let projectPoint = map.projection.project(point)
                if (index == 0) {
                    ctx.moveTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f)

                } else {
                    ctx.lineTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f)
                }
            })
            ctx.stroke()
        })
        ctx.restore();
    }
}