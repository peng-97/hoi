import "./lib/gl-matrix-min.js"
import "./lib/litegl.js";
import enableWebGLCanvas from "./lib/Canvas2DtoWebGL.js"
import { WebMercator } from "./geo/projection/web-mercator.js";
import { Bounds } from "./geometry/bound.js";
import { GraphicsLayer } from "./layers/graphicsLayer.js";
import { FeatureLayer } from "./layers/featureLayer.js";
import { SubObject } from "./core/subObject.js";
import { debounce, throttle } from "./core/util.js";
export class Map extends SubObject {
    graphics;
    ctx = null;
    crs;
    container;
    mapCanvas = null;
    center = [0, 0];
    extent;
    zoom = 1;
    bound;
    maxZoom = 18;
    layers = [];//图层数组
    projection;
    minZoom = 3;
    height;
    _draw;
    focused = false;
    width;
    _options = {
        extent: null,
        center: null,
        zoom: null,
        crs: {},
    }
    matrix = {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
    };//变换矩阵，canvas不在进行变换，把变换参数存在这里
    _drag = false;
    /**
     * 初始化
     * @param {*} htmlId 
     * @param {_options} options 
     * @returns 
     */
    constructor(htmlId, options = {}) {
        super(['click', 'refresh',"move","zoom"])
        let mapDiv = document.getElementById(htmlId);
        if (!mapDiv) {
            console.log("没有获取到", htmlId);
            return;
        }
        this.container = mapDiv;
        let mapCanvas = document.createElement("canvas");
        mapCanvas.setAttribute("width", mapDiv.clientWidth)
        mapCanvas.setAttribute("height", mapDiv.clientHeight)
        mapDiv.appendChild(mapCanvas);
        mapCanvas.style.cssText = "position:absolute;height: 100%; width: 100%;z-index:0;font-size:10px";
        window.addEventListener("resize", () => {
            mapCanvas.setAttribute("width", mapDiv.clientHeight)
            mapCanvas.setAttribute("height", mapDiv.clientHeight)
        });
        this.width = mapDiv.clientWidth;
        this.height = mapDiv.clientHeight;
        this.mapCanvas = mapCanvas;
        this.ctx = mapCanvas.getContext("2d");

        // this.ctx = enableWebGLCanvas(mapCanvas);
        // this.ctx.start2D();
        mapCanvas.addEventListener("dblclick", this.onDoubleClick.bind(this))
        mapCanvas.addEventListener("click", this.onClick.bind(this))
        mapCanvas.addEventListener("wheel", throttle(this.onWheel.bind(this), 200))
        mapCanvas.addEventListener("mousedown", this.onMouseDown.bind(this))
        mapCanvas.addEventListener("mouseup", this.onMouseUp.bind(this))
        mapCanvas.addEventListener("mousemove", this.onMouseMove.bind(this))
        mapCanvas.addEventListener("mouseleave",this.onMouseLevel.bind(this))
        this.graphics = new GraphicsLayer();
        this.graphics.ctx = this.ctx;
        this.graphics.map = this;

        this.crs = options.crs;
        this.projection = this.crs.projection;
        this.bound = this.projection.bounds;
        this.setView(options.zoom, options.center, options.bound)
    };

