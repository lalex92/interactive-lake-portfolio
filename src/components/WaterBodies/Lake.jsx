import { useRef, forwardRef, useState, useMemo } from "react";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { Geometry, Base, Subtraction } from "@react-three/csg";
import {
    HalfFloatType,
    ByteType,
    NoBlending,
    PlaneGeometry,
    NearestFilter,
    RGBAFormat,
    DepthTexture,
    MeshDepthMaterial,
    RGBADepthPacking,
} from "three";
import { useFBO } from "@react-three/drei";

import { WaterMaterial } from "./WaterMaterial";

extend({ WaterMaterial });

const isTouchScreen = "ontouchstart" in window;

const Lake = forwardRef(({ dudvMap, boatCutOut, boat }, lake) => {
    const { size, gl, camera } = useThree();
    const pixelRatio = window.devicePixelRatio;

    const lakeMaterial = useRef();
    const csg = useRef();
    const subtraction = useRef();

    // Create depthBuffer and render target to generate it
    const [depthTexture, setDepthTexture] = useState();
    const depthTextureType = isTouchScreen ? ByteType : HalfFloatType;

    const renderTarget = useFBO(
        size.width * pixelRatio,
        size.height * pixelRatio,
        {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            generateMipmaps: false,
            stencilBuffer: false,
            format: RGBAFormat,
            depthBuffer: true,
            depthTexture: new DepthTexture(),
            samples: 1,
            type: depthTextureType,
            anisotropy: 0,
        }
    );
    const depthMaterial = useMemo(() => {
        const depthMaterial = new MeshDepthMaterial();
        depthMaterial.depthPacking = RGBADepthPacking;
        depthMaterial.blending = NoBlending;
        return depthMaterial;
    }, []);

    useFrame(({ gl, scene, camera }, delta) => {
        // * Move and rotate the cutout with the boat
        subtraction.current.position.copy(scene.children[0].position);
        subtraction.current.quaternion.copy(scene.children[0].quaternion);
        csg.current.update();

        // * Animate water shader
        if (lakeMaterial.current) {
            lakeMaterial.current.uniforms.tDepth.value = depthTexture;
            lakeMaterial.current.uniforms.time.value += delta / 6;
            lakeMaterial.current.uniforms.cameraNear.value = camera.near;
            lakeMaterial.current.uniforms.cameraFar.value = camera.far;
            lakeMaterial.current.uniforms.resolution.value.set(
                size.width * pixelRatio,
                size.height * pixelRatio
            );
            lakeMaterial.current.uniforms.tDudv.value = dudvMap;
        }

        // * Render depth map to render target
        camera.updateProjectionMatrix();
        scene.overrideMaterial = depthMaterial;

        // Hide meshes to be ignored in the depth map
        // waterfall.current.material.visible = false;
        // particles.current.material.visible = false;
        lake.current.material.visible = false;
        // boat.current.material.visible = false;

        gl.setRenderTarget(renderTarget);
        gl.render(scene, camera);
        setDepthTexture(renderTarget.texture);
        gl.setRenderTarget(null);

        scene.overrideMaterial = null;

        // Show hidden meshes for the default render
        lake.current.material.visible = true;
        // waterfall.current.material.visible = true;
        // particles.current.material.visible = true;

        // boat.current.material.visible = true;
    });

    const lakeGeometry = new PlaneGeometry(242, 242, 1, 1);

    return (
        <mesh ref={lake} receiveShadow>
            <Geometry ref={csg}>
                <Base rotation={[-Math.PI / 2, 0, 0]} geometry={lakeGeometry} />
                <Subtraction ref={subtraction} geometry={boatCutOut.geometry} />
            </Geometry>
            {/* <meshBasicMaterial /> */}
            <waterMaterial ref={lakeMaterial} />
        </mesh>
    );
});

export default Lake;
