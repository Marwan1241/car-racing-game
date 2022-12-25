import * as THREE from "three";
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

//create instance of the renderer
const renderer = new THREE.WebGLRenderer();

//set renderer size to the size of the window
renderer.setSize(window.innerWidth, window.innerHeight);

//add the renderer to the DOM
document.body.appendChild(renderer.domElement);

//set shadow map to true
renderer.shadowMap.enabled = true;

//create a new scene
const scene = new THREE.Scene();

//load an image with texture loader
const textureLoader = new THREE.CubeTextureLoader();
const cubeTexture = textureLoader.load([front, back, top, bottom, right, left]);

//set scene background to the nebula image
scene.background = cubeTexture;

//create a new camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//create instance of the orbit
const controls = new OrbitControls(camera, renderer.domElement);

//axis helper serves as a guide to the scene
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

camera.position.set(0, 3, -8);
controls.update();

//add a  spotlight to the scene that casts shadow
const spotLight = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 6, 0.5, 1);
spotLight.position.set(-7, 20, 270);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 500;
scene.add(spotLight);

//add plane with roadmap material and add it to the scene
roadTexture = new THREE.TextureLoader().load(roadmap);

const plane = new THREE.Mesh(
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

// plane.material.map  = roadTexture;
plane.receiveShadow = true;

scene.add(plane);

//add a grid helper
// const gridHelper = new THREE.GridHelper(20 , 20);
// scene.add( gridHelper );

//create instance of gltf loader
const loader = new GLTFLoader();

//create instace of rgbeloader
const rgbeloader = new RGBELoader();

//set the output of the output encoding
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.4;

let f50;

//load the hdr file
rgbeloader.load(
  "./car_models/MR_INT-005_WhiteNeons_NAD.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    //load a gltf resource
    loader.load("./car_models/ff50.gltf", function (gltf) {
      const model = gltf.scene;
      scene.add(model);
      f50 = model;
      f50.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    });
  }
);

//create eventlistner that moves the car and camera when keyboard is clicked
document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowUp") {
    f50.position.z += 1;
    camera.position.z += 1;
  }
  if (e.key === "ArrowDown") {
    f50.position.z -= 1;
    camera.position.z -= 1;
  }
  if (e.key === "ArrowLeft") {
    f50.position.x += 1;
  }
  if (e.key === "ArrowRight") {
    f50.position.x -= 1;
  }
});

//create function animate that rotate the cube
function animate(time) {
  //link scene and camera
  renderer.render(scene, camera);
}

//call the animate function
renderer.setAnimationLoop(animate);
