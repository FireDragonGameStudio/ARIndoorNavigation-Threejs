import { WebGLRenderer, BoxGeometry, MeshPhongMaterial, Mesh } from "three";

function createRenderer() {
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.useLegacyLights = false;
    renderer.xr.enabled = true;

    return renderer;
}

function setupARSession(renderer, camera, scene, navigationAreaParent) {
    // start AR session
    renderer.xr.addEventListener("sessionstart", (event) => {
        // reset camera to zero
        camera.position.set(0, 0, 0);

        // make navigation geometry invisible
        navigationAreaParent.visible = false;

        // add tap on screen for placing cubes
        // ONLY FOR DEBUGGING
        // const controller = renderer.xr.getController(0);
        // controller.addEventListener("select", () => {
        //     const tapGeometry = new BoxGeometry(0.06, 0.06, 0.06);
        //     const tapMaterial = new MeshPhongMaterial({ color: 0xffffff * Math.random() });
        //     const tapMesh = new Mesh(tapGeometry, tapMaterial);
        //     tapMesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
        //     tapMesh.setRotationFromMatrix(controller.matrixWorld);
        //     tapMesh.renderOrder = 3;
        //     navigationAreaParent.children[0].attach(tapMesh);
        // });
        // scene.add(controller);
    });
}

function setupARJS(imageTrackingARJS, camera, scene, renderer, navigationAreaParent) {
    // start AR session
    renderer.xr.addEventListener("sessionstart", (event) => {
        // init AR.js
        imageTrackingARJS.init(camera, scene, renderer, navigationAreaParent, navigationAreaParent.children[0]);
    });
    // disable spinner
    document.querySelector(".arjs-loader-spinner").style.display = "none";
}

export { createRenderer, setupARSession, setupARJS };
