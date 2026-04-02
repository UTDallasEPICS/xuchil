#!/usr/bin/env tsx
/**
 * Script para editar información de un usuario
 * 
 * Uso:
 *   pnpm tsx scripts/edit-user.ts
 * 
 * O con argumentos:
 *   pnpm tsx scripts/edit-user.ts --email="user@example.com" --name="Nuevo Nombre"
 *   pnpm tsx scripts/edit-user.ts --email="user@example.com" --phone="5551234567" --role=2
 *   pnpm tsx scripts/edit-user.ts --email="old@email.com" --new-email="new@email.com"
 */

import { PrismaClient } from '@prisma/client';
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

interface EditArgs {
    email?: string;
    newEmail?: string;
    name?: string;
    phone?: string;
    roleId?: number;
    isAdmin?: boolean;
}

function parseArgs(): EditArgs {
    const args = process.argv.slice(2);
    const parsed: EditArgs = {};

    args.forEach((arg) => {
        if (arg.startsWith('--email=')) {
            parsed.email = arg.split('=')[1];
        } else if (arg.startsWith('--new-email=')) {
            parsed.newEmail = arg.split('=')[1];
        } else if (arg.startsWith('--name=')) {
            parsed.name = arg.split('=')[1];
        } else if (arg.startsWith('--phone=')) {
            parsed.phone = arg.split('=')[1];
        } else if (arg.startsWith('--role=')) {
            parsed.roleId = parseInt(arg.split('=')[1]);
        } else if (arg === '--admin') {
            parsed.isAdmin = true;
        } else if (arg === '--no-admin') {
            parsed.isAdmin = false;
        }
    });

    return parsed;
}

async function editUser() {
    console.log('Script de Edición de Usuario\n');

    const argsInput = parseArgs();
    const email = argsInput.email || await question('Email del usuario a editar: ');

    const user = await prisma.authUser.findUnique({
        where: { email },
        include: { worker: { include: { role: true } } },
    });

    if (!user) {
        console.error(`\nError: No se encontró usuario con email "${email}"`);
        process.exit(1);
    }

    console.log('\nUsuario encontrado:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Nombre: ${user.worker?.fullName || 'N/A'}`);
    console.log(`  Rol: ${user.worker?.role?.name || 'Sin rol'}`);
    console.log(`  Teléfono: ${user.worker?.phone || 'No especificado'}`);
    console.log(`  Admin: ${user.isAdmin ? 'Sí' : 'No'}`);
    console.log('');

    // Collect changes
    const hasInteractiveArgs = !argsInput.name && !argsInput.phone && argsInput.roleId === undefined
        && argsInput.newEmail === undefined && argsInput.isAdmin === undefined;

    let newName = argsInput.name;
    let newPhone = argsInput.phone;
    let newRoleId = argsInput.roleId;
    let newEmail = argsInput.newEmail;
    let newIsAdmin = argsInput.isAdmin;

    if (hasInteractiveArgs) {
        const nameInput = await question(`Nombre (Enter para mantener "${user.worker?.fullName || ''}"): `);
        if (nameInput) newName = nameInput;

        const phoneInput = await question(`Teléfono (Enter para mantener "${user.worker?.phone || ''}"): `);
        if (phoneInput) newPhone = phoneInput;

        const emailInput = await question(`Nuevo email (Enter para mantener "${user.email}"): `);
        if (emailInput) newEmail = emailInput;

        const roles = await prisma.role.findMany();
        console.log('\nRoles disponibles:');
        roles.forEach(role => console.log(`  ${role.id}. ${role.name}`));
        const roleInput = await question(`\nID del rol (Enter para mantener): `);
        if (roleInput) newRoleId = parseInt(roleInput);

        const adminInput = await question(`Es administrador? (s/n, Enter para mantener): `);
        if (adminInput) newIsAdmin = adminInput.toLowerCase() === 's' || adminInput.toLowerCase() === 'si';
    }

    try {
        // Update worker if exists
        if (user.worker && (newName || newPhone || newRoleId)) {
            const workerData: any = {};
            if (newName) workerData.fullName = newName;
            if (newPhone) workerData.phone = newPhone;
            if (newRoleId !== undefined) workerData.roleId = newRoleId;

            await prisma.worker.update({
                where: { id: user.worker.id },
                data: workerData,
            });
        }

        // Update auth user
        const authData: any = {};
        if (newEmail) authData.email = newEmail;
        if (newIsAdmin !== undefined) authData.isAdmin = newIsAdmin;

        if (Object.keys(authData).length > 0) {
            await prisma.authUser.update({
                where: { id: user.id },
                data: authData,
            });
        }

        // Reload and show
        const updated = await prisma.authUser.findUnique({
            where: { id: user.id },
            include: { worker: { include: { role: true } } },
        });

        console.log('\nUsuario actualizado exitosamente:');
        console.log(`  ID: ${updated!.id}`);
        console.log(`  Email: ${updated!.email}`);
        console.log(`  Nombre: ${updated!.worker?.fullName || 'N/A'}`);
        console.log(`  Rol: ${updated!.worker?.role?.name || 'Sin rol'}`);
        console.log(`  Teléfono: ${updated!.worker?.phone || 'No especificado'}`);
        console.log(`  Admin: ${updated!.isAdmin ? 'Sí' : 'No'}`);
    } catch (error) {
        console.error('\nError al editar usuario:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

editUser();
