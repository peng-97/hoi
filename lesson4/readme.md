# 用layer来管理图层
## 分成两类 一类是客户端图层。在用户可以设置空间图形，属性，和渲染样式
##           另一类是服务端图层，wms，wmts，等等
##  客户端图层有两种graphcilayer  featurelayer
##   graphiclayer里面很多有不同的Graphic，一个Graphic对应一个Symbol；
##   Featurelayer则常用于，同一类要素组成FeatureClass，并通过设置Renderer来呈现为FeatureLayer。
##   arcgis api的管理图层方式比较清晰明白，这里采用arcgis api的arcgis  api4.x层级构造
##   simplemarker 和picturemarker需要涉及到canvas的drawimg
##  不同图层的上下级先不处理