import {Color, MathUtils, REVISION, Vector3} from 'three';
import {EmitterState} from '../../shared/helpers/EmitterState';
import {utils} from '../../shared/helpers/EmitterUtils';
import {EmitterGroup, valueOverLifetimeLength} from './EmitterGroup';
import {
  IEmitterOptions,
  IDistribution,
  IEmitterPositionState,
  IEmitterVelocityState,
  IEmitterAcceleratorState,
  IEmitterDragState,
  IEmitterWiggleState,
  IEmitterMaxAgeState,
  IEmitterOpacityState,
  IEmitterSizeState,
  IEmitterAngleState,
  IEmitterColorState,
  IEmitterIntersectionState,
  IUpdateMap,
  IParticleBasePropKeys,
  IShaderAttributes,
  IShaderAttributeKeys,
  IShaderAttributeKeyArray,
  IEmitterOrbitState,
  IEmitterRotationState,
} from './types';

/**
 * An Emitter instance.
 * @typedef {Object} Emitter
 * @see Emitter
 */

/**
 * A map of options to configure an Emitter instance.
 *
 * @typedef {Object} EmitterOptions
 *
 * @property {IDistribution} [type=BOX] The default distribution this emitter should use to control
 *                         its particle's spawn position and force behaviour.
 *                         Must be an IDistribution.* value.
 *
 *
 * @property {Number} [particleCount=100] The total number of particles this emitter will hold. NOTE: this is not the number
 *                                  of particles emitted in a second, or anything like that. The number of particles
 *                                  emitted per-second is calculated by particleCount / maxAge (approximately!)
 *
 * @property {Number|null} [duration=null] The duration in seconds that this emitter should live for. If not specified, the emitter
 *                                         will emit particles indefinitely.
 *                                         NOTE: When an emitter is older than a specified duration, the emitter is NOT removed from
 *                                         it's group, but rather is just marked as dead, allowing it to be reanimated at a later time
 *                                         using `Emitter.prototype.enable()`.
 *
 * @property {Boolean} [isStatic=false] Whether this emitter should be not be simulated (true).
 * @property {Boolean} [activeMultiplier=1] A value between 0 and 1 describing what percentage of this emitter's particlesPerSecond should be
 *                                          emitted, where 0 is 0%, and 1 is 100%.
 *                                          For example, having an emitter with 100 particles, a maxAge of 2, yields a particlesPerSecond
 *                                          value of 50. Setting `activeMultiplier` to 0.5, then, will only emit 25 particles per second (0.5 = 50%).
 *                                          Values greater than 1 will emulate a burst of particles, causing the emitter to run out of particles
 *                                          before it's next activation cycle.
 *
 * @property {Boolean} [direction=1] The direction of the emitter. If value is `1`, emitter will start at beginning of particle's lifecycle.
 *                                   If value is `-1`, emitter will start at end of particle's lifecycle and work it's way backwards.
 *
 * @property {Object} [maxAge={}] An object describing the particle's maximum age in seconds.
 * @property {Number} [maxAge.value=2] A number between 0 and 1 describing the amount of maxAge to apply to all particles.
 * @property {Number} [maxAge.spread=0] A number describing the maxAge variance on a per-particle basis.
 *
 *
 * @property {Object} [position={}] An object describing this emitter's position.
 * @property {Object} [position.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base position.
 * @property {Object} [position.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's position variance on a per-particle basis.
 *                                                          Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                          of this vector is used.
 *                                                          When using a LINE distribution, this value is the endpoint of the LINE.
 * @property {Object} [position.spreadClamp=new THREE.Vector3()] A THREE.Vector3 instance describing the numeric multiples the particle's should
 *                                                               be spread out over.
 *                                                               Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                               of this vector is used.
 *                                                               When using a LINE distribution, this property is ignored.
 * @property {Number} [position.radius=10] This emitter's base radius.
 * @property {Object} [position.radiusScale=new THREE.Vector3()] A THREE.Vector3 instance describing the radius's scale in all three axes. Allows a SPHERE or DISC to be squashed or stretched.
 * @property {distribution} [position.distribution=value of the `type` option.] A specific distribution to use when radiusing particles. Overrides the `type` option.
 * @property {Boolean} [position.randomise=false] When a particle is re-spawned, whether it's position should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [velocity={}] An object describing this particle velocity.
 * @property {Object} [velocity.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base velocity.
 * @property {Object} [velocity.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's velocity variance on a per-particle basis.
 *                                                          Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                          of this vector is used.
 * @property {distribution} [velocity.distribution=value of the `type` option.] A specific distribution to use when calculating a particle's velocity. Overrides the `type` option.
 * @property {Boolean} [velocity.randomise=false] When a particle is re-spawned, whether it's velocity should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [acceleration={}] An object describing this particle's acceleration.
 * @property {Object} [acceleration.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base acceleration.
 * @property {Object} [acceleration.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's acceleration variance on a per-particle basis.
 *                           Note that when using a SPHERE or DISC distribution, only the x-component
 *                           of this vector is used.
 * @property {distribution} [acceleration.distribution=value of the `type` option.] A specific distribution to use when calculating a particle's acceleration. Overrides the `type` option.
 * @property {Boolean} [acceleration.randomise=false] When a particle is re-spawned, whether it's acceleration should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [drag={}] An object describing this particle drag. Drag is applied to both velocity and acceleration values.
 * @property {Number} [drag.value=0] A number between 0 and 1 describing the amount of drag to apply to all particles.
 * @property {Number} [drag.spread=0] A number describing the drag variance on a per-particle basis.
 * @property {Boolean} [drag.randomise=false] When a particle is re-spawned, whether it's drag should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [wiggle={}] This is quite a fun one! The values of this object will determine whether a particle will wiggle, or jiggle, or wave,
 *                                or shimmy, or waggle, or... Well you get the idea. The wiggle is calculated over-time, meaning that a particle will
 *                                start off with no wiggle, and end up wiggling about with the distance of the `value` specified by the time it dies.
 *                                It's quite handy to simulate fire embers, or similar effects where the particle's position should slightly change over
 *                                time, and such change isn't easily controlled by rotation, velocity, or acceleration. The wiggle is a combination of sin and cos calculations, so is circular in nature.
 * @property {Number} [wiggle.value=0] A number describing the amount of wiggle to apply to all particles. It's measured in distance.
 * @property {Number} [wiggle.spread=0] A number describing the wiggle variance on a per-particle basis.
 *
 *
 * @property {Object} [orbit={}] An object describing this emitter's orbit behaviour. It can either be static, or set to rotate from 0radians to the value of `orbit.value`
 *                                  over a particle's lifetime. Orbit values affect both a particle's position and the forces applied to it.
 * @property {Object} [orbit.axis=new THREE.Vector3(0, 1, 0)] A THREE.Vector3 instance describing this emitter's axis of orbit.
 * @property {Object} [orbit.axisSpread=new THREE.Vector3()] A THREE.Vector3 instance describing the amount of variance to apply to the axis of orbit on
 *                                                              a per-particle basis.
 * @property {Number} [orbit.angle=0] The angle of orbiting, given in radians. If `orbit.static` is true, the emitter will start off orbiting at this angle, and stay as such.
 *                                       Otherwise, the particles will orbit from 0 radians to this value over their lifetimes.
 * @property {Number} [orbit.angleSpread=0] The amount of variance in each particle's orbit angle.
 * @property {Boolean} [orbit.static=false] Whether the orbit should be static or not.
 * @property {Object} [orbit.center=The value of `position.value`] A THREE.Vector3 instance describing the center point around which the particles orbit.
 * @property {Boolean} [orbit.randomise=false] When a particle is re-spawned, whether it's orbit behaviour should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [color={}] An object describing a particle's color. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of valueOverLifetimeLength, if arrays of THREE.Color instances are given, then the array will be interpolated to
 *                               have a length matching the value of valueOverLifetimeLength.
 * @property {Object} [color.value=new THREE.Color()] Either a single THREE.Color instance, or an array of THREE.Color instances to describe the color of a particle over it's lifetime.
 * @property {Object} [color.spread=new THREE.Vector3()] Either a single THREE.Vector3 instance, or an array of THREE.Vector3 instances to describe the color variance of a particle over it's lifetime.
 * @property {Boolean} [color.randomise=false] When a particle is re-spawned, whether it's color should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [opacity={}] An object describing a particle's opacity. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of valueOverLifetimeLength.
 * @property {Number} [opacity.value=1] Either a single number, or an array of numbers to describe the opacity of a particle over it's lifetime.
 * @property {Number} [opacity.spread=0] Either a single number, or an array of numbers to describe the opacity variance of a particle over it's lifetime.
 * @property {Boolean} [opacity.randomise=false] When a particle is re-spawned, whether it's opacity should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [size={}] An object describing a particle's size. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of valueOverLifetimeLength.
 * @property {Number} [size.value=1] Either a single number, or an array of numbers to describe the size of a particle over it's lifetime.
 * @property {Number} [size.spread=0] Either a single number, or an array of numbers to describe the size variance of a particle over it's lifetime.
 * @property {Boolean} [size.randomise=false] When a particle is re-spawned, whether it's size should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [angle={}] An object describing a particle's angle. The angle is a 2d-rotation, measured in radians, applied to the particle's texture.
 *                               NOTE: if a particle's texture is a sprite-sheet, this value IS IGNORED.
 *                               This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of valueOverLifetimeLength.
 * @property {Number} [angle.value=0] Either a single number, or an array of numbers to describe the angle of a particle over it's lifetime.
 * @property {Number} [angle.spread=0] Either a single number, or an array of numbers to describe the angle variance of a particle over it's lifetime.
 * @property {Boolean} [angle.randomise=false] When a particle is re-spawned, whether it's angle should be re-randomised or not. Can incur a performance hit.
 *
 * @property {Number} [rotation={}] An object describing each particle's rotation behaviour. A particle can either be static, or set to rotate by a given amount of radians
 *                                  over it's lifetime. Rotation values affect only the rotation of a particle. Note that rotation values do not apply to directional billboarded particles or when randomParticleRotationAngle is set on the emitter group.
 *                                  For cylindrically or spherically billboarded particles the rotation axis always defaults to (0, 0, 1).
 *
 * @property {Object} [rotation.axis=new THREE.Vector3(0, 0, 1)] A THREE.Vector3 instance describing the axis around which particles rotate. Note that for cylindcrically and spherically billboarded particles this always defaults to an axis of (0. 0. 1)
 * @property {Object} [rotation.axisSpread=new THREE.Vector3()] A THREE.Vector3 instance describing the amount of variance to apply to the rotation axis on a per-particle basis. Note that for cylindcrical and spherical particles this defaults to (0. 0. 0).
 * @property {Number} [rotation.angle=0] The angle of rotation, given in radians. If `rotation.static` is true, the particle will start off rotating at this angle, and stay as such.
 *                                       Otherwise, the particles will rotate from 0 radians to this value over their lifetimes.
 * @property {Number} [rotation.angleSpread=0] The amount of variance in each particle's rotation angle.
 * @property {Boolean} [rotation.static=false] Whether the rotation should be static or not.
 * @property {Boolean} [rotation.randomise=false] When a particle is re-spawned, whether it's rotation behaviour should be re-randomised or not. Can incur a performance hit.
 */

