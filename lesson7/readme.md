## 定义投影加载加载wmts服务
## 天地图服务 
 ## 4490坐标系 https://t0.tianditu.gov.cn/img_c/wmts?request=GetCapabilities&service=wmts
 ## webmercator  https://t0.tianditu.gov.cn/img_w/wmts?request=GetCapabilities&service=wmts

 arcigs中resolutons和scale的关系 
 在zoom=1时  dpi=96;  一英寸=2.54厘米=0.0254米=96像素 
1像素=0.0254/96 m
天地图中

 
  当    resolution: 0.703125;  scale: 295497593.05875003

此时 wmts服务中的ScaleDenominator=2.958293554545656E8
 resolution=1/(scalu)
scale代表比例尺  1cm实际有代表米
所以  1像素=scale*0.0254/96 m
resolutionsx分辨率  1px能表示少距离

地球参数 1度=111194.872221777米
meterToRadiusRatio=111194.872221777
scale和reoultion转换公式
两者转换关系
resolution=scale*0.0254/(dpi*meterToRadiusRatio) 
OGC规范DPI是90.71428571428571 一般wmts用96


所以对应层级的比例比例对应就是 1/resolutions[zoom]

其中4490切片方案

           { level: 0, resolution: 1.40625, scale: 590995197.14166909755553014475 },
            {level: 1, resolution: 0.703125,scale: 295497593.05875003},
            { level: 2,resolution: 0.3515625,scale: 147748796.52937502},
            { level: 3, levelValue: 3, resolution: 0.17578125, scale: 73874398.264687508 },
            { level: 4, levelValue: 4, resolution: 0.087890625, scale: 36937199.132343754 },
            { level: 5, levelValue: 5,resolution: 0.0439453125, scale: 18468599.566171877 },
            {level: 6,levelValue: 6,resolution: 0.02197265625,scale: 9234299.7830859385},
            {level: 7, levelValue: 7,resolution: 0.010986328125, scale: 4617149.8915429693 },
            {level: 8,levelValue: 8,resolution: 0.0054931640625,scale: 2308574.9457714846},
            {level: 9, levelValue: 9,resolution: 0.00274658203125,scale: 1154287.4728857423},
            {level: 10,levelValue: 10,resolution: 0.001373291015625, scale: 577143.73644287116},
            { level: 11,levelValue: 11, resolution: 0.0006866455078125, scale: 288571.86822143558},
            { level: 12, levelValue: 12,resolution: 0.00034332275390625,scale: 144285.93411071779 },
            {level: 13,levelValue: 13, resolution: 0.000171661376953125, scale: 72142.967055358895 },
            {level: 14,levelValue: 14,resolution: 8.58306884765625e-5, scale: 36071.483527679447 },
            { level: 15, levelValue: 15, resolution: 4.291534423828125e-5, scale: 18035.741763839724 },
            {level: 16, levelValue: 16, resolution: 2.1457672119140625e-5,scale: 9017.8708819198619 },
            { level: 17, levelValue: 17, resolution: 1.0728836059570313e-5, scale: 4508.9354409599309},
            { level: 18, levelValue: 18, resolution: 5.3644180297851563e-6,scale: 2254.4677204799655 },
            {level: 19,  levelValue: 19,resolution: 2.68220901489257815e-6, scale: 1127.23386023998275 },
            {level: 20, levelValue: 2, resolution: 1.341104507446289075e-6, scale: 563.616930119991375 }
    ]
