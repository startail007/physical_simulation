class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  constains(point) {
    return (
      point[0] >= this.x && point[0] <= this.x + this.width && point[1] >= this.y && point[1] <= this.y + this.height
    );
  }

  intersect(rect) {
    return !(
      rect.x > this.x + this.width ||
      rect.x + rect.width < this.x ||
      rect.y > this.y + this.height ||
      rect.y + rect.height < this.y
    );
  }
}
class Quadtree {
  constructor(boundary, minRange = 1, maxPoints = 4, maxLevel = 5, level = 0) {
    this.corner = ["northwest", "northeast", "southeast", "southwest"];
    this.reset(boundary, minRange, maxPoints, maxLevel, level);
  }
  reset(boundary, minRange = 1, maxPoints = 4, maxLevel = 5, level = 0) {
    this.clear();
    this.boundary = boundary;
    this.center = [boundary.x + boundary.width * 0.5, boundary.y + boundary.height * 0.5];
    this.minRange = minRange;
    this.maxPoints = maxPoints;
    this.maxLevel = maxLevel;
    this.level = level;
    this.points = [];
    this.divided = false; //儲存是否分割
  }
  subdivide() {
    const w = this.boundary.width * 0.5;
    const h = this.boundary.height * 0.5;
    const pos = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
    this.corner.forEach((key, i) => {
      this[key] = new Quadtree(
        new Rectangle(this.boundary.x + pos[i][0], this.boundary.y + pos[i][1], w, h),
        this.minRange,
        this.maxPoints,
        this.maxLevel,
        this.level + 1
      );
    });
  }
  insertOrientation(pointData) {
    //依據位置分四個界
    if (pointData.point[0] < this.center[0]) {
      if (pointData.point[1] < this.center[1]) {
        this.northwest.insert(pointData);
      } else {
        this.southwest.insert(pointData);
      }
    } else {
      if (pointData.point[1] < this.center[1]) {
        this.northeast.insert(pointData);
      } else {
        this.southeast.insert(pointData);
      }
    }
  }
  insert(pointData) {
    if (!this.divided) {
      if (
        this.points.length < this.maxPoints ||
        this.level > this.maxLevel ||
        this.boundary.width <= this.minRange ||
        this.boundary.height <= this.minRange
      ) {
        //存放的點數量未滿、存放深度超過、分割的寬高小於最小尺寸 就添加位置
        this.points.push(pointData);
      } else {
        //將所有點存放到下一層
        this.divided = true;
        this.subdivide();
        for (let i = 0; i < this.points.length; i++) {
          this.insertOrientation(this.points[i]);
        }
        this.points = [];
        this.insertOrientation(pointData);
      }
    } else {
      this.insertOrientation(pointData);
    }
  }
  query(range, found) {
    if (!found) found = [];
    if (!this.boundary.intersect(range)) return found;
    if (this.divided) {
      this.corner.forEach((key) => {
        this[key].query(range, found);
      });
    } else {
      for (let i = 0; i < this.points.length; i++) {
        if (range.constains(this.points[i].point)) {
          found.push(this.points[i]);
        }
      }
    }
    return found;
  }
  clear() {
    this.points = [];
    if (this.divided) {
      this.corner.forEach((key) => {
        this[key].clear();
        this[key] = undefined;
      });
      this.divided = false;
    }
  }
  render(ctx) {
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.strokeRect(this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height);
    ctx.stroke();

    if (this.divided) {
      this.corner.forEach((key) => {
        this[key].render(ctx);
      });
    }
  }
}
export { Rectangle, Quadtree };
