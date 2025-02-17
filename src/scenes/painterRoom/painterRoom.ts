import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { createWallWithDoorInRightCorner } from "../../utils";

export class PainterRoom{
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private clickableModels: THREE.Object3D[] = [];
    private loader = new GLTFLoader();
    public painterGroup: THREE.Group;
    static DoorWidth: number = 19;
    static DoorHeight: number = 45;
    static wallHeight: number = 100;
    static wallLength: number = 200;
    static ceilingHeight: number = 100;

    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.scene = scene;
        this.painterGroup = new THREE.Group();
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
        this.painterGroup.add(floor);
        const wallLength = PainterRoom.wallLength;
        const wallHeight = PainterRoom.wallHeight;

        const wallGeometry = new THREE.PlaneGeometry(wallLength, wallHeight);
        const wallPositions = [
            { x: 0, y: wallHeight / 2, z: -wallLength / 2 },
            { x: 0, y: wallHeight / 2, z: wallLength / 2 },
            { x: -wallLength / 2, y: wallHeight / 2, z: 0, rotation: Math.PI / 2 },
            { x: wallLength / 2, y: 0, z: 0, rotation: Math.PI / 2, scaleZ: 0.5 },
        ];

        wallPositions.forEach((pos) => {
            if (pos.scaleZ) {
                const wallGeometry = createWallWithDoorInRightCorner(wallLength, wallHeight, PainterRoom.DoorWidth, PainterRoom.DoorHeight);
                const wall = new THREE.Mesh(wallGeometry, roomMaterial);
                wall.position.set(pos.x, pos.y, pos.z);
                if (pos.rotation) wall.rotateY(pos.rotation);
                wall.castShadow = true;
                this.painterGroup.add(wall);
            }
            else {
                const wall = new THREE.Mesh(wallGeometry, roomMaterial);
                wall.position.set(pos.x, pos.y, pos.z);
                if (pos.rotation) wall.rotateY(pos.rotation);
                wall.castShadow = true;
                this.painterGroup.add(wall);
            }
        });
    })}

    private initCeiling(): void {
        const ceilingGeometry = new THREE.PlaneGeometry(
            PainterRoom.wallLength,
            PainterRoom.wallLength
        );
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.set(0, PainterRoom.ceilingHeight, 0);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.receiveShadow = false;
        this.painterGroup.add(ceiling);
    }
    
    private async loadModels() {
        const modelData = [
            { path: "models/painterRoom/electric_guitar_lowpoly_model.glb", scale: [6, 6, 6], position: [-20, 30, 100], rotation: [0, Math.PI, 3 * Math.PI / 8], name: "red_guitar" },
            { path: "models/painterRoom/table.glb",scale : [30,30,30],position: [80,0,80],name: "table"},
            { path: "models/painterRoom/my_desk.glb",scale : [32,32,32],position: [86,30,10],rotation : [0,3*Math.PI/2,0],name:"mydesk" },
            { path: "models/painterRoom/paintcan.glb",scale : [4,4,4],position: [40,0,0],rotation : [0,0,0],name:"paintcan" },
            { path: "models/painterRoom/colorspot.glb",scale : [2000,2000,2000],position: [40,0,0],name: "colorspot"},
            { path: "models/painterRoom/caterpillar.glb",scale : [80,80,80],position: [-90,48,90],name: "caterpillar"},
            { path: "models/painterRoom/Lantern.glb",scale : [2,2,2],position: [-90,0,90],name:"lantern" },
            { path: "models/painterRoom/canvas.glb",scale : [20,20,20],position: [-90,40,60],name:"canvas" },
            { path: "models/painterRoom/collage_wall.glb",scale : [80,80,80],position: [0,50,94],rotation : [-Math.PI/2,0,0],name:"collage_wall" },
            { path: "models/painterRoom/GlamVelvetSofa.glb",scale : [40,40,40],position: [0,0,80],rotation : [0,Math.PI,0],name:"glam_sofa" },
            { path: "models/painterRoom/colorpens.glb",scale : [80,80,80],position: [-40,6,20],rotation : [Math.PI,0,0],name:"colorpens" },
            { path: "models/painterRoom/markers.glb",scale : [6,6,6],position: [-40,6,20],rotation : [Math.PI/2,0,0],name:"markers" },
            { path: "models/painterRoom/papers.glb",scale : [0.2,0.2,0.2],position: [0,6,0],rotation : [3*Math.PI/2,0,0],name:"papers" },
            { path: "models/painterRoom/paintbrush.glb",scale : [80,80,80],position: [-40,6,40],rotation : [Math.PI/2,0,0],name: "paintbrush"},
            { path: "models/painterRoom/color palette.glb",scale : [2,2,2],position: [-20,8,0],rotation : [Math.PI/16,0,0],name: "color_palette"},
            { path: "models/painterRoom/pencilcase.glb",scale : [3,3,3],position: [60,26,80],rotation : [0,Math.PI,0],name:"pencilcase" },
            { path: "models/painterRoom/cup_with_pencils.glb",scale : [60,60,60],position: [66,26,76],rotation : [0,Math.PI,0],name: "cup_pencils"},
            { path: "models/painterRoom/pencil_case_model.glb",scale : [0.6,0.6,0.6],position: [60,26,60],rotation : [0,Math.PI,0],name: "pencil_cups" },
            { path: "models/painterRoom/old_key.glb",scale : [40, 40, 40],position: [60, 30, 80],rotation : [0,Math.PI/4,0],name:"old_key" },
            { path: "models/painterRoom/GlassBrokenWindow.glb",scale : [40, 40, 40],position: [60, 30, -90],name:"glass_window" },
            { path: "models/painterRoom/painting2.glb",scale : [6,6, 6],position: [-60, 60, -94],name: "painting2"},
            { path: "models/painterRoom/painting3.glb",scale : [0.2,0.2, 0.2],position: [-90, 60, 0],rotation : [0,Math.PI/2,0],name: "paintin3"},
            { path: "models/painterRoom/rainbow.glb",scale : [0.1,0.1, 0.1],position: [-140, 140, -40],rotation : [0,Math.PI/2,0],name: "rainbow"},
            { path: "models/painterRoom/painting.glb",scale : [20,20, 20],position: [-60, 0, 0],rotation : [0,Math.PI/4,0],name: "painting"},
            { path: "models/painterRoom/SheenWoodLeatherSofa.glb",scale : [40,40, 40],position: [-20, 0, -84],name: "sheenwood"},
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
                    this.painterGroup.add(model);
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
                  y: (2 * PainterRoom.ceilingHeight) / 3,
                  z: -PainterRoom.wallLength / 2,
                  rotation: 0,
                }, // Back Wall
                {
                  x: 0,
                  y: (2 * PainterRoom.ceilingHeight) / 3,
                  z: -PainterRoom.wallLength / 2,
                  rotation: Math.PI,
                }, // Front Wall
                {
                  x: -PainterRoom.wallLength / 2,
                  y: (2 * PainterRoom.ceilingHeight) / 3,
                  z: 0,
                  rotation: Math.PI / 2,
                }, // Left Wall
                {
                  x: PainterRoom.wallLength / 2,
                  y: (2 * PainterRoom.ceilingHeight) / 3,
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
        
                this.painterGroup.add(light);
                this.painterGroup.add(lamp);
              });
    })
    }
    


    private onAssetsLoaded() {
        console.log("All assets loaded!");
    }
}
