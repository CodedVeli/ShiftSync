import { List, Card, Tag, Button, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import Layout from '../components/layout/Layout';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../api/hooks/useNotifications';
import { format } from 'date-fns';

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      SHIFT_ASSIGNED: 'blue',
      SHIFT_CHANGED: 'orange',
      SHIFT_REMOVED: 'red',
      SCHEDULE_PUBLISHED: 'green',
      SWAP_REQUESTED: 'purple',
      SWAP_ACCEPTED: 'cyan',
      SWAP_APPROVED: 'green',
      SWAP_CANCELLED: 'default',
      OVERTIME_WARNING: 'orange',
      AVAILABILITY_CONFLICT: 'red',
    };
    return colors[type] || 'default';
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your shift changes and requests</p>
        </div>
        {notifications && notifications.length > 0 && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
            loading={markAllAsReadMutation.isPending}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-12">
            <Spin size="large" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(notification: any) => (
              <List.Item
                key={notification.id}
                className={notification.isRead ? 'opacity-60' : 'bg-blue-50'}
                actions={[
                  !notification.isRead && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      loading={markAsReadMutation.isPending}
                    >
                      Mark as read
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<BellOutlined />}
                  title={
                    <div className="flex items-center gap-2">
                      <span className={notification.isRead ? 'text-gray-600' : 'font-semibold'}>
                        {notification.title}
                      </span>
                      <Tag color={getNotificationColor(notification.type)}>
                        {notification.type.replace(/_/g, ' ')}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p className={notification.isRead ? 'text-gray-500' : 'text-gray-700'}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description="No notifications yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </Layout>
  );
}
