import { Renderer } from "./renderer.js";
import { Geometry } from "../geometry/index.js"
import { Color } from "../support/Color.js";
import { SimpleMarkerSymbol } from "../symbol/simpleMarkerSymbol.js";
import { SimpleLineSymbol } from "../symbol/simpleLineSymbol.js";
import { SimpleFillSymbol } from "../symbol/simpleFillSymbol.js"
import { UniqueValueInfo } from "./support/uniqueValueInfo.js";
export class UniqueValueRenderer extends Renderer {
    type = "unique-value";
    /**
     * 默认样式
     */
    defaultSymbol;
    /**
     * 字段
     */
    field;
    /**
     * 唯一值
     */
    uniqueValueInfos;


    /**
     * 根据要素自动设置唯一值渲染
     * @param {Array} features 
     * @param {*} field 
     * @param {int} classes 
     */
    createUniqueValueInfos(features, field) {
        this.field = field;
        this.uniqueValueInfos = []
        if (features.length == 0) return;
        let geometryType = features[0].geometry.type;
        features.forEach(feature => {
            let value = feature.properties[field.name]
            let unique = this.uniqueValueInfos.find(t => t.value == value);
            if (!unique) {
                let info = new UniqueValueInfo();
                info.value = value;
                if (geometryType == Geometry.GeometryType.Point) {
                    info.symbol = new SimpleMarkerSymbol({
                        color: Color.random().getColor(),
                        outline: {
                            color: Color.random().getColor(),
                            width: 8
                        }
                    })
                } else if (geometryType == Geometry.GeometryType.Polyline) {
                    info.symbol = new SimpleLineSymbol({ color: Color.random().getColor() })
                } else if (geometryType == Geometry.GeometryType.Polygon) {
                    info.symbol = new SimpleFillSymbol({
                        color: Color.random().getColor(),
                        outline: {
                            color: Color.random().getColor(),
                            width:8
                        }
                    })
                }
                this.uniqueValueInfos.push(info);
            }
        })
    }

}