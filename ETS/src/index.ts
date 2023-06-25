import { KeyDisplay } from './utils';
import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { CameraHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.y = 5;
camera.position.z = -25;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 100
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

// LIGHTS
light()

// FLOOR
generateFloor()

// AUDIO TOGGLE
var audioToggle: boolean = false

// MODEL WITH ANIMATIONS
var characterControls: CharacterControls
new GLTFLoader().load('models/RobotExpressive.glb', function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })

    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'Idle')
});



// CONTROL KEYS
const keysPressed = {  }
const keyDisplayQueue = new KeyDisplay();
var pressed: boolean = true;
document.addEventListener('keydown', (event) => {
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    }else if(event.code == "Space"){
        characterControls.switchJumpToggle();
    } 
    else if(event.key == "b"){
        characterControls.switchSitToggle();
    } else if(event.key == "f"){
        characterControls.switchPunchToggle();
    }
    else {
        (keysPressed as any)[event.key.toLowerCase()] = true
        // walkingSound(true);
       
    }
}, false);
document.addEventListener('keyup', (event) => {
    if(event.code == "Space"){
        characterControls.switchJumpToggle();
    }else if(event.key == "f"){
        characterControls.switchPunchToggle();
    } 
    else{
        (keysPressed as any)[event.key.toLowerCase()] = false
        // walkingSound(false);
    }
    
}, false);

const clock = new THREE.Clock();
// ANIMATE
function animate() {
    let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    orbitControls.update()
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
    const textureLoader = new THREE.TextureLoader();

    const WIDTH = 2048
    const LENGTH = 2048

    const geometry = new THREE.CircleGeometry(WIDTH,  512, 512);
    const material = new THREE.MeshStandardMaterial(
        {
            map: textureLoader.load('./textures/grass-texture.jpg'),
        })
    wrapAndRepeatTexture(material.map,50)
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2
    scene.add(floor)
}

function wrapAndRepeatTexture (map: THREE.Texture, times: number) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.x = map.repeat.y = times
}

function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.8))

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2)
    dirLight1.position.set(0, 512, 2048);
   
    dirLight1.castShadow = true;
   
    dirLight1.shadow.camera.top = 2048;
    dirLight1.shadow.camera.bottom = -2048;
    dirLight1.shadow.camera.left = - 2048;
    dirLight1.shadow.camera.right = 2048;
    dirLight1.shadow.camera.near = 0.1;
    dirLight1.shadow.camera.far = 5000;
    dirLight1.shadow.mapSize.width = 16000;
    dirLight1.shadow.mapSize.height = 16000;
    scene.add(dirLight1);
    // scene.add( new THREE.CameraHelper(dirLight1.shadow.camera))
}


function initAudio(){
    const listener = new THREE.AudioListener();
    camera.add( listener );
        
    // create a global audio source
    const sound = new THREE.Audio( listener );
        // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/kendil.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.2 );
        sound.play();
    });
   
}

function createSun(){
    const textureLoader = new THREE.TextureLoader();

    const geometry = new THREE.SphereGeometry(48,32,16);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00})
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const sun = new THREE.Mesh(geometry, material)
    sun.position.set(0, 512, 2000)
    sun.receiveShadow = false
    sun.castShadow = false
    scene.add(sun)
}

function createSkyBox(){
     const textureLoader = new THREE.TextureLoader();
    const g = new THREE.SphereGeometry(2048, 512, 512);
    const m = new THREE.MeshStandardMaterial({
        map: textureLoader.load('./textures/white-cloud-blue-sky.jpg'),
        side: THREE.DoubleSide
    });
    // wrapAndRepeatTexture(m.map, 5)
    const mesh = new THREE.Mesh(g, m);
    mesh.receiveShadow = true;
    scene.add(mesh)
}

function walkingSound(flag:boolean){
    const listener = new THREE.AudioListener();
    camera.add( listener );
        
    // create a global audio source
    const sound = new THREE.Audio( listener );
        // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    if(flag){
        audioLoader.load('sounds/Single-footstep-in-grass.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            
            sound.setVolume( 0.3 );
            sound.play();
        });
    }
}

// LOAD TREES
function loadTree(){
    var n = 150;
    for(var i=0;i<n;i++){
    new GLTFLoader().load('models/toon_tree_tutorial.glb', function (gltf) {
            const model = gltf.scene;
            model.traverse(function (object: any) {
                if (object.isMesh) object.castShadow = true;
            });
            model.scale.set(10,10,10)
            model.position.set(
                (THREE.MathUtils.randFloatSpread(2047)),
                0,
                (THREE.MathUtils.randFloatSpread(2047))
            );
            scene.add(model);
    });
    }
   
}

loadTree();
createSun();
createSkyBox();
initAudio()
