import { Geometry } from "./index.js";
export class MultiPoint extends Geometry{
    type = Geometry.GeometryType.MultiPoint;
    coordinates = [];
    _pro_coordinates = [];
    bound;//数据的四至范围
    screen = [];
    _distance = 0;
    constructor(multiPoint) {
        super();
        this.coordinates = multiPoint;
    }
    draw(ctx, map, symbol) {
        let opertaion = [];
        
        if (this.coordinates.length == 0) return;
        if (this._pro_coordinates.length == 0) {
            if (this._pro_coordinates.length == 0) {
                let xMin, xMax, yMin, yMax;
                this._pro_coordinates = this.coordinates.map((point, index) => {
                    let pPoint = map.projection.project(point);
                    if (index == 0) {
                        xMax = xMin = pPoint[0];
                        yMax = yMin = pPoint[1];
                    } else {
                        yMin = Math.min(yMin, pPoint[1])
                        yMax = Math.max(yMax, pPoint[1])
                        xMin = Math.min(xMin, pPoint[0])
                        xMax = Math.max(xMax, pPoint[0])
                    }
                    return pPoint;
                })
                this.bound = new Bounds([xMin, yMin], [xMax, yMax])
            }
        }
        if (!map.bound.intersect(this.bound)) return;
        if (!symbol) {
            symbol = new SimpleMarkerSymbol()
        }
        let sPoints = []
        let count = 0;
        this._pro_coordinates.forEach(point => {
            let projectPoint = point;
           
            if (symbol.type == "simple-marker") {
                let sPoint = [];
                ctx.save();
                let matrix = ctx.getTransform();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                this._distance = symbol.size + symbol.outline.width;
                sPoint = [matrix.a * projectPoint[0] + matrix.e - symbol.xoffset, matrix.d * projectPoint[1] + matrix.f - yoffset];
                sPoints.push(sPoint)
                if (symbol.icon) { //有图标片的话
                    //xy偏移 正值 向上向下
                    try {
                        let oper = [];
                        let obj = {
                            type:"func",
                            name:""
                        }
                        ctx.drawImage(symbol.icon, sPoint[0],sPoint[1], symbol.width, symbol.height);
                    } catch (ex) {
                        console.log(ex)
                    }
                } else {
                    // ctx.lineWidth = symbol.outline.width;
                    // ctx.strokeStyle = symbol.outline.color;
                    // ctx.fillStyle = symbol.color;
                    // ctx.beginPath();
                    // ctx.arc(sPoint[0], sPoint[1], symbol.size, 0, Math.PI * 2, true);
                    // ctx.closePath();
                    // ctx.fill()
                 
                    
                }
                ctx.stroke()
                ctx.restore();
                if (count == this._pro_coordinates.length) {
                    this.screen = sPoints;
                }
            } else {
                if (!(symbol instanceof PictureMarkerSymbol)) {
                    symbol = new PictureMarkerSymbol(symbol);
                }
                this._distance = Math.min(symbol.width, symbol.height);
                let matrix = ctx.getTransform();
                if (symbol.picture) {
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    let sPoint = [matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f];
                    sPoints.push(sPoint)
                    ctx.drawImage(symbol.picture,sPoint[0], sPoint[1], symbol.width, symbol.height);
                    ctx.restore();
                    if (count == this._pro_coordinates.length) {
                        this.screen = sPoints;
                    }
                }
                symbol.loadImg().then(res => {
                    if (res) {
                        ctx.save();
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        let sPoint = [matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f];
                        sPoints.push(sPoint)
                        ctx.drawImage(symbol.picture, sPoint[0], sPoint[1], symbol.width, symbol.height);
                        ctx.restore();
                        if (count == this._pro_coordinates.length) {
                            this.screen = sPoints;
                        }
                    }
                })
            }
        })
    }

    contains(screenX, screenY) {
        return this.screen.every(sPoint => Math.sqrt((sPoint[0] - screenX) * (sPoint[0] - screenX) + (sPoint[1] - screenY) * (sPoint[1] - screenY)) <= this._distance)
    }
    
    getCenter() {
        //选第一个
        return [this.coordinates[0][1], this.coordinates[0][1]]
        
    }
}