"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const THETA_START = -Math.PI / 8
const THETA_LENGTH = Math.PI / 4

/** r (radius), a (angle offset inside the slice), s (scale) */
const PEPPERONI: Array<[number, number, number]> = [
  [0.55, 0.18, 0.9],
  [1.02, 0.2, 1],
  [1.45, 0.16, 0.92],
  [0.78, 0.36, 1.05],
  [1.28, 0.34, 0.96],
  [1.68, 0.38, 0.88],
  [0.6, 0.54, 1],
  [1.12, 0.58, 0.94],
  [1.52, 0.6, 0.9],
]

const BASIL: Array<[number, number, number]> = [
  [0.9, 0.3, 0.5],
  [1.35, 0.52, -0.3],
  [0.72, 0.66, 1.1],
]

// three.js CylinderGeometry measures theta from +Z with x = sin(theta), z = cos(theta).
function slicePoint(radius: number, offset: number): { x: number; z: number } {
  const angle = THETA_START + offset
  return { x: Math.sin(angle) * radius, z: Math.cos(angle) * radius }
}

function makeWedge(radius: number, height: number) {
  return new THREE.CylinderGeometry(
    radius,
    radius,
    height,
    64,
    1,
    false,
    THETA_START,
    THETA_LENGTH
  )
}

function makeShadowTexture() {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    )
    gradient.addColorStop(0, "rgba(0,0,0,0.55)")
    gradient.addColorStop(0.55, "rgba(0,0,0,0.18)")
    gradient.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function HeroPizzaScene() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      })
    } catch {
      return
    }

    if (!renderer.getContext()) {
      renderer.dispose()
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    host.appendChild(renderer.domElement)
    renderer.domElement.style.opacity = "1"
    renderer.domElement.style.transition = "opacity 600ms ease"

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0.45, 3.1, 4.3)
    camera.lookAt(0, 0, 0)

    const group = new THREE.Group()
    scene.add(group)

    const crustMaterial = new THREE.MeshStandardMaterial({
      color: 0xd79c52,
      roughness: 0.82,
      metalness: 0.02,
    })
    const doughMaterial = new THREE.MeshStandardMaterial({
      color: 0xe7b06a,
      roughness: 0.75,
      metalness: 0,
    })
    const cheeseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffc94f,
      roughness: 0.42,
      metalness: 0.03,
    })
    const sauceMaterial = new THREE.MeshStandardMaterial({
      color: 0xb1331f,
      roughness: 0.7,
      metalness: 0,
    })
    const pepperoniMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0392b,
      roughness: 0.55,
      metalness: 0.02,
    })
    const basilMaterial = new THREE.MeshStandardMaterial({
      color: 0x3f7d3a,
      roughness: 0.6,
    })

    const crust = new THREE.Mesh(makeWedge(2.25, 0.34), crustMaterial)
    const dough = new THREE.Mesh(makeWedge(2.04, 0.12), doughMaterial)
    dough.position.y = 0.2
    const sauce = new THREE.Mesh(makeWedge(1.88, 0.03), sauceMaterial)
    sauce.position.y = 0.275
    const cheese = new THREE.Mesh(makeWedge(1.84, 0.09), cheeseMaterial)
    cheese.position.y = 0.3

    group.add(crust, dough, sauce, cheese)

    const pepperoniGeometry = new THREE.CylinderGeometry(0.17, 0.17, 0.045, 24)
    for (const [radius, offset, scale] of PEPPERONI) {
      const { x, z } = slicePoint(radius, offset)
      const pepperoni = new THREE.Mesh(pepperoniGeometry, pepperoniMaterial)
      pepperoni.position.set(x, 0.36, z)
      pepperoni.scale.setScalar(scale)
      pepperoni.rotation.y = offset * 3
      group.add(pepperoni)
    }

    const basilGeometry = new THREE.BoxGeometry(0.24, 0.015, 0.13)
    for (const [radius, offset, turn] of BASIL) {
      const { x, z } = slicePoint(radius, offset)
      const leaf = new THREE.Mesh(basilGeometry, basilMaterial)
      leaf.position.set(x, 0.355, z)
      leaf.rotation.y = turn
      group.add(leaf)
    }

    const shadowTexture = makeShadowTexture()
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 4.8),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -0.24
    group.add(shadow)

    scene.add(new THREE.HemisphereLight(0xfff3e0, 0x1a120b, 1.1))
    const keyLight = new THREE.DirectionalLight(0xffe3b3, 2.3)
    keyLight.position.set(3.2, 5, 3)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xff9f1c, 1.6)
    rimLight.position.set(-4, 2.5, -3)
    scene.add(rimLight)
    const fillLight = new THREE.PointLight(0xff8a3d, 9, 14)
    fillLight.position.set(-1.6, 1.6, 3.2)
    scene.add(fillLight)

    group.rotation.set(0.52, 0, 0)
    group.position.set(0, 0.28, -1.15)

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = host
      if (width === 0 || height === 0) return
      renderer.setSize(width, height, false)
      const aspect = width / height
      camera.aspect = aspect
      camera.position.z = aspect < 1.1 ? 5.7 : aspect < 1.25 ? 4.9 : 4.3
      camera.position.y = aspect < 1.1 ? 3.4 : 3.1
      baseScale = aspect < 1.1 ? 0.98 : 1.04
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }

    let baseScale = 1.14
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // Hover only reacts inside the hero section, not the whole page.
    const scope = host.closest("section") ?? host
    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      hover: 0,
      hoverTarget: 0,
    }
    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const clamp = (value: number) => Math.max(-1, Math.min(1, value))
      pointer.targetX = clamp(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2
      )
      pointer.targetY = clamp(
        ((event.clientY - rect.top) / rect.height - 0.5) * 2
      )
      pointer.hoverTarget = 1
    }
    const onPointerLeave = () => {
      pointer.targetX = 0
      pointer.targetY = 0
      pointer.hoverTarget = 0
    }

    const clock = new THREE.Clock()
    let frame = 0

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime()
      pointer.x += (pointer.targetX - pointer.x) * 0.05
      pointer.y += (pointer.targetY - pointer.y) * 0.05
      pointer.hover += (pointer.hoverTarget - pointer.hover) * 0.05

      // Slow zoom in/out breathing, with an extra push while the hero is hovered.
      const breathe = 1 + Math.sin(elapsed * 0.45) * 0.04
      group.scale.setScalar(baseScale * breathe * (1 + pointer.hover * 0.08))

      group.rotation.y = Math.sin(elapsed * 0.35) * 0.2 + pointer.x * 0.3
      group.rotation.x = 0.52 + Math.sin(elapsed * 0.5) * 0.03 + pointer.y * 0.12
      group.rotation.z = Math.sin(elapsed * 0.28) * 0.02
      group.position.y = 0.28 + Math.sin(elapsed * 0.9) * 0.05

      renderer.render(scene, camera)
    }

    const loop = () => {
      renderFrame()
      frame = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (frame || reduceMotion) return
      clock.start()
      loop()
    }

    const stop = () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    if (reduceMotion) {
      renderFrame()
    } else {
      scope.addEventListener("pointermove", onPointerMove, { passive: true })
      scope.addEventListener("pointerleave", onPointerLeave)
      start()
    }

    const onVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      stop()
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVisibilityChange)
      scope.removeEventListener("pointermove", onPointerMove)
      scope.removeEventListener("pointerleave", onPointerLeave)

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material]
          for (const material of materials) material.dispose()
        }
      })
      shadowTexture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,159,28,0.22),transparent_62%)]"
      />
      <div ref={hostRef} className="absolute inset-0" />
    </div>
  )
}
