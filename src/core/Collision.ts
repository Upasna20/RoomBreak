

import * as THREE from 'three';
import { Lobby } from '../scenes/Lobby';
import { BaseRoom } from '../scenes/BaseRoom';

export function createLobbyBoundingBoxes(lobby: Lobby) {
    lobby.lobbyGroup.children.forEach((child) => {
        if (child.name != "doorWall") {
            const boundingBox = new THREE.Box3().setFromObject(child);
            // const boxHelper = new THREE.Box3Helper(boundingBox, 0x00ff00); // Green color
            // this.scene.add(boxHelper);
            lobby.boundingBoxes.push({ box: boundingBox, object: child });
        }

    });
    addLobbyDoorWallBoundingBox(lobby);
}
function addLobbyDoorWallBoundingBox(lobby: Lobby) {
    const { LobbyWidth, LobbyLength, CeilingHeight, DoorHeight } = Lobby;

    // Helper function to create bounding boxes
    const createBox = (x1: number, x2: number, y1: number, y2: number, z1: number, z2: number) => {
        const boundingBox = new THREE.Box3(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2));
        // const boxHelper = new THREE.Box3Helper(boundingBox, 0x00ff00); // Green color
        // this. scene.add(boxHelper);
        return boundingBox;
    }

    // Top wall bounding boxes (above doors)
    const topWallBoundingBoxes = [
        { box: createBox(-LobbyWidth / 2, -LobbyWidth / 2 + Lobby.WallThickness, DoorHeight, CeilingHeight, -LobbyLength / 2, LobbyLength / 2), pos: "topL" },
        { box: createBox(LobbyWidth / 2, LobbyWidth / 2 + Lobby.WallThickness, DoorHeight, CeilingHeight, -LobbyLength / 2, LobbyLength / 2), pos: "topR" }
    ];

    // Doorway gaps (z positions where the doors exist)
    const doorGaps = Lobby.doorGaps;

    // Bottom wall bounding boxes (excluding door gaps)
    const bottomWallBoundingBoxes: { box: THREE.Box3, pos?: string }[] = [];
    [-LobbyWidth / 2, LobbyWidth / 2].forEach((x) => {
        let prevEnd = -LobbyLength / 2;
        let x2 = x >= 0 ? x + Lobby.WallThickness : x + Lobby.WallThickness; // Corrected `x2` assignment

        Object.values(doorGaps).forEach(({ zStart, zEnd }) => {
            bottomWallBoundingBoxes.push({ box: createBox(x, x2, 0, DoorHeight, prevEnd, zStart), pos: "bottom" });
            prevEnd = zEnd; // Update for the next door gap
        });

        // Ensure last segment after the last door gap
        bottomWallBoundingBoxes.push({ box: createBox(x, x2, 0, DoorHeight, prevEnd, LobbyLength / 2), pos: "bottomright" });

    });


    // Store bounding boxes
    lobby.boundingBoxes.push(...topWallBoundingBoxes, ...bottomWallBoundingBoxes);
}




export function createBoundingBoxes(room: BaseRoom, roomGroup: THREE.Group) {
    console.log(roomGroup)
    roomGroup.children.forEach((child) => {
        if (child.name != "doorWall") {
            const boundingBox = new THREE.Box3().setFromObject(child);
            //   const boxHelper = new THREE.Box3Helper(boundingBox, 0x00ff00); // Green color
            //   this.scene.add(boxHelper);
            room.boundingBoxes.push({ box: boundingBox, object: child });
        }
    });
    // Add door wall bounding box (to be implemented by child classes)
    createDoorWallBoundingBox(room, roomGroup);
}

function createDoorWallBoundingBox(room: BaseRoom, roomGroup: THREE.Group): void {
    const doorWall = roomGroup.children.find(child => child.name === "doorWall");
    if (doorWall) {
        const RoomClass = room.constructor as typeof BaseRoom;
        const boundingBox = new THREE.Box3(
            new THREE.Vector3(Lobby.LobbyWidth / 2 + 2, 0, Lobby.doorGaps["right"].zEnd),
            new THREE.Vector3(Lobby.LobbyWidth / 2 + 2 + Lobby.WallThickness, Lobby.CeilingHeight, Lobby.doorGaps["right"].zStart + RoomClass.wallLength)
        );
        const boxHelper = new THREE.Box3Helper(boundingBox, 0x00ff00);
        //   this.scene.add(boxHelper);
        room.boundingBoxes.push({ box: boundingBox, object: doorWall });
    }
}