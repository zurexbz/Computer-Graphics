// import * as THREE from './node_modules/three/build/three.module.js'
import * as THREE from "three";
import { Vector3 } from "three";
import { nearestPowerOfTwo } from "three/src/math/MathUtils";

const _BOID_SPEED = 1.5;
const _BOID_ACCELERATION = _BOID_SPEED / 5.0;
const _BOID_FORCE_MAX = _BOID_ACCELERATION / 10.0;
const _BOID_FORCE_ALIGNMENT = 10;
const _BOID_FORCE_SEPARATION = 20;
const _BOID_FORCE_COHESION = 10;

export default class Boid {
  constructor(position, direction, mesh, animationsMap, mixer, currentAction) {
    this.position = position;
    this.direction = direction;
    this.velocity = direction;
    this.acceleration = _BOID_ACCELERATION;
    this.mesh = mesh;
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.perceptionRadius = Math.random() * 100;
    this.wanderAngle = 0;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play();
      }
    });
    this.obj = new THREE.Group();
  }

  update(boids, delta) {
    this.mixer.update(delta);
    this.edges();
    var a1 = this.separation(boids);
    var a2 = this.alignment(boids);
    var a3 = this.cohesion(boids);

    const steeringForce = new THREE.Vector3(0, 0, 0);

    steeringForce.add(a1);
    steeringForce.add(a2);
    steeringForce.add(a3);
    steeringForce.multiplyScalar(this.acceleration);
    steeringForce.multiply(new THREE.Vector3(1, 0.25, 1));

    if (steeringForce.length() > this.maxForce) {
      steeringForce.normalize();
      steeringForce.multiplyScalar(_BOID_FORCE_MAX);
    }

    this.velocity.add(steeringForce);

    if (this.velocity.length() > _BOID_SPEED) {
      this.velocity.normalize();
      this.velocity.multiplyScalar(_BOID_SPEED);
    }

    this.position.add(this.velocity);

    this.direction = this.velocity.clone();
    this.direction.normalize();

    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    if (this.obj != null) {
      this.obj.position.set(this.position.x, this.position.y, this.position.z);
      // var clamp = 0.002;
      // var angleX = Math.atan(this.direction.y / this.direction.z *clamp);
      // var angleY = Math.atan(this.direction.x / this.direction.z * clamp);
      // this.obj.rotateX(angleX);
      // this.obj.rotateY(angleY);
      const direction = this.direction;
      const m = new THREE.Matrix4();
      m.lookAt(
        new THREE.Vector3(0, 0, 0),
        direction,
        new THREE.Vector3(0, 1, 0)
      );
      this.obj.quaternion.setFromRotationMatrix(m);
    }
  }

  setObj(obj, mixer, animationsMaps, defAnimation) {
    this.obj = obj;

    this.obj.position.set(this.position.x, this.position.y, this.position.z);
  }

  edges() {
    var boundary = 3000;
    var minY = 80;
    var maxY = 380;
    var maxX = 1250 * 1.3;
    var maxZ = 1250 * 1.3;
    if (this.position.x > maxX) {
      this.position.x = -maxX;
    } else if (this.position.x < -maxX) {
      this.position.x = maxX;
    }

    if (this.position.y > maxY) {
      this.position.y = maxY;
    } else if (this.position.y < minY) {
      this.position.y = minY;
    }

    if (this.position.z > maxZ) {
      this.position.z = -maxZ;
    } else if (this.position.z < -maxZ) {
      this.position.z = maxZ;
    }
  }

  separation(boids) {
    var dv = new THREE.Vector3();
    boids.forEach((boid) => {
      var d = this.position.distanceTo(boid.position);
      if (boid != this && d < this.perceptionRadius) {
        const distanceToEntity = Math.max(
          boid.position.distanceTo(this.position) - 1.5 * (2 + 2),
          0.001
        );
        const directionFromEntity = new THREE.Vector3().subVectors(
          this.position,
          boid.position
        );
        const multiplier =
          (_BOID_FORCE_SEPARATION / distanceToEntity) * (2 + 2);

        directionFromEntity.normalize();

        dv.add(directionFromEntity.multiplyScalar(multiplier));
      }
    });

    return dv;
  }

  alignment(boids) {
    var dv = new THREE.Vector3();
    boids.forEach((boid) => {
      if (
        boid != this &&
        this.position.distanceTo(boid.position) < this.perceptionRadius
      ) {
        dv.add(boid.direction);
      }
    });

    dv.normalize();
    dv.multiplyScalar(_BOID_FORCE_ALIGNMENT);

    return dv;
  }

  cohesion(boids) {
    var dv = new THREE.Vector3();

    if (boids.length == 0) {
      return dv;
    }

    var count = 0;
    boids.forEach((boid) => {
      if (
        boid != this &&
        this.position.distanceTo(boid.position) < this.perceptionRadius
      ) {
        dv.add(boid.position);
        count += 1;
      }
    });

    if (count) {
      dv.divideScalar(count);
      dv.sub(this.position);
      dv.normalize();
      dv.multiplyScalar(_BOID_FORCE_COHESION);
    }

    return dv;
  }
}
