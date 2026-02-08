/**
 * Script to create an admin user
 * 
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts
 * 
 * Or with environment variables:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret123 ADMIN_NAME="Admin User" npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as readline from 'readline';

// Use DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL!;

// Create adapter and client
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hidden) {
      process.stdout.write(question);
      let input = '';
      
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      const onData = (char: string) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(input);
        } else if (char === '\u0003') {
          process.exit();
        } else if (char === '\u007F') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += char;
          process.stdout.write('*');
        }
      };
      
      process.stdin.on('data', onData);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function createAdmin() {
  console.log('\nHAWA Admin User Creation\n');
  console.log('-'.repeat(40));

  try {
    // Get credentials from environment or prompt
    let email = process.env.ADMIN_EMAIL;
    let password = process.env.ADMIN_PASSWORD;
    let name = process.env.ADMIN_NAME;

    if (!email) {
      email = await prompt('Admin Email: ');
    }

    if (!name) {
      name = await prompt('Admin Name: ');
    }

    if (!password) {
      password = await prompt('Admin Password: ', true);
      const confirmPassword = await prompt('Confirm Password: ', true);
      
      if (password !== confirmPassword) {
        console.error('\n[ERROR] Passwords do not match!');
        process.exit(1);
      }
    }

    if (!email || !password || !name) {
      console.error('\nAll fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\nPassword must be at least 6 characters!');
      process.exit(1);
    }

    console.log('\nCreating admin user...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log('\nAdmin user already exists with this email.');
        
        const update = await prompt('Do you want to update the password? (y/N): ');
        
        if (update.toLowerCase() === 'y') {
          const passwordHash = await bcrypt.hash(password, 10);
          await prisma.user.update({
            where: { email },
            data: { passwordHash, name },
          });
          console.log('\nAdmin password updated successfully!');
        } else {
          console.log('\nOperation cancelled.');
        }
      } else {
        // Upgrade existing user to admin
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN', passwordHash, name },
        });
        console.log('\nUser upgraded to admin successfully!');
      }
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      
      const admin = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'ADMIN',
        },
      });

      console.log('\n[OK] Admin user created successfully!');
      console.log('-'.repeat(40));
      console.log(`   ID:    ${admin.id}`);
      console.log(`   Name:  ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role:  ${admin.role}`);
      console.log('-'.repeat(40));
    }

  } catch (error) {
    console.error('\n Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
