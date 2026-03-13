import { useState } from 'react';
import { Modal, Alert, Form, Input, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useOverrideAssignment } from '../../api/hooks/useShifts';
import { format } from 'date-fns';

interface OverrideDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  shift: {
    id: string;
    location: { id: string; name: string };
    startTime: string;
    endTime: string;
  } | null;
  staffId: string;
  staffName: string;
  constraintViolated: string;
}

export default function OverrideDialog({
  open,
  onClose,
  onSuccess,
  shift,
  staffId,
  staffName,
  constraintViolated,
}: OverrideDialogProps) {
  const [reason, setReason] = useState('');
  const override = useOverrideAssignment();

  const handleOverride = async () => {
    if (!shift || !reason.trim()) {
      message.error('Please provide a reason for the override');
      return;
    }

    try {
      await override.mutateAsync({
        shiftId: shift.id,
        staffId,
        reason,
        constraintViolated,
      });
      setReason('');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to override assignment';
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined className="text-orange-500 mr-2" />
          Manager Override Required
        </span>
      }
      open={open}
      onCancel={() => {
        setReason('');
        onClose();
      }}
      onOk={handleOverride}
      okText="Override and Assign"
      okButtonProps={{
        danger: true,
        disabled: !reason.trim(),
      }}
      confirmLoading={override.isPending}
      cancelText="Cancel"
    >
      <Alert
        type="warning"
        message="Constraint Violation"
        description={constraintViolated}
        showIcon
        className="mb-4"
      />
      {shift && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="mb-1">
            <strong>Staff:</strong> {staffName}
          </p>
          <p className="mb-1">
            <strong>Shift:</strong> {shift.location.name}
          </p>
          <p className="mb-0">
            <strong>Time:</strong> {format(new Date(shift.startTime), 'PPp')} -{' '}
            {format(new Date(shift.endTime), 'p')}
          </p>
        </div>
      )}
      <Form.Item label="Reason for Override" required>
        <Input.TextArea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter documented reason for overriding this constraint (e.g., critical staffing need, approved by director, etc.)"
        />
      </Form.Item>
    </Modal>
  );
}
