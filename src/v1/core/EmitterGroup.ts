import {AdditiveBlending, Blending, BufferAttribute, Color, DoubleSide, InstancedBufferGeometry, MathUtils, Mesh, PlaneGeometry, ShaderMaterial, Side, Texture, Vector2, Vector3, Vector4} from 'three';
import ShaderAttribute from '../../shared/helpers/ShaderAttribute';
import {fragmentShader} from '../shaders/frag.glsl';
import {vertexShader} from '../shaders/vert.glsl';
import {Emitter} from './Emitter';
import {IDefinesBooleanPropKeys, IEmitterOptions, IGroupOptions, IShaderAttributeKeyArray, IShaderAttributeKeys, IShaderAttributes, IUniforms} from './types';

export const valueOverLifetimeLength = 4;

/**
 * An EmitterGroup instance.
 * @typedef {Object} EmitterGroup
 * @see EmitterGroup
 */

/**
 * A map of options to configure an EmitterGroup instance.
 * @typedef {Object} GroupOptions
 *
 * @property {Object} texture An object describing the texture used by the group.
 *
 * @property {Object} texture.value An instance of THREE.Texture.
 *
 * @property {Object=} texture.frames A THREE.Vector2 instance describing the number
 *                                    of frames on the x- and y-axis of the given texture.
 *                                    If not provided, the texture will NOT be treated as
 *                                    a sprite-sheet and as such will NOT be animated.
 *
 * @property {Number} [texture.frameCount=texture.frames.x * texture.frames.y] The total number of frames in the sprite-sheet.
 *                                                                   Allows for sprite-sheets that don't fill the entire
 *                                                                   texture.
 *
 * @property {Number} texture.loop The number of loops through the sprite-sheet that should
 *                                 be performed over the course of a single particle's lifetime.
 *
 * @property {Number} fixedTimeStep If no `dt` (or `deltaTime`) value is passed to this group's
 *                                  `tick()` function, this number will be used to move the particle
 *                                  simulation forward. Value in SECONDS.
 *
 * @property {Boolean} hasPerspective Whether the distance a particle is from the camera should affect
 *                                    the particle's size.
 *
 * @property {Boolean} colorize Whether the particles in this group should be rendered with color, or
 *                              whether the only color of particles will come from the provided texture.
 *
 * @property {Number} blending One of Three.js's blending modes to apply to this group's `ShaderMaterial`.
 *
 * @property {Boolean} transparent Whether these particle's should be rendered with transparency.
 *
 * @property {Number} alphaTest Sets the alpha value to be used when running an alpha test on the `texture.value` property. Value between 0 and 1.
 *
 * @property {Boolean} depthWrite Whether rendering the group has any effect on the depth buffer.
 *
 * @property {Boolean} depthTest Whether to have depth test enabled when rendering this group.
 *
 * @property {Boolean} fog Whether this group's particles should be affected by their scene's fog.
 *
 * @property {Number} scale The scale factor to apply to this group's particle sizes. Useful for
 *                          setting particle sizes to be relative to renderer size.
 *
 * @property {Boolean} [frustumCulled=true] If set to false, the emitter mesh will be culled if outside
 *                                  of the camera frustum. Default is true.
 *
 * @property {String} [billboard=undefined]  If set, particles will be billobarded. Options are 'spherical' | 'directional' | 'cylindrical';
 */

/**
 * The EmitterGroup class. Creates a new group, containing a material, geometry, and mesh.
 */

export class EmitterGroup {
  public uuid: string;
  public fixedTimeStep: number;
  private _texture: Texture | null;

  public set texture(texture: Texture | null) {
    this.defines.HAS_TEXTURE = !!texture;
    this.uniforms.tex.value = texture;
  }

  public get texture(): Texture | null {
    return this._texture;
  }

  public set alphaTest(value: number) {
    this._alphaTest = value;

    // Update the custom uniform that the shader actually uses
    if (this.uniforms && this.uniforms.customAlphaTest) {
      this.uniforms.customAlphaTest.value = value;
    }

    // Update the USE_PARTICLE_ALPHA_TEST define and force shader recompilation
    if (this.defines) {
      const oldDefine = this.defines.USE_PARTICLE_ALPHA_TEST;
      this.defines.USE_PARTICLE_ALPHA_TEST = value > 0;

      // If the define changed, we need to recompile the material
      if (oldDefine !== this.defines.USE_PARTICLE_ALPHA_TEST && this.material) {
        this.material.needsUpdate = true;
      }
    }
  }

