import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

/*
TO DO:
Maybe remove function handleWindowResize () - should be a set size canvas?
Add to CV2 Canvas - should be able to reference with a ../../3ThreeJS/2DaMoon/
    If can't reference, just create a new script and reference the assets here (we used a different method for renderer)
    document.body.appendChild(renderer.domElement); #this might not work on a canvas - will need to check
Add as CV2 default canvas animasean, make sure 'matrix rain' still works, clear canvas still works
Create a CV2 button to reload if canvas cleared
Fix Lighting for moon phases(dark side) - lights will have to move, while the moon is stationary - maybe buttons? idk - this seems tedious
Add Earth - already have all assets/code downloaded - just get it to work on a canvas and add a button
The Eye of the Moon Plan (月の眼計画, Tsuki no Me Keikaku) - Infinite Tsukuyomi - Click -> Look at earth - see all the brainwashed sleeping earthlings 
Add Elon Musk cherry red tesla roadster with soy face doods
*/

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

const moonGroup = new THREE.Group(); //instead of adding to the scene, add to the earthgroup, so you can change all with one 
moonGroup.rotation.z = -23.4 * Math.PI / 180; //Earth Tilt
scene.add(moonGroup); //add the earthgroup to the scene
new OrbitControls(camera, renderer.domElement); // allows you to move around the scene
const detail = 12; //change this to change how round the ico geo is, less detail = less round/fewer faces
const loader = new THREE.TextureLoader(); //In order to use a texture(picture) we need to create a loader
const geometry = new THREE.IcosahedronGeometry(1, detail); //1 unit, with a detail of 12
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/moonmap4k.jpg"), //will load the earth textures we downloaded
  bumpMap: loader.load("./textures/moonbump4k.jpg"),
  bumpScale: 0.04,
  // color: new THREE.Color(0xff0000), // Add a reddish hue
  // color: new THREE.Color(0xffffff), // white hue, added red sunlight instead this is unnecasary, keeping though
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const moonMesh = new THREE.Mesh(geometry, material);
moonGroup.add(moonMesh);

// ADDED WIREFRAME MATERIAL - STILL VISIBLE FROM OUTSIDE - MAKES MOON LOOK UGLY - STAYING WITH ORIGINAL FOR NOW
// Create a wireframe material
// const wireframeMaterial = new THREE.MeshBasicMaterial({
//   color: 0xff0000, // Set the wireframe color to red
//   wireframe: true, // Enable wireframe mode
//   side: THREE.BackSide // Render only the back side of the wireframe
// });

// // Create a wireframe mesh using the same geometry
// const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

// // Scale the wireframe mesh slightly smaller than the moon mesh
// wireframeMesh.scale.setScalar(0.);

// // Add the wireframe mesh to the moonGroup
// moonGroup.add(wireframeMesh);

  
  const fresnelMat = getFresnelMat(); //This is the Aura - change color
  const glowMesh = new THREE.Mesh(geometry, fresnelMat);
  glowMesh.scale.setScalar(1.01);
  moonGroup.add(glowMesh);
  
  const stars = getStarfield({numStars: 2000});
  scene.add(stars);

  const sunLight = new THREE.DirectionalLight(0xff0000, 2.0) //sunlight red
  //const sunLight = new THREE.DirectionalLight(0xffffff, 2.0); //SunLight white - comment out above for this
  sunLight.position.set(-2, 0.5, 1.5);
  scene.add(sunLight);
  
  let t = 0

  function animate(t = 0) {
    requestAnimationFrame(animate);
    t += 0.01;
    moonMesh.scale.setScalar(Math.cos(t * 0.001) + 2.0) //Will cause the orb to shrink and expand over and over again 2DaMoon
    moonMesh.rotation.y += 0.002; //Starts the earth rotation
    glowMesh.scale.setScalar(Math.cos(t * 0.001) + 2.0)
    glowMesh.rotation.y += 0.002;//RIP Terry. They glow in the dark. You can see em if your driving. 
    // wireframeMesh.scale.setScalar(Math.cos(t * 0.001) + 2.0)
    // wireframeMesh.rotation.y += 0.002;
    stars.rotation.y -= 0.0002;
    renderer.render(scene, camera);
  }
  
  animate();

  function handleWindowResize () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', handleWindowResize, false);
  

  
