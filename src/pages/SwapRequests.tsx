import { Table, Card, Tag, Button, Space, message } from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import Layout from '../components/layout/Layout';
import { useSwapRequests, useAcceptSwapRequest, useApproveSwapRequest, useCancelSwapRequest } from '../api/hooks/useSwapRequests';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

export default function SwapRequests() {
  const { user } = useAuthStore();
  const { data: requests, isLoading, refetch } = useSwapRequests();
  const acceptMutation = useAcceptSwapRequest();
  const approveMutation = useApproveSwapRequest();
  const cancelMutation = useCancelSwapRequest();

  const handleAccept = async (id: string) => {
    try {
      await acceptMutation.mutateAsync(id);
      message.success('Swap request accepted');
      refetch();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to accept swap request');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Swap request approved');
      refetch();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to approve swap request');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      message.success('Swap request cancelled');
      refetch();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to cancel swap request');
    }
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'orange', text: 'PENDING' },
      TARGET_ACCEPTED: { color: 'blue', text: 'ACCEPTED' },
      MANAGER_APPROVED: { color: 'green', text: 'APPROVED' },
      CANCELLED: { color: 'default', text: 'CANCELLED' },
      EXPIRED: { color: 'red', text: 'EXPIRED' },
    };
    const { color, text } = config[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'SWAP' ? 'cyan' : 'purple'}>{type}</Tag>
      ),
      filters: [
        { text: 'Swap', value: 'SWAP' },
        { text: 'Drop', value: 'DROP' },
      ],
      onFilter: (value: any, record: any) => record.type === value,
    },
    {
      title: 'Shift',
      key: 'shift',
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.shift?.location?.name}</div>
          <div className="text-sm text-gray-600">
            {format(new Date(record.shift?.startTime), 'MMM d, h:mm a')} - {format(new Date(record.shift?.endTime), 'h:mm a')}
          </div>
          <div className="text-xs text-gray-500">{record.shift?.requiredSkill?.name}</div>
        </div>
      ),
    },
    {
      title: 'Requester',
      key: 'requester',
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.requester?.firstName} {record.requester?.lastName}</div>
          <div className="text-sm text-gray-500">{record.requester?.email}</div>
        </div>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      render: (_: any, record: any) =>
        record.targetStaff ? (
          <div>
            <div className="font-medium">{record.targetStaff?.firstName} {record.targetStaff?.lastName}</div>
            <div className="text-sm text-gray-500">{record.targetStaff?.email}</div>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Accepted', value: 'TARGET_ACCEPTED' },
        { text: 'Approved', value: 'MANAGER_APPROVED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        const isRequester = record.requesterId === user?.id;
        const isTarget = record.targetStaffId === user?.id;
        const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

        return (
          <Space>
            {isRequester && record.status === 'PENDING' && (
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleCancel(record.id)}
              >
                Cancel
              </Button>
            )}
            {isTarget && record.status === 'PENDING' && record.type === 'SWAP' && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleAccept(record.id)}
              >
                Accept
              </Button>
            )}
            {isManager && (record.status === 'PENDING' || record.status === 'TARGET_ACCEPTED') && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
          <p className="text-gray-600 mt-1">Manage shift swap and drop requests</p>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={requests?.map((item: any) => ({ ...item, key: item.id }))}
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </Layout>
  );
}
