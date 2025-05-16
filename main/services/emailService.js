const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');

class EmailService {
    constructor() {
        this.gmailClient = null;
        this.outlookClient = null;
        this.tokenPath = path.join(__dirname, '../config/token.json');
        this.credentialsPath = path.join(__dirname, '../config/credentials.json');
        this.msalConfig = {
            auth: {
                clientId: process.env.OUTLOOK_CLIENT_ID,
                authority: 'https://login.microsoftonline.com/common',
                clientSecret: process.env.OUTLOOK_CLIENT_SECRET
            }
        };
    }

    // Gmail OAuth2 Methods
    async initializeGmailAuth() {
        try {
            const credentials = JSON.parse(fs.readFileSync(this.credentialsPath));
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            this.gmailClient = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

            // Check if we have stored tokens
            if (fs.existsSync(this.tokenPath)) {
                const token = JSON.parse(fs.readFileSync(this.tokenPath));
                this.gmailClient.setCredentials(token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error initializing Gmail auth:', error);
            throw error;
        }
    }

    async getGmailAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify'
        ];

        return this.gmailClient.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    async handleGmailCallback(code) {
        try {
            const { tokens } = await this.gmailClient.getToken(code);
            this.gmailClient.setCredentials(tokens);
            
            // Save tokens for future use
            fs.writeFileSync(this.tokenPath, JSON.stringify(tokens));
            return true;
        } catch (error) {
            console.error('Error handling Gmail callback:', error);
            throw error;
        }
    }

    // Outlook MSAL Methods
    async initializeOutlookAuth() {
        try {
            this.outlookClient = new ConfidentialClientApplication(this.msalConfig);
            
            // Check if we have stored tokens
            if (fs.existsSync(this.tokenPath)) {
                const token = JSON.parse(fs.readFileSync(this.tokenPath));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error initializing Outlook auth:', error);
            throw error;
        }
    }

    async getOutlookAuthUrl() {
        const authUrlParameters = {
            scopes: [
                'https://graph.microsoft.com/Mail.Read',
                'https://graph.microsoft.com/Mail.Send',
                'https://graph.microsoft.com/Mail.ReadWrite'
            ],
            redirectUri: 'http://localhost:3000/outlook-callback'
        };

        return this.outlookClient.getAuthCodeUrl(authUrlParameters);
    }

    async handleOutlookCallback(code) {
        try {
            const tokenResponse = await this.outlookClient.acquireTokenByCode({
                code,
                scopes: [
                    'https://graph.microsoft.com/Mail.Read',
                    'https://graph.microsoft.com/Mail.Send',
                    'https://graph.microsoft.com/Mail.ReadWrite'
                ],
                redirectUri: 'http://localhost:3000/outlook-callback'
            });

            // Save tokens for future use
            fs.writeFileSync(this.tokenPath, JSON.stringify(tokenResponse));
            return true;
        } catch (error) {
            console.error('Error handling Outlook callback:', error);
            throw error;
        }
    }

    // Email Operations
    async sendGmailEmail(to, subject, body) {
        try {
            const gmail = google.gmail({ version: 'v1', auth: this.gmailClient });
            const message = [
                'Content-Type: text/plain; charset="UTF-8"\n',
                'MIME-Version: 1.0\n',
                `To: ${to}\n`,
                `Subject: ${subject}\n\n`,
                body
            ].join('');

            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage
                }
            });
        } catch (error) {
            console.error('Error sending Gmail:', error);
            throw error;
        }
    }

    async sendOutlookEmail(to, subject, body) {
        try {
            const token = JSON.parse(fs.readFileSync(this.tokenPath));
            const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: {
                        subject,
                        body: {
                            contentType: 'Text',
                            content: body
                        },
                        toRecipients: [
                            {
                                emailAddress: {
                                    address: to
                                }
                            }
                        ]
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to send email: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error sending Outlook email:', error);
            throw error;
        }
    }

    // Utility Methods
    async checkAuthStatus() {
        const gmailStatus = await this.initializeGmailAuth();
        const outlookStatus = await this.initializeOutlookAuth();
        
        return {
            gmail: gmailStatus,
            outlook: outlookStatus
        };
    }

    async logout() {
        try {
            if (fs.existsSync(this.tokenPath)) {
                fs.unlinkSync(this.tokenPath);
            }
            this.gmailClient = null;
            this.outlookClient = null;
            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }
}

module.exports = new EmailService(); 