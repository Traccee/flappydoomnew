// Game Board
let canvas; //vairable that store reference to the HTML <canvas> 
let canvasWidth = 1536;
let canvasHeight = 901;
let ctx; // will use so we can draw on canvas 

// Cacodemon Bird
let CacoWidth = 61; // Width/height ratio = 142 / 122
let CacoHeight = 71;
let CacoX = canvasWidth / 8; // X position of the bird
let CacoY = canvasHeight / 2; // Y position of the bird
let CacoImg; // Image of the Cacodemon

// Doom Pipes 
let DoomPipes = [];
let DoomPipesWidth = 64; // width pipes
let DoomPipesHeight = 512; // height pipes
let DoomPipesX = canvasWidth; // starts the pipes at tthe end of the screen 
let DoomPipesY = 0; // vert starting position

let TopDoomPipeImg; 
let BottomDoomPipeImg; 

let Caco = { //cacodemon object setup , used for easier reference rahter than using each individual property
    x: CacoX,
    y: CacoY,
    width: CacoWidth,
    height: CacoHeight
}

// creating physics 
let horizontalSpeed = -2; // Initial speed of the pipes moving left
let verticalSpeed = 0; // Speed of the player's jump
let gravityForce = 0.12; // Force of gravity affecting the player

// doom pipe speed parameters
let maxPipeSpeed = -4; // Maximum speed of the pipes (cap speed)
let speedIncreaseRate = -0.05; // Rate at which the pipe speed increases

let isGameOver = false; // variable to check if game over 
let gameScore = 0; // start game score 0 

window.onload = function() { //Runs the enclosed function after the page loads.
    // Initialize the game board
    canvas = document.getElementById("canvas"); //  grab the <canvas> element from the HTML since everything is drawn on canvas
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    ctx = canvas.getContext("2d"); //allows u to draw on 2d canvas

    
    CacoImg = new Image(); // Load Cacodemon image
    CacoImg.src = "./cacdemon1.png"; 
    CacoImg.onload = function() {  //callback function that will be executed when the image finishes loading.
        // draw the Cacodemon on canvas once the image is loaded
        ctx.drawImage(CacoImg, Caco.x, Caco.y, Caco.width, Caco.height);
    } 

    // Load pipe images
    TopDoomPipeImg = new Image(); //image object 
    TopDoomPipeImg.src = "./TOPPIPE.png"; // Ensure the correct image path
    BottomDoomPipeImg = new Image();
    BottomDoomPipeImg.src = "./DAbottompipe.png"; // Ensure the correct image path

    // Load background image
    let DoomBackgroundImg = new Image();
    DoomBackgroundImg.src = "./doomBG.png"; // Ensure the correct image path

    // Start the game loop and spawn pipes every 1.6 seconds
    requestAnimationFrame(update); //Starts the game loop, which repeatedly calls the update function to refresh the game every frame.
    setInterval(spawnDoomPipes, 1200); // Spawn pipes every 1.6 seconds by calling function 
    document.addEventListener("keydown", controlPlayer); // event listener for key presses
}

// Game Loop to update every frame
function update() {
    requestAnimationFrame(update); // Keep the animation going
    if (isGameOver) {
        return; // Stop if the game is over
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing

    // Gradually increase the pipe speed, but cap it at maxPipeSpeed
    if (horizontalSpeed > maxPipeSpeed) {
        horizontalSpeed += speedIncreaseRate; // Increase speed over time
    }

    // Player (Cacodemon) movement
    verticalSpeed += gravityForce; // Apply gravity to vertical speed
    Caco.y = Math.max(Caco.y + verticalSpeed, 0); // Ensure the player doesn't go off the top of the screen
    ctx.drawImage(CacoImg, Caco.x, Caco.y, Caco.width, Caco.height); // Draw the player

    if (Caco.y > canvas.height) {
        isGameOver = true; // Game over if the player goes below the screen
    }

    // Pipes movement and collision detection
    for (let i = 0; i < DoomPipes.length; i++) {
        let pipe = DoomPipes[i];
        pipe.x += horizontalSpeed; // Move pipes to the left
        ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height); // Draw each pipe

        // Update score if the player passed the pipe
        if (!pipe.passed && Caco.x > pipe.x + pipe.width) {
            gameScore += 0.5; // Each pair of pipes contributes 0.5 points to the score
            pipe.passed = true;
        }

        // Check for collision between the player and the pipe
        if (checkCollision(Caco, pipe)) {
            isGameOver = true; // End the game if a collision occurs
        }
    }

    // Remove pipes that are off-screen
    while (DoomPipes.length > 0 && DoomPipes[0].x < -DoomPipesWidth) {
        DoomPipes.shift(); // Remove the first pipe from the array
    }

    // Display the score
    ctx.fillStyle = "white";
    ctx.font = "45px sans-serif";
    ctx.fillText(gameScore, 5, 45);

    // Display "Game Over" if the game is over
    if (isGameOver) {
        ctx.fillText("GAME OVER", 5, 90);
    }
}

// Spawn new pipes every 1.2 seconds
function spawnDoomPipes() {
    if (isGameOver) {
        return; // Don't spawn new pipes if the game is over
    }

    // Randomly generate a pipe's Y position
    let randomPipeY = DoomPipesY - DoomPipesHeight / 4 - Math.random() * (DoomPipesHeight / 2);
    let openingSpace = canvas.height / 3;

    // Create the top pipe
    let TOPPipe = {
        img: TopDoomPipeImg,
        x: DoomPipesX,
        y: randomPipeY,
        width: DoomPipesWidth,
        height: DoomPipesHeight,
        passed: false // used to track if the pipe has been passed by the cacodemon
    };
    DoomPipes.push(TOPPipe);

    // Create the bottom pipe
    let bottomPipe = {
        img: BottomDoomPipeImg,
        x: DoomPipesX,
        y: randomPipeY + DoomPipesHeight + openingSpace,
        width: DoomPipesWidth,
        height: DoomPipesHeight,
        passed: false // used to track if the pipe has been passed by the cacodemon 
    };
    DoomPipes.push(bottomPipe);
}

// Control the player's movement (jump)
function controlPlayer(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        verticalSpeed = -4; // Make the player jump upwards

        // Reset the game if it's over
        if (isGameOver) {
            Caco.y = CacoY; // Reset player to initial position
            DoomPipes = []; // Clear the pipes
            gameScore = 0; // Reset the score
            isGameOver = false; // Restart the game
        }
    }
}

// Check for collision between two objects (player and pipes)
function checkCollision(a, b) {
    return a.x < b.x + b.width &&   // Check if the player's top left doesn't reach the pipe's top right
           a.x + a.width > b.x &&   // Check if the player's top right passes the pipe's top left
           a.y < b.y + b.height &&  // Check if the player's top left doesn't reach the pipe's bottom left
           a.y + a.height > b.y;    // Check if the player's bottom left passes the pipe's top left
}
