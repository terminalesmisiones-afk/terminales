
import React from 'react';
import ScheduleManager from './ScheduleManager';

interface Schedule {
  id: number;
  company: string;
  destination: string;
  departure: string;
  arrival: string;
  frequency: string;
  platform: string;
}

interface TerminalSchedulesFormProps {
  terminalId?: number;
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
    <div onClick={(e) => e.stopPropagation()}>
      <ScheduleManager
        terminalId={terminalId}
        terminalName={terminalName}
        schedules={schedules}
        onSchedulesChange={onSchedulesChange}
      />
    </div>
  );
};

export default TerminalSchedulesForm;
