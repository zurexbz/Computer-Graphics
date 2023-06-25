import { KeyDisplay } from "./utils";
import { CharacterControls } from "./characterControls";
import * as THREE from "three";
import {
  CameraHelper,
  ClampToEdgeWrapping,
  FogExp2,
  Mesh,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Flock from "./Flock";
// import SkeletonUtils from 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/jsm/utils/SkeletonUtils.js';
import { clone } from "./skeleton";
import { animatedObject } from "./animationObject";

let gameOver = 0;
let cubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let coral1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let coral2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let sharkBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
let balls_BB = new Array<THREE.Sphere>();

var requestId = 0,
  animationStartTime = 0,
  stoppedAt = 0;

var score = 0;
// SCENE
let soundVolume = 0.5;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

scene.fog = new THREE.FogExp2(0x009dc4, 0.0015);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);
camera.position.y = 10;
camera.position.z = -25;
camera.position.x = 0;
camera.rotateX(Math.PI / 2);
// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 100;
orbitControls.enablePan = false;
// orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

// LIGHTS
light();

// FLOOR
// generateFloor();

var flock = new Flock();

new GLTFLoader().load("models/guppy_fish.glb", function (gltf) {
  var model = gltf.scene;
  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();

  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });
  flock.init(animationsMap, mixer, "ArmatureAction.001");

  console.log(animationsMap);
  model.scale.set(5, 5, 5);
  flock.boids.forEach((boid) => {
    boid.setObj(clone(model), mixer, animationsMap, "ArmatureAction.001");
    scene.add(boid.obj);
  });
});

var flock2 = new Flock();
let bream: animatedObject;
new GLTFLoader().load("models/bream_muter.glb", function (gltf) {
  var model = gltf.scene;
  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  model.scale.set(0.05, 0.05, 0.05);
  // model.position.set(0, 100, 0);
  // scene.add(model);

  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });
  console.log("bream");
  console.log(animationsMap);
  bream = new animatedObject(
    model,
    mixer,
    animationsMap,
    "Armature|ArmatureAction"
  );
  // scene.add(bream);
  flock2.init(animationsMap, mixer, "Armature|ArmatureAction");
  flock2.boids.forEach((boid) => {
    boid.setObj(clone(model), mixer, animationsMap, "Armature|ArmatureAction");

    // scene.add(boid.mesh);
    scene.add(boid.obj);
  });
});

var flock3 = new Flock();

new GLTFLoader().load("models/koi_fish.glb", function (gltf) {
  var model = gltf.scene;
  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  model.scale.set(0.5, 0.5, 0.5);
  // model.position.set(0,100,0);
  // scene.add(model);

  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });
  console.log(animationsMap);
  flock3.init(animationsMap, mixer, "swim");
  flock3.boids.forEach((boid) => {
    boid.setObj(clone(model), mixer, animationsMap, "swim");
    // scene.add(boid.mesh);
    scene.add(boid.obj);
  });
});

let shark: animatedObject;
new GLTFLoader().load("models/shark.glb", function (gltf) {
  var model = gltf.scene;
  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  model.scale.set(0.3, 0.3, 0.3);
  model.position.set(-400, 200, 50);
  scene.add(model);
  sharkBB.setFromObject(model);
  sharkBB.min.multiplyScalar(0.3);
  sharkBB.max.multiplyScalar(0.3);
  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });
  console.log(animationsMap);
  shark = new animatedObject(model, mixer, animationsMap, "Swimming");
});

// AUDIO TOGGLE
var audioToggle: boolean = false;

// MODEL WITH ANIMATIONS
var characterControls: CharacterControls;

let playerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
new GLTFLoader().load("models/ikan.glb", function (gltf) {
  const model = gltf.scene;
  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });
  model.scale.set(0.01, 0.01, 0.01);
  // model.scale.set(5,5,5);
  model.position.set(0, 150, 0);
  scene.add(model);

  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();

  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a));
    });
  console.log(model);
  characterControls = new CharacterControls(
    model,
    mixer,
    animationsMap,
    orbitControls,
    camera,
    "Armature|ArmatureAction"
  );
  playerBB.setFromObject(characterControls.getModel().children[1]);
  // console.log(characterControls.getModel().children[1]);
});