/**
 * The Emitter class.
 *
 * @constructor
 *
 * @param {EmitterOptions} options A map of options to configure the emitter.
 */

export class Emitter {
  public uuid: string;
  public isEmitter = true;
  public position: IEmitterPositionState;
  public velocity: IEmitterVelocityState;
  public acceleration: IEmitterAcceleratorState;
  public drag: IEmitterDragState;
  public wiggle: IEmitterWiggleState;
  public orbit: IEmitterOrbitState;
  public maxAge: IEmitterMaxAgeState;
  public color: IEmitterColorState;
  public opacity: IEmitterOpacityState;
  public size: IEmitterSizeState;
  public rotation: IEmitterRotationState;
  public angle: IEmitterAngleState;
  public particleCount: number;
  public duration: number | null;
  public isStatic: boolean;
  public activeMultiplier: number;
  public direction: number;
  public alive: boolean;
  public particlesPerSecond: number;
  public activationIndex: number;
  public attributeOffset: number;
  public attributeEnd: number;
  public age: number;
  public activeParticleCount: number;
  public group: InstanceType<typeof EmitterGroup> | null;
  public attributes: IShaderAttributes | null;
  public paramsArray: Float32Array | Uint8Array | null;
  public resetFlags: Partial<Record<IUpdateMap[keyof IUpdateMap] | 'orbitCenter', boolean>>;
  public updateFlags: Partial<Record<IUpdateMap[keyof IUpdateMap] | 'orbitCenter', boolean>>;
  public updateCounts: Partial<Record<IUpdateMap[keyof IUpdateMap] | 'orbitCenter', number>>;
  public updateMap: IUpdateMap;
  public bufferUpdateRanges: Partial<Record<IShaderAttributeKeys, {min: number; max: number}>>;
  public attributeKeys: IShaderAttributeKeyArray | null;
  public attributeCount: number;
  public activationEnd: number | undefined;

