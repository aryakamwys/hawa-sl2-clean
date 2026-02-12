"use client";

import React, { useRef } from "react";
import { useGLTF, Float, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

export function HawaModel(props: any) {
    const { scene } = useGLTF("/models/hawa-optimized.glb", true);
    
    // Clone the scene to avoid issues with modifying the cached scene directly
    // and to handle mounting/unmounting correctly (Strict Mode)
    const clone = React.useMemo(() => {
        const clonedScene = SkeletonUtils.clone(scene);
        
        // Fix recurring "disappearing" issue by manually computing bounding sphere
        // and preventing frustum culling on all meshes
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.frustumCulled = false;
                if (child.geometry) {
                    child.geometry.computeBoundingSphere();
                }
            }
        });
        
        return clonedScene;
    }, [scene]);

    const modelRef = useRef<THREE.Group>(null);

    // Add slow rotation for some life
    useFrame((state) => {
        if (modelRef.current && !props.disableRotation) {
            modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group {...props}>
            <Float rotationIntensity={0.5} floatIntensity={0.5} speed={2}>
                <Center>
                    <primitive
                        ref={modelRef}
                        object={clone}
                        scale={25}
                    />
                </Center>
            </Float>
        </group>
    );
}

useGLTF.preload("/models/hawa-optimized.glb", true);
