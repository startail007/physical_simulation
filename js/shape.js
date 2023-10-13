import { loopForMap, rotationArray, loopFor } from "./fun.js";
import { Float } from "./float.js";
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
    this.restitution = 0.2;
    this.mass = 1;
    this.invMass = 1;
  }
  set pinned(val) {
    this._pinned = val;
    this.points.forEach((el) => (el.pinned = val));
    if (val) {
      this.mass = 0;
      this.invMass = 0;
    } else {
      this.mass = 1;
      this.invMass = 1;
    }
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
  static pointSegmentDistance(p, a, b) {
    const ab = Vector.sub(b, a);
    const ap = Vector.sub(p, a);

    const proj = Vector.dot(ap, ab);
    const abLenSq = Vector.dot(ab, ab);
    const d = proj / abLenSq;
    let cp = 0;
    if (d <= 0) {
      cp = a;
    } else if (d >= 1) {
      cp = b;
    } else {
      cp = Vector.add(a, Vector.scale(ab, d));
    }
    const v = Vector.sub(p, cp);
    const distSq = Vector.dot(v, v);
    return { distSq, cp };
  }
  static findPolygonsContactPoints(pointsA, pointsB) {
    let minDistSq = Number.POSITIVE_INFINITY;
    let contactList = [];

    pointsA.forEach((point) => {
      loopFor(pointsB, (p0, p1) => {
        const { distSq, cp } = Shape.pointSegmentDistance(point, p0, p1);
        if (Float.nearlyEqual(distSq, minDistSq)) {
          if (!Vector.nearlyEqual(cp, contactList[0])) {
            minDistSq = distSq;
            contactList[1] = cp;
          }
        } else if (distSq < minDistSq) {
          minDistSq = distSq;
          contactList = [cp];
        }
      });
    });

    pointsB.forEach((point) => {
      loopFor(pointsA, (p0, p1) => {
        const { distSq, cp } = Shape.pointSegmentDistance(point, p0, p1);
        if (Float.nearlyEqual(distSq, minDistSq)) {
          if (!Vector.nearlyEqual(cp, contactList[0])) {
            minDistSq = distSq;
            contactList[1] = cp;
          }
        } else if (distSq < minDistSq) {
          minDistSq = distSq;
          contactList = [cp];
        }
      });
    });
    return contactList;
  }
  static getNormals(points) {
    const normals = [];

    for (let i = 0; i < points.length; i++) {
      const edge = [
        points[(i + 1) % points.length][0] - points[i][0],
        points[(i + 1) % points.length][1] - points[i][1],
      ];

      normals.push(Vector.normalize(Vector.normal(edge)));
    }

    return normals;
  }
  static projectPoints(points, axis) {
    let min = Infinity;
    let max = -Infinity;

    points.forEach((point) => {
      const projected = Vector.dot(point, axis);
      min = Math.min(min, projected);
      max = Math.max(max, projected);
    });

    return { min, max };
  }
  static intersectPolygons(pointsA, pointsB) {
    let normal = Vector.zero();
    let depth = Number.POSITIVE_INFINITY;
    const axesA = Shape.getNormals(pointsA);
    const axesB = Shape.getNormals(pointsB);
    const axes = [...axesA, ...axesB];
    let bool = false;
    for (const axis of axes) {
      const projection1 = Shape.projectPoints(pointsA, axis);
      const projection2 = Shape.projectPoints(pointsB, axis);

      if (projection1.min >= projection2.max || projection2.min >= projection1.max) {
        return;
      }
      const axisDepth = Math.min(projection2.max - projection1.min, projection1.max - projection2.min);
      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
        bool = projection1.max > projection2.max;
      }
    }
    if (bool) {
      normal = Vector.negate(normal);
    }

    return { normal, depth };
  }
  collision(shape) {
    const pointsA = this.points.map((point) => point.pos);
    const pointsB = shape.points.map((point) => point.pos);
    const info = Shape.intersectPolygons(pointsA, pointsB);
    if (info) {
      const { normal, depth } = info;
      const tangent = Vector.normal(normal);
      const contactList = Shape.findPolygonsContactPoints(pointsA, pointsB);
      const contactCount = contactList.length;
      const cp = Vector.average(contactList);

      const projectionNA = Shape.projectPoints(pointsA, normal);
      const projectionNAwidth = projectionNA.max - projectionNA.min;
      const projectionNB = Shape.projectPoints(pointsB, normal);
      const projectionNBwidth = projectionNB.max - projectionNB.min;

      const projectionTA = Shape.projectPoints(pointsA, tangent);
      const projectionTAwidth = projectionTA.max - projectionTA.min;
      const projectionTB = Shape.projectPoints(pointsB, tangent);
      const projectionTBwidth = projectionTB.max - projectionTB.min;
      // contactList.forEach((contact) => {
      //   if (!this.pinned) {
      //     this.points.forEach((point) => {
      //       const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
      //       const rate = 1 + (d - depth) / projectionNAwidth;

      //       const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
      //       const rate0 = Math.max(1 - (2 * d0) / projectionTAwidth, 0);

      //       const move = Float.mix(1, this.restitution, rate * rate0);
      //       VectorE.sub(point.pos, Vector.scale(normal, (move * depth * 0.5) / contactCount));
      //     });
      //   }
      //   if (!shape.pinned) {
      //     shape.points.forEach((point) => {
      //       const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
      //       const rate = 1 - (d + depth) / projectionNBwidth;

      //       const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
      //       const rate0 = Math.max(1 - (2 * d0) / projectionTBwidth, 0);

      //       const move = Float.mix(1, this.restitution, rate * rate0);
      //       VectorE.add(point.pos, Vector.scale(normal, (move * depth * 0.5) / contactCount));
      //     });
      //   }
      // });
      const velA = this.points.map((point) => point.vel);
      const velB = shape.points.map((point) => point.vel);
      const vel0 = Vector.average(velA);
      const vel1 = Vector.average(velB);
      contactList.forEach((contact) => {
        if (!this.pinned) {
          this.points.forEach((point) => {
            const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
            const rate = 1 + (d - depth) / projectionNAwidth;

            const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
            const rate0 = d0 / projectionTAwidth;

            const move = Float.mix(1, this.restitution, rate * rate0);
            VectorE.sub(point.pos, Vector.scale(normal, (move * depth * 0.5) / contactCount));
          });
        }
        if (!shape.pinned) {
          shape.points.forEach((point) => {
            const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
            const rate = 1 - (d + depth) / projectionNBwidth;

            const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
            const rate0 = d0 / projectionTBwidth;

            const move = Float.mix(1, this.restitution, rate * rate0);
            VectorE.add(point.pos, Vector.scale(normal, (move * depth * 0.5) / contactCount));
          });
        }
      });

      const relativeVel = Vector.sub(vel0, vel1);
      if (Vector.dot(relativeVel, normal) > 0) {
        return;
      }
      const e = Math.min(this.restitution, shape.restitution);

      const j = (-(1 + e) * Vector.dot(relativeVel, normal)) / (this.invMass + shape.invMass);
      const impulse = Vector.scale(normal, j);
      const _vel0 = Vector.scale(impulse, this.invMass);
      const _vel1 = Vector.scale(impulse, shape.invMass);

      // contactList.forEach((contact) => {
      //   this.points.forEach((point) => {
      //     // const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
      //     // const rate = 1 + (d - depth) / projectionNAwidth;

      //     // const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
      //     // const rate0 = d0 / projectionTAwidth;

      //     // const move = Float.mix(1, this.restitution, rate * rate0);
      //     VectorE.set(point.pos_old, Vector.sub(point.pos, Vector.sub(point.vel, _vel0)));
      //   });
      //   shape.points.forEach((point) => {
      //     // const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
      //     // const rate = 1 - (d + depth) / projectionNBwidth;

      //     // const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
      //     // const rate0 = d0 / projectionTBwidth;

      //     // const move = Float.mix(1, this.restitution, rate * rate0);
      //     VectorE.set(point.pos_old, Vector.sub(point.pos, Vector.add(point.vel, _vel1)));
      //   });
      // });

      contactList.forEach((contact) => {
        if (!this.pinned) {
          this.points.forEach((point, i) => {
            const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
            const rate = 1 + (d - depth) / projectionNAwidth;

            const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
            const rate0 = d0 / projectionTAwidth;
            const move = Float.mix(1, this.restitution, rate * rate0);
            VectorE.set(
              point.pos_old,
              Vector.sub(point.pos, Vector.sub(velA[i], Vector.scale(_vel0, move / contactCount)))
            );
          });
        }
        if (!shape.pinned) {
          shape.points.forEach((point, i) => {
            const d = Line.toLineDistance(point.pos, contact, Vector.add(contact, tangent), true);
            const rate = 1 - (d + depth) / projectionNBwidth;

            const d0 = Line.toLineDistance(point.pos, contact, Vector.add(contact, normal));
            const rate0 = d0 / projectionTBwidth;

            const move = Float.mix(1, this.restitution, rate * rate0);
            VectorE.set(
              point.pos_old,
              Vector.sub(point.pos, Vector.add(velB[i], Vector.scale(_vel1, move / contactCount)))
            );
          });
        }
      });
    }
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
