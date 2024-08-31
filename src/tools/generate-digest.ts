#!/usr/bin/env node

import {getConfigByEnv} from '../app/config.js';
import {TrackerProvider} from '../app/providers/tracker.js';
const trackerProvider = new TrackerProvider();

const config = getConfigByEnv('production');
const publishUrlFieldKey = config['tracker.fields.publishUrl'];

async function generateDigest(from: string, to: string) {
    const filterQuery = `Queue: BLOG Components: ! дайджесты Resolution: changed(to: Fixed date: ${from} .. ${to}) "Sort By": Created`;
    const issues = await trackerProvider.searchIssues(filterQuery);
    console.log(filterQuery);
    console.log(`Found ${issues.length}`);

    const issuesByComponent = issues.reduce((result, issue) => {
        const components = (issue.components || []).map((component) => component.display);

        components.forEach((component) => {
            if (!result[component]) {
                result[component] = [];
            }

            result[component].push(`[${issue.summary}](${issue[publishUrlFieldKey]})`);
        });

        return result;
    }, {} as {[key: string]: string[];});

    let result = `**Дайджест ${from}—${to}**`;
    Object.keys(issuesByComponent).sort().forEach((key) => {
        const value = issuesByComponent[key];
        result += `\n\n**${capitalizeString(key)}**\n${value.map((item) => `* ${item}`).join('\n')}`;
    })

    return result;
}

function capitalizeString(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

(async () => {
    // const digest = await generateDigest('07.09.2022', '31.12.2022');
    // const digest = await generateDigest('01.01.2023', '31.03.2023');
    // const digest = await generateDigest('01.04.2023', '30.06.2023');
    // const digest = await generateDigest('01.07.2023', '31.12.2023');
    // const digest = await generateDigest('01.01.2024', '31.03.2024');
    const digest = await generateDigest('01.04.2024', '30.06.2024');
    console.log(digest);
})()
