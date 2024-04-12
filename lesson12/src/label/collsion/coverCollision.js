
import { Collision } from "./collision.js";

/**
 * 碰撞检测，当有交叉叠盖的时候
 * 用于label，当标注元素过多，就会出现标注文字重叠
 */
export class CoverCollision extends Collision{
    /**
     * 检测计算，给一个要素数组，返回一个没有冲突的要素数组
     * @param {Array} features 
     */
    test(features) {
        this.buffer = 10;//向周围扩大
        let bounds = [];
       return features.reduce((acc, nextFeature) => {
           const bound = nextFeature.layer.label.getBounds(nextFeature);//获取当前要素的标注范围
           if (bound) {
               bound.buffer(this.buffer);
               const item = bounds.find(item => item.intersect(bound));
               if (!item) {
                   acc.push(nextFeature);
                   bounds.push(bound);
               }
           }
           return acc;
        }, [])
        
    }
}