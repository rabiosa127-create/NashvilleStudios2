import React, { useEffect, useRef, useState } from 'react';

// Vertex Shader: Full-screen quad
const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment Shader: 3D Raymarched Organic Liquid-Glass Metaballs with Directional
// Surface Tension Pull, Polynomial SMin Merging, Translucent Sage-Cyprus Volume,
// and Text-Safe Protection.
const FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_aspect;
uniform float u_motion_scale;
uniform vec2 u_mouse;

// Global positions and radii calculated each frame
uniform vec3 u_s0; // Left Base Large
uniform float u_r0;
uniform vec3 u_s1; // Left Approaching Medium
uniform float u_r1;
uniform vec3 u_s2; // Left Satellite Bead
uniform float u_r2;

uniform vec3 u_s3; // Right Base Large
uniform float u_r3;
uniform vec3 u_s4; // Right Approaching Medium
uniform float u_r4;
uniform vec3 u_s5; // Right Satellite Bead
uniform float u_r5;

uniform vec3 u_s6; // Background Depth Orb
uniform float u_r6;

// High-quality polynomial smooth minimum for fluid organic metaball merging
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Organically deformed liquid droplet SDF:
// When approaching a merge partner, the droplet elongates along the approach vector (surface tension pull)
float sdDeformedSphere(vec3 p, vec3 c, float r, vec3 target, float maxPull) {
  vec3 delta = p - c;
  vec3 toTarget = target - c;
  float dist = length(toTarget);
  if (dist > 0.001) {
    vec3 dir = toTarget / dist;
    // Proximity factor: stretches when within interaction radius
    float proximity = smoothstep(r * 2.6, r * 0.85, dist) * maxPull;
    float proj = dot(delta, dir);
    if (proj > 0.0) {
      delta -= dir * (proj * proximity * 0.44);
    }
  }
  return length(delta) - r;
}

// Surface tension micro-waves (liquid breathing) with exact seamless looping
float liquidWobble(vec3 p, float phase) {
  return sin(p.x * 3.2 + phase) * cos(p.y * 3.2 + phase * 0.9) * sin(p.z * 3.2 + phase * 1.1) * 0.022;
}

// Complete Scene SDF with continuous organic deformation and fluid merging
float map(vec3 p) {
  // Seamless periodic wobble phase (completes exactly 12 full cycles over the 24s loop)
  float wobblePhase = u_time * 3.14159265;

  // 1. LEFT CLUSTER:
  // Base sphere
  float d0 = length(p - u_s0) - u_r0;

  // Approaching medium sphere deforms towards Base sphere
  float d1 = sdDeformedSphere(p, u_s1, u_r1, u_s0, 0.88);
  
  // Fluid merge of Form 0 and Form 1 with generous k for thick organic neck
  float dLeft = smin(d0, d1, 0.68);

  // Satellite bead deforms towards the combined left center
  vec3 leftCenter = mix(u_s0, u_s1, 0.5);
  float d2 = sdDeformedSphere(p, u_s2, u_r2, leftCenter, 0.75);
  dLeft = smin(dLeft, d2, 0.52);

  // 2. RIGHT CLUSTER:
  // Base sphere
  float d3 = length(p - u_s3) - u_r3;

  // Approaching medium sphere deforms towards Base sphere
  float d4 = sdDeformedSphere(p, u_s4, u_r4, u_s3, 0.85);
  float dRight = smin(d3, d4, 0.65);

  // Satellite bead deforms towards right combined center
  vec3 rightCenter = mix(u_s3, u_s4, 0.5);
  float d5 = sdDeformedSphere(p, u_s5, u_r5, rightCenter, 0.72);
  dRight = smin(dRight, d5, 0.48);

  // 3. BACKGROUND DEPTH FORM:
  float d6 = length(p - u_s6) - u_r6;

  // Combine entire 3D scene
  float d = min(dLeft, dRight);
  d = smin(d, d6, 0.38);

  // Add subtle liquid surface tension breathing
  d -= liquidWobble(p, wobblePhase);

  return d;
}

// Central differences normal on the continuous metaball surface
vec3 calcNormal(vec3 p) {
  const float h = 0.0025;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * h) +
    k.yyx * map(p + k.yyx * h) +
    k.yxy * map(p + k.yxy * h) +
    k.xxx * map(p + k.xxx * h)
  );
}

