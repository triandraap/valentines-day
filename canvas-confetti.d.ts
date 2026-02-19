declare module "canvas-confetti" {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    flat?: boolean;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: Array<"square" | "circle" | "star" | Record<string, unknown>>;
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  interface GlobalOptions {
    resize?: boolean;
    useWorker?: boolean;
    disableForReducedMotion?: boolean;
  }

  interface ConfettiExport {
    (options?: Options): Promise<null>;
    reset(): void;
    create(
      canvas: HTMLCanvasElement,
      options?: GlobalOptions
    ): ConfettiExport;
    shapeFromText(options: {
      text: string;
      scalar?: number;
      [key: string]: unknown;
    }): Record<string, unknown>;
  }

  const confetti: ConfettiExport;
  export = confetti;
}
