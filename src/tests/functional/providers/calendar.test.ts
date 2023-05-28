/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {strict as assert} from 'assert';
import {toISOStringWithTimezone} from '../../../app/lib/utils.js';
import {CalendarProvider} from '../../../app/providers/calendar.js';

function createCalendarEventPayload()  {
    const date = new Date();
    const startDateString = toISOStringWithTimezone(date);
    date.setHours(date.getHours() + 1);
    const endDateString = toISOStringWithTimezone(date);

    return {
        summary: 'Test event',
        location: 'https://tracker.yandex.ru/BLOGTEST-1',
        start: {
            'dateTime': startDateString,
            'timeZone': 'Europe/Moscow',
        },
        end: {
            'dateTime': endDateString,
            'timeZone': 'Europe/Moscow',
        }
    };
}

describe('providers/calendar', () => {
    let calendarProvider: CalendarProvider;
    let eventId: string;
    before(async () => {
        calendarProvider = await CalendarProvider.createClient();
    });

    afterEach(async () => calendarProvider.deleteEvent(eventId));

    it('should create an event', async () => {
        const payload = createCalendarEventPayload();
        const event = await calendarProvider.addEvent(payload);
        eventId = event.id!;
        assert.equal(event.summary, 'Test event');
    });

    it('should edit an event', async () => {
        const payload = createCalendarEventPayload();
        const event = await calendarProvider.addEvent(payload);
        eventId = event.id!;

        const updatedEvent = await calendarProvider.updateEvent(eventId, {
            summary: 'Updated event'
        });
        assert.equal(updatedEvent.summary, 'Updated event');
    });
});
