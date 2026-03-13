import { useState } from 'react';
import { Modal, Select, Alert, Tag, Spin, message, Button } from 'antd';
import { useUsers } from '../../api/hooks/useUsers';
import { useAssignStaff } from '../../api/hooks/useShifts';
import { useAuthStore } from '../../store/authStore';
import OverrideDialog from './OverrideDialog';

interface AssignStaffDialogProps {
  open: boolean;
  onClose: () => void;
  shift: {
    id: string;
    location: { id: string; name: string };
    requiredSkill: { id: string; name: string };
    startTime: string;
    endTime: string;
  } | null;
  recommendedStaffId?: string | null;
}

interface ValidationError {
  message: string;
  suggestions?: Array<{
    staffId: string;
    staffName: string;
    reason: string;
  }>;
}

export default function AssignStaffDialog({ open, onClose, shift, recommendedStaffId }: AssignStaffDialogProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(recommendedStaffId || '');
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const { data: users, isLoading: usersLoading } = useUsers();
  const { user } = useAuthStore();
  const assignStaff = useAssignStaff();

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const handleAssign = async () => {
    if (!shift || !selectedStaffId) return;

    try {
      setValidationError(null);
      await assignStaff.mutateAsync({
        shiftId: shift.id,
        staffId: selectedStaffId,
      });
      message.success('Staff assigned successfully');
      setSelectedStaffId('');
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to assign staff';
      const suggestions = error?.response?.data?.suggestions;

      setValidationError({
        message: errorMessage,
        suggestions: suggestions,
      });
    }
  };

  const staffMembers = users?.filter((user: {
    role: string;
    staffProfile?: {
      skills: Array<{ id: string; name: string }>;
      certifiedLocations: Array<{ id: string; name: string }>;
    };
  }) => {
    if (user.role !== 'STAFF') return false;
    if (!user.staffProfile) return false;
    if (!shift) return true;

    const hasRequiredSkill = user.staffProfile.skills.some(
      (skill) => skill.id === shift.requiredSkill?.id
    );
    const isCertifiedAtLocation = user.staffProfile.certifiedLocations.some(
      (loc) => loc.id === shift.location?.id
    );

    return hasRequiredSkill && isCertifiedAtLocation;
  }) || [];

  return (
    <Modal
      title="Assign Staff to Shift"
      open={open}
      onCancel={() => {
        onClose();
        setSelectedStaffId('');
        setValidationError(null);
      }}
      onOk={handleAssign}
      confirmLoading={assignStaff.isPending}
      okText="Assign"
      okButtonProps={{ disabled: !selectedStaffId }}
    >
      {shift && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            <strong>Location:</strong> {shift.location?.name || 'N/A'}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <strong>Required Skill:</strong> <Tag color="blue">{shift.requiredSkill?.name || 'N/A'}</Tag>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <strong>Time:</strong> {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleString()}
          </div>
        </div>
      )}

      {validationError && (
        <Alert
          type="error"
          message="Assignment Failed"
          description={
            <div>
              <p>{validationError.message}</p>
              {validationError.suggestions && validationError.suggestions.length > 0 ? (
                <div className="mt-2">
                  <strong>Suggested alternatives:</strong>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {validationError.suggestions.map((staff) => (
                      <Tag
                        key={staff.staffId}
                        color="green"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setSelectedStaffId(staff.staffId);
                          setValidationError(null);
                        }}
                      >
                        {staff.staffName}
                        <div className="text-xs text-gray-600">{staff.reason}</div>
                      </Tag>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <Alert
                    type="warning"
                    message="No Available Alternatives"
                    description="No other qualified staff are available for this shift. You may need to adjust the shift time or find coverage manually."
                    showIcon
                  />
                  {isManager && selectedStaffId && (
                    <Button
                      type="primary"
                      danger
                      className="mt-3"
                      onClick={() => setOverrideDialogOpen(true)}
                    >
                      Manager Override
                    </Button>
                  )}
                </div>
              )}
            </div>
          }
          className="mb-4"
          closable
          onClose={() => setValidationError(null)}
        />
      )}

      {shift && (
        <div className="text-xs text-gray-500 mb-2">
          Showing {staffMembers.length} qualified staff with "{shift.requiredSkill?.name}" skill certified at {shift.location?.name}
        </div>
      )}

      <Select
        value={selectedStaffId || undefined}
        onChange={setSelectedStaffId}
        placeholder={staffMembers.length === 0 ? "No qualified staff available" : "Select staff member"}
        style={{ width: '100%' }}
        loading={usersLoading}
        disabled={staffMembers.length === 0}
        showSearch
        filterOption={(input, option) => {
          const label = String(option?.label ?? '');
          return label.toLowerCase().includes(input.toLowerCase());
        }}
        options={staffMembers.map((user: { id: string; firstName: string; lastName: string; email: string }) => ({
          value: user.id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        }))}
      />

      {!usersLoading && staffMembers.length === 0 && shift && (
        <Alert
          type="warning"
          message="No Qualified Staff Available"
          description={`No staff members have the "${shift.requiredSkill?.name}" skill and are certified at ${shift.location?.name}.`}
          className="mt-3"
        />
      )}

      {usersLoading && (
        <div className="text-center mt-4">
          <Spin />
        </div>
      )}

      <OverrideDialog
        open={overrideDialogOpen}
        onClose={() => {
          setOverrideDialogOpen(false);
          setValidationError(null);
        }}
        onSuccess={() => {
          setOverrideDialogOpen(false);
          setValidationError(null);
          setSelectedStaffId('');
          onClose();
        }}
        shift={shift}
        staffId={selectedStaffId}
        staffName={
          users?.find((u: any) => u.id === selectedStaffId)
            ? `${users.find((u: any) => u.id === selectedStaffId).firstName} ${
                users.find((u: any) => u.id === selectedStaffId).lastName
              }`
            : ''
        }
        constraintViolated={validationError?.message || ''}
      />
    </Modal>
  );
}
