import { Rectangle, Quadtree } from "./js/quadtree.js";
import { Vector, VectorE } from "./js/vector.js";

const canvas = document.getElementById("canvas02");
const ctx = canvas.getContext("2d");
let cWidth = canvas.width;
let cHeight = canvas.height;
// let acceleration = 2;
/*let force = 12;
let x = 20;
let mass = 5;
let friction = 2;
let velocity = 0;*/
const gravity = 9.8;

function getForce(sf, df, velocity, time_step) {
  let friction_force = [0, 0];
  const l = Vector.length(velocity, time_step);
  if (l !== 0) {
    if (l / time_step > sf) {
      const v = Vector.scale(velocity, 1 / l);
      friction_force = Vector.scale(v, -df * time_step);
    } else {
      friction_force = Vector.scale(velocity, -sf * time_step);
    }
  }
  return friction_force;
}
class RigidBody {
  constructor(mass, static_friction_coefficient, dynamic_friction_coefficient) {
    this.mass = mass;
    this.static_friction_coefficient = static_friction_coefficient;
    this.dynamic_friction_coefficient = dynamic_friction_coefficient;
    this.position = [0, 0];
    //this.velocity_old = [0, 0];
    this.velocity = [0, 0];
    this.force = [0, 0];
    // this.is_static_friction = true;
  }
  apply_force(force) {
    VectorE.add(this.force, force);
  }
  update(time_step) {
    /*const l = Vector.length(this.velocity);
    if (l !== 0) {
      if (l / time_step > this.static_friction_coefficient * gravity) {
        const v = Vector.scale(this.velocity, 1 / l);
        const friction_force = Vector.scale(v, -this.dynamic_friction_coefficient * time_step * gravity);
        this.apply_force(friction_force);
      } else {
        const friction_force = Vector.scale(this.velocity, -this.static_friction_coefficient * time_step * gravity);
        this.apply_force(friction_force);
      }
    }*/
    //const f = getForce(this.static_friction_coefficient, this.dynamic_friction_coefficient, this.velocity, time_step);
    //this.apply_force(f);
    const drag = Vector.scale(this.velocity, -0.001);
    this.apply_force(drag);
    const acceleration = Vector.scale(this.force, 1 / this.mass);
    VectorE.add(this.velocity, Vector.scale(acceleration, time_step));
    VectorE.add(this.position, Vector.scale(this.velocity, time_step));
    this.force = [0, 0];
  }
  draw(color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(...this.position, 20, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#00ff00";
    ctx.beginPath();
    ctx.moveTo(...this.position);
    ctx.lineTo(...Vector.add(this.position, Vector.scale(this.velocity, 1)));
    ctx.stroke();
  }
}

const sub_steps = 10;
const rigid_bodys = [];

// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [120, 168];
//   // rigid_body01.position = [120, 150];
//   rigid_body.apply_force([500.0 * sub_steps, 0.0]);
//   rigid_bodys.push(rigid_body);
// }
// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [680, 168];
//   // rigid_body02.position = [680, 150];
//   rigid_body.apply_force([-500.0 * sub_steps, 0.0]);
//   rigid_bodys.push(rigid_body);
// }
setInterval(() => {
  if (rigid_bodys.length < 150) {
    const rigid_body = new RigidBody(1, 0.7, 0.3);
    rigid_body.position = [680, 300];
    rigid_bodys.push(rigid_body);
  }
}, 200);

// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [400, 280];
//   rigid_bodys.push(rigid_body);
// }
// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [360, 280];
//   rigid_bodys.push(rigid_body);
// }
// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [320, 280];
//   rigid_bodys.push(rigid_body);
// }
// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [280, 280];
//   rigid_bodys.push(rigid_body);
// }
// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [240, 280];
//   rigid_bodys.push(rigid_body);
// }
// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [200, 280];
//   rigid_bodys.push(rigid_body);
// }

// {
//   const rigid_body = new RigidBody(1, 0.9, 0.7);
//   rigid_body.position = [580, 280];
//   rigid_bodys.push(rigid_body);
//   rigid_body.apply_force([-1000.0 * sub_steps, 0.0]);
// }
const update = (dt) => {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cWidth, cHeight);
  // const external_force = [1, 0.0];
  // rigid_body.apply_force(external_force);
  const sub_dt = dt / sub_steps;
  for (let t = 0; t < sub_steps; t++) {
    for (let i = 0; i < rigid_bodys.length; i++) {
      const rigid_body = rigid_bodys[i];
      rigid_body.apply_force([0, 98]);
      //console.log(rigid_body.force);
    }
    for (let i = 0; i < rigid_bodys.length; i++) {
      const rigid_body = rigid_bodys[i];
      const to_obj = Vector.sub(rigid_body.position, [400, 300]);
      const dist = Vector.length(to_obj);
      if (dist > 300 - 20) {
        const n = Vector.scale(to_obj, 1 / dist);
        const force1 = Vector.projection(rigid_body.velocity, n);
        const fv01 = Vector.sub(rigid_body.velocity, force1)
        // const f01 = getForce(
        //   rigid_body.static_friction_coefficient,
        //   rigid_body.dynamic_friction_coefficient,
        //   fv01,
        //   sub_dt
        // );
        // rigid_body.apply_force(f01);
        rigid_body.velocity = Vector.add(fv01, Vector.scale(force1, -0.9));
        rigid_body.position = Vector.add([400, 300], Vector.scale(n, 300 - 20));
      }
    }
    for (let i = 0; i < rigid_bodys.length - 1; i++) {
      for (let j = i + 1; j < rigid_bodys.length; j++) {
        const rigid_body01 = rigid_bodys[i];
        const rigid_body02 = rigid_bodys[j];
        const collision_axis = Vector.sub(rigid_body01.position, rigid_body02.position);
        const dist = Vector.length(collision_axis);
        if (dist < 40) {
          const n = Vector.scale(collision_axis, 1 / dist);

          const force1 = Vector.projection(rigid_body01.velocity, n);
          const force2 = Vector.projection(rigid_body02.velocity, n);
          const v1 = Vector.collisionCalc(force1, force2, rigid_body01.mass, rigid_body02.mass);
          const v2 = Vector.collisionCalc(force2, force1, rigid_body02.mass, rigid_body01.mass);
          const fv01 = Vector.sub(rigid_body01.velocity, force1);
          const fv02 = Vector.sub(rigid_body02.velocity, force2);


          // const f01 = getForce(
          //   rigid_body01.static_friction_coefficient + rigid_body02.static_friction_coefficient,
          //   rigid_body01.dynamic_friction_coefficient + rigid_body02.dynamic_friction_coefficient,
          //   Vector.sub(fv01, fv02),
          //   dt
          // );
          // rigid_body01.apply_force(f01);
          rigid_body01.velocity = Vector.add(fv01, Vector.scale(v1, 0.9));
          //rigid_body01.velocity = Vector.add(fv01, v1);

          // const f02 = getForce(
          //   rigid_body01.static_friction_coefficient + rigid_body02.static_friction_coefficient,
          //   rigid_body01.dynamic_friction_coefficient + rigid_body02.dynamic_friction_coefficient,
          //   Vector.sub(fv02, fv01),
          //   dt
          // );
          // rigid_body02.apply_force(f02);
          rigid_body02.velocity = Vector.add(fv02, Vector.scale(v2, 0.9));
          //rigid_body02.velocity = Vector.add(fv02, v2);

          const delta = 40 - dist;
          //VectorE.add(rigid_body01.velocity, Vector.scale(n, 0.5 * delta));
          //VectorE.add(rigid_body02.velocity, Vector.scale(n, -0.5 * delta));
          VectorE.add(rigid_body01.position, Vector.scale(n, 0.5 * delta));
          VectorE.add(rigid_body02.position, Vector.scale(n, -0.5 * delta));
        }
      }
    }

    // rigid_body01.apply_force([20.0, 0.0]);
    // rigid_body02.apply_force([-20.0, 0.0]);

    // {
    //   const f = getForce(rigid_body01.static_friction_coefficient, rigid_body01.dynamic_friction_coefficient, rigid_body01.velocity, dt);
    //   rigid_body01.apply_force(f);
    // }
    // {
    //   const f = getForce(rigid_body02.static_friction_coefficient, rigid_body02.dynamic_friction_coefficient, rigid_body02.velocity, dt);
    //   rigid_body02.apply_force(f);
    // }
    // {
    //   const f = getForce(rigid_body03.static_friction_coefficient, rigid_body03.dynamic_friction_coefficient, rigid_body03.velocity, dt);
    //   rigid_body03.apply_force(f);
    // }
    for (let i = 0; i < rigid_bodys.length; i++) {
      const rigid_body = rigid_bodys[i];
      rigid_body.update(sub_dt);
    }
  }
  for (let i = 0; i < rigid_bodys.length; i++) {
    const rigid_body = rigid_bodys[i];
    rigid_body.draw("#ff0000");
  }
  // rigid_body03.draw("#0000ff");
  /*let acceleration = (force - friction) / mass;
  console.log(acceleration);
  velocity += acceleration * dt;
  x += velocity * dt;
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(x, 100, 40, 40);
  ctx.fill();*/
  /*ctx.fillStyle = "#ff0000";
  ctx.fillRect(...rigid_body.position, 40, 40);
  ctx.fill();*/
};
let oldTime = Date.now();
const animate = () => {
  requestAnimationFrame(animate);
  const nowTime = Date.now();
  const delta = (nowTime - oldTime) / 1000;
  oldTime = nowTime;
  update(0.1);
  ctx.font = "18px Noto Sans TC";
  ctx.textAlign = "start";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#ffffff";
  ctx.fillText((1 / delta).toFixed(1), 10, 10);
};
animate();
