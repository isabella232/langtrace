import Breadcrumb from '@/components/Breadcrumb';
import styles from './Traces.module.scss';
import React, { useEffect, useState } from 'react';
import { getTraces } from '@/services/traceService';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import StatsPanel from '@/components/FilterPanel';
import TraceTable from '../../components/TraceTable';
import { FeedbackCount, TracePercentile } from '@/models/traces_response';
import { TraceTreeNode } from '@/models/trace_detail_response';

const breadcrumbItems = [
  { name: 'Home', path: '/' },
  { name: 'Traces', path: undefined },
];

interface TracesProps {
  traces: TraceTreeNode[];
  latencyPercentiles: TracePercentile[];
  feedbackCounts: FeedbackCount[];
}

export interface FeedbackFilters {
  [key: string]: string[];
}


const Traces: React.FC<TracesProps> = ({ traces, latencyPercentiles, feedbackCounts }) => {
  const router = useRouter();

  const parseFeedbackFilters = (filters: string | string[] | undefined): FeedbackFilters => {
    if (typeof filters === 'string') {
      try {
        const feedbackFilters: FeedbackFilters = JSON.parse(filters);
        Object.keys(feedbackFilters).forEach(key => {
          feedbackFilters[key].sort();
        });
        return feedbackFilters;
      } catch {
        return {};
      }
    }
    return {};
  };


  const initialStartDate = router.query.startDate ? new Date(router.query.startDate as string) : null;
  const initialEndDate = router.query.endDate ? new Date(router.query.endDate as string) : null;
  const initialFeedbackFilters = parseFeedbackFilters(router.query.feedbackFilters);

  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [feedbackFilters, setFeedbackFilters] = useState<FeedbackFilters>(initialFeedbackFilters);
  const [inLast, setInLast] = useState<string | null>(null);


  useEffect(() => {
    if (
      startDate !== initialStartDate ||
      endDate !== initialEndDate ||
      JSON.stringify(feedbackFilters) !== JSON.stringify(initialFeedbackFilters)
    ) {
      const formattedStart = startDate?.toISOString();

      const formattedEnd = endDate?.toISOString();

      const newQuery = { ...router.query };

      if (formattedStart) {
        newQuery.startDate = formattedStart;
      } else {
        delete newQuery.startDate;
      }

      if (formattedEnd) {
        newQuery.endDate = formattedEnd;
      } else {
        delete newQuery.endDate;
      }

      if (inLast) {
        newQuery.inLast = inLast;
      } else {
        delete newQuery.inLast;
      }

      if (Object.keys(feedbackFilters).length > 0) {
        newQuery.feedbackFilters = JSON.stringify(feedbackFilters);
      } else {
        delete newQuery.feedbackFilters;
      }

      router.push({
        pathname: router.pathname,
        query: newQuery,
      });
    }
  }, [startDate, endDate, feedbackFilters, inLast]);

  const handlePredefinedRange = (range: string) => {
    const now = new Date();
    if (range === '1h') {
      setStartDate(new Date(now.getTime() - 60 * 60 * 1000));
      setEndDate(null);
    } else if (range === '3h') {
      setStartDate(new Date(now.getTime() - 3 * 60 * 60 * 1000));
      setEndDate(null);
    } else if (range === '12h') {
      setStartDate(new Date(now.getTime() - 12 * 60 * 60 * 1000));
      setEndDate(null);
    } else if (range === '24h') {
      setStartDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      setEndDate(null);
    } else if (range === '7d') {
      setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      setEndDate(null);
    } else if (range === '30d') {
      setStartDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      setEndDate(null);
    }
  };

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handlePredefinedRange(event.target.value);
    setInLast(event.target.value);
  };

  const handleFeedbackSelect = (key: string, value: string, isSelected: boolean) => {
    setFeedbackFilters(prevFilters => {
      const newFilters = { ...prevFilters };

      if (isSelected) {
        if (!newFilters[key]) {
          newFilters[key] = [];
        }
        if (!newFilters[key].includes(value)) {
          newFilters[key].push(value);
        }
      } else {
        newFilters[key] = (newFilters[key] ?? []).filter(v => v !== value);
        if (newFilters[key].length === 0) {
          delete newFilters[key];
        }
      }

      return newFilters;
    });
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems}/>
      <div className={styles.tracesContainer}>
        <TraceTable onChange={handleDropdownChange} traces={traces}/>
        <StatsPanel latencyPercentiles={latencyPercentiles}
                    recordsCount={traces.length}
                    feedbackCounts={feedbackCounts}
                    feedbackFilters={feedbackFilters}
                    onFeedbackSelect={handleFeedbackSelect}
        />
      </div>
    </div>
  );
};


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { startDate, endDate, feedbackFilters, inLast } = query;

  // Get start and end dates from query params inLast

  const data = await getTraces(startDate as string, endDate as string, feedbackFilters as string);

  return {
    props: {
      traces: data.traces,
      latencyPercentiles: data.latency_percentiles,
      feedbackCounts: data.feedback_counts
    }
  };
}

export default Traces;
