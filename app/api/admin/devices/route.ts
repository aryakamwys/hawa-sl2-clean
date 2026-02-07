import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test connection - return environment status
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasKey = !!process.env.GOOGLE_PRIVATE_KEY;
    const hasSpreadsheetId = !!process.env.GOOGLE_SPREADSHEET_ID;
    
    console.log('[Devices API] Environment check:');
    console.log('- Has Email:', hasEmail);
    console.log('- Has Key:', hasKey);
    console.log('- Has Spreadsheet ID:', hasSpreadsheetId);
    console.log('- Spreadsheet ID:', process.env.GOOGLE_SPREADSHEET_ID);
    
    if (!hasEmail || !hasKey || !hasSpreadsheetId) {
      return NextResponse.json({
        error: 'Missing Google Sheets configuration',
        debug: {
          hasEmail,
          hasKey,
          hasSpreadsheetId,
          spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        }
      }, { status: 500 });
    }

    // Try to import googleapis
    let google;
    try {
      const googleapis = await import('googleapis');
      google = googleapis.google;
      console.log('[Devices API] googleapis imported successfully');
    } catch (err) {
      console.error('[Devices API] Failed to import googleapis:', err);
      return NextResponse.json({
        error: 'Failed to import googleapis',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 });
    }

    // Setup Google Sheets API
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

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
      // Columns: No, Timestamp, PM2.5 raw, PM2.5 density, PM10 density, Air quality level, 
      // Temperature, Humidity, Pressure, Altitude estimate, Device ID
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
    } catch (err) {
      console.error('[Devices API] Google Sheets API error:', err);
      return NextResponse.json({
        error: 'Google Sheets API error',
        details: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[Devices API] Unexpected error:', error);
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
