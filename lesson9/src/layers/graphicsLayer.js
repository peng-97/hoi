import { Graphic } from "../graphic.js"
import { getGuid } from "../core/util.js";
import { Layer } from "./layer.js";
export class GraphicsLayer extends Layer {
    id= ""
    graphics = []
    map;
    ctx;
    _client = true;
    /**
     * 
     * @param {*} options 
     */
    constructor(id) {
        super(["click", "dblclick", "dragstart"])
        this.id = id?id:getGuid();
    }
    add(feature) {
        if (feature instanceof Graphic) {
            this.graphics.push(feature);
        } else {
            feature = new Graphic(feature);
            this.graphics.push(feature);
        }
        if (this.map) {
            feature.draw(this.ctx,this.map);
        }
    }

    addFeatures(features) {
        this.graphics=this.graphics.concat(features);
        if (this.map) {
            features.forEach(feature => {
               feature.draw(this.ctx,this.map);
            })
        }
    }

    removeAll() {
        this.graphics = []
        this.map.refresh();
    }
    remove(feature) {
        for (let index = 0; i < this.graphics.length; i++){
            if (feature.id == this.graphics[index]) {
                this.graphics.splice(index, 1);
                break;
             }
        }
        this.map.refresh();
    }
    draw() {
        this.graphics.forEach(graphic => {
             graphic.draw(this.ctx,this.map)
        })
    }

    contains(screenX,screenY,event) {
        let graphics = this.graphics.filter(graphic => graphic.contains(screenX, screenY)).filter(graphic => this.map.bound.intersect(graphic.geometry.bound));
        if (graphics.length > 0) {
            let graphic = graphics[0];//选中第一个
            if (event == "click") { //图层考虑单击时间
                graphic.emit(event, { feature: graphic, x: screenX, y: screenY })
            }
            return graphics;  
        }
        this.emit(event, { feature: null, x: screenX, y: screenY })
        return graphics;
    }
    
    //重新实现emit on 和off ,
    emit(event, handler) {
        this.graphics.forEach(graphic => {
            graphic.emit(event, handler);
        })
    }
    on(event, handler) {
        this.graphics.forEach(graphic => {
            graphic.on(event, handler);
        })
    }
    off(event, handler) {
        this.graphics.forEach(graphic => {
            graphic.off(event, handler);
        })
    }
}