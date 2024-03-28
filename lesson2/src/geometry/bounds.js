import { Point } from "./point.js"
export class Bounds{
    xMin
    yMin
    xMax
    yMax
    constructor(xMin, yMin, xMax, yMax) {
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = xMax;
    }
    getCenter() {
        return new Point([(this.xMin + this.xMax) / 2, (this.yMin + this.yMax) / 2]);
    }
}