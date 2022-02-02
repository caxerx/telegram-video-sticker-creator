# Telegram Video Sticker Creator

> Convert Video to Telegram Video Sticker, Only on your browser! Try it out on: [https://tgvs.iw.gy/](https://tgvs.iw.gy/)

The website used [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) to convert video to vp9 video and remove the audio tracks in the browser without server-side application.

# Tested Browser

## Supported

- Chrome 97

## Partially Supported

- Safari 15.3 on Mac
  - Preview not work properly
  - Exported file is working

## Not Supported

- iOS Browser
  - FFmpeg will cause Out of memory error.

# Converted Format

- vp9
- yuva420p
- Fitted in a 512\*512 box
- Max 30fps
- Audio Tracks and Metadata Removed

# WASM Library

- [ffprobe-wasm](https://github.com/alfg/ffprobe-wasm)
  - To determinate the video format and information.
- [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)
  - To convert the video to the desire format.
