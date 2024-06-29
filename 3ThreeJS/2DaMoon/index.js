import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

/*
TO DO:
Fix variable names (I don't want to be on this planet anymore - 2 DA MOON!)
Add Red Aura - Test, added to 'getFresnelMat.js'
Add Red lighting - change 'scene.add(sunLight);' 
Add Red Hue to material
Red WireFrame
Add Stars - change 'getStarfield.js'
Change to Moon Texture/Topography
Add Zoom in + Rotate AnimASeans - we don't rotate on the moon 
Add the wiremesh
Shrink the wiremesh - hollow moon
Remove the spin - moon doesn't spin 'dark side' and is the perfect size/distance to cover the sun perfectly during eclipse, totally not sus at all
  Even though technically, the moon doesn't rotate, I'm not really going for realism here, and it looks way better when it moves ~!
Remove 'earthGroup.add(lightsMesh);' this mesh - no lights on the moon 
Remove 'earthGroup.add(cloudsMesh);' no atmo on moon, no atmoon 
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

const earthGroup = new THREE.Group(); //instead of adding to the scene, add to the earthgroup, so you can change all with one 
earthGroup.rotation.z = -23.4 * Math.PI / 180; //Earth Tilt
scene.add(earthGroup); //add the earthgroup to the scene
new OrbitControls(camera, renderer.domElement); // allows you to move around the scene
const detail = 12; //change this to change how round the ico geo is, less detail = less round/fewer faces
const loader = new THREE.TextureLoader(); //In order to use a texture(picture) we need to create a loader
const geometry = new THREE.IcosahedronGeometry(1, detail); //1 unit, with a detail of 12
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/moonmap4k.jpg"), //will load the earth textures we downloaded
  //specularMap: loader.load("./textures/02_earthspec1k.jpg"), //uses the loader we previously created 
  bumpMap: loader.load("./textures/moonbump4k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// const lightsMat = new THREE.MeshBasicMaterial({
//     map: loader.load("./textures/03_earthlights1k.jpg"),
//     blending: THREE.AdditiveBlending,
//   });
//   const lightsMesh = new THREE.Mesh(geometry, lightsMat);
//   earthGroup.add(lightsMesh);
  
  // const cloudsMat = new THREE.MeshStandardMaterial({
  //   map: loader.load("./textures/04_earthcloudmap.jpg"),
  //   transparent: true,
  //   opacity: 0.8,
  //   blending: THREE.AdditiveBlending,
  //   alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  //   // alphaTest: 0.3,
  // });
  // const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
  // cloudsMesh.scale.setScalar(1.003);
  // earthGroup.add(cloudsMesh);
  
  const fresnelMat = getFresnelMat(); //This is the Aura - change color
  const glowMesh = new THREE.Mesh(geometry, fresnelMat);
  glowMesh.scale.setScalar(1.01);
  earthGroup.add(glowMesh);
  
  const stars = getStarfield({numStars: 2000});
  scene.add(stars);
  
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0); //SunLight -change color
  sunLight.position.set(-2, 0.5, 1.5);
  scene.add(sunLight);
  
  function animate() {
    requestAnimationFrame(animate);
    //mesh.scale.setScalar(Math.cos(t * 0.001) + 1.0) //Will cause the orb to shrink and expand over and over again 2DaMoon
    earthMesh.rotation.y += 0.002; //Starts the earth rotation
    //lightsMesh.rotation.y += 0.002;
    // cloudsMesh.rotation.y += 0.0023;
    glowMesh.rotation.y += 0.002;//RIP Terry. They glow in the dark. You can see em if your driving. 
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
  