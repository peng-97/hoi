import { Geometry } from "./index.js";
import { SimpleFillSymbol } from "../symbol/simpleFillSymbol.js";
import { Bounds } from "./bound.js";
export class MultiPolygon extends Geometry {

    type = Geometry.GeometryType.MultiPolygon;
    coordinates;
    _pro_coordinates = [];
    bound;
    screen=[];
    constructor(polygon) {
        super()
        this.coordinates = polygon;
    }

    draw(ctx, map, symbol) {
        if (this.coordinates.length == 0) {
            return;
        }
        if (this._pro_coordinates.length == 0) {

            let xMin, xMax, yMin, yMax;
            this._pro_coordinates = this.coordinates.map(polygons => polygons.map(lines => lines.map((point,index) =>{
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
            })))
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
        let matrix =map.matrix;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let sPolygons = [];
        this._pro_coordinates.forEach(pols => {
            ctx.beginPath();
            let sPols = [];

            pols.forEach(lines => {
                let slines = [];
                lines.forEach((point, index) => {
                    let projectPoint = point;
                    let sPoint = [projectPoint[0] * matrix.a + matrix.e, projectPoint[1] * matrix.d + matrix.f];
                    if (index == 0) {
                        ctx.moveTo(sPoint[0], sPoint[1])
                    } else {
                        ctx.lineTo(sPoint[0], sPoint[1])
                    }
                    slines.push(sPoint)
                })
                sPols.push(slines)
            })
            sPolygons.push(sPols)
            ctx.closePath();
            ctx.fill("evenodd");
            ctx.stroke()
        })
     
       this.screen = sPolygons;
        
        ctx.restore();
    }
    contains(screenX, screenY) {
        return this.screen.every(pols => {
            const first = pols[0];
            const others = pols.slice(1);
           return  this._pointInPolygon([screenX, screenY], first) && others.every(ring => !this._pointInPolygon([screenX, screenY], ring));
        })
       
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

    getCenter() {
        let counts = [];
        this.coordinates.forEach(polygon => {
            let count = 0;
            polygon.forEach(ring => {
                count += ring.length;
            })
            counts.push(count)
        })
        let index = counts.indexOf(Math.max.apply(null, counts)); //找个最复杂的面
        let coors = this.coordinates[index];
        let i, j, p1, p2, f, area, x, y, center,
            points =coors[0],
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