// template project/based on
// https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_cones.html

// sources for webxr image tracking
// https://github.com/immersive-web/marker-tracking/blob/main/explainer.md
// https://arimg.glitch.me/
// https://github.com/ShirinStar/webAR_experiments

// sources for marker/NFT images
// https://github.com/stemkoski/AR.js-examples/tree/master/images

// how to get transparent occluder material
// https://stackoverflow.com/questions/28869268/three-js-transparent-object-occlusion

// deployment can be found under
// https://firedragongamestudio.github.io/ARIndoorNavigation-Threejs/

import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/addons/webxr/ARButton.js";
import CasualFlapMapImageUrl from "./CasualFlatMap.png";

let camera, scene, renderer, controls;
let controller;
let occluderMaterial;
let navigationArea, navigationAreaParent;
let markerWorldPosition, markerWorldQuaternion, markerWorldRotation;

let hiroMarkerMesh, earthNFTMesh;

init();
setupGeometry();

async function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setAnimationLoop(render);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    ambient.position.set(0.5, 1, 0.25);
    scene.add(ambient);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    // Vector3 for marker world position
    markerWorldPosition = new THREE.Vector3();
    // Quaternion & Vector3 for marker world rotation
    markerWorldQuaternion = new THREE.Quaternion();
    markerWorldRotation = new THREE.Euler();

    // setup the image targets
    const imgMarkerHiro = document.getElementById("imgMarkerHiro");
    const imgMarkerHiroBitmap = await createImageBitmap(imgMarkerHiro);
    console.log(imgMarkerHiroBitmap);

    const imgNFTEarth = document.getElementById("imgNFTEarth");
    const imgNFTEarthBitmap = await createImageBitmap(imgNFTEarth);
    console.log(imgNFTEarthBitmap);

    //more on image-tracking feature: https://github.com/immersive-web/marker-tracking/blob/main/explainer.md
    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["image-tracking"], // notice a new required feature
        trackedImages: [
            {
                image: imgMarkerHiroBitmap, // tell webxr this is the image target we want to track
                widthInMeters: 0.2, // in meters what the size of the PRINTED image in the real world
            },
            {
                image: imgNFTEarthBitmap, // tell webxr this is the image target we want to track
                widthInMeters: 0.2, // in meters what the size of the PRINTED image in the real world
            },
        ],
        //this is for the mobile debug
        optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],
        domOverlay: {
            root: document.body,
        },
    });
    // const button = ARButton.createButton();
    document.body.appendChild(button);

    // start AR session
    renderer.xr.addEventListener("sessionstart", function (event) {
        // reset camera to zero
        camera.position.set(0, 0, 0);

        // make navigation geometry invisible
        navigationAreaParent.visible = false;

        // add tap on screen for placing cubes
        controller = renderer.xr.getController(0);
        controller.addEventListener("select", () => {
            const tapGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
            const tapMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
            const tapMesh = new THREE.Mesh(tapGeometry, tapMaterial);
            tapMesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
            tapMesh.setRotationFromMatrix(controller.matrixWorld);
            tapMesh.renderOrder = 3;
            navigationArea.attach(tapMesh);
        });
        scene.add(controller);
    });

    // add object for our hiro marker image
    const hiroMarkerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    hiroMarkerGeometry.translate(0, 0.1, 0);
    const hiroMarkerMaterial = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
    });
    hiroMarkerMesh = new THREE.Mesh(hiroMarkerGeometry, hiroMarkerMaterial);
    hiroMarkerMesh.name = "HiroMarkerCube";
    hiroMarkerMesh.matrixAutoUpdate = false;
    hiroMarkerMesh.visible = false;
    scene.add(hiroMarkerMesh);

    // add object for our earth marker image
    const earthNFTGeometry = new THREE.SphereGeometry(0.2);
    earthNFTGeometry.translate(0, 0.2, 0);
    const earthNFTMaterial = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
    });
    earthNFTMesh = new THREE.Mesh(earthNFTGeometry, earthNFTMaterial);
    earthNFTMesh.name = "EarthNFTSphere";
    earthNFTMesh.matrixAutoUpdate = false;
    earthNFTMesh.visible = false;
    scene.add(earthNFTMesh);
}

