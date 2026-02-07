require('dotenv').config();
const { google } = require('googleapis');

async function testSheets() {
  try {
    console.log('Testing Google Sheets connection...');
    console.log('Spreadsheet ID:', process.env.GOOGLE_SPREADSHEET_ID);
    console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Has Private Key:', !!process.env.GOOGLE_PRIVATE_KEY);
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('\nFetching data from spreadsheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Sheet1!A1:K10',
    });

    console.log('yey');
    console.log('Rows found:', response.data.values?.length || 0);
    console.log('\nFirst few rows:');
    console.log(response.data.values?.slice(0, 3));
  } catch (error) {
    console.error('Error nah');
    console.error(error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.errors) console.error('Errors:', error.errors);
  }
}

testSheets();
