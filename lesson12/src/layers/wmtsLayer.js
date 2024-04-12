import { Layer } from "./layer.js";
import { getGuid, parseParam } from "../core/util.js";
import { WmtsOptions } from "./support/wmtsOption.js";
import { Ctx } from "../support/ctx.js";
import { Tile } from "./support/tile.js";
export class WMTSLayer extends Layer {
    url;
    urlTemplate = "";
    id;
    options;
    ctx;
    loaded;
    tiles =new Map();
    /**
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
        let matrix =this.map.matrix;
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
        //获取中心点的切片行列行列起始位置
        let urls = []
        for (let col = startx; col < endx; col += tileSize) {
            for (let row = starty; row > endy; row -= tileSize) {
                let url = this.getTile({ x: col, y: row })//获取图片地址
                let obj = {
                    url: url,
                    row: row * matrix.d + matrix.f,
                    col: col * matrix.a + matrix.e,
                    x: (col - centerx) / tileSize,
                    y: (row - centery) / tileSize,
                    name:`${col}-${row}-${zoom}`
                }
                urls.push(obj)
                
            }
        }
        urls.sort((a, b) => { //从中心点排序
            return Math.abs(a.y) - Math.abs(b.y) ||  Math.abs(a.x) - Math.abs(b.x)
        })
        ctx.save();
        urls.forEach(item => {
            let tileChcie = this.tiles.get(item.name)
            if (!tileChcie) {
                let tile = new Tile(item.url, item.col,item.row,this.ctx, crs.tileSize)
                this.tiles.set(item.name,tile)
            } else {
                tileChcie.updatePosition(item.col,item.row);
            }
        })
    }

    zoom() {
        this.draw();
    }
    move() {
        this.draw();
    }

}