
import React from 'react';
import ScheduleManager from './ScheduleManager';
import ErrorBoundary from '../ErrorBoundary';

interface Schedule {
  id: string | number;
  company: string;
  destination: string;
  remarks: string;
  departure_mon_fri: string;
  departure_sat: string;
  departure_sun: string;
  platform?: string;
}

interface TerminalSchedulesFormProps {
  terminalId?: number | string;
  terminalName: string;
  schedules: Schedule[];
  onSchedulesChange: (schedules: Schedule[]) => void;
}

const TerminalSchedulesForm: React.FC<TerminalSchedulesFormProps> = ({
  terminalId,
  terminalName,
  schedules,
  onSchedulesChange
}) => {
  return (
    <ErrorBoundary>
      <ScheduleManager
        terminalId={terminalId}
        terminalName={terminalName}
        schedules={schedules}
        onSchedulesChange={onSchedulesChange}
      />
    </ErrorBoundary>
  );
};

export default TerminalSchedulesForm;