  public get alphaTest(): number {
    return this._alphaTest;
  }

  public set transparent(value: boolean) {
    this._transparent = value;
    if (this.material) {
      this.material.transparent = value;
      this.material.needsUpdate = true;
    }
  }

  public get transparent(): boolean {
    return this._transparent;
  }

  public set depthWrite(value: boolean) {
    this._depthWrite = value;
    if (this.material) {
      this.material.depthWrite = value;
      this.material.needsUpdate = true;
    }
  }

  public get depthWrite(): boolean {
    return this._depthWrite;
  }

  public set depthTest(value: boolean) {
    this._depthTest = value;
    if (this.material) {
      this.material.depthTest = value;
      this.material.needsUpdate = true;
    }
  }

  public get depthTest(): boolean {
    return this._depthTest;
  }

  public set blending(value: Blending) {
    this._blending = value;
    if (this.material) {
      this.material.blending = value;
      this.material.needsUpdate = true;
    }
  }

  public get blending(): Blending {
    return this._blending;
  }

  public set fog(value: boolean) {
    this._fog = value;
    if (this.material) {
      this.material.fog = value;
      this.material.needsUpdate = true;
    }
  }

  public get fog(): boolean {
    return this._fog;
  }

  public set side(value: Side) {
    this._side = value;
    if (this.material) {
      this.material.side = value;
      this.material.needsUpdate = true;
    }
  }

  public get side(): Side {
    return this._side;
  }

  public set hasPerspective(value: boolean) {
    this._hasPerspective = value;
    if (this.defines) {
      this.defines.HAS_PERSPECTIVE = value;
      if (this.material) {
        this.material.needsUpdate = true;
      }
    }
  }

  public get hasPerspective(): boolean {
    return this._hasPerspective;
  }

  public set colorize(value: boolean) {
    this._colorize = value;
    if (this.defines) {
      this.defines.COLORIZE = value;
      if (this.material) {
        this.material.needsUpdate = true;
      }
    }
  }

  public get colorize(): boolean {
    return this._colorize;
  }

  public set scale(value: number) {
    this._scale = value;
    if (this.uniforms && this.uniforms.scale) {
      this.uniforms.scale.value = value;
    }
  }

  public get scale(): number {
    return this._scale;
  }

  public set frustumCulled(value: boolean) {
    if (this.mesh) {
      this.mesh.frustumCulled = value;
    }
  }

  public get frustumCulled(): boolean {
    return this.mesh ? this.mesh.frustumCulled : true;
  }

  public textureFrames: Vector2;
  public textureFrameCount: number;
  public textureLoop: number;
  private _hasPerspective: boolean;
  public billboard?: 'spherical' | 'directional' | 'cylindrical';
  /**
   * @deprecated Use `rotation axisSpread` parameter setter directly on the emitters instead.
   */
  public randomParticleRotationAngle?: number;
  private _colorize: boolean;
  public maxParticleCount: number | null;
  private _blending: Blending;
  private _transparent: boolean;
  private _alphaTest: number;
  private _depthWrite: boolean;
  private _depthTest: boolean;
  private _fog: boolean;
  private _side: Side;
  private _scale: number;
  public emitters: Emitter[];
  public emitterIDs: string[];
  public particleCount: number;
  public uniforms: IUniforms;
  public defines: Record<IDefinesBooleanPropKeys, boolean> & {
    VALUE_OVER_LIFETIME_LENGTH: number;
  };
  public attributes: IShaderAttributes;
  public attributeKeys: IShaderAttributeKeyArray;
  public attributeCount: number;
  public material: ShaderMaterial;
  public geometry: InstancedBufferGeometry;
  public mesh: Mesh;
  private _pool: Emitter[];
  private _poolCreationSettings: IEmitterOptions | null;
  private _createNewWhenPoolEmpty: boolean | 0;
  public attributesNeedRefresh: boolean;
  private _attributesNeedDynamicReset: boolean;

