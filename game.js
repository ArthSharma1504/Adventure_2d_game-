const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set the canvas size to fill the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Call resizeCanvas initially and whenever the window is resized
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const gravity = 0.8;
const friction = 0.98;

// Load the background image (map.jpg)
const background = new Image();
background.src = "map.jpg"; // Correct path to your background image

// Load the character image (player.jpg)
const playerImage = new Image();
playerImage.src = "player.jpg"; // Correct path to your character image

// Player properties
let player = {
    x: 50,
    y: canvas.height - 150,
    width: 100,  // Increased width
    height: 100, // Increased height
    speed: 5,
    dx: 0,
    dy: 0,
    jumpPower: -15,
    grounded: false,
    wallJumping: false,
    wallDirection: 0 // 1 for right wall, -1 for left wall
};

// Platform properties (example)
const platforms = [
    { x: 100, y: canvas.height - 100, width: 300, height: 20 },
    { x: 500, y: canvas.height - 200, width: 300, height: 20 },
    { x: 900, y: canvas.height - 300, width: 200, height: 20 }
];

// Pedestal and flag properties
const pedestal = {
    x: canvas.width - 200, // Position at the right bottom
    y: canvas.height - 180,
    width: 40,
    height: 80,
    flagWidth: 20,
    flagHeight: 40,
    flagOffsetX: 10, // Flag starts from the pedestal's top
    flagOffsetY: -50 // Height of flag from pedestal
};

// Enemy properties
const enemy = {
    x: canvas.width / 2,  // Enemy starts in the middle
    y: canvas.height - 200,
    width: 60,
    height: 60,
    speed: 2,
    stones: [],
    shootInterval: 2000, // Shoot every 2 seconds
    lastShotTime: 0
};

let levelCleared = false;
let levelClearMessageTime = 0;
let gameOver = false;
let gameState = "mainMenu"; // "mainMenu", "game", "levelCleared", "gameOver"

// Stones properties
const stone = {
    width: 20,
    height: 10,
    speed: 5
};

// Keys control
let rightPressed = false;
let leftPressed = false;
let upPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    } else if (e.key == "Up" || e.key == "ArrowUp") {
        upPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    } else if (e.key == "Up" || e.key == "ArrowUp") {
        upPressed = false;
    }
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function updatePlayerPosition() {
    if (rightPressed) {
        player.dx = player.speed;
    } else if (leftPressed) {
        player.dx = -player.speed;
    } else {
        player.dx = 0;
    }

    if (upPressed && player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
    }

    player.dy += gravity;

    player.x += player.dx;
    player.y += player.dy;

    // Collision with walls (left and right sides)
    player.wallDirection = 0;
    if (player.x < 0) {
        player.x = 0;
        player.wallDirection = -1;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.wallDirection = 1;
    }

    // Platform collision detection
    player.grounded = false;
    for (let i = 0; i < platforms.length; i++) {
        let platform = platforms[i];
        if (player.x + player.width > platform.x && player.x < platform.x + platform.width && player.y + player.height <= platform.y + player.dy && player.y + player.height + player.dy >= platform.y) {
            player.y = platform.y - player.height;
            player.dy = 0;
            player.grounded = true;
        }
    }

    // Ground collision
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    // Left and right boundary collision
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Check for collision with the pedestal (rightmost bottom)
    if (player.x + player.width > pedestal.x && player.x < pedestal.x + pedestal.width && player.y + player.height > pedestal.y && player.y < pedestal.y + pedestal.height) {
        levelCleared = true;
        levelClearMessageTime = Date.now();
    }
}

