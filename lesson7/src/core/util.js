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