import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../lib/socket';
import { message } from 'antd';

export const useSocket = (events: Record<string, (data: any) => void>) => {
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(events).forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket, events]);
};

export const useScheduleUpdates = () => {
  const queryClient = useQueryClient();

  useSocket({
    'schedule-updated': (data) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      if (data.action === 'created') {
        message.info('New shift created');
      } else if (data.action === 'updated') {
        message.info('Shift updated');
      } else if (data.action === 'deleted') {
        message.info('Shift deleted');
      }
    },
    'assignment-changed': () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    'shift-assigned': (data) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      message.success(`You have been assigned to a shift at ${data.shift.location.name}`);
    },
    'shift-unassigned': () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      message.warning('You have been unassigned from a shift');
    },
  });
};
