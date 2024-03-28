import {Geometry} from  "./index.js"
export class Point extends Geometry{
        x=null;
        y = null;
        constructor(point) {
            super()
            this.x = point[0];
            this.y=point[1]
        }
        
        add(map) {
            let ctx = map.ctx;
            ctx.save();
            let projectPoint=map.projection.project([this.x,this.y])
            // ctx.lineWidth = 100;
            ctx.strokeStyle = "#ff0000";
            ctx.fillStyle = "#ff0000";
            ctx.beginPath();
            let matrix = ctx.getTransform();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.arc(matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f, 5, 0, Math.PI * 2, true);
            // ctx.closePath();
            ctx.fill()
            ctx.stroke()
            ctx.restore();



        }
}