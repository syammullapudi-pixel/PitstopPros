const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const readline = require('readline');

require('dotenv').config(); // Load environment variables FIRST

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: Set your Google Calendar email here
// This is the calendar where bookings will appear
const CALENDAR_EMAIL = 'mullapudi.dattasastry@gmail.com';
// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontEnd')));

// Google Calendar API setup
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

let auth;

// Initialize Google Auth
async function authorize() {
  try {
    let credentials;
    
    // Try to get credentials from environment variable (Heroku) first
    if (process.env.GOOGLE_CREDENTIALS) {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } else {
      // Fall back to reading from file (local development)
      credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    }
    
    // Check if it's a service account (has private_key)
    if (credentials.private_key) {
      // Service Account authentication
      const { google } = require('googleapis');
      auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: SCOPES,
      });
      return auth;
    } else if (credentials.installed) {
      // OAuth2 authentication (original code)
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
        auth = oAuth2Client;
        return oAuth2Client;
      }
      return getAccessToken(oAuth2Client);
    }
  } catch (error) {
    console.error('Authorization error:', error.message);
    throw error;
  }
}

// Get new access token
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      auth = oAuth2Client;
    });
  });
}

// Nodemailer setup for confirmation emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Original contact route - Updated to send email via Nodemailer
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to your email (specified in .env)
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Contact form email sent to:', process.env.EMAIL_USER);

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Route: Save booking and add to Google Calendar
app.post('/api/bookings/create', async (req, res) => {
  try {
    const { serviceType, customerName, customerEmail, customerPhone, customerAddress, serviceDate, serviceTime, vehicleInfo, notes } = req.body;

    if (!auth) {
      console.error('Auth not initialized');
      return res.status(401).json({ error: 'Google Calendar not authenticated' });
    }

    // Step 1: Create Google Calendar event
    const calendar = google.calendar({ version: 'v3', auth });
    const startDateTime = new Date(`${serviceDate}T${serviceTime}`);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour duration

    const event = {
      summary: `${serviceType} - ${customerName}`,
      description: `Customer: ${customerName}\nPhone: ${customerPhone}\nAddress: ${customerAddress}\nVehicle: ${vehicleInfo}\nNotes: ${notes || 'None'}`,
      location: customerAddress,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York'
      }
    };

    const calendarEvent = await calendar.events.insert({
      calendarId: CALENDAR_EMAIL,
      resource: event
    });

    console.log('✓ Calendar event created:', calendarEvent.data.id);

    // Step 2: Send confirmation email to customer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: 'Booking Confirmation - Pitstop Pros',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Your service has been scheduled. Here are your booking details:</p>
        <ul>
          <li><strong>Service:</strong> ${serviceType}</li>
          <li><strong>Date:</strong> ${new Date(serviceDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${serviceTime}</li>
          <li><strong>Vehicle:</strong> ${vehicleInfo}</li>
          <li><strong>Address:</strong> ${customerAddress}</li>
          ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
        </ul>
        <p>We'll see you at the scheduled time at <strong>${customerAddress}</strong>.</p>
        <p>Thank you for choosing Pitstop Pros.</p>
        <p><a href="${calendarEvent.data.htmlLink}">View in Calendar</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Confirmation email sent to:', customerEmail);

    // Step 3: Send notification email to owner
    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Booking Created - Pitstop Pros',
      html: `
        <h2>New Booking Notification</h2>
        <p>A new booking has been created. Here are the details:</p>
        <ul>
          <li><strong>Service:</strong> ${serviceType}</li>
          <li><strong>Customer Name:</strong> ${customerName}</li>
          <li><strong>Customer Email:</strong> ${customerEmail}</li>
          <li><strong>Customer Phone:</strong> ${customerPhone}</li>
          <li><strong>Date:</strong> ${new Date(serviceDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${serviceTime}</li>
          <li><strong>Vehicle:</strong> ${vehicleInfo}</li>
          <li><strong>Address:</strong> ${customerAddress}</li>
          ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
        </ul>
        <p><a href="${calendarEvent.data.htmlLink}">View in Calendar</a></p>
      `
    };

    await transporter.sendMail(ownerMailOptions);
    console.log('✓ Owner notification email sent to:', process.env.EMAIL_USER);

    res.json({
      success: true,
      message: 'Booking confirmed and added to calendar',
      eventId: calendarEvent.data.id
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  try {
    // Try to authorize with Google Calendar
    await authorize();
    console.log('✓ Google Calendar authenticated');
    console.log(`✓ Events will be added to: ${CALENDAR_EMAIL}`);
  } catch (error) {
    console.warn('⚠ Google Calendar not configured yet. Run setup instructions.');
  }

  const url = `http://localhost:${PORT}`;
  console.log(`Server running at ${url}`);
});
