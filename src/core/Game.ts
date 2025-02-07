import * as THREE from "three";
import { Player } from "./Player.ts";
import { GameControls } from "./Controls.ts";
import { Lobby } from "../scenes/Lobby.js";

type Room = {
  enter: () => void;
};

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public controls: GameControls;
  private currentRoom: string;
  private rooms: Record<string, Room>;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    // Initialize core components
    this.controls = new GameControls(this.camera, this.renderer.domElement);

    // Game state
    this.currentRoom = "lobby";
    const lobby = new Lobby(this.scene, this.renderer)

    this.setupLighting();
    this.setupEventListeners();

    // Renderer settings
    this.renderer.physicallyCorrectLights = true;
    this.scene.background = new THREE.Color(0x202020); // Dark gray

    // Camera setup
    this.camera.position.set(0, 2, 0); // Player height
    this.camera.lookAt(0, 2, -14); // Looking at the wall with doors
    this.camera.position.set(0, 5, 10); // Higher up
    this.camera.lookAt(0, 0, 0); // Look at the floor

    this.animate();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); // Soft global light
    this.scene.add(ambientLight);
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }


  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();

    // Update current room (if needed in the future)
    // if (this.rooms[this.currentRoom]) {
    //   this.rooms[this.currentRoom].update();
    // }

    this.renderer.render(this.scene, this.camera);
  }
}
