import { Vector, VectorE } from "./vector.js";
export default class Point {
  constructor(x, y, mass, pinned = false) {
    this.pos = [x, y];
    this.pos_old = [x, y];
    this.acc = [0, 0];
    this.pinned = pinned;
    this.color = "#ff0000";
    this.mass = mass;
  }
  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(...this.pos, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  update(dt) {
    const vel = this.vel;
    VectorE.set(this.pos_old, this.pos);
    if (!this.pinned) {
      VectorE.add(this.pos, Vector.add(vel, Vector.scale(this.acc, dt * dt)));
    }
    VectorE.set(this.acc, [0, 0]);
  }
  accelerate(acc) {
    VectorE.add(this.acc, Vector.scale(acc, 1 / this.mass));
  }
  get vel() {
    return Vector.sub(this.pos, this.pos_old);
  }
}
