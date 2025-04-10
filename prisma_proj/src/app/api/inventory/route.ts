import prisma from '@/lib/db'
import { NextApiRequest, NextApiResponse } from 'next';

// GET - Get all items in inventory
// POST - Add a new item to the inventory
export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const inventory = await prisma.inventory.findMany();
      return res.status(200).json(inventory);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { productId, quantity, threshold } = req.body;
      const newItem = await prisma.inventory.create({
        data: { productId, quantity, threshold },
      });
      return res.status(201).json(newItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to add item to inventory' });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed. Use 'GET' or 'POST'" });
}

