import { Button, Form, Switch } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

export interface CropperToolbarProps {
  setCropperEnabled: (enabled: boolean) => void;
  cropperEnabled: boolean;
  setAspectRatio: (aspectRatio: number) => void;
  currentAspectRatio: number;
}

const CropperToolbar = ({ setCropperEnabled, cropperEnabled, setAspectRatio, currentAspectRatio }: CropperToolbarProps) => {
  function handleAspectRatio(aspectRatio: number) {
    return () => setAspectRatio(aspectRatio);
  }

  return (
    <Form
      layout="inline"
      style={{
        padding: '20px',
      }}
    >
      <FormItem label="Crop">
        <Switch
          onChange={setCropperEnabled}
          checked={cropperEnabled}
        />
      </FormItem>
      {
              cropperEnabled && (
                <>
                  <FormItem>
                    <Button onClick={handleAspectRatio(NaN)}>
                      Custom
                    </Button>
                  </FormItem>

                  <FormItem>
                    <Button
                      onClick={handleAspectRatio(1)}
                    >
                      Square
                    </Button>
                  </FormItem>

                  <FormItem>
                    <Button onClick={handleAspectRatio(16 / 9)}>
                      16:9
                    </Button>
                  </FormItem>

                  <FormItem>
                    <Button onClick={handleAspectRatio(4 / 3)}>
                      4:3
                    </Button>
                  </FormItem>
                </>
              )
            }
    </Form>

  );
};

export default CropperToolbar;
