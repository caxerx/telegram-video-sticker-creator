import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import type { UploadRequestOption } from "rc-upload/lib/interface";

export interface FileUploadRequestOption extends UploadRequestOption {
  file: Exclude<UploadRequestOption["file"], string>;
}

export interface FileUploadProps {
  onFileUpload: (f: FileUploadRequestOption) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <Upload.Dragger
          multiple={false}
          style={{
            padding: "1rem",
          }}
          customRequest={(f: UploadRequestOption) => {
            if (typeof f.file === "string") {
              return f.onError?.(new Error("Invalid file"));
            }
            onFileUpload(f as FileUploadRequestOption);
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Upload a video to start</p>
          <p className="ant-upload-hint">Drag or click to upload video</p>
        </Upload.Dragger>
      </div>
    </div>
  );
};
export default FileUpload;