    addLayer(layer, insertIndex = -1) {
        let startIndex = 0;//服务端客户端分界线
        if (insertIndex > this.layers.length) {  //index过大，调整一下
            insertIndex = this.layers.length;
        }
        for (let index = 0; index < this.layers.length; index++) {
            if (this.layers[index]._client) {
                startIndex = index;
                break;
            }
        }

        //0是最下面  index越大越往上
        if (layer._client) { //客户端图层放上面 
            startIndex = this.layers.length;
        } else { //服务端图层放下面
            if (insertIndex == -1) {
                insertIndex = startIndex;//最大的值
            }
            if (insertIndex <= startIndex) {
                startIndex = insertIndex;
            }
        }
        // let canvasList = this.container.childNodes.map(t => t.nodeName == "CANVAS'");
        let canvasList = [];
        for (let i = 0; i < this.container.childNodes.length; i++) {
            if (this.container.childNodes[i].nodeName == "CANVAS") {
                canvasList.push(this.container.childNodes[i]);
            }
        }
        let matrix = this.ctx.getTransform();
        //创建一个新的canvas
        let mapCanvas = document.createElement("canvas");
        mapCanvas.setAttribute("width", this.container.clientWidth)
        mapCanvas.setAttribute("height", this.container.clientHeight);
        mapCanvas.style.cssText = "position:absolute;height: 100%; width: 100%";
        mapCanvas.className = layer.id;
        let ctx = mapCanvas.getContext("2d");
        layer.ctx = ctx;
        mapCanvas.style.zIndex = startIndex;

        for (let cLindex = startIndex; cLindex < canvasList.length; cLindex++) {
            canvasList[cLindex].style.zIndex = parseInt(canvasList[cLindex].style.zIndex) + 1
        }
        // 按照位置插入 
        if (startIndex == this.layers.length) {
            this.container.insertBefore(mapCanvas, this.mapCanvas)
        } else {
            this.container.insertBefore(mapCanvas, canvasList[startIndex]);
        }
        // this.container.appendChild(mapCanvas);
        //默认没有参数 是-1。在最上面
        this.layers.splice(startIndex, 0, layer);

        layer.map = this;
        // this.layers.push(layer);
        layer.draw()
        // this.refresh();
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
        // this.bound = this.projection.bounds;
        const a = 1 / this.crs.resolutions[zoom] * this.bound.xscale;
        const d = 1 / this.crs.resolutions[zoom] * this.bound.yscale;
        let pcenter = this.projection.project(center)
        const e = this.mapCanvas.width / 2 - a * pcenter[0];
        const f = this.mapCanvas.height / 2 - d * pcenter[1];
        this.matrix.a = a;
        this.matrix.d = d;
        this.matrix.e = e;
        this.matrix.f = f;
        this.updateExtent();
        // this.refresh();
    }


    /**
     * 更新范围 
     */
    updateExtent() {
        const x1 = (0 - this.matrix.e) / this.matrix.a
        const y1 = (0 - this.matrix.f) / this.matrix.d
        const x2 = (this.mapCanvas.width - this.matrix.e) / this.matrix.a
        const y2 = (this.mapCanvas.height - this.matrix.f) / this.matrix.d;
        this.bound = new Bounds([x1, y1], [x2, y2]);
        const center = [(this.mapCanvas.width / 2 - this.matrix.e) / this.matrix.a, (this.mapCanvas.height / 2 - this.matrix.f) / this.matrix.d];//屏幕坐标转为平面坐标
        this.center = this.projection.unproject(center); //将将中心点的平面坐标换位地理坐标  范围变化后新的中心点和范围
    }

    /**
     * 刷新地图
     */
    refresh() {
        this.updateExtent();
        let layers = this.layers.concat(this.graphics);
        layers.forEach(layer => {
            layer.draw();
        })
        this.graphics.draw();
    }
    focus(draw) {
        this.focused = true;
        this._draw = draw;
    }

    lostFocus() {
        this.focused = false;
    }
    drawLayer(layers, layerIndex = 0, deep = layers.length) {
        let _this = this;
        if (layers.length > layerIndex) {
            let layer = layers[layerIndex];
            const func = (listPara) => {
                layerIndex++;
                layer.off("loaded", func)
                _this.drawLayer(layers, layerIndex, --deep);
            }
            layer.on("loaded", func)
            layer.draw();
        }
    }
    onDoubleClick(event) {
        if (this.focused && this._draw) {
            this._draw.drawAction.onDoubleClick(event)
            return
        }
        let zoom = 1;
        let scale = Math.pow(2, zoom);
        this.zoom += zoom;
        const matrix = this.matrix;
        const a1 = matrix.a, e1 = matrix.e, x1 = event.offsetX, x2 = x1; //放大到中心点 x2 = this._canvas.width / 2
        const e2 = x2 - scale * (x1 - matrix.e);
        const a2 = matrix.a * scale;
        const d1 = matrix.d, f1 = matrix.f, y1 = event.offsetY, y2 = y1; //放大到中心点 y2 = this._canvas.height / 2
        const d2 = matrix.d * scale;
        const f2 = y2 - scale * (y2 - matrix.f)
        const e = (x2 - scale * (x1 - e1) - e1) / a1;
        const f = (y2 - scale * (y1 - f1) - f1) / d1;
        this.matrix.a = a2;
        this.matrix.d = d2;
        this.matrix.e = e2;
        this.matrix.f = f2;
        this.updateExtent();
        this.emit("zoom")
        // this.refresh();
    }
    onClick(event) {
        if (this.focused && this._draw) {
            this._draw.drawAction.onClick(event)
            return;
        }
        let res = [];
        let layers = this.layers.filter(layer => layer._client);
        layers.push(this.graphics);//graphics不在layers中
        layers.filter(layer => layer._client).forEach(layer => {
            let gras = layer.contains(event.offsetX, event.offsetY, "click");
            if (gras.length > 0) {
                res.push(gras[0]);
            }
        })
        event.graphics = res;
        this.emit("click", event)
    }
    onMouseDown(event) {
        this._drag = true;
    }
    onMouseMove(event) {
        if (this.focused && this._draw) {
            this._draw.drawAction.onMouseMove(event)
            return;
        }
        if (this._drag && event.buttons!=0) {///一
            this.container.style.cursor = "grabbing"
            if (Math.abs(event.movementX) < 0.1 &&  Math.abs(event.movementY) < 0.1) return;
            this.matrix.e += event.movementX
            this.matrix.f += event.movementY
            let bound = Object.assign(this.bound, {})
            this.updateExtent()
            this.emit("move", [bound, this.bound])
        }
        let layers = this.layers.filter(layer => layer._client);
        layers.push(this.graphics);//graphics不在layers中
        layers.filter(layer => layer._client).forEach(layer => {
            let gras = layer.contains(event.offsetX, event.offsetY, "mousemove");
            if (gras.length > 0) {
                res.push(gras[0]);
            }
        })
     
    }
    onMouseUp(event) {
     
        if (this._drag) {
            this.container.style.cursor = "default"
        }
        this._drag = false;
        
    }

