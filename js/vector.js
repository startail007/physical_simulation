import { Float } from "./float.js";
export class Vector {
  static zero() {
    return [0, 0];
  }
  static clone(vector) {
    return [...vector];
  }
  static rotate(vector, angle) {
    let cos0 = Math.cos(angle);
    let sin0 = Math.sin(angle);
    return [vector[0] * cos0 - vector[1] * sin0, vector[0] * sin0 + vector[1] * cos0];
  }
  static rotateFrom(vector, angle, center) {
    return Vector.add(Vector.rotate(Vector.sub(vector, center), angle), center);
  }
  static dot(vector0, vector1) {
    return vector0[0] * vector1[0] + vector0[1] * vector1[1];
  }
  static cross(vector0, vector1) {
    return vector0[0] * vector1[1] - vector0[1] * vector1[0];
  }
  static add(vector0, vector1) {
    return [vector0[0] + vector1[0], vector0[1] + vector1[1]];
  }
  static sub(vector0, vector1) {
    return [vector0[0] - vector1[0], vector0[1] - vector1[1]];
  }
  static mul(vector0, vector1) {
    return [vector0[0] * vector1[0], vector0[1] * vector1[1]];
  }
  static div(vector0, vector1) {
    return [vector0[0] / vector1[0], vector0[1] / vector1[1]];
  }
  static distance(vector0, vector1) {
    return Vector.length(Vector.sub(vector0, vector1));
  }
  static projection(vector0, vector1) {
    var rate = Vector.dot(vector0, vector1) / Vector.dot(vector1, vector1);
    return [vector1[0] * rate, vector1[1] * rate];
  }
  static length(vector) {
    return Math.sqrt(Vector.dot(vector, vector));
  }
  static scale(vector, scale) {
    return [vector[0] * scale, vector[1] * scale];
  }
  static collisionCalc(vector1, vector2, mass1, mass2) {
    return Vector.scale(
      Vector.add(Vector.scale(vector1, mass1 - mass2), Vector.scale(vector2, 2 * mass2)),
      1 / (mass1 + mass2)
    );
  }
  static normalize(vector) {
    const len = Vector.length(vector);
    if (len) return Vector.scale(vector, 1 / len);
    return Vector.clone(vector);
  }
  static normal(vector) {
    return [-vector[1], vector[0]];
  }
  static negate(vector) {
    return [-vector[0], -vector[1]];
  }
  // static inPolygon(vector, polygon) {
  //   let inside = false;
  //   const n = polygon.length;

  //   for (let i = 0, j = n - 1; i < n; j = i++) {
  //     const xi = polygon[i][0];
  //     const yi = polygon[i][1];
  //     const xj = polygon[j][0];
  //     const yj = polygon[j][1];
  //     console.log(vector[0], ((xj - xi) * (vector[1] - yi)) / (yj - yi) + xi);
  //     const intersect =
  //       yi > vector[1] !== yj > vector[1] && vector[0] < ((xj - xi) * (vector[1] - yi)) / (yj - yi) + xi;

  //     if (intersect) inside = !inside;
  //   }

  //   return inside;
  // }
  static inPolygon(point, polygon) {
    function isLeft(x0, y0, x1, y1, x, y) {
      return (x1 - x0) * (y - y0) - (x - x0) * (y1 - y0);
    }
    const x = point[0];
    const y = point[1];

    let wn = 0;

    for (let i = 0; i < polygon.length; i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];

      const nextIndex = (i + 1) % polygon.length;
      const xj = polygon[nextIndex][0];
      const yj = polygon[nextIndex][1];
      const lt = [Math.min(xi, xj), Math.min(yi, yj)];
      const rb = [Math.max(xi, xj), Math.max(yi, yj)];
      // console.log();
      if (x >= lt[0] && x <= rb[0] && y >= lt[1] && y <= rb[1]) {
        if (isLeft(xi, yi, xj, yj, x, y) == 0) {
          return true;
        }
      }
      if (yi <= y) {
        if (yj > y && isLeft(xi, yi, xj, yj, x, y) > 0) {
          wn++;
        }
      } else {
        if (yj <= y && isLeft(xi, yi, xj, yj, x, y) < 0) {
          wn--;
        }
      }
    }

