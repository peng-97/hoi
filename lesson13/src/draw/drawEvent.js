export class DrawEvent{
     map;
     vertices;
     type;
     native;
     constructor(map, vertices, type, native) {
          this.map = map;
          this.vertices = vertices;
          this.type = type;
          this.native = native;
     }
}