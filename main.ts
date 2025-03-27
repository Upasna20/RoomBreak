import { gameInstance } from './src/core/Game.ts';

document.addEventListener('DOMContentLoaded', () => {
    const introScreen = document.getElementById('intro-screen') as HTMLDivElement;
    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    const joinButton = document.getElementById('join-button') as HTMLButtonElement;

    function startGame() {
        introScreen.style.display = 'none';
        const game = gameInstance;
        game.init(); // Initialize game
        if (game.controls && typeof game.controls.lock === 'function') {
            game.controls.lock();
        }
    }

    startButton.addEventListener('click', startGame);
    joinButton.addEventListener('click', startGame); // Modify if different behavior needed
});
