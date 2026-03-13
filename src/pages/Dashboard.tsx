import { Card, Row, Col, Statistic, List, Tag, Empty, Spin } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';
import { useShifts } from '../api/hooks/useShifts';
import { useLocations } from '../api/hooks/useLocations';
import { useOnDuty } from '../api/hooks/useDashboard';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: shifts } = useShifts();
  const { data: locations } = useLocations();
  const { data: onDutyData, isLoading: onDutyLoading } = useOnDuty();

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome back, {user?.firstName}!
      </h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={user?.role === 'STAFF' ? 'My Shifts' : 'Total Shifts'}
              value={shifts?.length || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={user?.role === 'STAFF' ? 'My Locations' : user?.role === 'MANAGER' ? 'Managed Locations' : 'All Locations'}
              value={locations?.length || 0}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Your Role"
              value={user?.role || 'N/A'}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: '20px', color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">On Duty Now</span>
            <Tag color="green" icon={<ClockCircleOutlined />}>LIVE</Tag>
          </div>
        }
        className="mb-6"
      >
        {onDutyLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : onDutyData && onDutyData.length > 0 ? (
          <div className="space-y-4">
            {onDutyData.map((locationData: any) => (
              <Card
                key={locationData.location.id}
                type="inner"
                title={
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{locationData.location.name}</div>
                      <div className="text-sm text-gray-500 font-normal">{locationData.location.address}</div>
                    </div>
                    <Tag color="success">{locationData.totalStaff} staff</Tag>
                  </div>
                }
              >
                <List
                  dataSource={locationData.shifts}
                  renderItem={(shift: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div className="flex justify-between items-center">
                            <Tag color="blue">{shift.requiredSkill}</Tag>
                            <span className="text-sm text-gray-500">
                              {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                            </span>
                          </div>
                        }
                        description={
                          <div className="flex flex-wrap gap-2 mt-2">
                            {shift.staff.map((staff: any) => (
                              <Tag key={staff.id} icon={<UserOutlined />}>
                                {staff.firstName} {staff.lastName}
                              </Tag>
                            ))}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="No staff currently on duty" />
        )}
      </Card>

      <Card title="Quick Actions">
        <Row gutter={16}>
          <Col xs={24} md={user?.role === 'STAFF' ? 24 : 12}>
            <a href="/schedule">
              <Card
                hoverable
                className="text-center"
                bodyStyle={{ padding: '24px' }}
              >
                <CalendarOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                <h3 className="font-semibold mt-3">View Schedule</h3>
                <p className="text-gray-500 text-sm mt-1">See all upcoming shifts</p>
              </Card>
            </a>
          </Col>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <Col xs={24} md={12}>
              <a href="/analytics">
                <Card
                  hoverable
                  className="text-center"
                  bodyStyle={{ padding: '24px' }}
                >
                  <UserOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  <h3 className="font-semibold mt-3">Analytics</h3>
                  <p className="text-gray-500 text-sm mt-1">View overtime and fairness data</p>
                </Card>
              </a>
            </Col>
          )}
        </Row>
      </Card>
    </Layout>
  );
}
