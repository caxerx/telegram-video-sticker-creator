export const worker = new Worker('ffprobe-wasm/ffprobe-worker.js');

export function getFileInfo(file: File) {
  return new Promise((resolve, reject) => {
    try {
      worker.onmessage = (m) => {
        resolve(m.data);
      };
      worker.onerror = (m) => {
        worker.postMessage(['clean_up']);
        reject(m);
      };
      worker.postMessage(['get_file_info', file]);
    } catch (e) {
      reject(e);
    }
  });
}

export function getFrames(file: File, frame: number) {
  return new Promise((resolve, reject) => {
    try {
      worker.onmessage = (m) => {
        resolve(m.data);
      };
      worker.onerror = (m) => {
        worker.postMessage(['clean_up']);
        reject(m);
      };
      worker.postMessage(['get_frames', file, frame]);
    } catch (e) {
      reject(e);
    }
  });
}

