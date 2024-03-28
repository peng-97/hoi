let ctx = null
const lineWidth = 2;
/**
 * 初始化canvas
 */
function initMap(id) {
    let mapDiv = document.getElementById(id);
    if (!mapDiv) {
        console.log("没有获取到", id);
        return;
    }
    let mapCanvas = document.createElement("canvas");
    mapCanvas.setAttribute("width", mapDiv.clientHeight)
    mapCanvas.setAttribute("height", mapDiv.clientHeight)
    mapDiv.appendChild(mapCanvas)
    window.addEventListener("resize", () => {
        mapCanvas.setAttribute("width", mapDiv.clientHeight)
        mapCanvas.setAttribute("height", mapDiv.clientHeight)
    });
    ctx = mapCanvas.getContext("2d");
}


/**
 * 事件
 */
function canvasEvent() {
     
}


/**
 * 添加数据
 * @param {} geomtry 
 * @returns 
 */
function add(geomtry) {
    if (!ctx) {
        return;
    }
     
    if (geomtry.type == 'Polyline') {
           addLine(geomtry)
    } else if (geomtry.type == "Polygon") {
           addPolygon(geomtry)
    } else if (geomtry.type == 'Point') {
            addPoint(geomtry)
    }
}

/**
 * 画面
 * @param {面} geojonsLine 
 */
function addLine(geojonsLine) {
    let line = geojonsLine.coordinates;
    ctx.save();
    // 设置直线的宽度
    ctx.lineWidth = lineWidth
    // 设置直线的颜色
    ctx.strokeStyle = 'black'
    ctx.beginPath()
    line.forEach((point,index)=> {
        if (index == 0) {
            ctx.moveTo(point[0],point[1])
        } else {
            ctx.lineTo(point[0], point[1])
        }
        
    });
    ctx.stroke()
    ctx.restore();
}

/**
 * 画面
 * @param {线} geojsonPolygon 
 */
function addPolygon(geojsonPolygon) {
    let rings = geojsonPolygon.coordinates;
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#00FF00";
    ctx.fillStyle = "#ff0000";
    ctx.beginPath()
    rings.forEach(lines => {
       
        lines.forEach((point,index) => {
            if (index == 0) {
                ctx.moveTo(point[0], point[1])
            } else {
                ctx.lineTo(point[0], point[1])
            }
        })
      
    })
    ctx.closePath();
    ctx.fill("evenodd");
    ctx.stroke()
    ctx.restore();
}

/**
 * 画点
 * @param {点} geojsonPoint 
 */
function addPoint(geojsonPoint) {
    let point = geojsonPoint.coordinates;
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#00FF00";
    ctx.fillStyle = "#0000FF";
    ctx.beginPath();
    ctx.arc(point[0], point[1], 3, 0, Math.PI * 2, true)
    ctx.closePath();
    ctx.fill()
    ctx.stroke()
    ctx.restore();
}