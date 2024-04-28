import { Crs } from "../../geo/crs/crs.js";
import { Geometry } from "../../geometry/index.js";
import { Collision } from "./collision.js";
export class DistanceCollsion extends Collision{
    distance = 25;
 /**
  * 判断要素之间距离有没有超过阈值
  * @param {Array} features 
  */
    test(features) {
        // let results = [];
        // features.forEach(feature => {
        //     let fe = results.find(tP => {
        //         return this.getDistance(feature.geometry, tP.geometry, tP.layer.map.projection, tP.layer.map.ctx) < this.distance;
        //     })
        //     if (!fe) {
        //          results.push(fe)
        //     }
        // })
        // return results;
   
        return features.reduce((acc, cur) => {
            const item = acc.find((item) => {
                const distance = this.getDistance(cur.geomtry, item.geometry, cur.layer.map.projection,cur.layer.map.ctx);
                return distance <= this.distance;
            });
            if (!item) acc.push(cur);
            return acc;
        }, []); 
    
    }
     
    /**
     * 计算两个图形的距离  得到得屏幕在电脑上屏幕的距离单位  像素值
     * @param {Geometry} geometry1 
     * @param {Geometry} geometry2 
     * @param {Crs.projection} projection 
     * @param {*} ctx 
     */
    getDistance(geometry1, geometry2,projection,ctx) {
        let matrix = ctx.getTransform();
        let center1 = projection.projection(geometry1.getCenter());//投影，要计算成屏幕坐标
        let screenCenter1 = [center1[0] * ctx.matrix.a + matrix.e, center1[1] * matrix.d + f];
        let center2 = projection.projection(geometry2.getCenter());//
        let screenCenter2 = [center2[0] * ctx.matrix.a + matrix.e, center2[1] * matrix.d + f];
        return Math.sqrt(Math.pow((screenCenter2[0] - screenCenter1[0]), 2) + Math.pow((screenCenter2[1] - screenCenter1[1]), 2));
    }
}