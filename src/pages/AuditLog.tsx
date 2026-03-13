import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/client';
import { format } from 'date-fns';

export default function AuditLog() {
  const [limit, setLimit] = useState(50);
  const { data: auditLogs, isLoading, isError, error } = useQuery({
    queryKey: ['audit', limit],
    queryFn: () => auditApi.getAll(limit),
  });

  console.log('AuditLog render:', { auditLogs, isLoading, isError, error });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-red-500">Error loading audit logs: {(error as Error)?.message || 'Unknown error'}</p>
          </div>
        ) : auditLogs && auditLogs.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {auditLogs.map((log: any) => (
                <li key={log.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                        <span className="text-sm text-gray-500">
                          {log.entityType} ID: {log.entityId?.slice(0, 8)}...
                        </span>
                      </div>
                      {log.user ? (
                        <p className="text-sm text-gray-600">
                          By: {log.user.firstName} {log.user.lastName} ({log.user.email})
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">By: Unknown User</p>
                      )}
                      {log.shift && log.shift.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          Shift at {log.shift.location.name} -{' '}
                          {format(new Date(log.shift.startTime), 'MMM d, h:mm a')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No audit logs found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
