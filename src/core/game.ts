import * as THREE from "three";
import { Controls } from "./controls";
import { Lobby } from "../scenes/lobby";
import { SceneManager} from "../sceneManager";

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: Controls;
  private sceneManager: SceneManager;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Initialize the Controls class
    this.controls = new Controls(this.camera, this.renderer);

    // Initialize the SceneManager
    this.sceneManager = new SceneManager(this.scene, this.camera);
  }

  public init() {
    this.addStartButton();
  }

  private addStartButton() {
    const startButton = document.querySelector("#startButton") as HTMLButtonElement;
    startButton.addEventListener("click", () => {
      console.log("Game Started! Interactions Begin...");
      startButton.style.display = "none";
      this.startGame();
      this.controls.lock();
    });

    this.controls.pointerLockControls.addEventListener('lock', () => console.log("PointerLockControls locked"));
    this.controls.pointerLockControls.addEventListener('unlock', () => console.log("PointerLockControls unlocked"));
  }

  private startGame() {
    console.log("Game logic will start here.");

    // Initialize the lobby and set it as the current scene
    const lobby = new Lobby();
    this.sceneManager.setScene(lobby);

    this.animate();
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Update controls and current scene
    this.controls.update();
    this.sceneManager.update();

    this.renderer.render(this.scene, this.camera);
  }
}
