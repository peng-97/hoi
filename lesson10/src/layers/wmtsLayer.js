import { Layer } from "./layer.js";
import { getGuid, parseParam } from "../core/util.js";
import { WmtsOptions } from "./support/wmtsOption.js";
import { Ctx } from "../support/ctx.js";
export class WMTSLayer extends Layer {
    url;
    urlTemplate = "";
    map;
    id;
    options;
    ctx;
    loaded;
    tiles = [];
    /**
     * 
     * @param {WmtsOptions} options 
     */
    constructor(url, options = new WmtsOptions()) {
        super(['loaded']);
        this.url = url;
        this.id = options.id ? options.id : getGuid();
        this.options = options;
    }

    /**
     * xy
     * @param {} roods 
     */
    getTile(roods) {
        let crs = this.map.crs;
        let zoom = this.map.zoom;
        let col = parseInt((roods.x - crs.origin[0]) / (crs.tileSize * crs.resolutions[zoom]));
        let row = parseInt((crs.origin[1] - roods.y) / (crs.tileSize * crs.resolutions[zoom]));
        if (!this.options.urlTemplate) {
            this.options.urlTemplate = this.url + "?request=" + this.request + "&version=" + this.version + "&layer=" + this.layer + "&tilematrixset=" +
                this.tilematrixset + "&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol=${TileCol}&format" + this.format + parseParam(this.options.customLayerParameters);
        }
        return this.options.urlTemplate.replace("{TileCol}", col).replace("{TileRow}", row).replace("{TileMatrix}", zoom);
    }



    //绘制一个图片  需要知道  图片地址，图片大小，图片位置
    // ctx.drawImage(symbol.picture, matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f, symbol.width, symbol.height);
    //影像金字塔结构的wmts服务  
    // 地图当前 zoom  获取当前地图的范围  外扩
    // draw() {
    //     //图片大小  tilesize
    //     let ctx = this.ctx;
    //     this.loaded = false;
    //     //从原点开始计算
    //     let crs = this.map.crs;
    //     let zoom = this.map.zoom;
    //     //每个切片的在地图表示的实际宽度
    //     let tileSize = crs.tileSize * crs.resolutions[zoom];
    //     let count = 0;
    //     let matrix = ctx.getTransform();
    //     //切片开始到结束   wmts服务切图原点在左上角
    //     let bounds = this.map.bound;//地图的范围
    //     let startx = crs.origin[0] + (Math.floor((bounds.xMin - crs.origin[0]) / tileSize)) * tileSize;//从这开始获取切片//需要扩一下范围
    //     let starty = crs.origin[1] - (Math.floor((crs.origin[1] - bounds.yMax) / tileSize)) * tileSize;//从这开始获取切片//需要扩一下范围
    //     let endx = crs.origin[0] + (Math.floor((bounds.xMax - crs.origin[0]) / tileSize) + 1) * tileSize;//横向上最后获取切片//需要扩一下范围
    //     let endy = crs.origin[1] - (Math.floor((crs.origin[1] - bounds.yMin) / tileSize) + 1) * tileSize;//横向上最后获取切片//需要扩一下范围
    //     let tileSum = Math.abs(endx - startx) * Math.abs(endy - starty) / Math.pow(tileSize, 2);//个切片
    //     for (let col = startx; col < endx; col += tileSize) {
    //         for (let row = starty; row > endy; row -= tileSize) {
    //             let url = this.getTile({ x: col, y: row })//获取图片地址
    //             let scrx = col * matrix.a + matrix.e;
    //             let scry = row * matrix.d + matrix.f;
    //             // console.log(scrx, scry);
    //             if (count == this.tiles.length) {
    //                 let img = new Image();
    //                 img.src = url;
    //                 img.onload = () => {
    //                     ctx.save();
    //                     ctx.setTransform(1, 0, 0, 1, 0, 0);
    //                     // this.ctx.clearRect(scrx, scry, crs.tileSize, crs.tileSize);
    //                     ctx.drawImage(img, scrx, scry, crs.tileSize, crs.tileSize)
    //                     ctx.restore();
    //                     count++;
    //                     this.tiles.push(img)
    //                     if (tileSum == count) {
    //                         this.loaded = true;
    //                         this.emit("loaded", {})
    //                     }

