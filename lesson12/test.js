
function getTile(prams) {
    
   let data=  fetch("https://t1.tianditu.gov.cn/vec_c/wmts?service=wmts&version=1.0.0&request=GetTile&layer=vec&style=default&TileMatrixSet=c&TileMatrix=5&TileRow=4&TileCol=29&format=tiles&tk=1883a2da124fe27b3c281f9d65356e82")
     
    data.then(res => {
         
    })
    while (true) {
         
    }
    return 
}


 function getData(){
    let data =  getTile()
    return data;
}
const result = getData()
debugger