import { Vector } from "./vector.js";
export default class Solver {
  static constraintRect(point, rect) {
    if (point.pinned) return;
    const vel = Vector.sub(point.pos, point.pos_old);
    if (point.pos[0] < rect[0]) {
      point.pos[0] = rect[0];
      point.pos_old[0] = point.pos[0] + vel[0];
    }
    if (point.pos[0] > rect[0] + rect[2]) {
      point.pos[0] = rect[0] + rect[2];
      point.pos_old[0] = point.pos[0] + vel[0];
    }
    if (point.pos[1] < rect[1]) {
      point.pos[1] = rect[1];
      point.pos_old[1] = point.pos[1] + vel[1];
    }
    if (point.pos[1] > rect[1] + rect[3]) {
      point.pos[1] = rect[1] + rect[3];
      point.pos_old[1] = point.pos[1] + vel[1];
    }
  }
  constructor(rect) {
    this.gravity = [0, 1000];
    this.shapes = [];
    this.points = [];
    this.sticks = [];
    this.obstacles = [];
    this.rect = rect;
  }
  update(dt) {
    const points = [...this.shapes.flatMap((el) => el.points), ...this.points];
    const sticks = [...this.shapes.flatMap((el) => el.sticks), ...this.sticks];

    points.forEach((el) => el.accelerate(this.gravity));
    this.shapes.forEach((el) => el.update(dt));
    points.forEach((el) => el.update(dt));
    sticks.forEach((el) => el.update(dt));
    this.constraint(points);
    this.collision();
  }

  constraint(points) {
    this.obstacles.forEach((el) => el.update(points));
    points.forEach((el) => Solver.constraintRect(el, this.rect));
  }
  collision() {
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i].color = "#00ff00";
    }
    for (let i = 0; i < this.shapes.length - 1; i++) {
      const shape0 = this.shapes[i];
      for (let j = i + 1; j < this.shapes.length; j++) {
        const shape1 = this.shapes[j];
        if (shape0.SATCollision(shape1)) {
          //shape0.collision(shape1);
          shape0.collision(shape1);
          shape0.color = "#ff0000";
          shape1.color = "#ff0000";
        }
      }
    }
  }
  render(ctx) {
    ctx.strokeStyle = "#aaaaaa";
    ctx.beginPath();
    ctx.rect(...this.rect);
    ctx.stroke();
    this.obstacles.forEach((el) => el.render(ctx));
    this.points.forEach((el) => el.render(ctx));
    this.sticks.forEach((el) => el.render(ctx));
    this.shapes.forEach((el) => el.render(ctx));
  }
}
