import './chunks.glsl';

export const vertexShader = /* glsl */ `
    #include <particle_defines>
    #include <particle_uniforms>
    #include <particle_attributes>
    #include <particle_varyings>

    #include <alphatest_pars_fragment>
    #include <common>
    #include <logdepthbuf_pars_vertex>
    #include <fog_pars_vertex>

    #include <particle_branchAvoidanceFunctions>
    #include <particle_unpackColor>
    #include <particle_unpackRotationAxis>
    #include <particle_floatOverLifetime>
    #include <particle_colorOverLifetime>
    #include <particle_paramFetchingFunctions>
    #include <particle_forceFetchingFunctions>
	#include <particle_random_rotation_utils>

	varying vec2 vUv;

    void main() {
		vUv = uv;

		// Setup...
		highp float age = getAge();
		highp float alive = getAlive();
		highp float maxAge = getMaxAge();
		highp float positionInTime = (age / maxAge);
		highp float isAlive = when_gt( alive, 0.0 );

		#ifdef SHOULD_WIGGLE_PARTICLES
		    float wiggleAmount = positionInTime * getWiggle();
		    float wiggleSin = isAlive * sin( wiggleAmount );
		    float wiggleCos = isAlive * cos( wiggleAmount );
		#endif

		// Forces
        // Get forces & position
        vec3 vel = getVelocity( age );
		vec3 accel = getAcceleration( age );
		vec3 force = vec3( 0.0 );
		vec3 pos = vec3( center );

		vec3 prev_vel = getVelocity( age - deltaTime);
		vec3 prev_accel = getAcceleration( age - deltaTime);
		vec3 prev_force = vec3( 0.0 );
		vec3 prev_pos = vec3( center );

		highp float prev_positionInTime = ((age - deltaTime) / maxAge);

        // Calculate the required drag to apply to the forces.
		float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;
		float prev_drag = 1.0 - (prev_positionInTime * 0.5) * acceleration.w;

        // Integrate forces...
        force += vel;
        force *= drag;
        force += accel * age;
        pos += force;

        // Wiggly wiggly wiggle!
		#ifdef SHOULD_WIGGLE_PARTICLES
		    pos.x += wiggleSin;
		    pos.y += wiggleCos;
		    pos.z += wiggleSin;
		#endif

		// Rotate the emitter around it's central point
		#ifdef SHOULD_ORBIT_PARTICLES
			pos = getOrbitPosition( pos, positionInTime );
		#endif

		// Appearance
		// Determine color and opacity for this particle
		#ifdef COLORIZE
		    vec3 c = isAlive * getColorOverLifetime(
		        positionInTime,
		        unpackColor( color.x ),
		        unpackColor( color.y ),
		        unpackColor( color.z ),
		        unpackColor( color.w )
		    );
		#else
		    vec3 c = vec3(1.0);
		#endif

		float o = isAlive * getFloatOverLifetime( positionInTime, opacity );

		// Assign color to vColor varying.
		vColor = vec4( c, o );

		// Determine angle
		// #ifdef SHOULD_ROTATE_TEXTURE
		//     vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );
		// #endif

		// If this particle is using a sprite-sheet as a texture, we'll have to figure out
		// what frame of the texture the particle is using at it's current position in time.
		// #ifdef SHOULD_CALCULATE_SPRITE
		//     float framesX = textureAnimation.x;
		//     float framesY = textureAnimation.y;
		//     float loopCount = textureAnimation.w;
		//     float totalFrames = textureAnimation.z;
		//     float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );
		//     float column = floor(mod( frameNumber, framesX ));
		//     float row = floor( (frameNumber - column) / framesX );
		//     float columnNorm = column / framesX;
		//     float rowNorm = row / framesY;
		//     vSpriteSheet.x = 1.0 / framesX;
		//     vSpriteSheet.y = 1.0 / framesY;
		//     vSpriteSheet.z = columnNorm;
		//     vSpriteSheet.w = rowNorm;
		// #endif

		highp float particleSize = getFloatOverLifetime( positionInTime, size ) * isAlive;
		float particleRotationRadians = rotation[2] == 0.0 ? rotation[1] * positionInTime : rotation[1];

		#ifdef DIRECTIONAL_BILLBOARD
			//https://gamedev.stackexchange.com/questions/153326/how-to-rotate-directional-billboard-particle-sprites-toward-the-direction-the-pa			vec3 quad_center_in_time = center;
			vec3 quad_center_in_time = center;
			quad_center_in_time += force;

			// Get previous positions to calculate movement direction
			prev_force += prev_vel;
			prev_force *= prev_drag;
			prev_force += prev_accel * age;
			prev_pos += prev_force;

			//https://gamedev.stackexchange.com/questions/117528/calculate-matrix-transformation-components-separately/117539#117539
			float scaleX = length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2]));
			// float scaleY = length(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2]));
			// float scaleZ = length(vec3(modelMatrix[2][0], modelMatrix[2][1], modelMatrix[2][2]));

			float maxScale = scaleX; // max(max(scaleX, scaleY), scaleZ);

			vec4 wPos = modelMatrix * vec4(pos, 1.0);
			vec3 wCameraPos = cameraPosition;
			vec3 wCameraPlaneNormal = normalize(wCameraPos - quad_center_in_time);
			vec4 _forceDirInTime = vec4(force - prev_force, 1.0) * inverse(modelMatrix);
			vec3 forceDirInTime = normalize(_forceDirInTime.xyz);
			mat4 projectionViewMatrix = projectionMatrix * viewMatrix;

			vec3 wUp = vec3(0.0, 1.0, 0.0);
			float dot = dot(forceDirInTime, wCameraPlaneNormal);
			if (abs(dot) < 1.0)
			{
				wUp = cross(wCameraPlaneNormal, forceDirInTime);
			}

			wUp = wUp * particleSize * maxScale * 0.5;
			forceDirInTime *= particleSize * maxScale * 0.5;

			if (position.x < 0.0) {
				if (position.y < 0.0) {
					// top left quad vertex
					gl_Position = projectionViewMatrix * vec4(wPos.xyz - wUp + forceDirInTime, 1.0);
				} else {
					// bottom left quad vertex
					gl_Position = projectionViewMatrix * vec4(wPos.xyz - wUp - forceDirInTime, 1.0);
				}
			} else {
				if (position.y < 0.0) {
					// top right quad vertex
					gl_Position = projectionViewMatrix * vec4(wPos.xyz + wUp + forceDirInTime, 1.0);
				} else {
					// bottom right quad vertex
					gl_Position = projectionViewMatrix * vec4(wPos.xyz + wUp - forceDirInTime, 1.0);
				}
			}
		#endif

		#ifdef CYLINDRICAL_BILLBOARD
			//Quad Billboard : Works only on quads that have its center at origin.
			// https://www.youtube.com/watch?v=AY73ZAEKqBM
			// https://github.com/sketchpunk/FunWithWebGL2/blob/5d4148de1714376b0b4a47e8b59826362c256f68/progress/fungi/shaders/TransformFB_P2.txt
			// http://www.songho.ca/opengl/files/gl_anglestoaxes01.png

			// https://gamedev.stackexchange.com/questions/119702/fastest-way-to-neutralize-scale-in-the-transform-matrix
			mat4 mvMatWithoutScale = mat4(normalize(modelViewMatrix[0]), normalize(modelViewMatrix[1]), normalize(modelViewMatrix[2]), modelViewMatrix[3]);

			vec3 right = vec3(mvMatWithoutScale[0][0], mvMatWithoutScale[1][0], mvMatWithoutScale[2][0]);
			vec4 up = vec4(0.0, 1.0, 0.0, 1.0); // Cylindrical

            // GLSL automatically takes the top-left 3×3
            mat3 rotationMatrix = mat3(getRotationMatrix4(vec3(0, 0, 1), particleRotationRadians));  

            // Apply particle rotation and size to vertex in the XY plane
            vec3 p = rotationMatrix * position * particleSize;

			//vec3 p = position * particleSize;
			vec3 vert_billboard_pos = pos + (right.xyz * p.x) + (up.xyz * p.y); //Rotate vertex toward camera

			gl_Position = projectionMatrix * modelViewMatrix * vec4(vert_billboard_pos, 1.0);
		#endif


		#ifdef SPHERICAL_BILLBOARD
		    //Convert pos to a world-space value
			float scaleX = length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2]));

            mat3 rotationMatrix = mat3(getRotationMatrix4(vec3(0, 0, 1), particleRotationRadians));  

			vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
			mvPosition.xy += (rotationMatrix * position).xy * particleSize * scaleX;

			gl_Position = projectionMatrix * mvPosition;
		#endif

		#ifdef NO_BILLBOARD
			#ifdef RANDOM_PARTICLE_ROTATION
				vec3 randomSeed = normalize(center + velocity);
				vec3 randomAxis = vec3(rand(randomSeed[0]), rand(randomSeed[1]), rand(randomSeed[2]));
				vec3 normAxis = normalize(randomAxis);

				float angle = 0.0;
				float random = normAxis[0] / size.x;
				float rotationRandomness = clamp(random, 0.6, 1.2);
				float endAngle = randomParticleRotationAngle * rotationRandomness;

				if (normAxis[0] > 0.5) {
					angle += mix(0.0, endAngle, positionInTime);
				} else {
					angle -= mix(0.0, endAngle, positionInTime);
				}

				mat4 rotationMatrix = getRotationMatrix4(randomAxis, angle);
				vec4 rotatedPos = vec4(position, 1.0) * rotationMatrix;
				vec4 vertexPosition = vec4(pos + (rotatedPos.xyz * particleSize), 1.0);
			#else
				vec3 unpackedRotationAxis = unpackRotationAxis(rotation[0]);
				mat3 rotationMatrix3 = mat3(getRotationMatrix4(unpackedRotationAxis, particleRotationRadians)); 

				vec4 vertexPosition = vec4(pos + (rotationMatrix3 * position) * particleSize, 1.0);
			#endif
			gl_Position = projectionMatrix * modelViewMatrix * vertexPosition;
		#endif


        #include <logdepthbuf_vertex>
        #include <fog_vertex>

    }

`;
