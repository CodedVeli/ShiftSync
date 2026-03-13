import { useState } from 'react';
import { Card, Select, Tag, Row, Col, Empty, Spin, Button, message, Dropdown, Modal, DatePicker, Tooltip } from 'antd';
import { ClockCircleOutlined, UserOutlined, StarOutlined, CheckCircleOutlined, PlusOutlined, TeamOutlined, SearchOutlined, MoreOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useShifts, useUnassignStaff, useDeleteShift, usePublishSchedule } from '../api/hooks/useShifts';
import { useLocations } from '../api/hooks/useLocations';
import { useUsers } from '../api/hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import { useScheduleUpdates } from '../api/hooks/useSocket';
import Layout from '../components/layout/Layout';
import CreateShiftDialog from '../components/shifts/CreateShiftDialog';
import EditShiftDialog from '../components/shifts/EditShiftDialog';
import AssignStaffDialog from '../components/shifts/AssignStaffDialog';
import CreateSwapDialog from '../components/shifts/CreateSwapDialog';
import { format, startOfWeek, endOfWeek, differenceInHours, isSameWeek } from 'date-fns';
import { isWithinCutoff, getHoursUntilShift } from '../lib/datetime';

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  isPremium: boolean;
  isPublished: boolean;
  headcountNeeded: number;
  location: { id: string; name: string };
  requiredSkill: { id: string; name: string };
  assignments?: Array<{
    id: string;
    staffId: string;
    staff: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

interface Location {
  id: string;
  name: string;
}

export default function Schedule() {
  const { user } = useAuthStore();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [recommendedStaffId, setRecommendedStaffId] = useState<string | null>(null);

  const { data: locations, isLoading: locationsLoading } = useLocations();
  const { data: shifts, isLoading: shiftsLoading } = useShifts({
    locationId: selectedLocation || undefined,
  });
  const { data: users } = useUsers();
  const unassignStaff = useUnassignStaff();
  const deleteShift = useDeleteShift();
  const publishSchedule = usePublishSchedule();

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  useScheduleUpdates();

  const groupedShifts = shifts?.reduce((acc: Record<string, Shift[]>, shift: Shift) => {
    const date = format(new Date(shift.startTime), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(shift);
    return acc;
  }, {});

  const handleAssignClick = (shift: Shift) => {
    setSelectedShift(shift);
    setAssignDialogOpen(true);
  };

  const handleUnassign = async (shiftId: string, staffId: string, staffName: string) => {
    try {
      await unassignStaff.mutateAsync({ shiftId, staffId });
      message.success(`Unassigned ${staffName} from shift`);
    } catch (error) {
      message.error('Failed to unassign staff');
    }
  };

  const calculateWeeklyHours = (staffId: string): number => {
    if (!shifts) return 0;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate >= weekStart && shiftDate <= weekEnd &&
               shift.assignments?.some(a => a.staffId === staffId);
      })
      .reduce((total, shift) => {
        return total + differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      }, 0);
  };

  const handleFindCoverage = (shift: Shift) => {
    if (!users) return;

    const qualified = users.filter((u: any) => {
      if (u.role !== 'STAFF' || !u.staffProfile) return false;

      const hasSkill = u.staffProfile.skills?.some(
        (s: any) => s.id === shift.requiredSkill.id
      );
      const isCertified = u.staffProfile.certifiedLocations?.some(
        (l: any) => l.id === shift.location.id
      );

      return hasSkill && isCertified;
    });

    const sorted = qualified.sort((a: any, b: any) => {
      return calculateWeeklyHours(a.id) - calculateWeeklyHours(b.id);
    });

    if (sorted.length > 0) {
      setRecommendedStaffId(sorted[0].id);
      message.info(`Recommended: ${sorted[0].firstName} ${sorted[0].lastName} (${calculateWeeklyHours(sorted[0].id)}h this week)`);
    } else {
      message.warning('No qualified staff found for this shift');
    }

    setSelectedShift(shift);
    setAssignDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setEditDialogOpen(true);
  };

  const handleDeleteShift = (shift: Shift) => {
    const assignmentCount = shift.assignments?.length || 0;

    Modal.confirm({
      title: 'Delete Shift',
      icon: <ExclamationCircleOutlined />,
      content: assignmentCount > 0
        ? `This shift has ${assignmentCount} staff assigned. Are you sure you want to delete it?`
        : 'Are you sure you want to delete this shift?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteShift.mutateAsync(shift.id);
          message.success('Shift deleted successfully');
        } catch (error) {
          message.error('Failed to delete shift');
        }
      },
    });
  };

  const handlePublishWeek = async () => {
    if (!selectedWeek || !shifts) return;

    const weekShifts = shifts.filter((s: Shift) =>
      isSameWeek(new Date(s.startTime), selectedWeek, { weekStartsOn: 0 }) && !s.isPublished
    );

    if (weekShifts.length === 0) {
      message.warning('No unpublished shifts in selected week');
      return;
    }

    try {
      await publishSchedule.mutateAsync(weekShifts.map((s: Shift) => s.id));
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  const canEditShift = (shift: Shift): boolean => {
    if (!shift.isPublished) return true;
    return !isWithinCutoff(shift.startTime, 48);
  };

  const handleRequestSwap = (shift: Shift) => {
    setSelectedShift(shift);
    setSwapDialogOpen(true);
  };

  const isAssignedToShift = (shift: Shift): boolean => {
    return shift.assignments?.some(a => a.staffId === user?.id) || false;
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600 mt-1">
              {isManager ? 'Create and manage shift schedules' : 'View your shift schedules'}
            </p>
          </div>
          <div className="flex gap-3">
            <Select
              value={selectedLocation || undefined}
              onChange={setSelectedLocation}
              placeholder="All Locations"
              style={{ width: 240 }}
              allowClear
              loading={locationsLoading}
            >
              {locations?.map((location: Location) => (
                <Select.Option key={location.id} value={location.id}>
                  {location.name}
                </Select.Option>
              ))}
            </Select>
            {isManager && (
              <>
                <DatePicker.WeekPicker
                  onChange={(date) => setSelectedWeek(date ? date.toDate() : null)}
                  placeholder="Select week to publish"
                  style={{ width: 200 }}
                />
                <Button
                  type="default"
                  icon={<CheckCircleOutlined />}
                  onClick={handlePublishWeek}
                  disabled={!selectedWeek}
                  loading={publishSchedule.isPending}
                >
                  Publish Week
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Shift
                </Button>
              </>
            )}
          </div>
        </div>

        {shiftsLoading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading shifts...</p>
          </div>
        ) : shifts && shifts.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedShifts || {}).map(([date, dayShifts]) => (
              <div key={date}>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </h2>
                <Row gutter={[16, 16]}>
                  {(dayShifts as Shift[]).map((shift: Shift) => {
                    const isFullyStaffed = (shift.assignments?.length || 0) >= shift.headcountNeeded;

                    return (
                      <Col xs={24} md={12} lg={8} key={shift.id}>
                        <Card
                          hoverable={isManager}
                          className="h-full"
                          bodyStyle={{ padding: '16px' }}
                        >
                          <div className="mb-3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">{shift.location.name}</h3>
                              <div className="flex gap-2 items-center">
                                <div className="flex gap-1">
                                  {shift.isPremium && <StarOutlined className="text-yellow-500" />}
                                  {shift.isPublished && <CheckCircleOutlined className="text-green-500" />}
                                </div>
                                {isManager && (
                                  <div className="flex items-center gap-1">
                                    {!canEditShift(shift) && (
                                      <Tooltip title={`Cannot edit within 48 hours of shift start (${getHoursUntilShift(shift.startTime)}h remaining)`}>
                                        <InfoCircleOutlined className="text-orange-500" />
                                      </Tooltip>
                                    )}
                                    <Dropdown
                                      menu={{
                                        items: [
                                          {
                                            key: 'edit',
                                            label: 'Edit Shift',
                                            icon: <EditOutlined />,
                                            onClick: () => handleEditShift(shift),
                                            disabled: !canEditShift(shift),
                                          },
                                          {
                                            key: 'delete',
                                            label: 'Delete Shift',
                                            icon: <DeleteOutlined />,
                                            danger: true,
                                            onClick: () => handleDeleteShift(shift),
                                            disabled: !canEditShift(shift),
                                          },
                                        ],
                                      }}
                                      trigger={['click']}
                                    >
                                      <Button type="text" size="small" icon={<MoreOutlined />} />
                                    </Dropdown>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <ClockCircleOutlined className="mr-1" />
                              {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                            </div>
                            <div className="flex gap-2">
                              <Tag color="blue">{shift.requiredSkill.name}</Tag>
                              {shift.isPremium && <Tag color="gold">Premium</Tag>}
                              {shift.isPublished && <Tag color="green">Published</Tag>}
                              {isFullyStaffed && <Tag color="success">Fully Staffed</Tag>}
                            </div>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                <UserOutlined /> {shift.assignments?.length || 0} / {shift.headcountNeeded}
                              </span>
                              {isManager && (
                                <div className="flex gap-2">
                                  {(shift.assignments?.length || 0) < shift.headcountNeeded && (
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<SearchOutlined />}
                                      onClick={() => handleFindCoverage(shift)}
                                    >
                                      Find Coverage
                                    </Button>
                                  )}
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<TeamOutlined />}
                                    onClick={() => handleAssignClick(shift)}
                                  >
                                    Assign Staff
                                  </Button>
                                </div>
                              )}
                              {!isManager && isAssignedToShift(shift) && (
                                <Button
                                  type="default"
                                  size="small"
                                  onClick={() => handleRequestSwap(shift)}
                                >
                                  Request Swap
                                </Button>
                              )}
                            </div>
                            {shift.assignments && shift.assignments.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {shift.assignments.map((assignment) => (
                                  <Tag
                                    key={assignment.id}
                                    color="default"
                                    closable={isManager}
                                    onClose={(e) => {
                                      e.preventDefault();
                                      handleUnassign(
                                        shift.id,
                                        assignment.staffId,
                                        `${assignment.staff.firstName} ${assignment.staff.lastName}`
                                      );
                                    }}
                                  >
                                    {assignment.staff.firstName} {assignment.staff.lastName}
                                  </Tag>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 italic">No staff assigned</div>
                            )}
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <Empty
              description={isManager ? 'No shifts created yet. Click "Create Shift" to get started.' : 'No shifts found'}
            />
          </Card>
        )}
      </div>

      {isManager && (
        <>
          <CreateShiftDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
          />
          <EditShiftDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedShift(null);
            }}
            shift={selectedShift}
          />
          <AssignStaffDialog
            open={assignDialogOpen}
            onClose={() => {
              setAssignDialogOpen(false);
              setSelectedShift(null);
              setRecommendedStaffId(null);
            }}
            shift={selectedShift}
            recommendedStaffId={recommendedStaffId}
          />
        </>
      )}

      {!isManager && (
        <CreateSwapDialog
          open={swapDialogOpen}
          onClose={() => {
            setSwapDialogOpen(false);
            setSelectedShift(null);
          }}
          shift={selectedShift}
        />
      )}
    </Layout>
  );
}
