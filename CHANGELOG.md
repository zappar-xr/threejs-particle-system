# Changelog

## [0.0.1] - 2023-06-28

- Initial release

## [1.0.0] - 2025-11-04

### Breaking Changes

- **`rotation` parameters have been renamed to `orbit` parameters.**  
  This change clarifies that these parameters define the **orbiting behaviour of particles around an axis external to each particle**, rather than the particle’s own rotation.  

  ```js
  // Before
  emitter.rotation.angle = THREE.MathUtils.degToRad(45);
  emitter.rotation.AngleSpread = THREE.MathUtils.degToRad(45)

  // After
  emitter.orbit.angle = THREE.MathUtils.degToRad(45);
  emitter.orbit.angleSpread = THREE.MathUtils.degToRad(45);
  ```

### Changed

- Introduced **new `rotation` parameters** to control **per-particle rotation around an axis through the particle’s centre**.

### Deprecated

- **`randomParticleRotationAngle`** on the `EmitterGroup` has been **deprecated**.  
  Rotation randomness should now be configured **per-emitter** using the new `rotation` parameters.