import {config} from '../config.js';
import {logger} from '../lib/logger.js';
import {google, Auth, calendar_v3 as Calendar} from 'googleapis';

export type CalendarEvent = Calendar.Schema$Event;

export class CalendarProvider {
    private readonly _calendar;
    private readonly _calendarId = config['calendar.calendarEventsId'];

    constructor() {
        this._calendar = google.calendar('v3');
    }

    // https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Resource$Events.html#insert
    async addEvent(event: Calendar.Schema$Event) {
        logger.debug(`CALENDAR REQ: insert ${JSON.stringify(event)}}`);
        const response = await this._calendar.events.insert({
            calendarId: this._calendarId,
            requestBody: event
        });

        logger.debug(`CALENDAR RES: ${JSON.stringify(response.data)}}`);
        return response.data;
    }

    // https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Resource$Events.html#patch
    async updateEvent(eventId: string, event: Calendar.Schema$Event) {
        logger.debug(`CALENDAR REQ: patch eventId=${eventId} ${JSON.stringify(event)}}`);
        const response = await this._calendar.events.patch({
            calendarId: this._calendarId,
            eventId,
            requestBody: event
        });

        logger.debug(`CALENDAR RES: ${JSON.stringify(response.data)}}`);
        return response.data;
    }

    // https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Resource$Events.html#delete
    async deleteEvent(eventId: string) {
        logger.debug(`CALENDAR REQ: delete eventId=${eventId}`);
        return await this._calendar.events.delete({
            calendarId: this._calendarId,
            eventId: eventId
        });
    }

    public static async createClient() {
        const keyFile: Auth.JWTInput = JSON.parse(Buffer.from(config['google.keyFile'], 'base64').toString());
        const jwtClient = new google.auth.JWT(
            keyFile.client_email,
            undefined,
            keyFile.private_key,
            [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events'
            ]
        );
        google.options({auth: jwtClient});
        return new CalendarProvider();
    }
}
