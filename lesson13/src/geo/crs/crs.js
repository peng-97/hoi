import { CrsOptions } from "./crsOptions.js";
import { DefProjection } from "../projection/defProjection.js"
import { Bounds } from "../../geometry/bound.js";
export class Crs {
    /**
 * 投影
 */
    projection;
    code
    scales
    def
    bounds
    resolutions
    origin;
    dpi = 96;
    tileSize = 256;
    constructor(options) {
        this.dpi = options.dpi ? options.dpi : 96;
        //没有就设置一个
        let isGeo = false;//是否用经纬度来设置投影
        if (!options.projection) {
            this.projection = new DefProjection(options.code, options.def, options.bounds)

            this.code = options.code;
            this.def = options.def;
        } else {
            this.projection = options.projection;
            this.code = this.projection.srsCode
        }
        this.origin = options.origin;
        let meterToRadiusRatio = 111194.872221777;
        if (options.resolutions) {
            this.resolutions = options.resolutions;
            this.scales = [];
            for (var i = this.resolutions.length - 1; i >= 0; i--) {
                if (this.resolutions[i]) {
                    if (isGeo) {
                        this.scales[i] = (this.dpi * meterToRadiusRatio * this.resolutions[i]) / 0.0254;
                    } else {
                        this.scales[i] = (this.dpi *this.resolutions[i]) / 0.0254;
                    }
                 
                }
            }
        } else {
            this.scales = options.scales;
            this.resolutions = [];
            for (var i = this.scales.length - 1; i >= 0; i--) {
                if (this.scales[i]) {
                    if (isGeo) {
                        this.resolutions[i] = this.scales[i] * 0.0254 / (this.dpi * meterToRadiusRatio);
                    } {
                        this.resolutions[i] = this.scales[i] * 0.0254 / this.dpi
                    }
                }
            }
        }
        this.tileSize = options.tileSize ? options.tileSize : 256;

    }
}

