import { Slider } from 'antd';
import { formatTimeDuration } from '../utils/time';


export interface VideoTrimBarProps {
  videoInfo: { duration: number };
  videoEditorConfig: { speed: number; time: [number, number] };
  setVideoCurrent: (time: number) => void;
  setTrimTime: (time: [number, number]) => void;
}

const VideoTrimBar = ({
  videoInfo,
  videoEditorConfig,
  setVideoCurrent,
  setTrimTime,
}: VideoTrimBarProps) => {
  return (
    <Slider
      range={{ draggableTrack: true }}
      max={videoInfo.duration}
      step={1}
      tipFormatter={(v) => formatTimeDuration(v ?? 0, videoEditorConfig.speed)}
      value={videoEditorConfig.time}
      onChange={(v: [number, number]) => {
        setTrimTime(v);
        if (videoEditorConfig.time[0] !== v[0]) {
          setVideoCurrent(v[0] / 1000000);
        } else {
          setVideoCurrent(v[1] / 1000000);
        }
      }}
    />
  );
};

export default VideoTrimBar;
