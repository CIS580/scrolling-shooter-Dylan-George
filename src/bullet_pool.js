"use strict";

/**
 * @module BulletPool
 * A class for managing bullets in-game
 * We use a Float32Array to hold our bullet info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = BulletPool;

/**
 * @constructor BulletPool
 * Creates a BulletPool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function BulletPool(maxSize) {
	this.pool = new Array(6 * maxSize);
	this.end = 0;
	this.max = maxSize;
	this.img = new Image();
	this.img.src = 'assets/sprites/ship_sprites.png';
}

/**
 * @function add
 * Adds a new bullet to the end of the BulletPool.
 * If there is no room left, no bullet is created.
 * @param {Vector} position where the bullet begins
 * @param {Vector} velocity the bullet's velocity
*/
BulletPool.prototype.add = function(position, velocity, frame, radius) {
  if(this.end < this.max) {
    this.pool[6*this.end] = position.x;
    this.pool[6*this.end+1] = position.y-12;
    this.pool[6*this.end+2] = velocity.x;
    this.pool[6*this.end+3] = velocity.y;
	this.pool[6*this.end+4] = frame;
	this.pool[6*this.end+5] = radius;
    this.end++;
  }
}

/**
 * @function update
 * Updates the bullet using its stored velocity, and
 * calls the callback function passing the transformed
 * bullet.  If the callback returns true, the bullet is
 * removed from the pool.
 * Removed bullets are replaced with the last bullet's values
 * and the size of the bullet array is reduced, keeping
 * all live bullets at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the bullet's position,
 * if the return value is true, the bullet is removed from the pool
 */
BulletPool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the bullet
    this.pool[6*i] += this.pool[6*i+2];
    this.pool[6*i+1] += this.pool[6*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[6*i],
      y: this.pool[6*i+1]
    })) {
      // Swap the current and last bullet if we
      // need to remove the current bullet
      this.remove(i);
      // Reduce our iterator by 1 so that we update the
      // freshly swapped bullet.
      i--;
    }
  }
}

//Remove a bullet from the bullet pool
BulletPool.prototype.remove = function(i) {
	this.pool[6*i] = this.pool[6*(this.end-1)];
	this.pool[6*i+1] = this.pool[6*(this.end-1)+1];
	this.pool[6*i+2] = this.pool[6*(this.end-1)+2];
	this.pool[6*i+3] = this.pool[6*(this.end-1)+3];
	this.pool[6*i+4] = this.pool[6*(this.end-1)+4];
	this.pool[6*i+5] = this.pool[6*(this.end-1)+5];
	// Reduce the total number of bullets by 1
	this.end--;
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
BulletPool.prototype.render = function(elapsedTime, ctx) {
  // Render the bullets as a single path
  ctx.save();
  for(var i = 0; i < this.end; i++) {
	
    var frame = this.pool[6*i+4];
    ctx.moveTo(this.pool[6*i], this.pool[6*i+1]);
	ctx.drawImage(
		this.img, 
		frame.x, frame.y, 
		frame.width, frame.height, 
		this.pool[6*i], this.pool[6*i+1], 
		frame.width, frame.height);
  }
  ctx.restore();
}
