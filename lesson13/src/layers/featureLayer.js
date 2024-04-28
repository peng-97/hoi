import { Layer } from "./layer.js";
import { getGuid } from "../core/util.js";
import { Renderer } from "../renderer/renderer.js";
import { SimpleRenderer } from "../renderer/simpleRenderer.js"
import { UniqueValueRenderer } from "../renderer/uniqueValueRenderer.js";
import { ClassBreakRenderer } from "../renderer/classBreakRenderer.js";
import { Requests } from "../support/Request.js";
import { Geometry } from "../geometry/index.js";
import { Graphic, Point, Polygon, Polyline, MultiPolygon, MultiPolyline, MultiPoint } from "../index.js";
import { Label } from "../label/label.js";


export class FeatureLayer extends Layer {
    id = new getGuid();
    features = [];
    renderer;
    ctx;
    url;//可以在指定url地址
    _client = true;
    label;
    showLabel = false;

    constructor(options) {
        super(["click", "loaded"]);
        if (options) {
            this.id= options.id ? options.id : getGuid();
            this.renderer = options.renderer;
            this.url = options.url;
            this.label = options.label ? options.label : new Label();
            this.features = options.features ? options.features : [];
        }
    }
    draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.map.width, this.map.height);
        this.ctx.restore();
         this.loadSource().then(res => {
             let operatist = [];
            this.features.forEach(feature => {
                feature.layer = this;
              operatist=operatist.concat(feature.geometry.draw(this.ctx, this.map, this.getSymbol(feature)))
            })
            if (this.showLabel) {
                let features = this.features.filter(feature => feature.geometry.bound.intersect(this.map.bound))
    
                features = this.label.collision.test(features);
                features.forEach(feature => {
                    this.label.draw(feature)
                })
            }
            this.emit("loaded",operatist)
        })
    }

    //loadSource().then()
    loadSource() {
        return new Promise((resolve,reject) => {
            if (this.url && this.features.length == 0) {
                new Requests(this.url).then(res => {
                    this.features = res.features.map(feature => {
                        let geometry;
                        if (feature.geometry.type == Geometry.GeometryType.Point) {
                            geometry = new Point(feature.geometry.coordinates)
                        } else if (feature.geometry.type == Geometry.GeometryType.Polyline) {
                            geometry = new Polyline(feature.geometry.coordinates)
                        } else if (feature.geometry.type == Geometry.GeometryType.Polygon) {
                            geometry = new Polygon(feature.geometry.coordinates)
                        } else if (feature.geometry.type == Geometry.GeometryType.MultiPolygon) {
                            geometry = new MultiPolygon(feature.geometry.coordinates)
                        } else if (feature.geometry.type == Geometry.GeometryType.MultiPolyline) {
                            geometry = new MultiPolyline(feature.geometry.coordinates)
                        } else {
                            geometry = new MultiPoint(feature.geometry.coordinates)
                        }
                       return  new Graphic({
                            properties: feature.properties,
                            geometry: geometry
                        })
                    });
                    resolve(this.features)
                }).catch(() => {
                     reject([])
                })
            } else {
                resolve(this.features);
            }
        })
    }


    zoom() {

        this.draw();
    }
    move() {
        this.draw();
    }

    /**
     * 为每个feature分配symbol,
     * @param {} feature 
     */
    getSymbol(feature) {
        if (this.renderer.type == Renderer.renderType.SimpleRenderer || this.renderer instanceof SimpleRenderer) {
            return this.renderer.symbol;
        } else if (this.renderer.type == Renderer.renderType.UniqueValue || this.renderer instanceof UniqueValueRenderer) {
            let ren = this.renderer.uniqueValueInfos.find(t => t.value == feature.properties[this.renderer.field.name]);
            return ren ? ren.symbol : this.renderer.defaultSymbol;
        } else if (this.renderer.type == Renderer.renderType.ClassBreak || this.renderer instanceof ClassBreakRenderer) {
            let ren = this.renderer.classBreakInfos.find(t => (t.minValue <= feature.properties[this.renderer.field.name]
                && t.maxValue >= feature.properties[this.renderer.field.name]));
            return ren ? ren.symbol : this.renderer.defaultSymbol;
        }
    }


 


}