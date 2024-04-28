import { Bounds } from "../../geometry/bound.js";
import { Projection } from "./index.js";
//from leaflet
export class WebMercator extends Projection {
    _R = 6378137;
    leftTop = [-20037508.34279, 18764656.23138]
    rightBottom = [20037508.34279, -18764656.23138]
    bounds;
    constructor([leftTop, rightBottom]) {
        super();
        this.leftTop = leftTop ? leftTop : this.leftTop;
        this.rightBottom = rightBottom ? rightBottom :this.rightBottom
        this.bounds = new Bounds(this.leftTop, this.rightBottom)
    }
    /**
     * 地理使用的坐标转为屏幕使用的坐标   lng是经度   lat是纬度
     * @param {Array} param0 
     * @returns {Array} 
     */
    project([lng, lat]) {
        const d = Math.PI / 180, sin = Math.sin(lat * d);
        return [this._R * lng * d, this._R * Math.log((1 + sin) / (1 - sin)) / 2];
    };

    /**
     * 屏幕使用的坐标转为地理上使用的坐标
     * @param {Array} param0 
     * @returns 
     */
    unproject([x, y]) { 
        const d = 180 / Math.PI;
        return [x * d / this._R, (2 * Math.atan(Math.exp(y / this._R)) - (Math.PI / 2)) * d];
    };
}