// CONTROL KEYS
const keysPressed = {};
const keyDisplayQueue = new KeyDisplay();
var pressed: boolean = true;
document.addEventListener(
  "keydown",
  (event) => {
    if (event.shiftKey && characterControls) {
      characterControls.switchRunToggle();
    } else if (event.code == "Space") {
      characterControls.switchJumpToggle();
    } else if (event.key == "b") {
      characterControls.switchSitToggle();
    } else if (event.key == "f") {
      characterControls.switchPunchToggle();
    } else {
      (keysPressed as any)[event.key.toLowerCase()] = true;
    }
  },
  false
);
document.addEventListener(
  "keyup",
  (event) => {
    if (event.code == "Space") {
      characterControls.switchJumpToggle();
    } else if (event.key == "f") {
      characterControls.switchPunchToggle();
    } else {
      (keysPressed as any)[event.key.toLowerCase()] = false;
    }
  },
  false
);

// ANIMATE
const clock = new THREE.Clock();
function animate() {
  let mixerUpdateDelta = clock.getDelta();

  if (characterControls) {
    let flag = false;

    if (flag) {
      characterControls.currentAction = "";
      console.log("collide");
    } else characterControls.currentAction = "Armature | ArmatureAction";

    var objek: THREE.Mesh;
    characterControls.getModel().traverse(function (object: any) {
      if (object.isMesh) objek = object;
    });

    playerBB.copy(objek.geometry.boundingBox).applyMatrix4(objek.matrixWorld);
    flag = checkCollision();
    characterControls.update(mixerUpdateDelta, keysPressed, flag);
    incrementScore();
  }
  if (shark) {
    shark.update(mixerUpdateDelta);
    var objek: THREE.Mesh;
    shark.getModel().traverse(function (object: any) {
      if (object.isMesh) objek = object;
    });
    sharkBB.copy(objek.geometry.boundingBox).applyMatrix4(objek.matrixWorld);
    let flag = checkCollision();
    if (flag) {
      console.log("u ded bos");
      gameOver++;
      if (gameOver >= 11) stop();
    }
  }
  flock.update(clock.getDelta);
  flock2.update(clock.getDelta);
  flock3.update(clock.getDelta);
  if (bream) bream.update(mixerUpdateDelta);

  orbitControls.update();
  if (camera.position.y < -25) {
    // camera.position.y = 1;
    // if(camera.position.z > 5)
    camera.position.z -= 1;
  }

  // console.log(camera.position)
  renderer.render(scene, camera);
  requestId = requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);

function checkCollision() {
  if (
    playerBB.intersectsBox(cubeBB) ||
    playerBB.intersectsBox(coral1BB) ||
    playerBB.intersectsBox(coral2BB)
  ) {
    console.log("collide");
    return true;
  }
  if (playerBB.intersectsBox(sharkBB)) {
    return true;
  }
  return false;
}
// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

function wrapAndRepeatTexture(map: THREE.Texture, times: number) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.x = map.repeat.y = times;
}

function light() {
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight1.position.set(0, 512, 256);

  dirLight1.castShadow = true;

  dirLight1.shadow.camera.top = 2048;
  dirLight1.shadow.camera.bottom = -2048;
  dirLight1.shadow.camera.left = -2048;
  dirLight1.shadow.camera.right = 2048;
  dirLight1.shadow.camera.near = 0.1;
  dirLight1.shadow.camera.far = 5000;
  dirLight1.shadow.mapSize.width = 16000;
  dirLight1.shadow.mapSize.height = 16000;
  // const helper = new THREE.DirectionalLightHelper( dirLight1, 5 );
  // scene.add( helper );
  scene.add(dirLight1);
}

function initAudio() {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // create a global audio source
  const sound = new THREE.Audio(listener);
  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("sounds/Salutations.m4a", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(soundVolume);
    sound.play();
  });
}

