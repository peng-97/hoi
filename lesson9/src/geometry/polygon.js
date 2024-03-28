import { Geometry } from "./index.js";
import { SimpleFillSymbol } from "../symbol/simpleFillSymbol.js";
import { Bounds } from "./bound.js";
import { pointAsidePolygon } from "../turf/aside.js"
export class Polygon extends Geometry {
    rings = []
    type = Geometry.GeometryType.Polygon;
    coordinates = []
    _pro_coordinates = [];
    screen = [];

    constructor(polygon) {
        super()
        this.rings = polygon;
        this.coordinates = polygon;
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
        if (!(symbol instanceof SimpleFillSymbol)) {
            symbol = new SimpleFillSymbol(symbol);
        }
        ctx.lineWidth = symbol.outline.width;
        ctx.strokeStyle = symbol.outline.color;
        ctx.fillStyle = symbol.color;
        let matrix = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath()
        let slines=[];//单面只有最外环
        this._pro_coordinates.forEach(line => {
            let sPoint= []
            line.forEach((point, index) => {
                let projectPoint = point;
                let scrrenPoint = [projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f];
                sPoint.push(scrrenPoint);
                if (index == 0) {
                    ctx.moveTo(scrrenPoint[0], scrrenPoint[1])
                } else {
                    ctx.lineTo(scrrenPoint[0], scrrenPoint[1])
                }

            })
            slines.push(sPoint)
        })
       
        this.screen = slines;//每次绘制都不一样
    
        ctx.closePath();
        ctx.fill("evenodd");
        ctx.stroke()
        ctx.restore();
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
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i][0], yi = vs[i][1];
            let xj = vs[j][0], yj = vs[j][1];

            let intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };
}