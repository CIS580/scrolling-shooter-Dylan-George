"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');
const Particles = require('./particles');

/* Constants */ 
const BULLET_SPEED = 10;
const SCROLL_SPEED = 1;
/**
 * @module Enemy
 * A class representing enemies
 */
module.exports = exports = Enemy;

/**
 * @constructor Enemy
 * Creates a Enemy
 * @param {BulletPool} bullets the bullet pool
 */
function Enemy(bullets, position, type) {
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: position.x, y: position.y};
  this.velocity = {x: 0, y: 0};
  this.img = new Image();
  this.img.src = 'assets/sprites/ship_sprites.png';
  this.frame = 0;
  this.timer = 0;
  this.name = type;
  this.particles = new Particles(20);
  this.particleCount = 0;
  this.state = "alive";
  if(type == "sphere") 
  {
	this.width = 100;
	this.height = 100;
	this.size = 128;
	this.radius = 25;
	this.life = 10;
	this.bulletFrame = {x: 0, y: 512, width: 64, height: 64};
	this.shotPosition = {x: this.position.x + 32, y: this.position.y + 40};
	this.shotRadius = 9;
	this.attackDelay = 500;
	this.attackTimer = this.attackDelay;
  }
  else if(type == "triangle")
  {
	this.width = 40;
	this.height = 40;
	this.radius = 25;
	this.life = 5;
	this.size = 64;
	this.bulletFrame = {x: 0, y: 192, width: 64, height: 64};
	this.shotPosition = {x: this.position.x + 32, y: this.position.y + 40};
	this.shotRadius = 9;
	this.speed = 5;
	this.direction = "left";
	this.attackDelay = 1000;
	this.attackTimer = this.attackDelay;
  }
}

/**
 * @function update
 * Updates the Enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Enemy.prototype.update = function(elapsedTime, cameraY, player) {
	if(this.state == "dying")
	{
		if(this.particleCount < 20)
		{
			var randX = Math.floor((Math.random() * this.size));
			var randY = Math.floor((Math.random() * this.size));
			this.particles.emit({x: this.position.x + randX, y: this.position.y + randY});
			this.particleCount++;
		}
		else this.state = "dead";
		this.particles.update(elapsedTime);
	}
	else if(this.state != "dead")
	{
		this.attackTimer+=elapsedTime;
		if(this.attackTimer >= this.attackDelay)
		{
			if(this.name == "sphere")
			{
				this.timer+=elapsedTime;
				if(this.timer >= 50)
				{
					this.timer = 0;

					if(this.frame < 4) this.frame++;
					else
					{
						this.attackTimer = 0;
						this.fireBullet(player);
					}
				}
			}
			else if(this.name == "triangle")
			{
				this.fireBullet({x:0, y:this.shotPosition.y + 10000});
				this.attackTimer = 0;
			}
		}
		
		if(this.name == "triangle")
		{
			this.timer+=elapsedTime;
			if(this.position.x < 0) this.direction = "right"; 
			else if(this.position.x > 765) this.direction = "left"; 
			if(this.direction == "right") this.position.x +=1;
			else if(this.direction == "left")this.position.x-=1;
			this.shotPosition.x = this.position.x;
			if(this.timer >= 50)
			{
				this.timer = 0;

				if(this.frame < 1) this.frame++;
				else this.frame = 0;
			}
		}
	}
  this.y+=SCROLL_SPEED;
}

/**
 * @function render
 * Renders the Enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Enemy.prototype.render = function(elapsedTime, ctx) {
	if(this.life>0)
	{
		if(this.name == "sphere") ctx.drawImage(this.img, 128*this.frame, 384, 128, 128, this.position.x, this.position.y, 128, 128);
		else if(this.name == "triangle") ctx.drawImage(this.img, 64*this.frame, 128, 64, 64, this.position.x, this.position.y, 64, 64);
	}
	this.particles.render(elapsedTime, ctx, {r:142, g: 142, b: 142});
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Enemy.prototype.fireBullet = function(player) {
	this.frame = 0;
    var direction = Vector.subtract(
		player, 
		this.shotPosition
    );
	var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
	this.bullets.add(this.shotPosition, velocity, this.bulletFrame, this.shotRadius);
}

Enemy.prototype.damage = function()
{
	this.life--;
	if(this.life <= 0)
	{
		this.state = "dying";
	}
}

/**
 * @function fireMissile
 * Fires a missile, if the Enemy still has missiles
 * to fire.
 */
Enemy.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}
