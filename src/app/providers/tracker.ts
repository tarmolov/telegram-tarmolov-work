import got from 'got';

export class TrackerProvider {
    private readonly _host = 'https://api.tracker.yandex.net/';

    private async _request(path: string) {
        return await got({
            url: `${this._host}${path}`,
            headers: {
                Authorization: `OAuth ${process.env.TRACKER_OAUTH_TOKEN}`,
                'X-Org-ID': process.env.TRACKER_ORG_ID
            },
            responseType: 'json'
        });
    }
}
