import {Geometry} from  "./index.js"
export class Point extends Geometry{
        x=null;
        y = null;
        constructor(point) {
            super()
            this.x = point[0];
            this.y=point[1]
        }
        toMap(map) {
            let ctx = map.ctx;
            ctx.save();
            ctx.lineWidth = 10;
            ctx.strokeStyle = "#00FF00";
            ctx.fillStyle = "#0000FF";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, 0, Math.PI * 2, true)
            ctx.closePath();
            ctx.fill()
            ctx.stroke()
            ctx.restore();          
        }
}