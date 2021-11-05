export interface ResultsResponse {
    results:     Result[];
    pendingUrls: string[];
}

export interface Result {
    url:            string;
    content:        Content;
    snippet:        string;
    name:           string;
    executionTime:  number[][];
}

export interface Content {
    data:       Data[];
    matching:   Matching;
}

export interface Data {
    html:       string;
    matching:   Matching;
}

export interface Matching {
    rate:     number;
    keywords: number;
    words:    number;
}
