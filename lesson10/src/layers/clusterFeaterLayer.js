import { gridCentroidUnion } from "../cluster/gridCentroidUnion.js";
import { ClusterSymbol } from "../symbol/clusterSymbol.js";
import { Layer } from "./layer.js";

//聚合图层为要素图层的一种特殊图层，
export class ClusterFeatureLayer extends Layer{
    features = [];
    renderer;//
    cluster = new gridCentroidUnion();//默认
    map;
    ctx;
    constructor() {
         super(["loaded"])
    }
    draw() {
        // 最大比例尺下全部显示，不聚合
        // if (this.map.zoom == this.map.maxZoom) {
        //     this.features.forEach(feature => {
        //         feature.layer = this;
        //         feature.geometry.draw(this.ctx,this.map,this.renderer)
        //       })
        // } else {
           
        // }
        
        this.cluster.createClusters(this.features, this.map);
        debugger
        this.cluster.draw(this);
        this.emit("loaded")
    }



}