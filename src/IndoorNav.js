import { createCamera } from "./components/camera.js";
import { createControls } from "./components/controls.js";
import { createImageTrackingWebXR } from "./components/imageTracking.js";
import { createLights } from "./components/lights.js";
import { createRenderer, setupARSession } from "./components/renderer.js";
import { createScene } from "./components/scene.js";

import { setupNavigationAreaGeometry } from "./components/navigation/navigationArea.js";

import { Resizer } from "./systems/Resizer.js";
import { Loop } from "./systems/Loop.js";

let camera;
let renderer;
let scene;
let loop;

class IndoorNav {
    constructor(container) {
        camera = createCamera();
        renderer = createRenderer();
        scene = createScene();
        loop = new Loop(camera, scene, renderer);

        container.append(renderer.domElement);

        const controls = createControls(camera, renderer.domElement);
        const { ambientLight, mainLight } = createLights();

        loop.updatables.push(controls);

        scene.add(ambientLight, mainLight);

        const resizer = new Resizer(container, camera, renderer);
    }

    async initIndoorNav() {
        // setup geometry
        const navigationAreaParent = setupNavigationAreaGeometry();
        scene.add(navigationAreaParent);

        // setup image tracking
        const imageTrackingWebXR = createImageTrackingWebXR(renderer, navigationAreaParent);
        await imageTrackingWebXR.setup(scene);
        setupARSession(renderer, camera, scene, navigationAreaParent);
        loop.updatables.push(imageTrackingWebXR);
    }

    render() {
        // draw a single frame
        renderer.render(scene, camera);
    }

    start() {
        loop.start();
    }

    stop() {
        loop.stop();
    }
}

export { IndoorNav };
