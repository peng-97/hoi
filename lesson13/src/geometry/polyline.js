import { Geometry } from "./index.js"
import { SimpleLineSymbol } from "../symbol/simpleLineSymbol.js"
import { Bounds } from "./bound.js";
export class Polyline extends Geometry {
    coordinates = [];
    type = Geometry.GeometryType.Polyline;
    _pro_coordinates = [];
    bound;
    screen = [];//屏幕信息
    durance = 5;
    _distance = this.durance;
    constructor(polyline) {
        super()
        this.coordinates = polyline;
    }
    draw(ctx, map, symbol) {
        if (this.coordinates.length == 0) return;
        if (this._pro_coordinates.length == 0) {
            let xMin, xMax, yMin, yMax;
            this._pro_coordinates = this.coordinates.map((point,index) => {
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
            this.bound=new Bounds([xMin,yMin],[xMax,yMax])
        }
        if (!map.bound.intersect(this.bound)) return;
        ctx.save();
        // 设置直线的宽度
        if (!(symbol instanceof SimpleLineSymbol)) {
            symbol = new SimpleLineSymbol(symbol);
        }
        this._distance = this.durance + symbol.width;
        ctx.lineWidth = symbol.width;
        // 设置直线的颜色
        ctx.strokeStyle = symbol.color;
        ctx.beginPath()
        //将地球展示到平面上 比例尺会非常小，为了显示线条所以需要将线的宽度调整到很大才能正常显示，可以将canvas社会造成正常比例，然后调整坐标值即可，就像正常显示一般大小就可以
        let matrix =map.matrix;
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
      

        let sPoints = [];
        this._pro_coordinates.forEach((point, index) => {
            let projectPoint = point //投影后的平面 
            let scrrenPoint = [projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f];
            sPoints.push(scrrenPoint);
            if (index == 0) {
                ctx.moveTo(scrrenPoint[0], scrrenPoint[1])
            } else {
                ctx.lineTo(scrrenPoint[0], scrrenPoint[1])
            }
        });
     
        this.screen=sPoints;
        
        ctx.stroke()
        ctx.restore();
    }

    contains(screenX, screenY) {
        let p2;
        const distance = this.screen.reduce((acc, cur) => {
            if (p2) {
                const p1 = p2;
                p2 = cur;
                return Math.min(acc, this._distanceToSegment([screenX, screenY], p1, p2));
            } else {
                p2 = cur;
                return acc;
            }
        }, Number.MAX_VALUE);
        return distance <= this._distance;
    }
    //from Leaflet
    //点到线段的距离，垂直距离
    _distanceToSegment(p, p1, p2) {
        let x = p1[0],
            y = p1[1],
            dx = p2[0] - x,
            dy = p2[1] - y,
            dot = dx * dx + dy * dy,
            t;
        if (dot > 0) {
            t = ((p[0] - x) * dx + (p[1] - y) * dy) / dot;

            if (t > 1) {
                x = p2[0];
                y = p2[1];
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        dx = p[0] - x;
        dy = p[1] - y;
        return Math.sqrt(dx * dx + dy * dy);
    }



    getCenter() {
        let i, halfDist, segDist, dist, p1, p2, ratio,
            points = this.coordinates,
            len = points.length;

        if (!len) { return null; }

        // polyline centroid algorithm; only uses the first ring if there are multiple

        for (i = 0, halfDist = 0; i < len - 1; i++) {
            halfDist += Math.sqrt((points[i + 1][0] - points[i][0]) * (points[i + 1][0] - points[i][0]) + (points[i + 1][1] - points[i][1]) * (points[i + 1][1] - points[i][1])) / 2;
        }

        let center;
        // The line is so small in the current view that all points are on the same pixel.
        if (halfDist === 0) {
            center = points[0];
        }

        for (i = 0, dist = 0; i < len - 1; i++) {
            p1 = points[i];
            p2 = points[i + 1];
            segDist = Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
            dist += segDist;

            if (dist > halfDist) {
                ratio = (dist - halfDist) / segDist;
                center = [
                    p2[0] - ratio * (p2[0] - p1[0]),
                    p2[1] - ratio * (p2[1] - p1[1])
                ];
            }
        }
        return center;
    }
}