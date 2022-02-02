import {
  Button,
  Slider,
  Form,
  InputNumber,
  Row,
  Col,
  Progress,
  Card,
  Upload,
} from 'antd';

import { InboxOutlined } from '@ant-design/icons';

import { useEffect, useRef, useState } from 'react';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { getFileInfo, getFrames } from './utils/ffprobe';
import { ffmpeg } from './utils/ffmpeg';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface ConvertSetting {
  bitrate: number;
  fps: number;
  speed: number;
  time: [number, number];
}

const App = () => {
  const [init, setInit] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>();

  const [convertedSrc, setConvertedSrc] = useState<string>();
  const [convertedFileSize, setConvertedFileSize] = useState<number>();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(10);

  const [converting, setConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(-1);

  useEffect(() => {
    ffmpeg.load().then(() => {
      ffmpeg.setLogging(true);
      setInit(true);
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
    ffmpeg?.FS('writeFile', filename, data);

    ffmpeg.setProgress((progress) => {
      onProgress?.({ percent: progress.ratio });
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
    onComplete?.(true);

    const convertedData = ffmpeg.FS('readFile', 'input.mp4');
    const convertedFile = new File([convertedData], 'input.mp4');
    const fileInfo = (await getFileInfo(convertedFile)) as any;

    setVideoDuration(fileInfo.duration);
    setVideoSrc(uint8ArrayToBlobUrl(convertedData));
  }

  function timeStop(stop: number) {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      return;
    }

    if (videoRef.current.currentTime >= stop) {
      videoRef.current?.pause();
    } else {
      requestAnimationFrame(() => timeStop(stop));
    }
  }

  function uint8ArrayToBlobUrl(data: Uint8Array, type?: BlobPropertyBag) {
    const videoBlob = new Blob([data], type);
    return URL.createObjectURL(videoBlob);
  }

  async function convert(config: ConvertSetting) {
    const command = [
      '-i',
      'input.mp4',
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
      '-ss',
      `${config.time[0] / 1000000}`,
      '-to',
      `${config.time[1] / 1000000}`,
      'output.webm',
    ];

    try {
      ffmpeg.FS('unlink', 'output.webm');
    } catch (e) {
      // ignore
    }

    ffmpeg.setProgress((p) => {
      setConvertProgress(p.ratio);
    });

    setConvertProgress(0);
    setConverting(true);
    await ffmpeg.run(...command);
    setConverting(false);

    const convertedData = ffmpeg.FS('readFile', 'output.webm');
    const convertedBlob = uint8ArrayToBlobUrl(convertedData, {
      type: 'video/webm',
    });
    setConvertedFileSize(convertedData.length);
    setConvertedSrc(convertedBlob);
  }

  return (
    <div>
      {!videoSrc && init && (
        <div
          style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <Upload.Dragger
              multiple={false}
              style={{
                padding: '1rem',
              }}
              customRequest={(f) => {
                const fFile = f.file;
                if (typeof fFile === 'string') { return f.onError?.(new Error('Invalid file')); }
                loadInputFile(fFile, f.onProgress, f.onSuccess, f.onError);
                console.log(f);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Upload a video to start</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from
                uploading company data or other band files
              </p>
            </Upload.Dragger>
          </div>
        </div>
      )}
      {videoSrc && (
        <>
          <video ref={videoRef} style={{ width: '100%', height: '512px' }}>
            <source src={`${videoSrc}`} />
          </video>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            FPS and Bitrate will not reflect in the preview video.
          </div>

          <Form<ConvertSetting>
            name="basic"
            initialValues={{
              speed: 1.0,
              fps: 30,
              bitrate: 1200,
              time: [0, videoDuration],
            }}
            onFinish={(v) => {
              if (videoRef.current) {
                videoRef.current.currentTime = v.time[0] / 1000000;
                videoRef.current.playbackRate = v.speed;
                videoRef.current.play();
                timeStop(v.time[1] / 1000000);
              }
            }}
            autoComplete="off"
            style={{
              padding: '20px',
            }}
          >
            {(store: ConvertSetting) => (
              <>
                <Form.Item name="time">
                  <Slider
                    range={{ draggableTrack: true }}
                    max={videoDuration}
                    step={1}
                    tipFormatter={(v) =>
                      (typeof v === 'number'
                        ? dayjs
                          .duration(Math.round(v / 1000), 'milliseconds')
                          .format('HH:mm:ss.SSS')
                        : '')
                    }
                    onChange={(v: [number, number]) => {
                      if (videoRef.current) {
                        if (store.time[0] === v[0]) {
                          videoRef.current.currentTime = v[1] / 1000000;
                        } else {
                          videoRef.current.currentTime = v[0] / 1000000;
                        }
                      }
                    }}
                  />
                </Form.Item>

                <Row>
                  <Col span={18}>
                    <Form.Item label="Speed" name="speed">
                      <Slider min={0.0625} max={16} step={0.0001} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="speed" label=" " colon={false}>
                      <InputNumber min={0.0625} max={16} step={0.05} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="fps" label="FPS">
                  <InputNumber min={1} max={30} />
                </Form.Item>

                <Form.Item name="bitrate" label="Bitrate">
                  <InputNumber step={50} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Play
                  </Button>
                  <Button onClick={() => convert(store)}>Convert</Button>
                </Form.Item>
              </>
            )}
          </Form>
        </>
      )}

      {converting && (
        <div
          style={{
            padding: '20px',
          }}
        >
          <Progress percent={convertProgress * 100} />
        </div>
      )}

      {convertProgress === 1 && convertedSrc && convertedFileSize && (
        <Card
          size="default"
          title={
            <a download href={convertedSrc}>
              Download Video ({Math.ceil(convertedFileSize / 1000)}KB)
            </a>
          }
          extra={
            <a href="#" onClick={() => setConvertedSrc(undefined)}>
              Close
            </a>
          }
          style={{ width: 300 }}
        >
          <Row>
            <Col span={24}>
              <video controls key={convertedSrc} style={{ width: '100%' }}>
                <source src={convertedSrc} />
              </video>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default App;
