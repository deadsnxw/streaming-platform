import express from 'express';
import * as msal from '@azure/msal-node';
import passport from '../config/passport.js';
import { generateToken } from '../utils/auth.utils.js';
import { handleOAuthLogin } from '../config/passport.js';
import { msalClient } from '../config/microsoft.js';

const router = express.Router();

function handleOAuthCallback(req, res) {
    const result = req.user;
    if (result.isNew) {
        const data = encodeURIComponent(JSON.stringify(result.googleProfile));
        return res.redirect(`${process.env.FRONTEND_URL}/auth/complete-profile?data=${data}`);
    }
    const { user } = result;
    const token = generateToken({
        user_id: user.user_id,
        nickname: user.nickname,
        email: user.email,
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        user_id: user.user_id,
        nickname: user.nickname,
        email: user.email,
    }))}`);
}

router.get('/google', passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
    session: false,
}));
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    }),
    handleOAuthCallback
);

router.get('/discord', passport.authenticate('discord', { session: false }));
router.get('/discord/callback',
    passport.authenticate('discord', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=discord_failed`,
    }),
    handleOAuthCallback
);

router.get('/microsoft', async (req, res) => {
    try {
        const state = Math.random().toString(36).substring(2);
        req.session.msalState = state;
        
        const { verifier, challenge } = await msalClient.cryptoProvider.generatePkceCodes();
        req.session.msalCodeVerifier = verifier;

        const authUrl = await msalClient.getAuthCodeUrl({
            scopes: ['openid', 'email', 'profile', 'User.Read'],
            redirectUri: process.env.MICROSOFT_CALLBACK_URL,
            state: req.session.msalState,
            codeChallenge: challenge,
            codeChallengeMethod: 'S256',
        });
        res.redirect(authUrl);
    } catch (err) {
        console.error('Microsoft auth error:', err);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=microsoft_failed`);
    }
});

router.get('/microsoft/callback', async (req, res) => {
    try {
        const tokenResponse = await msalClient.acquireTokenByCode({
            code: req.query.code,
            scopes: ['openid', 'email', 'profile', 'User.Read'],
            redirectUri: process.env.MICROSOFT_CALLBACK_URL,
            state: req.session.msalState,
            codeVerifier: req.session.msalCodeVerifier,
        });

        const profile = tokenResponse.account;
        const email = profile.username || null;
        const displayName = profile.name || profile.username;

        const result = await new Promise((resolve, reject) => {
            handleOAuthLogin(
                'microsoft',
                profile.homeAccountId,
                email,
                null,
                displayName,
                tokenResponse.accessToken,
                null,
                (err, user) => err ? reject(err) : resolve(user)
            );
        });

        if (result.isNew) {
            const data = encodeURIComponent(JSON.stringify({ email, displayName }));
            return res.redirect(`${process.env.FRONTEND_URL}/auth/complete-profile?data=${data}`);
        }

        const { user } = result;
        const token = generateToken({
            user_id: user.user_id,
            nickname: user.nickname,
            email: user.email,
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            user_id: user.user_id,
            nickname: user.nickname,
            email: user.email,
        }))}`);

    } catch (err) {
        console.error('Microsoft OAuth error:', err);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=microsoft_failed`);
    }
});

export default router;