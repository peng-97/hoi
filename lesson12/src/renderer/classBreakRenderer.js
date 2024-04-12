import { Renderer } from "./renderer.js";
import { ClassBreakInfo } from "./support/classBreakInfo.js";
import { Geometry } from "../geometry/index.js"
import { Color } from "../support/Color.js";
import { SimplePointSymbol } from "../symbol/simplePointSymbol.js";
import { SimpleLineSymbol} from "../symbol/simpleLineSymbol.js";
import { SimpleFillSymbol } from "../symbol/simpleFillSymbol.js"
export class ClassBreakRenderer extends Renderer {
    type = "class-break"
    field;
    defaultSymbol;
    
    /**
     * 分类
     */
    classBreakInfos;

    /**
     * 根据要素自动设置分类渲染要素
     * @param {Array} features 
     * @param {*} field 
     * @param {int} classes 
     */
    createClassBreakInfo(features, field, classes) {
        if (features.length == 0) return;
        this.field = field;
        this.classBreakInfos = [];
        let max = 0;
        let min = 0;
        let geometryType = features[0].geometry.type;
        features.forEach((feature, index) => {
            let value = feature.properties[field.name];
            if (index == 0) {
                min = value;
                max = value
            } else {
                min = Math.min(min, value);
                max = Math.max(max, value)
            }
        })
        for (let i = 0; i < classes;i++){
            let info = new ClassBreakInfo();
            info.minValue = min + i * (max - min) / classes;
            info.maxValue = min + (i + 1) * ((max - min) / classes);
            info.label=info.minValue+"_"+info.maxValue;
            if (geometryType == Geometry.GeometryType.Point) {
                info.symbol = new SimplePointSymbol({
                    color: Color.random().getColor(),
                    outline:Color.random().getColor()
                })
            } else if (geometryType == Geometry.GeometryType.Polyline) {
                info.symbol=new SimpleLineSymbol({color:Color.random().getColor()})
            } else if (geometryType == Geometry.GeometryType.Polyline) {
                info.symbol = new SimpleFillSymbol({
                    color: Color.random().getColor(),
                    outline:Color.random().getColor()
                })
            }
            this.classBreakInfos.push(info);
        }

    }
}