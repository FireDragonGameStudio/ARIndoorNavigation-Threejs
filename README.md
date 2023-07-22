# AR Indoor Navigation with three.js

This is the corresponding github repository for the short tutorial series about "How to create an indoor navigation app with ARFoundation WITHOUT the usage of Cloud Anchors or using ARPointCloud Data.". Make sure to have the marker images available to test the tracking. The links for the used images can be found in the index.html. To test with the example from the videos, you can visit https://firedragongamestudio.github.io/ARIndoorNavigation-Threejs

The sample is based on the default three.js WebXR samples (https://threejs.org/examples/#webxr_ar_cones), with a few adjustments. The adjusted script parts can be found within main.js. The bundler used is Vite (https://vitejs.dev/).

PLS NOTE THAT THIS PROJECT ONLY WORKS TO 100% ON CHROME FOR ANDROID!!!

Tutorial Videos:

-   Part 1 - https://www.youtube.com/watch?v=Ww349vBXf-4
-   Part 2 - https://www.youtube.com/watch?v=riiJdNq2LWI
-   Part 3 - https://www.youtube.com/watch?v=jQ0bXDZJ0pE

## WebXR Image Tracking

This project uses the currently as DRAFT availible WebXR Image Tracking (https://github.com/immersive-web/marker-tracking/blob/main/explainer.md). There may be changes, so pls consider you're using smth that's not finished atm. It is planned to integrated AR.js (https://ar-js-org.github.io/AR.js-Docs/) to replace WebXR Image Tracking soon.

## Three.js pathfinding

The popular three-pathfinding package from Don McCurdy is used for the calculation from the camera position to the selected targets on the navmesh. https://github.com/donmccurdy/three-pathfinding

## NavMesh generation

After creating a simple plane mesh in Blender, the NavMesh was generated and downloaded here - https://navmesh.isaacmason.com/

## How to install?

After cloning or either downloading this repo, open the parent folder in Visual Studio Code. Open a Terminal console and execute `npm install` to install dev + regular dependencies. Note that this can take some time, so don't be impatient. After the install is complete launch the local webserver with `npx vite`. Vite is configured to spin up a local https webserver AND supports hotswapping, so your changes will be reflected in realtime, without having to stop the running server. This will be very convenient for testing, as this server is reachable from within your local netweork too, so when testing on a mobile device, there is NO NEED TO DEPLOY/RELAUNCH every time.
