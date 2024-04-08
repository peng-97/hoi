import "./lib/gl-matrix-min.js"
import "./lib/litegl.js";
import  enableWebGLCanvas  from "./lib/Canvas2DtoWebGL.js"
import { WebMercator } from "./geo/projection/web-mercator.js";
import { Bounds } from "./geometry/bound.js";
import { GraphicsLayer } from "./layers/graphicsLayer.js";
import { FeatureLayer } from "./layers/featureLayer.js";
import { SubObject } from "./core/subObject.js";
import { debounce } from "./core/util.js";
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
    minZoom = 1;
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
        super(['click', 'refresh'])
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
        mapCanvas.addEventListener("wheel", this.onWheel.bind(this))
        mapCanvas.addEventListener("mousedown", this.onMouseDown.bind(this))
        mapCanvas.addEventListener("mouseup", this.onMouseUp.bind(this))
        mapCanvas.addEventListener("mousemove", this.onMouseMove.bind(this))
        this.graphics = new GraphicsLayer();
        this.graphics.ctx = this.ctx;
        this.graphics.map = this;
        this.crs = options.crs;
        this.setView(options.zoom, options.center, options.bound)
    };

    //客户端图层insertIndex不生效
    // addLayer(layer, insertIndex = -1) {
    //     let startIndex = 0;//服务端客户端分界线
    //     if (insertIndex > this.layers.length) {  //index过大，调整一下
    //         insertIndex = this.layers.length;
    //     }
    //     for (let index = 0; index < this.layers.length; index++) {
    //         if (this.layers[index]._client) {
    //            startIndex = index;
    //             break;
    //         }
    //     }
        
    //     //0是最下面  index越大越往上
    //     if (layer._client) { //客户端图层放上面 
    //         startIndex = this.layers.length;
    //     } else { //服务端图层放下面
    //         if (insertIndex == -1) {
    //             insertIndex =startIndex;//最大的值
    //         }
    //         if (insertIndex <= startIndex) {
    //             startIndex = insertIndex;
    //         }
    //     }
    //     // let canvasList = this.container.childNodes.map(t => t.nodeName == "CANVAS'");
    //     let canvasList = [];
    //     for (let i = 0; i < this.container.childNodes.length; i++){
    //         if (this.container.childNodes[i].nodeName == "CANVAS") {
    //             canvasList.push(this.container.childNodes[i]);
    //         }
    //     }
    //     let matrix = this.ctx.getTransform();
    //     //创建一个新的canvas
    //     let mapCanvas = document.createElement("canvas");
    //     mapCanvas.setAttribute("width", this.container.clientWidth)
    //     mapCanvas.setAttribute("height", this.container.clientHeight);
    //     mapCanvas.style.cssText = "height: 100%; width: 100%;";
    //     let ctx = mapCanvas.getContext("2d");
    //     ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    //     layer.ctx = ctx;
    //     mapCanvas.style.zIndex = startIndex;
    //     for (let cLindex = startIndex; cLindex < canvasList.length; cLindex++) {
    //         canvasList[cLindex].style.zIndex = parseInt(canvasList[cLindex].style.zIndex)+1
    //     }
    //     // 按照位置插入 
    //     if (startIndex == this.layers.length) {
    //         this.container.insertBefore(mapCanvas, this.mapCanvas)
    //     } else {
    //         this.container.insertBefore(mapCanvas, canvasList[startIndex]);
    //     }
    //     // this.container.appendChild(mapCanvas);
    //     //默认没有参数 是-1。在最上面
    //     this.layers.splice(startIndex, 0, layer);
    //     layer.map = this;
    //     // this.layers.push(layer);
    //     layer.draw()
    // }
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
        ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
        // layer.ctx = this.ctx;
        layer.ctx = ctx;
        mapCanvas.style.zIndex = startIndex;
        debugger
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
        // this.projection = new WebMercator(extent ? extent : []);//没有就默认范围
        // this.bound = this.projection.bound;
        this.projection = this.crs.projection;
        this.bound = this.projection.bounds;
        // const tileSize = 256;
        // let origin = this.projection.project(center);// 平面坐标的中心点
        //变换矩阵来表示  平面坐标  用地图中心来表示orgin
        //  scale=zoom/(width)  具体表现是
        // zoom*tileSize/ (this.bound.xMax - this.bound.xMin)*this.bound.xscale;

        //初始化
        // const a = (this.bound.xMax - this.bound.xMin) * this.bound.xscale / (this.crs.tileSize * this.crs.resolutions[zoom]);
        // const d =  (this.bound.yMax - this.bound.yMin) * this.bound.yscale/ (this.crs.tileSize * this.crs.resolutions[zoom]) ;

        const a = 1 / this.crs.resolutions[zoom] * this.bound.xscale;
        const d = 1 / this.crs.resolutions[zoom] * this.bound.yscale;

        // let point1 = this.projection.project([this.bound.xMin, this.bound.yMin]);
        // let point2 = this.projection.project([this.bound.xMax, this.bound.yMax]);
        // const a = tileSize * Math.pow(2, this.zoom) / (point2[0] - point1[0]) * this.bound.xscale;
        // const d = tileSize * Math.pow(2, this.zoom) / (point2[1] -point1[1]) * this.bound.yscale;
        //对于 ef
        //用 cnavas中心来表示  center
        //mapCanvaa.width/2=a*orgin_x+e;//矩阵坐标转换公式
        //  可得  e=mapCans.width/2-a*orgin_x
        let pcenter = this.projection.project(center)
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
        const center = [(this.mapCanvas.width / 2 - matrix.e) / matrix.a, (this.mapCanvas.height / 2 - matrix.f) / matrix.d];//屏幕坐标转为平面坐标
        this.center = this.projection.unproject(center); //将将中心点的平面坐标换位地理坐标
    }

    /**
     * 刷新地图
     */
    refresh() {
        let layers = this.layers.concat(this.graphics);
        this.updateExtent();
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0 - this.crs.tileSize, 0 - this.crs.tileSize, this.mapCanvas.width + this.crs.tileSize, this.mapCanvas.height + this.crs.tileSize);
        this.ctx.restore();
        let matrix = this.ctx.getTransform();
        layers.forEach(layer => {
            layer.ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
        })
        let clientayer = this.layers.filter(t => t._client);
        let serverLsyer = this.layers.filter(t => !t._client);
        this.drawLayer(serverLsyer)
        clientayer.forEach(layer => {
             layer.draw()
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

    // drawLayer(layers, layerIndex = 0, deep = layers.length,paraList=[]) {
    //     let _this = this;
    //     if (layers.length > layerIndex) {
    //         let layer = layers[layerIndex];
    //         const func = (listPara) => {
    //             layerIndex++;
    //             layer.off("loaded", func)
    //             listPara = listPara instanceof Array ? listPara : [];
    //             _this.drawLayer(layers, layerIndex, --deep,paraList.concat(listPara));
    //         }
    //         layer.on("loaded", func)
    //         layer.draw();
    //     }
    //     if (deep == 0) {
    //         // this.graphics.draw();
    //         this.refreshMap(paraList)
    //     }
    // }


    onDoubleClick(event) {
        if (this.focused && this._draw) {
            this._draw.drawAction.onDoubleClick(event)
            return
        }
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
       
        this._drag.isDrag = true;
        this._drag.start.x = event.offsetX;
        this._drag.start.y = event.offsetY;
    }
    onMouseMove(event) {
        if (this.focused && this._draw) {
            this._draw.drawAction.onMouseMove(event)
            return;
        }
        if (this._drag.isDrag) {
            this.container.style.cursor = "grabbing"
        }
        let demail = 1;
        if (this._drag.isDrag) {
    
            // this._drag.end.x = event.offsetX;
            // this._drag.end.y = event.offsetY;
          
            // if (Math.abs(this._drag.end.x- this._drag.start.x) > demail || Math.abs(this._drag.end.y - this._drag.start.y) > demail) { //防止单击造成一直刷新
                // const matrix = this.ctx.getTransform();
                // this.ctx.translate((this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) / matrix.d);
                // // this.ctx.setTransform(matrix.a, 0, 0, matrix.d, (this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) * matrix.d);
                // this.refresh();

                    // const matrix = this.ctx.getTransform();
                    // this.ctx.translate((this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) / matrix.d);
                    // // this.ctx.setTransform(matrix.a, 0, 0, matrix.d, (this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) * matrix.d);
                    // this.refresh();
                  

                }
              
            // }
           
        
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
        let demail = 1;
        if (this._drag.isDrag) {
            this._drag.end.x = event.offsetX;
            this._drag.end.y = event.offsetY;
            // const func = function () {
            if (Math.abs(this._drag.end.x - this._drag.start.x) > demail || Math.abs(this._drag.end.y - this._drag.start.y) > demail) { //防止单击造成一直刷新
           
                    const matrix = this.ctx.getTransform();
                    this.ctx.translate((this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) / matrix.d);
                    // this.ctx.setTransform(matrix.a, 0, 0, matrix.d, (this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) * matrix.d);
                    this.refresh();
                }
             

        }
        this.container.style.cursor = "default"
        this._drag.isDrag = false;
    }

     /**
      * 屏幕坐标转换为地理坐标
      * @param {Array} sceentPoint [x,y]
      */
    toMapPoint(sceentPoint) {
        if (!sceentPoint || sceentPoint.length != 2) {
            return null;
        }
        let matrix = this.ctx.getTransform();
         const point = [(sceentPoint[0]- matrix.e) / matrix.a, (sceentPoint[1] - matrix.f) / matrix.d];//屏幕坐标转为平面坐标
        return  this.projection.unproject(point); //将将中心点的平面坐标换位地理坐标
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
        const a1 = matrix.a, e1 = matrix.e, x1 = event.offsetX, x2 = x1; //放大到中心点 x2 = this._canvas.width / 2
        const e2 = x2 - scale * (x1 - matrix.e);
        const a2 = matrix.a * scale;
        const d1 = matrix.d, f1 = matrix.f, y1 = event.offsetY, y2 = y1; //放大到中心点 y2 = this._canvas.height / 2
        const d2 = matrix.d * scale;
        const f2 = y2 - scale * (y2 - matrix.f)
        const e = (x2 - scale * (x1 - e1) - e1) / a1;
        const f = (y2 - scale * (y1 - f1) - f1) / d1;
        this.ctx.transform(scale, 0, 0, scale, e, f);//基于现有矩阵做变换
        // this.ctx.setTransform(a2, matrix.b, matrix.c, d2, e2, f2);//基于原始矩阵做变换
        this.refresh();
    }

}