import { SubObject } from "../core/subObject.js"

export class  DrawAction extends SubObject{
    constructor(map) {
        super(["vertex-add", "vertex-remove", "draw-complete"])
        this.map = map;
    }
}