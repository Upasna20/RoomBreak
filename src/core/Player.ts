import * as THREE from 'three';

export class Player {
    private camera: THREE.Camera;
    private height: number;
    private speed: number;
    private position: THREE.Vector3;
    private velocity: THREE.Vector3;

    constructor(camera: THREE.Camera) {
        this.camera = camera;
        this.height = 1.8;
        this.speed = 0.1;
        this.position = new THREE.Vector3(0, this.height, 5);
        this.velocity = new THREE.Vector3();

        this.camera.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
    }

    public update(): void {
        // Update player position and camera
        this.position.add(this.velocity);
        this.camera.position.copy(this.position);

        // Reset velocity
        this.velocity.multiplyScalar(0.9);
    }

    public move(direction: THREE.Vector3): void {
        this.velocity.add(direction.multiplyScalar(this.speed));
    }
}
