/**
 * TiltShiftShader.js - 自定义移轴效果着色器
 * 用于实现移轴镜头效果，增加清晰区
 */

export const CustomTiltShiftShader = {
    name: 'TiltShiftShader',
    uniforms: {
        'tDiffuse': { value: null },
        'blurradius': { value: 1.0 },
        'focus': { value: 0.5 },
        'aspect': { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float blurradius;
        uniform float focus;
        uniform float aspect;
        varying vec2 vUv;

        void main() {
            vec4 color = vec4( 0.0 );
            float total = 0.0;
            
            // 1. 计算距离焦点的垂直距离 (绝对值)
            float dist = abs(vUv.y - focus);
            
            // 2. 设定一个"绝对清晰范围" (例如 0.15)
            // 屏幕中间 30% (0.15*2) 的区域完全不模糊
            // 超过 0.15 的部分，模糊程度才开始随距离增加
            float amount = max(0.0, dist - 0.25) * blurradius; 
            
            for ( float i = -4.0; i <= 4.0; i++ ) {
                for ( float j = -4.0; j <= 4.0; j++ ) {
                    float x = vUv.x + ( j * amount * 0.002 / aspect );
                    float y = vUv.y + ( i * amount * 0.002 );
                    color += texture2D( tDiffuse, vec2( x, y ) );
                    total += 1.0;
                }
            }
            gl_FragColor = color / total;
        }`
};
