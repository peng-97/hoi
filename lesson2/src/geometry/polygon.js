import { Geometry } from "./index.js";

export class Polygon extends Geometry{
    rings=[]
    constructor(polygon) {
        super()
        this.rings = polygon;
    }
    toMap(map) {
        let ctx = map.ctx;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00FF00";
        ctx.fillStyle = "#ff0000";

        this.rings.forEach(lines => {
            ctx.beginPath()
            lines.forEach((point, index) => {
                if (index == 0) {
                    ctx.moveTo(point[0], point[1])
                } else {
                    ctx.lineTo(point[0], point[1])
                }
            })
            ctx.closePath();
            ctx.fill("evenodd");
        })
        ctx.stroke()
        ctx.restore();
    }
}