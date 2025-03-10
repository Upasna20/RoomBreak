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
    this.player = new Player(this.camera);
    this.scene.add(this.player.object);
    this.mainGroup = new THREE.Group();
  


    // Initialize core components
    this.controls = new GameControls(this.camera, this.renderer.domElement);

    this.setupLighting();
    this.init();
  }

  private async init(){
    this.setupLighting();
    this.scene.background = new THREE.Color(0x202020); // Dark gray
    // camera settings
    this.camera.position.set(0, this.player.playerHeight, 0); // Higher up
    this.camera.lookAt(0, 5, 14); // Look at the floor

    await this.loadScenes();
    console.log("The rooms are");
    console.log(this.rooms["PainterRoom"]);

  }


  private async loadScenes(): Promise<void> {
    this.mainScene = new MainScene();
    await this.mainScene.ready;
    this.mainGroup.add(this.mainScene.mainSceneModel);
    this.scene.add(this.mainScene.mainSceneModel);
    console.log("Main Scene Model Loaded!");

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
      } 
      else if (x >= -20.602 && x <= -7.75 && z >= -15.086 && z <= -2.318) {
        currRoom = "GymRoom";
        this.currentRoom = this.rooms["gymRoom"];
      } 
      else if (x >= 7.8 && x <= 20.59 && z >= -15.119 && z <= -2.27) {
        currRoom = "LiteratureRoom";
        this.currentRoom = this.rooms["literatureRoom"];
      } 
      else if (x >= 7.7 && x <= 20.451 && z >= 2.4 && z <= 15.17) {
        currRoom = "MusicRoom";
        this.currentRoom = this.rooms["musicRoom"];
      } 
      else {
        currRoom = "lobby";
        this.currentRoom = this.rooms["lobby"]; // Player is in the lobby or an undefined area
      }
      console.log("Current room is ", currRoom);
      this.currRoom = currRoom;
  
    }
  



  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft global light
    this.scene.add(ambientLight);

    // const sunlight = new THREE.DirectionalLight(0xffffff, 5); // Increase intensity for more light
    // sunlight.position.set(-200, 200, -400); // Adjust position for better light direction
    // sunlight.target.position.set(-200, 0, -100); // Target the center of the room
    // sunlight.castShadow = true;
    
    // sunlight.shadow.camera.near = 0.1;
    // sunlight.shadow.camera.far = 500;
    // sunlight.shadow.camera.left = -200;
    // sunlight.shadow.camera.right = 200;
    // sunlight.shadow.camera.top = 200;
    // sunlight.shadow.camera.bottom = -200;
    
    // sunlight.shadow.mapSize.width = 4096;
    // sunlight.shadow.mapSize.height = 4096;
    // sunlight.shadow.bias = -0.0010;
    
    // this.scene.add(sunlight);
    // // Add light helper
    // const lightHelper = new THREE.DirectionalLightHelper(sunlight, 10);
    // this.scene.add(lightHelper);
  }


  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.updatePlayerRoom(this.player.object.position);
    this.player.update(this.mainScene, this.currentRoom);   // Updates player's position based on camera
    this.renderer.render(this.scene, this.camera);
  }
}

export const gameInstance = new Game(); // Singleton export