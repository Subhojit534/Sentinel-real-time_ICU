'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import AppLogo from '@/components/ui/AppLogo';
import '@/styles/landing.css';

export default function AuthBrandPanel() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Three.js Logic for Premium Rubik's Cube
    let scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer,
      mainGroup: THREE.Group,
      pivot: THREE.Object3D;
    let isSolving = false;
    let animationFrameId: number;

    const raycaster = new THREE.Raycaster();
    const clickMouse = new THREE.Vector2();

    const cubeSize = 0.94;
    const spacing = 1.0;
    const cubies: THREE.Mesh[] = [];

    const solveQueue: any[] = [];
    let currentMove: any = null;
    let moveProgress = 0;
    const animationSpeed = 3.5;

    let baseRotationX = 0.55;
    let baseRotationY = -0.7;
    let targetRotationX = baseRotationX;
    let targetRotationY = baseRotationY;

    let mouseX = 0,
      mouseY = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let pointerDownPosition = { x: 0, y: 0 };

    init3D();
    createRubiksCube();
    scrambleCube(25);
    setupInteraction();
    animate();

    function init3D() {
      const container = canvasContainerRef.current!;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        40,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 16; // Made it smaller
      camera.position.y = 0;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      mainGroup = new THREE.Group();
      mainGroup.rotation.x = baseRotationX;
      mainGroup.rotation.y = baseRotationY;
      scene.add(mainGroup);

      pivot = new THREE.Object3D();
      mainGroup.add(pivot);

      createWireframeBox();
      createReflectiveFloor();

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientLight);

      const pinkLight = new THREE.PointLight(0xec4899, 4, 20);
      pinkLight.position.set(-5, -2, 2);
      scene.add(pinkLight);

      const cyanLight = new THREE.PointLight(0x06b6d4, 4, 20);
      cyanLight.position.set(5, 1, 5);
      scene.add(cyanLight);

      const indigoLight = new THREE.PointLight(0x6366f1, 5, 20);
      indigoLight.position.set(0, 6, 2);
      scene.add(indigoLight);

      const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);
    }

    function createReflectiveFloor() {
      const floorGeo = new THREE.PlaneGeometry(30, 30);
      const floorMat = new THREE.MeshPhysicalMaterial({
        color: 0x010103,
        roughness: 0.15,
        metalness: 0.8,
        transparent: true,
        opacity: 0.8,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -3.9;
      scene.add(floor);
    }

    function createWireframeBox() {
      const size = 4.2;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const edges = new THREE.EdgesGeometry(geometry);
      const material = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.2,
        linewidth: 1,
      });
      const wireframe = new THREE.LineSegments(edges, material);
      mainGroup.add(wireframe);

      const cornerGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const cornerMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

      const haloGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });

      const positions = [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, 1],
        [-1, -1, -1],
      ];

      positions.forEach((pos) => {
        const cornerGroup = new THREE.Group();
        cornerGroup.position.set((pos[0] * size) / 2, (pos[1] * size) / 2, (pos[2] * size) / 2);

        const core = new THREE.Mesh(cornerGeo, cornerMat);
        const halo = new THREE.Mesh(haloGeo, haloMat);

        cornerGroup.add(core);
        cornerGroup.add(halo);
        mainGroup.add(cornerGroup);
      });
    }

    function createRubiksCube() {
      const pieceGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

      const colors = {
        right: 0x0ea5e9,
        left: 0xf43f5e,
        top: 0x6366f1,
        bottom: 0x1e1b4b,
        front: 0x06b6d4,
        back: 0xdb2777,
      };

      const darkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        roughness: 0.4,
        metalness: 0.5,
      });

      const getFaceMaterial = (colorCode: number) =>
        new THREE.MeshPhysicalMaterial({
          color: colorCode,
          emissive: colorCode,
          emissiveIntensity: 0.15,
          roughness: 0.05,
          metalness: 0.3,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        });

      const edgeGeo = new THREE.EdgesGeometry(pieceGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const mats = [
              x === 1 ? getFaceMaterial(colors.right) : darkMaterial,
              x === -1 ? getFaceMaterial(colors.left) : darkMaterial,
              y === 1 ? getFaceMaterial(colors.top) : darkMaterial,
              y === -1 ? getFaceMaterial(colors.bottom) : darkMaterial,
              z === 1 ? getFaceMaterial(colors.front) : darkMaterial,
              z === -1 ? getFaceMaterial(colors.back) : darkMaterial,
            ];

            const cubie = new THREE.Mesh(pieceGeo, mats);
            cubie.position.set(x * spacing, y * spacing, z * spacing);

            const edges = new THREE.LineSegments(edgeGeo, edgeMat);
            cubie.add(edges);

            cubies.push(cubie);
            mainGroup.add(cubie);
          }
        }
      }
    }

    function generateRandomMove() {
      const axes = ['x', 'y', 'z'] as const;
      const layers = [-1, 0, 1];
      const dirs = [1, -1];

      return {
        axis: axes[Math.floor(Math.random() * axes.length)],
        layer: layers[Math.floor(Math.random() * layers.length)],
        dir: dirs[Math.floor(Math.random() * dirs.length)],
      };
    }

    function getAxisValue(vec: THREE.Vector3, axis: 'x' | 'y' | 'z'): number {
      return vec[axis] as number;
    }

    function applyMoveInstantly(move: any) {
      const eps = 0.1;
      const affectedCubies = [];

      for (let i = mainGroup.children.length - 1; i >= 0; i--) {
        const child = mainGroup.children[i];
        if (cubies.includes(child as THREE.Mesh)) {
          if (Math.abs(getAxisValue(child.position, move.axis) - move.layer * spacing) < eps) {
            affectedCubies.push(child);
            pivot.attach(child);
          }
        }
      }

      // @ts-expect-error – dynamic axis key on THREE.Euler
      pivot.rotation[move.axis] = (move.dir * Math.PI) / 2;
      pivot.updateMatrixWorld();

      affectedCubies.forEach((c) => {
        mainGroup.attach(c);
        c.position.x = Math.round(c.position.x / spacing) * spacing;
        c.position.y = Math.round(c.position.y / spacing) * spacing;
        c.position.z = Math.round(c.position.z / spacing) * spacing;
      });

      pivot.rotation.set(0, 0, 0);
      pivot.updateMatrixWorld();
    }

    function scrambleCube(movesCount: number) {
      for (let i = 0; i < movesCount; i++) {
        const move = generateRandomMove();
        applyMoveInstantly(move);

        solveQueue.unshift({
          axis: move.axis,
          layer: move.layer,
          dir: move.dir * -1,
        });
      }
    }

    function startSolving() {
      if (isSolving || solveQueue.length === 0) return;
      isSolving = true;

      const status = document.getElementById('solve-status');
      if (status) {
        status.innerHTML = 'SOLVING ALGORITHM...';
        status.style.opacity = '1';
        status.classList.remove('text-green-400');
        status.classList.add('text-cyan-300');
      }
    }

    function handlePointerDown(e: PointerEvent) {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      pointerDownPosition = { x: e.clientX, y: e.clientY };
      if (canvasContainerRef.current) canvasContainerRef.current.style.cursor = 'grabbing';
    }

    function handlePointerMove(e: PointerEvent) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y,
        };

        baseRotationY += deltaMove.x * 0.01;
        baseRotationX += deltaMove.y * 0.01;
        baseRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, baseRotationX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    }

    function handlePointerUp(e: PointerEvent) {
      isDragging = false;
      if (canvasContainerRef.current) canvasContainerRef.current.style.cursor = 'grab';

      const dist = Math.hypot(e.clientX - pointerDownPosition.x, e.clientY - pointerDownPosition.y);

      if (dist < 5 && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();

        clickMouse.x = ((e.clientX - rect.left) / canvasContainerRef.current.clientWidth) * 2 - 1;
        clickMouse.y = -((e.clientY - rect.top) / canvasContainerRef.current.clientHeight) * 2 + 1;

        raycaster.setFromCamera(clickMouse, camera);
        const intersects = raycaster.intersectObjects(cubies, true);

        if (intersects.length > 0) {
          startSolving();
        }
      }
    }

    function setupInteraction() {
      const container = canvasContainerRef.current!;
      container.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    function easeInOutCubic(x: number) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      targetRotationY = baseRotationY + mouseX * 0.15;
      targetRotationX = baseRotationX + mouseY * 0.15;

      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.1;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.1;

      mainGroup.position.y = Math.sin(time * 1.5) * 0.15 - 0.4;

      if (isSolving) {
        if (currentMove) {
          moveProgress += 0.016 * animationSpeed;

          if (moveProgress >= 1) {
            // @ts-expect-error – dynamic axis key on THREE.Euler
            pivot.rotation[currentMove.axis] = currentMove.dir * (Math.PI / 2);
            pivot.updateMatrixWorld();

            const childrenToMove = [...pivot.children];
            childrenToMove.forEach((c) => {
              mainGroup.attach(c);
              c.position.x = Math.round(c.position.x / spacing) * spacing;
              c.position.y = Math.round(c.position.y / spacing) * spacing;
              c.position.z = Math.round(c.position.z / spacing) * spacing;
            });

            pivot.rotation.set(0, 0, 0);
            currentMove = null;

            if (solveQueue.length === 0) {
              isSolving = false;

              const status = document.getElementById('solve-status');
              if (status) {
                status.innerHTML = 'PERFECTLY SOLVED';
                status.classList.remove('text-cyan-300');
                status.classList.add('text-green-400');

                setTimeout(() => {
                  if (!isSolving && status) status.style.opacity = '0';
                }, 3000);
              }
            }
          } else {
            const ease = easeInOutCubic(moveProgress);
            // @ts-expect-error – dynamic axis key on THREE.Euler
            pivot.rotation[currentMove.axis] = currentMove.dir * (Math.PI / 2) * ease;
          }
        } else if (solveQueue.length > 0) {
          currentMove = solveQueue.shift();
          moveProgress = 0;

          const eps = 0.1;
          for (let i = mainGroup.children.length - 1; i >= 0; i--) {
            const child = mainGroup.children[i];
            if (cubies.includes(child as THREE.Mesh)) {
              if (
                Math.abs(
                  getAxisValue(child.position, currentMove.axis) - currentMove.layer * spacing
                ) < eps
              ) {
                pivot.attach(child);
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    }

    return () => {
      // Cleanup
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.removeEventListener('pointerdown', handlePointerDown);
        while (canvasContainerRef.current.firstChild) {
          canvasContainerRef.current.removeChild(canvasContainerRef.current.firstChild);
        }
      }
    };
  }, []);

  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden landing-body border-l border-border">
      {/* Background elements */}
      <div className="glow-bg absolute inset-0 z-0 opacity-50"></div>

      {/* Rubik's Cube Canvas */}
      <div
        id="canvas-container"
        ref={canvasContainerRef}
        className="absolute inset-0 z-10 w-full h-full"
      ></div>

      {/* Project Sentinel Branding overlay */}
      <div className="absolute top-10 left-10 z-20 flex items-center gap-3">
        <AppLogo size={40} />
        <div>
          <span className="text-lg font-bold text-white tracking-tight block leading-none drop-shadow-md">
            ProjectSentinel
          </span>
          <span className="text-[11px] text-cyan-300 tracking-widest uppercase drop-shadow-sm mt-1">
            ICU Monitoring Platform
          </span>
        </div>
      </div>

      {/* Interactive feedback overlay */}
      <div
        id="solve-status"
        className="absolute text-xs font-bold tracking-widest transition-opacity duration-300 opacity-0 pointer-events-none bottom-10 left-10 text-cyan-300 font-mono z-20 drop-shadow-md"
      >
        SOLVING ALGORITHM...
      </div>

      <div className="absolute text-xs font-bold tracking-widest pointer-events-none top-10 right-10 text-indigo-300/80 font-mono z-20 drop-shadow-md">
        SENTINEL_GRID_v3.0
      </div>

      <div className="absolute text-xs pointer-events-none bottom-10 right-10 text-white/50 font-mono z-20 drop-shadow-md">
        Click cube to auto-solve
      </div>
    </div>
  );
}
