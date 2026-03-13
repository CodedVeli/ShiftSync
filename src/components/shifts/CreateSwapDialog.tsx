import { useState } from 'react';
import { Modal, Radio, Select, message, Alert } from 'antd';
import { useStaff } from '../../api/hooks/useUsers';
import { useCreateSwapRequest } from '../../api/hooks/useSwapRequests';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

interface CreateSwapDialogProps {
  open: boolean;
  onClose: () => void;
  shift: {
    id: string;
    location: { name: string };
    requiredSkill: { name: string };
    startTime: string;
    endTime: string;
  } | null;
}

export default function CreateSwapDialog({ open, onClose, shift }: CreateSwapDialogProps) {
  const [swapType, setSwapType] = useState<'SWAP' | 'DROP'>('SWAP');
  const [targetStaffId, setTargetStaffId] = useState<string>('');
  const { user } = useAuthStore();
  const { data: staff } = useStaff();
  const createSwap = useCreateSwapRequest();

  const handleSubmit = async () => {
    if (!shift) return;

    if (swapType === 'SWAP' && !targetStaffId) {
      message.error('Please select a staff member to swap with');
      return;
    }

    try {
      await createSwap.mutateAsync({
        shiftId: shift.id,
        type: swapType,
        targetStaffId: swapType === 'SWAP' ? targetStaffId : undefined,
      });
      message.success(swapType === 'SWAP' ? 'Swap request created' : 'Drop request created');
      setSwapType('SWAP');
      setTargetStaffId('');
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create request';
      message.error(errorMessage);
    }
  };

  const staffMembers = staff?.filter((s: any) => s.id !== user?.id) || [];

  return (
    <Modal
      title="Request Shift Change"
      open={open}
      onCancel={() => {
        setSwapType('SWAP');
        setTargetStaffId('');
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={createSwap.isPending}
      okText="Submit Request"
    >
      {shift && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="font-medium mb-1">{shift.location.name}</div>
          <div className="text-sm text-gray-600">
            {format(new Date(shift.startTime), 'MMM d, h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
          </div>
          <div className="text-sm text-gray-500">{shift.requiredSkill.name}</div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Request Type</label>
        <Radio.Group value={swapType} onChange={(e) => setSwapType(e.target.value)}>
          <Radio value="SWAP">Swap with another staff</Radio>
          <Radio value="DROP">Drop shift (no replacement)</Radio>
        </Radio.Group>
      </div>

      {swapType === 'SWAP' && (
        <div>
          <label className="block text-sm font-medium mb-2">Swap With *</label>
          <Select
            value={targetStaffId || undefined}
            onChange={setTargetStaffId}
            placeholder="Select staff member"
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) => {
              const label = String(option?.label ?? '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            options={staffMembers.map((user: any) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName} (${user.email})`,
            }))}
          />
        </div>
      )}

      {swapType === 'DROP' && (
        <Alert
          type="warning"
          message="Drop Request"
          description="This shift will be unassigned and need manager approval before being dropped."
          showIcon
        />
      )}
    </Modal>
  );
}
