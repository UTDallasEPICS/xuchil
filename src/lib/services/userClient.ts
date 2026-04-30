import {UserCreate, UserRead, UserReadSchema, UserRestrictedUpdate} from "@/lib/schemas";
import {sendRequest} from "@/utils/request";

async function getCurrentUser(): Promise<UserRead> {
  const res = await sendRequest({ method: 'GET', url: `/api/users/me`});
  return UserReadSchema.parse(res);
}

async function updateCurrentUser(payload: Partial<UserRestrictedUpdate>): Promise<UserRead> {
  const res = await sendRequest({ method: 'PUT', url: `/api/users/me`, body: payload });
  return UserReadSchema.parse(res);
}

async function getAllUsers(query?: {isGuest?: boolean}): Promise<UserRead[]> {
  const res = await sendRequest({ method: 'GET', url: `/api/users`, query: query });
  return (res).map((item: unknown) => UserReadSchema.parse(item));
}

async function createUser(payload: UserCreate): Promise<UserRead> {
  const res = await sendRequest({ method: 'POST', url: `/api/users`, body: payload });
  return UserReadSchema.parse(res);
}

async function updateUser(id: number, payload: Partial<UserCreate>): Promise<UserRead> {
  const res = await sendRequest({ method: 'PUT', url: `/api/users/${id}`, body: payload });
  return UserReadSchema.parse(res);
}

async function deleteUser(id: number) {
  await sendRequest({ method: 'DELETE', url: `/api/users/${id}` });
}

export default {
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
}

