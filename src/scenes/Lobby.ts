import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createWallWithDoorInCenter } from "../utils";
import { createLobbyBoundingBoxes } from "../core/Collision";

export class Lobby {
  static LobbyLength: number = 200;
  static LobbyWidth: number = 200;
  static CeilingHeight: number = 100;
  static DoorWidth: number = 19;
  static DoorHeight: number = 45;
  static WallPanelWidth: number = 100;
  static WallThickness: number = 2;
  static DoorPositions = [
    { x: Lobby.LobbyLength / 2 - 3, z: -50, rotation: -Math.PI / 2 },
    { x: -Lobby.LobbyLength / 2 + 3, z: -50, rotation: Math.PI / 2 },
    { x: Lobby.LobbyLength / 2 - 3, z: 50, rotation: -Math.PI / 2 },
    { x: -Lobby.LobbyLength / 2 + 3, z: 50, rotation: Math.PI / 2 },
  ];
  static doorGaps = {
    left: { zStart: -Lobby.LobbyLength / 2 + 40, zEnd: -Lobby.LobbyLength / 2 + 60 },
    right: { zStart: -Lobby.LobbyLength / 2 + 140, zEnd: -Lobby.LobbyLength / 2 + 160 }
  };


  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private doors: THREE.Object3D[] = [];
  private walls: THREE.Mesh[] = [];
  private loader: GLTFLoader;
  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera;
  public lobbyGroup: THREE.Group;

