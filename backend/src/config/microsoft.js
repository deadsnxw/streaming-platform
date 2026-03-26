import * as msal from '@azure/msal-node';
import { PublicClientApplication } from '@azure/msal-node';

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        authority: 'https://login.microsoftonline.com/common',
    },
};

export const msalClient = new msal.ConfidentialClientApplication(msalConfig);