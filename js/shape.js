import { loopForMap, rotationArray } from "./fun.js";
import Point from "./point.js";
import Stick from "./stick.js";
import { Vector, VectorE, Line } from "./vector.js";
export class Shape {
  constructor(x, y) {
    this.pos = [x, y];
    this.points = [];
    this.sticks = [];
    this.color = "#00ff00";
    this._pinned = false;
    this.center = [0, 0];
  }
  set pinned(val) {
    this._pinned = val;
    this.points.forEach((el) => (el.pinned = val));
  }
  get pinned() {
    return this._pinned;
  }
  getNormals() {
    const normals = [];
    const points = this.points;

    for (let i = 0; i < points.length; i++) {
      const edge = [
        points[(i + 1) % points.length].pos[0] - points[i].pos[0],
        points[(i + 1) % points.length].pos[1] - points[i].pos[1],
      ];

      normals.push(Vector.normalize([-edge[1], edge[0]]));
    }

    return normals;
  }
  update(dt) {
    this.updateCenter();
  }
  project(axis) {
    const points = this.points;
    let min = Infinity;
    let max = -Infinity;

    for (const point of points) {
      const projected = Vector.dot(point.pos, axis);
      min = Math.min(min, projected);
      max = Math.max(max, projected);
    }

    return { min, max };
  }
  SATCollision(shape) {
    function overlap(projection1, projection2) {
      return projection1.min <= projection2.max && projection1.max >= projection2.min;
    }
    const axes = [...this.getNormals(), ...shape.getNormals()];

    for (const axis of axes) {
      const projection1 = this.project(axis);
      const projection2 = shape.project(axis);
      if (!overlap(projection1, projection2)) {
        return false;
      }
    }

    return true;
  }
  collision(shape) {
    const p = [];
    const index0 = new Set();
    const index1 = new Set();
    loopForMap(this.points, (p0, p1, i0, i1) => {
      loopForMap(shape.points, (p2, p3, j0, j1) => {
        const ip = Line.findIntersection(p0.pos, p1.pos, p2.pos, p3.pos);
        if (ip) {
          index0.add(i0);
          index0.add(i1);
          index1.add(j0);
          index1.add(j1);
          p.push(ip);
        }
      });
    });
    // console.log(index0, index1);
    this.points.forEach((point) => {
      const polygon = shape.points.map((el) => el.pos);
      if (Vector.inPolygon(point.pos, polygon)) {
        p.push(point.pos);
      }
    });
    shape.points.forEach((point) => {
      const polygon = this.points.map((el) => el.pos);
      if (Vector.inPolygon(point.pos, polygon)) {
        p.push(point.pos);
      }
    });
    const cp = Vector.average(p);
    const well0 = Vector.sub(this.center, cp);
    const well1 = Vector.sub(cp, shape.center);
    const well = Vector.normal(Vector.normalize(Vector.add(well0, well1)));
    const A = cp;

    const vel0 = Vector.average(Array.from(index0).map((i) => this.points[i].vel));
    const vel1 = Vector.average(Array.from(index1).map((i) => shape.points[i].vel));

    this.points.forEach((point) => {
      const vel = point.vel;
      const v0 = Vector.sub(point.pos, A);
      const v1 = well;
      const t = Vector.normal(v1);
      if (Vector.cross(v0, v1) < 0) {
        const newPoint = Line.shortestDistancePointToLine(point.pos, A, Vector.add(A, v1));
        VectorE.set(point.pos, newPoint);
        // if (Vector.dot(vel, t) > 0) {
        //   //少了速度交換
        //   const newVel = Vector.rebound(vel, v1);
        //   VectorE.set(point.pos_old, Vector.sub(newPoint, newVel));
        // }
      }
    });
    shape.points.forEach((point) => {
      const vel = point.vel;
      const v0 = Vector.sub(point.pos, A);
      const v1 = Vector.negate(well);
      const t = Vector.normal(v1);
      if (Vector.cross(v0, v1) < 0) {
        const newPoint = Line.shortestDistancePointToLine(point.pos, A, Vector.add(A, v1));
        VectorE.set(point.pos, newPoint);
        // if (Vector.dot(vel, t) > 0) {
        //   //少了速度交換
        //   const newVel = Vector.rebound(vel, v1);
        //   VectorE.set(point.pos_old, Vector.sub(newPoint, newVel));
        // }
      }
    });

    const projection0 = Vector.projection(vel0, well);
    const force0 = Vector.sub(vel0, projection0);

    const projection1 = Vector.projection(vel1, well);
    const force1 = Vector.sub(vel1, projection1);

    const newForce0 = Vector.collisionCalc(force0, force1, 1, 1);
    const newForce1 = Vector.collisionCalc(force1, force0, 1, 1);

    const newVel0 = Vector.add(projection0, newForce0);
    const newVel1 = Vector.add(projection1, newForce1);

    Array.from(index0).forEach((i) => {
      const point = this.points[i];
      VectorE.set(point.pos_old, Vector.sub(point.pos, newVel0));
    });
    Array.from(index1).forEach((i) => {
      const point = shape.points[i];
      VectorE.set(point.pos_old, Vector.sub(point.pos, newVel1));
    });
  }
  render(ctx) {
    this.points.forEach((el) => el.render(ctx));
    this.sticks.forEach((el) => el.render(ctx));
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    if (this.points.length > 1) {
      ctx.moveTo(...this.points[0].pos);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(...this.points[i].pos);
      }
      ctx.lineTo(...this.points[0].pos);
    }
    ctx.stroke();

    // ctx.fillStyle = "#ffffff";
    // ctx.beginPath();
    // ctx.arc(...this.center, 10, 0, 2 * Math.PI);
    // ctx.fill();
  }
  rotate(angle) {
    this.updateCenter();
    this.rotateFrom(angle, this.center);
  }
  rotateFrom(angle, center) {
    this.points.forEach((el) => VectorE.set(el.pos, Vector.rotateFrom(el.pos, angle, center)));
  }
  move(vector) {
    this.points.forEach((point) => {
      VectorE.add(point.pos, vector);
    });
  }
  updateCenter() {
    const polygon = this.points.map((el) => el.pos);
    this.center = Vector.average(polygon);
  }
  clearVel() {
    this.points.forEach((el) => VectorE.set(el.pos_old, el.pos));
  }
}

export class ShapeBox extends Shape {
  constructor(x, y, width = 100, height = 100) {
    super(x, y);
    this.size = [width, height];
    this.halfSize = Vector.scale(this.size, 0.5);
    this.points.push(new Point(x - this.halfSize[0], y - this.halfSize[1], 1));
    this.points.push(new Point(x + this.halfSize[0], y - this.halfSize[1], 1));
    this.points.push(new Point(x + this.halfSize[0], y + this.halfSize[1], 1));
    this.points.push(new Point(x - this.halfSize[0], y + this.halfSize[1], 1));
    this.sticks.push(new Stick(this.points[0], this.points[1]));
    this.sticks.push(new Stick(this.points[1], this.points[2]));
    this.sticks.push(new Stick(this.points[2], this.points[3]));
    this.sticks.push(new Stick(this.points[3], this.points[0]));
    this.sticks.push(new Stick(this.points[0], this.points[2]));
    this.sticks.push(new Stick(this.points[1], this.points[3]));
  }
}
