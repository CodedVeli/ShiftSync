import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useMyAvailability, useCreateAvailability, useDeleteAvailability } from '../api/hooks/useAvailability';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function Availability() {
  const { data: availabilities, isLoading } = useMyAvailability();
  const createAvailability = useCreateAvailability();
  const deleteAvailability = useDeleteAvailability();

  const [showForm, setShowForm] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAvailability.mutateAsync({
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: true,
      });
      setShowForm(false);
      setStartTime('09:00');
      setEndTime('17:00');
    } catch (error) {
      console.error('Failed to create availability:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this availability?')) {
      await deleteAvailability.mutateAsync(id);
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Availability'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Availability</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createAvailability.isPending}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createAvailability.isPending ? 'Adding...' : 'Add Availability'}
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : availabilities && availabilities.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {availabilities.map((avail: any) => (
                <li key={avail.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {avail.isException
                        ? `Exception: ${new Date(avail.exceptionDate).toLocaleDateString()}`
                        : DAYS_OF_WEEK[avail.dayOfWeek]?.label || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {avail.startTime} - {avail.endTime}
                      {avail.isAvailable ? '' : ' (Unavailable)'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(avail.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No availability set. Add your available times to help managers schedule you.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
