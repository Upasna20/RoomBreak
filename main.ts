
import { gameInstance } from './src/core/Game.ts';
import { wsClient } from './src/network/wsClient.ts';

let gameCode = '';
let gameStart = false;
let localSerialNumber: number | null = null;
let localPlayerPosition: { x: number, y: number, z: number } | null = null;

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById("username-input") as HTMLInputElement;
    const gameEntry = document.getElementById('game-entry') as HTMLDivElement;
    const introScreen = document.getElementById('intro-screen') as HTMLDivElement;
    const createGameButton = document.getElementById('create-game-button') as HTMLButtonElement;
    const waitingScreen = document.getElementById('waiting-screen') as HTMLDivElement;
    const roomCodeDisplay = document.getElementById('room-code') as HTMLParagraphElement;
    const startGameButton = document.getElementById('start-game-button') as HTMLButtonElement;
    const loadingText = document.getElementById('loading-text') as HTMLParagraphElement;

    const joinGameButton = document.getElementById('join-game-button') as HTMLButtonElement;
    const joinGameContainer = document.getElementById('join-game-screen') as HTMLDivElement;
    const roomCodeInput = document.getElementById('room-code-input') as HTMLInputElement;
    const joinButton = document.getElementById('join-game-submit') as HTMLButtonElement;
    const joinErrorMessage = document.getElementById('join-error-message') as HTMLParagraphElement;
    const waitingMessage = document.getElementById('waiting-message') as HTMLParagraphElement;

    gameEntry.style.display = 'flex';
    const username = usernameInput.value.trim();

    wsClient.onMessage((message) => {
        console.log("The message is");
        console.log(message)
        if (message.type === 'GAME_CREATED' || message.type === 'GAME_JOIN_SUCCESS') {
            introScreen.style.display = 'none';
            waitingScreen.style.display = 'flex';
            roomCodeDisplay.textContent = `Room Code: ${message.gameCode}`;
            gameCode = message.gameCode;
            if (message.type === 'GAME_CREATED') {
                usernameInput.style.display = 'none';
                loadingText.style.display = 'none';
                startGameButton.style.display = 'block';
            }
            else {
                joinGameContainer.style.display = 'none';
                waitingMessage.style.display = 'block';
            }

            localSerialNumber = message.serialNumber;
            console.log("Serial number is", localSerialNumber);
            localPlayerPosition = message.position;
            console.log("My position", localPlayerPosition)
        }
        else if (message.type === 'GAME_JOIN_FAILURE') {
            joinErrorMessage.textContent = message.reason;
            joinErrorMessage.style.display = 'block';
            joinButton.disabled = false;
        }
        else if (message.type === 'GAME_LOCKED') {
            gameEntry.style.display = 'none';
    
            if (localSerialNumber === null || localPlayerPosition === null) {
                console.error("Local player data is missing");
                return;
            }
    
            const localPlayerInfo = {
                serialNumber: localSerialNumber,
                username: username,
                position: localPlayerPosition
            };
    
            const otherPlayers = message.players
                .filter(p => p.serialNumber !== localSerialNumber)
                .map(p => ({
                    serialNumber: p.serialNumber,
                    username: p.username,
                    position: p.position
                }));
    
            gameInstance.init(localPlayerInfo, otherPlayers, gameCode);
            gameInstance.controls?.lock?.();
            gameStart = true;
        }
        else if (message.type === 'POSITION_UPDATE') {
            let serialNumber = message.serialNumber;
            let newPos = message.newPos;
            gameInstance.foreignEntities.get(serialNumber)?.player.updateFromServer(newPos);
        }
    });

    function updateButtonState() {
        const username = usernameInput.value.trim();
        createGameButton.disabled = username === "";
        joinGameButton.disabled = username === "";
    }

    updateButtonState()


    // Also call it whenever the input changes
    usernameInput.addEventListener("input", updateButtonState);


    createGameButton.addEventListener('click', () => {
        createGameButton.style.display = 'none';
        joinGameButton.style.display = 'none';
        loadingText.style.display = 'block';
        const username = usernameInput.value.trim().toUpperCase();
        if (username) {
            wsClient.send({ type: "CREATE_GAME", username });
            createGameButton.disabled = true;
        }
    });

    joinGameButton.addEventListener('click', () => {
        // usernameInput.style.display = 'none';
        // joinGameButton.style.display = 'none';
        introScreen.style.display = 'none';
        createGameButton.style.display = 'none';
        joinGameContainer.style.display = 'flex';
    });


    joinButton.addEventListener('click', () => {
        const enteredCode = roomCodeInput.value.trim().toUpperCase();
        const username = usernameInput.value.trim().toUpperCase();
        if (username && enteredCode) {
            wsClient.send({ type: "JOIN_GAME", gameCode: enteredCode, username });
        }
        joinButton.disabled = true
    });


    startGameButton.addEventListener('click', () => {
        wsClient.send({ type: 'START_GAME', gameCode });
        startGameButton.disabled = true;
        waitingScreen.style.display = 'none';
        document.getElementById('loading-overlay')!.style.display = 'block';
    });


    document.addEventListener('click', () => {
        if (gameStart) {
            gameInstance.controls?.lock?.();
        }
    });
});