initAudio();
// const axesHelper = new THREE.AxesHelper( 1000 );
// scene.add( axesHelper );

const sand = new THREE.TextureLoader().load("textures/sand.jpg");
const coral = new THREE.TextureLoader().load("textures/coral.jpg");
const stone = new THREE.TextureLoader().load("textures/stone.jpg");
const blue = new THREE.TextureLoader().load("textures/model_normal.jpg");

function loadArea() {
  new GLTFLoader().load("textures/grafkom-pls.glb", function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object: any) {
      console.log(object);
      if (object.isMesh) {
        if (object.name == "Coral_1") {
          const material = new THREE.MeshStandardMaterial({ map: coral });
          material.side = THREE.DoubleSide;
          object.material = material;
        }
        if (object.name == "Coral_2") {
          const material = new THREE.MeshStandardMaterial({ map: coral });
          material.side = THREE.DoubleSide;
          object.material = material;
        }
        if (object.name == "Rock") {
          const material = new THREE.MeshStandardMaterial({ map: stone });
          material.side = THREE.DoubleSide;
          cubeBB.setFromObject(object);
          cubeBB.min.multiplyScalar(100);
          cubeBB.max.multiplyScalar(100);
          console.log(cubeBB);
          object.material = material;
        }
        if (object.name == "Ocean" || object.name == "Cube") {
          const material = new THREE.MeshStandardMaterial({ map: blue });
          material.side = THREE.DoubleSide;
          object.material = material;
        }

        object.castShadow = true;
      }
    });
    model.scale.set(100, 100, 100);
    model.position.set(0, -100, 0);
    // model.rotateX(90);
    scene.add(model);
  });
}

loadArea();

var foodPos: Map<string, THREE.Mesh> = new Map();
function randomFood() {
  for (var i = 0; i < 50; i++) {
    var geometry = new THREE.SphereGeometry(5, 32, 16);
    var material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);

    switch (i % 4) {
      case 0:
        var pos = new Vector3().random().multiplyScalar(1000);
        break;
      case 1:
        var pos = new Vector3().random().multiplyScalar(-1000);
        break;
      case 2:
        var pos = new Vector3()
          .random()
          .multiplyScalar(1000)
          .multiply(new Vector3(-1, 1, 1));
        break;
      case 3:
        var pos = new Vector3()
          .random()
          .multiplyScalar(1000)
          .multiply(new Vector3(1, 1, -1));
        break;
    }

    sphere.position.set(pos.x, Math.random() * 300 + 40, pos.z);
    scene.add(sphere);
    balls_BB.push(new THREE.Sphere(sphere.position, 5));
    foodPos.set(sphere.uuid, sphere);
  }
}

randomFood();

function incrementScore() {
  balls_BB.forEach(function (food) {
    if (playerBB.intersectsSphere(food)) {
      foodPos.forEach(function (item) {
        let itemPos = item.position;
        let bbPos = food.center;
        if (itemPos == bbPos) {
          score++;
          document.getElementById("score").innerHTML = score.toString();
          console.log(score);
          scene.remove(item);
          foodPos.delete(item.uuid);
          if (score % 5 == 0) {
            characterControls.model.scale.multiplyScalar(1.5);
            playerBB.min.multiplyScalar(1.5);
            playerBB.max.multiplyScalar(1.5);
            orbitControls.maxDistance += 25;
          }
        }
      });
    }
  });
  // foodPos.forEach(function (food) {
  //   if (food.position.distanceTo(characterControls.model.position) < 5) {
  //     score++;
  //     console.log(score);
  //     scene.remove(food);
  //     foodPos.delete(food.uuid);
  //     characterControls.model.scale.multiplyScalar(1.5);
  //     orbitControls.maxDistance += 20;
  //   }
  // });
}

function stop() {
  var ele = document.getElementById("gameOver");
  var maxScore = document.getElementById("maxScore");
  maxScore.innerHTML = score.toString();
  ele.classList.remove("hidden");
}
animate();
