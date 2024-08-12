'use client'

import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'

// MakeMagic component
export function MakeMagic({
  particleCount = 20,
  particleSizeMax = 0.8,
  particleSizeMin = 0.3,
  width = 10,
  height = 3,
  depth = 3,
  ...props
}) {
  // const { viewport } = useThree()
  // const scale = Math.min(viewport.width, viewport.height) / 10 // Adjust the divisor as needed

  const { scene } = useGLTF('/magic.glb')
  const texture = useMemo(() => new THREE.TextureLoader().load('/img/gradient.jpg'), [])
  const sparklesTexture = useMemo(() => new THREE.TextureLoader().load('/img/sparkle.png'), [])

  // Create a custom material
  const customMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture, // Apply the texture
        metalness: 0.4, // Adjust metalness
        roughness: 0.3, // Adjust roughness
        emissive: new THREE.Color('#ff2949'),
        emissiveMap: texture,
        emissiveIntensity: 0.5,
      }),
    [],
  )

  if (texture) {
    customMaterial.emissiveMap = texture
    customMaterial.emissiveMap.needsUpdate = true
    customMaterial.needsUpdate = true // Ensure the material updates
  }

  // Apply the custom material to the scene
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = customMaterial
      }
    })
  }, [scene, customMaterial])

  const planesRef = useRef([])

  // ----Particle System ---- Create random planes with sparkles texture
  const planes = useMemo(() => {
    const planesArray = []
    for (let i = 0; i < particleCount; i++) {
      const particleSize = THREE.MathUtils.randFloatSpread(particleSizeMin, particleSizeMax)
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(particleSize, particleSize),
        new THREE.MeshBasicMaterial({ map: sparklesTexture, transparent: true }),
      )
      plane.position.set((Math.random() - 0.5) * width, (Math.random() - 0.5) * height, (Math.random() - 0.5) * depth)
      // Add properties for animation
      plane.userData.originalScale = particleSize
      plane.userData.blinkSpeed = 0.02 + Math.random() * 0.01
      plane.userData.blinkPhase = Math.random() * Math.PI * 2

      planesArray.push(plane)
    }
    return planesArray
  }, [sparklesTexture, particleCount, particleSizeMax, particleSizeMin, width, height, depth])

  // Animation logic
  useFrame((state, delta) => {
    planesRef.current.forEach((plane, index) => {
      if (!plane) return
      // Blink effect
      plane.userData.blinkPhase += plane.userData.blinkSpeed
      const blinkFactor = (Math.sin(plane.userData.blinkPhase) + 1) / 2 // 0 to 1
      const newScale = THREE.MathUtils.lerp(1, plane.userData.originalScale, blinkFactor)
      plane.scale.set(newScale, newScale, newScale)
      // Set new random location at the end of each blink cycle
      if (newScale < 0.01) {
        plane.position.set((Math.random() - 0.5) * width, (Math.random() - 0.5) * height, (Math.random() - 0.5) * depth)
      }
    })
  })

  return (
    <>
      {/* Add lighting */}
      <ambientLight color='#ffb3d9' intensity={0.2} />
      <directionalLight color='#ff2949' intensity={2} position={[0, 0.5, 0.6]} />
      {/* Add Post Processing */}
      <EffectComposer>
        <Bloom
          intensity={0.5} // The bloom intensity.
          kernelSize={KernelSize.LARGE} // blur kernel size
          luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
          luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
          mipmapBlur={false} // Enables or disables mipmap blur.
          resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
          resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
        />
      </EffectComposer>
      <primitive object={scene} {...props} />
      {planes.map((plane, index) => (
        <primitive key={index} object={plane} ref={(el) => (planesRef.current[index] = el)} />
      ))}
    </>
  )
}
