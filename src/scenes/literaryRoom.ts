
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

export class LiteraryRoom {
    public literaryGroup: THREE.Group;
    private roomWidth: number;
    private roomHeight: number;
    private roomDepth: number;

    constructor() {
        this.literaryGroup = new THREE.Group();
        this.roomWidth = 200;
        this.roomHeight = 100;
        this.roomDepth = 200;
        this.createRoom();
        this.addAmbientLight();
        this.loadBookshelf(new THREE.Vector3(0, 0, -85));
        this.loadBookshelf1(new THREE.Vector3(-90, 0, -60));
        this.loadDesk(new THREE.Vector3(-90, 20, 0));
        // this.addSunlight();
        this.addWindows();
    }

    private createRoomMaterial() {
        return {
            front: new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8, metalness: 0.05 }),
            back: new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8, metalness: 0.05 }),
            left: new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8, metalness: 0.05 }),
            right: new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8, metalness: 0.05 }),
            floor: new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.8, metalness: 0.05 }),
            roof: new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.8, metalness: 0.05 })
        };
    }

    private createRoom() {
        const roomMaterial = this.createRoomMaterial();

        const floor = this.createPlane(roomMaterial.floor, false);
        const roof = this.createPlane(roomMaterial.roof, true, this.roomHeight);
        this.literaryGroup.add(floor);
        this.literaryGroup.add(roof);

        this.addWall(new THREE.Vector3(0, this.roomHeight / 2, -this.roomDepth / 2), roomMaterial.front, false, this.roomWidth, this.roomHeight);
        this.addWall(new THREE.Vector3(0, this.roomHeight / 2, this.roomDepth / 2), roomMaterial.back, false, this.roomWidth, this.roomHeight);
        this.addWall(new THREE.Vector3(-this.roomWidth / 2, this.roomHeight / 2, 0), roomMaterial.left, true, this.roomDepth, this.roomHeight);
        this.addWallWithWindows(roomMaterial.right, this.roomWidth, this.roomHeight, this.roomDepth, true);
    }

    private createPlane(material: THREE.Material, isRoof: boolean, roomHeight: number = 100) {
        const planeGeometry = new THREE.PlaneGeometry(200, 200);
        const plane = new THREE.Mesh(planeGeometry, material);
        plane.rotateX(isRoof ? Math.PI / 2 : -Math.PI / 2);
        plane.position.y = isRoof ? roomHeight : 0;
        plane.receiveShadow = true;
        plane.castShadow = true;
        return plane;
    }

    private addWall(position: THREE.Vector3, material: THREE.Material, rotateY: boolean = false, width: number = 10, height: number = 8) {
        const wallGeometry = new THREE.BoxGeometry(width, height, 0.1);
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.copy(position);
        if (rotateY) {
            wall.rotateY(Math.PI / 2);
        }
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.literaryGroup.add(wall);
    }

    private addWallWithWindows(material: THREE.Material, roomWidth: number, roomHeight: number, roomDepth: number, rotateY: boolean) {
        const wallGeometry = new THREE.BoxGeometry(roomDepth, roomHeight, 0.5); // Adjust width, height, and depth as needed
        const wallBrush = new Brush(wallGeometry, material);
        wallBrush.position.set(roomWidth / 2, roomHeight / 2, 0);
        if (rotateY) {
            wallBrush.rotateY(Math.PI / 2);
        }
        wallBrush.updateMatrixWorld();

        const windowPositions = [
            new THREE.Vector3(roomWidth / 2, roomHeight / 2, -50),
            new THREE.Vector3(roomWidth / 2, roomHeight / 2, 0),
            new THREE.Vector3(roomWidth / 2, roomHeight / 2, 50),
        ];

        const evaluator = new Evaluator();
        let currentWallBrush = wallBrush;

        windowPositions.forEach((windowPosition) => {
            const windowGeometry = new THREE.BoxGeometry(32, 55, 0.6);
            const windowBrush = new Brush(windowGeometry);
            windowBrush.position.set(windowPosition.x, windowPosition.y, windowPosition.z);
            if (rotateY) {
                windowBrush.rotateY(Math.PI / 2);
            }
            windowBrush.updateMatrixWorld();
            currentWallBrush = evaluator.evaluate(currentWallBrush, windowBrush, SUBTRACTION);
        });

        const resultMesh = new THREE.Mesh(currentWallBrush.geometry, material);
        resultMesh.castShadow = true;
        resultMesh.receiveShadow = true;
        this.literaryGroup.add(resultMesh);
    }

    private addWindows() {
        const rightWallX = this.roomWidth / 2;
        const windowY = this.roomHeight / 2;
        const windowZPositions = [-50, 0, 50];

        windowZPositions.forEach((zPos) => {
            this.loadWindow(new THREE.Vector3(rightWallX, windowY, zPos));
        });

        console.log("Windows added.");
    }

    // private addSunlight() {
    //     const sunlight = new THREE.DirectionalLight(0xffffff, 5); // Increase intensity for more light
    //     sunlight.position.set(100, 100, 200); // Adjust position for better light direction
    //     sunlight.target.position.set(100, 50, 100); // Target the center of the room
    //     sunlight.castShadow = true;
    //
    //     sunlight.shadow.camera.near = 0.1;
    //     sunlight.shadow.camera.far = 100;
    //     sunlight.shadow.camera.left = -100;
    //     sunlight.shadow.camera.right = 100;
    //     sunlight.shadow.camera.top = 100;
    //     sunlight.shadow.camera.bottom = -100;
    //
    //     sunlight.shadow.mapSize.width = 4096;
    //     sunlight.shadow.mapSize.height = 4096;
    //     sunlight.shadow.bias = -0.0010;
    //
    //     this.literaryGroup.add(sunlight);
    // }
    //
    private addAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.literaryGroup.add(ambientLight);
    }

    private loadWindow(position: THREE.Vector3, scale: number = 0.30) {
        const loader = new GLTFLoader();
        loader.load(
            'models/literaryRoom/wild_west_theme_small_window_no_glass.glb',
            (gltf) => {
                const windowModel = gltf.scene;

                windowModel.position.copy(position);
                windowModel.rotateY(Math.PI / 2);

                windowModel.traverse((child) => {
                    child.castShadow = true;
                });

                // Set scale dynamically
                windowModel.scale.set(scale, scale, scale);

                // Assign a unique name for debugging
                windowModel.name = `window_${position.x}_${position.y}_${position.z}`;

                // Add to room
                this.literaryGroup.add(windowModel);
                console.log(`Window model at ${position.x}, ${position.y}, ${position.z} loaded successfully`, gltf);
            },
            undefined,
            (error) => {
                console.error("Error loading window model:", error);
            }
        );
    }

    private loadBookshelf(position: THREE.Vector3, scale: number = 30) {
        const loader = new GLTFLoader();
        loader.load(
            'models/literaryRoom/victorian_bookshelf.glb', // Path to your bookshelf model
            (gltf) => {
                const bookshelf = gltf.scene;

                // Set position dynamically
                bookshelf.position.copy(position);

                // Set scale dynamically (adjust as needed)
                bookshelf.scale.set(scale, scale, scale);

                // Set rotation if needed (for example, rotating it to face forward)
                bookshelf.rotation.y = Math.PI + Math.PI/2; // Rotate 180 degrees to face the front wall

                // Add the bookshelf to the room group
                this.literaryGroup.add(bookshelf);

                console.log(`Bookshelf loaded successfully at position: ${position.x}, ${position.y}, ${position.z}`);
            },
            undefined,
            (error) => {
                console.error("Error loading bookshelf model:", error);
            }
        );
    }

    private loadBookshelf1(position: THREE.Vector3, scale: number = 35) {
        const loader = new GLTFLoader();
        loader.load(
            'models/literaryRoom/dusty_old_bookshelf_free.glb', // Path to your bookshelf model
            (gltf) => {
                const bookshelf = gltf.scene;


                // Set position dynamically
                bookshelf.position.copy(position);

                // Set scale dynamically (adjust as needed)
                bookshelf.scale.set(scale, scale, scale);

                // Set rotation if needed (for example, rotating it to face forward)
                bookshelf.rotation.y = Math.PI + Math.PI/2;

                // Add the bookshelf to the room group
                this.literaryGroup.add(bookshelf);

                console.log(`Bookshelf loaded successfully at position: ${position.x}, ${position.y}, ${position.z}`);
            },
            undefined,
            (error) => {
                console.error("Error loading bookshelf model:", error);
            }
        );
    }

    private loadDesk(position: THREE.Vector3, scale: number = 30) {
        const loader = new GLTFLoader();
        loader.load(
            'models/literaryRoom/old_desk_scene.glb', // Path to your bookshelf model
            (gltf) => {
                const bookshelf = gltf.scene;


                // Set position dynamically
                bookshelf.position.copy(position);

                // Set scale dynamically (adjust as needed)
                bookshelf.scale.set(scale * 1.3, scale, scale);

                // Set rotation if needed (for example, rotating it to face forward)
                bookshelf.rotation.y = Math.PI + Math.PI/2; // Rotate 180 degrees to face the front wall

                // Add the bookshelf to the room group
                this.literaryGroup.add(bookshelf);

                console.log(`Bookshelf loaded successfully at position: ${position.x}, ${position.y}, ${position.z}`);
            },
            undefined,
            (error) => {
                console.error("Error loading bookshelf model:", error);
            }
        );
     }

}
