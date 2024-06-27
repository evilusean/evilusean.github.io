import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

//ThreeJS BoilerPlate - Sets up the scene
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group(); //instead of adding to the scene, add to the earthgroup, so you can change all with one 
earthGroup.rotation.z = -23.4 * Math.PI / 180; //Earth Tilt
scene.add(earthGroup); //add the earthgroup to the scene
new OrbitControls(camera, renderer.domElement); // allows you to move around the scene
const detail = 12; //change this to change how round the ico geo is, less detail = less round/fewer faces
const loader = new THREE.TextureLoader(); //In order to use a texture(picture) we need to create a loader
const geometry = new THREE.IcosahedronGeometry(1, detail); //1 unit, with a detail of 12
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"), //will load the earth textures we downloaded
  specularMap: loader.load("./textures/02_earthspec1k.jpg"), //uses the loader we previously created 
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);