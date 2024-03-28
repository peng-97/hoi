import { Layer } from "./layer.js";
import { setAttribute } from "../core/util.js";
import { WmtsOptions } from "./support/wmtsOption.js";
export class WMTSLayer extends Layer{
    url;
    urlTemplate="";
    map;
    
    options;
    /**
     * 
     * @param {WmtsOptions} options 
     */
    constructor(url,options = new WmtsOptions()) {
        super();
        this.url = url;
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
        let row =parseInt((crs.origin[1] - roods.y) / (crs.tileSize * crs.resolutions[zoom]));
        if (!this.options.urlTemplate) {
            this.options.urlTemplate =this.url + "?request=" + this.request + "&version=" + this.version + "&layer=" + this.layer + "&tilematrixset=" +
                this.tilematrixset + "&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol=${TileCol}&format" + this.format;
        }
        return  this.options.urlTemplate.replace("{TileCol}", col).replace("{TileRow}", row).replace("{TileMatrix}", zoom);
    
    }
    //绘制一个图片  需要知道  图片地址，图片大小，图片位置
    // ctx.drawImage(symbol.picture, matrix.a * projectPoint[0] + matrix.e, matrix.d * projectPoint[1] + matrix.f, symbol.width, symbol.height);
    //影像金字塔结构的wmts服务  
     // 地图当前 zoom  获取当前地图的范围  外扩
    draw() {
        //图片大小  tilesize
        let ctx = this.map.ctx;

        //从原点开始计算
        let crs = this.map.crs;
        let zoom = this.map.zoom;
        //每个切片的在地图表示的实际宽度
        let tileSize = crs.tileSize * crs.resolutions[zoom];
      
        let matrix = ctx.getTransform();
        //切片开始到结束   wmts服务切图原地在左上角
        let bounds = this.map.bound;//地图的范围
        let startx = crs.origin[0] + (Math.floor((bounds.xMin - crs.origin[0]) / tileSize)- 1) * tileSize;//从这开始获取切片//需要扩一下范围
        let starty = crs.origin[1] - (Math.floor((crs.origin[1] - bounds.yMax ) / tileSize)) * tileSize;//从这开始获取切片//需要扩一下范围
        let endx = crs.origin[0] + (Math.floor((bounds.xMax - crs.origin[0]) / tileSize) + 1) * tileSize;//横向上最后获取切片//需要扩一下范围
        let endy = crs.origin[1] - (Math.floor((crs.origin[1] - bounds.yMin) / tileSize) + 1) * tileSize;//横向上最后获取切片//需要扩一下范围
        for (let col = startx; col <endx; col += tileSize){
            for (let row = starty; row >endy; row -= tileSize){
                let url = this.getTile({ x:col, y:row })//获取图片地址
                let scrx = col * matrix.a + matrix.e;
                let scry = row * matrix.d + matrix.f;
                console.log(scrx, scry);
                let img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = url;
                img.onload = () => {
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.drawImage(img, scrx, scry, crs.tileSize, crs.tileSize)
                    ctx.restore();
                }
             
            }
        }
    
    }
}