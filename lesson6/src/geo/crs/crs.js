import { CrsOptions } from "./crsOptions.js";
import {DefProjection} from "../projection/defProjection.js"
export class Crs {
        /**
     * 投影
     */
    projection;
    code;
    scales;
    def;
    scales;
    bounds;
    resolutions;
    origin;
    dpi = 96;
    /**
     * 
     * @param {CrsOptions} options 
     */
    constructor(options={}) {
         //没有就设置一个
        if (!options.projection) {
            this.projection = new DefProjection(options.code, options.def, options.bounds)
            this.code =options.def;
            this.def = options.def;
        } else {
            this.projection = options.projection;
        }
        this.origin = options.origin;
        //有resolutions计算scales     resolutions和scale的关系不是arcgis服务那样
        if (this.resolutions) {
            this.scales = [];
            for (var i = this.resolutions.length - 1; i >= 0; i--) {
                if (this.resolutions[i]) {
                    this.scales[i] = 1 / this.resolutions[i];
                }
            }
        }
        
    }
}