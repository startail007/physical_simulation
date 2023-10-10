import { Line, Vector, VectorE } from "./vector.js";

export default class Obstacle {
  constructor(A, B) {
    this.A = A;
    this.B = B;
    this.color = "#0000ff";
  }
  update(points) {
    points.forEach((point) => {
      const vel = point.vel;
      const v0 = Vector.sub(point.pos, this.A);
      const v1 = Vector.sub(this.B, this.A);
      const t = Vector.normal(v1);
      if (Vector.cross(v0, v1) < 0) {
        // const projection = Vector.projection(vel, v1);
        // const force = Vector.sub(vel, projection);
        // const newVel = Vector.add(Vector.negate(force), Vector.scale(projection, 0.9));

        const newPoint = Line.shortestDistancePointToLine(point.pos, this.A, this.B);
        // VectorE.sub(newPoint, Vector.scale(projection, 0.1));
        VectorE.set(point.pos, newPoint);
        if (Vector.dot(vel, t) > 0) {
          const newVel = Vector.rebound(vel, v1);
          VectorE.set(point.pos_old, Vector.sub(newPoint, newVel));
        }
      }
    });
    // console.log(points);
  }
  render(ctx) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(...this.A);
    ctx.lineTo(...this.B);
    ctx.stroke();
  }
}
