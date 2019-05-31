  //defina a cor do fundo chamando a variavél background com uma cor. Ex:
  background = 'DarkSlateGray';

  //defina os valores do paddle (posiçãoX, largura, altura, distânciaTela, cor) ex:
  paddle = new Paddle(400,100,13,60,'LimeGreen');

  //defina os valores do bricks (largura, altura, espaçamento, colunas, linhas, cor) ex:
  bricks = new Bricks(80,60,2,10,3,'DarkGoldenrod');
  bricks.reset();

  //defina os valores da ball (posiçãoX, posiçãoY, velocidadeX, velocidadeY, raio, cor) ex:
  ball = new Ball(400,300,0.1,0.1,12,null);


  //a função moveEverything permite que as entidades se movam
  function moveEverything(deltaP) {

    paddle.move();

    ball.move(deltaP);
    ball.paddleCollision(paddle);
    ball.bricksCollision(bricks);

  }
  
  //a função drawEverything permite que as entidades sejam desenhadas na tela
  function drawEverything() {
    Utils.colorRect(0, 0, canvas.width, canvas.height, background);

    paddle.draw();

    bricks.draw();

    canvasContext.drawImage(imgBall, ball.posX - (ball.radius + 2), ball.posY - (ball.radius + 2),
      (ball.radius + 2)* 2, (ball.radius + 2)* 2);

    Utils.colorRect(20, 200, 25, 5, 'purple');
    Utils.colorText("Texto", 20, 200, 'white');

  }