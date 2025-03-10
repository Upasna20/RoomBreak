import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module";

export abstract class BaseRoom {
  protected scene: THREE.Scene;
  protected clickableModels: THREE.Object3D[] = [];
  protected loader = new GLTFLoader();
  public boundingBoxes: THREE.Box3[] = [];
  static ceilingHeight: number = 6.6;
  static wallLength: number = 13;
  renderer: THREE.WebGLRenderer;

  // 🔹 Static KTX2Loader (Shared across all instances)
  private static ktx2Loader: KTX2Loader | null = null;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    // 🔹 Initialize GLTFLoader
    this.loader = new GLTFLoader();
    this.loader.setMeshoptDecoder(MeshoptDecoder);

    // 🔹 Ensure KTX2Loader is only created once
    if (!BaseRoom.ktx2Loader) {
      console.log("Initializing KTX2Loader...");
      BaseRoom.ktx2Loader = new KTX2Loader();
      BaseRoom.ktx2Loader.setTranscoderPath(
        "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r143/examples/js/libs/basis/"
      );
      BaseRoom.ktx2Loader.detectSupport(this.renderer);
    } else {
      console.log("Reusing existing KTX2Loader instance.");
    }

    // 🔹 Attach shared KTX2Loader to GLTFLoader
    this.loader.setKTX2Loader(BaseRoom.ktx2Loader);
  }

  protected async init() {
    // this.initLighting();
    // await this.loadModels();
    console.log("After loading the model from the music room I'm in the Baseroom")
    this.onAssetsLoaded();
  }



  protected abstract loadModels(): Promise<void>;

  protected onAssetsLoaded() {
    console.log(`${this.constructor.name} Loaded!`);
  }
}