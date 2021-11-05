import { Result } from './results.response';

export interface SearchResponse {
    pendingUrls: string[];
    results: Result[];
}
