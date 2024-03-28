import { getGuid } from "./core/util.js";
export class Graphic{
    geometry;
    properties;
    symbol;
    visible;
    id;
    constructor(feature) {
        this.geometry = feature.geometry;
        this.symbol = feature.symbol;
        this.properties = feature.properties;
        this.id = getGuid();
        this.visible = true;
    }
    static fromGeoJson(feature) {
        // this.geometry = feature.geometry;
        // this.symbol = feature.symbol;
        // this.properties = feature.properties;
        // this.visible = true;
    }
    toGeoJson() {
         
    }
    draw(map) {
        if (this.visible) {
            this.geometry.draw(map,this.symbol);
         }
    }
    
}