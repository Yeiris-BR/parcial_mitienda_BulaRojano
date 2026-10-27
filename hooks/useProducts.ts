import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { productsRepo } from '../db/repositories/products';

export function useProducts() {
  const { data: products, error } = useLiveQuery(productsRepo.listQuery());
  
  const totalUnits = products?.reduce((acc, p) => acc + p.quantity, 0) || 0;
  const totalValue = products?.reduce((acc, p) => acc + (p.quantity * p.price), 0) || 0;
  const pendingCount = products?.filter(p => !p.syncedAt || p.syncedAt < p.updatedAt).length || 0;

  return { products, error, totalUnits, totalValue, pendingCount, ...productsRepo };
}