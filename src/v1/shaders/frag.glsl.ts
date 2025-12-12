import './chunks.glsl';

export const fragmentShader = /* glsl */ `
	#include <particle_uniforms>

	#include <alphatest_pars_fragment>
	#include <common>
	#include <fog_pars_fragment>
	#include <logdepthbuf_pars_fragment>

	#include <particle_varyings>
	#include <particle_branchAvoidanceFunctions>
	varying vec2 vUv;
	// varying vec3 vViewPosition;
	// varying vec3 vNormal;

	// See https://github.com/mrdoob/three.js/pull/22409/commits/16f30f3b726865421f44ccb704f48b0dc047650b#diff-d508a837567db31e767ebb45113fb66e42cb0f786aa22d3d84ddce93a564dfbd
	void main() {
		vec3 outgoingLight = vColor.xyz;
		// #include <particle_rotateTexture>
		#include <logdepthbuf_fragment>

		// vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
		// vec3 norm = normalize(vNormal);
		// float nDotL = clamp(dot(vec3(0.0, 1.0, 0.0), norm), 0.0, 1.0);

		// vec4 diffuseColor = lightColor * nDotL * vColor;
		// diffuseColor.w = 1.0;

		#ifdef HAS_TEXTURE
			vec4 p_texture = texture2D( tex, vUv );
			#ifdef USE_PARTICLE_ALPHA_TEST
				if ( p_texture.w < customAlphaTest ) discard;
			#endif

			outgoingLight = vColor.xyz * p_texture.xyz;
			gl_FragColor = vec4( outgoingLight.xyz, p_texture.w * vColor.w );
		#else
			gl_FragColor = vColor;
		#endif


		#include <fog_fragment>
	}
`;
