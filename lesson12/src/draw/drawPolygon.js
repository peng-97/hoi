import { DrawAction } from "./drawAction.js";
import { DrawEvent } from "./drawEvent.js";
export class DrawPolygon extends DrawAction{
    map;
    vertices = [];

    constructor(map) {
        super(["vertex-add", "vertex-remove", "draw-complete"])
        this.map = map;
    }

    onClick(event) {
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
       
       this.vertices.push(point)
        let vertexs = this.vertices.concat([this.vertices[0]]);
        let _event = new DrawEvent(this.map, [vertexs], "vertex-add", event)

        this.emit("vertex-add", _event);
    }

    onMouseMove(event) {
        if (this.vertices.length == 0) return;
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        let vertexs = this.vertices.concat([point]);
        vertexs.push(this.vertices[0])
        let _event = new DrawEvent(this.map, [vertexs], "vertex-remove", event)
        this.emit("vertex-remove", _event);
    }

    onDoubleClick(event) {
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        this.vertices.push(point)
        let vertexs = this.vertices.concat([this.vertices[0]]);
        let _event = new DrawEvent(this.map, [vertexs], "draw-complete", event)
        this.emit("draw-complete", _event);
        this.vertices = [];
    }

}