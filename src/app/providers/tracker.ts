import {promisify} from 'node:util';
import stream from 'node:stream';
import fs from 'node:fs';
import got from 'got';
import {config} from '../config';
import {HttpMethod} from '../types';
import {logger} from '../lib/logger';

export type TrackerIssue = TrackerIssueKnown & TrackerIssueUnKnown;
interface TrackerIssueKnown {
    key?: string;
    summary?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    components?: TrackerComponent[];
}
interface TrackerIssueUnKnown {
    [key: string]: string | undefined | object | null;
}

export interface TrackerComponent {
    id: string;
    display: string;
}

interface TrackerTransition {
    id: string;
    display: string;
}

interface TrackerLink {
    id: string;
    type: {
        id: string;
    };
    direction: 'inward' | 'outward';
    status: {
        id: string;
        key: string;
    };
}

interface TrackerAttachment {
    id: string;
    name: string;
    mimetype: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
}

const pipeline = promisify(stream.pipeline);

export class TrackerProvider {
    private readonly _host = config['tracker.host'];
    private readonly _defaultHeaders = {
        Authorization: `OAuth ${config['tracker.oauthToken']}`,
        'X-Org-ID': config['tracker.orgId']
    };

    private async _request(method: HttpMethod, path: string, data?: TrackerIssue) {
        logger.debug(`TRACKER REQ: ${method.toLocaleUpperCase()} ${this._host}${path} {${data || ''}}`);
        const response = await got({
            method: method,
            url: `${this._host}${path}`,
            headers: this._defaultHeaders,
            json: data,
            responseType: 'json'
        });
        logger.debug(`TRACKER RES: ${JSON.stringify(response.body)}`);
        return response.body;
    }

    // https://cloud.yandex.ru/docs/tracker/concepts/issues/get-issue
    async getIssueByKey(key: string) {
        return this._request('GET', `/v2/issues/${key}`) as Promise<TrackerIssue>;
    }

    // https://cloud.yandex.ru/docs/tracker/concepts/issues/patch-issue
    async editIssue(key: string, data: TrackerIssue) {
        return this._request('PATCH', `/v2/issues/${key}`, data) as Promise<TrackerIssue>;
    }

    // https://cloud.yandex.ru/docs/tracker/concepts/issues/get-links
    async getIssueLinks(key: string) {
        return this._request('GET', `/v2/issues/${key}/links`) as Promise<TrackerLink[]>;
    }

    // https://cloud.yandex.ru/docs/tracker/concepts/issues/get-transitions
    async getIssueTransitions(key: string) {
        return this._request('GET', `/v2/issues/${key}/transitions`) as Promise<TrackerTransition[]>;
    }

    // https://cloud.yandex.ru/docs/tracker/concepts/issues/new-transition
    async changeIssueStatus(key: string, transitionId: string, data?: TrackerIssue) {
        return this._request('POST', `/v2/issues/${key}/transitions/${transitionId}/_execute`, data) as Promise<TrackerTransition>;
    }

    // https://cloud.yandex.ru/docs/tracker/concepts/issues/get-attachments-list
    async getIssueAttachments(key: string) {
        return await this._request('GET', `/v2/issues/${key}/attachments`) as TrackerAttachment[];
    }

    // https://cloud.yandex.ru/docs/tracker/concepts/issues/get-attachment
    async downloadIssueAttachment(attachment: TrackerAttachment) {
        const filePath = `/tmp/${attachment.name}`;

        await pipeline(
            got.stream(attachment.content, {
                headers: this._defaultHeaders
            }),
            fs.createWriteStream(filePath)
        );

        return {
            path: filePath,
            mimeType: attachment.mimetype
        };
    }
}
