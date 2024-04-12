import { Geometry } from "./index.js";
import { Bounds } from "./bound.js";
import { SimpleLineSymbol } from "../symbol/simpleLineSymbol.js";
export class MultiPolyline extends Geometry {
    type = Geometry.GeometryType.MultiPolyline;
    coordinates = [];
    _pro_coordinates = [];
    bound;
    screen = [];
    durance = 5;
    _distance = this.durance;
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
        let matrix = map.matrix;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let sLines = []
        this.coordinates.forEach(lines => {
            ctx.beginPath()
            let sPoints = [];
            lines.forEach((point, index) => {
                let projectPoint = map.projection.project(point)
                let sPoint = [projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f];
                if (index == 0) {
                    ctx.moveTo(sPoint[0], sPoint[1])

                } else {
                    ctx.lineTo(sPoint[0], sPoint[1])
                }
                sPoints.push(sPoint)
            })
            this.screen.push(sLines);
            ctx.stroke()
            sLines.push(sPoints);
        })
       
            this.screen = sLines;
        
        ctx.restore();
    }
    contains(screenX, screenY) {
        return this.screen.every(sLines => {
            let p2;
            return sLines.reduce((acc, cur) => {
                if (p2) {
                    const p1 = p2;
                    p2 = cur;
                    return Math.min(acc, this._distanceToSegment([screenX, screenY], p1, p2));
                } else {
                    p2 = cur;
                    return acc;
                }
            }, Number.MAX_VALUE)<=this._distance;
        })
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
            points = this.coordinates[0],//第一条
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