#!/usr/bin/env tsx
/**
 * Script para restablecer la contraseña de un usuario
 *
 * Uso:
 *   pnpm tsx scripts/reset-password.ts
 *
 * O con argumentos:
 *   pnpm tsx scripts/reset-password.ts --email="user@example.com" --password="NewPass123"
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

function question(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

function parseArgs(): { email?: string; password?: string } {
    const args = process.argv.slice(2);
    const parsed: { email?: string; password?: string } = {};

    args.forEach((arg) => {
        if (arg.startsWith('--email=')) {
            parsed.email = arg.split('=')[1];
        } else if (arg.startsWith('--password=')) {
            parsed.password = arg.split('=')[1];
        }
    });

    return parsed;
}

async function resetPassword() {
    console.log('Script de Restablecimiento de Contraseña\n');

    const argsInput = parseArgs();

    const newPassword = argsInput.password || await question('Nueva contraseña: ');
    if (!newPassword || newPassword.length < 4) {
        console.error('\nError: La contraseña debe tener al menos 4 caracteres.');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const email = argsInput.email || await question('Email del usuario: ');

        const user = await prisma.authUser.findUnique({
            where: { email },
            include: { worker: true },
        });

        if (!user) {
            console.error(`\nError: No se encontró usuario con email "${email}"`);
            process.exit(1);
        }

        await prisma.authUser.update({
            where: { id: user.id },
            data: { passwordHash: hashedPassword },
        });

        console.log(`\nContraseña restablecida exitosamente para:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Nombre: ${user.worker?.fullName || 'N/A'}`);
    } catch (error) {
        console.error('\nError al restablecer contraseña:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
