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

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.loader = new GLTFLoader();
this.renderer = renderer;

// 🔹 Set MeshoptDecoder (no need for "new" keyword)
this.loader.setMeshoptDecoder(MeshoptDecoder);

// 🔹 Attach KTX2 Loader (for texture compression)
const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath("https://cdn.jsdelivr.net/gh/mrdoob/three.js@r143/examples/js/libs/basis/");
ktx2Loader.detectSupport(this.renderer); // Ensure KTX2 support
this.loader.setKTX2Loader(ktx2Loader);
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