"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const BulletPool = require('./bullet_pool');
const Enemy = require('./enemies');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);

var backgrounds = [
	new Image(),
	new Image(),
	new Image(),
	new Image()
];
backgrounds[0].src = 'assets/space/stars.png';
backgrounds[1].src = 'assets/space/big_stars.png';
backgrounds[2].src = 'assets/space/planets.png';
backgrounds[3].src = 'assets/space/asteroids.png';

var input = {
  up: false,
  down: false,
  left: false,
  right: false
}
var firing = false;
var camera = new Camera(canvas, 4096);
var bullets = new BulletPool(50);
var enemyBullets = new BulletPool(100);
var missiles = [];
var enemies = [];
var state = "playing";
var player = new Player(bullets, missiles, {x: camera.x, y: camera.y});
var enemiesLeft = 20;
for(var i = 0; i < 20; i++)
{
	var type = Math.floor(Math.random()*2);
	var x = Math.floor((Math.random()*600)+100);
	var y = Math.floor(Math.random()*(4096-canvas.height));
	if(type == 0) var enemy = new Enemy(enemyBullets, {x: x, y: y}, "sphere");
	else if(type == 1) var enemy = new Enemy(enemyBullets, {x:x, y:y}, "triangle");
	enemies.push(enemy);
}

/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
	case " ":
		firing = true;
		event.preventDefault();
		break;
  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
	case " ":
		firing = false;
		event.preventDefault();
	break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
	if(state == "playing")
	{
	if(player.state == "alive")
	{var dead = 0;
	// update the player
	player.update(elapsedTime, input, firing, camera.y);

	// update the camera
	camera.update(player.position);

	// Update bullets
	bullets.update(elapsedTime, function(bullet){
		if(!camera.onScreen(bullet)) return true;
		return false;
	});
	enemyBullets.update(elapsedTime, function(bullet)
	{
		if(!camera.onScreen(bullet)) return true;
		return false;
	});
	
	// Update missiles
	var markedForRemoval = [];
	missiles.forEach(function(missile, i){
	missile.update(elapsedTime);
	if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
		markedForRemoval.unshift(i);
	});
  	//Update the enemies
	enemies.forEach(function(enemy, i){
		enemy.update(elapsedTime, camera.y, player.position);
		if(enemy.state == "dead") dead++;
		if(dead == 20) state = "won";
	});
  // Remove missiles that have gone off-screen
	markedForRemoval.forEach(function(index){
		missiles.splice(index, 1);
	});
	
	var potentialEnemyHits = [];
	//Check for collision of player bullets and player against enemies

		enemies.forEach(function (enemy) {
			if(camera.onScreen(enemy.position))
			{	
				for(var i = 0; i < bullets.end; i++)
				{
					var br = bullets.pool[6*i+5];
					var by = bullets.pool[6*i+1];
					if(Math.abs(by - enemy.position.y) < enemy.height)
					{
						if(enemy.state == "alive") potentialEnemyHits.push({enemy: enemy, bulletIndex: i});
					}			
				}

				if(Math.abs(enemy.position.y-player.position.y) < enemy.height)
				{
					if(enemy.state == "alive") potentialEnemyHits.push({enemy: enemy, bulletIndex: -1});
				}
			}
		});
	
	var potentialPlayerHits = [];
	//Check for collision of enemy bullets with the player
	for(var i = 0; i < enemyBullets.end; i++)
	{
		var br = enemyBullets.pool[6*i+5];
		var by = enemyBullets.pool[6*i+1];

		if(Math.abs(by - player.position.y) < player.height)
		{
			if(player.state == "alive") potentialPlayerHits.push({player: player, bulletIndex: i});
		}				
	}
	
	potentialEnemyHits.forEach(function(hit)
	{		

		if(hit.bulletIndex != -1)
		{		
			var bx = bullets.pool[6*hit.bulletIndex];
			var by = bullets.pool[6*hit.bulletIndex+1];
			var br = bullets.pool[6*hit.bulletIndex+5];

			if(!(bx+br*2 < hit.enemy.position.x || bx > hit.enemy.position.x + hit.enemy.width
				|| by+br*2 < hit.enemy.position.y || by > hit.enemy.position.y + hit.enemy.height))
			{
				bullets.remove(hit.bulletIndex);
				hit.enemy.damage();
			}
		}
		else
		{
			if(!(player.position.x + player.width < hit.enemy.position.x
				|| player.position.x > hit.enemy.position.x + hit.enemy.width
				|| player.position.y+player.height < hit.enemy.position.y
				|| player.position.y > hit.enemy.position.y + hit.enemy.height))
			{
				player.damage();
				if(player.life == 0) state = "lost";
			}
		}
	});
	
	potentialPlayerHits.forEach(function(hit)
	{
		var bx = enemyBullets.pool[6*hit.bulletIndex];
		var by = enemyBullets.pool[6*hit.bulletIndex+1];
		var br = enemyBullets.pool[6*hit.bulletIndex+5];
		if(!(bx+br*2 < hit.player.position.x || bx > hit.player.position.x + hit.player.width
				|| by+br*2 < hit.player.position.y || by > hit.player.position.y + hit.player.height))
		{
			enemyBullets.remove(hit.bulletIndex);
			player.damage();
			if(player.life == 0) state = "lost";
		}
	});
	}
	}
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1024, 786);

	//Render the background
	//Stars
	ctx.save();
	ctx.translate(0, -camera.y * 0.2);
	ctx.drawImage(backgrounds[0], 0, 0);
	ctx.restore();

	//Big stars
	ctx.save();
	ctx.translate(0, -camera.y * 0.4);
	ctx.drawImage(backgrounds[1], 0, 0);
	ctx.restore();

	//Planets
	ctx.save();
	ctx.translate(0, -camera.y*0.6);
	ctx.drawImage(backgrounds[2], 0, 0);
	ctx.restore();
	
	//Asteroids
	ctx.save();
	ctx.translate(0, -camera.y);
	ctx.drawImage(backgrounds[3], 0, 0);
	ctx.restore();
  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD coordinates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
	//Render enemies
	enemies.forEach(function(enemy, i){
		enemy.render(elapsedTime, ctx);
	});
	
	// Render the bullets
    bullets.render(elapsedTime, ctx);
	enemyBullets.render(elapsedTime, ctx);
    // Render the missiles
    missiles.forEach(function(missile) {
      missile.render(elapsedTime, ctx);
    });
	// Render the player
    player.render(elapsedTime, ctx, input);

}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI

  //Health bar  
  ctx.fillStyle = "red";
  ctx.fillRect(10, 10, 250, 50);
  ctx.strokeStyle = "dimgrey";
  ctx.lineWidth = 4;
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(10, 10, 50*player.life, 50);

  ctx.strokeRect(10, 10, 250, 50);
  
  if(state == "won")
  {
	ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
	ctx.fillRect(0, canvas.height/4, canvas.width, 320);
	ctx.fillStyle = 'black';
	ctx.font = "40px Arial"; 
	ctx.fillText("You beat the level!", canvas.width/3 + 5, canvas.height/3 + 60);
	ctx.fillText("Level Score: 4550", canvas.width/5 + 150, canvas.height/3+140);
  }
  else if(state == "lost")
  {
	ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
	ctx.fillRect(0, canvas.height/4, canvas.width, 320);
	ctx.fillStyle = 'black';
	ctx.font = "40px Arial"; 
	ctx.fillText("You lost :/ refresh your browser (No reset yet)", 100, canvas.height/3 + 60);
  }
}