function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawPlatforms() {
    ctx.fillStyle = "#0f0"; // Platform color (green)
    for (let i = 0; i < platforms.length; i++) {
        let platform = platforms[i];
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
}

function drawPedestal() {
    // Draw pedestal (a simple rectangle)
    ctx.fillStyle = "#8B4513"; // Brown color for pedestal
    ctx.fillRect(pedestal.x, pedestal.y, pedestal.width, pedestal.height);

    // Draw the flag on the pedestal
    ctx.fillStyle = "#FF0000"; // Red color for the flag
    ctx.fillRect(pedestal.x + pedestal.flagOffsetX, pedestal.y + pedestal.flagOffsetY, pedestal.flagWidth, pedestal.flagHeight);
}

function drawEnemy() {
    // Draw enemy (a simple rectangle for now)
    ctx.fillStyle = "red"; // Red color for the enemy
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Shoot stones at regular intervals
    if (Date.now() - enemy.lastShotTime > enemy.shootInterval) {
        shootStone();
        enemy.lastShotTime = Date.now();
    }

    // Move and draw stones
    for (let i = 0; i < enemy.stones.length; i++) {
        let s = enemy.stones[i];
        s.x -= stone.speed; // Move stone left

        // Draw the stone
        ctx.fillStyle = "gray";
        ctx.fillRect(s.x, s.y, stone.width, stone.height);

        // Check if stone hits the player
        if (s.x < player.x + player.width && s.x + stone.width > player.x && s.y < player.y + player.height && s.y + stone.height > player.y) {
            gameOver = true;
        }
    }

    // Remove stones that are out of bounds
    enemy.stones = enemy.stones.filter(s => s.x > 0);
}

function shootStone() {
    enemy.stones.push({
        x: enemy.x + enemy.width,
        y: enemy.y + enemy.height / 2 - stone.height / 2 // Shoot from the middle of the enemy
    });
}

function drawLevelClearedMessage() {
    if (levelCleared && Date.now() - levelClearMessageTime < 3000) {
        // Display message for 3 seconds
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Level Cleared!", canvas.width / 2, canvas.height / 2);
        drawRetryMenu();
    }
}

function drawGameOverMessage() {
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("You Died!", canvas.width / 2, canvas.height / 2);
        drawRetryMenu();
    }
}

function drawRetryMenu() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press R to Retry or M for Main Menu", canvas.width / 2, canvas.height / 2 + 50);
}

function drawMainMenu() {
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Main Menu", canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = "30px Arial";
    ctx.fillText("Press S to Start or Q to Quit", canvas.width / 2, canvas.height / 2);
}

function gameLoop() {
    if (gameState === "mainMenu") {
        drawMainMenu();
    } else if (gameState === "game") {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawBackground(); // Draw the background first
        drawPlatforms(); // Draw the platforms
        drawPedestal(); // Draw the pedestal with the flag
        drawEnemy(); // Draw the enemy and shoot stones
        drawPlayer(); // Draw the player image
        updatePlayerPosition();
        drawLevelClearedMessage(); // Draw level cleared message if applicable
        drawGameOverMessage(); // Draw "You Died" message if the player is hit by a stone
    }
    requestAnimationFrame(gameLoop);
}

// Wait for the background and player images to load before starting the game loop
background.onload = function() {
    playerImage.onload = function() {
        gameLoop();
    };
};

// Listen for keyboard events for main menu and retry options
document.addEventListener("keydown", function(e) {
    if (gameState === "mainMenu") {
        if (e.key === "s" || e.key === "S") {
            gameState = "game"; // Start the game
        } else if (e.key === "q" || e.key === "Q") {
            window.close(); // Quit the game
        }
    } else if (gameState === "levelCleared" || gameState === "gameOver") {
        if (e.key === "r" || e.key === "R") {
            gameState = "game"; // Retry
            resetGame(); // Reset the game state
        } else if (e.key === "m" || e.key === "M") {
            gameState = "mainMenu"; // Go to main menu
        }
    }
});

function resetGame() {
    // Reset player, enemy, platforms, etc.
    player = {
        x: 50,
        y: canvas.height - 150,
        width: 100,
        height: 100,
        speed: 5,
        dx: 0,
        dy: 0,
        jumpPower: -15,
        grounded: false,
        wallJumping: false,
        wallDirection: 0
    };
    levelCleared = false;
    gameOver = false;
    platforms = [
        { x: 100, y: canvas.height - 100, width: 300, height: 20 },
        { x: 500, y: canvas.height - 200, width: 300, height: 20 },
        { x: 900, y: canvas.height - 300, width: 200, height: 20 }
    ];
    enemy.stones = [];
    enemy.x = canvas.width / 2;
    enemy.y = canvas.height - 200;
}
