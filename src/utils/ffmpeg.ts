import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const ffmpeg = createFFmpeg({
  corePath: './ffmpeg-core/ffmpeg-core.js',
});

export async function ffmpegInit() {
  await ffmpeg.load();
  ffmpeg.setLogging(true);
}

export function processUint8Array(data: Uint8Array, type?: BlobPropertyBag): [Blob, string] {
  const videoBlob = new Blob([data], type);
  return [videoBlob, URL.createObjectURL(videoBlob)];
}
