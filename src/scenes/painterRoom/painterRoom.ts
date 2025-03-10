import * as THREE from "three";
import { BaseRoom } from "../BaseRoom";
import { gameInstance } from "../../core/Game";


export class PainterRoom extends BaseRoom {
  painterRoomReady: Promise<void>;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    console.log("initialising from the painter Room file");
    super(scene, renderer);
    this.renderer = renderer
    this.painterRoomReady = this.init();
  }

  protected async init() {
    await super.init(); // ✅ Calls parent init
    this.loadModels();
    console.log("This is the music Group", this.clickableModels);
  }

  protected async loadModels(): Promise<void> {
    const modelData = [
      { path: "models/painterRoom/compressed_ktx2/my_desk_ktx2.glb", scale: [3.2, 3.2, 3.2], position: [-19.3, 1, 10], rotation: [0, Math.PI / 2, 0], name: "mydesk" },
      { path: "models/painterRoom/compressed_ktx2/paintcan_ktx2.glb", scale: [.4, .4, .4], position: [-10, 0, 3], rotation: [0, 0, 0], name: "paintcan" },
      { path: "models/painterRoom/compressed_ktx2/colorspot_ktx2.glb", scale: [50, 50, 50], position: [-11, 0, 4], name: "colorspot" },
      // { path: "models/painterRoom/caterpillar.glb", scale: [8, 8, 8], position: [-90, 48, 90], name: "caterpillar" },
      // { path: "models/painterRoom/Lantern.glb", scale: [.2, .2, .2], position: [-90, 0, 90], name: "lantern" },
      { path: "models/painterRoom/compressed_ktx2/collage_wall_ktx2.glb", scale: [4, 4, 4], position: [-15, 1.5, 2.3], rotation: [-Math.PI / 2, Math.PI, Math.PI], name: "collage_wall" },
      { path: "models/painterRoom/compressed_ktx2/SheenWoodLeatherSofa_ktx2.glb", scale: [1.9, 1.9, 1.9], position: [-12, 0, 13], rotation: [0, Math.PI, 0], name: "sheenwood" },
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
             gameInstance.mainGroup.add(model);
             this.scene.add(model);
           } catch (error) {
             console.error(`Error loading ${data.name}:`, error);
           }
         })
       );
       console.log("Finished loading the music room models");
  }
}