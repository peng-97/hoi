import { DrawAction } from "./drawAction.js";
import { DrawEvent } from "./drawEvent.js";
export class DrawPolyline extends DrawAction{
    map;
    vertices = [];
    
    constructor(map) {
        super(["vertex-add", "vertex-remove", "draw-complete"])
        this.map = map;
    }

    onClick(event) {
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        this.vertices.push(point)
        let _event = new DrawEvent(this.map, this.vertices, "vertex-add", this.vertices)
        this.emit("vertex-add", _event);
    }

    onMouseMove(event) {
        if (this.vertices.length == 0) return;
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        
        let vertexs = this.vertices.concat([point]);
        let _event = new DrawEvent(this.map, vertexs, "vertex-remove", this.vertices)
        this.emit("vertex-remove", _event);
    }
    
    onDoubleClick(event) {
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        this.vertices.push(point)
       
        let _event = new DrawEvent(this.map, this.vertices, "draw-complete",this.vertices)
        this.emit("draw-complete", _event);
        this.vertices = [];
    }

}