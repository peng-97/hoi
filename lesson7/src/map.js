import { WebMercator } from "./geo/projection/web-mercator.js";
import { Bounds } from "./geometry/bound.js";
import { GraphicsLayer } from "./layers/graphicsLayer.js";
export class Map {
    graphics;
    ctx = null;
    crs;
    mapCanvas = null;
    center = [0, 0];
    extent;
    zoom = 1;
    bound;
    maxZoom = 20;
    layers = [];
    projection;
    minZoom = 1;
    _options = {
        extent: null,
        center: null,
        zoom: null
    }
    _events = {
        "extent": []
    };
    _drag = {
        isDrag: false,
        start: {
            x: 0,
            y: 0
        },
        end: {
            x: 0,
            y: 0
        }
    }
    /**
     * 初始化
     * @param {*} htmlId 
     * @param {_options} options 
     * @returns 
     */
    constructor(htmlId, options = {}) {
        let mapDiv = document.getElementById(htmlId);
        if (!mapDiv) {
            console.log("没有获取到", htmlId);
            return;
        }
        let mapCanvas = document.createElement("canvas");
        mapCanvas.setAttribute("width", mapDiv.clientWidth)
        mapCanvas.setAttribute("height", mapDiv.clientHeight)
        mapDiv.appendChild(mapCanvas)
        mapCanvas.style.cssText = "position: absolute; height: 100%; width: 100%; z-index: 100";
        window.addEventListener("resize", () => {
            mapCanvas.setAttribute("width", mapDiv.clientHeight)
            mapCanvas.setAttribute("height", mapDiv.clientHeight)
        });
        this.mapCanvas = mapCanvas;
        this.ctx = mapCanvas.getContext("2d");
        mapCanvas.addEventListener("dblclick", this.onDoubleClick.bind(this))
        mapCanvas.addEventListener("wheel", this.onWheel.bind(this))
        mapCanvas.addEventListener("mousedown", this.onMouseDown.bind(this))
        mapCanvas.addEventListener("mouseup", this.onMouseUp.bind(this))
        this.graphics = new GraphicsLayer();
        this.graphics.map = this;
        this.crs = options.crs;
        this.setView(options.zoom, options.center, options.bound)
    
     
    
    };
    on(event, handler) {
        this._events[event].push(handler);
    }


    addLayer(layer) {
        layer.map = this;
        this.layers.push(layer);
        layer.draw()
    }
    /**
     * 设置地图
     * @param {number} zoom 
     * @param {Array} center
     * @param {Bounds} extent 
     */
    setView(zoom, center) {
        this.zoom = zoom ? zoom : this.zoom;
        this.center = center ? center : this.center;
        // this.projection = new WebMercator(extent ? extent : []);//没有就默认范围
        // this.bound = this.projection.bound;
        this.projection = this.crs.projection;
        this.bound = this.projection.bounds;
        const tileSize = 256;
        // let origin = this.projection.project(center);// 平面坐标的中心点
        //变换矩阵来表示  平面坐标  用地图中心来表示orgin
        //  scale=zoom/(width)  具体表现是
        // zoom*tileSize/ (this.bound.xMax - this.bound.xMin)*this.bound.xscale;

        //初始化
        // const a = (this.bound.xMax - this.bound.xMin) * this.bound.xscale / (this.crs.tileSize * this.crs.resolutions[zoom]);
        // const d =  (this.bound.yMax - this.bound.yMin) * this.bound.yscale/ (this.crs.tileSize * this.crs.resolutions[zoom]) ;
       debugger
        const a = 1 / this.crs.resolutions[zoom] * this.bound.xscale;
        const d = 1 / this.crs.resolutions[zoom] * this.bound.yscale ;
        
     
        // let point1 = this.projection.project([this.bound.xMin, this.bound.yMin]);
        // let point2 = this.projection.project([this.bound.xMax, this.bound.yMax]);
        // const a = tileSize * Math.pow(2, this.zoom) / (point2[0] - point1[0]) * this.bound.xscale;
        // const d = tileSize * Math.pow(2, this.zoom) / (point2[1] -point1[1]) * this.bound.yscale;
        //对于 ef
        //用 cnavas中心来表示  center
        //mapCanvaa.width/2=a*orgin_x+e;//矩阵坐标转换公式
        //  可得  e=mapCans.width/2-a*orgin_x

        let pcenter = this.projection.project(center)
        debugger
        const e = this.mapCanvas.width / 2 - a * pcenter[0];
        //同理
        const f = this.mapCanvas.height / 2 - d * pcenter[1];
        this.ctx.setTransform(a, 0, 0, d, e, f);//设置初始矩阵；
        this.refresh();
    }


