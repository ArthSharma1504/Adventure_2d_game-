# Simple JavaScript Canvas Game

This project is a simple 2D game built using HTML5 Canvas and JavaScript. It demonstrates game mechanics such as player movement, enemy behavior, collision detection, and dynamic rendering.

## 🚀 Features
- **Player Movement:** Move the player using arrow keys.
- **Enemy Mechanics:** Enemies shoot projectiles at intervals.
- **Collision Detection:** Detect collisions between player, enemies, and obstacles.
- **Game States:** Main Menu, Gameplay, Level Cleared, and Game Over screens.
- **Dynamic Rendering:** Background, platforms, enemies, and projectiles are dynamically drawn.

## 📁 File Structure
Since all game logic is combined into a single `game.js` file, the structure is straightforward:
```
📂 project-root
├── index.html   // Main HTML structure
├── game.js      // All game logic
├── background.png
├── player.png
   
```

## 🛠️ Setup and Run
1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/simple-canvas-game.git
   ```
2. Open `index.html` in your browser.
3. Start playing the game!

## 🎮 Controls
- **Arrow Keys:** Move the player.
- **Space Bar:** Jump (if implemented).


## 📚 How it Works
- The `game.js` file initializes the canvas and game loop.
- Player, enemy, and game states are managed directly in `game.js`.
- `requestAnimationFrame` handles smooth rendering.

## 🐞 Debugging
- Open your browser's developer console (`F12`) to check for errors.
- Verify that image paths in `game.js` match the actual folder structure.

## 🤝 Contributing
Feel free to fork this repository and submit pull requests.

## 📄 License
This project is licensed under the MIT License.

Enjoy coding and happy gaming! 🎮🚀

