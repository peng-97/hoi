import { Graphic } from "../graphic.js"
import { getGuid } from "../core/util.js";
import { Layer } from "./layer.js";
export class GraphicsLayer extends Layer {
    id= ""
    graphics = []
    // map;
    ctx;
    _client = true;
    /**
     * 
     * @param {*} options 
     */
    constructor(id) {
        super(["click", "dblclick", "dragstart",'loaded'])
        this.id = id ? id : getGuid();
    }
    add(feature) {
        if (feature instanceof Graphic) {
            this.graphics.push(feature);
        } else {
            feature = new Graphic(feature);
            this.graphics.push(feature);
        }
        if (this.map) {
            feature.layer = this;
            feature.draw(this.ctx, this.map);
        }
    }

    addFeatures(features) {
        this.graphics=this.graphics.concat(features);
        if (this.map) {
            features.forEach(feature => {
                feature.layer = this;
                feature.draw(this.ctx, this.map);
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
        this.ctx.save();
        this.ctx.clearRect(0 , 0 , this.map.width , this.map.height );
        this.ctx.restore();
        this.graphics.forEach(graphic => {
             graphic.layer = this;
             graphic.draw(this.ctx,this.map)
        })
        this.emit("loaded")
    }

    zoom() {
     
        this.draw();
    }
    move() {
        this.draw();
    }

    
    //重新实现emit on 和off ,
    // emit(event, handler) {
    //     this.graphics.forEach(graphic => {
    //         graphic.emit(event, handler);
    //     })
    // }
    // on(event, handler) {
    //     this.graphics.forEach(graphic => {
    //         graphic.on(event, handler);
    //     })
    // }
    // off(event, handler) {
    //     this.graphics.forEach(graphic => {
    //         graphic.off(event, handler);
    //     })
    // }
}