    //                 }
    //                 img.onerror = () => {
    //                     count++;
    //                     if (tileSum == count) {
    //                         this.loaded = true;
    //                         this.emit("loaded", {})
    //                     }
    //                 }
    //             } else {
    //                 this.tiles[count].setAttribute("src", url)
    //                 // ctx.save();
    //                 // ctx.setTransform(1, 0, 0, 1, 0, 0);
    //                 // this.ctx.clearRect(scrx, scry, crs.tileSize, crs.tileSize);
    //                 // ctx.drawImage(this.tiles[count], scrx, scry, crs.tileSize, crs.tileSize)
    //                 // ctx.restore();
    //                 count++;
    //                 if (tileSum == count) {
    //                     this.loaded = true;
    //                     this.emit("loaded", {})
    //                 }
    //             }
    //         }
    //     }
    // }


    /**
     * 改成由中间向四周加载,
     */
    draw() {
        //图片大小  tilesize
        let operateList = [];
        let ctx = this.ctx;
        this.loaded = false;
        //从原点开始计算
        let crs = this.map.crs;
        let zoom = this.map.zoom;
        //每个切片的在地图表示的实际宽度
        let tileSize = crs.tileSize * crs.resolutions[zoom];
        let count = 0;
        let matrix = ctx.getTransform();
        //切片开始到结束   wmts服务切图原点在左上角
        let bounds = this.map.bound;//地图的范围
        let startx = crs.origin[0] + (Math.floor((bounds.xMin - crs.origin[0]) / tileSize)) * tileSize;//从这开始获取切片//需要扩一下范围
        let starty = crs.origin[1] - (Math.floor((crs.origin[1] - bounds.yMax) / tileSize)) * tileSize;//从这开始获取切片//需要扩一下范围
        let endx = crs.origin[0] + (Math.floor((bounds.xMax - crs.origin[0]) / tileSize) + 1) * tileSize;//横向上最后获取切片//需要扩一下范围
        let endy = crs.origin[1] - (Math.floor((crs.origin[1] - bounds.yMin) / tileSize) + 1) * tileSize;//横向上最后获取切片//需要扩一下范围
        let center = this.map.center;//中心 地理坐标的
        let proCenter = this.map.projection.project(center);
        //获取中心点的切片行列行列起始位置
        let centerx = crs.origin[0] + (Math.floor((proCenter[0] - crs.origin[0]) / tileSize)) * tileSize;
        let centery = crs.origin[1] - (Math.floor((crs.origin[1] - proCenter[1]) / tileSize)) * tileSize;
        let urls = []
        for (let col = startx; col < endx; col += tileSize) {
            for (let row = starty; row > endy; row -= tileSize) {
                let url = this.getTile({ x: col, y: row })//获取图片地址
                let obj = {
                    url: url,
                    x: (col - centerx) / tileSize,
                    y: (row - centery) / tileSize,
                    row: row * matrix.d + matrix.f,
                    col: col * matrix.a + matrix.e
                }
                urls.push(obj)
            }
        }
        urls.sort((a, b) => { //从中心点排序
            return Math.abs(a.y) - Math.abs(b.y) ||  Math.abs(a.x) - Math.abs(b.x)
        })
        let tileSum = urls.length;
        urls.forEach(item => {
            let location = this.tiles.find(t => t.x == item.x && t.y == item.y);
            // if (!location) {
                let img = new Image();
                img.src = item.url;
                img.onload = () => {
                    createImageBitmap(img).then(img => {
                        ctx.save();
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        operateList.push(new Ctx(1, "drawImage", [img, item.col, item.row, crs.tileSize, crs.tileSize]));
                        // // this.ctx.clearRect(scrx, scry, crs.tileSize, crs.tileSize);
                        ctx.drawImage(img, item.col, item.row, crs.tileSize, crs.tileSize)
                        ctx.restore();
                        count++;
                        this.tiles.push({ ...item, img: img })
                        if (tileSum == count) {
                            this.loaded = true;
                            this.emit("loaded", operateList)
                        }
                    }, error => {
                        count++;
                        this.tiles.push({ ...item, img: img })
                        if (tileSum == count) {
                            this.loaded = true;
                            this.emit("loaded", operateList)
                        }
                    })
                }
                img.onerror = () => {
                    count++;
                    if (tileSum == count) {
                        this.loaded = true;
                        this.emit("loaded", operateList)
                    }
                }
        })
    }

    createImage = (src) => {
        new Promise((resolve, reject) => {
            let img = new Image();
            img.src = item.url;
            img.onload = () => {
                 
            }
            resolve(img)
        })
    }
}