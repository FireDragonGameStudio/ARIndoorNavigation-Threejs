import { PerspectiveCamera } from "three";

function createCamera() {
    const camera = new PerspectiveCamera(
        70, // fov = Field Of View
        window.innerWidth / window.innerHeight, // aspect ratio (dummy value)
        0.01, // near clipping plane
        20 // far clipping plane
    );

    // move the camera back so we can view the scene
    camera.position.set(0, 0, 5);

    return camera;
}

export { createCamera };
