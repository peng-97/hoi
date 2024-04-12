import { ClusterSymbol } from "../symbol/clusterSymbol.js";

export class Cluster{
    clusterSymbol=new ClusterSymbol()//
    clusters = [];//聚合要素
    draw(layer) {
        this.clusters.forEach(cluster => {
            cluster.feature.layer = layer;
            if (cluster.count == 1) {
                cluster.feature.geometry.draw(layer.map.ctx, layer.map,layer.renderer)
            } else {
                let matrix = layer.map.matrix;
                let Scenter = [matrix.a * cluster.center[0] + matrix.e, matrix.d * cluster.center[1] + matrix.f]
                let symbol = this.clusterSymbol;
                let ctx = layer.ctx;
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.strokeStyle =symbol.l;
                ctx.fillStyle = symbol.warpColor;
                ctx.lineWidth =symbol.lineWidth;
                ctx.beginPath(); //Start path
                //keep size 画外圈
                ctx.arc(Scenter[0], Scenter[1], symbol.getRadius(cluster.count)+1, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = symbol.getInnerColor(cluster.count);
                ctx.beginPath(); //Start path
                //keep size 画内圈
                ctx.arc(Scenter[0], Scenter[1], symbol.getRadius(cluster.count), 0, Math.PI * 2, true);
                ctx.fill();
                ctx.stroke();
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle =symbol.fontColor;
                ctx.font =symbol.getfontSize(cluster.count) + "px/1 " + symbol.fontFamily + " " +symbol.fontWeight;
                ctx.fillText(symbol.getCount(cluster.count), Scenter[0], Scenter[1]);
                ctx.restore();
             }
        })
      
    }
}