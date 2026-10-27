import { eq, isNull, lt, or } from 'drizzle-orm';
import { db } from '../db/client';
import { products } from '../db/schema';
import { supabase } from '../lib/supabase';

export async function syncProducts(userId: string) {
  let subidos = 0;
  let bajados = 0;

  // 1. BAJAR: Traer de Supabase
  const { data: remoteProducts, error: fetchError } = await supabase.from('products').select('*');
  
  if (fetchError) throw fetchError;

  for (const rp of remoteProducts) {
    const local = await db.select().from(products).where(eq(products.clientId, rp.client_id)).get();
    if (!local) {
      await db.insert(products).values({
        clientId: rp.client_id,
        name: rp.name,
        quantity: rp.quantity,
        price: rp.price,
        updatedAt: new Date(rp.updated_at),
        syncedAt: new Date(rp.updated_at),
      });
      bajados++;
    }
  }

  // 2. SUBIR: Enviar pendientes
  const pending = await db.select().from(products).where(
    or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt))
  );

  for (const p of pending) {
    const { error: upsertError } = await supabase.from('products').upsert({
      client_id: p.clientId,
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      updated_at: p.updatedAt.toISOString(),
    }, { onConflict: 'client_id' });

    if (upsertError) throw upsertError;
    
    await db.update(products).set({ syncedAt: p.updatedAt }).where(eq(products.id, p.id));
    subidos++;
  }

  return { subidos, bajados };
}