import got from 'got';
import {config} from '../config';
import {HttpMethod} from '../types';

export interface TrackerIssue {
    key?: string;
    summary?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;

    [key: string]: string | undefined;
}

export class TrackerProvider {
    private readonly _host = config['tracker.host'];

    private async _request(method: HttpMethod, path: string, data?: TrackerIssue) {
        const response = await got({
            method: method,
            url: `${this._host}${path}`,
            headers: {
                Authorization: `OAuth ${config['tracker.oauthToken']}`,
                'X-Org-ID': config['tracker.orgId']
            },
            json: data,
            responseType: 'json'
        });
        return response.body;
    }

    async getIssueByKey(key: string) {
        return this._request('GET', `/v2/issues/${key}`) as Promise<TrackerIssue>;
    }

    async editIssue(key: string, data: TrackerIssue) {
        return this._request('PATCH', `/v2/issues/${key}`, data) as Promise<TrackerIssue>;
    }
}
