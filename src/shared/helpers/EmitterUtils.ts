/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Color, Vector2, Vector3, Vector4} from 'three';
import {MersenneTwister} from './MersenneTwister';
import ShaderAttribute from './ShaderAttribute';

export const mersenneGenerator = new MersenneTwister();

/**
 * A bunch of utility functions used throughout the library.
 * @namespace
 * @type {Object}
 */
export const utils = {
  /**
   * Ensures that any "value-over-lifetime" properties of an emitter are
   * of the correct length (as dictated by `valueOverLifetimeLength`).
   *
   * Delegates to `utils.interpolateArray` for array resizing.
   *
   * If properties aren't arrays, then property values are put into one.
   *
   * @param  {Object} property  The property of an ParticleEmitter instance to check compliance of.
   * @param  {Number} minLength The minimum length of the array to create.
   * @param  {Number} maxLength The maximum length of the array to create.
   */
  ensureValueOverLifetimeCompliance: function (property: any, minLength: number, maxLength: number) {
    minLength = minLength || 3;
    maxLength = maxLength || 3;

    // First, ensure both properties are arrays.
    if (Array.isArray(property.value) === false) {
      property.value = [property.value];
    }

    if (Array.isArray(property.spread) === false) {
      property.spread = [property.spread];
    }

    const valueLength = this.clamp(property.value.length, minLength, maxLength);
    const spreadLength = this.clamp(property.spread.length, minLength, maxLength);
    const desiredLength = Math.max(valueLength, spreadLength);

    if (property.value.length !== desiredLength) {
      property.value = this.interpolateArray(property.value, desiredLength);
    }

    if (property.spread.length !== desiredLength) {
      property.spread = this.interpolateArray(property.spread, desiredLength);
    }
  },

  /**
   * Performs linear interpolation (lerp) on an array.
   *
   * For example, lerping [1, 10], with a `newLength` of 10 will produce [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
   *
   * Delegates to `utils.lerpTypeAgnostic` to perform the actual
   * interpolation.
   *
   * @param  {Array} srcArray  The array to lerp.
   * @param  {Number} newLength The length the array should be interpolated to.
   * @return {Array}           The interpolated array.
   */
  interpolateArray: function (srcArray: Array<any>, newLength: number) {
    const sourceLength = srcArray.length;
    const newArray = [typeof srcArray[0].clone === 'function' ? srcArray[0].clone() : srcArray[0]];
    const factor = (sourceLength - 1) / (newLength - 1);

    for (let i = 1; i < newLength - 1; ++i) {
      const f = i * factor;
      const before = Math.floor(f);
      const after = Math.ceil(f);
      const delta = f - before;

      newArray[i] = this.lerpTypeAgnostic(srcArray[before], srcArray[after], delta);
    }

    newArray.push(typeof srcArray[sourceLength - 1].clone === 'function' ? srcArray[sourceLength - 1].clone() : srcArray[sourceLength - 1]);

    return newArray;
  },

  /**
   * Clamp a number to between the given min and max values.
   * @param  {Number} value The number to clamp.
   * @param  {Number} min   The minimum value.
   * @param  {Number} max   The maximum value.
   * @return {Number}       The clamped number.
   */
  clamp: function (value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
  },

  /**
   * Linearly interpolates two values of various types. The given values
   * must be of the same type for the interpolation to work.
   * @param  {(number|Object)} start The start value of the lerp.
   * @param  {(number|object)} end   The end value of the lerp.
   * @param  {Number} delta The delta posiiton of the lerp operation. Ideally between 0 and 1 (inclusive).
   * @return {(number|object|undefined)}       The result of the operation. Result will be undefined if
   *                                               the start and end arguments aren't a supported type, or
   *                                               if their types do not match.
   */
  lerpTypeAgnostic: function (start: number | Vector2 | Vector3 | Color, end: number | Vector2 | Vector3 | Color, delta: number) {
    let out;

    if (typeof start === 'number' && typeof end === 'number') {
      return start + (end - start) * delta;
    } else if (start instanceof Vector2 && end instanceof Vector2) {
      out = start.clone();
      out.x = this.lerp(start.x, end.x, delta);
      out.y = this.lerp(start.y, end.y, delta);
      return out;
    } else if (start instanceof Vector3 && end instanceof Vector3) {
      out = start.clone();
      out.x = this.lerp(start.x, end.x, delta);
      out.y = this.lerp(start.y, end.y, delta);
      out.z = this.lerp(start.z, end.z, delta);
      return out;
    } else if (start instanceof Vector4 && end instanceof Vector4) {
      out = start.clone();
      out.x = this.lerp(start.x, end.x, delta);
      out.y = this.lerp(start.y, end.y, delta);
      out.z = this.lerp(start.z, end.z, delta);
      out.w = this.lerp(start.w, end.w, delta);
      return out;
    } else if (start instanceof Color && end instanceof Color) {
      out = start.clone();
      out.r = this.lerp(start.r, end.r, delta);
      out.g = this.lerp(start.g, end.g, delta);
      out.b = this.lerp(start.b, end.b, delta);
      return out;
    } else {
      console.warn('Invalid argument types, or argument types do not match:', start, end);
      return undefined;
    }
  },

  /**
   * Perform a linear interpolation operation on two numbers.
   * @param  {Number} start The start value.
   * @param  {Number} end   The end value.
   * @param  {Number} delta The position to interpolate to.
   * @return {Number}       The result of the lerp operation.
   */
  lerp: function (start: number, end: number, delta: number) {
    return start + (end - start) * delta;
  },

  /**
   * Rounds a number to a nearest multiple.
   *
   * @param  {Number} n        The number to round.
   * @param  {Number} multiple The multiple to round to.
   * @return {Number}          The result of the round operation.
   */
  roundToNearestMultiple: function (n: number, multiple: number) {
    let remainder = 0;

    if (multiple === 0) {
      return n;
    }

    remainder = Math.abs(n) % multiple;

    if (remainder === 0) {
      return n;
    }

    if (n < 0) {
      return -(Math.abs(n) - remainder);
    }

    return n + multiple - remainder;
  },

  /**
   * Check if all items in an array are equal. Uses strict equality.
   *
   * @param  {Array} array The array of values to check equality of.
   * @return {Boolean}       Whether the array's values are all equal or not.
   */
  arrayValuesAreEqual: function (array: Array<any>) {
    for (let i = 0; i < array.length - 1; ++i) {
      if (array[i] !== array[i + 1]) {
        return false;
      }
    }

    return true;
  },

  /**
   * Given a start value and a spread value, create and return a random
   * number.
   * @param  {Number} base   The start value.
   * @param  {Number} spread The size of the random variance to apply.
   * @return {Number}        A randomised number.
   */
  randomFloat: function (base: number, spread: number) {
    return base + spread * (mersenneGenerator.random() - 0.5);
  },

  /**
   * Given an ShaderAttribute instance, and various other settings,
   * assign values to the attribute's array in a `vec3` format.
   *
   * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
   * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
   * @param  {Object} base        THREE.Vector3 instance describing the start value.
   * @param  {Object} spread      THREE.Vector3 instance describing the random variance to apply to the start value.
   * @param  {Object} spreadClamp THREE.Vector3 instance describing the multiples to clamp the randomness to.
   */
  randomVector3: function (attribute: ShaderAttribute, index: number, base: Vector3, spread: Vector3, spreadClamp?: Vector3) {
    let x = base.x + (mersenneGenerator.random() * spread.x - spread.x * 0.5);
    let y = base.y + (mersenneGenerator.random() * spread.y - spread.y * 0.5);
    let z = base.z + (mersenneGenerator.random() * spread.z - spread.z * 0.5);

    // var x = this.randomFloat( base.x, spread.x ),
    // y = this.randomFloat( base.y, spread.y ),
    // z = this.randomFloat( base.z, spread.z );

    if (spreadClamp) {
      x = -spreadClamp.x * 0.5 + this.roundToNearestMultiple(x, spreadClamp.x);
      y = -spreadClamp.y * 0.5 + this.roundToNearestMultiple(y, spreadClamp.y);
      z = -spreadClamp.z * 0.5 + this.roundToNearestMultiple(z, spreadClamp.z);
    }

    attribute.typedArray?.setVec3Components(index, x, y, z);
  },

  randomColorAsHex: (function () {
    const workingColor = new Color();

    /**
     * Assigns a random color value, encoded as a hex value in decimal
     * format, to a ShaderAttribute instance.
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
     */
    return function (attribute: ShaderAttribute, index: number, base: Color[], spread: Vector3[]) {
      const numItems = base.length;
      const colors = [];

      for (let i = 0; i < numItems; ++i) {
        const spreadVector = spread[i];

        workingColor.copy(base[i]);

        workingColor.r += mersenneGenerator.random() * spreadVector.x - spreadVector.x * 0.5;
        workingColor.g += mersenneGenerator.random() * spreadVector.y - spreadVector.y * 0.5;
        workingColor.b += mersenneGenerator.random() * spreadVector.z - spreadVector.z * 0.5;

        // @ts-ignore
        workingColor.r = this.clamp(workingColor.r, 0, 1); // @ts-ignore
        workingColor.g = this.clamp(workingColor.g, 0, 1); // @ts-ignore
        workingColor.b = this.clamp(workingColor.b, 0, 1);

        colors.push(workingColor.getHex());
      }

      attribute.typedArray?.setVec4Components(index, colors[0], colors[1], colors[2], colors[3]);
    };
  })(),

  /**
   * Given an ShaderAttribute instance, and various other settings,
   * assign values to the attribute's array in a `vec3` format.
   *
   * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
   * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
   * @param  {Object} start       THREE.Vector3 instance describing the start line position.
   * @param  {Object} end         THREE.Vector3 instance describing the end line position.
   */
  randomVector3OnLine: function (attribute: ShaderAttribute, index: number, start: Vector3, end: Vector3) {
    const pos = start.clone();

    pos.lerp(end, mersenneGenerator.random());

    attribute.typedArray?.setVec3Components(index, pos.x, pos.y, pos.z);
  },

  /**
   * Assigns a random vector 3 value to an ShaderAttribute instance, projecting the
   * given values onto a sphere.
   *
   * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
   * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
   * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
   * @param  {Number} radius            The radius of the sphere to project onto.
   * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
   * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the sphere.
   * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
   */
  randomVector3OnSphere: function (attribute: ShaderAttribute, index: number, base: Vector3, radius: number, radiusSpread: number, radiusScale: Vector3, radiusSpreadClamp: number) {
    const depth = 2 * mersenneGenerator.random() - 1;
    const t = 6.2832 * mersenneGenerator.random();
    const r = Math.sqrt(1 - depth * depth);
    let rand = this.randomFloat(radius, radiusSpread);
    let x = 0;
    let y = 0;
    let z = 0;

    if (radiusSpreadClamp) {
      rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
    }

    // Set position on sphere
    x = r * Math.cos(t) * rand;
    y = r * Math.sin(t) * rand;
    z = depth * rand;

    // Apply radius scale to this position
    x *= radiusScale.x;
    y *= radiusScale.y;
    z *= radiusScale.z;

    // Translate to the base position.
    x += base.x;
    y += base.y;
    z += base.z;

    // Set the values in the typed array.
    attribute.typedArray?.setVec3Components(index, x, y, z);
  },

  /**
   * Assigns a random vector 3 value to an ShaderAttribute instance, projecting the
   * given values onto a 2d-disc.
   *
   * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
   * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
   * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
   * @param  {Number} radius            The radius of the sphere to project onto.
   * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
   * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the disc. The z-component is ignored.
   * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
   */
  randomVector3OnDisc: function (attribute: ShaderAttribute, index: number, base: Vector3, radius: number, radiusSpread: number, radiusScale: Vector3, radiusSpreadClamp: number) {
    const t = 6.2832 * mersenneGenerator.random();
    let rand = Math.abs(this.randomFloat(radius, radiusSpread));
    let x = 0;
    let y = 0;
    let z = 0;

    if (radiusSpreadClamp) {
      rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp;
    }

    // Set position on sphere
    x = Math.cos(t) * rand;
    y = Math.sin(t) * rand;

    // Apply radius scale to this position
    x *= radiusScale.x;
    y *= radiusScale.y;

    // Translate to the base position.
    x += base.x;
    y += base.y;
    z += base.z;

    // Set the values in the typed array.
    attribute.typedArray?.setVec3Components(index, x, y, z);
  },

  randomDirectionVector3OnSphere: (function () {
    const v = new Vector3();

    /**
     * Given an ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     *
     * @param  {Object} attribute       The instance of ShaderAttribute to save the result to.
     * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
     * @param  {Number} posX            The particle's x coordinate.
     * @param  {Number} posY            The particle's y coordinate.
     * @param  {Number} posZ            The particle's z coordinate.
     * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
     * @param  {Number} speed           The magnitude to apply to the vector.
     * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
     */
    return function (attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: Vector3, speed: number, speedSpread: number) {
      v.copy(emitterPosition);

      v.x -= posX;
      v.y -= posY;
      v.z -= posZ;
      // @ts-ignore
      v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));

      attribute.typedArray?.setVec3Components(index, v.x, v.y, v.z);
    };
  })(),

  randomDirectionVector3OnDisc: (function () {
    const v = new Vector3();

    /**
     * Given an ShaderAttribute instance, create a direction vector from the given
     * position, using `speed` as the magnitude. Values are saved to the attribute.
     *
     * @param  {Object} attribute       The instance of ShaderAttribute to save the result to.
     * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
     * @param  {Number} posX            The particle's x coordinate.
     * @param  {Number} posY            The particle's y coordinate.
     * @param  {Number} posZ            The particle's z coordinate.
     * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
     * @param  {Number} speed           The magnitude to apply to the vector.
     * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
     */
    return function (attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: Vector3, speed: number, speedSpread: number) {
      v.copy(emitterPosition);

      v.x -= posX;
      v.y -= posY;
      v.z -= posZ;
      // @ts-ignore
      v.normalize().multiplyScalar(-this.randomFloat(speed, speedSpread));

      attribute.typedArray?.setVec3Components(index, v.x, v.y, 0);
    };
  })(),

  getPackedRotationAxis: (function () {
    const v = new Vector3();
    const vSpread = new Vector3();
    const c = new Color();
    const addOne = new Vector3(1, 1, 1);

    /**
     * Given a rotation axis, and a rotation axis spread vector,
     * calculate a randomised rotation axis, and pack it into
     * a hexadecimal value represented in decimal form.
     * @param  {Object} axis       THREE.Vector3 instance describing the rotation axis.
     * @param  {Object} axisSpread THREE.Vector3 instance describing the amount of randomness to apply to the rotation axis.
     * @return {Number}            The packed rotation axis, with randomness.
     */
    return function (axis: Vector3, axisSpread: Vector3) {
      v.copy(axis).normalize();
      vSpread.copy(axisSpread).normalize();

      v.x += axisSpread.x !== 0 ? -axisSpread.x * 0.5 + mersenneGenerator.random() * axisSpread.x : 0;
      v.y += axisSpread.y !== 0 ? -axisSpread.y * 0.5 + mersenneGenerator.random() * axisSpread.y : 0;
      v.z += axisSpread.z !== 0 ? -axisSpread.z * 0.5 + mersenneGenerator.random() * axisSpread.z : 0;

      v.normalize().add(addOne).multiplyScalar(0.5);

      c.setRGB(v.x, v.y, v.z);

      return c.getHex('');
    };
  })(),
};
