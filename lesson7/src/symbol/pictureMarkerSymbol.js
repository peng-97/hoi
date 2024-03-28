import { Symbol } from "./symbol.js";
export class PictureMarkerSymbol extends Symbol {
    height = 12;
    width = 12;
    url = "./assets/img/marker.svg";
    // url = 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png'
    type = "picture-marker";
    picture;// 图片  //不用二次获取
    constructor(options) {
        super();
        if (options && options instanceof Object) {
            this.height = options.height ? options.height : this.height;
            this.width = options.width ? options.width : this.width;
            this.url = options.url;//必须要
        }
    }
    loadImg() {
        return new Promise((resolve, reject) => {
            let img = new Image();
  
            img.onload = () => {
                createImageBitmap(img).then(picture => {
                    this.picture = picture;
                    resolve(picture);
                }, err => reject(null));
            };
            img.src = this.url;
            img.onerror = reject;
        })
    }
}