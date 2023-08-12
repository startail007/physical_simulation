import { Rectangle, Quadtree } from "./js/quadtree.js";
import { Vector } from "./js/vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let cWidth = canvas.width;
let cHeight = canvas.height;

class VerletObject {
  constructor(x, y, radius, color) {
    this.pos_current = [x, y];
    this.pos_old = [x, y];
    this.move = [0, 0];
    this.acc = [0, 0];
    this.radius = radius;
    this.lock = false;
    this.color = color;
    this.vel = [0, 0];
    // this.v = [0, 0];
    // this.force = [0, 0];
    // this.mass = 1;
  }
  draw() {
    //ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.arc(...this.pos_current, this.radius, 0, 2 * Math.PI);
    //ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#00ff00";
    ctx.beginPath();
    ctx.moveTo(...this.pos_current);
    ctx.lineTo(...Vector.add(this.pos_current, Vector.scale(this.vel, 20)));
    ctx.stroke();
  }
  updatePos(dt) {
    const vel = Vector.sub(this.pos_current, this.pos_old);
    this.pos_old = this.pos_current;
    if (!this.lock) {
      // this.v = Vector.add(this.v, Vector.scale(this.acc, dt * dt));
      this.move = Vector.add(this.move, Vector.add(vel, Vector.scale(this.acc, dt * dt)));
      this.vel = this.move;
      //this.pos_current = Vector.add(Vector.add(this.pos_current, vel), Vector.scale(this.acc, dt * dt));
      this.pos_current = Vector.add(this.pos_current, this.move);
      this.move = [0, 0];
    }
    // console.log(this.force);
    this.acc = [0, 0];
  }
  accelerate(acc) {
    this.acc = Vector.add(this.acc, acc);
  }
}
class Link {
  constructor(A, B, target_dist) {
    this.A = A;
    this.B = B;
    this.target_dist = target_dist;
  }
  apply() {
    const axis = Vector.sub(this.A.pos_current, this.B.pos_current);
    const dist = Vector.length(axis);
    const n = Vector.scale(axis, 1 / dist);
    const delta = this.target_dist - dist;
    const a = Math.min(Math.abs(delta / 60), 5);
    if (!this.A.lock) {
      //if (Math.abs(delta) > 10) {
      this.A.pos_current = Vector.add(this.A.pos_current, Vector.scale(n, 0.5 * delta));
      //} else {
      this.A.move = Vector.add(this.A.move, Vector.scale(n, 0.5 * delta * a));
      //}
    }
    if (!this.B.lock) {
      //if (Math.abs(delta) > 10) {
      this.B.pos_current = Vector.sub(this.B.pos_current, Vector.scale(n, 0.5 * delta));
      //} else {
      this.B.move = Vector.sub(this.B.move, Vector.scale(n, 0.5 * delta * a));
      //}
    }
  }
}
class Solver {
  constructor() {
    this.gravity = [0, 1000];
    this.particles = [];
    this.links = [];
    this.pos = [400, 400];
    this.radius = 300;
    this.rect = [50, 50, 700, 600];
  }
  update(dt) {
    const sub_steps = 6;
    const sub_dt = dt / sub_steps;
    for (let t = 0; t < sub_steps; t++) {
      this.applyGravity();
      this.solverCollisions();
      this.solverLinks();
      this.updatePos(sub_dt);
      this.solverConstraint();
    }
    this.draw();
  }
  applyGravity() {
    this.particles.forEach((el) => el.accelerate(this.gravity));
  }
  updatePos(dt) {
    this.particles.forEach((el) => el.updatePos(dt));
  }
  solverCollisions() {
    for (let i = 0; i < this.particles.length - 1; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const collision_axis = Vector.sub(a.pos_current, b.pos_current);
        const dist = Vector.length(collision_axis);
        const min_dist = a.radius + b.radius;
        if (dist < min_dist) {
          const n = Vector.scale(collision_axis, 1 / dist);
          const delta = min_dist - dist;
          //console.log(delta);
          if (!a.lock) {
            //a.pos_old = a.pos_current;
            a.pos_current = Vector.add(a.pos_current, Vector.scale(n, 0.5 * delta));
            a.move = Vector.add(a.move, Vector.scale(n, 0.5 * delta));
          }
          if (!b.lock) {
            //b.pos_old = b.pos_current;
            b.pos_current = Vector.sub(b.pos_current, Vector.scale(n, 0.5 * delta));
            b.move = Vector.sub(b.move, Vector.scale(n, 0.5 * delta));
          }
        }
      }
    }
  }

  solverConstraint() {
    this.particles.forEach((el) => {
      const to_obj = Vector.sub(el.pos_current, this.pos);
      const dist = Vector.length(to_obj);
      if (dist > this.radius - el.radius) {
        const n = Vector.scale(to_obj, 1 / dist);
        if (!el.lock) {
          el.pos_current = Vector.add(this.pos, Vector.scale(n, this.radius - el.radius));
        }
      }
      /*if (el.pos_current[0] - el.radius - this.rect[0] < 0) {
        el.pos_old[0] = el.pos_current[0];
        el.pos_current[0] = this.rect[0] + el.radius;
      }
      if (el.pos_current[0] + el.radius - (this.rect[0] + this.rect[2]) > 0) {
        el.pos_old[0] = el.pos_current[0];
        el.pos_current[0] = this.rect[0] + this.rect[2] - el.radius;
      }
      if (el.pos_current[1] - el.radius - this.rect[1] < 0) {
        el.pos_old[1] = el.pos_current[1];
        el.pos_current[1] = this.rect[1] + el.radius;
      }
      if (el.pos_current[1] + el.radius - (this.rect[1] + this.rect[3]) > 0) {
        el.pos_old[1] = el.pos_current[1];
        el.pos_current[1] = this.rect[1] + this.rect[3] - el.radius;
      }*/
    });
  }
  solverLinks() {
    this.links.forEach((el) => el.apply());
  }
  draw() {
    ctx.fillStyle = "#444444";
    ctx.beginPath();
    ctx.arc(...this.pos, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    /*ctx.fillStyle = "#444444";
    ctx.beginPath();
    ctx.rect(...this.rect);
    ctx.fill();*/
    this.particles.forEach((el) => el.draw());
  }
}
const solver = new Solver();
// const line = [];
// for (let i = 0; i < 20; i++) {
//   const particle = new VerletObject(210 + i * 20, 300, 10, "#ffffff");
//   line.push(particle);
//   solver.particles.push(particle);
// }
// for (let i = 0; i < line.length - 1; i++) {
//   const link = new Link(line[i], line[i + 1], 20);
//   solver.links.push(link);
// }
// line[0].lock = true;
// line[19].lock = true;
// setTimeout(() => {
//   line[19].lock = false;
// }, 10000);
setInterval(() => {
  if (solver.particles.length < 150) {
    const particle = new VerletObject(400, 200, 5 + Math.random() * 10, "#ff0000");
    particle.accelerate([50000, 0]);
    //particle.accelerate([0, 100000]);
    solver.particles.push(particle);
  }
}, 200);
// solver.particles.push(new VerletObject(600, 300, 20, "#ff0000"));
// solver.particles.push(new VerletObject(200, 300, 20, "#ffff00"));
// solver.particles.push(new VerletObject(400, 680, 20, "#00ff00"));
// solver.particles.push(new VerletObject(400, 200, 20, "#0000ff"));

const update = (dt) => {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cWidth, cHeight);
  solver.update(dt);
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
