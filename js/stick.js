import { Vector, VectorE } from "./vector.js";
export default class Stick {
  constructor(A, B, target_dist) {
    this.A = A;
    this.B = B;
    this.target_dist = target_dist ?? Vector.distance(A.pos, B.pos);
    this.color = "#ffff00";
    this.restitution = 1;
  }
  update() {
    const axis = Vector.sub(this.B.pos, this.A.pos);
    const dist = Math.max(Vector.length(axis), 0.001);

    const diff = this.target_dist - dist;
    const offset = Vector.scale(axis, this.restitution * (diff / dist / 2));
    if (!this.A.pinned) {
      VectorE.sub(this.A.pos, offset);
    }
    if (!this.B.pinned) {
      VectorE.add(this.B.pos, offset);
    }
  }
  render(ctx) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(...this.A.pos);
    ctx.lineTo(...this.B.pos);
    ctx.stroke();
  }
}
