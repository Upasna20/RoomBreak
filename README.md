# 3D Escape Room Game

A multiplayer 3D escape room game built using Three.js, featuring multiple themed rooms with puzzles and interactive elements.

## Features
- Multiplayer support with real-time player visibility
- Different themed rooms with unique puzzles
- Smooth room transitions and dynamic lighting
- Web-based rendering using Three.js

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)

### Clone the Repository
```sh
git clone https://github.com/your-username/3d-escape-room.git
cd 3d-escape-room
```

### Install Dependencies
```sh
npm install
```

### Run the Development Server
```sh
npm run dev
```
This will start a local development server. Open your browser and navigate to `http://localhost:3000` to play.

## Folder Structure
```
3d-escape-room/
│── public/          # Assets (models, textures, etc.)
│── src/
│   ├── core/  # Reusable UI components
│   ├── puzzles/        # Core game logic (lobby, rooms, player controls)
│   ├── scenes/       # Helper functions (collision detection, networking, etc.)
│── utils.ts
│── index.html        # Entry point
│── main.ts          
│── package.json     # Dependencies and scripts
│── README.md        # Project documentation
```


