import { Geometry } from "./index.js";
import { SimpleFillSymbol } from "../symbol/simpleFillSymbol.js";
export class MultiPolygon extends Geometry {
    rings = []
    type = Geometry.GeometryType.MultiPolygon;
    constructor(polygon) {
        super()
        this.rings = polygon;
    }

    draw(map, symbol) {
        let ctx = map.ctx;
        ctx.save();
        if (!(symbol instanceof SimpleFillSymbol)) {
            symbol = new SimpleFillSymbol(symbol);
        }
        ctx.lineWidth = symbol.outline.width;
        ctx.strokeStyle = symbol.outline.color;
        ctx.fillStyle = symbol.color;
        let matrix = map.ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.rings.forEach(pols => {
            ctx.beginPath()
            pols.forEach(lines => {
                lines.forEach((point, index) => {
                    let projectPoint = map.projection.project(point)
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
        })
        ctx.restore();
    }
}