import { getGuid, setAttribute, parseParam } from "../core/util.js";
import { Layer } from "./layer.js";
export class WMSLayer extends Layer {
    url;
    id;
    wmsOptions
    subLayers = []
    title;
    id;
    ctx;

    version = "1.1.0";//or 1.3.0
    format = "image/png"
    customLayerParameters;
    image;
    constructor(wmsOptions) {
        super(['loaded']);
        setAttribute(this, wmsOptions);
        if (!this.id) {
            this.id = getGuid();
        }
      
    }
    /**
     * 获取地图
     */
    getMap() {
        let bbox = this.map.bound;
        let url = "";
        if (this.version == "1.1.0") {
            url = `${this.url}?request=getmap&service=wms&width=${this.map.mapCanvas.width}&height=${this.map.mapCanvas.height}&verison=${this.version}
        &bbox=${bbox.xMin},${bbox.yMin},${bbox.xMax},${bbox.yMax}&srs=${this.map.crs.code}&layers=${this.subLayers.join(".")}&transparent=true&format=${this.format}`
        } else {
            url = `${this.url}?request=getmap&service=wms&width=${this.map.mapCanvas.width}&height=${this.map.mapCanvas.height}&verison=${this.version}
        &bbox=${bbox.xMin},${bbox.yMin},${bbox.xMax},${bbox.yMax}&crs=${this.map.crs.code}&layers=${this.subLayers.join(".")}&transparent=true&format=${this.format}`
        }
        return url;
    }
    draw() {
        let ctx = this.ctx;
        let url = this.getMap();
        if (!this.image) {
            let img = new Image();
            img.src = url;
            // img.crossOrigin = "Anonymous";
            img.onload = () => {
                this.image = img;
                ctx.save();
                ctx.clearRect(0, 0, this.map.width, this.map.height);
                ctx.drawImage(img, 0, 0, this.map.width, this.map.height)
                ctx.restore();
                this.emit("loaded", {})
            }
            img.onerror = () => {
                this.emit("loaded", {})
            }
        } else {
            let img = this.image;
            img.setAttribute("src", url)
            ctx.save();
            ctx.clearRect(0, 0, this.map.width, this.map.height);
            // ctx.drawImage(img, 0, 0, this.map.width, this.map.height)
            ctx.restore();
            this.emit("loaded", {})
        }
    }

    zoom() {
        this.draw();
    }
    move() {
        this.draw();
    }


}