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

// CustomGeometryParticles component
const CustomGeometryParticles = ({ count }) => {
  const points = useRef()

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const distance = 1

    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360)
      const phi = THREE.MathUtils.randFloatSpread(360)

      let x = distance * Math.sin(theta) * Math.cos(phi)
      let y = distance * Math.sin(theta) * Math.sin(phi)
      let z = distance * Math.cos(theta)

      positions.set([x, y, z], i * 3)
    }

    return positions
  }, [count])

  useFrame((state) => {
    const { clock } = state
    const time = clock.getElapsedTime()
    console.log(time)

    if (points.current) {
      console.log('useFrame called') // Check if useFrame is being called
      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        points.current.geometry.attributes.position.array[i3] += Math.sin(time + i) * 0.01
        points.current.geometry.attributes.position.array[i3 + 1] += Math.cos(time + i) * 0.01
        points.current.geometry.attributes.position.array[i3 + 2] += Math.sin(time + i) * 0.01
      }

      points.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color='#5786F5'
        sizeAttenuation
        depthWrite={false}
        map={sparklesTexture}
        transparent={true}
      />
    </points>
  )
}

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
  const { scene } = useGLTF('/magic.glb')
  const texture = useMemo(() => new THREE.TextureLoader().load('/img/gradient.jpg'), [])
  const sparklesTexture = useMemo(() => new THREE.TextureLoader().load('/img/sparkle.png'), [])

  // Create a custom material
  const customMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture, // Apply the texture
        metalness: 0.5, // Adjust metalness
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
      planesArray.push(plane)
    }
    return planesArray
  }, [sparklesTexture, particleCount, particleSizeMax, particleSizeMin, width, height, depth])

  // // Animate the scale of the particles
  // useFrame((state) => {
  //   const elapsedTime = state.clock.getElapsedTime()
  //   const scale = (Math.sin(elapsedTime * Math.PI) + 1) / 2 // Oscillate between 0 and 1
  //   planes.forEach((plane) => {

  //     plane.scale.set(scale * particleSize, scale * particleSize, scale * particleSize)
  //   })
  // })

  return (
    <>
      {/* Add lighting */}
      <ambientLight color='#ffb3d9' intensity={0.2} />
      <directionalLight color='#ff2949' intensity={2} position={[0, 0.5, 0.6]} />
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
        <primitive key={index} object={plane} />
      ))}
    </>
  )
}