  private _onFinishCbs: (() => unknown)[] = [];

  public onFinish(fn?: () => unknown): void {
    if (fn) this._onFinishCbs.push(fn);
  }

  private _type: IDistribution;

  public set type(value: IDistribution) {
    this._type = value;
    this.position.distribution = value;
    this.velocity.distribution = value;
    this.acceleration.distribution = value;
  }

  public get type(): IDistribution {
    return this._type;
  }

  constructor(options: IEmitterOptions = {}) {
    const lifetimeLength = valueOverLifetimeLength;

    // if ( options.onParticleSpawn ) {
    //     console.warn( 'onParticleSpawn has been removed. Please set properties directly to alter values at runtime.' );
    // }

    this.uuid = MathUtils.generateUUID();
    this._type = options.type ?? IDistribution.BOX;

    // Start assigning properties...kicking it off with props that DON'T support values over
    // lifetimes.
    //
    // Btw, values over lifetimes are just the new way of referring to *Start, *Middle, and *End.

    this.position = this._emitterStateFactory<IEmitterPositionState>('position', {
      value: options.position?.value ?? new Vector3(),
      spread: options.position?.spread ?? new Vector3(),
      spreadClamp: options.position?.spreadClamp ?? new Vector3(),
      distribution: options.position?.distribution ?? this.type,
      randomise: options.position?.randomise ?? false,
      radius: options.position?.radius ?? 10,
      radiusScale: options.position?.radiusScale ?? new Vector3(1, 1, 1),
    });

    this.velocity = this._emitterStateFactory<IEmitterVelocityState>('velocity', {
      value: options.velocity?.value ?? new Vector3(),
      spread: options.velocity?.spread ?? new Vector3(),
      distribution: options.velocity?.distribution ?? this.type,
      randomise: options.velocity?.randomise ?? false,
    });

    this.acceleration = this._emitterStateFactory<IEmitterAcceleratorState>('acceleration', {
      value: options.acceleration?.value ?? new Vector3(),
      spread: options.acceleration?.spread ?? new Vector3(),
      distribution: options.acceleration?.distribution ?? this.type,
      randomise: options.acceleration?.randomise ?? false,
    });

    this.drag = this._emitterStateFactory<IEmitterDragState>('drag', {
      value: options.drag?.value ?? 0,
      spread: options.drag?.spread ?? 0,
      randomise: options.drag?.randomise ?? false,
    });

    this.wiggle = this._emitterStateFactory<IEmitterWiggleState>('wiggle', {
      value: options.wiggle?.value ?? 0,
      spread: options.wiggle?.spread ?? 0,
    });

    this.orbit = this._emitterStateFactory<IEmitterOrbitState>('orbit', {
      axis: options.orbit?.axis ?? new Vector3(0.0, 1.0, 0.0),
      axisSpread: options.orbit?.axisSpread ?? new Vector3(),
      angle: options.orbit?.angle ?? 0,
      angleSpread: options.orbit?.angleSpread ?? 0,
      static: options.orbit?.static ?? false,
      center: options.orbit?.center ?? this.position.value.clone(),
      randomise: options.orbit?.randomise ?? false,
    });

    this.rotation = this._emitterStateFactory<IEmitterRotationState>('rotation', {
      angle: options.rotation?.angle ?? 0,
      angleSpread: options.rotation?.angleSpread ?? 0,
      axis: options.rotation?.axis ?? new Vector3(0.0, 0.0, 1.0),
      axisSpread: options.rotation?.axisSpread ?? new Vector3(),
      randomise: options.rotation?.randomise ?? false,
      static: options.rotation?.static ?? false,
    });

    this.maxAge = this._emitterStateFactory<IEmitterMaxAgeState>('maxAge', {
      value: options.maxAge?.value ?? 2,
      spread: options.maxAge?.spread ?? 0,
    });

    // The following properties can support either single values, or an array of values that change
    // the property over a particle's lifetime (value over lifetime).

    this.color = this._emitterStateFactory<IEmitterColorState>('color', {
      value: options.color?.value ?? new Color(),
      spread: options.color?.spread ?? new Vector3(),
      randomise: options.color?.randomise ?? false,
    });

    this.opacity = this._emitterStateFactory<IEmitterOpacityState>('opacity', {
      value: options.opacity?.value ?? 1,
      spread: options.opacity?.spread ?? 0,
      randomise: options.opacity?.randomise ?? false,
    });

    this.size = this._emitterStateFactory<IEmitterSizeState>('size', {
      value: options.size?.value ?? 1,
      spread: options.size?.spread ?? 0,
      randomise: options.size?.randomise ?? false,
    });

    this.angle = this._emitterStateFactory<IEmitterAngleState>('angle', {
      value: options.angle?.value ?? 0,
      spread: options.angle?.spread ?? 0,
      randomise: options.position?.randomise ?? false,
    });

    // Assign remaining option values.
    this.particleCount = options.particleCount ?? 100;
    this.duration = options.duration ?? null;
    this.isStatic = options.isStatic ?? false;
    this.activeMultiplier = options.activeMultiplier ?? 1;
    this.direction = options.direction ?? 1;
    if (options.onFinish) this._onFinishCbs.push(options.onFinish);

    // Whether this emitter is alive or not.
    this.alive = options.alive ?? true;

    // The following properties are set internally and are not
    // user-controllable.
    this.particlesPerSecond = 0;

    // The current particle index for which particles should
    // be marked as active on the next update cycle.
    this.activationIndex = 0;

    // The offset in the typed arrays this emitter's
    // particle's values will start at
    this.attributeOffset = 0;

    // The end of the range in the attribute buffers
    this.attributeEnd = 0;

    // Holds the time the emitter has been alive for.
    this.age = 0.0;

    // Holds the number of currently-alive particles
    this.activeParticleCount = 0.0;

    // Holds a reference to this emitter's group once
    // it's added to one.
    this.group = null;

    // Holds a reference to this emitter's group's attributes object
    // for easier access.
    this.attributes = null;

    // Holds a reference to the params attribute's typed array
    // for quicker access.
    this.paramsArray = null;

    // A set of flags to determine whether particular properties
    // should be re-randomised when a particle is reset.
    //
    // If a `randomise` property is given, this is preferred.
    // Otherwise, it looks at whether a spread value has been
    // given.
    //
    // It allows randomization to be turned off as desired. If
    // all randomization is turned off, then I'd expect a performance
    // boost as no attribute buffers (excluding the `params`)
    // would have to be re-passed to the GPU each frame (since nothing
    // except the `params` attribute would have changed).
    this.resetFlags = {
      // params: utils.ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
      // utils.ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
      position: (options.position?.randomise ?? false) || (options.radius?.randomise ?? false),
      velocity: options.velocity?.randomise ?? false,
      acceleration: (options.acceleration?.randomise ?? false) || (options.drag?.randomise ?? false),
      orbit: options.orbit?.randomise ?? false,
      orbitCenter: options.orbit?.randomise ?? false,
      rotation: options.rotation?.randomise ?? false,
      size: options.size?.randomise ?? false,
      color: options.color?.randomise ?? false,
      opacity: options.opacity?.randomise ?? false,
      angle: options.angle?.randomise ?? false,
    };

    this.updateFlags = {};
    this.updateCounts = {};

    // A map to indicate which emitter parameters should update
    // which attribute.
    this.updateMap = {
      maxAge: 'params',
      position: 'position',
      velocity: 'velocity',
      acceleration: 'acceleration',
      drag: 'acceleration',
      wiggle: 'params',
      orbit: 'orbit',
      size: 'size',
      color: 'color',
      opacity: 'opacity',
      angle: 'angle',
      rotation: 'rotation',
    };

    for (const i in this.updateMap) {
      if (Object.hasOwn(this.updateMap, i)) {
        this.updateCounts[this.updateMap[i as keyof IUpdateMap]] = 0.0;
        this.updateFlags[this.updateMap[i as keyof IUpdateMap]] = false;
      }
    }

    this.bufferUpdateRanges = {};
    this.attributeKeys = null;
    this.attributeCount = 0;

    // Ensure that the value-over-lifetime property objects above
    // have value and spread properties that are of the same length.
    //
    // Also, for now, make sure they have a length of 3 (min/max arguments here).
    utils.ensureValueOverLifetimeCompliance(this.color, lifetimeLength, lifetimeLength);
    utils.ensureValueOverLifetimeCompliance(this.opacity, lifetimeLength, lifetimeLength);
    utils.ensureValueOverLifetimeCompliance(this.size, lifetimeLength, lifetimeLength);
    utils.ensureValueOverLifetimeCompliance(this.angle, lifetimeLength, lifetimeLength);
  }

