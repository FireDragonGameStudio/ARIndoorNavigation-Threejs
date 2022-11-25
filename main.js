import "./style.css";

// https://github.com/immersive-web/marker-tracking/blob/main/explainer.md
// https://arimg.glitch.me/

// https://stackoverflow.com/questions/28869268/three-js-transparent-object-occlusion

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { VRButton } from "three/addons/webxr/VRButton.js";
import { ARButton } from "three/addons/webxr/ARButton.js";

let camera, scene, renderer, controls;
let controller;

init();
setupGeometry();
setupVR();

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

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
    scene.add(ambient);

    const light = new THREE.DirectionalLight();
    light.position.set(0.3, 1, 1);
    scene.add(light);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
}

function setupGeometry() {
    // mesh a
    const backPlaneMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const backPlaneGeometry = new THREE.PlaneGeometry(2, 2, 4, 4);
    const backPlaneMesh = new THREE.Mesh(backPlaneGeometry, backPlaneMaterial);
    backPlaneMesh.renderOrder = 0; // <===================
    backPlaneMesh.position.z = -1;
    scene.add(backPlaneMesh);

    const occluderMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const occluderGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const mesh = new THREE.Mesh(occluderGeometry, occluderMaterial);
    mesh.material.color.set(0x0000ff);
    mesh.material.colorWrite = false; // <=================
    mesh.renderOrder = 2;
    scene.add(mesh);

    const tapGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const tapMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    const tapMesh = new THREE.Mesh(tapGeometry, tapMaterial);
    tapMesh.position.set(0, 0, -0.5); // .applyMatrix4(controller.matrixWorld);
    // tapMesh.setRotationFromMatrix(controller.matrixWorld);
    tapMesh.renderOrder = 3;
    scene.add(tapMesh);

    // // mesh c
    // var geometry = new THREE.BoxGeometry(3, 3, 3);
    // mesh = new THREE.Mesh(geometry, material.clone());
    // mesh.material.color.set(0x0000ff);
    // mesh.material.colorWrite = false; // <=================
    // mesh.renderOrder = 2;
    // mesh.position.z = 10;
    // scene.add(mesh);
}

function setupVR() {
    // document.body.appendChild(VRButton.createButton(renderer));
    document.body.appendChild(ARButton.createButton(renderer));

    renderer.xr.enabled = true;

    controller = renderer.xr.getController(0);
    controller.addEventListener("select", () => {
        const tapGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
        const tapMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
        const tapMesh = new THREE.Mesh(tapGeometry, tapMaterial);
        tapMesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
        tapMesh.setRotationFromMatrix(controller.matrixWorld);
        tapMesh.renderOrder = 3;
        scene.add(tapMesh);

        console.log("TapMesh created", tapMesh);
    });
    scene.add(controller);

    // check for supported features
    // navigator.xr.isSessionSupported()
    console.log(navigator);
}

function render(time) {
    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    //mesh.translateZ(-0.1);
    // mesh.rotateY(0.01);
    // mesh.rotateZ(0.01);

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
