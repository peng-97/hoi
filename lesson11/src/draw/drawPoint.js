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
        
        let _event = new DrawEvent(this.map, point, "draw-complete",event)
        this.emit("draw-complete", _event);
    }

    onMouseMove(event) {
        let point = this.map.toMapPoint([event.offsetX, event.offsetY]);
        let _event = new DrawEvent(this.map, point, "draw-complete", event)
        this.emit("draw-complete", _event);
    }
    onDoubleClick(event) {
        let point = this.map.toMapPoint([event.offsetX,event.offsetY]);
        let _event = new DrawEvent(this.map, point, "draw-complete", event)
        this.emit("draw-complete", _event);
    }

}