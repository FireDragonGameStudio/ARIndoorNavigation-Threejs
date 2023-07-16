import { Vector3, Quaternion, Euler, BoxGeometry, MeshNormalMaterial, DoubleSide, SphereGeometry, Mesh } from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

// Vector3 for marker world position
let markerWorldPosition = new Vector3();
// Quaternion & Vector3 for marker world rotation
let markerWorldQuaternion = new Quaternion();
let markerWorldRotation = new Euler();

let hiroMarkerMesh, earthNFTMesh;

class ImageTrackingWebXR {
    constructor() {}

    async setup(scene, renderer) {
        // setup the image targets
        const imgMarkerHiro = document.getElementById("imgMarkerHiro");
        const imgMarkerHiroBitmap = await createImageBitmap(imgMarkerHiro);
        console.log(imgMarkerHiroBitmap);

        const imgNFTEarth = document.getElementById("imgNFTEarth");
        const imgNFTEarthBitmap = await createImageBitmap(imgNFTEarth);
        console.log(imgNFTEarthBitmap);

        // add object for our hiro marker image
        const hiroMarkerGeometry = new BoxGeometry(0.2, 0.2, 0.2);
        hiroMarkerGeometry.translate(0, 0.1, 0);
        const hiroMarkerMaterial = new MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: DoubleSide,
        });
        hiroMarkerMesh = new Mesh(hiroMarkerGeometry, hiroMarkerMaterial);
        hiroMarkerMesh.name = "HiroMarkerCube";
        hiroMarkerMesh.matrixAutoUpdate = false;
        hiroMarkerMesh.visible = false;
        scene.add(hiroMarkerMesh);

        // add object for our earth marker image
        const earthNFTGeometry = new SphereGeometry(0.2);
        earthNFTGeometry.translate(0, 0.2, 0);
        const earthNFTMaterial = new MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: DoubleSide,
        });
        earthNFTMesh = new Mesh(earthNFTGeometry, earthNFTMaterial);
        earthNFTMesh.name = "EarthNFTSphere";
        earthNFTMesh.matrixAutoUpdate = false;
        earthNFTMesh.visible = false;
        scene.add(earthNFTMesh);

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
        document.body.appendChild(button);
    }

    updateImageTrackingWebXR(timestamp, frame, renderer, navigationAreaParent, navigationArea) {
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
                    console.log("Image target world position", imageIndex, markerWorldPosition);
                    console.log("Image target world rotation", imageIndex, markerWorldRotation);

                    // set starting point to start-room center
                    navigationAreaParent.position.copy(markerWorldPosition);
                    navigationAreaParent.rotation.copy(markerWorldRotation);
                } else if (state == "emulated") {
                    // console.log("Image target no longer seen");
                }
            }
        }
    }

    getMarkerWorldPosition() {
        return markerWorldPosition;
    }

    getMarkerWorldRotation() {
        return markerWorldRotation;
    }
}

export { ImageTrackingWebXR };
