import Breadcrumb from '@/components/Breadcrumb';
import styles from './Traces.module.scss';
import React, { ReactElement, useEffect, useState } from 'react';
import { getTraces } from '@/services/traceService';
import {
  BsCheckCircleFill, BsClockFill,
  BsExclamationCircleFill,
  BsFillQuestionCircleFill
} from 'react-icons/bs';
import { IconType } from 'react-icons/lib';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import FilterPanel from '@/components/FilterPanel';
import TraceTable from '../../components/TraceTable';
import { TracePercentile } from '@/models/traces_response';

const breadcrumbItems = [
  { name: 'Home', path: '/' },
  { name: 'Traces', path: undefined },
];

interface Trace {
  run_id: string;
  name: string;
  error?: string;
  start_time: string;
  end_time?: string;
  latency: number;
}

interface TracesProps {
  traces: Trace[];
  latencyPercentiles: TracePercentile[];
}

interface DateTime {
  date: string;
  time: string;
}

function convertToDateTime(timestamp: string): DateTime {
  const dateObj = new Date(timestamp);

  const date = dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const time = dateObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return { date, time };
}


const handleRowClick = (run_id: string) => {
  window.location.href = `/traces/${run_id}`;
};

function getStatusForTrace(trace: Trace): ReactElement<IconType> {
  if (trace.error) {
    return <BsExclamationCircleFill color={'red'}/>;
  } else if (trace.end_time) {
    return <BsCheckCircleFill color={'green'}/>;
  } else if (trace.end_time === undefined || trace.end_time === null) {
    return <BsClockFill color={'grey'}/>;
  } else {
    return <BsFillQuestionCircleFill color={'orange'}/>
      ;
  }
}


const Traces: React.FC<TracesProps> = ({ traces, latencyPercentiles }) => {
  const [startDate, setStartDateDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    const formattedStart = startDate?.toISOString();
    const formattedEnd = endDate?.toISOString();

    const newQuery = { ...router.query };

    if (formattedStart) {
      newQuery.startDate = formattedStart;
    }

    if (formattedEnd) {
      newQuery.endDate = formattedEnd;
    }

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
    //TODO Do i need router in here?
  }, [startDate, endDate]);

  const handlePredefinedRange = (range: string) => {
    const now = new Date();
    if (range === '24h') {
      setStartDateDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      setEndDate(null);
    } else if (range === '7d') {
      setStartDateDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      setEndDate(null);
    }
  };

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handlePredefinedRange(event.target.value);
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems}/>
      <div className={styles.tracesContainer}>
        <TraceTable onChange={handleDropdownChange} elements={traces.map(trace => {
          const runDate = convertToDateTime(trace.start_time);
          return (
            <tr key={trace.run_id} onClick={() => handleRowClick(trace.run_id)}
                className={styles.clickableRow}>
              <td>{trace.run_id}</td>
              <td className={styles.fullWidthTable__columnIcon}>{getStatusForTrace(trace)}</td>
              <td>{trace.name}</td>
              <td>{runDate.date} @ {runDate.time}</td>
              <td>{trace.latency ? `${(trace.latency / 1000).toFixed(2)}s` : '-'}</td>
            </tr>
          );
        })}/>
        <FilterPanel latencyPercentiles={latencyPercentiles} recordsCount={traces.length}/>
      </div>
    </div>
  );
};


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { startDate, endDate } = query;

  const data = await getTraces(startDate as string, endDate as string);

  return { props: { traces: data.traces, latencyPercentiles: data.latency_percentiles } };
}

export default Traces;