  public setBufferUpdateRanges = (keys: IShaderAttributeKeyArray) => {
    this.attributeKeys = keys;
    this.attributeCount = keys.length;

    for (let i = this.attributeCount - 1; i >= 0; --i) {
      this.bufferUpdateRanges[keys[i]] = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      };
    }
  };

  public calculatePPSValue = (groupMaxAge: number) => {
    const particleCount = this.particleCount;
    // Calculate the `particlesPerSecond` value for this emitter. It's used
    // when determining which particles should die and which should live to
    // see another day. Or be born, for that matter. The "God" property.
    if (this.duration) {
      this.particlesPerSecond = particleCount / (groupMaxAge < this.duration ? groupMaxAge : this.duration);
    } else {
      this.particlesPerSecond = particleCount / groupMaxAge;
    }
  };

  public setAttributeOffset = (startIndex: number) => {
    this.attributeOffset = startIndex;
    this.activationIndex = startIndex;
    this.activationEnd = startIndex + this.particleCount;
  };

  private _assignValue = (prop: IParticleBasePropKeys | 'params', index: number) => {
    switch (prop) {
      case 'position':
        this.assignPositionValue(index);
        break;

      case 'velocity':
      case 'acceleration':
        this.assignForceValue(index, prop);
        break;

      case 'size':
      case 'opacity':
        this.assignAbsLifetimeValue(index, prop);
        break;

      case 'angle':
        this.assignAngleValue(index);
        break;

      case 'params':
        this.assignParamsValue(index);
        break;

      case 'orbit':
        this.assignOrbitValue(index);
        break;
      case 'rotation':
        this.assignRotationValue(index);
        break;
      case 'color':
        this.assignColorValue(index);
        break;
    }
  };

  public assignPositionValue = (index: number) => {
    const prop = this.position,
      attr = this.attributes!.position,
      value = prop.value,
      spread = prop.spread,
      distribution = prop.distribution;

    switch (distribution) {
      case IDistribution.BOX:
        utils.randomVector3(attr, index, value, spread, prop.spreadClamp);
        break;

      case IDistribution.SPHERE:
        utils.randomVector3OnSphere(attr, index, value, prop.radius, prop.spread.x, prop.radiusScale, prop.spreadClamp.x); //, prop.distributionClamp || this.particleCount );
        break;

      case IDistribution.DISC:
        utils.randomVector3OnDisc(attr, index, value, prop.radius, prop.spread.x, prop.radiusScale, prop.spreadClamp.x);
        break;

      case IDistribution.LINE:
        utils.randomVector3OnLine(attr, index, value, spread);
        break;
    }
  };

  public assignForceValueAll = (attrName: IParticleBasePropKeys) => {
    const start = this.attributeOffset;
    const end = start + this.particleCount;
    for (let i = start; i < end; ++i) {
      this.assignForceValue(i, attrName);
    }
  };

  public assignForceValue = (index: number, attrName: IParticleBasePropKeys) => {
    const prop = this[attrName] as IEmitterIntersectionState;
    const value = prop.value;
    const spread = prop.spread;
    const distribution = prop.distribution;
    const attributes = this.attributes!;
    let pos, positionX, positionY, positionZ, i;

    switch (distribution) {
      case IDistribution.BOX:
        utils.randomVector3(attributes[attrName], index, value, spread);
        break;

      case IDistribution.SPHERE:
        pos = attributes.position.typedArray!.array;
        i = index * 3;

        // Ensure position values aren't zero, otherwise no force will be
        // applied.
        // positionX = utils.zeroToEpsilon( pos[ i ], true );
        // positionY = utils.zeroToEpsilon( pos[ i + 1 ], true );
        // positionZ = utils.zeroToEpsilon( pos[ i + 2 ], true );
        positionX = pos[i];
        positionY = pos[i + 1];
        positionZ = pos[i + 2];

        utils.randomDirectionVector3OnSphere(attributes[attrName], index, positionX, positionY, positionZ, this.position.value, prop.value.x, prop.spread.x);
        break;

      case IDistribution.DISC:
        pos = attributes.position.typedArray!.array;
        i = index * 3;

        // Ensure position values aren't zero, otherwise no force will be
        // applied.
        // positionX = utils.zeroToEpsilon( pos[ i ], true );
        // positionY = utils.zeroToEpsilon( pos[ i + 1 ], true );
        // positionZ = utils.zeroToEpsilon( pos[ i + 2 ], true );
        positionX = pos[i];
        positionY = pos[i + 1];
        positionZ = pos[i + 2];

        utils.randomDirectionVector3OnDisc(attributes[attrName], index, positionX, positionY, positionZ, this.position.value, prop.value.x, prop.spread.x);
        break;

      case IDistribution.LINE:
        utils.randomVector3OnLine(attributes[attrName], index, value, spread);
        break;
    }

    if (attrName === 'acceleration') {
      const drag = utils.clamp(utils.randomFloat(this.drag.value, this.drag.spread), 0, 1);
      attributes.acceleration.typedArray!.array[index * 4 + 3] = drag;
    }
  };

  public assignAbsLifetimeValue = (index: number, propName: 'opacity' | 'size') => {
    const array = this.attributes?.[propName].typedArray!; //eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
    const prop = this[propName as keyof Emitter] as IEmitterOpacityState | IEmitterSizeState;
    const propValue = prop.value instanceof Array ? prop.value : [prop.value];
    const propSpread = prop.spread instanceof Array ? prop.spread : [prop.spread];
    let value;

    if (utils.arrayValuesAreEqual(propValue) && utils.arrayValuesAreEqual(propSpread)) {
      value = Math.abs(utils.randomFloat(propValue[0], propSpread[0]));
      array.setVec4Components(index, value, value, value, value);
    } else {
      // TODO: this works somehow even when there are not 4 items in the arrays... need to check why!
      array.setVec4Components(
        index,
        Math.abs(utils.randomFloat(propValue[0], propSpread[0])),
        Math.abs(utils.randomFloat(propValue[1], propSpread[1])),
        Math.abs(utils.randomFloat(propValue[2], propSpread[2])),
        Math.abs(utils.randomFloat(propValue[3], propSpread[3]))
      );
    }
  };

  public assignAngleValue = (index: number) => {
    const array = this.attributes?.angle.typedArray!; //eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
    const prop = this.angle;
    const propValue = prop.value instanceof Array ? prop.value : [prop.value];
    const propSpread = prop.spread instanceof Array ? prop.spread : [prop.spread];
    let value;

    if (utils.arrayValuesAreEqual(propValue) && utils.arrayValuesAreEqual(propSpread)) {
      value = utils.randomFloat(propValue[0], propSpread[0]);
      array.setVec4Components(index, value, value, value, value);
    } else {
      // TODO: this works somehow even when there are not 4 items in the arrays... need to check why!
      array.setVec4Components(
        index,
        utils.randomFloat(propValue[0], propSpread[0]),
        utils.randomFloat(propValue[1], propSpread[1]),
        utils.randomFloat(propValue[2], propSpread[2]),
        utils.randomFloat(propValue[3], propSpread[3])
      );
    }
  };

  public assignParamsValue = (index: number) => {
    this.attributes!.params!.typedArray!.setVec4Components(index, this.isStatic ? 1 : 0, 0.0, Math.abs(utils.randomFloat(this.maxAge.value, this.maxAge.spread)), utils.randomFloat(this.wiggle.value, this.wiggle.spread));
  };

  public assignOrbitValue = (index: number) => {
    this.attributes!.orbit!.typedArray!.setVec3Components(
      index,
      utils.getPackedRotationAxis(this.orbit.axis, this.orbit.axisSpread),
      utils.randomFloat(this.orbit.angle, this.orbit.angleSpread),
      this.orbit.static ? 0 : 1
    );

    this.attributes!.orbitCenter!.typedArray!.setVec3Components(index, this.orbit.center.x, this.orbit.center.y, this.orbit.center.z);
  };

  public assignRotationValue = (index: number) => {
    this.attributes!.rotation!.typedArray!.setVec3Components(
      index,
      utils.getPackedRotationAxis(this.rotation.axis, this.rotation.axisSpread),
      utils.randomFloat(this.rotation.angle, this.rotation.angleSpread),
      this.rotation.static ? 1 : 0
    );
  };

  public assignColorValue = (index: number) => {
    const colorValue = this.color.value instanceof Array ? this.color.value : [this.color.value];
    const colorSpread = this.color.spread instanceof Array ? this.color.spread : [this.color.spread];
    utils.randomColorAsHex(this.attributes!.color, index, colorValue, colorSpread);
  };

  private _resetParticle = (index: number) => {
    const resetFlags = this.resetFlags;
    const updateFlags = this.updateFlags;
    const updateCounts = this.updateCounts;
    const keys = this.attributeKeys!;
    let key: IShaderAttributeKeys;
    let updateFlag;

    for (let i = this.attributeCount - 1; i >= 0; --i) {
      key = keys[i];
      updateFlag = updateFlags[key];
      if (resetFlags[key] === true || updateFlag === true) {
        this._assignValue(key as IParticleBasePropKeys, index);
        this._updateAttributeUpdateRange(key, index);
        // TODO: JR - changed to twice the particle count. this has some performance implications but
        // fixes particles that weren't updated properly at runtime. Needs another look at.
        if (updateFlag === true && updateCounts[key] === this.particleCount * 2) {
          updateFlags[key] = false;
          updateCounts[key] = 0.0;
        } else if (updateFlag === true) {
          ++updateCounts[key as IParticleBasePropKeys]!;
        }
      }
    }
  };

  private _updateAttributeUpdateRange = (attr: IShaderAttributeKeys, i: number) => {
    const ranges = this.bufferUpdateRanges[attr]!;
    ranges.min = Math.min(i, ranges.min);
    ranges.max = Math.max(i, ranges.max);
  };

  // private _resetBufferRanges = () => {
  //     const ranges = this.bufferUpdateRanges;
  //     // @ts-ignore //TODO: fix this missing prop
  //     const keys = this.bufferUpdateKeys;
  //     // @ts-ignore //TODO: fix this missing prop
  //     let i = this.bufferUpdateCount - 1;
  //     let key;

  //     for ( i; i >= 0; --i ) {
  //         key = keys[ i ];
  //         ranges[ key ].min = Number.POSITIVE_INFINITY;
  //         ranges[ key ].max = Number.NEGATIVE_INFINITY;
  //     }
  // };

  public onRemove = () => {
    // Reset any properties of the emitter that were set by
    // a group when it was added.
    this.particlesPerSecond = 0;
    this.attributeOffset = 0;
    this.activationIndex = 0;
    this.activeParticleCount = 0;
    this.group = null;
    this.attributes = null;
    this.paramsArray = null;
    this.age = 0.0;
  };

  private _decrementParticleCount = () => {
    --this.activeParticleCount;
    // TODO:
    //  - Trigger event if count === 0.
  };

  private _incrementParticleCount = () => {
    ++this.activeParticleCount;
    // TODO:
    //  - Trigger event if count === this.particleCount.
  };

  private _checkParticleAges = (start: number, end: number, params: Float32Array | Uint8Array, dt: number) => {
    for (let i = end - 1, index, maxAge, age, alive; i >= start; --i) {
      index = i * 4;
      alive = params[index];

      if (alive === 0.0) {
        continue;
      }

      // Increment age
      age = params[index + 1];
      maxAge = params[index + 2];

      if (this.direction === 1) {
        age += dt;

        if (age >= maxAge) {
          age = 0.0;
          alive = 0.0;
          this._decrementParticleCount();
        }
      } else {
        age -= dt;

        if (age <= 0.0) {
          age = maxAge;
          alive = 0.0;
          this._decrementParticleCount();
        }
      }

      params[index] = alive;
      params[index + 1] = age;

      this._updateAttributeUpdateRange('params', i);
    }
  };

  private _activateParticles = (activationStart: number, activationEnd: number, params: Float32Array | Uint8Array, dtPerParticle: number) => {
    const direction = this.direction;

    for (let i = activationStart, index, dtValue; i < activationEnd; ++i) {
      index = i * 4;

      // Don't re-activate particles that aren't dead yet.
      // if ( params[ index ] !== 0.0 && ( this.particleCount !== 1 || this.activeMultiplier !== 1 ) ) {
      //     continue;
      // }

      if (params[index] !== 0.0 && this.particleCount !== 1) {
        continue;
      }

      // Increment the active particle count.
      this._incrementParticleCount();

      // Mark the particle as alive.
      params[index] = 1.0;

      // Reset the particle
      this._resetParticle(i);

      // Move each particle being activated to
      // it's actual position in time.
      //
      // This stops particles being 'clumped' together
      // when frame rates are on the lower side of 60fps
      // or not constant (a very real possibility!)
      dtValue = dtPerParticle * (i - activationStart);
      params[index + 1] = direction === -1 ? params[index + 2] - dtValue : dtValue;

      this._updateAttributeUpdateRange('params', i);
    }
  };

  /**
   * Simulates one frame's worth of particles, updating particles
   * that are already alive, and marking ones that are currently dead
   * but should be alive as alive.
   *
   * If the emitter is marked as static, then this function will do nothing.
   *
   * @param  {Number} dt The number of seconds to simulate (deltaTime)
   */
  public tick = (dt: number) => {
    if (this.isStatic) {
      return;
    }

    if (this.paramsArray === null) {
      this.paramsArray = this.attributes?.params.typedArray!.array!; //eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
    }

    const start = this.attributeOffset;
    const end = start + this.particleCount;
    const params = this.paramsArray; // vec3( alive, age, maxAge, wiggle )
    const ppsDt = this.particlesPerSecond * this.activeMultiplier * dt;
    const activationIndex = this.activationIndex;

    // Reset the buffer update indices.
    // this._resetBufferRanges(); //TODO: JR - I have commented this method out as it wasn't doing anything.

    // Increment age for those particles that are alive,
    // and kill off any particles whose age is over the limit.
    this._checkParticleAges(start, end, params, dt);

    // If the emitter is dead, reset the age of the emitter to zero,
    // ready to go again if required
    if (this.alive === false) {
      this.age = 0.0;
      return;
    }

    // If the emitter has a specified lifetime and we've exceeded it,
    // mark the emitter as dead.
    if (this.duration !== null && this.age > this.duration) {
      this.alive = false;
      this.age = 0.0;
      this._onFinishCbs.forEach(cb => cb());
      return;
    }

    const activationStart = this.particleCount === 1 ? activationIndex : activationIndex | 0;
    const activationEnd = Math.min(activationStart + ppsDt, this.activationEnd!);
    const activationCount = (activationEnd - this.activationIndex) | 0;
    const dtPerParticle = activationCount > 0 ? dt / activationCount : 0;

    this._activateParticles(activationStart, activationEnd, params, dtPerParticle);

    // Move the activation window forward, soldier.
    this.activationIndex += ppsDt;

    if (this.activationIndex > end) {
      this.activationIndex = start;
    }

    // Increment the age of the emitter.
    this.age += dt;
  };

  /**
   * Resets all the emitter's particles to their start positions
   * and marks the particles as dead if the `force` argument is
   * true.
   *
   * @param  {Boolean} [force=undefined] If true, all particles will be marked as dead instantly.
   * @return {Emitter}       This emitter instance.
   */
  public reset = (force?: boolean) => {
    this.age = 0.0;
    this.alive = false;

    if (force === true) {
      const start = this.attributeOffset;
      const end = start + this.particleCount;
      const array = this.paramsArray;
      const attr = this.attributes?.params.bufferAttribute;

      for (let i = end - 1, index; i >= start; --i) {
        index = i * 4;

        if (array) {
          array[index] = 0.0;
          array[index + 1] = 0.0;
        }
      }
      if (attr) {
        if (Number(REVISION) >= 159) {
          (attr as unknown as {clearUpdateRanges: () => void}).clearUpdateRanges();
          (
            attr as unknown as {
              addUpdateRange: (start: number, count: number) => void;
            }
          ).addUpdateRange(0, attr.array.length);
        } else {
          (attr as unknown as {updateRange: {offset: number; count: number}}).updateRange = {
            offset: 0,
            count: -1,
          };
        }
        attr.needsUpdate = true;
      }
    }

    return this;
  };

  // Creates encapsuled state that is accessed via getters and setters
  // The setters are required to update buffer related state everytime a property is accessed
  private _emitterStateFactory = <T>(property: keyof IUpdateMap, state: T): T => {
    return new EmitterState(this, state, property) as unknown as T;
  };

  /**
   * Enables the emitter. If not already enabled, the emitter
   * will start emitting particles.
   *
   * @return {Emitter} This emitter instance.
   */
  public enable = () => {
    this.alive = true;
    return this;
  };

  /**
   * Disables th emitter, but does not instantly remove it's
   * particles fromt the scene. When called, the emitter will be
   * 'switched off' and just stop emitting. Any particle's alive will
   * be allowed to finish their lifecycle.
   * @return {Emitter} This emitter instance.
   */
  public disable = () => {
    this.alive = false;
    return this;
  };

  /**
   * Remove this emitter from it's parent group (if it has been added to one).
   * Delgates to removeEmitter().
   *
   * When called, all particle's belonging to this emitter will be instantly
   * removed from the scene.
   * @return {Emitter} This emitter instance.
   * @see ParticleGroup.removeEmitter
   */
  public remove = () => {
    if (this.group !== null) {
      this.group.removeEmitter(this);
    } else {
      console.error('Emitter does not belong to a group, cannot remove.');
    }

    return this;
  };
}
