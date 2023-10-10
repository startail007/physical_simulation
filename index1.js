import Point from "./js/point.js";
import Stick from "./js/stick.js";
import Solver from "./js/solver.js";
import { ShapeBox } from "./js/shape.js";
import { Line, Vector, VectorE } from "./js/vector.js";
const points = [
  [200, 200],
  [300, 200],
  [700, 400],
  [200, 450],
];
const pos = [220, 220];
const dir = [1, 0];
let angle = 0;
function loopFor(points, fun) {
  for (let i = 0; i < points.length; i++) {
    const i0 = i;
    const i1 = (i + 1) % points.length;
    const p0 = points[i0];
    const p1 = points[i1];
    fun(p0, p1, i0, i1);
  }
}
function loopForMap(points, fun) {
  const list = [];
  for (let i = 0; i < points.length; i++) {
    const i0 = i;
    const i1 = (i + 1) % points.length;
    const p0 = points[i0];
    const p1 = points[i1];
    list.push(fun(p0, p1, i0, i1));
  }
  return list;
}
let count = 0;
function test() {
  count++;
  if (count > 10) {
    count = 0;
    angle += 3;
  }
  angle %= 360;
  const _a = (angle * Math.PI) / 180;
  VectorE.set(dir, [Math.round(Math.cos(_a) * 1000) / 1000, Math.round(Math.sin(_a) * 1000) / 1000]);
  const _points = points.map((el) => {
    return Vector.clone(el);
  });
  const _pos = Vector.clone(pos);
  ctx.strokeStyle = "#0ff";
  ctx.beginPath();
  loopFor(points, (p0, p1) => {
    ctx.moveTo(...p0);
    ctx.lineTo(...p1);
  });
  ctx.stroke();

  ctx.fillStyle = "#0ff";
  ctx.beginPath();
  ctx.arc(...pos, 5, 0, 2 * Math.PI);
  ctx.fill();
  if (Vector.inPolygon(pos, points)) {
    let _info = null;
    let num = Infinity;

    let list = loopForMap(points, (p0, p1, i0, i1) => {
      const iPos = Line.shortestDistancePointToLine(pos, p0, p1);
      const v = Vector.sub(p1, p0);
      const v0 = Vector.sub(iPos, p0);
      const rate = Vector.dot(v0, v) / Vector.dot(v, v);
      const d = Vector.distance(pos, iPos);
      // console.log(Vector.dot(dir, Vector.normalize(Vector.normal(v))));
      if (rate >= 0 && rate <= 1 && Vector.dot(dir, Vector.normalize(Vector.normal(v))) > 0) {
        return { iPos, rate, i0, i1, d, pos };
      }
      // if (rate >= 0 && rate <= 1) {
      //   return { iPos, rate, i0, i1, d, pos };
      // }
    }).filter((el) => el);

    if (!list.length) {
      const _list = loopForMap(points, (p0, p1, i0, i1) => {
        const iPos = Line.findIntersection(p0, p1, pos, Vector.add(pos, dir));
        const v = Vector.sub(p1, p0);
        if (iPos && Vector.dot(dir, Vector.normal(v)) > 0) {
          const v = Vector.sub(p1, p0);
          return { iPos, i0, i1 };
        }
      }).filter((el) => el);

      const item = _list[0];

      const _pos0 = Vector.mix(item.iPos, pos, 0.5);

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(...item.iPos, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(..._pos0, 5, 0, 2 * Math.PI);
      ctx.fill();

      const p0 = points[item.i0];
      const p1 = points[item.i1];

      const iPos = Line.shortestDistancePointToLine(_pos0, p0, p1);
      const v = Vector.sub(p1, p0);
      const v0 = Vector.sub(iPos, p0);
      const rate = Vector.dot(v0, v) / Vector.dot(v, v);
      _info = { ...item, iPos, rate, pos: _pos0 };
    } else {
      list.forEach((info) => {
        if (info.d < num) {
          num = info.d;
          _info = info;
        }
      });
    }
    if (_info) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(..._info.iPos, 5, 0, 2 * Math.PI);
      ctx.fill();
      const v = Vector.sub(_info.pos, _info.iPos);
      const rate1 = 1 - _info.rate;
      VectorE.set(_points[_info.i0], Vector.add(points[_info.i0], Vector.scale(v, rate1)));
      VectorE.set(_points[_info.i1], Vector.add(points[_info.i1], Vector.scale(v, _info.rate)));
      VectorE.set(_pos, Vector.sub(_info.pos, Vector.scale(v, 2 * _info.rate * rate1)));
    }

    ctx.strokeStyle = "#f0f";
    ctx.beginPath();
    loopFor(_points, (p0, p1) => {
      ctx.moveTo(...p0);
      ctx.lineTo(...p1);
    });
    ctx.stroke();

    ctx.fillStyle = "#f0f";
    ctx.beginPath();
    ctx.arc(..._pos, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(...pos);
    ctx.lineTo(...Vector.add(pos, Vector.scale(dir, 100)));
    ctx.stroke();
  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;
canvas.addEventListener("mousemove", (ev) => {
  //VectorE.set(pos, [ev.offsetX, ev.offsetY]);
});

let oldTime = Date.now();
const animate = () => {
  requestAnimationFrame(animate);
  const nowTime = Date.now();
  const delta = (nowTime - oldTime) / 1000;
  oldTime = nowTime;
  ctx.clearRect(0, 0, cWidth, cHeight);
  test();

  ctx.font = "18px Noto Sans TC";
  ctx.textAlign = "start";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#ffffff";
  ctx.fillText((1 / delta).toFixed(1), 10, 10);
};
requestAnimationFrame(animate);
