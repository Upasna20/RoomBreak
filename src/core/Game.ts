import * as THREE from "three";
import { GameControls } from "./Controls.ts";
import { MainScene } from "../scenes/mainScene.ts";
import { Player } from "./Player.ts";
import { Lobby } from "../scenes/Lobby.ts";
import { MusicRoom } from "../scenes/musicRoom/musicRoom.ts";
import { PainterRoom } from "../scenes/painterRoom/painterRoom.ts";
import { LiteratureRoom } from "../scenes/literatureRoom.ts";

export type Room = Lobby | MusicRoom | PainterRoom | LiteratureRoom;

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public controls: GameControls;
  private currentRoom!: Room;
  private rooms!: Record<string, Room>;
  public player: Player;
  public mainScene!: MainScene;
  public mainGroup: THREE.Group;
  public currRoom!: string;
  public raycaster = new THREE.Raycaster();
  private crosshair!: HTMLDivElement;
  private crosshairEnabled: boolean = false;
  private raycastingEnabled: boolean = false;

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
    this.player = new Player(this.camera);
    this.scene.add(this.player.object);
    this.mainGroup = new THREE.Group();

    // Initialize core components
    this.controls = new GameControls(this.camera, this.renderer.domElement);
  }

  public async init() {
    document.body.appendChild(this.renderer.domElement);
    // this.renderer.setSize(window.innerWidth, 680); // Or 1854 based on condition

    this.setupLighting();
    this.setupCrosshair();
    this.scene.background = new THREE.Color(0x202020);
    this.camera.position.set(0, this.player.playerHeight, 0);
    this.camera.lookAt(0, 5, 14);

    await this.loadScenes();
    this.setupEventListeners();
  }

  /** Sets up the crosshair UI */
  private setupCrosshair() {
    this.crosshair = document.createElement("div");
    this.crosshair.style.position = "fixed";
    this.crosshair.style.top = "50%";
    this.crosshair.style.left = "50%";
    this.crosshair.style.width = "10px";
    this.crosshair.style.height = "10px";
    this.crosshair.style.background = "red";
    this.crosshair.style.borderRadius = "50%";
    this.crosshair.style.transform = "translate(-50%, -50%)";
    this.crosshair.style.display = "none";
    document.body.appendChild(this.crosshair);
  }

  /** Adds key/mouse event listeners */
  private setupEventListeners() {
    window.addEventListener("blur", () => console.log("Window blurred"));
    window.addEventListener("focus", () => console.log("Window focused"));
    document.addEventListener("keydown", (event) => {
      event.preventDefault();
      console.log(`Key pressed: ${event.key}`);

      if (event.key.toLowerCase() === "c") {
        this.raycastingEnabled = true;
        console.log(`Raycasting enabled`);
        if (this.crosshairEnabled)  this.handleRaycast();
      }

      if (event.key.toLowerCase() === "e") {
        this.crosshairEnabled = !this.crosshairEnabled;
        this.crosshair.style.display = this.crosshairEnabled ? "block" : "none";
      }
    });

    document.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.key.toLowerCase() === "c"){
        this.raycastingEnabled = false;
      }
    })
  }

  /** Handles raycasting when clicking */
  private handleRaycast() {
    if (!this.raycastingEnabled || !this.currentRoom) return;

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    for (const prop of this.currentRoom.boundingBoxes) {
      const intersectionDistance = this.raycaster.ray.intersectsBox(prop.box);
      if (intersectionDistance) {
        alert(`Prop clicked: ${prop.object.name}`);
      }
    }
  }

  private async loadScenes(): Promise<void> {
    this.mainScene = new MainScene();
    await this.mainScene.ready;
    this.mainGroup.add(this.mainScene.mainSceneModel);
    this.scene.add(this.mainScene.mainSceneModel);

    const roomClasses = [
      { key: "lobby", class: Lobby },
      { key: "musicRoom", class: MusicRoom },
      { key: "painterRoom", class: PainterRoom },
      { key: "literatureRoom", class: LiteratureRoom },
    ];

    this.rooms = {};

    await Promise.all(roomClasses.map(async ({ key, class: RoomClass }) => {
      const room: Room = new RoomClass(this.scene, this.renderer);
      await (room as any)[`${key}Ready`];
      this.rooms[key] = room;
    }));

    this.animate();
  }

  private updatePlayerRoom(playerPosition: THREE.Vector3) {
    const { x, z } = playerPosition;
    let currRoom: string = "lobby";

    if (x >= -20.592 && x <= -7.8 && z >= 2.27 && z <= 15.119) {
      currRoom = "PainterRoom";
      this.currentRoom = this.rooms["painterRoom"];
    } else if (x >= -20.602 && x <= -7.75 && z >= -15.086 && z <= -2.318) {
      currRoom = "GymRoom";
      this.currentRoom = this.rooms["gymRoom"];
    } else if (x >= 7.8 && x <= 20.59 && z >= -15.119 && z <= -2.27) {
      currRoom = "LiteratureRoom";
      this.currentRoom = this.rooms["literatureRoom"];
    } else if (x >= 7.7 && x <= 20.451 && z >= 2.4 && z <= 15.17) {
      currRoom = "MusicRoom";
      this.currentRoom = this.rooms["musicRoom"];
    } else {
      currRoom = "lobby";
      this.currentRoom = this.rooms["lobby"];
    }
    console.log("Current room is ", currRoom);
    this.currRoom = currRoom;
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.updatePlayerRoom(this.player.object.position);
    this.player.update(this.mainScene, this.currentRoom);
    this.renderer.render(this.scene, this.camera);
  }
}

export const gameInstance = new Game();
