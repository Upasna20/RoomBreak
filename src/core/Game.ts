import * as THREE from "three";
// import { Player } from "./Player.ts";
import { GameControls } from "./Controls.ts";
import { Lobby } from "../scenes/Lobby.ts";
import { MusicRoom } from "../scenes/musicRoom/musicRoom.ts";
import { LiteraryRoom } from "../scenes/literaryRoom.ts";
// import { DirectionalLightHelper } from "three";

import { PainterRoom } from "../scenes/painterRoom/painterRoom.ts";

type Room = {
  enter: () => void;
};

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public controls: GameControls;
  private currentRoom: Lobby | MusicRoom| PainterRoom | LiteraryRoom;
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
    // this.currentRoom = "lobby";
    const lobby = new Lobby(this.scene, this.renderer, this.camera);
    this.scene.add(lobby.lobbyGroup);
    const musicRoom = new MusicRoom(this.scene, this.renderer) 
    this.scene.add(musicRoom.musicGroup);
    musicRoom.musicGroup.position.copy(new THREE.Vector3(-202, 0, 140.5))

    const literaryRoom = new LiteraryRoom();
    this.scene.add(literaryRoom.literaryGroup);
    literaryRoom.literaryGroup.position.copy(new THREE.Vector3(-201, 0, -70));

    literaryRoom.literaryGroup.rotateY(Math.PI / 2);  // 90 degrees in radians

    const painterRoom = new PainterRoom(this.scene, this.renderer);
    this.scene.add(painterRoom.painterGroup);
    painterRoom.painterGroup.position.copy( new THREE.Vector3(202, 0, 140.5));

    // this.currentRoom = painterRoom;
    
    this.setupLighting();
    this.setupEventListeners();

    // Renderer settings
    this.renderer.physicallyCorrectLights = true;
    this.scene.background = new THREE.Color(0x202020); // Dark gray

    // Camera setup
    this.camera.position.set(0, 2, 0); // Player height
    this.camera.lookAt(0, 2, -14); // Looking at the wall with doors
    this.camera.position.set(0, 25, 10); // Higher up
    this.camera.lookAt(0, 50, 0); // Look at the floor

    this.animate();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Soft global light
    this.scene.add(ambientLight);

    // const sunlight = new THREE.DirectionalLight(0xffffff, 5); // Increase intensity for more light
    // sunlight.position.set(-200, 200, -400); // Adjust position for better light direction
    // sunlight.target.position.set(-200, 0, -100); // Target the center of the room
    // sunlight.castShadow = true;
    //
    // sunlight.shadow.camera.near = 0.1;
    // sunlight.shadow.camera.far = 500;
    // sunlight.shadow.camera.left = -200;
    // sunlight.shadow.camera.right = 200;
    // sunlight.shadow.camera.top = 200;
    // sunlight.shadow.camera.bottom = -200;
    //
    // sunlight.shadow.mapSize.width = 4096;
    // sunlight.shadow.mapSize.height = 4096;
    // sunlight.shadow.bias = -0.0010;
    //
    // this.scene.add(sunlight);
    // Add light helper
    // const lightHelper = new DirectionalLightHelper(sunlight, 10);
    // this.scene.add(lightHelper);
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
    // this.controls.update();

    // Update current room (if needed in the future)
    // if (this.rooms[this.currentRoom]) {
    //   this.rooms[this.currentRoom].update();
    // }
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.render(this.scene, this.camera);
  }
}
