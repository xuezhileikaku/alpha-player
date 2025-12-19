export class AlphaVideoEngine {
    constructor(options) {
        this.program = null;
        this.animationId = 0;
        this.options = options;
        // 初始化 WebGL 上下文，确保支持透明度
        const gl = options.canvas.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: false
        });
        if (!gl)
            throw new Error('WebGL not supported');
        this.gl = gl;
        this.init();
    }
    init() {
        this.program = this.createProgram();
        this.initBuffers();
        this.initTexture();
    }
    // 动态生成片元着色器逻辑
    generateFS() {
        const { mode, alphaPosition } = this.options;
        let logic = '';
        if (mode === 'horizontal') {
            const isRight = alphaPosition === 'right';
            logic = `
        vec2 rgbCoord = vec2(v_texCoord.x * 0.5 + ${isRight ? '0.0' : '0.5'}, v_texCoord.y);
        vec2 alphaCoord = vec2(v_texCoord.x * 0.5 + ${isRight ? '0.5' : '0.0'}, v_texCoord.y);
      `;
        }
        else {
            const isBottom = alphaPosition === 'bottom';
            logic = `
        vec2 rgbCoord = vec2(v_texCoord.x, v_texCoord.y * 0.5 + ${isBottom ? '0.5' : '0.0'});
        vec2 alphaCoord = vec2(v_texCoord.x, v_texCoord.y * 0.5 + ${isBottom ? '0.0' : '0.5'});
      `;
        }
        return `
      precision mediump float;
      uniform sampler2D u_sampler;
      varying vec2 v_texCoord;
      void main() {
        ${logic}
        vec4 color = texture2D(u_sampler, rgbCoord);
        float alpha = texture2D(u_sampler, alphaCoord).r;
        gl_FragColor = vec4(color.rgb, alpha);
      }
    `;
    }
    createProgram() {
        const gl = this.gl;
        const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;
        const fsSource = this.generateFS();
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);
        return program;
    }
    initBuffers() {
        const gl = this.gl;
        const program = this.program;
        // 顶点坐标和纹理坐标
        const vertices = new Float32Array([
            -1.0, -1.0, 0.0, 1.0, 1.0, -1.0, 1.0, 1.0,
            -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0
        ]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        const a_pos = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(a_pos);
        gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 16, 0);
        const a_tex = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(a_tex);
        gl.vertexAttribPointer(a_tex, 2, gl.FLOAT, false, 16, 8);
    }
    initTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    start() {
        const render = () => {
            const gl = this.gl;
            const { video, canvas } = this.options;
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
                // 设置视口尺寸
                if (this.options.mode === 'horizontal') {
                    canvas.width = video.videoWidth / 2;
                    canvas.height = video.videoHeight;
                }
                else {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight / 2;
                }
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }
    stop() {
        cancelAnimationFrame(this.animationId);
    }
}
