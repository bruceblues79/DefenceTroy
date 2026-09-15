import { Billboard, Text } from '@react-three/drei'
import { useEffect } from 'react'

export default function LoadingSpace({ onLoaded }: { onLoaded: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onLoaded, 100)
    return () => clearTimeout(timer)
  }, [onLoaded])

  return (
    <Billboard position={[0, 0.1, 0]}>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Text position={[0, 0, 0.01]} fontSize={0.25} color="black" anchorX="center" anchorY="middle">
        loading...
      </Text>
    </Billboard>
  )
}
