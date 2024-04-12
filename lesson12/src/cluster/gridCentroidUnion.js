import { Bounds } from "../geometry/bound.js";
import { Map } from "../index.js";
import { Cluster } from "./index.js";

export class gridCentroidUnion extends Cluster{
   /**
    * 单位是像素
    */
    size = 30;
    distance = 50;
    clusters=[]
    /**
     * 生成聚合
     * @param {Array} features 
     * @param {Map} map 
     */
    createClusters(features, map) {
        //生成网格
        let bound = map.bound;
       
        let colstep = (bound.xMax-bound.xMin) / this.size;//一个格子的实际地理坐标的宽度
        let rowstep =(bound.yMax-bound.yMin)/ this.size;
        let grids = [];
     
        for (let indexi = 0; indexi < this.size; indexi ++) {
            for (let indexj = 0; indexj <this.size; indexj++) {
                grids.push({
                    feature: null,
                    center: [],//屏幕像素单位
                    count: 0,
                    rings: [],
                    bound: new Bounds([bound.xMin + indexi * colstep, bound.yMin + indexj *rowstep], [bound.xMin + (indexi + 1) * colstep, bound.yMin + (indexj + 1) * rowstep])
                })
            }
        }
        //计算各个网格里面有多少要素  //当网格只有一个要素的时候，那个要素是不用聚合的
        features.forEach(feature => {
            let projectPoint = map.projection.project(feature.geometry.coordinates);
            let pBound = new Bounds([projectPoint[0], projectPoint[1]], [projectPoint[0], projectPoint[1]]);
            let grid = grids.find(gr => {
                return gr.bound.intersect(pBound)
            })
            if (grid) {
                grid.feature = feature;
                grid.count++;
                grid.rings.push(feature.geometry.coordinates);
            }
        })
        //计算网格质心各个网格中要素中心点聚在一起中心位置，不一定在格网中心，应该在各个要素思安形成平面的中心 
        grids.forEach(grid => {
            grid.center = this.getCenter(grid.rings,map)
        })
        //合并在容差范围内的网格要素 //
        let pDistacne = this.distance / map.matrix.a;
        grids = grids.filter(t => t.count > 0).reduce((acc, grid) => {
            let cgrid = acc.find(t => {
                return Math.sqrt(Math.pow(t.center[0] - grid.center[0],2) + Math.pow(t.center[1] - grid.center[1],2)) <pDistacne;
            })
            if (cgrid) {
                cgrid.count += grid.count;
                cgrid.rings=cgrid.rings.concat(grid.rings)
            } else {
                acc.push(grid);
            }
            return acc;
        }, [])
        this.clusters = grids;
    }
    /**
     *  @returns 计算中心  一个环
     * 来自leaflet
     */
    getCenter(rings,map) {
        let center = rings.reduce((acc, point) => {
            if (acc.length == 0) {
                return point;
            } else {
                acc = [acc[0] / 2 + point[0] / 2, acc[1] / 2 + point[1] / 2]
            }
            return acc;
            
        },[])
        let matrix = map.matrix;
        return center;
    }
}