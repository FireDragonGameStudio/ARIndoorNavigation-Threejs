class Loop {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.updatables = [];
    }

    start() {
        this.renderer.setAnimationLoop((timestamp, frame) => {
            // tell every animated object to tick forward one frame
            this.tick(timestamp, frame);

            // render a frame
            this.renderer.render(this.scene, this.camera);
        });
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }

    tick(timestamp, frame) {
        for (const object of this.updatables) {
            //object.tick(delta);
            object.tick(timestamp, frame);
        }
    }
}

export { Loop };
