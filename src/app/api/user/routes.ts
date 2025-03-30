import { IncomingMessage, ServerResponse } from 'node:http';
import * as userController from './controller'; // Corrected import path

// Route handling for GET /api/users
const getUsersRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'GET' && req.url === '/api/users') {
    userController.getUsers(req, res);
  }
};

// Route handling for GET /api/users/{id}
const getUserByIdRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'GET' && req.url?.startsWith('/api/users/')) {
    userController.getUserById(req, res);
  }
};

// Route handling for POST /api/users
const addUserRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST' && req.url === '/api/users') {
    userController.addUser(req, res);
  }
};

// Route handling for PUT /api/users/{id}
const updateUserRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'PUT' && req.url?.startsWith('/api/users/')) {
    userController.updateUser(req, res);
  }
};

// Route handling for DELETE /api/users/{id}
const deleteUserRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'DELETE' && req.url?.startsWith('/api/users/')) {
    userController.deleteUser(req, res);
  }
};

// Export routes to be used by the server
export const routes = [
  getUsersRoute,
  getUserByIdRoute,
  addUserRoute,
  updateUserRoute,
  deleteUserRoute,
];