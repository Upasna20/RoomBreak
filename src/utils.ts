import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Lobby } from "./scenes/Lobby";
import { PainterRoom } from "./scenes/painterRoom/painterRoom";
import { MusicRoom } from "./scenes/musicRoom/musicRoom";

export function createWallWithDoorInCenter(
    wallWidth: number,
    wallHeight: number,
    doorWidth: number,
    doorHeight: number
): THREE.BufferGeometry {
    const leftWidth = -doorWidth / 2 + wallWidth / 2;
    const rightWidth = wallWidth / 2 - doorWidth / 2;

    // Create individual geometries
    const leftGeometry = new THREE.BoxGeometry(leftWidth, wallHeight, Lobby.WallThickness);
    const rightGeometry = new THREE.BoxGeometry(rightWidth, wallHeight, Lobby.WallThickness);
    const topGeometry = new THREE.BoxGeometry(
        wallWidth,
        wallHeight - doorHeight,
        Lobby.WallThickness
    );

    // Apply transformations
    leftGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
            -wallWidth / 2 + leftWidth / 2,
            wallHeight / 2,
            0
        )
    );
    rightGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
            wallWidth / 2 - rightWidth / 2,
            wallHeight / 2,
            0
        )
    );
    topGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
            0,
            doorHeight + (wallHeight - doorHeight) / 2,
            0
        )
    );

    // Merge geometries into a single wall
    return mergeGeometries([
        leftGeometry,
        rightGeometry,
        topGeometry,
    ]) as THREE.BufferGeometry;
}

export function createWallWithDoorInRightCorner(
    wallWidth: number,
    wallHeight: number,
    doorWidth: number,
    doorHeight: number
): THREE.BufferGeometry {
    const leftWidth = wallWidth - doorWidth;

    // Create individual geometries
    const leftGeometry = new THREE.BoxGeometry(leftWidth, wallHeight, Lobby.WallThickness);
    const topGeometry = new THREE.BoxGeometry(
        wallWidth,
        wallHeight - doorHeight,
        Lobby.WallThickness
    );

    // Apply transformations
    leftGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
           - (wallWidth / 2 - leftWidth / 2),
            wallHeight / 2,
            0
        )
    );
    topGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
            0,
            doorHeight + (wallHeight - doorHeight) / 2,
            0
        )
    );

    // Merge geometries into a single wall
    return mergeGeometries([
        leftGeometry,
        topGeometry,
    ]) as THREE.BufferGeometry;
}

export function createWallWithDoorInLeftCorner(
    wallWidth: number,
    wallHeight: number,
    doorWidth: number,
    doorHeight: number
): THREE.BufferGeometry {
    const rightWidth = wallWidth - doorWidth;

    // Create individual geometries
    const rightGeometry = new THREE.BoxGeometry(rightWidth, wallHeight, Lobby.WallThickness);
    const topGeometry = new THREE.BoxGeometry(
        wallWidth,
        wallHeight - doorHeight,
        Lobby.WallThickness
    );

    // Apply transformations
    rightGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
           (wallWidth / 2 - rightWidth / 2),
            wallHeight / 2,
            0
        )
    );
    topGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
            0,
            doorHeight + (wallHeight - doorHeight) / 2,
            0
        )
    );

    // Merge geometries into a single wall
    return mergeGeometries([
        rightGeometry,
        topGeometry,
    ]) as THREE.BufferGeometry;
}
