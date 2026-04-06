// script.js dosyanı bu kodlarla tamamen değiştir
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("scoreVal");
const highScoreElement = document.getElementById("highScoreVal");

const box = 20;
let score = 0;
let initialSpeed = 150;
let gameSpeed = initialSpeed;
let game;
let gameStarted = false;

let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.innerHTML = highScore;

let snake = [{ x: 9 * box, y: 10 * box }];
let d = "RIGHT";
let directionQueue = [];

function createFood() {
    return {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box,
        // NORMAL (%85), GOLD (%15)
        type: Math.random() < 0.15 ? "GOLD" : "NORMAL"
    };
}
let food = createFood();

document.addEventListener("keydown", (e) => {
    // Yön tuşları veya WASD ile başla
    if (!gameStarted && [37, 38, 39, 40, 65, 87, 68, 83].includes(e.keyCode)) gameStarted = true;
    let key = e.keyCode;
    // Ok Tuşları
    if (key == 37 && d != "RIGHT") directionQueue.push("LEFT");
    else if (key == 38 && d != "DOWN") directionQueue.push("UP");
    else if (key == 39 && d != "LEFT") directionQueue.push("RIGHT");
    else if (key == 40 && d != "UP") directionQueue.push("DOWN");
    // WASD Kontrolleri
    else if (key == 65 && d != "RIGHT") directionQueue.push("LEFT"); // A
    else if (key == 87 && d != "DOWN") directionQueue.push("UP");    // W
    else if (key == 68 && d != "LEFT") directionQueue.push("RIGHT"); // D
    else if (key == 83 && d != "UP") directionQueue.push("DOWN");   // S
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        ctx.fillStyle = "#00ffff";
        ctx.font = "18px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText("GİRİŞ İÇİN", canvas.width / 2, canvas.height / 2 - 15);
        ctx.font = "14px Orbitron";
        ctx.fillText("YÖN VEYA WASD TUŞLARINA BASIN", canvas.width / 2, canvas.height / 2 + 20);
        return;
    }

    if (directionQueue.length > 0) d = directionQueue.shift();

    // Yemeği Çiz (Parlamalı)
    ctx.shadowBlur = 15;
    ctx.shadowColor = food.type === "GOLD" ? "#ffd700" : "#ff0055";
    ctx.fillStyle = food.type === "GOLD" ? "#ffd700" : "#ff0055";
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Gölgeyi sıfırla

    // Yılanı Çiz (Gradyanlı ve Köşe Yuvarlamalı)
    for (let i = 0; i < snake.length; i++) {
        let gradient = ctx.createLinearGradient(snake[i].x, snake[i].y, snake[i].x + box, snake[i].y + box);
        // Kafa daha parlak, vücut daha koyu mavi
        gradient.addColorStop(0, i === 0 ? "#00ffff" : "#0062ff");
        gradient.addColorStop(1, i === 0 ? "#0062ff" : "#003366");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        let r = 5; // Köşe yuvarlama yarıçapı
        // Hafif bir boşluk (gap) bırakalım
        drawRoundedRect(ctx, snake[i].x + 1, snake[i].y + 1, box - 2, box - 2, r);
        ctx.fill();

        if (i === 0) { // Gözler
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(snake[i].x + 6, snake[i].y + 7, 2, 0, Math.PI * 2);
            ctx.arc(snake[i].x + 14, snake[i].y + 7, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // Yemek Yeme
    if (snakeX == food.x && snakeY == food.y) {
        score += food.type === "GOLD" ? 5 : 1;
        scoreElement.innerHTML = score;

        // Rekor Kontrolü
        if (score > highScore) {
            highScore = score;
            highScoreElement.innerHTML = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }

        // Hızlanma Mantığı
        if (gameSpeed > 60) { // Maksimum hız sınırı
            gameSpeed -= food.type === "GOLD" ? 8 : 2; // Altın elma çok hızlandırır
            clearInterval(game);
            game = setInterval(draw, gameSpeed);
        }
        food = createFood();
    } else {
        snake.pop(); // Hareket devamı (kuyruğu siler)
    }

    let newHead = { x: snakeX, y: snakeY };

    // Ölüm Kontrolü
    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        triggerGameOverEffect(); // Oyun bitti efekti
        return;
    }
    snake.unshift(newHead); // Yeni kafayı ekler
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

// Yardımcı: Yuvarlak köşeli dikdörtgen çizer
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Oyun Bitti Efekti (Ekran Kırpışması ve Yazı)
function triggerGameOverEffect() {
    let flickerCount = 0;
    const maxFlickers = 3;

    const flickerInterval = setInterval(() => {
        // Ekranı temizle
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (flickerCount % 2 === 0) {
            // Yazıyı çiz
            ctx.fillStyle = "#ff0055";
            ctx.font = "26px Orbitron";
            ctx.textAlign = "center";
            ctx.fillText("SİSTEM ÇÖKTÜ", canvas.width / 2, canvas.height / 2);
            ctx.font = "16px Orbitron";
            ctx.fillText("Skorun: " + score, canvas.width / 2, canvas.height / 2 + 40);
        }
        flickerCount++;
        if (flickerCount >= maxFlickers * 2) {
            clearInterval(flickerInterval);
        }
    }, 150); // Kırpışma hızı (ms)
}

game = setInterval(draw, gameSpeed);