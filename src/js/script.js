import * as THREE from "three/build/three.module.js";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import CannonDebugger from "cannon-es-debugger";
import top from "../res/top.jpg";
import bottom from "../res/bottom.jpg";
import left from "../res/left.jpg";
import right from "../res/right.jpg";
import front from "../res/front.jpg";
import back from "../res/back.jpg";
import roadmap from "../res/roadtest.jpg";
import wheelMap from "../res/wheels.png";
import carMap from "../res/car.jpg";

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
  spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 6, 0.5, 1);
  spotLight.position.set(-7, 20, 0);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 500;
  scene.add(spotLight);
  return spotLight;
}

// Function to set up the plane
function initPlane(scene) {
  roadTexture = new THREE.TextureLoader().load(roadmap);
  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 500),
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
}

//set up cannon debugger
function initCannonDebugger() {
  cannonDebugger = new CannonDebugger(scene, physicsWorld, {
    color: 0x0000ff,
  });
}

//Function to set up the physics world
function initPhysicsWorld() {
  physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });
}

//Function to create cannon js static plane
function initCannonPlane() {
  groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    //infinite geometric plane
    shape: new CANNON.Box(new CANNON.Vec3(10, 250, 0.1)),
  });

  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physicsWorld.addBody(groundBody);
}

//Function to create cannon js car body
function initCarBody() {
  carBody = new CANNON.Body({
    mass: 20,
    position: new CANNON.Vec3(0, 6, 0),
    shape: new CANNON.Box(new CANNON.Vec3(4, 0.5, 2)),
  });

  //rotate the carBody 90 degrees to the left
  carBody.quaternion.setFromEuler(0, -Math.PI / 2, 0);

  physicsWorld.addBody(carBody);
}

//Function to create the vehicle
function initVehicle() {
  vehicle = new CANNON.RigidVehicle({
    chassisBody: carBody,
  });

  const mass = 1;
  const axisWidth = 5;
  const wheelShape = new CANNON.Sphere(0.8);
  const wheelMaterial = new CANNON.Material("wheelMaterial");
  const down = new CANNON.Vec3(0, -1, 0);

  // Create the wheel bodies
  wheelBodies = [];
  for (let i = 0; i < 4; i++) {
    const wheelBody = new CANNON.Body({
      mass,
      material: wheelMaterial,
    });
    wheelBody.addShape(wheelShape);
    wheelBody.angularDamping = 0.4;
    wheelBodies.push(wheelBody);
  }

  //add wheels to vehicle

  vehicle.addWheel({
    body: wheelBodies[0],
    position: new CANNON.Vec3(-2, 0, axisWidth / 3),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
  });

  vehicle.addWheel({
    body: wheelBodies[1],
    position: new CANNON.Vec3(-2, 0, -axisWidth / 3),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
  });

  vehicle.addWheel({
    body: wheelBodies[2],
    position: new CANNON.Vec3(2, 0, axisWidth / 3),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
  });

  vehicle.addWheel({
    body: wheelBodies[3],
    position: new CANNON.Vec3(2, 0, -axisWidth / 3),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
  });

  // Add the vehicle to the world
  vehicle.addToWorld(physicsWorld);
}

function moveCarOnKeyPress() {
  document.addEventListener("keydown", (event) => {
    const maxSteerVal = Math.PI / 6;
    const maxForce = 60;

    switch (event.key) {
      case "w":
      case "ArrowUp":
        vehicle.setWheelForce(maxForce, 0);
        vehicle.setWheelForce(maxForce, 1);
        break;

      case "s":
      case "ArrowDown":
        vehicle.setWheelForce(-maxForce, 0);
        vehicle.setWheelForce(-maxForce, 1);
        break;

      case "a":
      case "ArrowLeft":
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
        break;

      case "d":
      case "ArrowRight":
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "w":
      case "ArrowUp":
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);
        break;

      case "s":
      case "ArrowDown":
        vehicle.setWheelForce(0, 0);
        vehicle.setWheelForce(0, 1);
        break;

      case "a":
      case "ArrowLeft":
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
        break;

      case "d":
      case "ArrowRight":
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
        break;
    }
  });
}

function initCarGeometry() {
  wheelmap = new THREE.TextureLoader().load(wheelMap);
  carmap = new THREE.TextureLoader().load(carMap);
  wheelmap.wrapT = THREE.RepeatWrapping;
  carMap.wrapT = THREE.RepeatWrapping;

  boxGeometry = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1, 4),
    new THREE.MeshStandardMaterial({
      map: carmap,
    })
  );

  boxGeometry.castShadow = true;

  sphereGeometry0 = new THREE.Mesh(
    new THREE.SphereGeometry(0.8),
    new THREE.MeshStandardMaterial({
      map: wheelmap,
    })
  );

  sphereGeometry1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.8),
    new THREE.MeshStandardMaterial({
      map: wheelmap,
    })
  );

  sphereGeometry2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.8),
    new THREE.MeshStandardMaterial({
      map: wheelmap,
    })
  );

  sphereGeometry3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.8),
    new THREE.MeshStandardMaterial({
      map: wheelmap,
    })
  );

  sphereGeometry0.castShadow = true;
  sphereGeometry1.castShadow = true;
  sphereGeometry2.castShadow = true;
  sphereGeometry3.castShadow = true;

  scene.add(boxGeometry);
  scene.add(sphereGeometry0);
  scene.add(sphereGeometry1);
  scene.add(sphereGeometry2);
  scene.add(sphereGeometry3);
}

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

  physicsWorld.fixedStep();
  cannonDebugger.update();

  moveCarOnKeyPress();

  plane.position.copy(groundBody.position);
  plane.quaternion.copy(groundBody.quaternion);

  boxGeometry.position.copy(carBody.position);
  boxGeometry.quaternion.copy(carBody.quaternion);

  sphereGeometry0.position.copy(wheelBodies[0].position);
  sphereGeometry0.quaternion.copy(wheelBodies[0].quaternion);

  sphereGeometry1.position.copy(wheelBodies[1].position);
  sphereGeometry1.quaternion.copy(wheelBodies[1].quaternion);

  sphereGeometry2.position.copy(wheelBodies[2].position);
  sphereGeometry2.quaternion.copy(wheelBodies[2].quaternion);

  sphereGeometry3.position.copy(wheelBodies[3].position);
  sphereGeometry3.quaternion.copy(wheelBodies[3].quaternion);

  renderer.render(scene, camera);
}

function init() {
  // Set up the renderer
  const renderer = initRenderer();

  // Set up the scene
  const scene = initScene();

  // Set up the camera
  const camera = initCamera();

  // Set up the physics world
  initPhysicsWorld();

  // Set up cannon debugger
  initCannonDebugger(scene, physicsWorld);

  // Set up the orbit controls
  initControls(camera);

  // Set up the lights
  initLights(scene);

  // Set up the plane
  initCannonPlane();

  // Set up the plane
  initPlane(scene);

  //Set up the vehicle
  initCarBody();
  initVehicle();
  initCarGeometry();

  // Set up the HDR environment
  initHDR(scene);

  // Render the scene
  renderer.render(scene, camera);

  // Animate the model
  animate();
}

init();
