import {DynamicDrawUsage, InstancedBufferAttribute, REVISION, StaticDrawUsage} from 'three';
import {Float32ArrayHelper} from './Float32ArrayHelper';

/**
 * A helper to handle creating and updating a THREE.BufferAttribute instance.
 *
 * @author  Luke Moody
 * @constructor
 * @param {number} itemSize The buffer attribute item size.
 **/

export default class ShaderAttribute {
  public typedArray: Float32ArrayHelper | null;
  public bufferAttribute: InstancedBufferAttribute | null;

  private dynamicBuffer: boolean;
  private updateMin: number;
  private updateMax: number;

  private itemSize: number;

  constructor(itemSize: number) {
    this.itemSize = itemSize;
    this.typedArray = null;
    this.bufferAttribute = null;
    this.dynamicBuffer = true;

    this.updateMin = 0;
    this.updateMax = 0;
  }

  /**
   * Calculate the minimum and maximum update range for this buffer attribute using
   * component size independant min and max values.
   *
   * @param {Number} min The start of the range to mark as needing an update.
   * @param {Number} max The end of the range to mark as needing an update.
   */
  public setUpdateRange = (min: number, max: number) => {
    this.updateMin = Math.min(min * this.itemSize, this.updateMin * this.itemSize);
    this.updateMax = Math.max(max * this.itemSize, this.updateMax * this.itemSize);
  };

  /**
   * Calculate the number of indices that this attribute should mark as needing
   * updating. Also marks the attribute as needing an update.
   */
  public flagUpdate = () => {
    const attr = this.bufferAttribute;
    if (attr) {
      // https://github.com/mrdoob/three.js/wiki/Migration-Guide#r158--r159
      if (Number(REVISION) >= 159) {
        (attr as unknown as {clearUpdateRanges: () => void}).clearUpdateRanges();
        (
          attr as unknown as {
            addUpdateRange: (start: number, count: number) => void;
          }
        ).addUpdateRange(this.updateMin, Math.min(this.updateMax - this.updateMin + this.itemSize, this.typedArray!.array.length));
      } else {
        const range = (attr as unknown as {updateRange: {offset: number; count: number}}).updateRange;
        range.offset = this.updateMin;
        range.count = Math.min(this.updateMax - this.updateMin + this.itemSize, this.typedArray!.array.length);
      }
      attr.needsUpdate = true;
    }
  };

  /**
   * Reset the index update counts for this attribute
   */
  public resetUpdateRange = () => {
    this.updateMin = 0;
    this.updateMax = 0;
  };

  public resetDynamic = () => {
    if (!this.bufferAttribute) return;
    this.bufferAttribute.usage = this.dynamicBuffer ? DynamicDrawUsage : StaticDrawUsage;
  };

  /**
   * Perform a splice operation on this attribute's buffer.
   * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
   * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
   */
  public splice = (start: number, end: number) => {
    if (this.typedArray) this.typedArray.splice(start, end);
    // Reset the reference to the attribute's typed array
    // since it has probably changed.
    this.forceUpdateAll();
  };

  public forceUpdateAll = () => {
    if (!this.bufferAttribute) return;

    this.bufferAttribute.array = this.typedArray!.array;
    this.bufferAttribute.usage = StaticDrawUsage;

    if (Number(REVISION) >= 159) {
      (this.bufferAttribute as unknown as {clearUpdateRanges: () => void}).clearUpdateRanges();
      (
        this.bufferAttribute as unknown as {
          addUpdateRange: (start: number, count: number) => void;
        }
      ).addUpdateRange(0, this.bufferAttribute!.array.length);
    } else {
      (
        this.bufferAttribute as unknown as {
          updateRange: {offset: number; count: number};
        }
      ).updateRange = {
        offset: 0,
        count: -1,
      };
    }

    this.bufferAttribute.needsUpdate = true;
  };

  /**
   * Make sure this attribute has a typed array associated with it.
   * If it does, then it will ensure the typed array is of the correct size.
   * If not, a new Float32ArrayHelper instance will be created.
   * @param  {Number} size The size of the typed array to create or update to.
   */

  private _ensureFloat32ArrayWithSizeExists = (size: number) => {
    // Condition that's most likely to be true at the top: no change.
    if (this.typedArray !== null && this.typedArray.size === size * this.itemSize) {
      return;
    }

    // Resize the array if needed, telling the TypedArrayHelper to ignore it's component size when evaluating size.
    else if (this.typedArray !== null && this.typedArray.size !== size) {
      this.typedArray.setSize(size);
    }

    // This condition should only occur once in an attribute's lifecycle.
    else if (this.typedArray === null) {
      this.typedArray = new Float32ArrayHelper(size, this.itemSize);
    }
  };

  /**
   * Creates a THREE.BufferAttribute instance if one doesn't exist already.
   * Ensures a typed array is present by calling _ensureTypedArray() first.
   * If a buffer attribute exists already, then it will be marked as needing an update.
   * @param  {Number} size The size of the typed array to create if one doesn't exist, or resize existing array to.
   */

  public createBufferAttribute = (size: number) => {
    // Make sure the typedArray is present and correct.
    this._ensureFloat32ArrayWithSizeExists(size);

    // Don't create it if it already exists, but do flag that it needs updating on the next render cycle.
    const float32Array = this.typedArray!.array;
    if (this.bufferAttribute !== null) {
      this.bufferAttribute.array = float32Array;

      // Since THREE.js version 81, dynamic count calculation was removed so done manually here.
      (this.bufferAttribute as InstancedBufferAttribute & {count: number}).count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize;

      this.bufferAttribute.needsUpdate = true;
      return;
    }

    this.bufferAttribute = new InstancedBufferAttribute(float32Array, this.itemSize);
    this.bufferAttribute.usage = this.dynamicBuffer ? DynamicDrawUsage : StaticDrawUsage;
  };

  /**
   * Returns the length of the typed array associated with this attribute.
   * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
   */
  public getLength = () => {
    if (this.typedArray === null) return 0;
    return this.typedArray.array.length;
  };
}
