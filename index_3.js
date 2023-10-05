import { Vector, VectorE } from "./js/vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let cWidth = canvas.width;
let cHeight = canvas.height;
class Point {
  constructor(x, y, mass, pinned = false) {
    this.pos = [x, y];
    this.pos_old = [x, y];
    this.acc = [0, 0];
    this.radius = 10;
    this.pinned = pinned;
    this.color = "#ff0000";
    this.mass = mass;
  }
  render() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(...this.pos, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
  update(dt) {
    const vel = Vector.sub(this.pos, this.pos_old);
    VectorE.set(this.pos_old, this.pos);
    if (!this.pinned) {
      VectorE.add(this.pos, Vector.add(vel, Vector.scale(this.acc, dt * dt)));
    }
    VectorE.set(this.acc, [0, 0]);
  }
  accelerate(acc) {
    VectorE.add(this.acc, Vector.scale(acc, 1 / this.mass));
  }
}
class Stick {
  constructor(A, B, target_dist) {
    this.A = A;
    this.B = B;
    this.target_dist = target_dist ?? Vector.distance(A.pos, B.pos);
  }
  update() {
    const axis = Vector.sub(this.B.pos, this.A.pos);
    const dist = Vector.length(axis);
    const diff = this.target_dist - dist;
    const offset = Vector.scale(axis, diff / dist / 2);
    if (!this.A.pinned) {
      VectorE.sub(this.A.pos, offset);
    }
    if (!this.B.pinned) {
      VectorE.add(this.B.pos, offset);
    }
  }
  render() {
    ctx.strokeStyle = "#00ff00";
    ctx.beginPath();
    ctx.moveTo(...this.A.pos);
    ctx.lineTo(...this.B.pos);
    ctx.stroke();
  }
}
class Solver {
  constructor() {
    this.gravity = [0, 1000];
    this.points = [];
    this.sticks = [];
    this.pos = [400, 400];
    this.radius = 300;
    this.rect = [0, 0, 800, 600];
  }
  update(dt) {
    // const sub_steps = 6;
    // const sub_dt = dt / sub_steps;
    // for (let t = 0; t < sub_steps; t++) {
    //   this.applyGravity();
    //   this.points.forEach((el) => el.update(sub_dt));
    //   this.sticks.forEach((el) => el.update(sub_dt));
    //   this.solverConstraint();
    // }
    this.applyGravity();
    this.points.forEach((el) => el.update(dt));
    this.sticks.forEach((el) => el.update(dt));
    this.solverConstraint();
  }

  applyGravity() {
    this.points.forEach((el) => el.accelerate(this.gravity));
  }

  solverConstraint() {
    this.points.forEach((el) => {
      const vel = Vector.sub(el.pos, el.pos_old);
      if (el.pos[0] - el.radius < this.rect[0]) {
        el.pos[0] = this.rect[0] + el.radius;
        el.pos_old[0] = el.pos[0] + vel[0];
      }
      if (el.pos[0] + el.radius > this.rect[0] + this.rect[2]) {
        el.pos[0] = this.rect[0] + this.rect[2] - el.radius;
        el.pos_old[0] = el.pos[0] + vel[0];
      }
      if (el.pos[1] - el.radius < this.rect[1]) {
        el.pos[1] = this.rect[1] + el.radius;
        el.pos_old[1] = el.pos[1] + vel[1];
      }
      if (el.pos[1] + el.radius > this.rect[1] + this.rect[3]) {
        el.pos[1] = this.rect[1] + this.rect[3] - el.radius;
        el.pos_old[1] = el.pos[1] + vel[1];
      }
    });
  }
  render() {
    ctx.fillStyle = "#444444";
    // ctx.beginPath();
    // ctx.arc(...this.pos, this.radius, 0, 2 * Math.PI);
    // ctx.fill();
    ctx.fillStyle = "#444444";
    ctx.beginPath();
    ctx.rect(...this.rect);
    ctx.fill();
    this.points.forEach((el) => el.render());
    this.sticks.forEach((el) => el.render());
  }
}
const solver = new Solver();
solver.points.push(new Point(200, 200, 1));
solver.points.push(new Point(300, 200, 1));
solver.points.push(new Point(300, 300, 1));
solver.points.push(new Point(200, 300, 1));
solver.points.push(new Point(400, 150, 1, true));

solver.sticks.push(new Stick(solver.points[0], solver.points[1]));
solver.sticks.push(new Stick(solver.points[1], solver.points[2]));
solver.sticks.push(new Stick(solver.points[2], solver.points[3]));
solver.sticks.push(new Stick(solver.points[3], solver.points[0]));
solver.sticks.push(new Stick(solver.points[0], solver.points[2]));
solver.sticks.push(new Stick(solver.points[4], solver.points[2]));

const update = (dt) => {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cWidth, cHeight);
  solver.update(dt);
  solver.render();
};
let oldTime = Date.now();
const animate = () => {
  requestAnimationFrame(animate);
  const nowTime = Date.now();
  const delta = (nowTime - oldTime) / 1000;
  oldTime = nowTime;
  update(0.02);
  ctx.font = "18px Noto Sans TC";
  ctx.textAlign = "start";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#ffffff";
  ctx.fillText((1 / delta).toFixed(1), 10, 10);
};
animate();
