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
    map;
    version = "1.1.0";//or 1.3.0
    format = "image/png"
    customLayerParameters;
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
        let img = new Image();
        img.src = this.getMap();
        // img.crossOrigin = "Anonymous";
        img.onload = () => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            // ctx.clearRect(0, 0, this.map.mapCanvas.width, this.map.mapCanvas.height);
            ctx.drawImage(img, 0, 0, this.map.mapCanvas.width, this.map.mapCanvas.height)
            ctx.restore();
            this.emit("loaded", {})
        }
        img.onerror = () => {
            this.emit("loaded", {})
        }
    }
}