"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

/* Constants */ 
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, missiles) {
  this.missiles = missiles;
  this.missileCount = 4;
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: 200, y: 200};
  this.velocity = {x: 0, y: 0};
  this.img = new Image()
  this.img.src = 'assets/sprites/ship_sprites.png';
  this.frame = 0;
  this.timer = 0;
  this.bulletDelay = 200;
  this.bulletTimer = this.bulletDelay;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input, firing) {
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
  if(input.up) this.velocity.y -= PLAYER_SPEED / 2;
  if(input.down) this.velocity.y += PLAYER_SPEED / 2;

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // don't let the player move off-screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > 982) this.position.x = 982;
  if(this.position.y > 756) this.position.y = 756;
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
  if(input.right) offset = 4;
  ctx.drawImage(this.img, 32*(offset + this.frame), 0, 32, 32, this.position.x, this.position.y, 32, 32);
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
	var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
	this.bullets.add({x: this.position.x, y: this.position.y - 16}, velocity);
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
