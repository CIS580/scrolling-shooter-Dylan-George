"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

/* Constants */ 
const PLAYER_SPEED = 7;
const BULLET_SPEED = 10;
const SCROLL_SPEED = 1;
/**
 * @module Player
 * A class representing a player's ship
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, missiles, position) {
  this.missiles = missiles;
  this.missileCount = 4;
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: 480, y: position.y+700};
  this.velocity = {x: 0, y: 0};
  this.img = new Image()
  this.img.src = 'assets/sprites/ship_sprites.png';
  this.frame = 0;
  this.timer = 0;
  this.bulletDelay = 100;
  this.bulletTimer = this.bulletDelay;
  this.height = 64;
  this.width = 64;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input, firing, cameraY) {
	this.timer+=elapsedTime;
	this.bulletTimer+=elapsedTime;
	if(this.timer >= 50)
	{
		this.timer = 0;
		if(this.frame == 1) this.frame = 0;
		else this.frame = 1;
	}
	
	if(firing && this.bulletTimer >= this.bulletDelay)
	{
		this.bulletTimer = 0;
		this.fireBullet({x: 0, y: -1});
	}
  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED;
  this.velocity.y = 0;
  if(input.up) this.velocity.y -= PLAYER_SPEED / 2 + SCROLL_SPEED;
  else if(input.down) this.velocity.y += PLAYER_SPEED / 2;
  else if(cameraY > 0) this.position.y -= SCROLL_SPEED;
  
  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // don't let the player move off-screen
  if(this.position.x < 0) this.position.x = 0;
  else if(this.position.x > 964) this.position.x = 964;
  else if(this.position.y > cameraY+746) this.position.y = cameraY+746;
  else if(this.position.y < cameraY) this.position.y = cameraY;
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx, input) {
  var offset = 0;
  if(input.left) offset = 2;
  else if(input.right) offset = 4;
  ctx.drawImage(this.img, 64*(offset + this.frame), 0, 64, 64, this.position.x, this.position.y, 64, 64);
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
	var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
	var frame = {x: 0, y: 64, width: 64, height: 64};
	this.bullets.add({x: this.position.x-20, y: this.position.y - 16}, velocity, frame, 5);
	this.bullets.add({x: this.position.x+20, y: this.position.y - 16}, velocity, frame, 5);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}