  constructor(options: IGroupOptions) {
    // Assign a UUID to this instance
    this.uuid = MathUtils.generateUUID();

    // If no `deltaTime` value is passed to the `EmitterGroup.tick` function,
    // the value of this property will be used to advance the simulation.

    this.fixedTimeStep = options.fixedTimeStep ?? 0.016;

    this.randomParticleRotationAngle = options.randomParticleRotationAngle ?? 0;

    // Set properties used in the uniforms map, starting with the
    // texture stuff.

    this._texture = options.texture?.value ?? null;
    this.textureFrames = options.texture?.frames ?? new Vector2(1, 1);
    this.textureFrameCount = options.texture?.frameCount ?? this.textureFrames.x * this.textureFrames.y;
    this.textureLoop = options.texture?.loop ?? 1;
    this.textureFrames.max(new Vector2(1, 1));

    this._hasPerspective = options.hasPerspective ?? true;
    this._colorize = options.colorize ?? true;

    this.billboard = options.billboard;

    this.maxParticleCount = options.maxParticleCount ?? null;

    // Set properties used to define the ShaderMaterial's appearance.

    this._blending = options.blending ?? AdditiveBlending;
    this._transparent = options.transparent ?? true;
    this._alphaTest = parseFloat(`${options.alphaTest ?? 0.0}`);
    this._depthWrite = options.depthWrite ?? false;
    this._depthTest = options.depthTest ?? true;
    this._fog = options.fog ?? true;
    this._scale = options.scale ?? 300;
    this._side = options.side ?? DoubleSide;

    // Where emitter's go to curl up in a warm blanket and live
    // out their days.

    this.emitters = [];
    this.emitterIDs = [];

    // Create properties for use by the emitter pooling functions.
    this._pool = [];
    this._poolCreationSettings = null;
    this._createNewWhenPoolEmpty = 0;

    // Whether all attributes should be forced to updated
    // their entire buffer contents on the next tick.
    //
    // Used when an emitter is removed.
    this.attributesNeedRefresh = false;
    this._attributesNeedDynamicReset = false;

    this.particleCount = 0;

    // Map of uniforms to be applied to the ShaderMaterial instance.
    this.uniforms = {
      tex: {
        type: 't',
        value: this.texture,
      },
      textureAnimation: {
        type: 'v4',
        value: new Vector4(this.textureFrames.x, this.textureFrames.y, this.textureFrameCount, Math.max(Math.abs(this.textureLoop), 1.0)),
      },
      fogColor: {
        type: 'c',
        value: this.fog ? new Color() : null,
      },
      fogNear: {
        type: 'f',
        value: 10,
      },
      fogFar: {
        type: 'f',
        value: 200,
      },
      fogDensity: {
        type: 'f',
        value: 0.5,
      },
      deltaTime: {
        type: 'f',
        value: 0,
      },
      runTime: {
        type: 'f',
        value: 0,
      },
      scale: {
        type: 'f',
        value: this._scale,
      },
      customAlphaTest: {
        type: 'f',
        value: this._alphaTest,
      },
      randomParticleRotationAngle: {
        type: 'f',
        value: this.randomParticleRotationAngle,
      },
    };

    // Add some defines into the mix...
    this.defines = {
      HAS_PERSPECTIVE: this._hasPerspective,
      COLORIZE: this._colorize,
      VALUE_OVER_LIFETIME_LENGTH: valueOverLifetimeLength,
      SHOULD_ROTATE_TEXTURE: false,
      SHOULD_ORBIT_PARTICLES: false,
      SHOULD_WIGGLE_PARTICLES: false,
      SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1,
      DIRECTIONAL_BILLBOARD: this.billboard === 'directional',
      SPHERICAL_BILLBOARD: this.billboard === 'spherical',
      CYLINDRICAL_BILLBOARD: this.billboard === 'cylindrical',
      NO_BILLBOARD: typeof this.billboard === 'undefined',
      RANDOM_PARTICLE_ROTATION: this.randomParticleRotationAngle !== 0,
      HAS_TEXTURE: !!this.texture,
      USE_PARTICLE_ALPHA_TEST: this._alphaTest > 0,
    };

    // Map of all attributes to be applied to the particles.
    // See ShaderAttribute for a bit more info on this bit.

    this.attributes = {
      position: new ShaderAttribute(3),
      acceleration: new ShaderAttribute(4),
      velocity: new ShaderAttribute(3),
      orbit: new ShaderAttribute(4),
      orbitCenter: new ShaderAttribute(3),
      params: new ShaderAttribute(4), // Holds (alive, age, delay, wiggle)
      size: new ShaderAttribute(4),
      angle: new ShaderAttribute(4),
      color: new ShaderAttribute(4),
      opacity: new ShaderAttribute(4),
      rotation: new ShaderAttribute(3),
    };

    this.attributeKeys = Object.keys(this.attributes) as IShaderAttributeKeyArray;
    this.attributeCount = this.attributeKeys.length;

    // Create the ShaderMaterial instance that'll help render the particles.
    this.material = new ShaderMaterial({
      uniforms: this.uniforms as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      vertexShader,
      fragmentShader, //: meshPhysicalFragmentShader,
      blending: this._blending,
      transparent: this._transparent,
      alphaTest: this._alphaTest,
      depthWrite: this._depthWrite,
      depthTest: this._depthTest,
      defines: this.defines,
      fog: this._fog,
      side: this._side,
    });

    // Create the InstancedBufferGeometry and Quad/Plane instances
    this.geometry = new InstancedBufferGeometry();
    const planeGeometry = new PlaneGeometry(1, 1);
    this.geometry.index = planeGeometry.index;
    this.geometry.attributes = planeGeometry.attributes;

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.frustumCulled = options.frustumCulled ?? true;

    if (this.maxParticleCount === null) {
      console.warn('EmitterGroup: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.');
    }
  }

