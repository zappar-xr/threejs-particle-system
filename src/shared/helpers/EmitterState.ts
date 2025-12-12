import {Emitter} from '../../v1/core/Emitter';
import {valueOverLifetimeLength} from '../../v1/core/EmitterGroup';
import {IUpdateMap, IEmitterIntersectionState} from '../../v1/core/types';
import {utils} from './EmitterUtils';

export class EmitterState<T> {
  private _state: T;

  constructor(parent: Emitter, state: T, propName: keyof IUpdateMap) {
    this._state = state;

    for (const key in this._state) {
      Object.defineProperty(this, key, {
        get: () => {
          return this._state[key];
        },
        set: (value: T[Extract<keyof T, string>]) => {
          const mapName = parent.updateMap[propName as keyof IUpdateMap];
          const prevValue = this._state[key];
          const length = valueOverLifetimeLength;

          if (key === 'orbitCenter') {
            parent.updateFlags.orbitCenter = true;
            parent.updateCounts.orbitCenter = 0.0;
          } else if (key === 'randomise') {
            parent.resetFlags[mapName] = value as IEmitterIntersectionState['randomise'];
          } else {
            parent.updateFlags[mapName] = true;
            parent.updateCounts[mapName] = 0.0;
          }
          parent.group?.updateDefines();
          this._state[key] = value;

          // If the previous value was an array, then make
          // sure the provided value is interpolated correctly.
          if (Array.isArray(prevValue)) {
            utils.ensureValueOverLifetimeCompliance(parent[propName as keyof Emitter], length, length);
          }
        },
      });
    }
  }
}
