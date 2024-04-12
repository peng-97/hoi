import { DrawAction } from "./drawAction.js";
import { DrawEvent } from "./drawEvent.js";

export class DrawPoint extends DrawAction{
    map;
    constructor(map) {
        super(["vertex-add", "vertex-remove", "draw-complete"])
        this.map = map;
    }

    onClick(event) {
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        
        let _event = new DrawEvent(this.map, point, "vertex-add",event)
        this.emit("vertex-add", _event);
    }

    onMouseMove(event) {
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        let _event = new DrawEvent(this.map, point, "vertex-remove", event)
        this.emit("vertex-remove", _event);
    }
    onDoubleClick(event) {
        let point = this.map.toMapPoint([event.offsetX,event.offsetY]);
        let _event = new DrawEvent(this.map, point, "draw-complete", event)
        this.emit("draw-complete", _event);
    }
}