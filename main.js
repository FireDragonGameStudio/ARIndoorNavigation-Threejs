import { IndoorNav } from "./src/IndoorNav.js";

async function main() {
    // Get a reference to the container element
    const container = document.querySelector("#scene-container");

    // create a new indoor navigation
    const indoorNav = new IndoorNav(container);

    // complete async tasks
    await indoorNav.initIndoorNav();

    // start the animation loop
    indoorNav.start();
}

main().catch((err) => {
    console.error(err);
});
