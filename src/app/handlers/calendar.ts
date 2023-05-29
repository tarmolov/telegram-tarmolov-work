import {config} from '../config.js';
import {TrackerEventPayload} from '../types.js';
import {TrackerProvider} from '../providers/tracker.js';
import {CalendarProvider, CalendarEvent} from '../providers/calendar.js';
import {formatCloudFunctionResponse, toISOStringWithTimezone} from '../lib/utils.js';

const trackerProvider = new TrackerProvider();

export async function calendarHandler(payload: TrackerEventPayload) {
    const calendarProvider = await CalendarProvider.createClient();
    const issue = await trackerProvider.getIssueByKey(payload.key);

    const dateString = issue[config['tracker.fields.scheduledDateTime']] || issue[config['tracker.fields.publisDateTime']];
    const calendarEventId = issue[config['tracker.fields.calendarEventId']] as string;

    if (!dateString && calendarEventId) {
        await calendarProvider.deleteEvent(calendarEventId);
        await trackerProvider.editIssue(payload.key, {
            [config['tracker.fields.calendarEventId']]: null
        });
        return formatCloudFunctionResponse({});
    }

    const date = new Date(dateString as string || Date.now());

    // tracker runs schedulers only hourly; so make period in 1 hour for every event
    date.setMinutes(0);
    date.setSeconds(0);
    const startDateString = toISOStringWithTimezone(date);
    date.setHours(date.getHours() + 1);
    const endDateString = toISOStringWithTimezone(date);

    const event: CalendarEvent = {
        summary: `[${issue.status?.display}] ${issue.summary}`,
        location: `${config['tracker.url']}${payload.key}`,
        start: {
            'dateTime': startDateString,
            'timeZone': 'Europe/Moscow',
        },
        end: {
            'dateTime': endDateString,
            'timeZone': 'Europe/Moscow',
        }
    };

    if (!calendarEventId) {
        const response = await calendarProvider.addEvent(event);
        await trackerProvider.editIssue(payload.key, {
            [config['tracker.fields.calendarEventId']]: response.id
        });
    } else {
        await calendarProvider.updateEvent(calendarEventId, event);
    }

    return formatCloudFunctionResponse({});
 }