function render(timestamp, frame) {
    if (frame) {
        const results = frame.getImageTrackingResults(); //checking if there are any images we track

        //if we have more than one image the results are an array
        for (const result of results) {
            // The result's index is the image's position in the trackedImages array specified at session creation
            const imageIndex = result.index;

            // Get the pose of the image relative to a reference space.
            const referenceSpace = renderer.xr.getReferenceSpace();
            const pose = frame.getPose(result.imageSpace, referenceSpace);

            //checking the state of the tracking
            const state = result.trackingState;
            console.log(state);

            if (state == "tracked") {
                navigationAreaParent.visible = true;

                console.log("ImageIndex: ", imageIndex);

                if (imageIndex == 0) {
                    hiroMarkerMesh.visible = true;
                    // update the target mesh when the hiro image target is found
                    hiroMarkerMesh.matrix.fromArray(pose.transform.matrix);
                    console.log("Hiro Image target has been found", hiroMarkerMesh.position);

                    hiroMarkerMesh.getWorldPosition(markerWorldPosition);
                    hiroMarkerMesh.getWorldQuaternion(markerWorldQuaternion);
                    markerWorldRotation.setFromQuaternion(markerWorldQuaternion);

                    // offset to start in the middle of the living room
                    navigationArea.position.set(-2.8, 0, 2);
                }
                if (imageIndex == 1) {
                    earthNFTMesh.visible = true;
                    // update the target mesh when the earth image target is found
                    earthNFTMesh.matrix.fromArray(pose.transform.matrix);
                    console.log("EarthNFT Image target has been found", earthNFTMesh.position);

                    earthNFTMesh.getWorldPosition(markerWorldPosition);
                    earthNFTMesh.getWorldQuaternion(markerWorldQuaternion);
                    markerWorldRotation.setFromQuaternion(markerWorldQuaternion);

                    // setting the offset for the specific marker
                    navigationArea.position.set(0.7, 0, 2.5);
                }
                console.log("Image target world position", markerWorldPosition);
                console.log("Image target world rotation", markerWorldRotation);

                // set starting point to start-room center
                navigationAreaParent.position.copy(markerWorldPosition);
                navigationAreaParent.rotation.copy(markerWorldRotation);
            } else if (state == "emulated") {
                // console.log("Image target no longer seen");
            }
        }
    }

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
    occluderMaterial.colorWrite = false;

    // create room map
    navigationArea = new THREE.Group();
    navigationArea.add(createWallElement(new THREE.Vector3(-4.85, 1, -0.74), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 1.578)));
    navigationArea.add(createWallElement(new THREE.Vector3(-2.98, 1, -2.65), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 3.51)));
    navigationArea.add(createWallElement(new THREE.Vector3(1, 1, -2.55), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 3.467)));
    navigationArea.add(createWallElement(new THREE.Vector3(1, 1, 2.18), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0625, 3, 4.475)));
    navigationArea.add(createWallElement(new THREE.Vector3(-0.689, 1, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(8.518, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(0.97, 1, -4.05), new THREE.Vector3(0, 0, 0), new THREE.Vector3(7.91, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(-3.34, 1, -1.29), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.86, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(4.86, 1, -0.01), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.06, 3, 9.114)));
    navigationArea.add(createWallElement(new THREE.Vector3(-1.6, 1, -0.88), new THREE.Vector3(0, 0, 0), new THREE.Vector3(2.85, 3, 0.06)));
    navigationArea.add(createWallElement(new THREE.Vector3(2.9, 1, 4.06), new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 3, 0.06)));

    // create floor
    const floorGeometry = new THREE.PlaneGeometry(10.2, 8.5);
    const floorTexture = new THREE.TextureLoader().load(CasualFlapMapImageUrl);
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
    const floorPlaneMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorPlaneMesh.rotateX(THREE.MathUtils.degToRad(270));
    floorPlaneMesh.renderOrder = 3;
    navigationArea.add(floorPlaneMesh);

    // navigation area parent for easier placement
    navigationAreaParent = new THREE.Group();
    navigationAreaParent.add(navigationArea);

    scene.add(navigationAreaParent);
}

function createWallElement(position, rotation, scale) {
    const occluderGeometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
    const occluderMesh = new THREE.Mesh(occluderGeometry, occluderMaterial);
    occluderMesh.position.set(position.x, position.y, position.z);
    occluderMesh.renderOrder = 2;

    return occluderMesh;
}
