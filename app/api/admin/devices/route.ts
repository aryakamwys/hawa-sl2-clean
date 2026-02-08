import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Load Google credentials from file or env vars.
 * File-based approach is more reliable (no \n escaping issues).
 */
function getGoogleCredentials() {
  // Try 1: Load from google-credentials.json file
  const possiblePaths = [
    path.join(process.cwd(), 'google-credentials.json'),
    '/app/google-credentials.json',
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const creds = JSON.parse(raw);
        console.log('[Devices API] Loaded credentials from file:', filePath);
        return {
          client_email: creds.client_email,
          private_key: creds.private_key,
        };
      }
    } catch (err) {
      console.warn('[Devices API] Failed to read credentials file:', filePath, err);
    }
  }

  // Try 2: Fall back to env vars
  console.log('[Devices API] Falling back to env vars for credentials');
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!privateKey) return null;

  return {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    // Handle both escaped and raw newlines
    private_key: privateKey.includes('\\n') 
      ? privateKey.replace(/\\n/g, '\n') 
      : privateKey,
  };
}

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const credentials = getGoogleCredentials();

    console.log('[Devices API] Environment check:');
    console.log('- Has Credentials:', !!credentials);
    console.log('- Has Spreadsheet ID:', !!spreadsheetId);
    console.log('- Spreadsheet ID:', spreadsheetId);

    if (!credentials || !spreadsheetId) {
      return NextResponse.json({
        error: 'Missing Google Sheets configuration',
        debug: {
          hasCredentials: !!credentials,
          hasSpreadsheetId: !!spreadsheetId,
        }
      }, { status: 500 });
    }

    // Import googleapis
    let google;
    try {
      const googleapis = await import('googleapis');
      google = googleapis.google;
    } catch (err) {
      console.error('[Devices API] Failed to import googleapis:', err);
      return NextResponse.json({
        error: 'Failed to import googleapis',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 });
    }

    // Setup Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('[Devices API] Attempting to fetch data...');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:K',
    });

    const rows = response.data.values;
    console.log('[Devices API] Success! Rows:', rows?.length || 0);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ 
        devices: [],
        message: 'No data found in spreadsheet'
      });
    }

    // Map rows to match spreadsheet columns exactly
    const devices = rows.map((row) => ({
      no: row[0] || '',
      timestamp: row[1] || '',
      pm25Raw: row[2] || '0',
      pm25Density: row[3] || '0',
      pm10Density: row[4] || '0',
      airQualityLevel: row[5] || 'UNKNOWN',
      temperature: row[6] || '0',
      humidity: row[7] || '0',
      pressure: row[8] || '0',
      altitudeEstimate: row[9] || '0',
      deviceId: row[10] || '',
    }));

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('[Devices API] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch devices',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
