export function getGuid()  {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function setOptions(obj, options) {
    if (!Object.hasOwn(obj, 'options')) {
        obj.options = obj.options ? Object.create(obj.options) : {};
    }
    for (const i in options) {
        if (Object.hasOwn(options, i)) {
            obj.options[i] = options[i];
        }
    }
    return obj.options;
}

export function setAttribute(obj, options) {
    for (const i in options) {
        if (Object.hasOwn(options, i)) {
            obj[i] = options[i];
        }
    }
}

/**
 * json转为字符串
 */
export function parseParam(param, key) {
    var paramStr = "";
    if (param instanceof String || param instanceof Number || param instanceof Boolean) {
        paramStr += "&" + key + "=" + encodeURIComponent(param);
    } else {
        $.each(param, function (i) {
            var k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
            paramStr += '&' + parseParam(this, k);
        });
    }
    return paramStr.substr(1);
};

export function debounce(fn, delay = 500) {
    // timer 是在闭包中的
    let timer = null;

    return function () {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments)
            timer = null
        }, delay)
    }
}

export function throttle(fn, wait) {
    var pre = Date.now();
    return function () {
        var context = this;
        var args = arguments;
        var now = Date.now();
        if (now - pre >= wait) {
            fn.apply(context, args);
            pre = Date.now();
        }
    }
}
