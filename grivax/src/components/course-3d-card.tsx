"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Float, PresentationControls, Text3D } from "@react-three/drei"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import * as THREE from "three"

interface Course {
  course_id: string
  title: string
  image: string
}

export function Course3DCard({ course, userId }: { course: Course; userId: string }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Link href={`/courses/${userId}/${course.course_id}`} className="block h-full">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="h-[300px] w-full"
      >
        <Card className="h-full w-full overflow-hidden border-none shadow-xl">
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <PresentationControls
              global
              rotation={[0, 0, 0]}
              polar={[-0.1, 0.1]}
              azimuth={[-0.1, 0.1]}
              config={{ mass: 2, tension: 400 }}
              snap={{ mass: 4, tension: 400 }}
            >
              <Float rotationIntensity={0.2}>
                <CourseModel course={course} />
              </Float>
            </PresentationControls>
            <Environment preset="city" />
          </Canvas>
        </Card>
      </motion.div>
    </Link>
  )
}

function CourseModel({ course }: { course: Course }) {
  const { viewport } = useThree()
  const group = useRef<THREE.Group>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.crossOrigin = "anonymous"
    textureLoader.load(course.image || "/placeholder.svg?height=200&width=300", (loadedTexture) => {
      setTexture(loadedTexture)
    })
  }, [course.image])

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.15
    }
  })

  return (
    <group ref={group}>
      {texture && (
        <mesh>
          <boxGeometry args={[2.5, 1.5, 0.1]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      )}
      <mesh position={[0, -1.2, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.2}
          height={0.05}
        >
          {course.title}
          <meshStandardMaterial color="#5a67d8" />
        </Text3D>
      </mesh>
    </group>
  )
}