  public updateDefines = () => {
    const emitters = this.emitters;
    let i = emitters.length - 1;
    let emitter;
    const defines = this.defines;

    for (i; i >= 0; --i) {
      emitter = emitters[i];

      // Only do angle calculation if there's no spritesheet defined.
      //
      // Saves calculations being done and then overwritten in the shaders.
      if (!defines.SHOULD_CALCULATE_SPRITE) {
        defines.SHOULD_ROTATE_TEXTURE =
          defines.SHOULD_ROTATE_TEXTURE ||
          !!Math.max(
            // @ts-expect-error: TODO: Needs looking at
            Math.max.apply(null, emitter.angle.value), // @ts-expect-error: TODO: Needs looking at
            Math.max.apply(null, emitter.angle.spread)
          );
      }

      defines.SHOULD_ORBIT_PARTICLES = defines.SHOULD_ORBIT_PARTICLES || !!Math.max(emitter.orbit.angle, emitter.orbit.angleSpread);

      defines.SHOULD_WIGGLE_PARTICLES = defines.SHOULD_WIGGLE_PARTICLES || !!Math.max(emitter.wiggle.value, emitter.wiggle.spread);
    }
    this.material.needsUpdate = true;
  };

  private _applyAttributesToGeometry = () => {
    const attributes = this.attributes;
    const geometry = this.geometry;
    const geometryAttributes = geometry.attributes;
    let attribute: ShaderAttribute;
    let geometryAttribute: BufferAttribute;

    // Loop through all the shader attributes and assign (or re-assign)
    // typed array buffers to each one.
    for (const attr in attributes) {
      if (Object.hasOwn(attributes, attr)) {
        attribute = attributes[attr as IShaderAttributeKeys];

        geometryAttribute = geometryAttributes[attr === 'position' ? 'center' : attr] as BufferAttribute;

        // Update the array if this attribute exists on the geometry.
        //
        // This needs to be done because the attribute's typed array might have
        // been resized and reinstantiated, and might now be looking at a
        // different ArrayBuffer, so reference needs updating.
        if (geometryAttribute) {
          geometryAttribute.array = attribute.typedArray!.array;
        }

        // // Add the attribute to the geometry if it doesn't already exist.
        else {
          geometry.setAttribute(attr === 'position' ? 'center' : attr, attribute.bufferAttribute!);
        }

        // Mark the attribute as needing an update the next time a frame is rendered.
        attribute.bufferAttribute!.needsUpdate = true;
      }
    }

    // Mark the draw range on the geometry. This will ensure
    // only the values in the attribute buffers that are
    // associated with a particle will be used in THREE's
    // render cycle.
    this.geometry.setDrawRange(0, this.particleCount);
  };

