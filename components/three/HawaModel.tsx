"use client";

import React, { useRef } from "react";
import { useGLTF, Float, Center } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

export function HawaModel(props: any) {
    const { scene } = useGLTF("/models/hawa-optimized.glb", true);
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone);
    const modelRef = useRef<THREE.Group>(null);

    // Fix recurring "disappearing" issue by manually computing bounding sphere
    // and preventing frustum culling on all meshes
    React.useEffect(() => {
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.frustumCulled = false;
                if (child.geometry) {
                    child.geometry.computeBoundingSphere();
                }
            }
        });
    }, [clone]);

    // Proper cleanup when component unmounts to prevent memory leaks / context loss
    React.useEffect(() => {
        return () => {
            clone.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m) => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        };
    }, [clone]);

    // Add slow rotation for some life
    useFrame((state) => {
        if (modelRef.current && !props.disableRotation) {
            modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group {...props} dispose={null}>
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
