import { Button, Form, Row, Col, Progress, Card, Tooltip, Input } from 'antd';

import { useEffect, useReducer, useRef } from 'react';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { getFileInfo } from './utils/ffprobe';
import { ffmpeg, ffmpegInit } from './utils/ffmpeg';

import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

import FileUpload from './components/FileUpload';
import VideoCropper, { VideoCropperRefs } from './components/VideoCropper';
import CropperToolbar from './components/CropperToolbar';
import { formatTimeDuration } from './utils/time';
import VideoTrimBar from './components/VideoTrimBar';
import ConvertSettingForm from './components/ConvertSettingForm';
import type { ConvertSetting } from './utils/types';
import {
  AppState,
  createReducer,
  setConvertorConvertEncode,
  setConvertorProgress,
  setConvertorStartConvert,
  setCropperDisabled,
  setCropperEnabled,
  setFFmpegInit,
  setInputVideo,
  setInputVideoInfo,
  setConvertorFinished,
  setOutputVideo,
  setVideoEditorConfigTrimTime,
  setVideoConfig,
  resetConvertor,
} from './utils/store';

const defaultState: AppState = {
  ffmpeg: {
    init: false,
  },
  cropper: {
    enabled: false,
    cropper: null,
  },
  inputFile: {
    fileLoaded: false,
    videoInfo: {
      duration: 0,
      width: 0,
      height: 0,
    },
    videoBlob: null,
    videoSrc: null,
  },
  convertor: {
    convertStatus: 'idle',
    progress: 0,
  },
  outputFile: {
    fileLoaded: false,
    fileInfo: {
      fileSize: 0,
    },
    videoBlob: null,
    videoSrc: null,
  },
  videoEditorConfig: {
    speed: 1.0,
    fps: 30,
    bitrate: 1200,
    time: [0, 0],
  },
};

