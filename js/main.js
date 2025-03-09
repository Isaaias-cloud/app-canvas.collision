// Obtiene el elemento <canvas> del DOM
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
//Obtiene el audio
let collisionSound = new Audio('./Assets/collision.mp3');

// Configuración del canvas y sus dimensiones
const window_height = 800//window.innerHeight;
const window_width = 1200//window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "rgb(27, 170, 14)"; // Fondo del canvas
const colorCirculo ="rgb(24, 140, 160)"
const maxBounces = 1000; // Límite de rebotes

let circles = []; // Arreglo para almacenar los círculos

let numCircles = 10;
        function setCircleCount() {
            const input = document.getElementById('circleCount');
            numCircles = parseInt(input.value) || 10;
            circles = []; // Vacía el arreglo de círculos
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas
    
            createRandomCircles(numCircles)
        }

// Clase para crear círculos animados
class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.color = color; // Color del borde
    this.fillColor = colorCirculo; // Color de fondo inicial
    this.text = text;
    this.speed = speed;

    this.dx = 1*this.speed//(Math.random() * 2 - 1) * speed; // Velocidad aleatoria en X
    this.dy = 1*this.speed//(Math.random() * 2 - 1) * speed; // Velocidad aleatoria en Y
    this.bounceCount = 0; // Contador de rebotes
  }

  // Dibuja el círculo en el canvas
  draw(context) {
    context.beginPath();
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);

    context.fillStyle = this.fillColor;
    context.fill();

    context.strokeStyle = this.color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    context.fillStyle = "black";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "12px Arial";
    context.fillText(`${this.text} (${this.bounceCount})`, this.posX, this.posY);
  }

  // Actualiza la posición del círculo
  update(context) {
    this.draw(context);

    if (this.bounceCount >= maxBounces) {
      this.dx = 0;
      this.dy = 0;
      return;
    }

    // Rebote en las paredes
    if (this.posX + this.radius >= window_width || this.posX - this.radius <= 0) {
      this.dx = -this.dx;
      this.bounceCount++;
    }
    if (this.posY + this.radius >= window_height || this.posY - this.radius <= 0) {
      this.dy = -this.dy;
      this.bounceCount++;
    }

    this.posX += this.dx;
    this.posY += this.dy;
  }
}

// Detecta colisiones entre todos los círculos
function detectCollisions(circles) {
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const circle1 = circles[i];
      const circle2 = circles[j];

      const dx = circle2.posX - circle1.posX;
      const dy = circle2.posY - circle1.posY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= circle1.radius + circle2.radius) {
        console.log(`Colisión: ${circle1.text} y ${circle2.text}`);

        if (collisionSound.ended) {
          collisionSound.play();  // Reproduce el sonido solo si ha terminado
        } else {
          collisionSound.currentTime = 0;  // Reinicia el sonido
          collisionSound.play();           // Lo reproduce
        }
        
        // Rebote al colisionar
        circle1.dx = -circle1.dx;
        circle1.dy = -circle1.dy;
        circle2.dx = -circle2.dx;
        circle2.dy = -circle2.dy;

        // Cambia temporalmente el color de fondo a rojo
        // Cargar el sonido de colisión
        
        changeColorTemporarily(circle1);
        changeColorTemporarily(circle2);

        circle1.bounceCount++;
        circle2.bounceCount++;
      }
    }
  }
}

// Función que evita colisiones al generar círculos
function generateNonCollidingPosition(circles, radius) {
  let x, y;
  let collisionDetected;
  
  do {
    // Genera una posición aleatoria
    x = Math.random() * (window_width - 2 * radius) + radius;
    y = Math.random() * (window_height - 2 * radius) + radius;

    // Verifica si la nueva posición colisiona con algún círculo existente
    collisionDetected = false;
    for (let circle of circles) {
      const dx = x - circle.posX;
      const dy = y - circle.posY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < radius + circle.radius) {
        collisionDetected = true; // Si colisiona, marca como colisión
        break;
      }
    }
  } while (collisionDetected); // Repite hasta que no haya colisión
  
  return { x, y };
}

// Cambia el color de fondo a rojo temporalmente
function changeColorTemporarily(circle) {
  circle.fillColor = "#f00"; // Rojo
  setTimeout(() => {
    circle.fillColor = colorCirculo;
  }, 100);
}

// Genera n círculos aleatoriamente dentro del canvas sin colisiones iniciales
function createRandomCircles(num) {
  for (let i = 0; i < num; i++) {
    const randomRadius = Math.floor(Math.random() * 30 + 30);
    const randomSpeed = Math.random() * 3 + 1;

    // Usa la función para generar una posición sin colisiones
    const { x: randomX, y: randomY } = generateNonCollidingPosition(circles, randomRadius);
    
    const circle = new Circle(randomX, randomY, randomRadius, "blue", `Tec ${i+1}`, randomSpeed);
    circles.push(circle);
  }
}

// Función de animación
function updateCanvas() {
  requestAnimationFrame(updateCanvas);
  ctx.clearRect(0, 0, window_width, window_height);

  circles.forEach(circle => circle.update(ctx));
  detectCollisions(circles);


}

// Inicializa los círculos y comienza la animación
createRandomCircles(numCircles);
updateCanvas();
