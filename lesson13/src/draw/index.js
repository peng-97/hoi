import { DrawPoint } from "./drawPoint.js";
import { DrawPolygon } from "./drawPolygon.js";
import { DrawPolyline } from "./drawPolyline.js";
export class Draw {
    static drawType = {
        Point: "point",
        Polyline: "polyline",
        Polygon:"polygon"
    }
    type;
    map;
    points = [];
    drawAction;
    constructor(map) {
        this.map = map;
    }

    create(type) {
        this.type = type;
        switch (type){
            case Draw.drawType.Point:
                this.drawAction = new DrawPoint(this.map);
                break;
            case Draw.drawType.Polyline:
                this.drawAction = new DrawPolyline(this.map)
                break;
            case Draw.drawType.Polygon:
                this.drawAction = new DrawPolygon(this.map);
                break;
            default:
                this.drawAction = new DrawPoint(this.map);
                break;
        }
        return this.drawAction;
    }

    reset() {
        this.map.lostFocus();
    }


    
    
}