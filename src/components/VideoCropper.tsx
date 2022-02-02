import { forwardRef, useImperativeHandle, useRef } from 'react';
import '../cropper.scss';

export interface VideoCropperProps {
  videoInfo: { width: number; height: number };
  children: React.ReactNode;
}

export interface VideoCropperRefs {
  video: HTMLVideoElement | null;
  canvas: HTMLCanvasElement | null;
}

const VideoCropper = forwardRef<VideoCropperRefs, VideoCropperProps>(
  ({ videoInfo, children }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      get video(): HTMLVideoElement | null {
        return videoRef.current;
      },
      get canvas(): HTMLCanvasElement | null {
        return canvasRef.current;
      },
    }));

    return (
      <div className="video-section">
        <div
          id="video-container"
          style={{
            aspectRatio: `${videoInfo.width} / ${videoInfo.height}`,
            width: videoInfo.width,
            maxWidth: 512,
            maxHeight: 512,
          }}
        >
          <video ref={videoRef}>{children}</video>
        </div>

        <div
          id="crop-container"
          style={{
            aspectRatio: `${videoInfo.width} / ${videoInfo.height}`,
            width: videoInfo.width,
            maxWidth: 512,
            maxHeight: 512,
          }}
        >
          <canvas
            width={videoInfo.width}
            height={videoInfo.height}
            ref={canvasRef}
          />
        </div>
      </div>
    );
  },
);

export default VideoCropper;
