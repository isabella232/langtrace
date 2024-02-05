import React, { ReactElement, useEffect, useState } from 'react';
import styles from '@/components/TraceTable/trace-table.module.scss';
import { TraceTreeNode } from '@/models/trace-detail-response';
import LatencyChip from '@/components/LatencyChip';
import { IconType } from 'react-icons/lib';
import {
  BsCheckCircleFill,
  BsClockFill,
  BsExclamationCircleFill,
  BsFillQuestionCircleFill
} from 'react-icons/bs';
import { convertTimestampToDatetime } from '@/lib/utils/convert-timestamp-to-datetime';

function getStatusForTrace(trace: TraceTreeNode): ReactElement<IconType> {
  if (trace.error) {
    return <div className={styles.error}><BsExclamationCircleFill/></div>;
  } else if (trace.end_time) {
    return <div className={styles.completed}><BsCheckCircleFill/></div>;
  } else if (trace.end_time === undefined || trace.end_time === null) {
    return <div className={styles.inprogress}><BsClockFill/></div>;
  } else {
    return <div className={styles.warning}><BsFillQuestionCircleFill color={'orange'}/></div>;
  }
}

const handleRowClick = (project_id: string, run_id: string) => {
  window.location.href = `/projects/${project_id}/traces/${run_id}`;
};

interface TraceTableParams {
  projectId: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  traces: TraceTreeNode[];
  //TODO Add in filter for feedback
}

const TraceTable: React.FC<TraceTableParams> = ({ projectId, onChange, traces }) => {
  const [feedbackKeyFilter, _] = useState<string | null>(null);
  const [filteredTraces, setFilteredTraces] = useState<TraceTreeNode[]>(traces);


  useEffect(() => {
    if (feedbackKeyFilter) {
      setFilteredTraces(traces.filter(trace => trace.feedback?.key === feedbackKeyFilter));
    } else {
      setFilteredTraces(traces);
    }
  }, [feedbackKeyFilter, traces]);


  return <div className={styles.tableContainer}>
    <div className={styles.headerRow}>
      <div className={styles.filterContainer}>
        <select
          onChange={onChange}
          className={styles.dateDropdown}>
          <option value="">Select Range</option>
          <option value="1h">Last 1 hour</option>
          <option value="3h">Last 3 hours</option>
          <option value="12h">Last 12 hours</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
    </div>
    <table className={styles.fullWidthTable}>
      <thead>
        <tr>
          <th>Name</th>
          <th className={styles.fullWidthTable__tableColumnCentre}>Status</th>
          <th>Start Time</th>
          <th>Latency</th>
          <th>Feedback</th>
        </tr>
      </thead>
      <tbody>
        {filteredTraces.map(trace => {
          const runDate = convertTimestampToDatetime(trace.start_time);
          return <tr key={trace.run_id} onClick={() => handleRowClick(projectId, trace.run_id)}
            className={styles.clickableRow}>
            <td>{trace.name}</td>
            <td className={styles.columnIcon}>{getStatusForTrace(trace)}</td>
            <td>{runDate.date} @ {runDate.time}</td>
            <td><LatencyChip latency={trace.latency}/></td>
            <td>  {trace.feedback?.key
              ? `${trace.feedback.key}: ${
                trace.feedback.score !== undefined ? trace.feedback.score : trace.feedback.value
              }`
              : ''}</td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
};

export default TraceTable;