import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

import waterfallVertexShader from "../shaders/waterfall/vertex.glsl";
import waterfallFragmentShader from "../shaders/waterfall/fragment.glsl";

import WaterParticles from "./WaterParticles";
import React from "react";

export const Waterfall = React.forwardRef(({ waterfallModel, noiseMap, dudvMap },ref) => {
    var waterfallUniforms = {
        time: {
            value: 0,
        },
        tNoise: {
            value: null,
        },
        tDudv: {
            value: null,
        },
        topDarkColor: {
            value: new THREE.Color(0x4e7a71),
        },
        bottomDarkColor: {
            value: new THREE.Color(0x0e7562),
        },
        topLightColor: {
            value: new THREE.Color(0xb0f7e9),
        },
        bottomLightColor: {
            value: new THREE.Color(0x14c6a5),
        },
        foamColor: {
            value: new THREE.Color(0xffffff),
        },
    };

    var waterfallMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["fog"],
            waterfallUniforms,
        ]),
        vertexShader: waterfallVertexShader,
        fragmentShader: waterfallFragmentShader,
        fog: true,
        transparent: true,
    });

    console.log(waterfallModel);
    waterfallMaterial.uniforms.tNoise.value = noiseMap;
    waterfallMaterial.uniforms.tDudv.value = dudvMap;

    useFrame((state, delta) => {
        waterfallMaterial.uniforms.time.value += delta / 3;
    });

    return (
        <>
            <mesh 
                ref={ref}
                geometry={waterfallModel.geometry}
                position={waterfallModel.position}
                material={waterfallMaterial}
                rotation={waterfallModel.rotation}
            />
        </>
    );
})

export default Waterfall