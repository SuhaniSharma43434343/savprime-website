declare module 'mp4box' {
  export function createFile(): any
  export interface File {
    onReady: (info: any) => void
    onError: (e: any) => void
    onSamples: (trackId: number, user: any, samples: any[]) => void
    setExtractionOptions(trackId: number, nbSamples: number): void
    start(): void
    stop(): void
    close(): void
  }
  export interface Sample {
    data: ArrayBuffer
    duration: number
    timescale: number
    cts: number
  }
}
