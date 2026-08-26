#!/usr/bin/env tsx
/**
 * Script para restablecer la contraseña de un usuario o invitado
 * 
 * Uso:
 *   pnpm tsx scripts/reset-password.ts
 * 
 * O con argumentos:
 *   pnpm tsx scripts/reset-password.ts --email="user@example.com" --password="NewPass123"
 *   pnpm tsx scripts/reset-password.ts --guest-id=1 --password="NewPass123"
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

function parseArgs(): { email?: string; guestId?: number; password?: string } {
    const args = process.argv.slice(2);
    const parsed: { email?: string; guestId?: number; password?: string } = {};

    args.forEach((arg) => {
        if (arg.startsWith('--email=')) {
            parsed.email = arg.split('=')[1];
        } else if (arg.startsWith('--guest-id=')) {
            parsed.guestId = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--password=')) {
            parsed.password = arg.split('=')[1];
        }
    });

    return parsed;
}

async function resetPassword() {
    console.log('Script de Restablecimiento de Contraseña\n');

    const argsInput = parseArgs();

    // Determine user type
    let type = '';
    if (argsInput.email) {
        type = 'user';
    } else if (argsInput.guestId) {
        type = 'guest';
    } else {
        const typeInput = await question('¿Restablecer contraseña de usuario (u) o invitado (i)? ');
        type = typeInput.toLowerCase().startsWith('i') ? 'guest' : 'user';
    }

    const newPassword = argsInput.password || await question('Nueva contraseña: ');
    if (!newPassword || newPassword.length < 4) {
        console.error('\nError: La contraseña debe tener al menos 4 caracteres.');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        if (type === 'user') {
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
        } else {
            let guestId = argsInput.guestId;
            if (!guestId) {
                // List guests
                const guests = await prisma.guestCollaborator.findMany({
                    where: { isActive: true },
                    orderBy: { displayName: 'asc' },
                });

                if (guests.length === 0) {
                    console.log('\nNo hay invitados registrados.');
                    process.exit(0);
                }

                console.log('\nInvitados disponibles:');
                guests.forEach(g => console.log(`  ${g.id}. ${g.displayName}`));
                const guestInput = await question('\nID del invitado: ');
                guestId = parseInt(guestInput);
            }

            if (isNaN(guestId)) {
                console.error('\nError: ID de invitado inválido.');
                process.exit(1);
            }

            const guest = await prisma.guestCollaborator.findUnique({
                where: { id: guestId },
            });

            if (!guest) {
                console.error(`\nError: No se encontró invitado con ID ${guestId}`);
                process.exit(1);
            }

            await prisma.guestCollaborator.update({
                where: { id: guestId },
                data: { passwordHash: hashedPassword },
            });

            console.log(`\nContraseña restablecida exitosamente para invitado:`);
            console.log(`  ID: ${guest.id}`);
            console.log(`  Nombre: ${guest.displayName}`);
        }
    } catch (error) {
        console.error('\nError al restablecer contraseña:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
