import { Geometry } from "./index.js";
import { SimpleFillSymbol } from "../symbol/simpleFillSymbol.js";
import { Bounds } from "./bound.js";
import { Ctx } from "../support/ctx.js";
export class Polygon extends Geometry {
    rings = []
    type = Geometry.GeometryType.Polygon;
    coordinates = []
    _pro_coordinates = [];
    screen = [];
    bound;
    constructor(polygon) {
        super()
        this.rings = polygon;
        this.coordinates = polygon;
    }
     //只有加载到地图上的时候才知道在哪
    draw(ctx, map, symbol) {
        let operList = [];
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
        operList.push(new Ctx(0, "lineWidth", symbol.outline.width))
        ctx.strokeStyle = symbol.outline.color;
        operList.push(new Ctx(0, "strokeStyle", symbol.outline.color))
        ctx.fillStyle = symbol.color;
        operList.push(new Ctx(0, "fillStyle", symbol.color))
        let matrix =map.matrix;
        ctx.beginPath()
        operList.push(new Ctx(1, "beginPath", null))
        let slines=[];//单面只有最外环
        this._pro_coordinates.forEach(line => {
            let sPoint= []
            line.forEach((point, index) => {
                let projectPoint = point;
                let scrrenPoint = [projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f];
                sPoint.push(scrrenPoint);
                if (index == 0) {
                    ctx.moveTo(scrrenPoint[0], scrrenPoint[1])
                    operList.push(new Ctx(1, "moveTo", [scrrenPoint[0], scrrenPoint[1]]))
                } else {
                    ctx.lineTo(scrrenPoint[0], scrrenPoint[1])
                    operList.push(new Ctx(1, "lineTo", [scrrenPoint[0], scrrenPoint[1]]))
                }

            })
            slines.push(sPoint)
        })
       
        this.screen = slines;//每次绘制都不一样
        ctx.closePath();
        operList.push(new Ctx(1, "closePath", null))
        ctx.fill("evenodd");
        operList.push(new Ctx(1, "fill", ["evenodd"]))
        ctx.stroke()
        operList.push(new Ctx(1, "stroke", null))
        ctx.restore();
    
        return operList;
    
    }

    //点是不是落在面内
    contains(screenX,screenY){
        const first = this.screen[0];
        const others = this.screen.slice(1);
        return this._pointInPolygon([screenX, screenY], first) && others.every(ring => !this._pointInPolygon([screenX, screenY], ring));
     
    }

    _pointInPolygon(point, vs) {
        let x = point[0], y = point[1];

        let inside = false;
        if (!vs || vs.length == 0) return inside;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i][0], yi = vs[i][1];
            let xj = vs[j][0], yj = vs[j][1];

            let intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };
  
    /**
     *  @returns 地理坐标的中心  有孔的话只用第一个外环，内部也影响不到  
     * 来自leaflet
     */
    getCenter() {
        let i, j, p1, p2, f, area, x, y, center,
            points = this.coordinates[0],
            len = points.length;
        if (!len) { return null; }
        // polygon centroid algorithm; only uses the first ring if there are multiple
        area = x = y = 0;
        for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];

            f = p1[1] * p2[0] - p2[1] * p1[0];
            x += (p1[0] + p2[0]) * f;
            y += (p1[1] + p2[1]) * f;
            area += f * 3;
        }
        if (area === 0) {
            // Polygon is so small that all points are on same pixel.
            center = points[0];
        } else {
            center = [x / area, y / area];
        }
        return center;
    }
}