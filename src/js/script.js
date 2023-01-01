import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import top from "../res/top.jpg";
import bottom from "../res/bottom.jpg";
import left from "../res/left.jpg";
import right from "../res/right.jpg";
import front from "../res/front.jpg";
import back from "../res/back.jpg";
import roadmap from "../res/roadtest.jpg";

// Function to set up the renderer
function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  return renderer;
}

// Function to set up the scene
function initScene() {
  scene = new THREE.Scene();
  const textureLoader = new THREE.CubeTextureLoader();
  const cubeTexture = textureLoader.load([
    front,
    back,
    top,
    bottom,
    right,
    left,
  ]);
  scene.background = cubeTexture;
  return scene;
}

// Function to set up the camera
function initCamera() {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 30); // set the camera position to (0, 20, 0)
  return camera;
}

// Function to set up the orbit controls
function initControls(camera) {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  return controls;
}

// Function to set up the lights
function initLights(scene) {
  spotLight = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 6, 0.5, 1);
  spotLight.position.set(-7, 20, 270);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 500;
  scene.add(spotLight);
  return spotLight;
}

// Function to set up the track (ebby)
function createTrack(scene) {}

// Function to set up the plane
function initPlane(scene) {
  roadTexture = new THREE.TextureLoader().load(roadmap);
  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 500),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      map: roadTexture,
    })
  );
  plane.rotation.x = -0.5 * Math.PI;
  roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(1, 100);
  plane.receiveShadow = true;
  scene.add(plane);
  return plane;
}

// Function to set up the model
let f50;

function initModel(scene) {
  loader = new GLTFLoader();

  loader.load("./car_models/ff50.gltf", function (gltf) {
    f50 = gltf.scene;
    f50.scale.set(2, 2, 2);
    f50.castShadow = true;
    f50.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
      }
    });

    scene.add(f50);
  });
}

function moveModelOnKeyPress(f50) {
  // Set the speed at which the model moves
  const speed = 0.01;

  // Add event listener for keydown events
  document.addEventListener("keydown", (event) => {
    // Get the current position of the model
    const currentPosition = f50.position;
    const currentRotation = f50.rotation.y;

    // Check which key was pressed
    if (event.code === "ArrowRight") {
      // Move the model to the right
      f50.position.x += speed;
      // Rotate the model to the right
      f50.rotation.y = currentRotation - 0.1;
    } else if (event.code === "ArrowLeft") {
      // Move the model to the left
      f50.position.x -= speed;
      // Rotate the model to the left
      f50.rotation.y = currentRotation + 0.1;
    } else if (event.code === "ArrowUp") {
      // Move the model forward
      f50.position.z += speed;
    } else if (event.code === "ArrowDown") {
      // Move the model backward
      f50.position.z -= speed;
    }
  });
}

// Function to animate the model movement (Beshoy)
function modelAnimation(f50) {}

// Function to detect collision (Stimpy)
function collisionDetection(f50) {}

// Function to set up the hdr environment
function initHDR(scene) {
  const rgbeloader = new RGBELoader();
  rgbeloader.load(
    "./car_models/MR_INT-005_WhiteNeons_NAD.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
    }
  );
}

// Function to animate the model
function animate() {
  requestAnimationFrame(animate);
  // the event listener for keypress events
  moveModelOnKeyPress(f50);

  modelAnimation(f50);

  renderer.render(scene, camera);
}

function init() {
  // Set up the renderer
  const renderer = initRenderer();

  // Set up the scene
  const scene = initScene();

  // Set up the camera
  const camera = initCamera();

  // Set up the orbit controls
  initControls(camera);

  // Set up the lights
  initLights(scene);

  // Set up the plane
  initPlane(scene);

  // Set up the model
  initModel(scene);

  // Set up the HDR environment
  initHDR(scene);

  // Render the scene
  renderer.render(scene, camera);

  // Animate the model
  animate();
}

init();
