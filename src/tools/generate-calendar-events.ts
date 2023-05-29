#!/usr/bin/env node

// Add all scheduled or closed issues to calendar.
//
// For production do the following:
// 1. ENVIRONMENT=production make env
// 2. make build && ENVIRONMENT=production ./out/tools/generate-calendar-events.ts

import {getConfigByEnv} from '../app/config.js';
import {TrackerProvider} from '../app/providers/tracker.js';
import {calendarHandler} from '../app/handlers/calendar.js';

const trackerProvider = new TrackerProvider();
const config = getConfigByEnv('production');

async function generateCalendarEvents() {
    const queue = config['tracker.queue'];
    const filterQuery = `Queue: ${queue} AND (${queue}."Запланированное время публикации": !empty() OR Status: Closed)`;
    const issues = await trackerProvider.searchIssues(filterQuery);
    console.log(`Found ${issues.length} issues`);

    for (const issue of issues) {
        console.log(`Adding calendar event for ${config['tracker.url']}${issue.key}`)
        await calendarHandler({key: issue.key as string});
    }
}

(async () => {
    await generateCalendarEvents();
})()
