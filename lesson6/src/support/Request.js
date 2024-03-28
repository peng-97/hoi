

export class Requests {
    constructor(url, type, data) {
        let request;
        let body;
        if (type == "get") {
            url = url + this.objToUrlParam(data);
            request = new Request(url, { method: type })
        } else {
            body = JSON.stringify(data);
            request = new Request(url, {
                method: type,
                body: body,
            
            })
        };

        return fetch(request).then(res => {
           
            return res.json();
        })
    }

    objToUrlParam(obj, ignoreFields = []) {
        let newObj = Object.keys(obj)
        if (newObj.length == 0) {
            return null
        }
        return Object.keys(obj)
            .filter(
                (key) =>
                    ignoreFields.indexOf(key) === -1 &&
                    obj[key] !== null &&
                    obj[key] !== undefined &&
                    obj[key] !== ""
            )
            .map((key) => key + "=" + obj[key])
            .join("&");
    }

}