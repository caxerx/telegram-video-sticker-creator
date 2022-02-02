import { Button, Col, Form, InputNumber, Row, Slider, Tooltip } from "antd";
import type { ConvertSetting } from "../utils/types";

interface ConvertSettingFormProps {
  videoEditorConfig: ConvertSetting;
  onSettingUpdate: (setting: Partial<ConvertSetting>) => void;
  onPlay: () => void;
  onConvert: () => void;
}

const ConvertSettingForm = ({
  videoEditorConfig,
  onSettingUpdate,
  onPlay,
  onConvert,
}: ConvertSettingFormProps) => {
  return (
    <Form<ConvertSetting>
      name="basic"
      initialValues={{
        speed: 1.0,
        fps: 30,
        bitrate: 1200,
      }}
      autoComplete="off"
      style={{
        padding: "20px",
      }}
      onValuesChange={onSettingUpdate}
    >
      <>
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
          <Button type="primary" onClick={() => onPlay()}>
            Play Preview
          </Button>

          <Tooltip
            title="Telegram video sticker has video length limit: 3 seconds"
            visible={
              (videoEditorConfig.time[1] - videoEditorConfig.time[0]) /
                videoEditorConfig.speed <=
              3000000
                ? false
                : undefined
            }
          >
            <Button
              onClick={() => onConvert()}
              danger={
                (videoEditorConfig.time[1] - videoEditorConfig.time[0]) /
                  videoEditorConfig.speed >
                3000000
              }
            >
              Start Convert
            </Button>
          </Tooltip>
        </Form.Item>
      </>
    </Form>
  );
};

export default ConvertSettingForm;
