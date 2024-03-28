import { Layer } from "./layer.js";
import { getGuid } from "../util/core.js";
import { Renderer } from "../renderer/renderer.js";
import { SimpleRenderer } from "../renderer/simpleRenderer.js"
import { UniqueValueRenderer } from "../renderer/uniqueValueRenderer.js";
import { ClassBreakRenderer } from "../renderer/classBreakRenderer.js";
import { Requests } from "../support/Request.js";
import { Geometry } from "../geometry/index.js";
import { Graphic, Point, Polygon, Polyline,MultiPolygon } from "../../index.js";


export class FeatureLayer extends Layer {
    id = new getGuid();
    features = [];
    renderer;
    map;
    url;//可以在指定url地址

    //必须给
    constructor(options) {
        super();
        if (options) {
            this.options = options.id ? options.id: new getGuid();
            this.renderer = options.renderer ;
            this.url = options.url;
        }
    }
    draw() {
        if (this.url && this.features.length==0) {
            new Requests(this.url).then(res => {
                this.features = res.features.map(feature => {
                    let geometry;
                    if (feature.geometry.type == Geometry.GeometryType.Point) {
                        geometry= new Point(feature.geometry.coordinates)
                    } else if (feature.geometry.type == Geometry.GeometryType.Polyline) {
                        geometry= new Polyline(feature.geometry.coordinates)
                    } else if (feature.geometry.type == Geometry.GeometryType.Polygon) {
                        geometry= new Polygon(feature.geometry.coordinates)
                    } else if (feature.geometry.type == Geometry.GeometryType.MultiPolygon) {
                        geometry=new MultiPolygon(feature.geometry.coordinates)
                    }
                    return new Graphic({
                        properties: feature.properties,
                        geometry:geometry
                    })
                });
                if (!this.renderer) {
                    this.renderer = new UniqueValueRenderer();
                    this.renderer.createUniqueValueInfos(this.features, { name: "id" })
                }
                this.features.forEach(feature => {
                    feature.geometry.draw(this.map, this.getSymbol(feature))
                })
            })
        } else {
            this.features.forEach(feature => {
                feature.geometry.draw(this.map, this.getSymbol(feature))
            })
        }
        
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