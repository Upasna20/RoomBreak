
import * as THREE from "three";
import { BaseRoom } from "./BaseRoom";
import { gameInstance } from "../core/Game";


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
    this.loadModels();
    console.log("This is the literature Group", this.clickableModels);
  }



  protected async loadModels(): Promise<void> {
    console.log("Loading the models");

    const modelData = [
      // { path: "models/literaryRoom/wild_west_theme_small_window_no_glass.glb", scale: [0.03, 0.03, 0.03], position: [20, 0, -15], rotation: [0, Math.PI / 2, 0], name: "window" },
      { path: "models/literaryRoom/compressed_ktx2/victorian_bookshelf_ktx2.glb", scale: [2, 1.5, 2], position: [15, 0, -14], rotation: [0, Math.PI + Math.PI / 2, 0], name: "bookshelf" },
      // { path: "models/literaryRoom/dusty_old_bookshelf_free.glb", scale: [3.5, 3.5, 3.5], position: [0, 0, 0], rotation: [0, Math.PI + Math.PI / 2, 0], name: "bookshelf1" },
      { path: "models/literaryRoom/compressed_ktx2/old_desk_scene_ktx2.glb", scale: [2.3, 1.2, 1], position: [19.5, 1, -8], rotation: [0, Math.PI + Math.PI / 2, 0], name: "desk" }
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
          this.boundingBoxes.push({box: new THREE.Box3().setFromObject(model), object: model});
          gameInstance.mainGroup.add(model);
          this.scene.add(model);
        } catch (error) {
          console.error(`Error loading ${data.name}:`, error);
        }
      })
    );
    console.log("Finished loading the literature room models");
  }
}
