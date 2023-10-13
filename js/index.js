import Point from "./js/point.js";
import Stick from "./js/stick.js";
import Solver from "./js/solver.js";
import { ShapeBox } from "./js/shape.js";
import { Line, Vector, VectorE } from "./js/vector.js";
import Obstacle from "./js/obstacle.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;

const solver = new Solver([0, 0, cWidth, cHeight]);
solver.shapes.push(new ShapeBox(450, 60, 60, 60));
solver.shapes.push(new ShapeBox(400, 60, 60, 60));
solver.points.push(new .negate550, 50, true));

solver.sticks.push(new Stick(solver.points[0], solver.shapes[0].points[2]));
solver.sticks.push(new Stick(solver.shapes[1].points[0], solver.shapes[0].points[0]));

const shape2 = new ShapeBox(200, 80, 60, 60);
// shape2.rotate(Math.PI * 0.25);
// shape2.clearVel();
solver.shapes.push(shape2);

const shape3 = new ShapeBox(500, 180, 60, 60);
shape3.rotate(-Math.PI * 0.5);
// shape3.clearVel();
solver.shapes.push(shape3);

const shape4 = new ShapeBox(650, 180, 60, 60);
shape4.rotate(-Math.PI * 0.5);
shape4.clearVel();
solver.shapes.push(shape4);

// const shape5 = new ShapeBox(400, 600, 200, 100);
// shape5.pinned = true;
// solver.shapes.push(shape5);

// solver.points.push(new .negate400, 360, 1));

// const shape3 = new ShapeBox(265, 80, 60, 60);
// solver.shapes.push(shape3);

// const shape2 = new ShapeBox(200, 80, 60, 60);
// shape2.rotate(Math.PI * 0.25);
// shape2.clearVel();
// solver.shapes.push(shape2);

solver.obstacles.push(new Obstacle([0, 500], [800, 150]));

// {
//   const shape0 = new ShapeBox(400, 500, 100, 100);
//   shape0.pinned = true;
//   const shape1 = new ShapeBox(400, 180, 100, 100);
//   shape1.rotate(Math.PI * 0.15);
//   shape1.clearVel();
//   solver.shapes.push(shape0);
//   solver.shapes.push(shape1);
// }

// {
//   const shape0 = new ShapeBox(200, 200, 100, 100);
//   const shape1 = new ShapeBox(270, 180, 100, 50);
//   shape1.rotate(Math.PI * 0.25);
//   shape1.clearVel();
//   solver.shapes.push(shape0);
//   solver.shapes.push(shape1);
// }
// {
//   const shape0 = new ShapeBox(780, 200, 100, 100);
//   shape0.rotate(Math.PI * 0.35);
//   shape0.clearVel();
//   solver.shapes.push(shape0);
// }
const mPos = [0, 0];
canvas.addEventListener("mousemove", (ev) => {
  VectorE.set(mPos, [ev.offsetX, ev.offsetY]);
});
let oldTime = Date.now();
const animate = () => {
  requestAnimationFrame(animate);
  const nowTime = Date.now();
  const delta = (nowTime - oldTime) / 1000;
  oldTime = nowTime;
  ctx.clearRect(0, 0, cWidth, cHeight);
  solver.update(0.02);
  solver.render(ctx);

  ctx.font = "18px Noto Sans TC";
  ctx.textAlign = "start";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#ffffff";
  ctx.fillText((1 / delta).toFixed(1), 10, 10);

  ctx.font = "18px Noto Sans TC";
  ctx.textAlign = "start";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(mPos.toString(), 10, 40);
};
requestAnimationFrame(animate);
