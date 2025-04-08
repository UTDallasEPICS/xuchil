import prisma from '@/lib/db';

// Get all users from the database
export const getAllUsers = async () => {
  return await prisma.user.findMany(); 
};

// Get a specific user by ID
export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: {
      user_id: id,
    },
  });
};

// Create a new user in the database
export const createUser = async (userData: { user_name: string; user_password: string; user_role: string; user_email?: string; user_phoneno?: string }) => {
  const { user_name, user_password, user_role, user_email, user_phoneno } = userData;
  const newUser = await prisma.user.create({
    data: {
      user_name,
      user_password,
      user_role,
      user_email,
      user_phoneno,
    },
  });
  return newUser.user_id;
};

// Update a specific user by ID
export const updateUser = async (id: number, userData: { user_name?: string; user_password?: string; user_role?: string; user_email?: string; user_phoneno?: string }) => {
  const updatedUser = await prisma.user.update({
    where: { user_id: id },
    data: userData,
  });
  return updatedUser;
};

// Delete a specific user by ID
export const deleteUser = async (id: number) => {
  try {
    await prisma.user.delete({
      where: { user_id: id },
    });
    return true;
  } catch (error) {
    return false;
  }
};