/**
 * @module Image
 * @submodule Image
 * @requires core
 * @requires constants
 * @requires filters
 */

/**
 * This module defines the <a href="#/p5.Image">p5.Image</a> class and P5 methods for
 * drawing images to the main display canvas.
 */

import p5 from '../core/main';
import Filters from './filters';

/*
 * Class methods
 */

/**
 * A class to describe an image.
 *
 * Images are rectangular grids of pixels that can be displayed and modified.
 *
 * Existing images can be loaded by calling
 * <a href="#/p5/loadImage">loadImage()</a>. Blank images can be created by
 * calling <a href="#/p5/createImage">createImage()</a>. `p5.Image` objects
 * have methods for common tasks such as applying filters and modifying
 * pixel values.
 *
 * @example
 * <div>
 * <code>
 * let img;
 *
 * // Load the image.
 * function preload() {
 *   img = loadImage('assets/bricks.jpg');
 * }
 *
 * function setup() {
 *   createCanvas(100, 100);
 *
 *   // Display the image.
 *   image(img, 0, 0);
 *
 *   describe('An image of a brick wall.');
 * }
 * </code>
 * </div>
 *
 * <div>
 * <code>
 * let img;
 *
 * // Load the image.
 * function preload() {
 *   img = loadImage('assets/bricks.jpg');
 * }
 *
 * function setup() {
 *   createCanvas(100, 100);
 *
 *   // Apply the GRAY filter.
 *   img.filter(GRAY);
 *
 *   // Display the image.
 *   image(img, 0, 0);
 *
 *   describe('A grayscale image of a brick wall.');
 * }
 * </code>
 * </div>
 *
 * <div>
 * <code>
 * function setup() {
 *   createCanvas(100, 100);
 *
 *   background(200);
 *
 *   // Create a p5.Image object.
 *   let img = createImage(66, 66);
 *
 *   // Load the image's pixels.
 *   img.loadPixels();
 *
 *   // Set the pixels to black.
 *   for (let x = 0; x < img.width; x += 1) {
 *     for (let y = 0; y < img.height; y += 1) {
 *       img.set(x, y, 0);
 *     }
 *   }
 *
 *   // Update the image.
 *   img.updatePixels();
 *
 *   // Display the image.
 *   image(img, 17, 17);
 *
 *   describe('A black square drawn in the middle of a gray square.');
 * }
 * </code>
 * </div>
 *
 * @class p5.Image
 * @constructor
 * @param {Number} width
 * @param {Number} height
 */
