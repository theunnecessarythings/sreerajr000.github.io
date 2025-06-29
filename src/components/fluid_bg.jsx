import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const FluidBackground = () => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- Mobile Detection ---
    // A simple check to differentiate mobile from desktop.
    // You can adjust the 768px threshold as needed.
    const isMobile = window.innerWidth < 768;

    // --- Common Setup ---
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0.0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) }, // Default to center
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        // (Your fragment shader code remains exactly the same)
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

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    if (isMobile) {
      // --- MOBILE: Static Render Logic ---

      // Give it a fixed time value for a more interesting pattern than t=0
      uniforms.u_time.value = 10.0;

      // Render the scene once and stop.
      renderer.render(scene, camera);

      // We still need a resize handler for screen rotation
      const handleResizeMobile = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
        // Re-render the single frame on resize
        renderer.render(scene, camera);
      };
      window.addEventListener("resize", handleResizeMobile);

      // Cleanup for mobile
      return () => {
        window.removeEventListener("resize", handleResizeMobile);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } else {
      // --- DESKTOP: Animation Logic ---

      const clock = new THREE.Clock();

      const handleMouseMove = (e) => {
        uniforms.u_mouse.value.x = e.clientX / window.innerWidth;
        uniforms.u_mouse.value.y = 1.0 - e.clientY / window.innerHeight;
      };
      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("resize", handleResize);

      const animate = () => {
        uniforms.u_time.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      // Cleanup for desktop
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
