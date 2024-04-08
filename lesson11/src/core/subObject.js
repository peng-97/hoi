export class SubObject{
     
    _handlers = {};
      
    //每次实例化都有哪事件
    /**
     * 
     * @param {Array} events 
     */
    constructor(events) {
        events.forEach(event => {
            this._handlers[event] = [];
          })
    }

   /**
    * 注册事件  将 注册事件handler放到当前实例的事件数组中，
    * @param {*} event 
    * @param {*} handler
    */
    on(event, handler) {
        if (!this._handlers[event].find(t => t === handler)) {
            this._handlers[event].push(handler)
        }
       
    }
    /**
     * 激发传递事件 
     * @param {string} event 激发何种事件，将对应事件的所有方法都循环调用一次
     * @param {*} param 调用的方法会给哪些参数
     */ 
    emit(event, param) {
        this._handlers[event].forEach(handler => {
            handler(param)
         })
    }


    /**
     * 取消对应的事件
     * @param {string} event 
     * @param {*} handler 取消对应事件的方法对象，(理论上是一个函数对象)
     */
    off(event, handler) {
        if (this._handlers[event] && this._handlers[event] instanceof Array) {
            let index = this._handlers[event].findIndex(item => item == handler)
            if (index > -1) {
                this._handlers[event].splice(index, 1);
            }
        }
    }
}