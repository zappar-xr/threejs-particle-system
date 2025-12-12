import {Blending, Color, Texture, Vector2, Vector3, Vector4, Side} from 'three';
import ShaderAttribute from '../../shared/helpers/ShaderAttribute';

export type IShaderAttributeKeys = 'position' | 'acceleration' | 'velocity' | 'orbit' | 'orbitCenter' | 'params' | 'size' | 'angle' | 'color' | 'opacity' | 'rotation';

export type IShaderAttributeKeyArray = ['position', 'acceleration', 'velocity', 'orbit', 'orbitCenter', 'params', 'size', 'angle', 'color', 'opacity', 'rotation'];

export type IShaderAttributes = Record<IShaderAttributeKeys, ShaderAttribute>;

export type IDefinesBooleanPropKeys =
  | 'HAS_PERSPECTIVE'
  | 'COLORIZE'
  | 'SHOULD_ROTATE_TEXTURE'
  | 'SHOULD_ORBIT_PARTICLES'
  | 'SHOULD_WIGGLE_PARTICLES'
  | 'SHOULD_CALCULATE_SPRITE'
  | 'SPHERICAL_BILLBOARD'
  | 'DIRECTIONAL_BILLBOARD'
  | 'CYLINDRICAL_BILLBOARD'
  | 'NO_BILLBOARD'
  | 'RANDOM_PARTICLE_ROTATION'
  | 'HAS_TEXTURE'
  | 'USE_PARTICLE_ALPHA_TEST';

export interface IUniforms {
  tex: {type: 't'; value: Texture | null};
  textureAnimation: {type: 'v4'; value: Vector4};
  fogColor: {type: 'c'; value: Color | null};
  fogNear: {type: 'f'; value: number};
  fogFar: {type: 'f'; value: number};
  fogDensity: {type: 'f'; value: number};
  deltaTime: {type: 'f'; value: number};
  runTime: {type: 'f'; value: number};
  scale: {type: 'f'; value: number};
  customAlphaTest: {type: 'f'; value: number};
  randomParticleRotationAngle: {type: 'f'; value: number};
}

export enum IDistribution {
  BOX = 'BOX',
  SPHERE = 'SPHERE',
  DISC = 'DISC',
  LINE = 'LINE',
}

export type IParticleBasePropKeys = 'position' | 'velocity' | 'acceleration' | 'orbit' | 'size' | 'color' | 'opacity' | 'angle' | 'rotation';

export interface IUpdateMap {
  maxAge: 'params';
  position: 'position';
  velocity: 'velocity';
  acceleration: 'acceleration';
  drag: 'acceleration';
  wiggle: 'params';
  orbit: 'orbit';
  size: 'size';
  color: 'color';
  opacity: 'opacity';
  angle: 'angle';
  rotation: 'rotation';
}

type IEmitterBaseOption<T> = Record<'spread' | 'value', T>;
type IEmitterRandomisableBaseOptions<T> = IEmitterBaseOption<T> & {
  randomise: boolean;
};

export interface IEmitterPositionState extends IEmitterRandomisableBaseOptions<Vector3> {
  distribution: IDistribution;
  spreadClamp: Vector3;
  radius: number;
  radiusScale: Vector3;
}

export interface IEmitterVelocityState extends IEmitterRandomisableBaseOptions<Vector3> {
  distribution: IDistribution;
}

export type IEmitterAcceleratorState = IEmitterVelocityState;

export interface IEmitterOrbitState {
  axis: Vector3;
  axisSpread: Vector3;
  angle: number;
  angleSpread: number;
  static: boolean;
  center: Vector3;
  randomise: boolean;
}
export interface IEmitterRotationState {
  axis: Vector3;
  axisSpread: Vector3;
  angle: number;
  angleSpread: number;
  static: boolean;
  randomise: boolean;
}

export interface IEmitterColorState {
  value: Color | Color[];
  spread: Vector3 | Vector3[];
  randomise: boolean;
}

export type IEmitterOpacityState = IEmitterRandomisableBaseOptions<number | number[]>;
export type IEmitterSizeState = IEmitterRandomisableBaseOptions<number | number[]>;
export type IEmitterAngleState = IEmitterRandomisableBaseOptions<number | number[]>;
export type IEmitterMaxAgeState = IEmitterBaseOption<number>;
export type IEmitterDragState = IEmitterRandomisableBaseOptions<number>;
export type IEmitterWiggleState = IEmitterBaseOption<number>;

export interface IEmitterOptions {
  type?: IDistribution;
  particleCount?: number;
  duration?: number | null;
  isStatic?: boolean;
  activeMultiplier?: number; // TODO: clamp to 0 - 1 range
  direction?: number;
  maxAge?: Partial<IEmitterMaxAgeState>; // TODO: clamp to 0 - 1 range
  position?: Partial<IEmitterPositionState>;
  velocity?: Partial<IEmitterVelocityState>;
  acceleration?: Partial<IEmitterAcceleratorState>;
  drag?: Partial<IEmitterDragState>;
  wiggle?: Partial<IEmitterWiggleState>;
  orbit?: Partial<IEmitterOrbitState>;
  color?: Partial<IEmitterColorState>;
  opacity?: Partial<IEmitterOpacityState>;
  size?: Partial<IEmitterSizeState>;
  angle?: Partial<IEmitterAngleState>;
  rotation?: Partial<IEmitterRotationState>;
  radius?: {randomise: boolean}; // TODO: check if base options required
  alive?: boolean; // TODO: check if required
  onFinish?: () => unknown;
}

export interface IGroupTextureOptions {
  value?: Texture;
  frames?: Vector2;
  frameCount?: number;
  loop?: number;
}

export interface IGroupOptions {
  texture?: IGroupTextureOptions;
  fixedTimeStep?: number;
  hasPerspective?: boolean;
  colorize?: boolean;
  blending?: Blending;
  transparent?: boolean;
  alphaTest?: number;
  depthWrite?: boolean;
  depthTest?: boolean;
  fog?: boolean;
  scale?: number;
  maxParticleCount: number;
  side?: Side;
  frustumCulled?: boolean;
  randomParticleRotationAngle?: number;
  rotation?: number;
  billboard?: 'spherical' | 'directional' | 'cylindrical';
}

export type IEmitterIntersectionState = IEmitterPositionState &
  IEmitterVelocityState &
  IEmitterOrbitState &
  IEmitterDragState &
  IEmitterWiggleState &
  IEmitterRotationState &
  IEmitterMaxAgeState &
  IEmitterColorState &
  IEmitterOpacityState &
  IEmitterSizeState &
  IEmitterAngleState &
  IEmitterAcceleratorState;