  /**
   * Adds an Emitter instance to this group, creating particle values and
   * assigning them to this group's shader attributes.
   *
   * @param {Emitter} Emitter The emitter to add to this group.
   */

  public addEmitter = (emitter: Emitter) => {
    // Ensure an actual emitter instance is passed here.
    //
    // Decided not to throw here, just in case a scene's
    // rendering would be paused. Logging an error instead
    // of stopping execution if exceptions aren't caught.
    if (emitter instanceof Emitter === false) {
      console.error('`emitter` argument must be instance of Emitter. Was provided with:', emitter);
      return;
    }

    // If the emitter already exists as a member of this group, then
    // stop here, we don't want to add it again.
    else if (this.emitterIDs.indexOf(emitter.uuid) > -1) {
      console.error('Emitter already exists in this group. Will not add again.');
      return;
    }

    // And finally, if the emitter is a member of another group,
    // don't add it to this group.
    else if (emitter.group !== null) {
      console.error('Emitter already belongs to another group. Will not add to requested group.');
      return;
    }

    const attributes = this.attributes;
    const start = this.particleCount;
    const end = start + emitter.particleCount;

    // Update this group's particle count.
    this.particleCount = end;

    // Emit a warning if the emitter being added will exceed the buffer sizes specified.
    if (this.maxParticleCount !== null && this.particleCount > this.maxParticleCount) {
      console.warn('EmitterGroup: maxParticleCount exceeded. Requesting', this.particleCount, 'particles, can support only', this.maxParticleCount);
    }

    // Set the `particlesPerSecond` value (PPS) on the emitter.
    // It's used to determine how many particles to release
    // on a per-frame basis.
    emitter.calculatePPSValue(emitter.maxAge.value + emitter.maxAge.spread);
    emitter.setBufferUpdateRanges(this.attributeKeys);

    // Store the offset value in the TypedArray attributes for this emitter.
    emitter.setAttributeOffset(start);

    // Save a reference to this group on the emitter so it knows
    // where it belongs.
    emitter.group = this;

    // Store reference to the attributes on the emitter for
    // easier access during the emitter's tick function.
    emitter.attributes = this.attributes;

    // Ensure the attributes and their BufferAttributes exist, and their
    // TypedArrays are of the correct size.
    for (const attr in attributes) {
      if (Object.hasOwn(attributes, attr)) {
        // When creating a buffer, pass through the maxParticle count
        // if one is specified.
        attributes[attr as IShaderAttributeKeys].createBufferAttribute(this.maxParticleCount !== null ? this.maxParticleCount : this.particleCount);
      }
    }

    // Loop through each particle this emitter wants to have, and create the attributes values,
    // storing them in the TypedArrays that each attribute holds.
    for (let i = start; i < end; ++i) {
      emitter.assignPositionValue(i);
      emitter.assignForceValue(i, 'velocity');
      emitter.assignForceValue(i, 'acceleration');
      emitter.assignAbsLifetimeValue(i, 'opacity');
      emitter.assignAbsLifetimeValue(i, 'size');
      emitter.assignAngleValue(i);
      emitter.assignOrbitValue(i);
      emitter.assignRotationValue(i);
      emitter.assignParamsValue(i);
      emitter.assignColorValue(i);
    }

    // Update the geometry and make sure the attributes are referencing
    // the typed arrays properly.
    this._applyAttributesToGeometry();

    // Store this emitter in this group's emitter's store.
    this.emitters.push(emitter);
    this.emitterIDs.push(emitter.uuid);

    // Update certain flags to enable shader calculations only if they're necessary.
    this.updateDefines();

    // Update the material since defines might have changed
    this.material.needsUpdate = true;
    // @ts-expect-error: TODO: Needs looking at
    this.geometry.needsUpdate = true;
    this.attributesNeedRefresh = true;

    // Return the group to enable chaining.
    return this;
  };

