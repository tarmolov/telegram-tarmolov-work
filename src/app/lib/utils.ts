import {CloudFunctionResponse} from '../types';
import {TrackerIssue, TrackerComponent} from '../providers/tracker.js';
import {config} from '../config.js';
import {transformYfmToTelegramMarkdown} from './markdown.js';

export function formatIssueDescription(issue: TrackerIssue, debug?: boolean) {
    let description = issue.description!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (issue.components) {
        const components = issue.components
            .map((component) => `#${component.display}`)
            .join(' ');

        description += `\n\n${components}`;
    }

    if (debug) {
        description += [
            '\n\n⎯⎯⎯⎯⎯  ✄ ⎯⎯⎯⎯⎯',
            '**Служебная информация:**',
            `* [Задача в трекере](https://tracker.yandex.ru/${issue.key})`,
            getApproversByComponents(issue.components)
        ].join('\n');
    }

    return transformYfmToTelegramMarkdown(description);
}

function getApproversByComponents(components: TrackerComponent[] = []) {
    const approvers: string[] = [];

    components
        .forEach((component) => {
            const componentApprovers = config['tracker.components.approvers'][component.display];
            if (componentApprovers) {
                approvers.push(...componentApprovers);
            }
        });

    return approvers.length ?
        `* Получить \`ОК\` от ${approvers.join(', ')}` :
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
