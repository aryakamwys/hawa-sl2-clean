#!/bin/bash

# VPS Production Setup Helper
# This script helps you set up the environment variables on the VPS

echo "HAWA VPS Production Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
  echo "⚠️  .env file already exists!"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# Start creating .env
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=mysql://hawa_user:hawa_password@mysql:3306/hawa

# JWT Secret (CHANGE THIS!)
JWT_SECRET=CHANGE_ME_PLEASE

# Application URL (update with your domain)
NEXT_PUBLIC_APP_URL=http://hawa.blog

# GROQ API Key
GROQ_API_KEY=

# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
EOF

echo "✓ .env file created"
echo ""

# Interactive setup
echo "Now let's fill in the values..."
echo ""

# JWT Secret
read -p "Enter JWT_SECRET (or press Enter to generate): " jwt_secret
if [ -z "$jwt_secret" ]; then
  jwt_secret=$(openssl rand -base64 32)
  echo "Generated: $jwt_secret"
fi
sed -i "s|JWT_SECRET=CHANGE_ME_PLEASE|JWT_SECRET=$jwt_secret|g" .env

# App URL
read -p "Enter NEXT_PUBLIC_APP_URL [http://hawa.blog]: " app_url
if [ ! -z "$app_url" ]; then
  sed -i "s|NEXT_PUBLIC_APP_URL=http://hawa.blog|NEXT_PUBLIC_APP_URL=$app_url|g" .env
fi

# GROQ API Key
read -p "Enter GROQ_API_KEY: " groq_key
if [ ! -z "$groq_key" ]; then
  sed -i "s|GROQ_API_KEY=|GROQ_API_KEY=$groq_key|g" .env
fi

# Google Spreadsheet ID
read -p "Enter GOOGLE_SPREADSHEET_ID: " spreadsheet_id
if [ ! -z "$spreadsheet_id" ]; then
  sed -i "s|GOOGLE_SPREADSHEET_ID=|GOOGLE_SPREADSHEET_ID=$spreadsheet_id|g" .env
fi

# Google credentials from file
if [ -f "google-credentials.json" ]; then
  echo ""
  echo "Found google-credentials.json, extracting values..."
  
  if command -v jq &> /dev/null; then
    email=$(jq -r '.client_email' google-credentials.json)
    private_key=$(jq -r '.private_key' google-credentials.json)
    
    sed -i "s|GOOGLE_SERVICE_ACCOUNT_EMAIL=|GOOGLE_SERVICE_ACCOUNT_EMAIL=$email|g" .env
    
    # Escape the private key for sed
    private_key_escaped=$(echo "$private_key" | sed 's/[\/&]/\\&/g')
    sed -i "s|GOOGLE_PRIVATE_KEY=|GOOGLE_PRIVATE_KEY=\"$private_key_escaped\"|g" .env
    
    echo "✓ Google credentials extracted"
  else
    echo "⚠️  'jq' not found. Please install it or manually add Google credentials"
    echo "   Install: apt-get install jq (Ubuntu/Debian) or yum install jq (CentOS)"
  fi
else
  echo ""
  echo "⚠️  google-credentials.json not found"
  echo "   Please upload it to VPS and run this script again, or add manually to .env"
fi

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the .env file: cat .env"
echo "2. If Google credentials are missing, add them manually"
echo "3. Build and start: docker-compose build --no-cache && docker-compose up -d"
echo "4. Check logs: docker logs hawa_app -f"
