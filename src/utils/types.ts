export interface ConvertSetting {
  bitrate: number;
  fps: number;
  speed: number;
  time: [number, number];
}

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
}

export interface CropInfo {
  width: number;
  height: number;
  x: number;
  y: number;
}
