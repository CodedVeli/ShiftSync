import { useEffect } from 'react';
import { Modal, Form, Select, DatePicker, InputNumber, message } from 'antd';
import { useLocations } from '../../api/hooks/useLocations';
import { useSkills } from '../../api/hooks/useSkills';
import { useUpdateShift } from '../../api/hooks/useShifts';
import dayjs, { Dayjs } from 'dayjs';

interface EditShiftDialogProps {
  open: boolean;
  onClose: () => void;
  shift: {
    id: string;
    startTime: string;
    endTime: string;
    headcountNeeded: number;
    location: { id: string; name: string };
    requiredSkill: { id: string; name: string };
  } | null;
}

interface ShiftFormValues {
  locationId: string;
  dateTime: [Dayjs, Dayjs] | null;
  requiredSkillId: string;
  headcountNeeded: number;
}

export default function EditShiftDialog({ open, onClose, shift }: EditShiftDialogProps) {
  const [form] = Form.useForm<ShiftFormValues>();
  const { data: locations } = useLocations();
  const { data: skills } = useSkills();
  const updateShift = useUpdateShift();

  useEffect(() => {
    if (shift && open) {
      form.setFieldsValue({
        locationId: shift.location.id,
        dateTime: [dayjs(shift.startTime), dayjs(shift.endTime)],
        requiredSkillId: shift.requiredSkill.id,
        headcountNeeded: shift.headcountNeeded,
      });
    }
  }, [shift, open, form]);

  const handleSubmit = async (values: ShiftFormValues) => {
    if (!shift || !values.dateTime) {
      message.error('Please select date and time');
      return;
    }

    try {
      await updateShift.mutateAsync({
        id: shift.id,
        data: {
          locationId: values.locationId,
          startTime: values.dateTime[0].toISOString(),
          endTime: values.dateTime[1].toISOString(),
          requiredSkillId: values.requiredSkillId,
          headcountNeeded: values.headcountNeeded,
        },
      });
      message.success('Shift updated successfully');
      form.resetFields();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update shift';
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      title="Edit Shift"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={updateShift.isPending}
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
        >
          <InputNumber min={1} max={20} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
