import { Point } from "./index.js";

export class Map {
    geometries =[];
    ctx=null;
    mapCanvas = null;
    _drag = {
        isDrag: false,
        start: {
            x:0,
            y:0
        },
        end: {
            x: 0,
            y:0
        }
    }
    center;
    extent;
    zoom;
    constructor(htmlId){
        let mapDiv = document.getElementById(htmlId);
        if (!mapDiv) {
            console.log("没有获取到", htmlId);
            return;
        }
        let mapCanvas = document.createElement("canvas");
        mapCanvas.setAttribute("width", mapDiv.clientWidth)
        mapCanvas.setAttribute("height", mapDiv.clientHeight)
        mapDiv.appendChild(mapCanvas)
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
    };
    /**
     * 添加数据
     * @param {} geometry 
     */
    add(geometry) {
        geometry.toMap(this)
        this.geometries.push(geometry)
    }
    /**
     * 刷新地图
     */
    refresh() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        this.ctx.restore();
        this.geometries.forEach(geometry => geometry.toMap(this));
    }
    clear() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        this.geometries = [];
    }
    onDoubleClick(event) {
        //放大一倍
        // this.ctx.scale(2, 2)
        let tran =this. ctx.getTransform();
        tran.a *= 2
        tran.d *= 2
        this.ctx.setTransform(tran.a, tran.b, tran.c, tran.d, tran.e, tran.f)
        this.refresh();
    }
   
    /**
     * 设置地图中心点
     * @param {Point} [point]  
     */
    setView(point,zoom) {
       
    }

    onMouseDown(event) {
        this._drag.isDrag = true;
        this._drag.start.x = event.x;
        this._drag.start.y = event.y;
    }
    onMouseUp(event) {
        if (this._drag.isDrag) {
            this._drag.isDrag= false;
            this._drag.end.x = event.x;
            this._drag.end.y = event.y;
            const tran = this.ctx.getTransform();
            this.ctx.translate((this._drag.end.x - this._drag.start.x) / tran.a, (this._drag.end.y - this._drag.start.y) / tran.d);
            this.refresh();
        }
    }

    /**
     * 滚轮滑动方法缩小
     * @param {} event 
     */
    onWheel(event) {
        event.preventDefault();
        let scale = 1;
        const sensitivity = 100;
        const delta = event.deltaY / sensitivity;
        if (delta < 0) {
            scale *= delta * -2;
        }
        else {
            scale /= delta * 2;
        }
        const matrix = this.ctx.getTransform();

        const x1 = event.x, x2 = x1; 
        const e2 = x2 - scale * (x1 - matrix.e);
        const a2 = matrix.a * scale;
        const y1 = event.y,y2=y1
        const d2 = matrix.d * scale;
        const f2 = y2 - scale * (y2 - matrix.f)
        this.ctx.setTransform(a2, matrix.b, matrix.c, d2, e2, f2);
        this.refresh();
    }

}




