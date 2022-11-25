import "./style.css";

// https://github.com/immersive-web/marker-tracking/blob/main/explainer.md
// https://arimg.glitch.me/

// how to get transparent occluder material
// https://stackoverflow.com/questions/28869268/three-js-transparent-object-occlusion

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
import { ARButton } from "three/addons/webxr/ARButton.js";
import CasualFlapMapImageUrl from "./CasualFlatMap.png";

let camera, scene, renderer, controls;
let controller;
let occluderMaterial;
let navigationArea;

init();
setupVR();
setupGeometry();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setAnimationLoop(render);
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    ambient.position.set(0.5, 1, 0.25);
    scene.add(ambient);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
}

function setupVR() {
    document.body.appendChild(ARButton.createButton(renderer));

    renderer.xr.enabled = true;

    controller = renderer.xr.getController(0);
    controller.addEventListener("select", () => {
        // set breadcrumb cubes (based on https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_cones.html)
        const tapGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
        const tapMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
        const tapMesh = new THREE.Mesh(tapGeometry, tapMaterial);
        tapMesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
        tapMesh.setRotationFromMatrix(controller.matrixWorld);
        tapMesh.renderOrder = 3;
        scene.add(tapMesh);
    });
    scene.add(controller);

    // check for supported features
    // navigator.xr.isSessionSupported()
}

function render(time) {
    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function setupGeometry() {
    // create occluder material
    occluderMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

    // create room map
    navigationArea = new THREE.Group();
    navigationArea.add(createWallElement(new THREE.Vector3(-4.85, -1, -0.74), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 1.578)));
    navigationArea.add(createWallElement(new THREE.Vector3(-2.98, -1, -2.65), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 3.51)));
    navigationArea.add(createWallElement(new THREE.Vector3(1, -1, -2.55), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 3.467)));
    navigationArea.add(createWallElement(new THREE.Vector3(1, -1, 2.18), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 4.475)));
    navigationArea.add(createWallElement(new THREE.Vector3(-0.689, -1, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(8.518, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(0.97, -1, -4.05), new THREE.Vector3(0, 0, 0), new THREE.Vector3(7.91, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(-3.34, -1, -1.29), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.86, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(4.86, -1, -0.01), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.06, 3, 9.114)));
    navigationArea.add(createWallElement(new THREE.Vector3(-1.6, -1, -0.88), new THREE.Vector3(0, 0, 0), new THREE.Vector3(2.85, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(2.9, -1, 4.06), new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 3, 0.06)));

    // set starting point to start-room center
    navigationArea.position.set(-2.8, -0.1, 2);

    // create floor
    const floorGeometry = new THREE.PlaneGeometry(10.2, 8.5);
    const floorTexture = new THREE.TextureLoader().load(CasualFlapMapImageUrl);
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
    const floorPlaneMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorPlaneMesh.rotateX(THREE.MathUtils.degToRad(270));
    floorPlaneMesh.position.set(0, -2, 0);
    floorPlaneMesh.renderOrder = 3;
    navigationArea.add(floorPlaneMesh);

    scene.add(navigationArea);
}

function createWallElement(position, rotation, scale) {
    const occluderGeometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
    const occluderMesh = new THREE.Mesh(occluderGeometry, occluderMaterial);
    occluderMesh.position.set(position.x, position.y, position.z);
    occluderMesh.material.colorWrite = false;
    occluderMesh.renderOrder = 2;

    return occluderMesh;
}
