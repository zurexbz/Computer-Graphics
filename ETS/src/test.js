var utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var characterControls_1 = __webpack_require__(/*! ./characterControls */ "./src/characterControls.ts");
var THREE = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
var OrbitControls_1 = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
var GLTFLoader_js_1 = __webpack_require__(/*! three/examples/jsm/loaders/GLTFLoader.js */ "./node_modules/three/examples/jsm/loaders/GLTFLoader.js");
// SCENE
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);
// CAMERA
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;
// RENDERER
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
// CONTROLS
var orbitControls = new OrbitControls_1.OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 15;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.update();
// LIGHTS
light();
// FLOOR
generateFloor();
// MODEL WITH ANIMATIONS
var characterControls;
new GLTFLoader_js_1.GLTFLoader().load('models/RobotExpressive.glb', function (gltf) {
    var model = gltf.scene;
    model.traverse(function (object) {
        if (object.isMesh)
            object.castShadow = true;
    });
    scene.add(model);
    var gltfAnimations = gltf.animations;
    var mixer = new THREE.AnimationMixer(model);
    var animationsMap = new Map();
    gltfAnimations.filter(function (a) { return a.name != 'TPose'; }).forEach(function (a) {
        animationsMap.set(a.name, mixer.clipAction(a));
    });
    characterControls = new characterControls_1.CharacterControls(model, mixer, animationsMap, orbitControls, camera, 'Idle');
});
// CONTROL KEYS
var keysPressed = {};
var keyDisplayQueue = new utils_1.KeyDisplay();
document.addEventListener('keydown', function (event) {
    keyDisplayQueue.down(event.key);
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle();
    }
    else {
        keysPressed[event.key.toLowerCase()] = true;
    }
}, false);
document.addEventListener('keyup', function (event) {
    keyDisplayQueue.up(event.key);
    keysPressed[event.key.toLowerCase()] = false;
}, false);
var clock = new THREE.Clock();
// ANIMATE
function animate() {
    var mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();
// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
function generateFloor() {
    // TEXTURES
    var textureLoader = new THREE.TextureLoader();
    var placeholder = textureLoader.load("./textures/placeholder/placeholder.png");
    var sandBaseColor = textureLoader.load("./textures/sand/Sand 002_COLOR.jpg");
    var sandNormalMap = textureLoader.load("./textures/sand/Sand 002_NRM.jpg");
    var sandHeightMap = textureLoader.load("./textures/sand/Sand 002_DISP.jpg");
    var sandAmbientOcclusion = textureLoader.load("./textures/sand/Sand 002_OCC.jpg");
    var WIDTH = 80;
    var LENGTH = 80;
    var geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    var material = new THREE.MeshStandardMaterial({
        map: sandBaseColor, normalMap: sandNormalMap,
        displacementMap: sandHeightMap, displacementScale: 0.1,
        aoMap: sandAmbientOcclusion
    });
    wrapAndRepeatTexture(material.map);
    wrapAndRepeatTexture(material.normalMap);
    wrapAndRepeatTexture(material.displacementMap);
    wrapAndRepeatTexture(material.aoMap);
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})
    var floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
}
function wrapAndRepeatTexture(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.x = map.repeat.y = 10;
}
function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-60, 100, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}