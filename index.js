import { Rectangle, Quadtree } from "./js/quadtree.js";
import { Vector } from "./js/vector.js";

const canvas = document.getElementById("canvas01");
const ctx = canvas.getContext("2d");
let cWidth = canvas.width;
let cHeight = canvas.height;

class VerletObject {
  constructor(x, y, radius, color) {
    this.pos_current = [x, y];
    this.pos_old = [x, y];
    this.acc = [0, 0];
    this.radius = radius;
    this.lock = false;
    this.color = color;
    // this.v = [0, 0];
    //this.force = [0, 0];
    this.mass = 1;
    this.vel = [0, 0];
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
    ctx.lineTo(...Vector.add(this.pos_current, Vector.scale(this.vel, 0.1)));
    ctx.stroke();
  }
  updatePos(dt) {
    let vel = Vector.sub(this.pos_current, this.pos_old);
    //const acc = Vector.scale(Vector.sub(this.vel_old, vel), 1 / dt);
    //this.vel_old = vel;
    this.pos_old = this.pos_current;
    if (!this.lock) {
      //this.pos_current = Vector.add(Vector.add(this.pos_current, vel), Vector.scale(this.acc, dt * dt));
      this.vel = Vector.add(this.vel, Vector.scale(this.acc, dt));
      //console.log(this.vel);
      //const pos_old = this.pos_current;
      this.pos_current = Vector.add(this.pos_current, Vector.scale(this.vel, dt));

      //this.vel = Vector.sub(this.pos_current, pos_old);
      //console.log(this.vel, Vector.scale(this.acc, dt * dt));
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
    if (!this.A.lock) {
      this.A.vel = Vector.add(this.A.vel, Vector.scale(n, 0.5 * delta));
      this.A.pos_current = Vector.add(this.A.pos_current, Vector.scale(n, 0.5 * delta));
    }
    if (!this.B.lock) {
      this.B.vel = Vector.sub(this.B.vel, Vector.scale(n, 0.5 * delta));
      this.B.pos_current = Vector.sub(this.B.pos_current, Vector.scale(n, 0.5 * delta));
    }
  }
}
class Solver {
  constructor() {
    this.gravity = [0, 1000];
    this.particles = [];
    this.links = [];
    this.pos = [400, 300];
    this.radius = 300;
    this.rect = [50, 50, 700, 500];
  }
  update(dt) {
    const sub_steps = 10;
    const sub_dt = dt / sub_steps;
    for (let t = 0; t < sub_steps; t++) {
      this.applyGravity();
      this.solverConstraint();
      this.solverCollisions();
      this.solverLinks();
      this.updatePos(sub_dt);
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

          const force1 = Vector.projection(a.vel, n);
          const force2 = Vector.projection(b.vel, n);
          const v1 = Vector.collisionCalc(force1, force2, a.mass, b.mass);
          const v2 = Vector.collisionCalc(force2, force1, b.mass, a.mass);
          const ff = Vector.sub(Vector.sub(a.vel, force1), Vector.sub(b.vel, force2));
          const friction_s = 0.7;
          const friction_d = 0.5;
          const ffl = Vector.length(ff);
          //const ff0 = Vector.sub(force1, force2);

          //console.log(Vector.length(ff));
          if (!a.lock) {
            //a.pos_old = a.pos_current;
            a.vel = Vector.sub(a.vel, force1);
            if (ffl < friction_s) {
              a.vel = Vector.sub(a.vel, Vector.scale(ff, 0.5 * (1 - ffl / friction_s)));
            } else {
              a.vel = Vector.sub(a.vel, Vector.scale(ff, friction_d / ffl));
            }
            a.vel = Vector.add(a.vel, Vector.scale(v1, 0.95));
            //console.log(a.vel);
            // a.vel = Vector.add(a.vel, Vector.scale(ff0, 0.06));
            // a.vel = Vector.add(a.vel, Vector.scale(n, 0.5 * delta));
            a.pos_current = Vector.add(a.pos_current, Vector.scale(n, 0.5 * delta));
          }
          if (!b.lock) {
            //b.pos_old = b.pos_current;
            b.vel = Vector.sub(b.vel, force2);
            if (ffl < friction_s) {
              b.vel = Vector.add(b.vel, Vector.scale(ff, 0.5 * (1 - ffl / friction_s)));
            } else {
              b.vel = Vector.add(b.vel, Vector.scale(ff, friction_d / ffl));
            }
            b.vel = Vector.add(b.vel, Vector.scale(v2, 0.95));
            //console.log(b.vel);
            // b.vel = Vector.sub(b.vel, Vector.scale(ff0, 0.06));
            // b.vel = Vector.sub(b.vel, Vector.scale(n, 0.5 * delta));
            b.pos_current = Vector.sub(b.pos_current, Vector.scale(n, 0.5 * delta));
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
        if (!el.lock) {
          const n = Vector.scale(to_obj, 1 / dist);
          const force1 = Vector.projection(el.vel, n);
          el.vel = Vector.sub(el.vel, force1);
          el.vel = Vector.scale(el.vel, 0.999);
          el.vel = Vector.add(el.vel, Vector.scale(force1, -1 * 0.5));
          el.pos_current = Vector.add(this.pos, Vector.scale(n, this.radius - el.radius));
        }
      }
      /*if (el.pos_current[0] - el.radius - this.rect[0] < 0) {
        //el.pos_old[0] = el.pos_current[0];
        el.pos_current[0] = this.rect[0] + el.radius;
        el.vel[0] = -el.vel[0];
      }
      if (el.pos_current[0] + el.radius - (this.rect[0] + this.rect[2]) > 0) {
        //el.pos_old[0] = el.pos_current[0];
        el.pos_current[0] = this.rect[0] + this.rect[2] - el.radius;
        el.vel[0] = -el.vel[0];
      }
      if (el.pos_current[1] - el.radius - this.rect[1] < 0) {
        //el.pos_old[1] = el.pos_current[1];
        el.pos_current[1] = this.rect[1] + el.radius;
        el.vel[1] = -el.vel[1];
      }
      if (el.pos_current[1] + el.radius - (this.rect[1] + this.rect[3]) > 0) {
        //el.pos_old[1] = el.pos_current[1];
        el.pos_current[1] = this.rect[1] + this.rect[3] - el.radius;
        el.vel[1] = -el.vel[1];
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
setInterval(() => {
  if (solver.particles.length < 300) {
    {
      const particle = new VerletObject(650, 200, 10, "#ff0000");
      //particle.accelerate([500000, 0]);
      solver.particles.push(particle);
    }
    {
      const particle = new VerletObject(550, 200, 10, "#ff0000");
      //particle.accelerate([500000, 0]);
      solver.particles.push(particle);
    }
  }
}, 100);
{
  const particle = new VerletObject(400, 550, 20, "#ff0000");
  particle.vel = [100, 0];
  solver.particles.push(particle);
}
{
  const particle = new VerletObject(400, 515, 20, "#ff0000");
  particle.vel = [-100, 0];
  solver.particles.push(particle);
}
// {
//   const particle = new VerletObject(650, 400, 20, "#ff0000");
//   //particle.accelerate([100000, 0]);
//   solver.particles.push(particle);
// }
// {
//   const particle = new VerletObject(400, 550, 20, "#ff0000");
//   //particle.accelerate([-100000, 0]);
//   solver.particles.push(particle);
// }
// {
//   const particle = new VerletObject(150, 200, 20, "#ff0000");
//   //particle.accelerate([-100000, 0]);
//   solver.particles.push(particle);
// }

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
