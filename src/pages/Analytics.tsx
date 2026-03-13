import { useState } from 'react';
import { Table, Card, Statistic, Row, Col, Select, Tag } from 'antd';
import { UserOutlined, AlertOutlined, WarningOutlined } from '@ant-design/icons';
import Layout from '../components/layout/Layout';
import { useOvertimeAnalytics, useFairnessAnalytics } from '../api/hooks/useAnalytics';
import { useLocations } from '../api/hooks/useLocations';

export default function Analytics() {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const { data: locations } = useLocations();
  const { data: overtimeResponse, isLoading: overtimeLoading } = useOvertimeAnalytics(
    selectedLocation ? { locationId: selectedLocation } : undefined
  );
  const { data: fairnessResponse, isLoading: fairnessLoading } = useFairnessAnalytics(
    selectedLocation ? { locationId: selectedLocation } : undefined
  );

  const overtimeData = overtimeResponse?.staffData || [];
  const fairnessData = fairnessResponse?.staffData || [];
  
  const totalStaff = overtimeData.length;
  const overtimeCount = overtimeData.filter((s: any) => s.isOvertime).length;
  const warningCount = overtimeData.filter((s: any) => s.isApproachingLimit && !s.isOvertime).length;

  const overtimeColumns = [
    {
      title: 'Staff Member',
      key: 'staff',
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.staff.firstName} {record.staff.lastName}</div>
          <div className="text-gray-500 text-sm">{record.staff.email}</div>
        </div>
      ),
    },
    {
      title: 'Weekly Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours: number) => <span className="font-semibold">{hours.toFixed(1)}h</span>,
      sorter: (a: any, b: any) => a.totalHours - b.totalHours,
    },
    {
      title: 'Overtime',
      dataIndex: 'overtimeHours',
      key: 'overtimeHours',
      render: (hours: number) => (
        hours > 0 ? <span className="text-red-600 font-semibold">{hours.toFixed(1)}h</span> : '-'
      ),
      sorter: (a: any, b: any) => a.overtimeHours - b.overtimeHours,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => {
        let color = 'green';
        let text = 'OK';
        
        if (record.isOvertime) {
          color = 'red';
          text = 'OVERTIME';
        } else if (record.isApproachingLimit) {
          color = 'orange';
          text = 'WARNING';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Overtime', value: 'overtime' },
        { text: 'Warning', value: 'warning' },
        { text: 'OK', value: 'ok' },
      ],
      onFilter: (value: any, record: any) => {
        if (value === 'overtime') return record.isOvertime;
        if (value === 'warning') return record.isApproachingLimit && !record.isOvertime;
        return !record.isOvertime && !record.isApproachingLimit;
      },
    },
  ];

  const fairnessColumns = [
    {
      title: 'Staff Member',
      key: 'staff',
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.staff.firstName} {record.staff.lastName}</div>
          <div className="text-gray-500 text-sm">{record.staff.email}</div>
        </div>
      ),
    },
    {
      title: 'Total Shifts',
      dataIndex: 'totalShifts',
      key: 'totalShifts',
      sorter: (a: any, b: any) => a.totalShifts - b.totalShifts,
    },
    {
      title: 'Premium Shifts',
      dataIndex: 'premiumShifts',
      key: 'premiumShifts',
      render: (count: number) => <Tag color="blue">{count}</Tag>,
      sorter: (a: any, b: any) => a.premiumShifts - b.premiumShifts,
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours: number) => <span className="font-semibold">{hours.toFixed(1)}h</span>,
      sorter: (a: any, b: any) => a.totalHours - b.totalHours,
    },
  ];

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor overtime, fairness, and schedule distribution</p>
          </div>
          <Select
            value={selectedLocation || undefined}
            onChange={setSelectedLocation}
            placeholder="All Locations"
            style={{ width: 240 }}
            allowClear
          >
            {locations?.map((location: any) => (
              <Select.Option key={location.id} value={location.id}>
                {location.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Staff"
                value={totalStaff}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Overtime Alerts"
                value={overtimeCount}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Warnings"
                value={warningCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Overtime Tracking" className="mb-6">
          <Table
            columns={overtimeColumns}
            dataSource={overtimeData.map((item: any, index: number) => ({ ...item, key: item.staff.id || index }))}
            loading={overtimeLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Card title="Schedule Fairness">
          <Table
            columns={fairnessColumns}
            dataSource={fairnessData.map((item: any, index: number) => ({ ...item, key: item.staff.id || index }))}
            loading={fairnessLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </Layout>
  );
}
