import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { CropInfo, ConvertSetting } from './types';

export const ffmpeg = createFFmpeg({
  corePath: './ffmpeg-core/ffmpeg-core.js',
});

export async function ffmpegInit() {
  await ffmpeg.load();
  ffmpeg.setLogging(true);
}

export function processUint8Array(
  data: Uint8Array,
  type?: BlobPropertyBag,
): [Blob, string] {
  const videoBlob = new Blob([data], type);
  return [videoBlob, URL.createObjectURL(videoBlob)];
}

export function createConvertToH264Command(
  inputFilename: string,
  outputFilename: string,
) {
  return [
    '-i',
    inputFilename,
    '-c:a',
    'copy',
    '-c:v',
    'libx264',
    outputFilename,
  ];
}

export function createTrimAndCropCommand(
  inputFilename: string,
  outputFilename: string,
  startTime: number,
  endTime: number,
  cropInfo: CropInfo,
) {
  return [
    '-i',
    inputFilename,
    '-an',
    '-map_metadata',
    '-1',
    '-map_chapters',
    '-1',
    '-ss',
    `${startTime}`,
    '-to',
    `${endTime}`,
    '-filter:v',
    `crop=${cropInfo.width}:${cropInfo.height}:${cropInfo.x}:${cropInfo.y}`,
    outputFilename,
  ];
}

export function createEncodeCommand(
  inputFilename: string,
  outputFilename: string,
  config: Exclude<ConvertSetting, 'time'>,
) {
  return [
    '-i',
    inputFilename,
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    `${config.bitrate}k`,
    '-vf',
    `scale=w=512:h=512:force_original_aspect_ratio=decrease, setpts=${
      1 / config.speed
    }*PTS`,
    '-r',
    `${config.fps}`,
    '-pix_fmt',
    'yuva420p',
    outputFilename,
  ];
}
