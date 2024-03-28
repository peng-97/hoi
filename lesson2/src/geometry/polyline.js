import { Geometry } from "./index.js"
export class Polyline extends Geometry{
    polyline
    constructor(polyline) {
        super()
        this.polyline = polyline;
    }
    toMap(map) {
        let ctx = map.ctx;
        ctx.save();
        // 设置直线的宽度
        ctx.lineWidth = 2
        // 设置直线的颜色
        ctx.strokeStyle = 'black'
        ctx.beginPath()
        this.polyline.forEach((point, index) => {
            if (index == 0) {
                ctx.moveTo(point[0], point[1])
            } else {
                ctx.lineTo(point[0], point[1])
            }

        });
        ctx.stroke()
        ctx.restore();
    }
}