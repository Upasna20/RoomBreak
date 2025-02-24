import * as THREE from "three";
// import { Player } from "./Player.ts";
import { GameControls } from "./Controls.ts";
import { Lobby } from "../scenes/Lobby.ts";
import { MusicRoom } from "../scenes/musicRoom/musicRoom.ts";
import { LiteraryRoom } from "../scenes/literaryRoom.ts";
// import { DirectionalLightHelper } from "three";

import { PainterRoom } from "../scenes/painterRoom/painterRoom.ts";
import { Player } from "./Player.ts";

export type Room = Lobby | MusicRoom | PainterRoom | LiteraryRoom;

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public controls: GameControls;
  private currentRoom: Lobby | MusicRoom| PainterRoom | LiteraryRoom;
  private rooms: Record<string, Room>;
  public player: Player;

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
    painterRoom.painterGroup.position.copy(new THREE.Vector3(202, 0, 140.5));

    this.currentRoom = lobby;

    this.setupLighting();
    this.scene.background = new THREE.Color(0x202020); // Dark gray
    // camera settings
    this.camera.position.set(0, 20, 0); // Higher up
    this.camera.lookAt(0, 2, -14); // Look at the floor

    this.loadScenes().then(() => {
      this.animate();
    });
  }

  private async loadScenes(): Promise<void> {
    const lobby = new Lobby(this.scene, this.renderer, this.camera);
    this.scene.add(lobby.lobbyGroup);
    
    const musicRoom = new MusicRoom(this.scene, this.renderer);
    this.scene.add(musicRoom.musicGroup);
    musicRoom.musicGroup.position.copy(new THREE.Vector3(-202, 0, 140.5));

    const painterRoom = new PainterRoom(this.scene, this.renderer);
    this.scene.add(painterRoom.painterGroup);
    painterRoom.painterGroup.position.copy(new THREE.Vector3(202, 0, 140.5));

    this.rooms = {
      "lobby": lobby,
      "musicRoom": musicRoom,
      "painterRoom": painterRoom,
    };

    this.currentRoom = lobby;
  }

  private static readonly LOBBY_BOUNDS = {
    minX: -100,
    maxX: 100,
    minZ: -100,
    maxZ: 100,
  };

  private static readonly ROOM_BOUNDS = [
    { minX: -300, maxX: -100, minZ: 50, maxZ: 236, room: "musicRoom" },
    { minX: 100, maxX: 300, minZ: 50, maxZ: 236, room: "painterRoom" },
    // { minX: 100, maxX: 200, minZ: 25, maxZ: 75, room: "MusicRoom" },
    // { minX: -200, maxX: -100, minZ: 25, maxZ: 75, room: "PainterRoom" },
  ];

  private updateCurrentRoom(): void {
    const { x, z } = this.player.object.position;

    if (
      x >= Game.LOBBY_BOUNDS.minX &&
      x <= Game.LOBBY_BOUNDS.maxX &&
      z >= Game.LOBBY_BOUNDS.minZ &&
      z <= Game.LOBBY_BOUNDS.maxZ
    ) {
      if (!(this.currentRoom instanceof Lobby)) {
        // console.log(`current list of boundingboxes: ${this.currentRoom.boundingBoxes} and length is ${this.currentRoom.boundingBoxes.length}`)
        this.currentRoom = this.rooms["lobby"] as Lobby;
      }
      return;
    }

    for (const bounds of Game.ROOM_BOUNDS) {
      // console.log(`Player's position(${x}, ${z})`);
      if (x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ) {
        if (this.currentRoom !== this.rooms[bounds.room]) {
          // console.log(`current list of boundingboxes: ${this.currentRoom.boundingBoxes} and length is ${this.currentRoom.boundingBoxes.length}`)
          this.currentRoom = this.rooms[bounds.room] as Room;
        }
        return;
      }
    }
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


  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.updateCurrentRoom();
    this.player.update(this.currentRoom);   // Updates player's position based on camera

    this.renderer.render(this.scene, this.camera);
  }
}
