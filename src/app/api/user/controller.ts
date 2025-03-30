import { IncomingMessage, ServerResponse } from 'node:http';
import * as userService from './service';

// helper function to parse the body of the request
const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));  // assumes json body
      } catch (err) {
        reject('Invalid JSON');
      }
    });
  });
};

// GET /api/users
export const getUsers = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(users));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
};

// GET /api/users/{id}
export const getUserById = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const userId = req.url?.split('/')[3]; // assuming {id} is passed in URL
  try {
    const user = await userService.getUserById(parseInt(userId || '0', 10));
    if (user) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(user));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'User not found' }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
};

// POST /api/users
export const addUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    const userData = await parseBody(req);  // parse the incoming request body
    const userId = await userService.createUser(userData);
    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'User created', userId }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
};

// PUT /api/users/{id}
export const updateUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const userId = req.url?.split('/')[3]; // assuming {id} is passed in URL
  try {
    const userData = await parseBody(req);  // parse the incoming request body
    const updatedUser = await userService.updateUser(parseInt(userId || '0', 10), userData);
    if (updatedUser) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'User updated', updatedUser }));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'User not found' }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
};

// DELETE /api/users/{id}
export const deleteUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const userId = req.url?.split('/')[3]; // assuming {id} is passed in URL
  try {
    const deletedUser = await userService.deleteUser(parseInt(userId || '0', 10));
    if (deletedUser) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'User deleted' }));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'User not found' }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
};