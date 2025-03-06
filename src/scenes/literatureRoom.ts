
import * as THREE from "three";
import { BaseRoom } from "./BaseRoom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


export class LiteratureRoom extends BaseRoom {
  literatureRoomReady: Promise<void>;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    console.log("initialising from teh literature Room file");
    super(scene, renderer);
    this.renderer = renderer;
    this.literatureRoomReady = this.init();
  }

  protected async init() {
    await super.init(); // ✅ Calls parent init
  }



  protected async loadModels(): Promise<void> {
    console.log("Loading the models");

    const modelData = [
      { path: "models/literaryRoom/wild_west_theme_small_window_no_glass.glb", scale: [0.3, 0.3, 0.3], position: [0, 0, 0], rotation: [0, Math.PI / 2, 0], name: "window" },
      { path: "models/literaryRoom/victorian_bookshelf.glb", scale: [30, 30, 30], position: [0, 0, 0], rotation: [0, Math.PI + Math.PI / 2, 0], name: "bookshelf" },
      { path: "models/literaryRoom/dusty_old_bookshelf_free.glb", scale: [35, 35, 35], position: [0, 0, 0], rotation: [0, Math.PI + Math.PI / 2, 0], name: "bookshelf1" },
      { path: "models/literaryRoom/old_desk_scene.glb", scale: [39, 30, 30], position: [0, 0, 0], rotation: [0, Math.PI + Math.PI / 2, 0], name: "desk" }
    ];

    await Promise.all(
      modelData.map(async (data) => {
        try {
          const gltf = await this.loader.loadAsync(data.path);
          const model = gltf.scene;
          model.scale.set(data.scale[0], data.scale[1], data.scale[2]);
          model.position.set(data.position[0],
            data.position[1],
            data.position[2]);
          if (data.rotation) model.rotation.set(data.rotation[0],
            data.rotation[1],
            data.rotation[2]);
          model.name = data.name;
          this.clickableModels.push(model);
          this.boundingBoxes.push(new THREE.Box3().setFromObject(model));
          this.scene.add(model);
        } catch (error) {
          console.error(`Error loading ${data.name}:`, error);
        }
      })
    );
    console.log("Finished loading the literature room models");
  }
}
