"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

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
  this.attackDelay = 500;
  this.attackTimer = this.attackDelay;
  if(type == "sphere") 
  {
	this.width = 100;
	this.height = 100;
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
	this.attackTimer+=elapsedTime;
	if(this.attackTimer >= this.attackDelay)
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
  
  // determine Enemy angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;
  
  this.y+=SCROLL_SPEED;
}

/**
 * @function render
 * Renders the Enemy in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Enemy.prototype.render = function(elapasedTime, ctx) {
  ctx.drawImage(this.img, 128*this.frame, 384, 128, 128, this.position.x, this.position.y, 128, 128);
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
		{x: this.position.x + 32, y: this.position.y + 40}
    );
	var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
	var frame = {x: 0, y: 512, width: 64, height: 64};
	this.bullets.add({x: this.position.x + 32, y: this.position.y + 40}, velocity, frame, 8);
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
