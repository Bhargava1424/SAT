const { google } = require('googleapis');

const CLIENT_ID = '660495865700-eub3k43pf368cv6e3ul0j4mdsutgak1p.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = 'your-refresh-token-from-oauth-playground';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});

module.exports = { drive };
