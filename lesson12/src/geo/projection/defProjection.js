
import { Bounds } from "../../geometry/bound.js";
import { Projection } from "./index.js";

export class DefProjection extends Projection {
    projection;
    bounds;
    srsCode;
    constructor(code,def,bounds) {
        super();
        this.projection = this.defProj(code, def);
        this.srsCode = code;
        if (bounds instanceof Bounds) {
            this.bounds = bounds;
        } else (
            this.bounds = new Bounds(bounds[0],bounds[1])
        )
    }
    /**
    * 通过poj4库定义投影,并且获取投影
    * @param {string} code  投影代码
    * @param {*} def proj
    * @returns proj定义的投影，有两个方法  forward用于投影到目标，forward用于转变回来
    */
    defProj(code, def) {
        if (window.proj4 || proj4) {
            proj4.defs(code, def);
            return proj4(code);
        }
        return null;
    }

    /**
     * 投影
     * @param {} param0 
     * @returns 
     */
    project([lng, lat]) {
        return this.projection.forward([lng, lat]);
    }
    /**
     * 反向投影
     * @param {*} param0 
     * @returns 
     */
    unproject([x, y]) {
        return this.projection.inverse([x, y]);
    }

}