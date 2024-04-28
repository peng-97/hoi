
import { WebMercator } from "./src/geo/projection/web-mercator.js";
import {
    Map, Point, Polyline, Polygon, GraphicsLayer, Graphic, SimpleMarkerSymbol,
    FeatureLayer, Requests, ClassBreakRenderer, DefProjection, Crs, WMTSLayer, WMSLayer, Label, UniqueValueRenderer,
    ClusterFeatureLayer, Draw, SimpleFillSymbol
} from "./src/index.js"
let rest_visibleScale = [
    2.958293554545656E8,
    1.479146777272828E8,
    7.39573388636414E7,
    3.69786694318207E7,
    1.848933471591035E7,
    9244667.357955175,
    4622333.678977588,
    2311166.839488794,
    1155583.419744397,
    577791.7098721985,
    288895.85493609926,
    144447.92746804963,
    72223.96373402482,
    36111.98186701241,
    18055.990933506204,
    9027.995466753102,
    4513.997733376551,
    2256.998866688275,
];

let center = [116, 23];
let crs = new Crs({
    projection: new WebMercator([[-20037508.3427892, 20037508.3427892], [20037508.3427892, -20037508.3427892]]),
    // resolutions: rest_visibleResolution, //分辨率
    scales:rest_visibleScale,
    origin: [-20037508.3427892, 20037508.3427892], //切片原点设置整个地图中心点 平面坐标的直接用于切片原点的计算
})
let map = new Map("map", {
    center: center,//地图中心点
    zoom: 6,
    crs: crs
})
//北京
const point = new Point([116.397411, 39.909186]);
let gra = new Graphic({ geometry: point })
let point0 = new Point([0, 0]);
map.graphics.add(gra)
map.graphics.add({
    geometry: point0,
    symbol: new SimpleMarkerSymbol()
})


let wmtsLayer = new WMTSLayer("https://t1.tianditu.gov.cn/vec_w/wmts", {
    urlTemplate: "https://t1.tianditu.gov.cn/vec_w/wmts?service=wmts&version=1.0.0&request=GetTile&layer=vec" +
        "&style=default&TileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&format=tiles&tk=1883a2da124fe27b3c281f9d65356e82"
})
let wmtsLayer1 = new WMTSLayer("https://t1.tianditu.gov.cn/cva_w/wmts", {
    urlTemplate: "https://t1.tianditu.gov.cn/cva_w/wmts?service=wmts&version=1.0.0&request=GetTile&layer=cva" +
        "&style=default&TileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&format=tiles&tk=1883a2da124fe27b3c281f9d65356e82"
})
map.addLayer(wmtsLayer1, 1)
map.addLayer(wmtsLayer, 0)

let layer = new GraphicsLayer({ id: "gra" });

//经线
for (let i = -180; i <= 180; i = i + 10) {
    const line = new Polyline([[i, -80], [i, 80]]);
    let gra = new Graphic({ geometry: line });
    layer.add(gra)
}
//纬线
for (let j = -80; j <= 80; j = j + 10) {
    const line = new Polyline([[-180, j], [180, j]]);
    let gra = new Graphic({ geometry: line });
    layer.add(gra)
}
map.addLayer(layer);
//自定义唯一值渲染
let fLayer = new FeatureLayer({ url: "./assets/data/geojson/beijing.json" })
fLayer.loadSource().then(features => {
    fLayer.renderer = new UniqueValueRenderer();
    fLayer.renderer.createUniqueValueInfos(features, { name: "id" })
    map.addLayer(fLayer);
    features.forEach(feature => {
        feature.on("mouseover", event => {
            console.log(event);
        })
    })
})

fLayer.label = new Label();
fLayer.label.field = { name: "name" };
fLayer.showLabel = true
fLayer.on("click", (event) => {
    console.log(event)
})

let cfLayer = new FeatureLayer();

//分段渲染
new Requests("./assets/data/geojson/junction.json").then(res => {
    cfLayer.features = res.features.map(feature => {
        let geometry = new Point(feature.geometry.coordinates)
        return new Graphic({
            properties: feature.properties,
            geometry: geometry
        })
    });
    cfLayer.features.forEach(feature => {
        feature.on("click", result => {
            console.log("feature点击" + result)
        })
    })
    cfLayer.renderer = new ClassBreakRenderer();
    cfLayer.renderer.createClassBreakInfo(res.features, { name: "DEPTH" }, 5)
    // map.addLayer(cfLayer);
})

let clLayer = new ClusterFeatureLayer()
new Requests("./assets/data/geojson/junction.json").then(res => {
    clLayer.features = res.features.map(feature => {
        let geometry = new Point(feature.geometry.coordinates)
        return new Graphic({
            properties: feature.properties,
            geometry: geometry
        })
    });
    clLayer.renderer = new SimpleMarkerSymbol();
    map.addLayer(clLayer);
})


map.on("click", res => {
    console.log(res)
})

// let wmsLayer = new WMSLayer({ id: "wmsL", url: "https://gisserver.tianditu.gov.cn/TDTService/wms", subLayers: ['HYDA'] });
// map.addLayer(wmsLayer)

let draw = new Draw(map);


const drawPoint = (event) => {
    event.stopPropagation()
    let pointAction = draw.create("point");
    map.focus(draw)
    const addPoint = (event) => {
        map.graphics.add({
            geometry: new Point(event.vertices),
            symbol: new SimpleMarkerSymbol()
        })
        draw.reset();
    }
    pointAction.on("draw-complete", addPoint)
    // pointAction.on("vertex-add", addPoint)
}


const drawPolyline = (event) => {
    event.stopPropagation()
    let polylineAction = draw.create("polyline");
    map.focus(draw)
    const addPolyline = (event) => {
        map.graphics.removeAll();
        map.graphics.add({
            geometry: new Polyline(event.vertices)
        })
        if (event.type == "draw-complete") {
            draw.reset();
        }

    }
    polylineAction.on("vertex-remove", addPolyline)
    polylineAction.on("draw-complete", addPolyline)
    polylineAction.on("vertex-add", addPolyline)
}

const drawPolygon = (event) => {
    event.stopPropagation()
    let polygonAction = draw.create("polygon");
    map.focus(draw)
    const addPolygon = (event) => {
        map.graphics.removeAll();
        map.graphics.add({
            geometry: new Polygon(event.vertices),
            symbol: new SimpleFillSymbol()
        })
        if (event.type == "draw-complete") {
            draw.reset();
        }
    }
    polygonAction.on("vertex-remove", addPolygon)
    polygonAction.on("draw-complete", addPolygon)
    polygonAction.on("vertex-add", addPolygon)
}

/**
 * 
 * @param {*} event 
 */
const clear = (event) => {
    event.stopPropagation()
    map.graphics.removeAll();
}
let buttons = document.getElementsByTagName("button")
for (let button of buttons) {
    switch (button.id) {
        case "point":
            button.addEventListener("click", drawPoint);
            break;
        case "polyline":
            button.addEventListener("click", drawPolyline);
            break;
        case "polygon":
            button.addEventListener("click", drawPolygon);
            break;
        case "clear":
            button.addEventListener("click", clear)
            break;
     }
}
