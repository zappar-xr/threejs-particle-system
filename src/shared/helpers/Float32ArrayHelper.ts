/**
 * A helper class for Float32Array.
 *
 * @author Luke Moody
 * @constructor
 * @param {Number} size            The size of the array to create
 * @param {Number} itemSize        The number of components per-value (ie. 3 for a vec3, 9 for a Mat3, etc.)
 */

export class Float32ArrayHelper {
  public size: number;
  public array: Float32Array;

  private itemSize: number;

  constructor(size: number, itemSize: number) {
    this.itemSize = itemSize;
    this.size = size;
    this.array = new Float32Array(size * this.itemSize);
  }

  /**
   * Sets the size of the internal array.
   * Delegates to `this.shrink` or `this.grow` depending on size
   * argument's relation to the current size of the internal array.
   * Note that if the array is to be shrunk, data will be lost.
   * @param {Number} size The new size of the array.
   */
  public setSize = (size: number) => {
    size = size * this.itemSize;
    if (size < this.array.length) this.shrink(size);
    else if (size > this.array.length) this.grow(size);
    else console.info('Float32Array is already of size:', size + '.', 'Will not resize.');
  };

  /**
   * Shrinks the internal array.
   * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
   * @return {Float32ArrayHelper}      Instance of this class.
   */
  public shrink = (size: number) => {
    this.array = this.array.subarray(0, size);
    this.size = size;
    return this;
  };

  /**
   * Grows the internal array.
   * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
   * @return {Float32ArrayHelper}      Instance of this class.
   */
  public grow = (size: number) => {
    const existingArray = this.array;
    const newArray = new Float32Array(size);

    newArray.set(existingArray);
    this.array = newArray;
    this.size = size;

    return this;
  };

  /**
   * Perform a splice operation on this array's buffer.
   * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
   * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
   * @returns {Object} The Float32ArrayHelper instance.
   */
  public splice = (start: number, end: number) => {
    start *= this.itemSize;
    end *= this.itemSize;

    const data = [],
      array = this.array,
      size = array.length;

    for (let i = 0; i < size; ++i) {
      if (i < start || i >= end) {
        data.push(array[i]);
      }
      // array[ i ] = 0;
    }

    this._setFromArray(0, data);

    return this;
  };

  /**
   * Copies from the given Float32Array into this one, using the index argument
   * as the start position. Alias for `Float32Array.set`. Will automatically resize
   * if the given source array is of a larger size than the internal array.
   *
   * @param {Number} index      The start position from which to copy into this array.
   * @param {TypedArray} array The array from which to copy; the source array.
   * @return {Float32ArrayHelper} Instance of this class.
   */
  private _setFromArray = (index: number, array: Array<number>) => {
    const sourceArraySize = array.length,
      newSize = index + sourceArraySize;

    if (newSize > this.array.length) {
      this.grow(newSize);
    } else if (newSize < this.array.length) {
      this.shrink(newSize);
    }

    this.array.set(array, index);

    return this;
  };

  /**
   * Set a Vector3 value using raw components.
   *
   * @param {Number} index The index at which to set the vec3 values from.
   * @param {Number} x     The Vec3's `x` component.
   * @param {Number} y     The Vec3's `y` component.
   * @param {Number} z     The Vec3's `z` component.
   * @return {Float32ArrayHelper} Instance of this class.
   */
  public setVec3Components = (index: number, x: number, y: number, z: number) => {
    const array = this.array;
    const i = index * this.itemSize;

    array[i] = x;
    array[i + 1] = y;
    array[i + 2] = z;
    return this;
  };

  /**
   * Set a Vector4 value using raw components.
   *
   * @param {Number} index The index at which to set the vec4 values from.
   * @param {Number} x     The Vec4's `x` component.
   * @param {Number} y     The Vec4's `y` component.
   * @param {Number} z     The Vec4's `z` component.
   * @param {Number} w     The Vec4's `w` component.
   * @return {Float32ArrayHelper} Instance of this class.
   */
  public setVec4Components = (index: number, x: number, y: number, z: number, w: number) => {
    const array = this.array;
    const i = index * this.itemSize;

    array[i] = x;
    array[i + 1] = y;
    array[i + 2] = z;
    array[i + 3] = w;
    return this;
  };
}
