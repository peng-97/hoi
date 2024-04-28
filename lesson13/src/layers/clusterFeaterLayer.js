import { gridCentroidUnion } from "../cluster/gridCentroidUnion.js";
import { ClusterSymbol } from "../symbol/clusterSymbol.js";
import { Layer } from "./layer.js";
export class ClusterFeatureLayer extends Layer{
    features = [];
    renderer;//
    cluster = new gridCentroidUnion();//默认
    ctx;
    _client = true;
    bound;
    constructor() {
        super(["loaded"])
        let _map
        Object.defineProperty(this, "map", {
            get(val) {
                return _map
            },
            set(val) {
                _map = val;
                this.cluster.createClusters(this.features, _map)
                _map.on("zoom", this.zoom.bind(this))
                _map.on("move", this.move.bind(this))
            }
        })
    }
    draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.map.width, this.map.height);
        this.ctx.restore();
        this.cluster.draw(this);
        this.emit("loaded")
    }

    zoom() {
        this.cluster.createClusters(this.features, this.map)
        this.draw();
    }
    move() {
        this.draw();
    }
}