import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../client';
import { products } from '../schema';

export const productsRepo = {
  listQuery() {
    return db.select().from(products).orderBy(products.name);
  },
  async create(data: { name: string; quantity: number; price: number }) {
    await db.insert(products).values({
      ...data,
      clientId: Crypto.randomUUID(),
      updatedAt: new Date(),
    });
  },
  async update(id: number, data: { name: string; quantity: number; price: number }) {
    await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
  },
  async remove(id: number) {
    await db.delete(products).where(eq(products.id, id));
  }
};