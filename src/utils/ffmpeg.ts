import { createFFmpeg } from '@ffmpeg/ffmpeg';

export const ffmpeg = createFFmpeg({
  corePath: './ffmpeg-core/ffmpeg-core.js',
});