    onMouseLevel(event) {
        //离开地图move不生效
        if (this._drag) {
            this.container.style.cursor = "default"
        }
        // this._drag = false;
    }

    /**
     * 屏幕坐标转换为地理坐标
     * @param {Array} sceentPoint [x,y]
     */
    toMapPoint(sceentPoint) {
        if (!sceentPoint || sceentPoint.length != 2) {
            return null;
        }
        const point = [(sceentPoint[0] - this.matrix.e) / this.matrix.a, (sceentPoint[1] - this.matrix.f) / this.matrix.d];//屏幕坐标转为平面坐标
        return this.projection.unproject(point); //平面坐标转为地理坐标
    }

    /**
     * 地理坐标转为屏幕坐标
     * @param {Array} MapPoint 
     */
    toScreenPoint(mapPoint) {
        if (!mapPoint || mapPoint.length != 2) return;
        const projectPoint = this.projection.project(mapPoint);
        return [projectPoint[0] * this.matrix.a + this.matrix.e, projectPoint[1] * this.matrix.d + this.matrix.f] //平面坐标转换为屏幕坐标
    }
    /**
     * 滚轮滑动放大缩小 每次只变化一倍
     * @param {} event 
     */
    onWheel(event) {
        event.preventDefault();
        let zoom = 1;
        if (event.deltaY < 0) {//放大  向下滚动是正值  
            if (this.zoom >= this.maxZoom) {
                return;
            }
            zoom = 1;
        }
        else {//放大
            if (this.zoom <= this.minZoom) {
                return;
            }
            zoom = -1;
        }
        let scale = Math.pow(2, zoom);
        this.zoom += zoom;
        const matrix = this.matrix;
        const a1 = matrix.a, e1 = matrix.e, x1 = event.offsetX, x2 = x1; //放大到中心点 x2 = this._canvas.width / 2
        const e2 = x2 - scale * (x1 - matrix.e);
        const a2 = matrix.a * scale;
        const d1 = matrix.d, f1 = matrix.f, y1 = event.offsetY, y2 = y1; //放大到中心点 y2 = this._canvas.height / 2
        const d2 = matrix.d * scale;
        const f2 = y2 - scale * (y2 - matrix.f)
        const e = (x2 - scale * (x1 - e1) - e1) / a1;
        const f = (y2 - scale * (y1 - f1) - f1) / d1;
        //  this.ctx.transform(scale, 0, 0, scale, e, f);//基于现有矩阵做变换
        // this.ctx.setTransform(a2, matrix.b, matrix.c, d2, e2, f2);//基于原始矩阵做变换
        this.matrix.a = a2;
        this.matrix.d = d2;
        this.matrix.e = e2;
        this.matrix.f = f2;
        this.updateExtent();
        this.emit("zoom")
        // this.refresh();
    }
}