  /**
   * Removes an Emitter instance from this group. When called,
   * all particle's belonging to the given emitter will be instantly
   * removed from the scene.
   *
   * @param {Emitter} emitter The emitter to add to this group.
   */
  public removeEmitter = (emitter: Emitter) => {
    const emitterIndex = this.emitterIDs.indexOf(emitter.uuid);
    // Ensure an actual emitter instance is passed here.
    //
    // Decided not to throw here, just in case a scene's
    // rendering would be paused. Logging an error instead
    // of stopping execution if exceptions aren't caught.
    if (emitter instanceof Emitter === false) {
      console.error('`emitter` argument must be instance of Emitter. Was provided with:', emitter);
      return;
    }

    // Issue an error if the emitter isn't a member of this group.
    else if (emitterIndex === -1) {
      console.error('Emitter does not exist in this group. Will not remove.');
      return;
    }

    // Kill all particles by marking them as dead
    // and their age as 0.
    const start = emitter.attributeOffset;
    const end = start + emitter.particleCount;
    const params = this.attributes.params.typedArray!;

    // Set alive and age to zero.
    for (let i = start; i < end; ++i) {
      params.array[i * 4] = 0.0;
      params.array[i * 4 + 1] = 0.0;
    }

    // Remove the emitter from this group's "store".
    this.emitters.splice(emitterIndex, 1);
    this.emitterIDs.splice(emitterIndex, 1);

    // Remove this emitter's attribute values from all shader attributes.
    // The `.splice()` call here also marks each attribute's buffer
    // as needing to update it's entire contents.

    // TODO: JR - check implications of not splicing the params attributes (memory leak?)
    for (const attr in this.attributes) {
      if (Object.hasOwn(this.attributes, attr)) {
        if (attr === 'params') continue; // this fixes https://github.com/squarefeet/ShaderParticleEngine/issues/130
        this.attributes[attr as IShaderAttributeKeys].splice(start, end);
      }
    }

    // Ensure this group's particle count is correct.
    this.particleCount -= emitter.particleCount;

    // Call the emitter's remove method.
    emitter.onRemove();

    // Set a flag to indicate that the attribute buffers should
    // be updated in their entirety on the next frame.
    this.attributesNeedRefresh = true;
  };

  /**
   * Fetch a single emitter instance from the pool.
   * If there are no objects in the pool, a new emitter will be
   * created if specified.
   *
   * @return {Emitter|null}
   */
  public getFromPool = () => {
    const pool = this._pool;
    const createNew = this._createNewWhenPoolEmpty;

    if (pool.length) {
      return pool.pop();
    } else if (createNew) {
      const emitter = new Emitter(this._poolCreationSettings || undefined);

      this.addEmitter(emitter);

      return emitter;
    }

    return null;
  };

  /**
   * Release an emitter into the pool.
   *
   * @param  {ShaderEmitter} emitter
   * @return {Group} This group instance.
   */
  public releaseIntoPool = (emitter: Emitter) => {
    if (emitter instanceof Emitter === false) {
      console.error('Argument is not instanceof Emitter:', emitter);
      return;
    }

    emitter.reset();
    this._pool.unshift(emitter);

    return this;
  };

  /**
   * Get the pool array
   *
   * @return {Array}
   */
  public getPool = () => {
    return this._pool;
  };

  /**
   * Add a pool of emitters to this particle group
   *
   * @param {Number} numEmitters      The number of emitters to add to the pool.
   * @param {EmitterOptions|Array} emitterOptions  An object, or array of objects, describing the options to pass to each emitter.
   * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
   * @return {Group} This group instance.
   */
  public addPool = (numEmitters: number, emitterOptions: IEmitterOptions, createNew: boolean) => {
    let emitter;

    // Save relevant settings and flags.
    this._poolCreationSettings = emitterOptions;
    this._createNewWhenPoolEmpty = !!createNew;

    // Create the emitters, add them to this group and the pool.
    for (let i = 0; i < numEmitters; ++i) {
      if (Array.isArray(emitterOptions)) {
        emitter = new Emitter(emitterOptions[i]);
      } else {
        emitter = new Emitter(emitterOptions);
      }
      this.addEmitter(emitter);
      this.releaseIntoPool(emitter);
    }

    return this;
  };

