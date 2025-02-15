
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { createWallWithDoorInRightCorner } from "../../utils";

export class MusicRoom {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private clickableModels: THREE.Object3D[] = [];
    private loader = new GLTFLoader();
    public musicGroup: THREE.Group;
    static DoorWidth: number = 19;
    static DoorHeight: number = 45;
    static wallHeight: number = 100;
    static wallLength: number = 200;
    static ceilingHeight: number = 100;

    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.scene = scene;
        this.musicGroup = new THREE.Group();
        this.init();
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

    private async init() {
        await this.loadEnvironment();
        this.initCeiling();
        this.initLighting();
        await this.loadModels();
        this.onAssetsLoaded();
    }

    private async loadEnvironment() {
      this.initRoom()
    }

    private initRoom() {
        Promise.all([
              this.loadTexture("/textures/musicRoom/PaintedPlaster013_1K-JPG_Color.jpg"),
              this.loadTexture("/textures/musicRoom/PaintedPlaster013_1K-JPG_NormalGL.jpg"),
              this.loadTexture("/textures/musicRoom/PaintedPlaster013_1K-JPG_Roughness.jpg"),
            ]).then(([brickColor, brickNormal, brickRoughness]) => {
              [brickColor, brickNormal, brickRoughness].forEach((map) => {
                map.wrapS = map.wrapT = THREE.RepeatWrapping;
                map.repeat.set(8, 4);
              });
              const roomMaterial = new THREE.MeshStandardMaterial({
                map: brickColor,
                normalMap: brickNormal,
                roughnessMap: brickRoughness,
                side: THREE.DoubleSide,
              });

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), roomMaterial);
        floor.rotateX(-Math.PI / 2);
        floor.receiveShadow = true;
        this.musicGroup.add(floor);
        const wallLength = MusicRoom.wallLength;
        const wallHeight = MusicRoom.wallHeight;

        const wallGeometry = new THREE.PlaneGeometry(wallLength, wallHeight);
        const wallPositions = [
            { x: 0, y: wallHeight / 2, z: -wallLength / 2 },
            { x: 0, y: wallHeight / 2, z: wallLength / 2 },
            { x: -wallLength / 2, y: wallHeight / 2, z: 0, rotation: Math.PI / 2 },
            { x: wallLength / 2, y: 0, z: 0, rotation: Math.PI / 2, scaleZ: 0.5 },
        ];

        wallPositions.forEach((pos) => {
            if (pos.scaleZ) {
                const wallGeometry = createWallWithDoorInRightCorner(wallLength, wallHeight, MusicRoom.DoorWidth, MusicRoom.DoorHeight);
                const wall = new THREE.Mesh(wallGeometry, roomMaterial);
                wall.position.set(pos.x, pos.y, pos.z);
                if (pos.rotation) wall.rotateY(pos.rotation);
                wall.castShadow = true;
                this.musicGroup.add(wall);
            }
            else {
                const wall = new THREE.Mesh(wallGeometry, roomMaterial);
                wall.position.set(pos.x, pos.y, pos.z);
                if (pos.rotation) wall.rotateY(pos.rotation);
                wall.castShadow = true;
                this.musicGroup.add(wall);
            }
        });
    })}

    private initCeiling(): void {
        const ceilingGeometry = new THREE.PlaneGeometry(
            MusicRoom.wallLength,
            MusicRoom.wallLength
        );
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.set(0, MusicRoom.ceilingHeight, 0);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.receiveShadow = false;
        this.musicGroup.add(ceiling);
    }
    
    private async loadModels() {
        const modelData = [
            { path: "models/musicRoom/electric_guitar_lowpoly_model.glb", scale: [6, 6, 6], position: [-20, 30, 100], rotation: [0, Math.PI, 3 * Math.PI / 8], name: "red_guitar" },
            { path: "models/musicRoom/piano_ukraine.glb", scale: [20, 20, 20], position: [86, 0, 10], rotation: [0, 3 * Math.PI / 2, 0], name: "piano" },
            { path: "models/musicRoom/marimba.glb", scale: [7, 7, 7], position: [5, 10, 30], rotation: [0, 0, 0], name: "marimba" },
            { path: "models/musicRoom/harmonium.glb", scale: [1.8, 1.8, 1.8], position: [-80, 0, 50], rotation: [0, Math.PI / 2, 0], name: "harmonium" },
            { path: "models/musicRoom/guitar.glb", scale: [6, 6, 6], position: [-50, 40, 96], rotation: [-Math.PI / 2, Math.PI, Math.PI / 2], name: "guitar2" },
            { path: "models/musicRoom/guitar_hero_guitar.glb", scale: [6, 6, 6], position: [-20, 40, 90], rotation: [0, Math.PI, 0], name: "guitar_hero" },
            { path: "models/musicRoom/drum.glb", scale: [30, 30, 30], position: [-70, 0, -20], rotation: [0, 3 * Math.PI / 2, 0], name: "drum" },
            // { path: "models/musicRoom/electronic_drum_set.glb", scale: [40, 40, 40], position: [60, 0, 60], rotation: [0, 0, 0], name: "electronic_drum" },
            { path: "models/musicRoom/krishna.glb", scale: [20, 20, 20], position: [-66, -10, -66], rotation: [0, Math.PI / 2, 0], name: "krishna" },
            { path: "models/musicRoom/speaker.glb", scale: [0.12, 0.12, 0.12], position: [-70, 0, 80], rotation: [0, Math.PI, 0], name: "guitar_hero" },
        ];

        await Promise.all(
            modelData.map(async (data) => {
                try {
                    const gltf = await this.loader.loadAsync(data.path);
                    const model = gltf.scene;
                    model.scale.set(data.scale[0], data.scale[1], data.scale[2]);
                    model.position.set(data.position[0],
                        data.position[1],
                        data.position[2]);
                    if (data.rotation) model.rotation.set(data.rotation[0],
                        data.rotation[1],
                        data.rotation[2]);
                    model.name = data.name;
                    this.clickableModels.push(model);
                    this.musicGroup.add(model);
                } catch (error) {
                    console.error(`Error loading ${data.name}:`, error);
                }
            })
        );
    }

    private initLighting() {
        this.loader.load("/models/lobby/low_poly_psx_wall_lamp.glb", (gltf) => {
            const model = gltf.scene;
            model.scale.set(30, 30, 30);
        const lampPositions = [
                {
                  x: 0,
                  y: (2 * MusicRoom.ceilingHeight) / 3,
                  z: -MusicRoom.wallLength / 2,
                  rotation: 0,
                }, // Back Wall
                {
                  x: 0,
                  y: (2 * MusicRoom.ceilingHeight) / 3,
                  z: -MusicRoom.wallLength / 2,
                  rotation: Math.PI,
                }, // Front Wall
                {
                  x: -MusicRoom.wallLength / 2,
                  y: (2 * MusicRoom.ceilingHeight) / 3,
                  z: 0,
                  rotation: Math.PI / 2,
                }, // Left Wall
                {
                  x: MusicRoom.wallLength / 2,
                  y: (2 * MusicRoom.ceilingHeight) / 3,
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
        
                this.musicGroup.add(light);
                this.musicGroup.add(lamp);
              });
    })
    }
    


    private onAssetsLoaded() {
        console.log("All assets loaded!");
    }
}
