#!/bin/bash

# Script to help extract Google credentials from google-credentials.json
# Usage: ./scripts/extract-google-creds.sh

if [ ! -f "google-credentials.json" ]; then
  echo "Error: google-credentials.json not found!"
  echo "Please make sure the file exists in the project root."
  exit 1
fi

echo "Extracting Google credentials..."
echo ""
echo "Add these to your .env file:"
echo "================================================"
echo ""

# Extract values using jq (if available) or basic parsing
if command -v jq &> /dev/null; then
  echo "GOOGLE_SERVICE_ACCOUNT_EMAIL=\"$(jq -r '.client_email' google-credentials.json)\""
  echo "GOOGLE_PRIVATE_KEY=\"$(jq -r '.private_key' google-credentials.json)\""
else
  echo "Note: Install 'jq' for better parsing (brew install jq)"
  echo ""
  echo "GOOGLE_SERVICE_ACCOUNT_EMAIL="
  grep -o '"client_email": *"[^"]*"' google-credentials.json | cut -d'"' -f4
  echo ""
  echo "GOOGLE_PRIVATE_KEY="
  echo "Please manually copy the private_key value from google-credentials.json"
fi

echo ""
echo "================================================"
echo ""
echo "IMPORTANT NOTES:"
echo "1. The private key must be in single-line format"
echo "2. Keep the \\n characters in the key (they represent newlines)"
echo "3. Wrap the entire key in double quotes"
echo "4. Don't forget to set GOOGLE_SPREADSHEET_ID"
