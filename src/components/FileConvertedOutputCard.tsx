import { Button, Card, Col, Row, Tooltip } from "antd";
import type { AppState } from "../utils/store";

interface FileConvertedOutputCardProps {
  outputFile: AppState["outputFile"];
  onConvertorReset: () => void;
}

const FileConvertedOutputCard = ({
  outputFile,
  onConvertorReset,
}: FileConvertedOutputCardProps) => {
  return (
    <Card
      size="default"
      title={
        <Tooltip
          title="Telegram video sticker has file size limit: 256KB"
          visible={outputFile.fileInfo.fileSize <= 256000 ? false : undefined}
        >
          <Button
            download="output.webm"
            type="link"
            href={outputFile.videoSrc ?? ""}
            danger={outputFile.fileInfo.fileSize > 256000 ? true : undefined}
          >
            Download Video ({Math.ceil(outputFile.fileInfo.fileSize / 1000)}KB)
          </Button>
        </Tooltip>
      }
      extra={
        <a href="#" onClick={onConvertorReset}>
          Close
        </a>
      }
      style={{ width: 300 }}
    >
      <Row>
        <Col span={24}>
          <video
            controls
            key={outputFile.videoSrc ?? ""}
            style={{ width: "100%" }}
          >
            <source src={outputFile.videoSrc ?? ""} />
          </video>
        </Col>
      </Row>
    </Card>
  );
};
export default FileConvertedOutputCard;
