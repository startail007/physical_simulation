import { Rectangle, Quadtree } from "./js/quadtree.js";
import { Vector } from "./js/vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let cWidth = canvas.width;
let cHeight = canvas.height;

// let rect = new Rectangle(0, 0, cWidth, cHeight);
// let qtree = new Quadtree(rect, 10);

// const radius_min = 5;
// const radius_max = 10;
// let particles;
/*const handleResize = () => {
  canvas.width = cWidth = window.innerWidth;
  canvas.height = cHeight = window.innerHeight;
  rect.width = cWidth;
  rect.height = cHeight;
  qtree.reset(rect, 10);
  particles = new Array(Math.ceil((cWidth * cHeight) / 1000));
  //console.log(window.innerHeight);
  for (let i = 0; i < particles.length; i++) {
    const radius = radius_min + Math.random() * (radius_max - radius_min);
    particles[i] = new Particle(`hsl(${Math.floor(360 * Math.random())},100%,50%)`);
    particles[i].setPos(
      radius + (cWidth - 2 * radius) * Math.random(),
      radius + (cHeight - 2 * radius) * Math.random()
    );
    particles[i].setVelocity(2, 2 * Math.PI * Math.random());
    particles[i].setRadius(radius);
    particles[i].setMass(radius / radius_min);
  }
};
window.addEventListener("resize", debounce(handleResize));
handleResize();
canvas.addEventListener("click", (el) => {
  const p = [el.pageX, el.pageY];
  const r = 100;
  const range = new Rectangle(p[0] - r, p[1] - r, r * 2, r * 2);
  const query_points = qtree.query(range);

  query_points.forEach((el) => {
    const v = Vector.sub(el.point, p);
    const r0 = Vector.length(v);
    if (r0 <= r) {
      particles[el.key].addVelocity(Math.min(r0 ? (10 * r) / r0 : 0, 10), Math.atan2(v[1], v[0]));
      particles[el.key].setRadius(particles[el.key].radius);
    }
  });
});*/
class VerletObject {
  constructor(x, y, radius) {
    this.pos_current = [x, y];
    this.pos_old = [x, y];
    this.acc = [0, 0];
    this.radius = radius;
  }
  draw() {
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(...this.pos_current, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
  updatePos(dt) {
    const vel = Vector.sub(this.pos_current, this.pos_old);
    this.pos_old = this.pos_current;
    this.pos_current = Vector.add(Vector.add(this.pos_current, vel), Vector.scale(this.acc, dt * dt));
    this.acc = [0, 0];
  }
  accelerate(acc) {
    this.acc = Vector.add(this.acc, acc);
  }
}
const gravity = [0, 1000];
const particles = [];
// particles.push(new VerletObject(1100, 400, 20));
// particles.push(new VerletObject(1100, 320, 20));
setInterval(() => {
  if (particles.length < 50) {
    const particle = new VerletObject(1100, 400, 50);
    particle.accelerate([-500000, 0]);
    particles.push(particle);
  }
}, 100);

const pos = [800, 450];
const radius = 400;
const update = (dt) => {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cWidth, cHeight);
  ctx.fillStyle = "#444444";
  ctx.beginPath();
  ctx.arc(...pos, radius, 0, 2 * Math.PI);
  ctx.fill();
  const sub_steps = 4;
  const sub_dt = dt / sub_steps;
  for (let t = 0; t < sub_steps; t++) {
    particles.forEach((el) => el.accelerate(gravity));
    particles.forEach((el) => {
      const to_obj = Vector.sub(el.pos_current, pos);
      const dist = Vector.length(to_obj);
      //console.log(dist);
      if (dist > radius - el.radius) {
        const n = Vector.scale(to_obj, 1 / dist);
        el.pos_current = Vector.add(pos, Vector.scale(n, radius - el.radius));
      }
    });
    // console.log(Vector.add(pos, Vector.scale(n, dist)));

    for (let i = 0; i < particles.length - 1; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const collision_axis = Vector.sub(a.pos_current, b.pos_current);
        const dist = Vector.length(collision_axis);
        const min_dist = a.radius + b.radius;
        if (dist < min_dist) {
          const n = Vector.scale(collision_axis, 1 / dist);
          const delta = min_dist - dist;
          //console.log(delta);
          a.pos_current = Vector.add(a.pos_current, Vector.scale(n, 0.5 * delta));
          b.pos_current = Vector.sub(b.pos_current, Vector.scale(n, 0.5 * delta));
        }
      }
    }
    particles.forEach((el) => el.updatePos(sub_dt));
  }
  particles.forEach((el) => el.draw());

  /*ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cWidth, cHeight);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
  }
  for (let i = 0; i < particles.length; i++) {
    particles[i].boundaryCheck(cWidth, cHeight);
  }
  qtree.clear();
  for (let i = 0; i < particles.length; i++) {
    qtree.insert({ key: i, point: particles[i].pos });
  }

  for (let i = 0; i < particles.length; i++) {
    const query_particles = [];
    const w = particles[i].radius + radius_max;
    const h = particles[i].radius + radius_max;
    const range = new Rectangle(particles[i].pos[0] - w, particles[i].pos[1] - h, w * 2, h * 2);
    const query_points = qtree.query(range);
    for (let j = 0; j < query_points.length; j++) {
      query_particles.push(particles[query_points[j].key]);
    }
    particles[i].collisionCheck(query_particles);
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].render(ctx);
  }*/
  //qtree.render(ctx);
};
// update();
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