  private _triggerSingleEmitter = (pos: Vector3) => {
    const emitter = this.getFromPool();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    if (!emitter) {
      console.log('EmitterGroup pool ran out.');
      return;
    }

    // TODO:
    // - Make sure buffers are update with thus new position.
    if (pos instanceof Vector3) {
      emitter.position.value.copy(pos);

      // Trigger the setter for this property to force an
      // update to the emitter's position attribute.
      emitter.position.value = emitter.position.value; // eslint-disable-line no-self-assign
    }

    emitter.enable();

    setTimeout(
      () => {
        emitter.disable();
        self.releaseIntoPool(emitter);
      },
      Math.max(emitter.duration!, emitter.maxAge.value + emitter.maxAge.spread) * 1000
    );

    return this;
  };

  /**
   * Set a given number of emitters as alive, with an optional position
   * vector3 to move them to.
   *
   * @param  {Number} numEmitters The number of emitters to activate
   * @param  {Object} [position=undefined] A THREE.Vector3 instance describing the position to activate the emitter(s) at.
   * @return {Group} This group instance.
   */
  public triggerPoolEmitter = (numEmitters: number, position: Vector3) => {
    if (typeof numEmitters === 'number' && numEmitters > 1) {
      for (let i = 0; i < numEmitters; ++i) {
        this._triggerSingleEmitter(position);
      }
    } else {
      this._triggerSingleEmitter(position);
    }

    return this;
  };

  private _updateUniforms = (dt: number) => {
    this.uniforms.runTime.value += dt;
    this.uniforms.deltaTime.value = dt;
  };

  private _resetBufferRanges = () => {
    const keys = this.attributeKeys;
    let i = this.attributeCount - 1;
    const attrs = this.attributes;

    for (i; i >= 0; --i) {
      attrs[keys[i]].resetUpdateRange();
    }
  };

  private _updateBuffers = (emitter: Emitter) => {
    const keys = this.attributeKeys;
    let i = this.attributeCount - 1;
    const attrs = this.attributes;
    const emitterRanges = emitter.bufferUpdateRanges;
    let key;
    let emitterAttr;
    let attr;

    for (i; i >= 0; --i) {
      key = keys[i];
      emitterAttr = emitterRanges[key];
      attr = attrs[key];
      attr.setUpdateRange(emitterAttr!.min, emitterAttr!.max);
      attr.flagUpdate();
    }
  };

  /**
   * Simulate all the emitter's belonging to this group, updating
   * attribute values along the way.
   * @param  {Number} [dt=Group's `fixedTimeStep` value] The number of seconds to simulate the group's emitters for (deltaTime)
   */
  public tick = (dt?: number) => {
    const emitters = this.emitters;
    const numEmitters = emitters.length;
    const deltaTime = dt || this.fixedTimeStep;
    const keys = this.attributeKeys;
    let i;
    const attrs = this.attributes;

    // Update uniform values.
    this._updateUniforms(deltaTime);

    // Reset buffer update ranges on the shader attributes.
    this._resetBufferRanges();

    // If nothing needs updating, then stop here.
    if (numEmitters === 0 && this.attributesNeedRefresh === false && this._attributesNeedDynamicReset === false) {
      return;
    }

    // Loop through each emitter in this group and
    // simulate it, then update the shader attribute
    // buffers.
    for (let j = 0, emitter; j < numEmitters; ++j) {
      emitter = emitters[j];
      emitter.tick(deltaTime);
      this._updateBuffers(emitter);
    }

    // If the shader attributes have been refreshed,
    // then the dynamic properties of each buffer
    // attribute will need to be reset back to
    // what they should be.
    if (this._attributesNeedDynamicReset === true) {
      i = this.attributeCount - 1;

      for (i; i >= 0; --i) {
        attrs[keys[i]].resetDynamic();
      }

      this._attributesNeedDynamicReset = false;
    }

    // If this group's shader attributes need a full refresh
    // then mark each attribute's buffer attribute as
    // needing so.
    if (this.attributesNeedRefresh === true) {
      i = this.attributeCount - 1;

      for (i; i >= 0; --i) {
        attrs[keys[i]].forceUpdateAll();
      }

      this.attributesNeedRefresh = false;
      this._attributesNeedDynamicReset = true;
    }
  };

  /**
   * Dipose the geometry and material for the group.
   *
   * @return {Group} Group instance.
   */
  public dispose = () => {
    this.geometry.dispose();
    this.texture?.dispose();
    this.material.dispose();
    return this;
  };
}
