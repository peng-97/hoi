import { Geometry } from "./index.js";

export class Polygon extends Geometry {
    rings = []
    constructor(polygon) {
        super()
        this.rings = polygon;
    }

    add(map) {
        let ctx = map.ctx;
        ctx.save();
     
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00FF00";
        ctx.fillStyle = "#ff0000";
        let matrix = map.ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.rings.forEach(lines => {
            ctx.beginPath()
            lines.forEach((point, index) => {
                let projectPoint=map.projection.project(point)
                if (index == 0) {
                    ctx.moveTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] + matrix.d + matrix.f)
                } else {
                    ctx.lineTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] + matrix.d + matrix.f)
                }
            })
            ctx.closePath();
            ctx.fill("evenodd");
        })
        ctx.stroke()
        ctx.restore();
    }
}