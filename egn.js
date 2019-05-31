  var delta = 0;
  var lastFrameTimeMs = 0;
  var timeStep = 1000/60;
  
  var canvas;
  var canvasContext;

  var imgBall;

  var background;

  var paddle;
  var bricks;
  var ball;

  window.onload = function() {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');
  imgBall = document.getElementById("imageBall");

  requestAnimationFrame(mainLoop);
      
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = MouseInput.updateMousePos(evt);
      } );
  }
  
  function mainLoop(timeStamp) {
		if(timeStamp < lastFrameTimeMs + timeStep) {
			requestAnimationFrame(mainLoop);
			return;
		}
		delta += timeStamp - lastFrameTimeMs;
		lastFrameTimeMs = timeStamp;
		while(delta >= timeStep) {
			moveEverything(timeStep); 
			delta -= timeStep;
		}
		drawEverything();
		requestAnimationFrame(mainLoop);
  }

class Utils {
	
	static colorRect(topLeftX,topLeftY, boxWidth,boxHeight, fillColor) {
		canvasContext.fillStyle = fillColor;
		canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
	}

	static colorCircle(centerX,centerY, radius, fillColor) {
    canvasContext.fillStyle = fillColor;
		canvasContext.beginPath();
		canvasContext.arc(centerX,centerY,radius, 0,Math.PI*2, true);
    canvasContext.fill();
	}

  static colorText(showWords, textX,textY, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
  }

	static clearScreen() {
		Utils.colorRect(0,0, canvas.width,canvas.height, 'black');
	}
}

class MouseInput {
  
  static x = 400;
  static y = 400;
  
  static updateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    MouseInput.x = evt.clientX - rect.left - root.scrollLeft;
    MouseInput.y = evt.clientY - rect.top - root.scrollTop;

  }
}

class Paddle {
  constructor (posX,width,thickness,distFromEdge,color) {
    this.posX = posX;
    this.width = width;
    this.thickness = thickness;
    this.distFromEdge = distFromEdge;
    this.color = color;
  }
  
  draw () {
    Utils.colorRect(this.posX, canvas.height-this.distFromEdge,this.width, this.thickness, this.color);
  }
  
  move (deltaTime){
    this.posX = MouseInput.x - (this.width/2);
  }
  
}

class Bricks{
  constructor (BRICK_W,BRICK_H,BRICK_GAP,BRICK_COLS,BRICK_ROWS,COLOR) {
    this.BRICK_W = BRICK_W;
    this.BRICK_H = BRICK_H;
    this.BRICK_GAP = BRICK_GAP;
    this.BRICK_COLS = BRICK_COLS;
    this.BRICK_ROWS = BRICK_ROWS;
    this.COLOR = COLOR;
    this.brickGrid = new Array(this.BRICK_COLS * this.BRICK_ROWS);
  }

  reset() {
    for(var i=0; i<this.BRICK_COLS * this.BRICK_ROWS; i++) {
      this.brickGrid[i] = true;
    }
  }

  rowColToArrayIndex(col, row) {
    return col + this.BRICK_COLS * row;
  }

  move(deltaTime) {

  }

  draw() {
    for(var eachRow=0;eachRow<this.BRICK_ROWS;eachRow++) {
      for(var eachCol=0;eachCol<this.BRICK_COLS;eachCol++) {

        var arrayIndex = this.rowColToArrayIndex(eachCol, eachRow); 

        if(this.brickGrid[arrayIndex]) {

          Utils.colorRect(this.BRICK_W*eachCol,this.BRICK_H*eachRow,
            this.BRICK_W-this.BRICK_GAP,this.BRICK_H-this.BRICK_GAP, this.COLOR);
        }
      }

    } 

  }
}

class Ball {
  constructor(posX,posY,speedX,speedY,radius,color) {
    
    this.posX = posX;
    this.posY = posY;
    this.speedX = speedX;
    this.speedY = speedY;
    this.radius = radius;
    this.color = color;
    this.originalSpeedX = this.speedX;
  }
  
  resetPos(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }
  
  move(deltaTime) {
    this.posX += this.speedX*deltaTime;
    this.posY += this.speedY*deltaTime;
    
    if(this.posX < 0) {
      this.speedX *= -1;
    }
    if(this.posX > canvas.width) {
      this.speedX *= -1;
    }
    if(this.posY < 0) {
      this.speedY *= -1;
    }
    if(this.posY > canvas.height) {
      this.resetPos(canvas.width/2,canvas.height/2);
    }
    
  }
  
  draw() {
    Utils.colorCircle(this.posX,this.posY,this.radius,this.color);
  }

  paddleCollision(paddle) {
    var paddleTopEdgeY = canvas.height-paddle.distFromEdge-paddle.thickness;
    var paddleBottomEdgeY = paddleTopEdgeY + paddle.thickness;
    var paddleLeftEdgeX = paddle.posX;
    var paddleRightEdgeX = paddleLeftEdgeX + paddle.width;
    if( this.posY > paddleTopEdgeY && 
      this.posY < paddleBottomEdgeY &&
      this.posX > paddleLeftEdgeX &&
      this.posX < paddleRightEdgeX) {
      
      this.speedY *= -1;

      var centerOfPaddleX = paddle.posX+paddle.width/2;
      var ballDistFromPaddleCenterX = this.posX - centerOfPaddleX;
      this.speedX = ballDistFromPaddleCenterX * this.originalSpeedX/(paddle.width/4);
    }
  }

  bricksCollision(bricks) {
    var ballBrickCol = Math.floor(this.posX / bricks.BRICK_W);
    var ballBrickRow = Math.floor(this.posY / bricks.BRICK_H);
    var brickIndexUnderBall = bricks.rowColToArrayIndex(ballBrickCol, ballBrickRow);

    if(ballBrickCol >= 0 && ballBrickCol < bricks.BRICK_COLS &&
      ballBrickRow >= 0 && ballBrickRow < bricks.BRICK_ROWS) {

      if(bricks.brickGrid[brickIndexUnderBall]) {
        bricks.brickGrid[brickIndexUnderBall] = false;
      
        var prevBallX = this.posX - this.speedX*this.deltaTime;
        var prevBallY = this.posY - this.speedY*this.deltaTime;
        var prevBrickCol = Math.floor(prevBallX / bricks.BRICK_W);
        var prevBrickRow = Math.floor(prevBallY / bricks.BRICK_H);

        if(prevBrickCol != ballBrickCol) {
          this.speedX *= -1;
        }
        if(prevBrickRow != ballBrickRow) {
          this.speedY *= -1;
        }
      }
    
    }
  }

}