  public boundingBoxes: { box: THREE.Box3, object?: THREE.Object3D, pos?: string }[] = [];


  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera
  ) {
    this.scene = scene;
    this.renderer = renderer;
    this.loader = new GLTFLoader();
    this.raycaster = new THREE.Raycaster();
    this.camera = camera;
    this.lobbyGroup = new THREE.Group();
    this.init();
  }

  private async init() {
    await this.initFloor();
    await this.initWalls(
      Lobby.WallPanelWidth,
      Lobby.LobbyLength,
      Lobby.CeilingHeight,
      Lobby.DoorWidth,
      Lobby.DoorHeight,
      { left: [-50, 50], right: [-50, 50] }
    );
    this.initCeiling();
    await this.initLights();
    // await this.initDoors();
    createLobbyBoundingBoxes(this);
    this.onAssetsLoaded();
  }

  private onAssetsLoaded() {
    console.log("Lobby Loaded!!")
    // Additional initialization that depends on assets being loaded can go here
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

  private loadTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        path,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }

  private async initFloor(): Promise<void> {
    const floorGeometry = new THREE.PlaneGeometry(
      Lobby.LobbyLength,
      Lobby.LobbyWidth
    );

    return new Promise<void>((resolve) => {
      Promise.all([
        this.loadTexture("/textures/lobby/Fabric029_1K-JPG_Color.jpg"),
        this.loadTexture("/textures/lobby/Fabric029_1K-JPG_NormalGL.jpg"),
        this.loadTexture("/textures/lobby/Fabric029_1K-JPG_Roughness.jpg"),
      ]).then(([colorMap, normalMap, roughnessMap]) => {
        [colorMap, normalMap, roughnessMap].forEach((map) => {
          map.wrapS = map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(20, 20);
        });

        const floorMaterial = new THREE.MeshStandardMaterial({
          map: colorMap,
          normalMap: normalMap,
          roughnessMap: roughnessMap,
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = false;
        this.lobbyGroup.add(floor);
        resolve();
      });
    });
  }

  private initCeiling(): void {
    const ceilingGeometry = new THREE.PlaneGeometry(
      Lobby.LobbyLength,
      Lobby.LobbyWidth
    );
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, Lobby.CeilingHeight, 0);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = false;
    this.lobbyGroup.add(ceiling);
  }

  private async initLights(): Promise<void> {
    const loadTorches = new Promise<void>((resolve) => {
      this.loader.load("/models/lobby/torch_stick.glb", (gltf) => {
        const torchModel = gltf.scene;
        torchModel.name = "TorchLight";
        torchModel.scale.set(30, 30, 30);

        const torchPositions = [
          { x: Lobby.LobbyLength / 2 - 5, y: 0, z: Lobby.LobbyWidth / 2 - 7 },
          { x: -Lobby.LobbyLength / 2 + 5, y: 0, z: Lobby.LobbyWidth / 2 - 7 },
          { x: Lobby.LobbyLength / 2 - 5, y: 0, z: -Lobby.LobbyWidth / 2 + 7 },
          { x: -Lobby.LobbyLength / 2 + 5, y: 0, z: -Lobby.LobbyWidth / 2 + 7 },
        ];

        torchPositions.forEach((pos) => {
          const torch = torchModel.clone();
          torch.position.set(pos.x, pos.y, pos.z);
          this.scene.add(torch);

          const flamePosition = new THREE.Vector3(pos.x, pos.y + 43.5, pos.z);
          const light = new THREE.PointLight(0xffa500, 500, 40);
          light.position.copy(flamePosition);
          light.castShadow = false;
          this.lobbyGroup.add(light);
        });
        resolve();
      });
    });

    const loadWallLamps = new Promise<void>((resolve) => {
      this.loader.load("/models/lobby/low_poly_psx_wall_lamp.glb", (gltf) => {
        const model = gltf.scene;
        model.name = "WallLamp";
        model.scale.set(30, 30, 30);

        const lampPositions = [
          {
            x: 0,
            y: (2 * Lobby.CeilingHeight) / 3,
            z: -Lobby.LobbyWidth / 2 + 7,
            rotation: 0,
          }, // Back Wall
          {
            x: 0,
            y: (2 * Lobby.CeilingHeight) / 3,
            z: Lobby.LobbyWidth / 2 - 7,
            rotation: Math.PI,
          }, // Front Wall
          {
            x: -Lobby.LobbyLength / 2 + 7,
            y: (2 * Lobby.CeilingHeight) / 3,
            z: 0,
            rotation: Math.PI / 2,
          }, // Left Wall
          {
            x: Lobby.LobbyLength / 2 - 7,
            y: (2 * Lobby.CeilingHeight) / 3,
            z: 0,
            rotation: -Math.PI / 2,
          }, // Right Wall
        ];

        lampPositions.forEach((pos) => {
          const lamp = model.clone();
          lamp.position.set(pos.x, pos.y, pos.z);
          lamp.rotation.y = pos.rotation;

          const light = new THREE.PointLight(0xffa500, 500, 80);
          light.position.set(pos.x, pos.y, pos.z);
          light.castShadow = false;
          light.shadow.mapSize.set(1024, 1024);
          light.shadow.bias = -0.005;

          this.lobbyGroup.add(light);
          this.lobbyGroup.add(lamp);
        });
        resolve();
      });
    });

    await Promise.all([loadTorches, loadWallLamps]);
  }

  private async initWalls(
    WallSegmentWidth: number,
    wallWidth: number,
    wallHeight: number,
    doorWidth: number,
    doorHeight: number,
    doorPositions: { left: number[]; right: number[] }
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      Promise.all([
        this.loadTexture("/textures/lobby/Ground078_1K-JPG_Color.jpg"),
        this.loadTexture("/textures/lobby/Ground078_1K-JPG_NormalGL.jpg"),
        this.loadTexture("/textures/lobby/Ground078_1K-JPG_Roughness.jpg"),
      ]).then(([brickColor, brickNormal, brickRoughness]) => {
        [brickColor, brickNormal, brickRoughness].forEach((map) => {
          map.wrapS = map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(8, 4);
        });
        const wallMaterial = new THREE.MeshStandardMaterial({
          map: brickColor,
          normalMap: brickNormal,
          roughnessMap: brickRoughness,
          side: THREE.DoubleSide,
        });
        // Create walls without doors (front and back)
        const frontWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, Lobby.WallThickness);
        const backWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, Lobby.WallThickness);

        // Position them
        frontWallGeometry.applyMatrix4(
          new THREE.Matrix4().makeTranslation(
            0,
            wallHeight / 2,
            -Lobby.LobbyWidth / 2
          )
        );
        backWallGeometry.applyMatrix4(
          new THREE.Matrix4().makeTranslation(
            0,
            wallHeight / 2,
            Lobby.LobbyWidth / 2
          )
        );

        // Create left and right walls with doors
        const leftWallGeometries: THREE.BufferGeometry[] = [];
        const rightWallGeometries: THREE.BufferGeometry[] = [];

        for (const pos of doorPositions.left) {
          leftWallGeometries.push(
            createWallWithDoorInCenter(
              WallSegmentWidth,
              wallHeight,
              doorWidth,
              doorHeight
            ).applyMatrix4(
              new THREE.Matrix4().makeTranslation(pos, 0, -Lobby.LobbyLength / 2)
            )
          );
        }

        for (const pos of doorPositions.right) {
          rightWallGeometries.push(
            createWallWithDoorInCenter(
              WallSegmentWidth,
              wallHeight,
              doorWidth,
              doorHeight
            ).applyMatrix4(
              new THREE.Matrix4().makeTranslation(pos, 0, Lobby.LobbyLength / 2)
            )
          );
        }

        // Merge left and right walls
        const leftWallGeometry = mergeGeometries(leftWallGeometries);
        leftWallGeometry.applyMatrix4(
          new THREE.Matrix4().makeRotationY(Math.PI / 2)
        );
        const rightWallGeometry = mergeGeometries(rightWallGeometries);
        rightWallGeometry.applyMatrix4(
          new THREE.Matrix4().makeRotationY(Math.PI / 2)
        );

        // Create meshes
        const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        leftWall.name = "doorWall";
        rightWall.name = "doorWall";
        // Add walls to the scene
        this.lobbyGroup.add(frontWall, backWall, leftWall, rightWall);
        this.walls.push(frontWall, backWall, leftWall, rightWall);
        resolve();
      });
    });
  }

  private async initDoors(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.loader.load("/models/lobby/doors.glb", (gltf) => {
        const door = gltf.scene;
        console.log("the glb file for door is ", door);
        door.name = "Door";
        door.scale.set(0.6, 0.6, 0.6);

        Lobby.DoorPositions.forEach(({ x, z, rotation }) => {
          const newDoor = door.clone();
          newDoor.position.set(x, 0, z);
          if (rotation) newDoor.rotation.y = rotation;
          this.lobbyGroup.add(newDoor);
          this.doors.push(newDoor);
        });
        resolve();
      });
    });
  }
}

