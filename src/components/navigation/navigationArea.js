import { MeshStandardMaterial, Vector3, PlaneGeometry, TextureLoader, MeshBasicMaterial, Mesh, MathUtils, Group, BoxGeometry } from "three";
import CasualFlapMapImageUrl from "/CasualFlatMap.png";

function setupNavigationAreaGeometry() {
    // create occluder material
    const occluderMaterial = new MeshStandardMaterial({ color: 0x00ff00 });
    occluderMaterial.colorWrite = false;

    // create room map
    const navigationArea = new Group();
    navigationArea.add(createWallElement(new Vector3(-4.85, 1, -0.74), new Vector3(0, 0, 0), new Vector3(0.0625, 3, 1.578), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(-2.98, 1, -2.65), new Vector3(0, 0, 0), new Vector3(0.0625, 3, 3.51), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(1, 1, -2.55), new Vector3(0, 0, 0), new Vector3(0.0625, 3, 3.467), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(1, 1, 2.18), new Vector3(0, 0, 0), new Vector3(0.0625, 3, 4.475), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(-0.689, 1, 0), new Vector3(0, 0, 0), new Vector3(8.518, 3, 0.06), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(0.97, 1, -4.05), new Vector3(0, 0, 0), new Vector3(7.91, 3, 0.06), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(-3.34, 1, -1.29), new Vector3(0, 0, 0), new Vector3(0.86, 3, 0.06), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(4.86, 1, -0.01), new Vector3(0, 0, 0), new Vector3(0.06, 3, 9.114), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(-1.6, 1, -0.88), new Vector3(0, 0, 0), new Vector3(2.85, 3, 0.06), occluderMaterial));
    navigationArea.add(createWallElement(new Vector3(2.9, 1, 4.06), new Vector3(0, 0, 0), new Vector3(4, 3, 0.06), occluderMaterial));

    // create floor
    const floorGeometry = new PlaneGeometry(10.2, 8.5);
    const floorTexture = new TextureLoader().load(CasualFlapMapImageUrl);
    const floorMaterial = new MeshBasicMaterial({ map: floorTexture });
    const floorPlaneMesh = new Mesh(floorGeometry, floorMaterial);
    floorPlaneMesh.rotateX(MathUtils.degToRad(270));
    floorPlaneMesh.renderOrder = 3;
    // floorPlaneMesh.visible = false;
    navigationArea.add(floorPlaneMesh);

    // navigation area parent for easier placement
    const navigationAreaParent = new Group();
    navigationAreaParent.add(navigationArea);

    // setup navmesh and navigation targets
    // const loader = new GLTFLoader();
    // loader.load(
    //     NavMeshUrl,
    //     (gltf) => {
    //         // NavMesh generator https://navmesh.isaacmason.com/
    //         // PathFinding https://github.com/donmccurdy/three-pathfinding

    //         let navigationMeshParent = new Group();
    //         let navMesh = gltf.scene;
    //         navigationMeshParent.add(navMesh);

    //         let navMeshGeometry = new BufferGeometry();
    //         navMesh.children.forEach((child) => {
    //             if (child.type === "Mesh") {
    //                 console.log("Mesh", child);
    //                 navMeshGeometry = child;
    //             }
    //         });
    //         navMeshGeometry.visible = false;

    //         const startPoint = new Vector3(3, 0.5, -2);
    //         const endPoint = new Vector3(0, 0.5, -2);

    //         const geometry = new BoxGeometry(1, 1, 1);
    //         const material = new MeshBasicMaterial({ color: 0x00ff00 });
    //         const cube = new Mesh(geometry, material);
    //         cube.position.set(startPoint.x, startPoint.y, startPoint.z);
    //         cube.renderOrder = 3;

    //         const secgeometry = new BoxGeometry(1, 1, 1);
    //         const secmaterial = new MeshBasicMaterial({ color: 0x0000ff });
    //         const seccube = new Mesh(secgeometry, secmaterial);
    //         seccube.position.set(endPoint.x, endPoint.y, endPoint.z);
    //         seccube.renderOrder = 3;

    //         navigationMeshParent.add(cube);
    //         navigationMeshParent.add(seccube);

    //         const pathfinding = new Pathfinding();
    //         const ZONE = "level1";
    //         const zoneData = Pathfinding.createZone(navMeshGeometry.geometry);
    //         pathfinding.setZoneData(ZONE, zoneData);

    //         const groupID = pathfinding.getGroup(ZONE, startPoint);

    //         const startnode = pathfinding.getClosestNode(startPoint, ZONE, groupID);
    //         const endnode = pathfinding.getClosestNode(endPoint, ZONE, groupID);

    //         const path = pathfinding.findPath(startPoint, endPoint, ZONE, groupID);
    //         console.log("GroupID, Path, StartPoint, EndPoint", groupID, path, startnode, endnode);

    //         console.log("Zone", zoneData);

    //         if (path != null) {
    //             const points = [];
    //             points.push(startPoint);
    //             for (let index = 0; index < path.length; index++) {
    //                 points.push(path[index]);
    //             }

    //             const lineMaterial = new LineBasicMaterial({ color: 0x0000ff });
    //             const lineGeometry = new BufferGeometry().setFromPoints(points);
    //             const line = new Line(lineGeometry, lineMaterial);
    //             line.renderOrder = 3;
    //             navigationMeshParent.add(line);
    //         }

    //         navigationAreaParent.add(navigationMeshParent);
    //     },
    //     undefined,
    //     (e) => {
    //         console.error(e);
    //     }
    // );

    return navigationAreaParent;
}

function createWallElement(position, rotation, scale, occluderMaterial) {
    const occluderGeometry = new BoxGeometry(scale.x, scale.y, scale.z);
    const occluderMesh = new Mesh(occluderGeometry, occluderMaterial);
    occluderMesh.position.set(position.x, position.y, position.z);
    occluderMesh.renderOrder = 2;

    return occluderMesh;
}

export { setupNavigationAreaGeometry };
