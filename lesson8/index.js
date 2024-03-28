
import {
    Map, Point, Polyline, Polygon, GraphicsLayer, Graphic, PictureMarkerSymbol,
    FeatureLayer, Requests, ClassBreakRenderer, DefProjection, Crs, WMTSLayer,WMSLayer
} from "./src/index.js"
var rest_visibleResolution = [
    1.40625,
    0.703125,
    0.3515625,
    0.17578125,
    0.087890625,
    0.0439453125,
    0.02197265625,
    0.010986328125,
    0.0054931640625,
    0.00274658203125,
    0.001373291015625,
    6.866455078125E-4,
    3.4332275390625E-4,
    1.71661376953125E-4,
    8.58306884765625E-5,
    4.291534423828125E-5,
    2.1457672119140625E-5,
    1.0728836059570312E-5,
    5.364418029785156E-6,
    2.682209064925356E-6,
    1.3411045324626732E-6
]

let center = [116, 23];
//   let crs = new Crs({
//         code: "EPSG:4490",
//         def: "+proj=longlat +ellps=GRS80 +no_defs",
//         resolutions: arr, //分辨率
//         dpi: 96, //一个单位内含有的像素
//         bounds: [[-180, 90], [180, -90]],//给平面坐标的范围(xy倒置即可)
//         origin: [100, 20], //原点设置整个地图中心点  经纬坐标 用来设
//     });
let projecttion = new DefProjection("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs", [[-180, 90], [180, -90]])
let crs = new Crs({
    projection: projecttion,
    resolutions: rest_visibleResolution, //分辨率
    // scales:scales,
    dpi: 96, //一个单位内含有的像素
    bounds: [[-180, 90], [180, -90]],//给平面坐标的范围(cgcs坐标xy倒置即可)
    origin: [-180, 90], //切片原点设置整个地图中心点 平面坐标
})
let map = new Map("map", {
    center: center,//地图中心点
    zoom: 5,
    crs: crs
})
//北京
const point = new Point([116.397411, 39.909186]);
let gra = new Graphic({ geometry: point })
let point0 = new Point([0, 0]);
map.graphics.add(gra)
map.graphics.add({
    geometry: point0,
    symbol: new PictureMarkerSymbol()
})


let wmtsLayer = new WMTSLayer("https://t1.tianditu.gov.cn/vec_c/wmts", {
    urlTemplate: "https://t1.tianditu.gov.cn/vec_c/wmts?service=wmts&version=1.0.0&request=GetTile&layer=vec" +
        "&style=default&TileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&format=tiles&tk=1883a2da124fe27b3c281f9d65356e82"
})
let wmtsLayer1 = new WMTSLayer("https://t1.tianditu.gov.cn/cva_c/wmts", {
    urlTemplate: "https://t1.tianditu.gov.cn/cva_c/wmts?service=wmts&version=1.0.0&request=GetTile&layer=cva" +
        "&style=default&TileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&format=tiles&tk=1883a2da124fe27b3c281f9d65356e82"
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

map.addLayer(fLayer);

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
    cfLayer.renderer = new ClassBreakRenderer();
    cfLayer.renderer.createClassBreakInfo(res.features, { name: "DEPTH" }, 5)
    map.addLayer(cfLayer);
})



let wmsLayer = new WMSLayer({ id: "wmsL", url: "https://gisserver.tianditu.gov.cn/TDTService/wms", subLayers: ['HYDA'] });
map.addLayer(wmsLayer)