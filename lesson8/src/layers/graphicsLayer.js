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
        super()
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
            //    graphic.geometry.draw(this.ctx,this.map,graphic.symbol)
                 graphic.draw(this.ctx,this.map)//
         })
    }
    refresh() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.map.mapCanvas.width, this.map.mapCanvas.height);
        this.ctx.restore();
        // this.geometries.forEach(geometry => geometry.add(this));
        this.draw()
    }

}