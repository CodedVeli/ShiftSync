import { Modal, Form, Select, DatePicker, InputNumber, message } from 'antd';
import { useLocations } from '../../api/hooks/useLocations';
import { useSkills } from '../../api/hooks/useSkills';
import { useCreateShift } from '../../api/hooks/useShifts';

interface CreateShiftDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ShiftFormValues {
  locationId: string;
  dateTime: [Date, Date] | null;
  requiredSkillId: string;
  headcountNeeded: number;
}

export default function CreateShiftDialog({ open, onClose }: CreateShiftDialogProps) {
  const [form] = Form.useForm<ShiftFormValues>();
  const { data: locations } = useLocations();
  const { data: skills } = useSkills();
  const createShift = useCreateShift();

  const handleSubmit = async (values: ShiftFormValues) => {
    if (!values.dateTime) {
      message.error('Please select date and time');
      return;
    }

    try {
      await createShift.mutateAsync({
        locationId: values.locationId,
        startTime: values.dateTime[0].toISOString(),
        endTime: values.dateTime[1].toISOString(),
        requiredSkillId: values.requiredSkillId,
        headcountNeeded: values.headcountNeeded,
      });
      message.success('Shift created successfully');
      form.resetFields();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create shift';
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      title="Create New Shift"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={createShift.isPending}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="locationId"
          label="Location"
          rules={[{ required: true, message: 'Please select a location' }]}
        >
          <Select placeholder="Select location">
            {locations?.map((location: { id: string; name: string }) => (
              <Select.Option key={location.id} value={location.id}>
                {location.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dateTime"
          label="Date & Time"
          rules={[{ required: true, message: 'Please select date and time' }]}
        >
          <DatePicker.RangePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="requiredSkillId"
          label="Required Skill"
          rules={[{ required: true, message: 'Please select a skill' }]}
        >
          <Select placeholder="Select skill">
            {skills?.map((skill: { id: string; name: string }) => (
              <Select.Option key={skill.id} value={skill.id}>
                {skill.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="headcountNeeded"
          label="Headcount Needed"
          rules={[{ required: true, message: 'Please enter headcount' }]}
          initialValue={1}
        >
          <InputNumber min={1} max={20} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
