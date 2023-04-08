#!/usr/bin/env node

import {TrackerProvider} from '../app/providers/tracker.js';
const trackerProvider = new TrackerProvider();

async function generateDigest(from: string, to: string) {
    const filterQuery = `Queue: BLOG Resolution: empty() Status: Открыт`;
    const issues = await trackerProvider.searchIssues(filterQuery);
    console.log(filterQuery);
    console.log(`Found ${issues.length}`);

    const issuesByComponent = issues.reduce((result, issue) => {
        const components = (issue.components || []).map((component) => component.display);

        components.forEach((component) => {
            if (!result[component]) {
                result[component] = [];
            }

            result[component].push(`${issue.summary}`);
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
    const digest = await generateDigest('07.09.2022', '31.12.2022')
    console.log(digest)
})()
