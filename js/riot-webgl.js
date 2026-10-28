/**
 * riot-webgl.js — Riot Games WebGL 3D Hextech Procedural Shader Engine
 * 
 * Features:
 *   - Lightweight, zero-dependency WebGL 1.0 & 2.0 procedural shader engine
 *   - High-performance Simplex Noise & FBM (Fractal Brownian Motion) domain warping
 *   - Hextech blue/gold color palette with dynamic pulsing core energy
 *   - Mouse-reactive ripple displacement & click shockwave uniforms
 *   - Multi-Theme Sync: Adapts color palettes dynamically (Riot, Valorant, LoL, TFT, Star Guardian, K/DA)
 *   - Seamless 2D Canvas Fallback: Headless and non-WebGL environments run smoothly with zero errors
 *   - Memory & Resource Optimization: Auto-pauses on document visibility hidden, high-DPI scaling
 * 
 * API:
 *   window.RiotWebGLShader = {
 *     init(canvasOrId, options),
 *     setQuality(quality),
 *     setTheme(themeName),
 *     triggerShockwave(x, y),
 *     destroy(),
 *     isWebGLSupported()
 *   }
 */

(function (global) {
  'use strict';

  // Palette definitions for all supported Riot Games themes
  const PALETTES = {
    riot: {
      deep: [0.03, 0.04, 0.06],
      core: [0.92, 0.0, 0.16],       // Riot Red
      accent: [1.0, 0.28, 0.35],
      gold: [1.0, 0.85, 0.4]
    },
    valorant: {
      deep: [0.04, 0.05, 0.08],
      core: [1.0, 0.27, 0.33],       // Radiant Red
      accent: [0.94, 0.94, 0.96],
      gold: [0.12, 0.85, 0.72]
    },
    lol: {
      deep: [0.01, 0.05, 0.09],
      core: [0.04, 0.78, 0.73],       // Hextech Cyan
      accent: [0.06, 0.42, 0.76],
      gold: [0.78, 0.67, 0.43]        // Arcane Gold
    },
    tft: {
      deep: [0.05, 0.02, 0.09],
      core: [0.62, 0.31, 0.87],       // Cosmic Indigo
      accent: [0.30, 0.79, 0.94],
      gold: [1.0, 0.82, 0.42]
    },
    starguardian: {
      deep: [0.08, 0.02, 0.06],
      core: [1.0, 0.4, 0.7],          // Star Guardian Pink
      accent: [0.65, 0.95, 0.99],
      gold: [1.0, 0.84, 0.0]
    },
    kda: {
      deep: [0.04, 0.01, 0.08],
      core: [0.78, 0.0, 0.49],        // K/DA Neon Magenta
      accent: [0.0, 0.94, 1.0],        // Cyan Laser
      gold: [0.61, 0.32, 0.88]
    }
  };

  // Vertex Shader GLSL ES 1.00
  const VERTEX_SHADER_SRC = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment Shader GLSL ES 1.00 with Simplex Noise & Hextech plasma ripples
  const FRAGMENT_SHADER_SRC = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_mouse_active;
    uniform vec3 u_color_deep;
    uniform vec3 u_color_core;
    uniform vec3 u_color_accent;
    uniform vec3 u_color_gold;
    uniform float u_shockwave_time;
    uniform vec2 u_shockwave_pos;

    varying vec2 v_uv;

    // 2D Simplex Noise generator
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Fractal Brownian Motion (FBM)
    float fbm(vec2 p) {
      float total = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        total += amp * snoise(p);
        p *= 2.05;
        amp *= 0.5;
      }
      return total;
    }

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 pos = (st - 0.5) * aspect;

      // Mouse interactive wave ripple
      float distMouse = length(st - u_mouse);
      float mouseInfluence = smoothstep(0.4, 0.0, distMouse) * u_mouse_active;
      vec2 mouseDistort = normalize(st - u_mouse + 0.0001) * sin(distMouse * 28.0 - u_time * 4.0) * 0.02 * mouseInfluence;

      // Click shockwave expansion
      float swAge = u_time - u_shockwave_time;
      float swRadius = swAge * 0.8;
      float swDist = length(st - u_shockwave_pos);
      float swRing = smoothstep(0.06, 0.0, abs(swDist - swRadius)) * exp(-swAge * 2.5);
      vec2 swDistort = normalize(st - u_shockwave_pos + 0.0001) * swRing * 0.04;

      // Distorted domain coordinate
      vec2 warped = pos * 2.2 + mouseDistort + swDistort;
      float t = u_time * 0.18;

      float q1 = fbm(warped + vec2(t * 0.4, -t * 0.3));
      float q2 = fbm(warped + vec2(-t * 0.2, t * 0.5) + q1 * 0.8);
      float plasma = fbm(warped + q2 * 1.2);

      // Core glow radial falloff
      float coreGlow = smoothstep(0.9, 0.1, length(pos)) * (0.6 + 0.4 * sin(u_time * 1.5));

      // Color composite
      vec3 color = u_color_deep;
      color = mix(color, u_color_core, smoothstep(-0.4, 0.6, plasma) * 0.7);
      color = mix(color, u_color_accent, smoothstep(0.2, 0.9, q2) * 0.5);
      color = mix(color, u_color_gold, pow(max(0.0, plasma), 3.0) * 0.65);
      color += u_color_core * coreGlow * 0.35;
      color += vec3(1.0) * swRing * 0.6; // Shockwave flash

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  class RiotWebGLShaderEngine {
    constructor() {
      this.canvas = null;
      this.gl = null;
      this.program = null;
      this.uniforms = {};
      this.animId = null;
      this.startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;
      this.mouse = { x: 0.5, y: 0.5, active: 0.0 };
      this.shockwave = { x: 0.5, y: 0.5, time: -100.0 };
      this.currentTheme = 'riot';
      this.qualityScale = 1.0;
      this.is2DFallback = false;
      this.ctx2d = null;
      this.particles2d = [];
    }

    isWebGLSupported() {
      if (typeof window === 'undefined' || !window.WebGLRenderingContext) return false;
      try {
        const testCanvas = document.createElement('canvas');
        return !!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    }

    init(canvasOrId, options = {}) {
      if (typeof document === 'undefined') return this;

      if (typeof canvasOrId === 'string') {
        this.canvas = document.getElementById(canvasOrId);
      } else {
        this.canvas = canvasOrId;
      }

      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'riot-webgl-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        document.body.prepend(this.canvas);
      }

      this.currentTheme = options.theme || document.documentElement.getAttribute('data-theme') || 'riot';
      if (!PALETTES[this.currentTheme]) this.currentTheme = 'riot';

      const supportsGL = this.isWebGLSupported();
      if (supportsGL && !options.force2D) {
        this._initWebGL();
      } else {
        this._init2DFallback();
      }

      this._bindEvents();
      this._startLoop();
      return this;
    }

    _initWebGL() {
      const gl = this.canvas.getContext('webgl', { alpha: false, depth: false, antialias: false }) ||
                 this.canvas.getContext('experimental-webgl');
      if (!gl) {
        this._init2DFallback();
        return;
      }

      this.gl = gl;
      const vShader = this._compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
      const fShader = this._compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

      if (!vShader || !fShader) {
        this._init2DFallback();
        return;
      }

      const program = gl.createProgram();
      gl.attachShader(program, vShader);
      gl.attachShader(program, fShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('WebGL link failed, falling back to 2D:', gl.getProgramInfoLog(program));
        this._init2DFallback();
        return;
      }

      this.program = program;
      gl.useProgram(program);

      // Fullscreen quad buffer
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]), gl.STATIC_DRAW);

      const aPosition = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      // Cache uniform locations
      const uniformNames = [
        'u_resolution', 'u_time', 'u_mouse', 'u_mouse_active',
        'u_color_deep', 'u_color_core', 'u_color_accent', 'u_color_gold',
        'u_shockwave_time', 'u_shockwave_pos'
      ];
      uniformNames.forEach(name => {
        this.uniforms[name] = gl.getUniformLocation(program, name);
      });

      this._updateThemeUniforms();
      this.resize();
    }

    _compileShader(type, src) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('GLSL compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    _init2DFallback() {
      this.is2DFallback = true;
      this.ctx2d = this.canvas.getContext('2d');
      this.particles2d = [];
      for (let i = 0; i < 40; i++) {
        this.particles2d.push({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.001,
          vy: (Math.random() - 0.5) * 0.001,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
      this.resize();
    }

    _updateThemeUniforms() {
      if (this.is2DFallback || !this.gl || !this.program) return;
      const palette = PALETTES[this.currentTheme] || PALETTES.riot;
      const gl = this.gl;
      gl.useProgram(this.program);
      if (this.uniforms.u_color_deep) gl.uniform3fv(this.uniforms.u_color_deep, palette.deep);
      if (this.uniforms.u_color_core) gl.uniform3fv(this.uniforms.u_color_core, palette.core);
      if (this.uniforms.u_color_accent) gl.uniform3fv(this.uniforms.u_color_accent, palette.accent);
      if (this.uniforms.u_color_gold) gl.uniform3fv(this.uniforms.u_color_gold, palette.gold);
    }

    setTheme(themeName) {
      if (PALETTES[themeName]) {
        this.currentTheme = themeName;
        this._updateThemeUniforms();
      }
    }

    setQuality(quality) {
      if (quality === 'low') this.qualityScale = 0.5;
      else if (quality === 'medium') this.qualityScale = 0.75;
      else this.qualityScale = 1.0;
      this.resize();
    }

    triggerShockwave(x, y) {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;
      this.shockwave.x = x !== undefined ? x : 0.5;
      this.shockwave.y = y !== undefined ? y : 0.5;
      this.shockwave.time = now;
    }

    resize() {
      if (!this.canvas) return;
      const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
      const w = (this.canvas.clientWidth || window.innerWidth || 800) * this.qualityScale;
      const h = (this.canvas.clientHeight || window.innerHeight || 600) * this.qualityScale;

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);

      if (this.gl) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    _bindEvents() {
      if (typeof window === 'undefined') return;

      window.addEventListener('resize', () => this.resize(), { passive: true });

      window.addEventListener('mousemove', (e) => {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) / (rect.width || 1);
        this.mouse.y = 1.0 - (e.clientY - rect.top) / (rect.height || 1); // WebGL inverted Y
        this.mouse.active = 1.0;
      }, { passive: true });

      window.addEventListener('click', (e) => {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (rect.width || 1);
        const y = 1.0 - (e.clientY - rect.top) / (rect.height || 1);
        this.triggerShockwave(x, y);
      }, { passive: true });

      // Theme attribute observer
      if (typeof MutationObserver !== 'undefined' && document.documentElement) {
        const observer = new MutationObserver(() => {
          const theme = document.documentElement.getAttribute('data-theme') || 'riot';
          this.setTheme(theme);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      }
    }

    _startLoop() {
      const loop = (timestamp) => {
        if (typeof document !== 'undefined' && document.hidden) {
          this.animId = requestAnimationFrame(loop);
          return;
        }

        const now = timestamp * 0.001;

        if (this.is2DFallback) {
          this._render2D(now);
        } else if (this.gl && this.program) {
          this._renderWebGL(now);
        }

        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    _renderWebGL(now) {
      const gl = this.gl;
      gl.useProgram(this.program);

      if (this.uniforms.u_resolution) {
        gl.uniform2f(this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
      }
      if (this.uniforms.u_time) {
        gl.uniform1f(this.uniforms.u_time, now - this.startTime);
      }
      if (this.uniforms.u_mouse) {
        gl.uniform2f(this.uniforms.u_mouse, this.mouse.x, this.mouse.y);
      }
      if (this.uniforms.u_mouse_active) {
        gl.uniform1f(this.uniforms.u_mouse_active, this.mouse.active);
      }
      if (this.uniforms.u_shockwave_time) {
        gl.uniform1f(this.uniforms.u_shockwave_time, this.shockwave.time - this.startTime);
      }
      if (this.uniforms.u_shockwave_pos) {
        gl.uniform2f(this.uniforms.u_shockwave_pos, this.shockwave.x, this.shockwave.y);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    _render2D(now) {
      const ctx = this.ctx2d;
      const w = this.canvas.width;
      const h = this.canvas.height;
      if (!ctx || w === 0 || h === 0) return;

      const palette = PALETTES[this.currentTheme] || PALETTES.riot;
      const toRgb = (c) => `rgb(${Math.floor(c[0]*255)}, ${Math.floor(c[1]*255)}, ${Math.floor(c[2]*255)})`;

      ctx.fillStyle = toRgb(palette.deep);
      ctx.fillRect(0, 0, w, h);

      // Radial energy background
      const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, Math.max(w, h)/1.5);
      grad.addColorStop(0, toRgb(palette.core));
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Particle simulation
      ctx.fillStyle = toRgb(palette.accent);
      this.particles2d.forEach(p => {
        p.x = (p.x + p.vx + 1.0) % 1.0;
        p.y = (p.y + p.vy + 1.0) % 1.0;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    }

    destroy() {
      if (this.animId) cancelAnimationFrame(this.animId);
      if (this.gl && this.program) {
        this.gl.deleteProgram(this.program);
      }
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  // Export singleton instance and class
  const instance = new RiotWebGLShaderEngine();
  if (typeof window !== 'undefined') {
    window.RiotWebGLShader = instance;
    window.RiotWebGLShaderEngine = RiotWebGLShaderEngine;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiotWebGLShader: instance, RiotWebGLShaderEngine };
  }
})(typeof window !== 'undefined' ? window : global);
