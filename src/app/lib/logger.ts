export const logger = {
    log: function (level: 'debug' | 'info' | 'error', message: string) {
        if (!process.env.NO_LOGGING) {
            console[level](message);
        }
    },

    debug: function (message: string) {
        this.log('debug', message);
    },

    info: function (message: string) {
        this.log('info', message);
    },

    error: function (message: string) {
        this.log('error', message);
    }
};
