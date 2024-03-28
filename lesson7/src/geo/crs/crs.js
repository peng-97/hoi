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
    tileSize = 256;


    // 
    
    /**
     * 
     * @param {CrsOptions} options 
     */
    constructor(options = {}) {
        this.dpi = options.dpi ? options.dpi : 96;
        //没有就设置一个
        
        if (!options.projection) {
            this.projection = new DefProjection(options.code, options.def, options.bounds)
            this.code =options.def;
            this.def = options.def;
        } else {
            this.projection = options.projection;
        }
        this.origin = options.origin;
        // if (this.scales) {
        //     this.scales = options.scales;
        // }
       
        // else {
        //     this.resolutions = options.resolutions;
        //     this.scales = [];
        //     for (var i = this.resolutions.length - 1; i >= 0; i--) {
        //         if (this.resolutions[i]) {
        //             let meterToRadiusRatio = 111194.872221777;
        //             // resolution = scale * 0.0254 / (dpi * meterToRadiusRatio)  
        //             // this.scales[i] = 1 / this.resolutions[i];
        //             this.scales[i] = (this.dpi * meterToRadiusRatio * this.resolutions[i]) / 0.0254 ;
        //         }
        //     }
        // } 
        
        if(options.resolutions){
             this.resolutions = options.resolutions;
            this.scales = [];
            for (var i = this.resolutions.length - 1; i >= 0; i--) {
                if (this.resolutions[i]) {
                    let meterToRadiusRatio = 111194.872221777;
                    // resolution = scale * 0.0254 / (dpi * meterToRadiusRatio)  
                    // this.scales[i] = 1 / this.resolutions[i];
                    this.scales[i] = (this.dpi * meterToRadiusRatio * this.resolutions[i]) / 0.0254 ;
                }
            }
        }else {
            this.scales = options.scales;
            this.resolutions = [];
            for (var i = this.scales.length - 1; i >= 0; i--) {
                if (this.scales[i]) {
                    let meterToRadiusRatio = 111194.872221777;
                    this.resolutions[i] = this.scales[i] * 0.0254 / (this.dpi * meterToRadiusRatio);
                }
            }
        }
        this.tileSize = options.tileSize ? options.tileSize : 256;
        
    }
}