import { LangtraceRepository } from '../repositories/langtrace_repository';
import { Document } from 'bson';
import { TracesResponse } from '../models/traces_response';

export class TraceService {
  private repository: LangtraceRepository;

  constructor() {
    this.repository = new LangtraceRepository();
  }

  async getTopLevelTraces(startDate?: Date, endDate?: Date): Promise<TracesResponse> {
    return {
      latency_percentiles: await this.repository.getLatencyPercentile(startDate, endDate),
      traces: await this.repository.getTraces(startDate, endDate)
    };
  }

  async getTraceTreeByRunId(traceId: string): Promise<Document | null> {
    const array = await this.repository.getTraceTreeById(traceId);
    if (!array) {
      return null;
    } else if (array.length > 1) {
      throw new Error('Trace not found');
    } else if (array.length == 0) {
      return null;
    } else {
      return array[0];
    }
  }
}
