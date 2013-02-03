//----------------------------------------------------------------------------------------------------------------------------------------------------------------

//Global Variables

var width = 320, 
    height = 500,
    gLoop,
    points = 0,
    state = true,
    c = document.getElementById('c'), 
    ctx = c.getContext('2d');

c.width = width;
c.height = height;

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

//Draw canvas

var clear = function(){
	ctx.fillStyle = '#d0e7f9';
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.closePath();
	ctx.fill();
}

var howManyCircles = 10, circles = [];

for (var i = 0; i < howManyCircles; i++) 
{	
	circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() / 2]);
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

// To draw the random circles and stor the in an array

var DrawCircles = function(){
	for (var i = 0; i < howManyCircles; i++) {
		ctx.fillStyle = 'rgba(255, 255, 255, ' + circles[i][3] + ')';
				ctx.beginPath();
				ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				}
				};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

				//  To move the circles from up to down

				var MoveCircles = function(e){
				for (var i = 0; i < howManyCircles; i++) {
				if (circles[i][1] - circles[i][2] > height) {
				circles[i][0] = Math.random() * width;
				circles[i][2] = Math.random() * 100;
				circles[i][1] = 0 - circles[i][2];
				circles[i][3] = Math.random() / 2;
				}
				else {
					circles[i][1] += e;
				}
				}
				};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

//Draw the Angel and to swap the up and down images

var player = new (function(){
		var that = this;
		that.image = new Image();

		that.image.src = "angel.png"
		that.width = 65;
		that.height = 95;
		that.frames = 1;
		that.actualFrame = 0;
		that.X = 0;
		that.Y = 0;	

		that.isJumping = false;
		that.isFalling = false;
		that.jumpSpeed = 0;
		that.fallSpeed = 0;

		that.jump = function() {
		if (!that.isJumping && !that.isFalling) {
		that.fallSpeed = 0;
		that.isJumping = true;
		that.jumpSpeed = 17;
		}
		}

		that.checkJump = function() {

			if (that.Y > height*0.4) {
				that.setPosition(that.X, that.Y - that.jumpSpeed);		
			}
			else {
				if (that.jumpSpeed > 10) 
					points++;
				// if player is in mid of the gamescreen
				// dont move player up, move obstacles down instead
				MoveCircles(that.jumpSpeed * 0.5);

				platforms.forEach(function(platform, ind){
						platform.y += that.jumpSpeed;

						if (platform.y > height) {
						var type = ~~(Math.random() * 5);
						if (type == 0) 
						type = 1;
						else 
						type = 0;

						platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type);
						}
						});
			}


			that.jumpSpeed--;
			if (that.jumpSpeed == 0) {
				that.isJumping = false;
				that.isFalling = true;
				that.fallSpeed = 1;
			}

		}

		that.fallStop = function(){
			that.isFalling = false;
			that.fallSpeed = 0;
			that.jump();	
		}

		that.checkFall = function(){
			if (that.Y < height - that.height) {
				that.setPosition(that.X, that.Y + that.fallSpeed);
				that.fallSpeed++;
			} else {
				if (points == 0) 
					that.fallStop();
				else 
					GameOver();
			}
		}

		that.moveLeft = function(){
			if (that.X > 0) {
				that.setPosition(that.X - 5, that.Y);
			}
		}

		that.moveRight = function(){
			if (that.X + that.width < width) {
				that.setPosition(that.X + 5, that.Y);
			}
		}


		that.setPosition = function(x, y){
			that.X = x;
			that.Y = y;
		}

		that.interval = 0;
		that.draw = function(){
			try {
				ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
			} 
			catch (e) {
			};

			if (that.interval == 4 ) {
				if (that.actualFrame == that.frames) {
					that.actualFrame = 0;
				}
				else {
					that.actualFrame++;
				}
				that.interval = 0;
			}
			that.interval++;		
		}
})();

// Done to convert decimal to int

