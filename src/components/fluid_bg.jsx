import React, { useEffect, useRef } from "react";

import * as THREE from "three";

export const FluidBackground = () => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Uniforms
    const uniforms = {
      u_time: { value: 0.0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    };

    // Geometry & Shader Material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        float random(vec2 st) {
          return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 6; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          st.x *= u_resolution.x / u_resolution.y;
          vec2 mouse = u_mouse;
          mouse.x *= u_resolution.x / u_resolution.y;
          float f;
          vec2 q = vec2(fbm(st + u_time * 0.1), fbm(st + vec2(1.0)));
          vec2 r = vec2(fbm(st + q + u_time * 0.2), fbm(st + q + vec2(1.0)));
          f = fbm(st + r);
          float colorMix = smoothstep(0.1, 0.9, f);
          colorMix = mix(colorMix, smoothstep(0.4, 0.6, f), clamp(1.0 - distance(st, mouse) * 2.0, 0.0, 1.0));
          vec3 col1 = vec3(0.0, 0.1, 0.2);
          vec3 col2 = vec3(0.6, 0.6, 0.6);
          vec3 finalColor = mix(col1, col2, colorMix);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Clock
    const clock = new THREE.Clock();

    // Event Handlers
    const handleMouseMove = (e) => {
      uniforms.u_mouse.value.x = e.clientX / window.innerWidth;
      uniforms.u_mouse.value.y = 1.0 - e.clientY / window.innerHeight;
      // material.needsUpdate = true; // <— mark material dirty after mouse change
    };
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      // material.needsUpdate = true; // <— mark material dirty after resize
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Animation Loop
    const animate = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      // material.needsUpdate = true; // <— mark material dirty before each render if time changes
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