    /**
     * 更新范围 给地图用
     */
    updateExtent() {
        const matrix = this.ctx.getTransform();
        const x1 = (0 - matrix.e) / matrix.a
        const y1 = (0 - matrix.f) / matrix.d
        const x2 = (this.mapCanvas.width - matrix.e) / matrix.a
        const y2 = (this.mapCanvas.height - matrix.f) / matrix.d;
        this.bound = new Bounds([x1, y1], [x2, y2]);
        const center = [(this.mapCanvas.width / 2 - matrix.e) / matrix.a, (this.mapCanvas.height / 2 - matrix.f) / matrix.d];//可看做屏幕坐标转为平面坐标
        this.center = this.projection.unproject(center); //将将中心点的平面坐标换位地理坐标
        this._events.extent.forEach(handler => handler({ extent: [], center: this.center, zoom: this.zoom, matrix: matrix }));
    }

    /**
     * 刷新地图
     */
    refresh() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        this.ctx.restore();
        this.updateExtent();
        // this.geometries.forEach(geometry => geometry.add(this));
        this.graphics.draw()
        this.layers.forEach(layer => {
             layer.draw()
        })
    }

    onDoubleClick(event) {
        //放大一倍
        const scale = 2;
        this.zoom += 1;
        const matrix = this.ctx.getTransform();
        const a1 = matrix.a, e1 = matrix.e, x1 = event.x, x2 = x1;
        const e = (x2 - scale * (x1 - e1) - e1) / a1;
        const d1 = matrix.d, f1 = matrix.f, y1 = event.y, y2 = y1;
        const f = (y2 - scale * (y1 - f1) - f1) / d1;
        this.ctx.transform(scale, 0, 0, scale, e, f);
        // this.ctx.scale(2)
        this.refresh();
    }

    onMouseDown(event) {
        this._drag.isDrag = true;
        this._drag.start.x = event.x;
        this._drag.start.y = event.y;
    }
    onMouseUp(event) {
        if (this._drag.isDrag) {
            this._drag.end.x = event.x;
            this._drag.end.y = event.y;
            const matrix = this.ctx.getTransform();
            this.ctx.translate((this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) / matrix.d);
            // this.ctx.setTransform(matrix.a, 0, 0, matrix.d, (this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) * matrix.d);
            this.refresh();
        }
        this._drag.isDrag = false;
    }

    /**
     * 滚轮滑动放大缩小
     * @param {} event 
     */
    onWheel(event) {
        event.preventDefault();
        let scale = 1;
        const sensitivity = 100;
        const delta = event.deltaY / sensitivity;
        if (delta < 0) {//放大
            if (this.zoom >= this.maxZoom) {
                return;
            }
            scale *= delta * -2;
        }
        else {
            if (this.zoom <= this.minZoom) {
                return;
            }

            scale /= delta * 2;
        }
        const zoom = Math.round(Math.log(scale));
        scale = Math.pow(2, zoom);
        this.zoom += zoom;

        const matrix = this.ctx.getTransform();
        const a1 = matrix.a, e1 = matrix.e, x1 = event.x, x2 = x1; //放大到中心点 x2 = this._canvas.width / 2
        const e2 = x2 - scale * (x1 - matrix.e);
        const a2 = matrix.a * scale;
        const d1 = matrix.d, f1 = matrix.f, y1 = event.y, y2 = y1; //放大到中心点 y2 = this._canvas.height / 2
        const d2 = matrix.d * scale;
        const f2 = y2 - scale * (y2 - matrix.f)
        const e = (x2 - scale * (x1 - e1) - e1) / a1;
        const f = (y2 - scale * (y1 - f1) - f1) / d1;
        this.ctx.transform(scale, 0, 0, scale, e, f);//基于现有矩阵做变换
        // this.ctx.setTransform(a2, matrix.b, matrix.c, d2, e2, f2);//基于原始矩阵做变换
        this.refresh();
    }

}