import {CloudFunctionResponse} from '../types';
import {TrackerIssue, TrackerComponent} from '../providers/tracker.js';
import {config} from '../config.js';
import {transformYfmToTelegramMarkdown} from './markdown.js';

interface FormatIssueDescriptionOptions {
    debug?: boolean;
    linkExtractor?: (href: string) => Promise<string>
}

export function formatIssueDescription(issue: TrackerIssue, options: FormatIssueDescriptionOptions = {}) {
    let description = issue.description!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (issue.components) {
        const components = issue.components
            .map((component) => `#${component.display}`)
            .join(' ');

        description += `\n\n${components}`;
    }

    if (options.debug) {
        description += [
            '\n\n⎯⎯⎯⎯⎯  ✄ ⎯⎯⎯⎯⎯',
            '**Служебная информация:**',
            `- [Задача в трекере](https://tracker.yandex.ru/${issue.key})`,
            `- Статус: \`${issue.status!.display}\``, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            getApproversByComponents(issue.components)
        ].join('\n');
    }

    return transformYfmToTelegramMarkdown(description, {
        linkExtractor: options.linkExtractor
    });
}

function getApproversByComponents(components: TrackerComponent[] = []) {
    const approvers: string[] = [];

    components
        .forEach((component) => {
            const componentApprovers = config['app.debug.components.approvers'][component.display];
            if (componentApprovers) {
                approvers.push(...componentApprovers);
            }
        });

    return approvers.length ?
        `- Получить \`ОК\` от ${approvers.join(', ')}` :
        '';
}

export function formatCloudFunctionResponse(body: unknown) {
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'isBase64Encoded': false,
        'body': body
    } as CloudFunctionResponse;
}

export function toISOStringWithTimezone(date: Date) {
    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = (num: number) =>(num < 10 ? '0' : '') + num;

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
  }
