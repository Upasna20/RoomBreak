import { Game } from './src/core/Game.ts';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    // Create and configure the start button
    const startButton: HTMLButtonElement = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.position = 'absolute';
    startButton.style.top = '50%';
    startButton.style.left = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';

    startButton.addEventListener('click', () => {
        if (game.controls && typeof game.controls.lock === 'function') {
            game.controls.lock();
        }
        startButton.style.display = 'none';
    });

    document.body.appendChild(startButton);
});
