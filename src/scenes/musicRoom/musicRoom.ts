import * as THREE from "three";
import { BaseRoom } from "../BaseRoom";
import { gameInstance } from "../../core/Game";


export class MusicRoom extends BaseRoom {
  musicRoomReady: Promise<void>;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    console.log("initialising from teh music Room file");
    super(scene, renderer);
    this.renderer = renderer;
    this.musicRoomReady = this.init();
  }

  protected async init() {
    await super.init(); // ✅ Calls parent init
    this.loadModels();
    console.log("This is the musicgroup", this.clickableModels);
  }

  protected async loadModels(): Promise<void> {
    console.log("Loading the models");
    const modelData = [
      { path: "models/musicRoom/compressed_ktx2/compressed_electric_guitar_lowpoly_model_ktx2.glb", scale: [.4, .4, .4], position: [7.3, 1.5, 8], rotation: [0, Math.PI/2, 3 * Math.PI / 8], name: "red_guitar" },
      { path: "models/musicRoom/compressed_ktx2/compressed_sitar_and__surbahar_ktx2.glb", scale: [0.3, 0.3, 0.3], position: [13, -1.3, 14], rotation: [0, Math.PI, 0], name: "piano" },
      { path: "models/musicRoom/compressed_ktx2/compressed_harmonium_ktx2.glb", scale: [.15, .105, .15], position: [19.5, 0, 8], rotation: [0, -Math.PI / 2, 0], name: "harmonium" },
      // { path: "models/musicRoom/guitar.glb", scale: [6, 6, 6], position: [-50, 40, 96], rotation: [-Math.PI / 2, Math.PI, Math.PI / 2], name: "guitar2" },
      // { path: "models/musicRoom/guitar_hero_guitar.glb", scale: [6, 6, 6], position: [-20, 40, 90], rotation: [0, Math.PI, 0], name: "guitar_hero" },
      { path: "models/musicRoom/compressed_ktx2/compressed_drum_ktx2.glb", scale: [2, 1.8, 2], position: [15, 0, 5], rotation: [0, 0, 0], name: "drum" },
      // { path: "models/musicRoom/krishna.glb", scale: [20, 20, 20], position: [-66, -10, -66], rotation: [0, Math.PI / 2, 0], name: "krishna" },
      { path: "models/musicRoom/compressed_ktx2/compressed_speaker_ktx2.glb", scale: [0.012, 0.012, 0.012], position: [19, 0, 14], rotation: [0, 0, 0], name: "speaker" },
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
          // console.log("position of the musicroom model is", model.position); // Logs { x, y, z }
          // const worldPosition = new THREE.Vector3();
          // model.getWorldPosition(worldPosition);
          // console.log("world coordinates for the musicroom model are", worldPosition);
        } catch (error) {
          console.error(`Error loading ${data.name}:`, error);
        }
      })
    );
    console.log("finished loading the music room models")
  }
}