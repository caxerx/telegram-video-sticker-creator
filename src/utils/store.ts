import produce from 'immer';
import { processUint8Array } from './ffmpeg';
import type { ConvertSetting, VideoInfo } from './types';

export interface AppState {
  ffmpeg: {
    init: boolean;
  };
  cropper: {
    enabled: boolean;
    cropper: Cropper | null;
  };
  inputFile: {
    fileLoaded: boolean;
    videoInfo: VideoInfo;
    videoBlob: Blob | null;
    videoSrc: string | null;
  };
  outputFile: {
    fileLoaded: boolean;
    fileInfo: {
      fileSize: number;
    };
    videoBlob: Blob | null;
    videoSrc: string | null;
  };
  videoEditorConfig: ConvertSetting;
  convertor: {
    convertStatus: 'idle' | 'convertingTrim' | 'convertingEncode' | 'converted';
    progress: number;
  };
}

export type StoreAction = (state: AppState) => void;

export interface ReducerAction {
  type: 'setStateAction';
  action: (state: AppState) => AppState;
}

export function createAction(action: StoreAction): ReducerAction {
  return {
    type: 'setStateAction',
    action: (state: AppState) => produce(state, action),
  };
}

export function createReducer(defaultState: AppState) {
  return (state: AppState, action: ReducerAction): AppState => {
    if (action.type === 'setStateAction') {
      return action.action(state);
    }
    return defaultState;
  };
}

export function setFFmpegInit(): ReducerAction {
  return createAction((draft) => {
    draft.ffmpeg.init = true;
  });
}

export function setInputVideoInfo(videoInfo: VideoInfo): ReducerAction {
  return createAction((draft) => {
    draft.inputFile.videoInfo = videoInfo;
    draft.videoEditorConfig.time = [0, videoInfo.duration];
  });
}

export function setInputVideo(video: Uint8Array): ReducerAction {
  const [blob, src] = processUint8Array(video);
  return createAction((draft) => {
    draft.inputFile.fileLoaded = true;
    draft.inputFile.videoBlob = blob;
    draft.inputFile.videoSrc = src;
  });
}

export function setCropperEnabled(cropper: Cropper) {
  return createAction((draft) => {
    draft.cropper.enabled = true;
    draft.cropper.cropper = cropper;
  });
}

export function setCropperDisabled(cropper: Cropper | null) {
  cropper?.destroy();
  return createAction((draft) => {
    draft.cropper.enabled = false;
    draft.cropper.cropper = null;
  });
}

export function setConvertorStartConvert(): ReducerAction {
  return createAction((draft) => {
    draft.convertor.convertStatus = 'convertingTrim';
    draft.convertor.progress = 0;
  });
}

export function setConvertorConvertEncode(): ReducerAction {
  return createAction((draft) => {
    draft.convertor.convertStatus = 'convertingEncode';
    draft.convertor.progress = 0.5;
  });
}

export function setConvertorProgress(progress: number): ReducerAction {
  return createAction((draft) => {
    if (draft.convertor.convertStatus === 'convertingTrim') {
      draft.convertor.progress = progress;
    } else {
      draft.convertor.progress = progress + 0.5;
    }
  });
}

export function setConvertorFinished(): ReducerAction {
  return createAction((draft) => {
    draft.convertor.convertStatus = 'converted';
    draft.convertor.progress = 1;
  });
}

export function setOutputVideo(video: Uint8Array): ReducerAction {
  const [blob, src] = processUint8Array(video, { type: 'video/webm' });
  return createAction((draft) => {
    draft.outputFile.fileLoaded = true;
    draft.outputFile.fileInfo = {
      fileSize: blob.size,
    };
    draft.outputFile.videoBlob = blob;
    draft.outputFile.videoSrc = src;
  });
}

export function resetConvertor(): ReducerAction {
  return createAction((draft) => {
    draft.convertor.convertStatus = 'idle';
    draft.convertor.progress = 0;
  });
}

export function setVideoEditorConfigTrimTime(time: [number, number]): ReducerAction {
  return createAction((draft) => {
    draft.videoEditorConfig.time = time;
  });
}

export function setVideoConfig(videoConfig: Partial<ConvertSetting>): ReducerAction {
  return createAction((draft) => {
    Object.assign(draft.videoEditorConfig, videoConfig);
  });
}
