import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import * as THREE from 'three';
import { wsClient } from '../network/wsClient';
import { gameInstance } from './Game';

export class GameControls {
    private controls: PointerLockControls;
    private moveForward: boolean = false;
    private moveBackward: boolean = false;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private camera: THREE.PerspectiveCamera;

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, domElement);
        this.setupKeyboardControls();
    }

    private setupKeyboardControls(): void {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        });
    }

    public lock(): void {
        this.controls.lock();
    }

    public unlock(): void {
        this.controls.unlock();
    }

    public update(): void {
        if (this.controls.isLocked) {
            const speed = 0.1;
            if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight ) wsClient.send({type: "POSITION_CHANGE_REQUEST", gameCode: gameInstance.gameCode, serialNumber: gameInstance.localPlayer.serialNumber, newPos: {x: this.camera.position.x, y: 0, z: this.camera.position.z}});
            if (this.moveForward) this.controls.moveForward(speed);
            if (this.moveBackward) this.controls.moveForward(-speed);
            if (this.moveLeft) this.controls.moveRight(-speed);
            if (this.moveRight) this.controls.moveRight(speed);
        }
        

    }
}
