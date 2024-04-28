import { Polygon } from "./polygon.js";
export class Bounds{
    xMin;
    xMax;
    yMin;
    yMax;
    xscale = 1;
    yscale = 1;
    constructor([xMin, yMin], [xMax, yMax]) {
        this.xMin = Math.min(xMin,xMax);
        this.xMax = Math.max(xMin,xMax);
        this.yMin = Math.min(yMin,yMax);
        this.yMax = Math.max(yMin,yMax);
        this.xscale = xMin <=xMax ? 1 : -1;  
        this.yscale = yMin <= yMax ? 1 : -1;
        //与canvas方向一致就是1否则-1
    }
    getGeometry() {
        return new Polygon(
            [[[this.xMin, this.yMin], [this.xMax, this.yMin], [this.xMax, this.yMax], [this.xMin, this.yMax], [this.xMin, this.yMin]]]
        )
    }
    /**
     * bound是否重叠
     * @param {Bounds} bound 
     * @returns 
     */
    intersect(bound) {
        return (bound.xMax >= this.xMin) && (bound.xMin <= this.xMax) && (bound.yMax >= this.yMin) && (bound.yMin<= this.yMax);
    }
    buffer(size) {
        this.xMin -= size;
        this.yMin -= size;
        this.xMax += size;
        this.yMax += size;
    }
    /**
     * 是否包含bound
     * @param {Bounds} bound 
     */
    contains(bound) {
         return (bound.xMax<=this.xMax) && (bound.xMin>=this.xMin) && (bound.yMax<=this.xMax) && (bound.yMin>=this.yMin)
    }
}