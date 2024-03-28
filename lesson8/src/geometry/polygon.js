import { Geometry } from "./index.js";
import { SimpleFillSymbol } from "../symbol/simpleFillSymbol.js";
import { Bounds } from "./bound.js";
export class Polygon extends Geometry {
    rings = []
    type = Geometry.GeometryType.Polygon;
    coordinates = []
    _pro_coordinates = [];
    constructor(polygon) {
        super()
        this.rings = polygon;
        this.coordinates = polygon;
    }

    draw(ctx,map, symbol) {
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
        if (!(symbol instanceof SimpleFillSymbol)) {
            symbol = new SimpleFillSymbol(symbol);
        }
        ctx.lineWidth = symbol.outline.width;
        ctx.strokeStyle = symbol.outline.color;
        ctx.fillStyle =symbol.color;
        let matrix = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath()
        this._pro_coordinates.forEach(lines => {
            lines.forEach((point, index) => {
                let projectPoint = point
                if (index == 0) {
                    ctx.moveTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f)

                } else {
                    ctx.lineTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f)
                }
            })
        })
        ctx.closePath();
        ctx.fill("evenodd");
        ctx.stroke()
        ctx.restore();
    }
}