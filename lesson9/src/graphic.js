import { SubObject } from "./core/subObject.js";
import { getGuid } from "./core/util.js";
export class Graphic extends SubObject{
    geometry;
    properties;
    symbol;
    type = "feature";
    visible;
    id;
    layer;
    _contains_current;
    constructor(feature) {
        super(["click", "dblclick", "mouseover", "mouseout", "dragstart"]);
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
    draw(ctx,map) {
        if (this.visible) {
            this.geometry.draw(ctx,map,this.symbol);
         }
    }
    
    /**
     * 判断当前要素有没有包含坐标，
     * @param {*} screenX 屏幕坐标X
     * @param {*} screenY 屏幕坐标y
     */
    contains(event, screenX, screenY) {
        let flag = this.geometry.contains(screenX, screenY) && this.visible;
        if (flag) {
            if ( event == "mousemove"){ //边界状态
                if (!this._contains_current && flag) {
                    this.emit("mouseover", { feature: this, screenX: screenX, screenY: screenY });
                }
                else if (this_contains_current && !flag) {
                    this.emit("mouseout", { feature: this, screenX: screenX, screenY: screenY });
                }
            }else ( //
                this.emit(event, { feature: this, screenX: screenX, screenY: screenY })
            )
         }
        this._contains_current = flag;
        return flag;
    }
}