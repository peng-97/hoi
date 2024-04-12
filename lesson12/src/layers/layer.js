import { SubObject } from "../core/subObject.js";

export class Layer extends SubObject{
    map;
    constructor(events=[]) {
        super(events)
        let _map;
        Object.defineProperty(this, "map", {
            get(val) {
                return _map
            },
            set(val) {
                _map = val;
                _map.on("zoom", this.zoom.bind(this))
                _map.on("move", this.move.bind(this))
            }
        })
    }
    contains(screenX, screenY, event) {
        let features = this.features || this.graphics;
        let graphics = features.filter(feature =>this.map &&  feature.contains(event, screenX, screenY)).filter(feature => this.map.bound.intersect(feature.geometry.bound));
        if (graphics.length > 0) {
            let graphic = graphics[0];//选中第一个
            if (event == "click") { //图层单击
                // graphic.emit(event, { feature: graphic, x: screenX, y: screenY })
                this.emit(event, { feature: graphic, x: screenX, y: screenY })
                return graphics;
            }
        }
        return [];
    }
    move() {
        debugger
    }
    zoom() {
        
    }
}