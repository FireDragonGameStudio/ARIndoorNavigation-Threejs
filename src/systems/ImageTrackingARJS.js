import { Group, BoxGeometry, MeshNormalMaterial, DoubleSide, Mesh, Vector3, Quaternion, Euler, SphereGeometry } from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { ArToolkitSource, ArToolkitContext, ArMarkerControls } from "@ar-js-org/ar.js/three.js/build/ar-threex.js";

let arToolkitSource, arToolkitContext, arHiroMarkerControls, arKanjiMarkerControls;

class ImageTrackingARJS {
    constructor() {}

    init(camera, scene, renderer, navigationAreaParent, navigationArea) {
        // show spinner
        document.querySelector(".arjs-loader-spinner").style.display = "";

        // SOURCE
        arToolkitSource = new ArToolkitSource({
            // to read from the webcam
            sourceType: "webcam",

            // sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
            // sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,

            // to read from an image
            // sourceType : 'image',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

            // to read from a video
            // sourceType : 'video',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
        });

        arToolkitSource.init(() => {
            arToolkitSource.domElement.addEventListener("canplay", () => {
                this.onResize(renderer);
            });
        });

        // CONTEXT
        arToolkitContext = new ArToolkitContext({
            cameraParametersUrl: ArToolkitContext.baseURL + "../data/data/camera_para.dat",
            detectionMode: "mono",
        });

        arToolkitContext.init(() => {
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());

            arToolkitContext.arController.orientation = this.getSourceOrientation();
            arToolkitContext.arController.options.orientation = this.getSourceOrientation();

            // disable spinner after start
            document.querySelector(".arjs-loader-spinner").style.display = "none";
        });

        // HIRO MARKER
        this.setupHiroMarker(scene, navigationAreaParent, navigationArea);
        // KANJI MARKER
        this.setupKanjiMarker(scene, navigationAreaParent, navigationArea);

        window.addEventListener("arjs-nft-loaded", (ev) => {
            console.log(ev);
        });

        window.addEventListener("resize", () => {
            this.onResize(renderer);
        });
    }

    setupHiroMarker(scene, navigationAreaParent, navigationArea) {
        const markerGroup = new Group();
        const geometry = new BoxGeometry(0.2, 0.2, 0.2);
        geometry.translate(0, 0.1, 0);
        const material = new MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: DoubleSide,
        });
        const mesh = new Mesh(geometry, material);
        markerGroup.add(mesh);
        markerGroup.name = "hiroMarker";
        scene.add(markerGroup);

        console.log("ArToolkitContext", arToolkitContext);

        arHiroMarkerControls = new ArMarkerControls(arToolkitContext, markerGroup, {
            // type of marker - ['pattern', 'barcode', 'unknown' ]
            type: "pattern",
            // url of the pattern - IIF type='pattern'
            patternUrl: ArToolkitContext.baseURL + "../data/data/patt.hiro",
            // turn on/off camera smoothing
            smooth: true,
            // number of matrices to smooth tracking over, more = smoother but slower follow
            smoothCount: 5,
            // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
            smoothTolerance: 0.01,
            // threshold for smoothing, will keep still unless enough matrices are over tolerance
            smoothThreshold: 2,
        });

        arHiroMarkerControls.addEventListener("markerFound", () => {
            console.log("HIRO MARKER FOUND!");
            navigationAreaParent.visible = true;

            // Vector3 for marker world position
            const markerWorldPosition = new Vector3();
            // Quaternion & Vector3 for marker world rotation
            const markerWorldQuaternion = new Quaternion();
            const markerWorldRotation = new Euler();

            markerGroup.getWorldPosition(markerWorldPosition);
            markerGroup.getWorldQuaternion(markerWorldQuaternion);
            markerWorldRotation.setFromQuaternion(markerWorldQuaternion);

            // offset to start in the middle of the living room
            navigationArea.position.set(-2.8, 0, 2);

            // set starting point to start-room center
            navigationAreaParent.position.copy(markerWorldPosition);
            navigationAreaParent.rotation.copy(markerWorldRotation);
        });
    }

    setupKanjiMarker(scene, navigationAreaParent, navigationArea) {
        const markerGroup = new Group();
        const geometry = new SphereGeometry(0.2);
        geometry.translate(0, 0.2, 0);
        const material = new MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: DoubleSide,
        });
        const mesh = new Mesh(geometry, material);
        markerGroup.add(mesh);
        markerGroup.name = "kanjiMarker";
        scene.add(markerGroup);

        arKanjiMarkerControls = new ArMarkerControls(arToolkitContext, markerGroup, {
            // type of marker - ['pattern', 'barcode', 'unknown' ]
            type: "pattern",
            // url of the pattern - IIF type='pattern'
            patternUrl: ArToolkitContext.baseURL + "../data/data/patt.kanji",
            // turn on/off camera smoothing
            smooth: true,
            // number of matrices to smooth tracking over, more = smoother but slower follow
            smoothCount: 5,
            // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
            smoothTolerance: 0.01,
            // threshold for smoothing, will keep still unless enough matrices are over tolerance
            smoothThreshold: 2,
        });

        arKanjiMarkerControls.addEventListener("markerFound", () => {
            navigationAreaParent.visible = true;

            // Vector3 for marker world position
            const markerWorldPosition = new Vector3();
            // Quaternion & Vector3 for marker world rotation
            const markerWorldQuaternion = new Quaternion();
            const markerWorldRotation = new Euler();

            markerGroup.getWorldPosition(markerWorldPosition);
            markerGroup.getWorldQuaternion(markerWorldQuaternion);
            markerWorldRotation.setFromQuaternion(markerWorldQuaternion);

            // offset to start in the middle of the kitchen
            navigationArea.position.set(0.7, 0, 2.5);

            // set starting point to start-room center
            navigationAreaParent.position.copy(markerWorldPosition);
            navigationAreaParent.rotation.copy(markerWorldRotation);
        });
    }

    updateImageTrackingARJS() {
        if (arToolkitSource && arToolkitSource.ready) {
            arToolkitContext.update(arToolkitSource.domElement);
        }
    }

    getSourceOrientation() {
        if (!arToolkitSource) {
            return null;
        }

        if (arToolkitSource.domElement.videoWidth > arToolkitSource.domElement.videoHeight) {
            return "landscape";
        } else {
            return "portrait";
        }
    }

    onResize(renderer) {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
        }
    }
}

export { ImageTrackingARJS };