p5.Image = class {
  constructor(width, height) {
    /**
     * The image's width in pixels.
     *
     * @type {Number}
     * @property {Number} width
     * @name width
     * @readOnly
     *
     * @example
     * <div>
     * <code>
     * let img;
     *
     * // Load the image.
     * function preload() {
     *   img = loadImage('assets/rockies.jpg');
     * }
     *
     * function setup() {
     *   createCanvas(100, 100);
     *
     *   // Display the image.
     *   image(img, 0, 0);
     *
     *   // Calculate the center coordinates.
     *   let x = img.width / 2;
     *   let y = img.height / 2;
     *
     *   // Draw a circle at the image's center.
     *   circle(x, y, 20);
     *
     *   describe('An image of a mountain landscape with a white circle drawn in the middle.');
     * }
     * </code>
     * </div>
     */
    this.width = width;
    /**
     * The image's height in pixels.
     *
     * @type {Number}
     * @property height
     * @name height
     * @readOnly
     *
     * @example
     * <div>
     * <code>
     * let img;
     *
     * // Load the image.
     * function preload() {
     *   img = loadImage('assets/rockies.jpg');
     * }
     *
     * function setup() {
     *   createCanvas(100, 100);
     *
     *   // Display the image.
     *   image(img, 0, 0);
     *
     *   // Calculate the center coordinates.
     *   let x = img.width / 2;
     *   let y = img.height / 2;
     *
     *   // Draw a circle at the image's center.
     *   circle(x, y, 20);
     *
     *   describe('An image of a mountain landscape with a white circle drawn in the middle.');
     * }
     * </code>
     * </div>
     */
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.drawingContext = this.canvas.getContext('2d');
    this._pixelsState = this;
    this._pixelDensity = 1;
    //Object for working with GIFs, defaults to null
    this.gifProperties = null;
    //For WebGL Texturing only: used to determine whether to reupload texture to GPU
    this._modified = false;
    /**
     * An array containing the color of each pixel in the image.
     *
     * Colors are stored as numbers representing red, green, blue, and alpha
     * (RGBA) values. `img.pixels` is a one-dimensional array for performance
     * reasons.
     *
     * Each pixel occupies four elements in the pixels array, one for each
     * RGBA value. For example, the pixel at coordinates (0, 0) stores its
     * RGBA values at `img.pixels[0]`, `img.pixels[1]`, `img.pixels[2]`,
     * and `img.pixels[3]`, respectively. The next pixel at coordinates (1, 0)
     * stores its RGBA values at `img.pixels[4]`, `img.pixels[5]`,
     * `img.pixels[6]`, and `img.pixels[7]`. And so on. The `img.pixels` array
     * for a 100×100 <a href="#/p5.Image">p5.Image</a> object has
     * 100 × 100 × 4 = 40,000 elements.
     *
     * Accessing the RGBA values for a pixel in the image requires a little
     * math as shown in the examples below. The
     * <a href="#/p5.Image/loadPixels">img.loadPixels()</a>
     * method must be called before accessing the `img.pixels` array. The
     * <a href="#/p5.Image/updatePixels">img.updatePixels()</a> method must be
     * called after any changes are made.
     *
     * @property {Number[]} pixels
     * @name pixels
     *
     * @example
     * <div>
     * <code>
     * function setup() {
     *   createCanvas(100, 100);
     *
     *   background(200);
     *
     *   // Create a p5.Image object.
     *   let img = createImage(66, 66);
     *
     *   // Load the image's pixels.
     *   img.loadPixels();
     *
     *   for (let i = 0; i < img.pixels.length; i += 4) {
     *     // Red.
     *     img.pixels[i] = 0;
     *     // Green.
     *     img.pixels[i + 1] = 0;
     *     // Blue.
     *     img.pixels[i + 2] = 0;
     *     // Alpha.
     *     img.pixels[i + 3] = 255;
     *   }
     *
     *   // Update the image.
     *   img.updatePixels();
     *
     *   // Display the image.
     *   image(img, 17, 17);
     *
     *   describe('A black square drawn in the middle of a gray square.');
     * }
     * </code>
     * </div>
     *
     * <div>
     * <code>
     * function setup() {
     *   createCanvas(100, 100);
     *
     *   background(200);
     *
     *   // Create a p5.Image object.
     *   let img = createImage(66, 66);
     *
     *   // Load the image's pixels.
     *   img.loadPixels();
     *
     *   // Set the pixels to red.
     *   for (let i = 0; i < img.pixels.length; i += 4) {
     *     // Red.
     *     img.pixels[i] = 255;
     *     // Green.
     *     img.pixels[i + 1] = 0;
     *     // Blue.
     *     img.pixels[i + 2] = 0;
     *     // Alpha.
     *     img.pixels[i + 3] = 255;
     *   }
     *
     *   // Update the image.
     *   img.updatePixels();
     *
     *   // Display the image.
     *   image(img, 17, 17);
     *
     *   describe('A red square drawn in the middle of a gray square.');
     * }
     * </code>
     * </div>
     */
    this.pixels = [];
  }

  /**
 * Gets or sets the pixel density for high pixel density displays.
 *
 * By default, the density will be set to 1.
 *
 * Call this method with no arguments to get the default density, or pass
 * in a number to set the density. If a non-positive number is provided,
 * it defaults to 1.
 *
 * @method pixelDensity
 * @param {Number} [density] A scaling factor for the number of pixels per
 * side
 * @returns {Number} The current density if called without arguments, or the instance for chaining if setting density.
 */
  pixelDensity(density) {
    if (typeof density !== 'undefined') {
    // Setter: set the density and handle resize
      if (density <= 0) {
        const errorObj = {
          type: 'INVALID_VALUE',
          format: { types: ['Number'] },
          position: 1
        };

        p5._friendlyParamError(errorObj, 'pixelDensity');

        // Default to 1 in case of an invalid value
        density = 1;
      }

      this._pixelDensity = density;

      // Adjust canvas dimensions based on pixel density
      this.width /= density;
      this.height /= density;

      return this; // Return the image instance for chaining if needed
    } else {
    // Getter: return the default density
      return this._pixelDensity;
    }
  }

  /**
   * Helper function for animating GIF-based images with time
   */
  _animateGif(pInst) {
    const props = this.gifProperties;
    const curTime = pInst._lastRealFrameTime || window.performance.now();
    if (props.lastChangeTime === 0) {
      props.lastChangeTime = curTime;
    }
    if (props.playing) {
      props.timeDisplayed = curTime - props.lastChangeTime;
      const curDelay = props.frames[props.displayIndex].delay;
      if (props.timeDisplayed >= curDelay) {
        //GIF is bound to 'realtime' so can skip frames
        const skips = Math.floor(props.timeDisplayed / curDelay);
        props.timeDisplayed = 0;
        props.lastChangeTime = curTime;
        props.displayIndex += skips;
        props.loopCount = Math.floor(props.displayIndex / props.numFrames);
        if (props.loopLimit !== null && props.loopCount >= props.loopLimit) {
          props.playing = false;
        } else {
          const ind = props.displayIndex % props.numFrames;
          this.drawingContext.putImageData(props.frames[ind].image, 0, 0);
          props.displayIndex = ind;
          this.setModified(true);
        }
      }
    }
  }

  /**
   * Helper fxn for sharing pixel methods
   */
  _setProperty(prop, value) {
    this[prop] = value;
    this.setModified(true);
  }

  /**
   * Loads the current value of each pixel in the image into the `img.pixels`
   * array.
   *
   * `img.loadPixels()` must be called before reading or modifying pixel
   * values.
   *
   * @method loadPixels
   *
   * @example
   * <div>
   * <code>
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Create a p5.Image object.
   *   let img = createImage(66, 66);
   *
   *   // Load the image's pixels.
   *   img.loadPixels();
   *
   *   // Set the pixels to black.
   *   for (let x = 0; x < img.width; x += 1) {
   *     for (let y = 0; y < img.height; y += 1) {
   *       img.set(x, y, 0);
   *     }
   *   }
   *
   *   // Update the image.
   *   img.updatePixels();
   *
   *   // Display the image.
   *   image(img, 17, 17);
   *
   *   describe('A black square drawn in the middle of a gray square.');
   * }
   * </code>
   * </div>
   *
   * <div>
     * <code>
     * function setup() {
     *   createCanvas(100, 100);
     *
     *   background(200);
     *
     *   // Create a p5.Image object.
     *   let img = createImage(66, 66);
     *
     *   // Load the image's pixels.
     *   img.loadPixels();
     *
     *   for (let i = 0; i < img.pixels.length; i += 4) {
     *     // Red.
     *     img.pixels[i] = 0;
     *     // Green.
     *     img.pixels[i + 1] = 0;
     *     // Blue.
     *     img.pixels[i + 2] = 0;
     *     // Alpha.
     *     img.pixels[i + 3] = 255;
     *   }
     *
     *   // Update the image.
     *   img.updatePixels();
     *
     *   // Display the image.
     *   image(img, 17, 17);
     *
     *   describe('A black square drawn in the middle of a gray square.');
     * }
     * </code>
     * </div>
   */
  loadPixels() {
    p5.Renderer2D.prototype.loadPixels.call(this);
    this.setModified(true);
  }

  /**
   * Updates the canvas with the RGBA values in the
   * <a href="#/p5.Image/pixels">img.pixels</a> array.
   *
   * `img.updatePixels()` only needs to be called after changing values in
   * the <a href="#/p5.Image/pixels">img.pixels</a> array. Such changes can be
   * made directly after calling
   * <a href="#/p5.Image/loadPixels">img.loadPixels()</a> or by calling
   * <a href="#/p5.Image/set">img.set()</a>.
   *
   * The optional parameters `x`, `y`, `width`, and `height` define a
   * subsection of the image to update. Doing so can improve performance in
   * some cases.
   *
   * If the image was loaded from a GIF, then calling `img.updatePixels()`
   * will update the pixels in current frame.
   *
   * @method updatePixels
   * @param {Integer} x x-coordinate of the upper-left corner
   *                    of the subsection to update.
   * @param {Integer} y y-coordinate of the upper-left corner
   *                    of the subsection to update.
   * @param {Integer} w width of the subsection to update.
   * @param {Integer} h height of the subsection to update.
   *
   * @example
   * <div>
   * <code>
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Create a p5.Image object.
   *   let img = createImage(66, 66);
   *
   *   // Load the image's pixels.
   *   img.loadPixels();
   *
   *   // Set the pixels to black.
   *   for (let x = 0; x < img.width; x += 1) {
   *     for (let y = 0; y < img.height; y += 1) {
   *       img.set(x, y, 0);
   *     }
   *   }
   *
   *   // Update the image.
   *   img.updatePixels();
   *
   *   // Display the image.
   *   image(img, 17, 17);
   *
   *   describe('A black square drawn in the middle of a gray square.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Create a p5.Image object.
   *   let img = createImage(66, 66);
   *
   *   // Load the image's pixels.
   *   img.loadPixels();
   *
   *   // Set the pixels to black.
   *   for (let i = 0; i < img.pixels.length; i += 4) {
   *     // Red.
   *     img.pixels[i] = 0;
   *     // Green.
   *     img.pixels[i + 1] = 0;
   *     // Blue.
   *     img.pixels[i + 2] = 0;
   *     // Alpha.
   *     img.pixels[i + 3] = 255;
   *   }
   *
   *   // Update the image.
   *   img.updatePixels();
   *
   *   // Display the image.
   *   image(img, 17, 17);
   *
   *   describe('A black square drawn in the middle of a gray square.');
   * }
   * </code>
   * </div>
   */
  /**
   * @method updatePixels
   */
  updatePixels(x, y, w, h) {
    p5.Renderer2D.prototype.updatePixels.call(this, x, y, w, h);
    this.setModified(true);
  }

  /**
   * Gets a pixel or a region of pixels from the image.
   *
   * `img.get()` is easy to use but it's not as fast as
   * <a href="#/p5.Image/pixels">img.pixels</a>. Use
   * <a href="#/p5.Image/pixels">img.pixels</a> to read many pixel values.
   *
   * The version of `img.get()` with no parameters returns the entire image.
   *
   * The version of `img.get()` with two parameters, as in `img.get(10, 20)`,
   * interprets them as coordinates. It returns an array with the
   * `[R, G, B, A]` values of the pixel at the given point.
   *
   * The version of `img.get()` with four parameters, as in
   * `img,get(10, 20, 50, 90)`, interprets them as
   * coordinates and dimensions. The first two parameters are the coordinates
   * of the upper-left corner of the subsection. The last two parameters are
   * the width and height of the subsection. It returns a subsection of the
   * canvas in a new <a href="#/p5.Image">p5.Image</a> object.
   *
   * Use `img.get()` instead of <a href="#/p5/get">get()</a> to work directly
   * with images.
   *
   * @method get
   * @param  {Number}               x x-coordinate of the pixel.
   * @param  {Number}               y y-coordinate of the pixel.
   * @param  {Number}               w width of the subsection to be returned.
   * @param  {Number}               h height of the subsection to be returned.
   * @return {p5.Image}             subsection as a <a href="#/p5.Image">p5.Image</a> object.
   *
   * @example
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   // Copy the image.
   *   let img2 = get();
   *
   *   // Display the copied image on the right.
   *   image(img2, 50, 0);
   *
   *   describe('Two identical mountain landscapes shown side-by-side.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   // Get a pixel's color.
   *   let c = img.get(50, 90);
   *
   *   // Style the square using the pixel's color.
   *   fill(c);
   *   noStroke();
   *
   *   // Draw the square.
   *   square(25, 25, 50);
   *
   *   describe('A mountain landscape with an olive green square in its center.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   // Copy half of the image.
   *   let img2 = img.get(0, 0, img.width / 2, img.height / 2);
   *
   *   // Display half of the image.
   *   image(img2, 50, 50);
   *
   *   describe('A mountain landscape drawn on top of another mountain landscape.');
   * }
   * </code>
   * </div>
   */
  /**
   * @method get
   * @return {p5.Image}      whole <a href="#/p5.Image">p5.Image</a>
   */
  /**
   * @method get
   * @param  {Number}        x
   * @param  {Number}        y
   * @return {Number[]}      color of the pixel at (x, y) in array format `[R, G, B, A]`.
   */
  get(x, y, w, h) {
    p5._validateParameters('p5.Image.get', arguments);
    return p5.Renderer2D.prototype.get.apply(this, arguments);
  }

  _getPixel(...args) {
    return p5.Renderer2D.prototype._getPixel.apply(this, args);
  }

  /**
   * Sets the color of one or more pixels within an image.
   *
   * `img.set()` is easy to use but it's not as fast as
   * <a href="#/p5.Image/pixels">img.pixels</a>. Use
   * <a href="#/p5.Image/pixels">img.pixels</a> to set many pixel values.
   *
   * `img.set()` interprets the first two parameters as x- and y-coordinates. It
   * interprets the last parameter as a grayscale value, a `[R, G, B, A]` pixel
   * array, a <a href="#/p5.Color">p5.Color</a> object, or another
   * <a href="#/p5.Image">p5.Image</a> object.
   *
   * <a href="#/p5.Image/updatePixels">img.updatePixels()</a> must be called
   * after using `img.set()` for changes to appear.
   *
   * @method set
   * @param {Number}              x x-coordinate of the pixel.
   * @param {Number}              y y-coordinate of the pixel.
   * @param {Number|Number[]|Object}   a grayscale value | pixel array |
   *                                   <a href="#/p5.Color">p5.Color</a> object |
   *                                   <a href="#/p5.Image">p5.Image</a> to copy.
   *
   * @example
   * <div>
   * <code>
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Create a p5.Image object.
   *   let img = createImage(100, 100);
   *
   *   // Set four pixels to black.
   *   img.set(30, 20, 0);
   *   img.set(85, 20, 0);
   *   img.set(85, 75, 0);
   *   img.set(30, 75, 0);
   *
   *   // Update the image.
   *   img.updatePixels();
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('Four black dots arranged in a square drawn on a gray background.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Create a p5.Image object.
   *   let img = createImage(100, 100);
   *
   *   // Create a p5.Color object.
   *   let black = color(0);
   *
   *   // Set four pixels to black.
   *   img.set(30, 20, black);
   *   img.set(85, 20, black);
   *   img.set(85, 75, black);
   *   img.set(30, 75, black);
   *
   *   // Update the image.
   *   img.updatePixels();
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('Four black dots arranged in a square drawn on a gray background.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Create a p5.Image object.
   *   let img = createImage(66, 66);
   *
   *   // Draw a color gradient.
   *   for (let x = 0; x < img.width; x += 1) {
   *     for (let y = 0; y < img.height; y += 1) {
   *       let c = map(x, 0, img.width, 0, 255);
   *       img.set(x, y, c);
   *     }
   *   }
   *
   *   // Update the image.
   *   img.updatePixels();
   *
   *   // Display the image.
   *   image(img, 17, 17);
   *
   *   describe('A square with a horizontal color gradient from black to white drawn on a gray background.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Create a p5.Image object.
   *   let img2 = createImage(100, 100);
   *
   *   // Set the blank image's pixels using the landscape.
   *   img2.set(0, 0, img);
   *
   *   // Display the second image.
   *   image(img2, 0, 0);
   *
   *   describe('An image of a mountain landscape.');
   * }
   * </code>
   * </div>
   */
  set(x, y, imgOrCol) {
    p5.Renderer2D.prototype.set.call(this, x, y, imgOrCol);
    this.setModified(true);
  }

  /**
   * Resizes the image to a given width and height.
   *
   * The image's original aspect ratio can be kept by passing 0 for either
   * `width` or `height`. For example, calling `img.resize(50, 0)` on an image
   * that was 500 &times; 300 pixels will resize it to 50 &times; 30 pixels.
   *
   * @method resize
   * @param {Number} width resized image width.
   * @param {Number} height resized image height.
   *
   * @example
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   // Resize the image.
   *   img.resize(50, 100);
   *
   *   // Display the resized image.
   *   image(img, 0, 0);
   *
   *   describe('Two images of a mountain landscape. One copy of the image is squeezed horizontally.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   // Resize the image, keeping the aspect ratio.
   *   img.resize(0, 30);
   *
   *   // Display the resized image.
   *   image(img, 0, 0);
   *
   *   describe('Two images of a mountain landscape. The small copy of the image covers the top-left corner of the larger image.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   // Resize the image, keeping the aspect ratio.
   *   img.resize(60, 0);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('Two images of a mountain landscape. The small copy of the image covers the top-left corner of the larger image.');
   * }
   * </code>
   * </div>
   */
  resize(width, height) {
    // Copy contents to a temporary canvas, resize the original
    // and then copy back.
    //
    // There is a faster approach that involves just one copy and swapping the
    // this.canvas reference. We could switch to that approach if (as i think
    // is the case) there an expectation that the user would not hold a
    // reference to the backing canvas of a p5.Image. But since we do not
    // enforce that at the moment, I am leaving in the slower, but safer
    // implementation.

    // auto-resize
    if (width === 0 && height === 0) {
      width = this.canvas.width;
      height = this.canvas.height;
    } else if (width === 0) {
      width = this.canvas.width * height / this.canvas.height;
    } else if (height === 0) {
      height = this.canvas.height * width / this.canvas.width;
    }

    width = Math.floor(width);
    height = Math.floor(height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;

    if (this.gifProperties) {
      const props = this.gifProperties;
      //adapted from github.com/LinusU/resize-image-data
      const nearestNeighbor = (src, dst) => {
        let pos = 0;
        for (let y = 0; y < dst.height; y++) {
          for (let x = 0; x < dst.width; x++) {
            const srcX = Math.floor(x * src.width / dst.width);
            const srcY = Math.floor(y * src.height / dst.height);
            let srcPos = (srcY * src.width + srcX) * 4;
            dst.data[pos++] = src.data[srcPos++]; // R
            dst.data[pos++] = src.data[srcPos++]; // G
            dst.data[pos++] = src.data[srcPos++]; // B
            dst.data[pos++] = src.data[srcPos++]; // A
          }
        }
      };
      for (let i = 0; i < props.numFrames; i++) {
        const resizedImageData = this.drawingContext.createImageData(
          width,
          height
        );
        nearestNeighbor(props.frames[i].image, resizedImageData);
        props.frames[i].image = resizedImageData;
      }
    }

    tempCanvas.getContext('2d').drawImage(
      this.canvas,
      0, 0, this.canvas.width, this.canvas.height,
      0, 0, tempCanvas.width, tempCanvas.height
    );

    // Resize the original canvas, which will clear its contents
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;

    //Copy the image back
    this.drawingContext.drawImage(
      tempCanvas,
      0, 0, width, height,
      0, 0, width, height
    );

    if (this.pixels.length > 0) {
      this.loadPixels();
    }

    this.setModified(true);
  }

  /**
   * Copies pixels from a source image to this image.
   *
   * The first parameter, `srcImage`, is an optional
   * <a href="#/p5.Image">p5.Image</a> object to copy. If a source image isn't
   * passed, then `img.copy()` can copy a region of this image to another
   * region.
   *
   * The next four parameters, `sx`, `sy`, `sw`, and `sh` determine the region
   * to copy from the source image. `(sx, sy)` is the top-left corner of the
   * region. `sw` and `sh` are the region's width and height.
   *
   * The next four parameters, `dx`, `dy`, `dw`, and `dh` determine the region
   * of this image to copy into. `(dx, dy)` is the top-left corner of the
   * region. `dw` and `dh` are the region's width and height.
   *
   * Calling `img.copy()` will scale pixels from the source region if it isn't
   * the same size as the destination region.
   *
   * @method copy
   * @param  {p5.Image|p5.Element} srcImage source image.
   * @param  {Integer} sx x-coordinate of the source's upper-left corner.
   * @param  {Integer} sy y-coordinate of the source's upper-left corner.
   * @param  {Integer} sw source image width.
   * @param  {Integer} sh source image height.
   * @param  {Integer} dx x-coordinate of the destination's upper-left corner.
   * @param  {Integer} dy y-coordinate of the destination's upper-left corner.
   * @param  {Integer} dw destination image width.
   * @param  {Integer} dh destination image height.
   *
   * @example
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Copy one region of the image to another.
   *   img.copy(7, 22, 10, 10, 35, 25, 50, 50);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   // Outline the copied region.
   *   stroke(255);
   *   noFill();
   *   square(7, 22, 10);
   *
   *   describe('An image of a mountain landscape. A square region is outlined in white. A larger square contains a pixelated view of the outlined region.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let mountains;
   * let bricks;
   *
   * // Load the images.
   * function preload() {
   *   mountains = loadImage('assets/rockies.jpg');
   *   bricks = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Calculate the center of the bricks image.
   *   let x = bricks.width / 2;
   *   let y = bricks.height / 2;
   *
   *   // Copy the bricks to the mountains image.
   *   mountains.copy(bricks, 0, 0, x, y, 0, 0, x, y);
   *
   *   // Display the mountains image.
   *   image(mountains, 0, 0);
   *
   *   describe('An image of a brick wall drawn at the top-left of an image of a mountain landscape.');
   * }
   * </code>
   * </div>
   */
  /**
   * @method copy
   * @param  {Integer} sx
   * @param  {Integer} sy
   * @param  {Integer} sw
   * @param  {Integer} sh
   * @param  {Integer} dx
   * @param  {Integer} dy
   * @param  {Integer} dw
   * @param  {Integer} dh
   */
  copy(...args) {
    p5.prototype.copy.apply(this, args);
  }

  /**
   * Masks part of the image with another.
   *
   * `img.mask()` uses another <a href="#/p5.Image">p5.Image</a> object's
   * alpha channel as the alpha channel for this image. Masks are cumulative
   * and can't be removed once applied. If the mask has a different
   * pixel density from this image, the mask will be scaled.
   *
   * @method mask
   * @param {p5.Image} srcImage source image.
   *
   * @example
   * <div>
   * <code>
   * let photo;
   * let maskImage;
   *
   * // Load the images.
   * function preload() {
   *   photo = loadImage('assets/rockies.jpg');
   *   maskImage = loadImage('assets/mask2.png');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the mask.
   *   photo.mask(maskImage);
   *
   *   // Display the image.
   *   image(photo, 0, 0);
   *
   *   describe('An image of a mountain landscape. The right side of the image has a faded patch of white.');
   * }
   * </code>
   * </div>
   */
  // TODO: - Accept an array of alpha values.
  mask(p5Image) {
    if (p5Image === undefined) {
      p5Image = this;
    }
    const currBlend = this.drawingContext.globalCompositeOperation;

    let imgScaleFactor = this._pixelDensity;
    let maskScaleFactor = 1;
    if (p5Image instanceof p5.Renderer) {
      maskScaleFactor = p5Image._pInst._pixelDensity;
    }

    const copyArgs = [
      p5Image,
      0,
      0,
      maskScaleFactor * p5Image.width,
      maskScaleFactor * p5Image.height,
      0,
      0,
      imgScaleFactor * this.width,
      imgScaleFactor * this.height
    ];

    this.drawingContext.globalCompositeOperation = 'destination-in';
    if (this.gifProperties) {
      for (let i = 0; i < this.gifProperties.frames.length; i++) {
        this.drawingContext.putImageData(
          this.gifProperties.frames[i].image,
          0,
          0
        );
        this.copy(...copyArgs);
        this.gifProperties.frames[i].image = this.drawingContext.getImageData(
          0,
          0,
          imgScaleFactor * this.width,
          imgScaleFactor * this.height
        );
      }
      this.drawingContext.putImageData(
        this.gifProperties.frames[this.gifProperties.displayIndex].image,
        0,
        0
      );
    } else {
      this.copy(...copyArgs);
    }
    this.drawingContext.globalCompositeOperation = currBlend;
    this.setModified(true);
  }

  /**
   * Applies an image filter to the image.
   *
   * The preset options are:
   *
   * `INVERT`
   * Inverts the colors in the image. No parameter is used.
   *
   * `GRAY`
   * Converts the image to grayscale. No parameter is used.
   *
   * `THRESHOLD`
   * Converts the image to black and white. Pixels with a grayscale value
   * above a given threshold are converted to white. The rest are converted to
   * black. The threshold must be between 0.0 (black) and 1.0 (white). If no
   * value is specified, 0.5 is used.
   *
   * `OPAQUE`
   * Sets the alpha channel to be entirely opaque. No parameter is used.
   *
   * `POSTERIZE`
   * Limits the number of colors in the image. Each color channel is limited to
   * the number of colors specified. Values between 2 and 255 are valid, but
   * results are most noticeable with lower values. The default value is 4.
   *
   * `BLUR`
   * Blurs the image. The level of blurring is specified by a blur radius. Larger
   * values increase the blur. The default value is 4. A gaussian blur is used
   * in `P2D` mode. A box blur is used in `WEBGL` mode.
   *
   * `ERODE`
   * Reduces the light areas. No parameter is used.
   *
   * `DILATE`
   * Increases the light areas. No parameter is used.
   *
   * @method filter
   * @param  {Constant} filterType  either THRESHOLD, GRAY, OPAQUE, INVERT,
   *                                POSTERIZE, ERODE, DILATE or BLUR.
   * @param  {Number} [filterParam] parameter unique to each filter.
   *
   * @example
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the INVERT filter.
   *   img.filter(INVERT);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('A blue brick wall.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the GRAY filter.
   *   img.filter(GRAY);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('A brick wall drawn in grayscale.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the THRESHOLD filter.
   *   img.filter(THRESHOLD);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('A brick wall drawn in black and white.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the OPAQUE filter.
   *   img.filter(OPAQUE);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('A red brick wall.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the POSTERIZE filter.
   *   img.filter(POSTERIZE, 3);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('An image of a red brick wall drawn with a limited color palette.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the BLUR filter.
   *   img.filter(BLUR, 3);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('A blurry image of a red brick wall.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the DILATE filter.
   *   img.filter(DILATE);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('A red brick wall with bright lines between each brick.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/bricks.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Apply the ERODE filter.
   *   img.filter(ERODE);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('A red brick wall with faint lines between each brick.');
   * }
   * </code>
   * </div>
   */
  filter(operation, value) {
    Filters.apply(this.canvas, Filters[operation], value);
    this.setModified(true);
  }

  /**
   * Copies a region of pixels from another image into this one.
   *
    * The first parameter, `srcImage`, is the
   * <a href="#/p5.Image">p5.Image</a> object to blend.
   *
   * The next four parameters, `sx`, `sy`, `sw`, and `sh` determine the region
   * to blend from the source image. `(sx, sy)` is the top-left corner of the
   * region. `sw` and `sh` are the regions width and height.
   *
   * The next four parameters, `dx`, `dy`, `dw`, and `dh` determine the region
   * of the canvas to blend into. `(dx, dy)` is the top-left corner of the
   * region. `dw` and `dh` are the regions width and height.
   *
   * The tenth parameter, `blendMode`, sets the effect used to blend the images'
   * colors. The options are `BLEND`, `DARKEST`, `LIGHTEST`, `DIFFERENCE`,
   * `MULTIPLY`, `EXCLUSION`, `SCREEN`, `REPLACE`, `OVERLAY`, `HARD_LIGHT`,
   * `SOFT_LIGHT`, `DODGE`, `BURN`, `ADD`, or `NORMAL`.
   *
   * @method blend
   * @param  {p5.Image} srcImage source image
   * @param  {Integer} sx x-coordinate of the source's upper-left corner.
   * @param  {Integer} sy y-coordinate of the source's upper-left corner.
   * @param  {Integer} sw source image width.
   * @param  {Integer} sh source image height.
   * @param  {Integer} dx x-coordinate of the destination's upper-left corner.
   * @param  {Integer} dy y-coordinate of the destination's upper-left corner.
   * @param  {Integer} dw destination image width.
   * @param  {Integer} dh destination image height.
   * @param  {Constant} blendMode the blend mode. either
   *     BLEND, DARKEST, LIGHTEST, DIFFERENCE,
   *     MULTIPLY, EXCLUSION, SCREEN, REPLACE, OVERLAY, HARD_LIGHT,
   *     SOFT_LIGHT, DODGE, BURN, ADD or NORMAL.
   *
   * Available blend modes are: normal | multiply | screen | overlay |
   *            darken | lighten | color-dodge | color-burn | hard-light |
   *            soft-light | difference | exclusion | hue | saturation |
   *            color | luminosity
   *
   * http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
   *
   * @example
   * <div>
   * <code>
   * let mountains;
   * let bricks;
   *
   * // Load the images.
   * function preload() {
   *   mountains = loadImage('assets/rockies.jpg');
   *   bricks = loadImage('assets/bricks_third.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Blend the bricks image into the mountains.
   *   mountains.blend(bricks, 0, 0, 33, 100, 67, 0, 33, 100, ADD);
   *
   *   // Display the mountains image.
   *   image(mountains, 0, 0);
   *
   *   // Display the bricks image.
   *   image(bricks, 0, 0);
   *
   *   describe('A wall of bricks in front of a mountain landscape. The same wall of bricks appears faded on the right of the image.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let mountains;
   * let bricks;
   *
   * // Load the images.
   * function preload() {
   *   mountains = loadImage('assets/rockies.jpg');
   *   bricks = loadImage('assets/bricks_third.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Blend the bricks image into the mountains.
   *   mountains.blend(bricks, 0, 0, 33, 100, 67, 0, 33, 100, DARKEST);
   *
   *   // Display the mountains image.
   *   image(mountains, 0, 0);
   *
   *   // Display the bricks image.
   *   image(bricks, 0, 0);
   *
   *   describe('A wall of bricks in front of a mountain landscape. The same wall of bricks appears transparent on the right of the image.');
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let mountains;
   * let bricks;
   *
   * // Load the images.
   * function preload() {
   *   mountains = loadImage('assets/rockies.jpg');
   *   bricks = loadImage('assets/bricks_third.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Blend the bricks image into the mountains.
   *   mountains.blend(bricks, 0, 0, 33, 100, 67, 0, 33, 100, LIGHTEST);
   *
   *   // Display the mountains image.
   *   image(mountains, 0, 0);
   *
   *   // Display the bricks image.
   *   image(bricks, 0, 0);
   *
   *   describe('A wall of bricks in front of a mountain landscape. The same wall of bricks appears washed out on the right of the image.');
   * }
   * </code>
   * </div>
   */
  /**
   * @method blend
   * @param  {Integer} sx
   * @param  {Integer} sy
   * @param  {Integer} sw
   * @param  {Integer} sh
   * @param  {Integer} dx
   * @param  {Integer} dy
   * @param  {Integer} dw
   * @param  {Integer} dh
   * @param  {Constant} blendMode
   */
  blend(...args) {
    p5._validateParameters('p5.Image.blend', arguments);
    p5.prototype.blend.apply(this, args);
    this.setModified(true);
  }

  /**
   * helper method for web GL mode to indicate that an image has been
   * changed or unchanged since last upload. gl texture upload will
   * set this value to false after uploading the texture.
   * @method setModified
   * @param {boolean} val sets whether or not the image has been
   * modified.
   * @private
   */
  setModified(val) {
    this._modified = val; //enforce boolean?
  }

  /**
   * helper method for web GL mode to figure out if the image
   * has been modified and might need to be re-uploaded to texture
   * memory between frames.
   * @method isModified
   * @private
   * @return {boolean} a boolean indicating whether or not the
   * image has been updated or modified since last texture upload.
   */
  isModified() {
    return this._modified;
  }

  /**
   * Saves the image to a file.
   *
    * By default, `img.save()` saves the image as a PNG image called
   * `untitled.png`.
   *
   * The first parameter, `filename`, is optional. It's a string that sets the
   * file's name. If a file extension is included, as in
   * `img.save('drawing.png')`, then the image will be saved using that
   * format.
   *
   * The second parameter, `extension`, is also optional. It sets the files format.
   * Either `'png'` or `'jpg'` can be used. For example, `img.save('drawing', 'jpg')`
   * saves the canvas to a file called `drawing.jpg`.
   *
   * Note: The browser will either save the file immediately or prompt the user
   * with a dialogue window.
   *
   * The image will only be downloaded as an animated GIF if it was loaded
   * from a GIF file. See <a href="#/p5/saveGif">saveGif()</a> to create new
   * GIFs.
   *
   * @method save
   * @param {String} filename filename. Defaults to 'untitled'.
   * @param  {String} [extension] file extension, either 'png' or 'jpg'.
   *                            Defaults to 'png'.
   *
   * @example
   * <div>
   * <code>
   * let img;
   *
   * // Load the image.
   * function preload() {
   *   img = loadImage('assets/rockies.jpg');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Display the image.
   *   image(img, 0, 0);
   *
   *   describe('An image of a mountain landscape. The image is downloaded when the user presses the "s", "j", or "p" key.');
   * }
   *
   * // Save the image with different options when the user presses a key.
   * function keyPressed() {
   *   if (key === 's') {
   *     img.save();
   *   } else if (key === 'j') {
   *     img.save('rockies.jpg');
   *   } else if (key === 'p') {
   *     img.save('rockies', 'png');
   *   }
   * }
   * </code>
   * </div>
   */
  save(filename, extension) {
    if (this.gifProperties) {
      p5.prototype.encodeAndDownloadGif(this, filename);
    } else {
      p5.prototype.saveCanvas(this.canvas, filename, extension);
    }
  }

  // GIF Section
  /**
   * Restarts an animated GIF at its first frame.
   *
   * @method reset
   *
   * @example
   * <div>
   * <code>
   * let gif;
   *
   * // Load the image.
   * function preload() {
   *   gif = loadImage('assets/arnott-wallace-wink-loop-once.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   describe('A cartoon face winks once and then freezes. Clicking resets the face and makes it wink again.');
   * }
   *
   * function draw() {
   *   background(255);
   *
   *   // Display the image.
   *   image(gif, 0, 0);
   * }
   *
   * // Reset the GIF when the user presses the mouse.
   * function mousePressed() {
   *   gif.reset();
   * }
   * </code>
   * </div>
   */
  reset() {
    if (this.gifProperties) {
      const props = this.gifProperties;
      props.playing = true;
      props.timeSinceStart = 0;
      props.timeDisplayed = 0;
      props.lastChangeTime = 0;
      props.loopCount = 0;
      props.displayIndex = 0;
      this.drawingContext.putImageData(props.frames[0].image, 0, 0);
    }
  }

  /**
   * Gets the index of the current frame in an animated GIF.
   *
   * @method getCurrentFrame
   * @return {Number}       index of the GIF's current frame.
   *
   * @example
   * <div>
   * <code>
   * let gif;
   *
   * // Load the image.
   * function preload() {
   *   gif = loadImage('assets/arnott-wallace-eye-loop-forever.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   describe('A cartoon eye repeatedly looks around, then outwards. A number displayed in the bottom-left corner increases from 0 to 124, then repeats.');
   * }
   *
   * function draw() {
   *   // Get the index of the current GIF frame.
   *   let index = gif.getCurrentFrame();
   *
   *   // Display the image.
   *   image(gif, 0, 0);
   *
   *   // Display the current frame.
   *   text(index, 10, 90);
   * }
   * </code>
   * </div>
   */
  getCurrentFrame() {
    if (this.gifProperties) {
      const props = this.gifProperties;
      return props.displayIndex % props.numFrames;
    }
  }

  /**
   * Sets the current frame in an animated GIF.
   *
   * @method setFrame
   * @param {Number} index index of the frame to display.
   *
   * @example
   * <div>
   * <code>
   * let gif;
   * let frameSlider;
   *
   * // Load the image.
   * function preload() {
   *   gif = loadImage('assets/arnott-wallace-eye-loop-forever.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Get the index of the last frame.
   *   let maxFrame = gif.numFrames() - 1;
   *
   *   // Create a slider to control which frame is drawn.
   *   frameSlider = createSlider(0, maxFrame);
   *   frameSlider.position(10, 80);
   *   frameSlider.size(80);
   *
   *   describe('A cartoon eye looks around when a slider is moved.');
   * }
   *
   * function draw() {
   *   // Get the slider's value.
   *   let index = frameSlider.value();
   *
   *   // Set the GIF's frame.
   *   gif.setFrame(index);
   *
   *   // Display the image.
   *   image(gif, 0, 0);
   * }
   * </code>
   * </div>
   */
  setFrame(index) {
    if (this.gifProperties) {
      const props = this.gifProperties;
      if (index < props.numFrames && index >= 0) {
        props.timeDisplayed = 0;
        props.lastChangeTime = 0;
        props.displayIndex = index;
        this.drawingContext.putImageData(props.frames[index].image, 0, 0);
      } else {
        console.log(
          'Cannot set GIF to a frame number that is higher than total number of frames or below zero.'
        );
      }
    }
  }

  /**
   * Returns the number of frames in an animated GIF.
   *
   * @method numFrames
   * @return {Number} number of frames in the GIF.
   *
   * @example
   * <div>
   * <code>
   * let gif;
   *
   * // Load the image.
   * function preload() {
   *   gif = loadImage('assets/arnott-wallace-eye-loop-forever.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   describe('A cartoon eye looks around. The text "n / 125" is shown at the bottom of the canvas.');
   * }
   *
   * function draw() {
   *   // Display the image.
   *   image(gif, 0, 0);
   *
   *   // Display the current state of playback.
   *   let total = gif.numFrames();
   *   let index = gif.getCurrentFrame();
   *   text(`${index} / ${total}`, 30, 90);
   * }
   * </code>
   * </div>
   */
  numFrames() {
    if (this.gifProperties) {
      return this.gifProperties.numFrames;
    }
  }

  /**
   * Plays an animated GIF that was paused with
   * <a href="#/p5.Image/pause">img.pause()</a>.
   *
   * @method play
   *
   * @example
   * <div>
   * <code>
   * let gif;
   *
   * // Load the image.
   * function preload() {
   *   gif = loadImage('assets/nancy-liang-wind-loop-forever.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   describe('A drawing of a child with hair blowing in the wind. The animation freezes when clicked and resumes when released.');
   * }
   *
   * function draw() {
   *   background(255);
   *   image(gif, 0, 0);
   * }
   *
   * // Pause the GIF when the user presses the mouse.
   * function mousePressed() {
   *   gif.pause();
   * }
   *
   * // Play the GIF when the user releases the mouse.
   * function mouseReleased() {
   *   gif.play();
   * }
   * </code>
   * </div>
   */
  play() {
    if (this.gifProperties) {
      this.gifProperties.playing = true;
    }
  }

  /**
   * Pauses an animated GIF.
   *
   * The GIF can be resumed by calling
   * <a href="#/p5.Image/play">img.play()</a>.
   *
   * @method pause
   *
   * @example
   * <div>
   * <code>
   * let gif;
   *
   * // Load the image.
   * function preload() {
   *   gif = loadImage('assets/nancy-liang-wind-loop-forever.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   describe('A drawing of a child with hair blowing in the wind. The animation freezes when clicked and resumes when released.');
   * }
   *
   * function draw() {
   *   background(255);
   *
   *   // Display the image.
   *   image(gif, 0, 0);
   * }
   *
   * // Pause the GIF when the user presses the mouse.
   * function mousePressed() {
   *   gif.pause();
   * }
   *
   * // Play the GIF when the user presses the mouse.
   * function mouseReleased() {
   *   gif.play();
   * }
   * </code>
   * </div>
   */
  pause() {
    if (this.gifProperties) {
      this.gifProperties.playing = false;
    }
  }

  /**
   * Changes the delay between frames in an animated GIF.
   *
   * The first parameter, `delay`, is the length of the delay in milliseconds.
   *
   * The second parameter, `index`, is optional. If provided, only the frame
   * at `index` will have its delay modified. All other frames will keep
   * their default delay.
   *
   * @method delay
   * @param {Number} d delay in milliseconds between switching frames.
   * @param {Number} [index] index of the frame that will have its delay modified.
   *
   * @example
   * <div>
   * <code>
   * let gifFast;
   * let gifSlow;
   *
   * // Load the images.
   * function preload() {
   *   gifFast = loadImage('assets/arnott-wallace-eye-loop-forever.gif');
   *   gifSlow = loadImage('assets/arnott-wallace-eye-loop-forever.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   background(200);
   *
   *   // Resize the images.
   *   gifFast.resize(50, 50);
   *   gifSlow.resize(50, 50);
   *
   *   // Set the delay lengths.
   *   gifFast.delay(10);
   *   gifSlow.delay(100);
   *
   *   describe('Two animated eyes looking around. The eye on the left moves faster than the eye on the right.');
   * }
   *
   * function draw() {
   *   // Display the images.
   *   image(gifFast, 0, 0);
   *   image(gifSlow, 50, 0);
   * }
   * </code>
   * </div>
   *
   * <div>
   * <code>
   * let gif;
   *
   * // Load the image.
   * function preload() {
   *   gif = loadImage('assets/arnott-wallace-eye-loop-forever.gif');
   * }
   *
   * function setup() {
   *   createCanvas(100, 100);
   *
   *   // Set the delay of frame 67.
   *   gif.delay(3000, 67);
   *
   *   describe('An animated eye looking around. It pauses for three seconds while it looks down.');
   * }
   *
   * function draw() {
   *   // Display the image.
   *   image(gif, 0, 0);
   * }
   * </code>
   * </div>
   */
  delay(d, index) {
    if (this.gifProperties) {
      const props = this.gifProperties;
      if (index < props.numFrames && index >= 0) {
        props.frames[index].delay = d;
      } else {
        // change all frames
        for (const frame of props.frames) {
          frame.delay = d;
        }
      }
    }
  }
};
export default p5.Image;
