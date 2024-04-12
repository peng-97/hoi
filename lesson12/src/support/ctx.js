export class Ctx {
    name;
    value;
    type;
    /**
     * 
     * @param {*} type 0是属性 1是函数
     * @param {*} name 
     * @param {*} value 
     */
    constructor(type, name, value) {

        this.type = type;

        this.name = name,
        this.value = value;
    }
}