
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { createWallWithDoorInRightCorner} from "../../utils";

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

    private async init() {
        await this.loadEnvironment();
        this.initRoom();
        this.initCeiling();
        await this.loadModels();
        this.onAssetsLoaded();
    }

    private async loadEnvironment() {
        // const texture = await new RGBELoader().loadAsync("img/venice_sunset_1k.hdr");
        // texture.mapping = THREE.EquirectangularReflectionMapping;
        // this.scene.environment = texture;
        this.scene.environmentIntensity = 0.5;
    }

    private initRoom() {
        const roomMaterial = new THREE.MeshStandardMaterial({
            color: 0xBA8E23,
            roughness: 0.7,
            metalness: 0.1,
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
    }

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
            { path: "models/musicRoom/marimba.glb", scale: [10, 10, 10], position: [-80, 10, -50], rotation: [0, 3 * Math.PI / 4, 0], name: "marimba" },
            { path: "models/musicRoom/harmonium.glb", scale: [1.8, 1.8, 1.8], position: [-80, 0, 50], rotation: [0, Math.PI / 2, 0], name: "harmonium" },
            { path: "models/musicRoom/guitar.glb", scale: [6, 6, 6], position: [-50, 40, 96], rotation: [-Math.PI / 2, Math.PI, Math.PI / 2], name: "guitar2" },
            { path: "models/musicRoom/guitar_hero_guitar.glb", scale: [6, 6, 6], position: [-20, 40, 90], rotation: [0, Math.PI, 0], name: "guitar_hero" },
            { path: "models/musicRoom/drum.glb", scale: [30, 30, 30], position: [5, 0, 30], rotation: [0, 0, 0], name: "drum" },
            // { path: "models/musicRoom/electronic_drum_set.glb", scale: [40, 40, 40], position: [60, 0, 60], rotation: [0, 0, 0], name: "electronic_drum" },
            { path: "models/musicRoom/krishna.glb", scale: [20, 20, 20], position: [-66, -10, -66], rotation: [0, 0, 0], name: "krishna" },
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

    private onAssetsLoaded() {
        console.log("All assets loaded!");
    }
}
