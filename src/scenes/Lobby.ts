import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Lobby {
  static LobbyLength: number = 200;
  static LobbyWidth: number = 200;
  static CeilingHeight: number = 100;

  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private doors: THREE.Object3D[] = [];
  private walls: THREE.Mesh[] = [];
  private loader: GLTFLoader;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.loader = new GLTFLoader();

    this.initFloor();
    this.initWalls();
    this.initCeiling();
    this.initLights();
    this.initDoors();
  }

  getWalls(): THREE.Mesh[] {
    return this.walls;
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

  private initFloor(): void {
    const floorGeometry = new THREE.PlaneGeometry(Lobby.LobbyLength, Lobby.LobbyWidth);
    
    Promise.all([
      this.loadTexture("/textures/Fabric029_1K-JPG_Color.jpg"),
      this.loadTexture("/textures/Fabric029_1K-JPG_NormalGL.jpg"),
      this.loadTexture("/textures/Fabric029_1K-JPG_Roughness.jpg"),
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
      floor.receiveShadow = true;
      this.scene.add(floor);
    });
  }

  private initWalls(): void {
    const wallGeometry = new THREE.PlaneGeometry(Lobby.LobbyWidth, Lobby.CeilingHeight);
    
    Promise.all([
      this.loadTexture("/textures/Ground078_1K-JPG_Color.jpg"),
      this.loadTexture("/textures/Ground078_1K-JPG_NormalGL.jpg"),
      this.loadTexture("/textures/Ground078_1K-JPG_Roughness.jpg"),
    ]).then(([brickColor, brickNormal, brickRoughness]) => {
      [brickColor, brickNormal, brickRoughness].forEach((map) => {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(8, 4);
      });

      const wallMaterial = new THREE.MeshStandardMaterial({
        map: brickColor,
        normalMap: brickNormal,
        roughnessMap: brickRoughness,
      });

      const positions = [
        { x: 0, y: Lobby.CeilingHeight / 2, z: -Lobby.LobbyWidth / 2, rotation: 0 },
        { x: 0, y: Lobby.CeilingHeight / 2, z: Lobby.LobbyWidth / 2, rotation: Math.PI },
        { x: -Lobby.LobbyLength / 2, y: Lobby.CeilingHeight / 2, z: 0, rotation: Math.PI / 2 },
        { x: Lobby.LobbyLength / 2, y: Lobby.CeilingHeight / 2, z: 0, rotation: -Math.PI / 2 },
      ];

      positions.forEach(({ x, y, z, rotation }) => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y, z);
        wall.rotation.y = rotation;
        wall.receiveShadow = true;
        wall.castShadow = true;
        this.scene.add(wall);
        this.walls.push(wall);
      });
    });
  }

  private initCeiling(): void {
    const ceilingGeometry = new THREE.PlaneGeometry(Lobby.LobbyLength, Lobby.LobbyWidth);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, Lobby.CeilingHeight, 0);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    this.scene.add(ceiling);
  }

  private initLights(): void {
    this.loader.load("/models/torch_stick.glb", (gltf) => {
      const torchModel = gltf.scene;
      torchModel.scale.set(30, 30, 30);

      const torchPositions = [
        { x: Lobby.LobbyLength / 2 - 5, y: 0, z: Lobby.LobbyWidth / 2 - 5 },
        { x: -Lobby.LobbyLength / 2 + 5, y: 0, z: Lobby.LobbyWidth / 2 - 5 },
        { x: Lobby.LobbyLength / 2 - 5, y: 0, z: -Lobby.LobbyWidth / 2 + 5 },
        { x: -Lobby.LobbyLength / 2 + 5, y: 0, z: -Lobby.LobbyWidth / 2 + 5 },
      ];

      torchPositions.forEach((pos) => {
        const torch = torchModel.clone();
        torch.position.set(pos.x, pos.y, pos.z);
        this.scene.add(torch);

        const flamePosition = new THREE.Vector3(pos.x, pos.y + 43.5, pos.z);
        const light = new THREE.PointLight(0xffa500, 500, 40);
        light.position.copy(flamePosition);
        light.castShadow = true;
        this.scene.add(light);
      });
    });
    // Load and place wall lamps (unchanged)
    this.loader.load("/models/low_poly_psx_wall_lamp.glb", (gltf) => {
        const model = gltf.scene;
        model.scale.set(30, 30, 30);

        const lampPositions = [
            { x: 0, y: 2 * Lobby.CeilingHeight / 3, z: -Lobby.LobbyWidth / 2, rotation: 0 },   // Back Wall
            { x: 0, y: 2 * Lobby.CeilingHeight / 3, z: Lobby.LobbyWidth / 2, rotation: Math.PI },  // Front Wall
            { x: -Lobby.LobbyLength / 2, y: 2 * Lobby.CeilingHeight / 3, z: 0, rotation: Math.PI / 2 }, // Left Wall
            { x: Lobby.LobbyLength / 2, y: 2 * Lobby.CeilingHeight / 3, z: 0, rotation: -Math.PI / 2 }, // Right Wall
        ];

        lampPositions.forEach((pos) => {
            const lamp = model.clone();
            lamp.position.set(pos.x, pos.y, pos.z);
            lamp.rotation.y = pos.rotation;

            const light = new THREE.PointLight(0xffa500, 500, 40);
            light.position.set(pos.x, pos.y, pos.z);
            light.castShadow = true;
            light.shadow.mapSize.set(1024, 1024);
            light.shadow.bias = -0.005;

            this.scene.add(lamp);
            this.scene.add(light);
        });
    });
  }

  private initDoors(): void {
    this.loader.load("/models/medieval_door.glb", (gltf) => {
      const door = gltf.scene;
      door.scale.set(0.06, 0.06, 0.06);

      const doorPositions = [
        { x: Lobby.LobbyLength / 3, z: -Lobby.LobbyWidth / 2 + 3 },
        { x: -Lobby.LobbyLength / 3, z: -Lobby.LobbyWidth / 2 + 3 },
        { x: Lobby.LobbyLength / 3, z: Lobby.LobbyWidth / 2 - 3, rotation: Math.PI },
        { x: -Lobby.LobbyLength / 3, z: Lobby.LobbyWidth / 2 - 3, rotation: Math.PI },
      ];

      doorPositions.forEach(({ x, z, rotation }) => {
        const newDoor = door.clone();
        newDoor.position.set(x, 0, z);
        if (rotation) newDoor.rotation.y = rotation;
        this.scene.add(newDoor);
        this.doors.push(newDoor);
      });
    });
  }
}
