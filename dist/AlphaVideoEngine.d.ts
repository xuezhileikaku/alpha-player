/**
 * 布局模式与 Alpha 通道位置定义
 */
export type LayoutMode = 'horizontal' | 'vertical';
export type AlphaPosition = 'left' | 'right' | 'top' | 'bottom';
export interface AlphaVideoOptions {
    canvas: HTMLCanvasElement;
    video: HTMLVideoElement;
    mode: LayoutMode;
    alphaPosition: AlphaPosition;
}
export declare class AlphaVideoEngine {
    private gl;
    private program;
    private options;
    private animationId;
    constructor(options: AlphaVideoOptions);
    private init;
    private generateFS;
    private createProgram;
    private initBuffers;
    private initTexture;
    start(): void;
    stop(): void;
}
