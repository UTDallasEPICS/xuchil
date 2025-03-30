import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch all users
export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

// Fetch a user by ID
export const getUserById = async (userId: number) => {
  return await prisma.user.findUnique({
    where: {
      user_id: userId,
    },
  });
};

// Create a new user
export const createUser = async (userData: any) => {
  return await prisma.user.create({
    data: userData,
  });
};

// Update user data
export const updateUser = async (userId: number, userData: any) => {
  return await prisma.user.update({
    where: {
      user_id: userId,
    },
    data: userData,
  });
};

// Delete a user
export const deleteUser = async (userId: number) => {
  return await prisma.user.delete({
    where: {
      user_id: userId,
    },
  });
};