import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gameInstance } from "../core/Game";

export class MainScene {
  loader: GLTFLoader;
  mainSceneModel!: THREE.Object3D; // Allow undefined initially
  boundingBoxes: THREE.Box3[] = []; // Store bounding boxes
  ready: Promise<void>;


  constructor() {
    this.loader = new GLTFLoader();
    this.ready = this.init();
  }

  private async init() {
    await this.loadMainSceneModel();
    this.createBoundingBoxes()
    console.log("Done with creating boxes and loading the scene!")
  }

  private async loadMainSceneModel() {
    // const childrenToMove: THREE.Object3D<THREE.Object3DEventMap>[] = [];

    try {
      const gltf = await this.loadGLTF("/models/Scene.glb");
      const model = gltf; // No type error now
      model.name = "MainSceneModel";
      gameInstance.mainGroup.add(model);

      console.log(model);
      //   model.traverse((child) => {
      //     if (child instanceof THREE.Mesh) { 
      //         child.material.wireframe = true;
      //     }
      // });



      this.mainSceneModel = model;
      console.log("Main Scene Loaded");
    } catch (error) {
      console.error("Error loading main scene:", error);
    }
  }

  private loadGLTF(modelPath: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => resolve(gltf.scene as THREE.Object3D), // Correctly returning gltf.scene
        undefined,
        (error) => reject(error)
      );
    });
  }

  private createBoundingBoxes(): void {

    this.mainSceneModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name !== "Ground") {
        // // Get the local bounding box
        const localBox = new THREE.Box3().setFromObject(child);
        this.boundingBoxes.push(localBox);
        // Optional: Visualize the bounding box
        // const boxHelper = new THREE.Box3Helper(localBox, new THREE.Color(0xff0000));
        // this.scene.add(boxHelper);
      }
    });

    console.log("length", this.boundingBoxes.length);
    console.log("Bounding boxes generated:", this.boundingBoxes);
  }

}
