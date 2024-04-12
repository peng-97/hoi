
export class Tile {
    url;
    ctx;
    row;
    col;
    image;
    url;
    tileSize ;
    load= false
    //整个地图上只需要存在一个切片
    constructor(url, col,row,ctx,tileSize) {
        this.url = url;
        this.col = col;
        this.row = row;
        this.ctx = ctx;
        this.tileSize = tileSize
        // let _load = false;
        // Object.defineProperty(this, "load", {
        //     set(val) {
        //         _load = val;
        //         if (val) {
        //             this.ctx.clearRect(this.col, this.row, this.tileSize, this.tileSize);
        //             this.ctx.drawImage(this.image, this.col, this.row, this.tileSize, this.tileSize)
        //         }
        //     },
        //     get() {
        //         return _load;
        //     }
        // })
        this.image = new Image();
        this.image.src = this.url;
        this.image.onload = () => {
            this.load = true;
            this.ctx.clearRect(this.col, this.row, this.tileSize, this.tileSize);
            this.ctx.drawImage(this.image, this.col, this.row, this.tileSize, this.tileSize)
        }
    }
    updatePosition(col, row) {
        this.col = col;
        this.row = row;//重置
        this.ctx.clearRect(this.col, this.row, this.tileSize, this.tileSize);
        if (this.load) {
            this.ctx.drawImage(this.image, this.col, this.row, this.tileSize, this.tileSize)
        }
    }
}