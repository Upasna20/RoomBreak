import { Game } from "./src/core/game.ts";
import * as THREE from "three";

window.onload = () => {
    // Initialize Scene
    const scene = new THREE.Scene();

    // Set Up Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 7.3);

    // Set Up Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Attach Renderer to DOM
    document.body.appendChild(renderer.domElement);

    // Create Game Instance
    const game = new Game(scene, camera, renderer);

    // Start Game
    game.init();

    // Handle Global Events (e.g., window resize)
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};
