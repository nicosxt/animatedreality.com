'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} />
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}

export function Duck(props) {
  const { scene } = useGLTF('/duck.glb')

  useFrame((state, delta) => (scene.rotation.y += delta))

  return <primitive object={scene} {...props} />
}
export function Dog(props) {
  const { scene } = useGLTF('/dog.glb')

  return <primitive object={scene} {...props} />
}

export function MakeMagic(props) {
  const { scene } = useGLTF('/magic.glb')
  const texture = useMemo(() => new THREE.TextureLoader().load('/img/gradient.jpg'), [])

  // // Create a custom material
  // const customMaterial = useMemo(
  //   () =>
  //     new THREE.MeshMatcapMaterial({
  //       matcap: texture, // Apply the texture as Matcap
  //     }),
  //   [texture],
  // )

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

  return (
    <>
      {/* Add lighting */}
      <ambientLight color='#ffb3d9' intensity={0.2} />
      <directionalLight color='#ff2949' intensity={2} position={[0, 0.5, 0.6]} />
      <primitive object={scene} {...props} />
    </>
  )
}