void main() {
  // Normalized aspect-corrected coordinates
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float aspect = u_aspect;

  // Camera setup in landscape 3D space
  vec3 ro = vec3(0.0, 0.0, 3.8);
  vec3 rd = normalize(vec3(uv, -1.95));

  // Lighting directions
  vec3 lightDir1 = normalize(vec3(0.35, 0.85, 1.15));
  vec3 lightDir2 = normalize(vec3(-0.75, -0.30, 0.85));

  // Nashville Studios Palette
  // Pure Canvas Sage: #AFBEA4
  vec3 bgSage = vec3(0.686, 0.745, 0.643);
  // Deep Cyprus & Pine cores
  vec3 coreCyprus = vec3(0.125, 0.245, 0.255); // #224347 deep family
  vec3 corePine = vec3(0.080, 0.165, 0.170);   // Dark volume core
  // Muted & Pale Sage mid-tones
  vec3 sageGlow = vec3(0.480, 0.590, 0.450);   // Translucent internal refraction
  vec3 paleRim = vec3(0.840, 0.915, 0.820);    // Luminous rim
  vec3 rimCrest = vec3(0.940, 0.975, 0.930);   // Off-white crest highlight

  // Soft ambient background with subtle vignette
  float bgDist = length(vec2(uv.x / max(aspect, 1.2), uv.y));
  vec3 bgColor = mix(vec3(0.620, 0.685, 0.580), bgSage, smoothstep(0.2, 1.2, bgDist));

  // Raymarching Loop
  float t = 0.5;
  const float maxDist = 8.0;
  const int maxSteps = 72;
  float hitDist = -1.0;
  float minSurfaceDist = 1000.0;

  for (int i = 0; i < maxSteps; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    minSurfaceDist = min(minSurfaceDist, d);

    if (d < 0.0018) {
      hitDist = t;
      break;
    }
    if (t > maxDist) break;
    t += d * 0.82; // Conservative step ensures smooth rendering of fluid bridges
  }

  vec3 sceneColor = bgColor;

  // Soft ambient glow halo around fluid surfaces
  float halo = smoothstep(0.40, 0.01, minSurfaceDist);
  sceneColor = mix(sceneColor, vec3(0.560, 0.665, 0.530), halo * 0.42);

  if (hitDist > 0.0) {
    vec3 p = ro + rd * hitDist;
    vec3 N = calcNormal(p);
    vec3 V = -rd;

    // 1. Silhouette Fresnel Rim Lighting (hallmark of the reference)
    float NdotV = max(0.0, dot(N, V));
    float fresnel = 1.0 - NdotV;
    
    // Radiant illuminated rim around fluid curves and connecting necks
    float rimPower = pow(fresnel, 3.2) * 2.8 + pow(fresnel, 8.5) * 4.2;
    float rimLight = rimPower * (0.35 + 0.65 * max(0.0, dot(N, lightDir1)));

    // 2. Optical Thickness & Internal Translucent Depth
    // Sample into the volume to estimate fluid density
    float innerSample = -map(p + rd * 0.35);
    float thickness = clamp(innerSample * 2.5 + 0.15, 0.0, 1.5);
    float density = 1.0 - exp(-thickness * 2.8);

    // Deep Cyprus Core shading
    float NdotL1 = max(0.0, dot(N, lightDir1));
    vec3 coreShade = mix(corePine, coreCyprus, NdotL1 * 0.6 + 0.4);

    // Muted Sage Subsurface Glow
    vec3 subsurf = mix(sageGlow * 0.65, sageGlow * 1.25, pow(fresnel, 1.8));
    vec3 internalColor = mix(subsurf, coreShade, density * 0.85);

    // 3. Smooth Glossy Specular Sheen (liquid-glass finish)
    vec3 H1 = normalize(lightDir1 + V);
    float spec1 = pow(max(0.0, dot(N, H1)), 52.0) * 0.95;

    vec3 H2 = normalize(lightDir2 + V);
    float spec2 = pow(max(0.0, dot(N, H2)), 20.0) * 0.30;

    vec3 highlight = (spec1 + spec2) * vec3(0.96, 0.98, 0.94);

    // 4. Rim Color Transition
    vec3 rimCol = mix(paleRim, rimCrest, pow(fresnel, 5.0));

    // Combine surface colors
    vec3 surfaceColor = mix(internalColor, rimCol, clamp(rimLight, 0.0, 1.0)) + highlight;

    // Alpha blend over background
    float alpha = mix(0.76, 0.98, density);
    alpha = clamp(alpha + rimLight * 0.45, 0.0, 1.0);

    sceneColor = mix(sceneColor, surfaceColor, alpha);
  }

  // 5. ABSOLUTE TEXT READABILITY ZONE PROTECTION:
  // Strictly prevent any dark blob or bright highlight from obscuring the headline,
  // paragraph, or buttons in the center of the hero.
  float safeX = abs(uv.x) / (aspect * 0.36);
  float safeY = (uv.y - 0.06) / 0.50;
  float safeDist = length(vec2(safeX, safeY));
  
  // Smoothly blend to pure #AFBEA4 canvas within the text safe zone
  float textSafeFactor = smoothstep(0.72, 1.25, safeDist);
  sceneColor = mix(bgSage, sceneColor, textSafeFactor);

  gl_FragColor = vec4(sceneColor, 1.0);
}
`;

// Master closed-loop period for 100% mathematically seamless repeating animation without resets
const LOOP_DURATION = 24.0;
const OMEGA = (2.0 * Math.PI) / LOOP_DURATION;

export const NashvilleHeroAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize WebGL
    let gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: true,
      depth: false,
      powerPreference: 'high-performance',
    }) as WebGLRenderingContext | null;

    if (!gl) {
      gl = (canvas.getContext('webgl', {
        alpha: false,
        antialias: true,
        depth: false,
        powerPreference: 'high-performance',
      }) || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    }

    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    // Shader compiler helper
    const createShader = (glCtx: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.warn('Shader compile failed:', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vertShader || !fragShader) {
      setWebGlSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link failed:', gl.getProgramInfoLog(program));
      setWebGlSupported(false);
      return;
    }

    gl.useProgram(program);

    // Quad geometry buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Get Uniform Locations
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uAspectLoc = gl.getUniformLocation(program, 'u_aspect');
    const uMotionScaleLoc = gl.getUniformLocation(program, 'u_motion_scale');
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');

    // Sphere uniforms
    const uS0Loc = gl.getUniformLocation(program, 'u_s0');
    const uR0Loc = gl.getUniformLocation(program, 'u_r0');
    const uS1Loc = gl.getUniformLocation(program, 'u_s1');
    const uR1Loc = gl.getUniformLocation(program, 'u_r1');
    const uS2Loc = gl.getUniformLocation(program, 'u_s2');
    const uR2Loc = gl.getUniformLocation(program, 'u_r2');

    const uS3Loc = gl.getUniformLocation(program, 'u_s3');
    const uR3Loc = gl.getUniformLocation(program, 'u_r3');
    const uS4Loc = gl.getUniformLocation(program, 'u_s4');
    const uR4Loc = gl.getUniformLocation(program, 'u_r4');
    const uS5Loc = gl.getUniformLocation(program, 'u_s5');
    const uR5Loc = gl.getUniformLocation(program, 'u_r5');

    const uS6Loc = gl.getUniformLocation(program, 'u_s6');
    const uR6Loc = gl.getUniformLocation(program, 'u_r6');

    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionScale = prefersReducedMotion ? 0.0 : 1.0;

    const resize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      
      const newWidth = Math.max(1, Math.floor(rect.width * dpr));
      const newHeight = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        gl?.viewport(0, 0, newWidth, newHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    resize();

    // Subtle parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Animation Loop: Mathematically closed harmonic orbits for 100% seamless looping without resets
    const startTime = performance.now();
    let isRunning = true;

    const render = (now: number) => {
      if (!isRunning || !gl || !program) return;

      const rawElapsed = (now - startTime) * 0.001;
      // Seamlessly modulo the time with LOOP_DURATION so numbers stay small and smooth
      const progress = (rawElapsed * motionScale * 0.85) % LOOP_DURATION;
      const t = progress >= 0 ? progress : progress + LOOP_DURATION;

      // Exact integer harmonics of the 24-second loop:
      const w1 = OMEGA * 1.0; // 24-second fundamental
      const w2 = OMEGA * 2.0; // 12-second harmonic
      const w3 = OMEGA * 3.0; // 8-second harmonic

      const aspect = canvas.width / Math.max(1, canvas.height);
      const isMobile = aspect < 1.0;
      const stageScale = isMobile ? Math.max(aspect * 0.9, 0.75) : Math.max(aspect * 0.76, 1.25);

      // =========================================================================
      // STAGE 1: LEFT CLUSTER CHOREOGRAPHY (Continuous Interaction & Seamless Loop)
      // Sequence: APPROACH -> TOUCH -> DEFORM -> MERGE INTO MASS -> SATELLITE MERGES -> SEPARATE -> REPEAT
      // =========================================================================
      // Form 0: Primary Large Base Liquid Form (anchored on left edge)
      const r0 = (isMobile ? 0.65 : 0.86) * (1.0 + 0.04 * Math.sin(w2 * t));
      const s0x = -stageScale * 0.75 + 0.08 * Math.sin(w1 * t + 0.5);
      const s0y = -0.10 + 0.10 * Math.cos(w1 * t);
      const s0z = 0.10 + 0.05 * Math.sin(w2 * t);

      // Form 1: Approaching Medium Liquid Form
      // Merge factor cycles smoothly from 0 (separated) to 1 (deeply merged) and back to 0
      const r1 = isMobile ? 0.38 : 0.50;
      const mergeFactor1 = 0.5 - 0.5 * Math.cos(w1 * t); // Smooth harmonic: 0 at t=0, 1 at t=12s, 0 at t=24s
      const touchDist1 = (r0 + r1) * 0.62; // Deep merge overlap
      const sepDist1 = (r0 + r1) * 1.62;   // Clear separation
      const curDist1 = sepDist1 * (1.0 - mergeFactor1) + touchDist1 * mergeFactor1;

      const angle1 = 0.55 + 0.16 * Math.sin(w1 * t);
      const s1x = s0x + curDist1 * Math.cos(angle1);
      const s1y = s0y - curDist1 * Math.sin(angle1);
      const s1z = s0z + 0.12 * Math.sin(w1 * t);

      // Form 2: Satellite Liquid Bead
      // Approaches and merges while Form 0 & Form 1 are interacting
      const r2 = isMobile ? 0.18 : 0.24;
      const mergeFactor2 = 0.5 - 0.5 * Math.cos(w2 * t - 1.2);
      const touchDist2 = (r0 + r2) * 0.70;
      const sepDist2 = (r0 + r2) * 1.55;
      const curDist2 = sepDist2 * (1.0 - mergeFactor2) + touchDist2 * mergeFactor2;

      const angle2 = -0.85 + 0.22 * Math.cos(w1 * t);
      const s2x = s0x + curDist2 * Math.cos(angle2);
      const s2y = s0y - curDist2 * Math.sin(angle2);
      const s2z = s0z + 0.20 + 0.08 * Math.sin(w2 * t);

      // =========================================================================
      // STAGE 2: RIGHT CLUSTER CHOREOGRAPHY (Desynchronized Phase)
      // Sequences in counter-phase with Left Cluster so an active merge is always occurring
      // =========================================================================
      // Form 3: Primary Large Base Form on Right Edge
      const r3 = (isMobile ? 0.60 : 0.80) * (1.0 + 0.03 * Math.cos(w2 * t));
      const s3x = stageScale * 0.76 + 0.07 * Math.cos(w1 * t + 1.8);
      const s3y = 0.12 + 0.09 * Math.sin(w1 * t + 1.2);
      const s3z = 0.05 + 0.05 * Math.sin(w2 * t);

      // Form 4: Approaching Medium Form on Right
      // When Left cluster is separated, Right cluster is merged!
      const r4 = isMobile ? 0.35 : 0.46;
      const mergeFactor3 = 0.5 + 0.5 * Math.cos(w1 * t); // 1 at t=0, 0 at t=12s, 1 at t=24s
      const touchDist3 = (r3 + r4) * 0.64;
      const sepDist3 = (r3 + r4) * 1.58;
      const curDist3 = sepDist3 * (1.0 - mergeFactor3) + touchDist3 * mergeFactor3;

      const angle3 = 2.45 + 0.18 * Math.sin(w1 * t);
      const s4x = s3x + curDist3 * Math.cos(angle3);
      const s4y = s3y - curDist3 * Math.sin(angle3);
      const s4z = s3z - 0.08 + 0.07 * Math.cos(w1 * t);

      // Form 5: Glossy Foreground Droplet on Right
      const r5 = isMobile ? 0.16 : 0.22;
      const mergeFactor4 = 0.5 - 0.5 * Math.cos(w2 * t + 1.8);
      const touchDist4 = (r3 + r5) * 0.68;
      const sepDist4 = (r3 + r5) * 1.50;
      const curDist4 = sepDist4 * (1.0 - mergeFactor4) + touchDist4 * mergeFactor4;

      const angle4 = 0.95 + 0.25 * Math.sin(w1 * t);
      const s5x = s3x + curDist4 * Math.cos(angle4);
      const s5y = s3y - curDist4 * Math.sin(angle4);
      const s5z = s3z + 0.30 + 0.08 * Math.sin(w2 * t);

      // =========================================================================
      // STAGE 3: BACKGROUND DEPTH ORB (Spatial Atmosphere)
      // =========================================================================
      const r6 = isMobile ? 0.55 : 0.72;
      const s6x = -stageScale * 0.42 + 0.08 * Math.cos(w1 * t + 3.0);
      const s6y = -0.72 + 0.07 * Math.sin(w1 * t + 2.2);
      const s6z = -1.25 + 0.05 * Math.cos(w2 * t);

      // Update uniforms
      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, t);
      gl.uniform1f(uAspectLoc, aspect);
      gl.uniform1f(uMotionScaleLoc, motionScale);
      gl.uniform2f(uMouseLoc, mouseX, mouseY);

      // Left cluster positions
      gl.uniform3f(uS0Loc, s0x, s0y, s0z);
      gl.uniform1f(uR0Loc, r0);
      gl.uniform3f(uS1Loc, s1x, s1y, s1z);
      gl.uniform1f(uR1Loc, r1);
      gl.uniform3f(uS2Loc, s2x, s2y, s2z);
      gl.uniform1f(uR2Loc, r2);

      // Right cluster positions
      gl.uniform3f(uS3Loc, s3x, s3y, s3z);
      gl.uniform1f(uR3Loc, r3);
      gl.uniform3f(uS4Loc, s4x, s4y, s4z);
      gl.uniform1f(uR4Loc, r4);
      gl.uniform3f(uS5Loc, s5x, s5y, s5z);
      gl.uniform1f(uR5Loc, r5);

      // Background orb
      gl.uniform3f(uS6Loc, s6x, s6y, s6z);
      gl.uniform1f(uR6Loc, r6);

      // Draw Fullscreen Quad
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    // Lifecycle cleanup
    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);

      if (gl && program) {
        gl.deleteProgram(program);
        if (vertShader) gl.deleteShader(vertShader);
        if (fragShader) gl.deleteShader(fragShader);
        if (positionBuffer) gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {webGlSupported ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block object-cover"
        />
      ) : (
        // High quality CSS fallback if WebGL is unavailable
        <div className="w-full h-full bg-[#AFBEA4] relative overflow-hidden">
          <div className="absolute -left-[10%] -bottom-[15%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-[#172C2E] via-[#224347] to-[#8A9E80]/40 shadow-[inset_0_0_80px_rgba(194,212,188,0.5)] opacity-80" />
          <div className="absolute -left-[5%] -top-[10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-br from-[#172C2E] via-[#224347] to-[#8A9E80]/40 shadow-[inset_0_0_70px_rgba(194,212,188,0.5)] opacity-80" />
          <div className="absolute -right-[12%] top-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-bl from-[#172C2E] via-[#224347] to-[#8A9E80]/40 shadow-[inset_0_0_75px_rgba(194,212,188,0.5)] opacity-80" />
        </div>
      )}
    </div>
  );
};

// Also export as HeroAnimation for compatibility with any component references
export { NashvilleHeroAnimation as HeroAnimation };
