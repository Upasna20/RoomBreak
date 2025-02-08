import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

export class Controls {
    public pointerLockControls: PointerLockControls;
    public moveForward = false;
    public moveBackward = false;
    public moveLeft = false;
    public moveRight = false;
    public moveSpeed = 1;

    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.pointerLockControls = new PointerLockControls(camera, renderer.domElement);
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
                case 'Escape':
                    this.pointerLockControls.unlock();
                    break;
            }
        });
    }

    public lock(): void {
        this.pointerLockControls.lock();
    }

    public unlock(): void {
        this.pointerLockControls.unlock();
    }

    public update(): void {
        if (this.pointerLockControls.isLocked) {
            if (this.moveForward) this.pointerLockControls.moveForward(this.moveSpeed);
            if (this.moveBackward) this.pointerLockControls.moveForward(-this.moveSpeed);
            if (this.moveLeft) this.pointerLockControls.moveRight(-this.moveSpeed);
            if (this.moveRight) this.pointerLockControls.moveRight(this.moveSpeed);
        }
    }
}
