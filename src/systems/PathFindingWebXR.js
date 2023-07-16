import { Vector3, MeshBasicMaterial, Mesh, Group, BoxGeometry, BufferGeometry, LineBasicMaterial, Line } from "three";

import { Pathfinding } from "three-pathfinding";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import NavMeshUrl from "/navmesh.gltf";

const zeroVector = new Vector3(0, 0, 0);

let pathfinding = new Pathfinding();
let zoneName = "level1";
let groupID;
let zoneData;
let startPosition = new Vector3();
let targetPosition = new Vector3();

let line;

let camera;
let navigationArea;

let isStartCubeCreated = false;
let isEndCubeCreated = false;

const navCubes = [];

class PathFindingWebXR {
    constructor(cameraParam, navigationAreaParam) {
        camera = cameraParam;
        navigationArea = navigationAreaParam;

        // setup navmesh and navigation targets
        const loader = new GLTFLoader();
        loader.load(
            NavMeshUrl,
            (gltf) => {
                // NavMesh generator https://navmesh.isaacmason.com/
                // PathFinding https://github.com/donmccurdy/three-pathfinding

                let navMesh = gltf.scene;
                navigationArea.add(navMesh);

                let navMeshGeometry = new BufferGeometry();
                navMesh.children.forEach((child) => {
                    if (child.type === "Mesh") {
                        console.log("Mesh", child);
                        navMeshGeometry = child;
                    }
                });
                navMeshGeometry.visible = false;

                // const startPoint = new Vector3(3, 0.5, -2);
                // const endPoint = new Vector3(0, 0.5, -2);

                // const geometry = new BoxGeometry(1, 1, 1);
                // const material = new MeshBasicMaterial({ color: 0x00ff00 });
                // const cube = new Mesh(geometry, material);
                // cube.position.set(startPoint.x, startPoint.y, startPoint.z);
                // cube.renderOrder = 3;

                // const secgeometry = new BoxGeometry(1, 1, 1);
                // const secmaterial = new MeshBasicMaterial({ color: 0x0000ff });
                // const seccube = new Mesh(secgeometry, secmaterial);
                // seccube.position.set(endPoint.x, endPoint.y, endPoint.z);
                // seccube.renderOrder = 3;

                // navigationMeshParent.add(cube);
                // navigationMeshParent.add(seccube);

                // const pathfinding = new Pathfinding();
                // const ZONE = "level1";
                zoneData = Pathfinding.createZone(navMeshGeometry.geometry);
                pathfinding.setZoneData(zoneName, zoneData);
                console.log("Zone", zoneData);

                // groupID = pathfinding.getGroup(zoneName, startPoint);

                // const startnode = pathfinding.getClosestNode(startPoint, zoneName, groupID);
                // const endnode = pathfinding.getClosestNode(endPoint, zoneName, groupID);

                const lineMaterial = new LineBasicMaterial({ color: 0x0000ff });
                const lineGeometry = new BufferGeometry();
                line = new Line(lineGeometry, lineMaterial);
                // line.renderOrder = 3;
                // const path = pathfinding.findPath(startPoint, endPoint, zoneName, groupID);
                // console.log("GroupID, Path, StartPoint, EndPoint", groupID, path, startPoint, endPoint);
                // if (path != null) {
                //     const points = [];
                //     points.push(startPoint);
                //     for (let index = 0; index < path.length; index++) {
                //         points.push(path[index]);
                //     }

                //     line.geometry.setFromPoints(points);
                //     // const lineMaterial = new LineBasicMaterial({ color: 0x0000ff });
                //     // const lineGeometry = new BufferGeometry().setFromPoints(points);
                //     // const line = new Line(lineGeometry, lineMaterial);
                //     // line.renderOrder = 3;
                //     // navigationMeshParent.add(line);
                // }

                // navigationAreaParent.add(navigationMeshParent);

                navigationArea.add(line);
            },
            undefined,
            (e) => {
                console.error(e);
            }
        );

        const geometry = new BoxGeometry(0.1, 0.1, 0.1);
        const material = new MeshBasicMaterial({ color: 0xff0000 });
        for (let index = 0; index < 10; index++) {
            const cube = new Mesh(geometry, material);
            navCubes.push(cube);
            navigationArea.add(cube);
        }
    }

    setStartPosition(start) {
        startPosition = start;

        groupID = pathfinding.getGroup(zoneName, start);
        // console.log("GroupID, StartPosition", groupID, start);
        // const startnode = pathfinding.getClosestNode(startPosition, zoneName, groupID);
        // console.log("GroupID, StartPosition, StartNode", groupID, startPosition, startnode);

        // visual for better debugging
        if (!isStartCubeCreated) {
            const startGeometry = new BoxGeometry(1, 1, 1);
            const startMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
            const startCube = new Mesh(startGeometry, startMaterial);
            startCube.position.set(startPosition.x, startPosition.y, startPosition.z);
            // startCube.renderOrder = 3;

            navigationArea.add(startCube);

            isStartCubeCreated = !isStartCubeCreated;
        }
    }

    setTargetPosition(target) {
        targetPosition = target;

        // const endnode = pathfinding.getClosestNode(targetPosition, zoneName, groupID);
        // console.log("GroupID, EndPosition, EndNode", groupID, targetPosition, endnode);

        // visual for better debugging
        if (!isEndCubeCreated) {
            const targetGeometry = new BoxGeometry(1, 1, 1);
            const targetMaterial = new MeshBasicMaterial({ color: 0x0000ff });
            const targetCube = new Mesh(targetGeometry, targetMaterial);
            targetCube.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
            // targetCube.renderOrder = 3;

            navigationArea.add(targetCube);
            isEndCubeCreated = !isEndCubeCreated;
        }
    }

    calculatePath(timestamp, frame, imageTracking) {
        if (frame) {
            const markerWorldPosition = imageTracking.getMarkerWorldPosition();
            const markerWorldRotation = imageTracking.getMarkerWorldRotation();

            if (markerWorldPosition != zeroVector) {
                // calculate "offseted" positions, as navigation mesh can't be moved/rotated
                // set startposition to "0, 0, 0" and add the position offset for living room center
                let cameraPosition = new Vector3();
                cameraPosition = camera.position.clone();
                cameraPosition.applyMatrix4(camera.matrixWorld);
                const navStart = new Vector3(cameraPosition.x, 0.5, cameraPosition.z).sub(new Vector3(markerWorldPosition.x, 0.5, markerWorldPosition.z)).add(new Vector3(3, 0.5, -2));

                // set endposition to current target
                const navEnd = new Vector3(0, 0.5, -2);

                this.setStartPosition(navStart);
                this.setTargetPosition(navEnd);

                const path = pathfinding.findPath(startPosition, targetPosition, zoneName, groupID);
                console.log("GroupID, Path, StartPosition, EndPosition", groupID, path, startPosition, targetPosition);
                // console.log("Zone", zoneData);

                if (path != null) {
                    // const points = [];
                    // points.push(navStart);
                    for (let index = 0; index < path.length; index++) {
                        // points.push(path[index]);
                        navCubes[index].position.set(path[index].x, 0.2, path[index].z);
                    }
                    for (let unsetIndex = path.length; unsetIndex < navCubes.length; unsetIndex++) {
                        navCubes[unsetIndex].position.set(0, 0, 0);
                    }

                    // line.geometry.setFromPoints(points);
                }
            }
        }
    }
}

export { PathFindingWebXR };
