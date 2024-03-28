# 将map类化，使用类与对象的方式来使用地图

# 对canvas能够实现移动、放大，缩小等操作

## 关于涉及坐标系的问题

```
canvas的矩阵变换  ( abcdef) 其中  ef 分别为垂直水平位移，ad为水平垂直缩放，bc为水平垂直旋转
     ctx.transform(a,b,c,d,e,f);
     主要考虑平移和缩放
     getTransform();获取原始的坐标矩阵
     setTransform() 设置目标坐标矩阵-以为初始矩阵开始
     tranform();设置目标转换矩阵，以当前矩阵为参数

     例1 双击放大功能
       原理 
         let tran=ctx. getTransform();
        tran.a*=2
        tran.d*=2
        ctx.setTransform(tran.a,tran.b,tran.c,tran.d,tran.e,tran.f)
           本身canvas提供简单缩放方法scale（x,y)
                           单独平移translate(x,y)
                           单独旋转rotate（x,y)
     例2 滚轮滑动放大缩小,即就是缩放的同时有平移，计算在缩放的情况下，矩阵平移的值是多少
          首先先计算滚轮滑动多少，就能计算设置相应缩放倍数
          再计算滑动中需要的缩放平移量:
               计算水平方向
                  需要
                  x1  原始坐标   可直接获取
                  x2  平移后的坐标   不改变屏幕坐标的值  所以x1=x2
                  e1  平移前的矩阵  可通过    getTransform()获取
                  e2  平移后的矩阵值
                  a1  原始坐标的缩放
                  a2  现在坐标矩阵缩放
                  scale  缩放比例
                  求e也就是矩阵参数
                      其中 (x1-e1)/a1=(x2-e2)/a2
                      求得 e2 = x2 - a2 * (x1 中- e1) / a1
                     其中  e=(e2-e1)/a1 , scale=a2/a1 
                     解得 
                       e=(x2 - scale * (x1 - e1) - e1) / a1
               垂直方向同理可得
                       f=(y2 - scale * (y1 - f1) - f1) / a1

             矩阵变换  transform方式
```