    return wn !== 0;
  }

  static mix(vector0, vector1, rate) {
    return Vector.add(Vector.scale(vector0, 1 - rate), Vector.scale(vector1, rate));
  }
  static rebound(vel, well) {
    const projection = Vector.projection(vel, well);
    const force = Vector.sub(vel, projection);

    return Vector.add(Vector.negate(force), projection);
  }
  static average(vectors) {
    const sum = [0, 0];
    if (vectors.length) {
      vectors.forEach((pos) => {
        VectorE.add(sum, pos);
      });
      VectorE.scale(sum, 1 / vectors.length);
    }
    return sum;
  }
  static nearlyEqual(vector0, vector1) {
    const v = Vector.sub(vector0, vector1);
    return Vector.dot(v, v) < Float.verySmallAmount * Float.verySmallAmount;
  }
}
export class VectorE {
  static set(vector0, vector1) {
    vector0[0] = vector1[0];
    vector0[1] = vector1[1];
    return vector0;
  }
  static add(vector0, vector1) {
    vector0[0] += vector1[0];
    vector0[1] += vector1[1];
    return vector0;
  }
  static sub(vector0, vector1) {
    vector0[0] -= vector1[0];
    vector0[1] -= vector1[1];
    return vector0;
  }
  static scale(vector, scale) {
    vector[0] *= scale;
    vector[1] *= scale;
    return vector;
  }
}
export class Line {
  static findIntersection(p0, p1, p2, p3) {
    const v1 = Vector.sub(p1, p0);
    const v2 = Vector.sub(p3, p2);

    const det = Vector.cross(v1, v2);
    // console.log(det);
    if (det === 0) {
      return null;
    } else {
      const v3 = Vector.sub(p2, p0);
      const t = Vector.cross(v3, v2) / det;
      const t0 = Vector.cross(v3, v1) / det;
      if (t >= 0 && t <= 1 && t0 >= 0 && t0 <= 1) {
        const intersection = Vector.add(p0, Vector.scale(v1, t));
        // const intersection0 = Vector.add(p2, Vector.scale(v2, t0));
        // console.log(intersection, intersection0);
        return intersection;
      } else {
        return null;
      }
    }
  }

  static doLineSegmentsIntersect(p0, p1, p2, p3) {
    function orientation(p, q, r) {
      var val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
      if (val === 0) return 0; // 共線
      return val > 0 ? 1 : 2; // 順時針或逆時針
    }

    function onSegment(p, q, r) {
      return (
        q[0] <= Math.max(p[0], r[0]) &&
        q[0] >= Math.min(p[0], r[0]) &&
        q[1] <= Math.max(p[1], r[1]) &&
        q[1] >= Math.min(p[1], r[1])
      );
    }

    var o1 = orientation(p0, p1, p2);
    var o2 = orientation(p0, p1, p3);
    var o3 = orientation(p2, p3, p0);
    var o4 = orientation(p2, p3, p1);
    if (o1 !== o2 && o3 !== o4) {
      return true;
    }
    if (o1 === 0 && onSegment(p0, p2, p1)) return true;
    if (o2 === 0 && onSegment(p0, p3, p1)) return true;
    if (o3 === 0 && onSegment(p2, p0, p3)) return true;
    if (o4 === 0 && onSegment(p2, p1, p3)) return true;

    return false;
  }
  static getLineABC(point0, point1) {
    const v = Vector.sub(point1, point0);
    const a = v[1];
    const b = -v[0];
    const c = -point0[0] * v[1] + v[0] * point0[1];
    return { a, b, c };
  }
  static getLine(point0, point1) {
    return { pos: point0, dir: Vector.sub(point1, point0) };
  }
  static toLineDistance(point, point0, point1, pn = false) {
    const v = Vector.sub(point1, point0);
    const a = v[1];
    const b = -v[0];
    const c = -point0[0] * v[1] + v[0] * point0[1];
    const ans = (point[0] * a + point[1] * b + c) / Vector.length(v);
    return pn ? ans : Math.abs(ans);
  }
  static shortestDistancePointToLine(point, point0, point1) {
    const { a, b, c } = Line.getLineABC(point0, point1);
    const x = (b * (b * point[0] - a * point[1]) - a * c) / (a ** 2 + b ** 2);
    const y = (a * (-b * point[0] + a * point[1]) - b * c) / (a ** 2 + b ** 2);
    return [x, y];
  }
}
