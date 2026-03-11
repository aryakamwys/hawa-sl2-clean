#!/bin/bash
set -e

echo "🚀 Deploying application..."

# Pull the latest changes from GitHub
echo "Pulling latest code from origin main..."
git reset --hard
git pull origin main

# Build and start the containers in detached mode
echo "Building and recreating app container..."
docker compose -f docker-compose.yml up -d --build app

# Run Prisma DB Push (DDL sync) inside the running app container
echo "Executing Prisma DB Push..."
docker compose -f docker-compose.yml exec -T app npx prisma db push

echo "Deployment finished!"
