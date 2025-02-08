import * as THREE from "three";

export interface IScene {
    init(): void;
    update(): void;
    getGroup(): THREE.Group;
}

export class SceneManager {
    private currentScene: IScene | null = null;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.scene = scene;
        this.camera = camera;
    }

    public setScene(scene: IScene): void {
        if (this.currentScene) {
            this.disposeCurrentScene();
        }

        this.currentScene = scene;
        this.currentScene.init();
        this.scene.add(this.currentScene.getGroup());
    }

    private disposeCurrentScene(): void {
        // Clean up current scene resources if necessary
        while (this.scene.children.length > 0) {
            const object = this.scene.children[0];
            this.scene.remove(object);
        }
    }

    public update(): void {
        if (this.currentScene) {
            this.currentScene.update();
            console.log(this.camera);
        }
    }
}
