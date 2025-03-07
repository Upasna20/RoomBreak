import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class Lobby {
  static LobbyLength: number = 15.3;
  static LobbyWidth: number = 15.3;
  static CeilingHeight: number = 6.6;
  static WallThickness: number = 0.163;


  private scene: THREE.Scene;
  public lobbyGroup: THREE.Group;

  public boundingBoxes: THREE.Box3[] = [];
  lobbyReady: Promise<void>;
  protected loader = new GLTFLoader();


  constructor(
    scene: THREE.Scene
  ) {
    this.scene = scene;
    this.lobbyGroup = new THREE.Group();
    this.lobbyReady = this.init();

  }


  private async init() {
    //needs to be written after loadmodels is written.
  }

  private attachLightToCamera(camera: THREE.PerspectiveCamera): void {
    const cameraLight = new THREE.PointLight(0xffffff, 5, 500); // Bright white light
    cameraLight.position.set(0, 0, 0); // Start at the camera's position

    // Create a group to hold both the camera and the light
    const cameraGroup = new THREE.Group();
    cameraGroup.add(camera);
    cameraGroup.add(cameraLight);

    this.scene.add(cameraGroup);

    // Update the light's position to follow the camera
    const updateLight = () => {
      cameraLight.position.copy(camera.position);
    };

    // Add this update function to your render loop
    const animate = () => {
      updateLight();
      requestAnimationFrame(animate);
    };
    animate();
  }

  private addOutsideLight(): void {
    const outsideLight = new THREE.DirectionalLight(0xffa500, 2); // Bright white light
    outsideLight.position.set(
      0,
      Lobby.CeilingHeight * 2,
      -Lobby.LobbyWidth * 1.5
    ); // Position far outside the back wall
    outsideLight.target.position.set(0, Lobby.CeilingHeight / 2, 0); // Aim towards the center of the lobby
    outsideLight.castShadow = false;

    // Optional: Adjust shadow properties for better visibility
    outsideLight.shadow.mapSize.set(2048, 2048);
    outsideLight.shadow.camera.near = 1;
    outsideLight.shadow.camera.far = 500;
    outsideLight.shadow.camera.left = -Lobby.LobbyLength;
    outsideLight.shadow.camera.right = Lobby.LobbyLength;
    outsideLight.shadow.camera.top = Lobby.CeilingHeight * 2;
    outsideLight.shadow.camera.bottom = -Lobby.CeilingHeight * 2;

    this.scene.add(outsideLight);
    this.scene.add(outsideLight.target);
  }

  // private async initLights(): Promise<void> {
  //   const loadTorches = new Promise<void>((resolve) => {
  //     this.loader.load("/models/lobby/torch_stick.glb", (gltf) => {
  //       const torchModel = gltf.scene;
  //       torchModel.name = "TorchLight";
  //       torchModel.scale.set(2.3, 2.3, 2.3);

  //       const torchPositions = [
  //         { x: Lobby.LobbyLength / 2 - 0.9, y: 0, z: Lobby.LobbyWidth / 2 - 0.9 },
  //         { x: -Lobby.LobbyLength / 2 + 0.9, y: 0, z: Lobby.LobbyWidth / 2 + 0.9},
  //         { x: Lobby.LobbyLength / 2 - 0.9, y: 0, z: -Lobby.LobbyWidth / 2  - 0.9},
  //         { x: -Lobby.LobbyLength / 2 + 0.9, y: 0, z: -Lobby.LobbyWidth / 2 + 0.9},
  //       ];

  //       torchPositions.forEach((pos) => {
  //         const torch = torchModel.clone();
  //         torch.position.set(pos.x, pos.y, pos.z);
  //         this.scene.add(torch);

  //         const flamePosition = new THREE.Vector3(pos.x, pos.y + 2, pos.z);
  //         const light = new THREE.PointLight(0xffa500, 500, 40);
  //         light.position.copy(flamePosition);
  //         light.castShadow = false;
  //         this.lobbyGroup.add(light);
  //       });
  //       resolve();
  //     });
  //   });

  //   const loadWallLamps = new Promise<void>((resolve) => {
  //     this.loader.load("/models/lobby/low_poly_psx_wall_lamp.glb", (gltf) => {
  //       const model = gltf.scene;
  //       model.name = "WallLamp";
  //       model.scale.set(2.3, 2.3, 2.3);

  //       const lampPositions = [
  //         {
  //           x: 0,
  //           y: (2 * Lobby.CeilingHeight) / 3,
  //           z: -Lobby.LobbyWidth / 2 + 7,
  //           rotation: 0,
  //         }, // Back Wall
  //         {
  //           x: 0,
  //           y: (2 * Lobby.CeilingHeight) / 3,
  //           z: Lobby.LobbyWidth / 2 - 7,
  //           rotation: Math.PI,
  //         }, // Front Wall
  //         {
  //           x: -Lobby.LobbyLength / 2 + 7,
  //           y: (2 * Lobby.CeilingHeight) / 3,
  //           z: 0,
  //           rotation: Math.PI / 2,
  //         }, // Left Wall
  //         {
  //           x: Lobby.LobbyLength / 2 - 7,
  //           y: (2 * Lobby.CeilingHeight) / 3,
  //           z: 0,
  //           rotation: -Math.PI / 2,
  //         }, // Right Wall
  //       ];

  //       lampPositions.forEach((pos) => {
  //         const lamp = model.clone();
  //         lamp.position.set(pos.x, pos.y, pos.z);
  //         lamp.rotation.y = pos.rotation;

  //         const light = new THREE.PointLight(0xffa500, 500, 80);
  //         light.position.set(pos.x, pos.y, pos.z);
  //         light.castShadow = false;
  //         light.shadow.mapSize.set(1024, 1024);
  //         light.shadow.bias = -0.005;

  //         this.lobbyGroup.add(light);
  //         this.lobbyGroup.add(lamp);
  //       });
  //       resolve();
  //     });
  //   });

  //   await Promise.all([loadTorches, loadWallLamps]);
  // }

}

