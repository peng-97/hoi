export class Geometry {
    addTo(map) {
        map.geometries.push(this);
        this.add(map);
    }
    add(map) {

    }
    static GeometryType = {
        Point: 'Point',
        Polyline: "Polyline",
        Polygon: "Polygon",
        MultiPolygon:"MultiPolygon"
    }

}