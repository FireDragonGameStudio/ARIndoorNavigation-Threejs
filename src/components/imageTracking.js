import { ImageTrackingWebXR } from "../systems/ImageTrackingWebXR";
import { ImageTrackingARJS } from "../systems/ImageTrackingARJS";

function createImageTrackingWebXR(renderer, navigationAreaParent) {
    const imageTrackingWebXR = new ImageTrackingWebXR();
    imageTrackingWebXR.tick = (timestamp, frame) => imageTrackingWebXR.updateImageTrackingWebXR(timestamp, frame, renderer, navigationAreaParent, navigationAreaParent.children[0]);
    return imageTrackingWebXR;
}

function createImageTrackingARJS(renderer) {
    const imageTrackingARJS = new ImageTrackingARJS();
    imageTrackingARJS.tick = (timestamp, frame) => imageTrackingARJS.updateImageTrackingARJS();
    return imageTrackingARJS;
}

export { createImageTrackingWebXR, createImageTrackingARJS };