const App = () => {
  const [state, dispatch] = useReducer(
    createReducer(defaultState),
    defaultState,
  );

  const videoCropperRef = useRef<VideoCropperRefs>(null);

  useEffect(() => {
    ffmpegInit().then(() => {
      dispatch(setFFmpegInit());
    });
  }, []);

  async function loadInputFile(
    file: File | Blob,
    onProgress?: (progress: { percent: number }) => void,
    onComplete?: (f: boolean) => void,
    onError?: (e: Error) => void,
  ) {
    const filename = 'video.mp4';
    const data = await fetchFile(file);

    const originalFile = new File([data], filename);
    const originalFileInfo = { name: '' };
    try {
      originalFileInfo.name = ((await getFileInfo(originalFile)) as any).name;
    } catch (e) {
      // ignore
    }

    ffmpeg?.FS('writeFile', filename, data);

    if (originalFileInfo.name.includes('mp4')) {
      ffmpeg.FS('writeFile', 'input.mp4', data);
    } else {
      ffmpeg.setProgress((progress) => {
        onProgress?.({ percent: progress.ratio * 100 });
      });

      try {
        await ffmpeg.run(
          '-i',
          filename,
          '-c:a',
          'copy',
          '-c:v',
          'libx264',
          'input.mp4',
        );
      } catch (e) {
        onError?.(new Error('failed to convert file'));
        return;
      }
    }

    onComplete?.(true);

    const convertedData = ffmpeg.FS('readFile', 'input.mp4');
    const convertedFile = new File([convertedData], 'input.mp4');
    const fileInfo = (await getFileInfo(convertedFile)) as any;

    dispatch(
      setInputVideoInfo({
        duration: fileInfo.duration,
        width: fileInfo.streams[0].width,
        height: fileInfo.streams[0].height,
      }),
    );

    dispatch(setInputVideo(convertedData));
  }

  function enableCropper() {
    const canvas = videoCropperRef.current?.canvas;
    if (canvas) {
      const cropper = new Cropper(canvas, {
        background: false,
        modal: false,
        highlight: false,
        viewMode: 1,
      });
      dispatch(setCropperEnabled(cropper));
    }
  }

  function disableCropper() {
    dispatch(setCropperDisabled(state.cropper.cropper));
  }

  function timeStop(stop: number) {
    const video = videoCropperRef.current?.video;
    if (!video) return;
    if (video.paused) {
      return;
    }

    if (video.currentTime >= stop) {
      video?.pause();
    } else {
      requestAnimationFrame(() => timeStop(stop));
    }
  }

  async function convert(config: ConvertSetting) {
    const cropInfo = {
      width: state.inputFile.videoInfo.width,
      height: state.inputFile.videoInfo.height,
      x: 0,
      y: 0,
      ...state.cropper.cropper?.getData(),
    };
    const trimCommand = [
      '-i',
      'input.mp4',
      '-an',
      '-map_metadata',
      '-1',
      '-map_chapters',
      '-1',
      '-ss',
      `${config.time[0] / 1000000}`,
      '-to',
      `${config.time[1] / 1000000}`,
      '-filter:v',
      `crop=${cropInfo.width}:${cropInfo.height}:${cropInfo.x}:${cropInfo.y}`,
      'trim.mp4',
    ];

    const command = [
      '-i',
      'trim.mp4',
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
      'output.webm',
    ];

    try {
      ffmpeg.FS('unlink', 'trim.mp4');
      ffmpeg.FS('unlink', 'output.webm');
    } catch (e) {
      // ignore
    }

    dispatch(setConvertorStartConvert());

    ffmpeg.setProgress((p) => {
      dispatch(setConvertorProgress(p.ratio));
    });

    await ffmpeg.run(...trimCommand);

    dispatch(setConvertorConvertEncode());
    await ffmpeg.run(...command);

    dispatch(setConvertorFinished());

    const convertedData = ffmpeg.FS('readFile', 'output.webm');

    dispatch(setOutputVideo(convertedData));
  }

  return (
    <div>
      {!state.inputFile.fileLoaded && (
        <FileUpload
          onFileUpload={(f) => {
            loadInputFile(f.file, f.onProgress, f.onSuccess, f.onError);
          }}
        />
      )}

      {state.inputFile.fileLoaded && (
        <>
          <VideoCropper
            videoInfo={state.inputFile.videoInfo}
            ref={videoCropperRef}
          >
            <source src={`${state.inputFile.videoSrc}`} />
          </VideoCropper>

          <div
            style={{
              textAlign: 'center',
            }}
          >
            FPS and Bitrate will not reflect in the preview video.
          </div>

          <CropperToolbar
            setCropperEnabled={(e) => {
              e ? enableCropper() : disableCropper();
            }}
            cropperEnabled={state.cropper.enabled}
            setAspectRatio={(e) => {
              state.cropper.cropper?.setAspectRatio(e);
            }}
            currentAspectRatio={NaN}
          />

          <Row gutter={8}>
            <Col span={18}>
              <Form.Item name="time">
                <VideoTrimBar
                  videoInfo={state.inputFile.videoInfo}
                  videoEditorConfig={state.videoEditorConfig}
                  setVideoCurrent={(time) => {
                    const video = videoCropperRef.current?.video;
                    if (!video) return;
                    video.currentTime = time;
                  }}
                  setTrimTime={(time) => {
                    dispatch(setVideoEditorConfigTrimTime(time));
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Input
                disabled
                value={formatTimeDuration(
                  state.videoEditorConfig.time[1] -
                    state.videoEditorConfig.time[0],
                  state.videoEditorConfig.speed,
                )}
              />
            </Col>
          </Row>
          <ConvertSettingForm
            videoEditorConfig={state.videoEditorConfig}
            onPlay={() => {
              const v = state.videoEditorConfig;
              const video = videoCropperRef.current?.video;
              if (video) {
                video.currentTime = v.time[0] / 1000000;
                video.playbackRate = v.speed;
                video.play();
                timeStop(v.time[1] / 1000000);
              }
            }}
            onConvert={() => {
              convert(state.videoEditorConfig);
            }}
            onSettingUpdate={(e) => {
              dispatch(setVideoConfig(e));
            }}
          />
        </>
      )}

      {(state.convertor.convertStatus === 'convertingEncode' ||
        state.convertor.convertStatus === 'convertingTrim') && (
        <div
          style={{
            padding: '20px',
            maxWidth: '100vw',
          }}
        >
          <Progress percent={Math.round(state.convertor.progress * 100)} />
        </div>
      )}

      {state.convertor.convertStatus === 'converted' && (
        <Card
          size="default"
          title={
            <Tooltip
              title="The video sticker file size is limited to 256KB"
              visible={state.outputFile.fileInfo.fileSize <= 256000 ? false : undefined}
            >
              <Button
                download
                type="link"
                href={state.outputFile.videoSrc ?? ''}
                danger={state.outputFile.fileInfo.fileSize > 256000 ? true : undefined}
              >
                Download Video ({Math.ceil(state.outputFile.fileInfo.fileSize / 1000)}KB)
              </Button>
            </Tooltip>
          }
          extra={
            <a href="#" onClick={() => dispatch(resetConvertor())}>
              Close
            </a>
          }
          style={{ width: 300 }}
        >
          <Row>
            <Col span={24}>
              <video controls key={state.outputFile.videoSrc ?? ''} style={{ width: '100%' }}>
                <source src={state.outputFile.videoSrc ?? ''} />
              </video>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default App;
