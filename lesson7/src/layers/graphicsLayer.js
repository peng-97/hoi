import { Graphic } from "../graphic.js"
import { getGuid } from "../core/util.js";
import { Layer } from "./layer.js";
export class GraphicsLayer extends Layer {
    id= ""
    graphics = []
    map;
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
            feature.draw(this.map);
        }
    }
    

    addFeatures(features) {
        this.graphics=this.graphics.concat(features);
        if (this.map) {
            features.forEach(feature => {
               feature.draw(this.map);
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
               graphic.geometry.draw(this.map,graphic.symbol)
         })
    }
}