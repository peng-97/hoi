import { Geometry } from "./index.js"
export class Polyline extends Geometry {
    polyline
    constructor(polyline) {
        super()
        this.polyline = polyline;
    }
    add(map) {
        let ctx = map.ctx;
        ctx.save();
        // 设置直线的宽度
        ctx.lineWidth = 2
        // 设置直线的颜色
        ctx.strokeStyle = 'black'
        ctx.beginPath()
        //将地球展示到平面上 比例尺会非常小，为了显示线条所以需要将线的宽度调整到很大才能正常显示，可以将canvas社会造成正常比例，然后调整坐标值即可，就像正常显示一般大小就可以
        let matrix = ctx.getTransform();

        //不做变换   需要将线的大小设置很大才可以
        // ctx.lineWidth = 1000
        // this.polyline.forEach((point, index) => {
        //     let projectPoint = map.projection.project(point);//投影后的值 
        //     if (index == 0) {
        //         ctx.moveTo(projectPoint[0] , projectPoint[1])
        //     } else {
        //         ctx.lineTo(projectPoint[0] , projectPoint[1] )
        //     }
        // });
        
        //做变换  基于原始矩阵上绘制将平面坐标转为屏幕上用的坐标
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        this.polyline.forEach((point, index) => {
            let projectPoint = map.projection.project(point) //投影后的值 
            if (index == 0) {
                ctx.moveTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f)
             
            } else {
                ctx.lineTo(projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d+ matrix.f )
            }
        });
        ctx.stroke()
        ctx.restore();
    }
}