player.setPosition(~~((width-player.width)/2), height - player.height);
player.jump();

document.onmousemove = function(e){
	if (player.X + c.offsetLeft > e.pageX) {
		player.moveLeft();
	} else if (player.X + c.offsetLeft < e.pageX) {
		player.moveRight();
	}

}
var nrOfPlatforms = 7, 
    platforms = [],
    platformWidth = 70,
    platformHeight = 20;

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

// To shade and ramdomly move the platforms

var Platform = function(x, y, type){
	var that=this;

	that.firstColor = '#FF8C00';
	that.secondColor = '#EEEE00';
	that.onCollide = function(){
		player.fallStop();
	};

	if (type === 1) {
		that.firstColor = '#AADD00';
		that.secondColor = '#698B22';
		that.onCollide = function(){
			player.fallStop();
			player.jumpSpeed = 50;
		};
	}



	that.x = ~~ x;
	that.y = y;
	that.type = type;

	that.isMoving = ~~(Math.random() * 2);
	that.direction= ~~(Math.random() * 2) ? -1 : 1;

	that.draw = function(){
		ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		var gradient = ctx.createRadialGradient(that.x + (platformWidth/2), that.y + (platformHeight/2), 5, that.x + (platformWidth/2), that.y + (platformHeight/2), 45);
		gradient.addColorStop(0, that.firstColor);
		gradient.addColorStop(1, that.secondColor);
		ctx.fillStyle = gradient;
		ctx.fillRect(that.x, that.y, platformWidth, platformHeight);
	};

	return that;
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

// To make the platform randomly by giving co-ordinates

var generatePlatforms = function(){
	var position = 0, type;
	for (var i = 0; i < nrOfPlatforms; i++) {
		type = ~~(Math.random()*5);
		if (type == 0) 
			type = 1;
		else 
			type = 0;
		platforms[i] = new Platform(Math.random() * (width - platformWidth), position, type);
		if (position < height - platformHeight) 
			position += ~~(height / nrOfPlatforms);
	}
}();


//----------------------------------------------------------------------------------------------------------------------------------------------------------------

// To check if the angel steps on the platform

var checkCollision = function(){
	platforms.forEach(function(e, ind){
			if (
				(player.isFalling) && 
				(player.X < e.x + platformWidth) && 
				(player.X + player.width > e.x) && 
				(player.Y + player.height > e.y) && 
				(player.Y + player.height < e.y + platformHeight)
			   ) {
			e.onCollide();
			}
			})
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

// The main game loop

var GameLoop = function(){
	clear();
	//MoveCircles(5);
	DrawCircles();

	if (player.isJumping) player.checkJump();
	if (player.isFalling) player.checkFall();
	
	player.draw();
	
	platforms.forEach(function(platform, index){
		if (platform.isMoving) {
			if (platform.x < 0) {
				platform.direction = 1;
			} else if (platform.x > width - platformWidth) {
				platform.direction = -1;
			}
				platform.x += platform.direction * (index / 2) * ~~(points / 100);
			}
		platform.draw();
	});
	
	checkCollision();
	ctx.fillStyle = "Black";
	ctx.font = 'italic 10px Calibri';
	ctx.fillText("POINTS:" + points, 10, height-10);
	
	if (state)
		gLoop = setTimeout(GameLoop, 1000 / 50);
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------

// When game is over

var GameOver = function(){
		state = false;
		clearTimeout(gLoop);
		setTimeout(function(){
			clear();
			
			ctx.fillStyle = "Black";
			//ctx.font = "10pt Arial";
			ctx.font = 'italic 40px Calibri';
			ctx.fillText("GAME OVER", width / 2 - 110, height / 2 - 100);
			ctx.font = 'italic 20px Calibri';
			ctx.fillText("YOUR RESULT:" + points, width / 2 - 80, height / 2 - 30);
		}, 100);
		
	};
	
GameLoop();
