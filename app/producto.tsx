import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../db/client';
import { productsRepo } from '../db/repositories/products';
import { products } from '../db/schema';

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = id ? Number(id) : null;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  // Cargar datos si es edición
  useEffect(() => {
    if (productId) {
      db.select().from(products).where(eq(products.id, productId)).get().then((p) => {
        if (p) {
          setName(p.name);
          setQuantity(String(p.quantity));
          setPrice(String(p.price));
        }
      });
    }
  }, [productId]);

  const handleSave = async () => {
    const q = Number(quantity);
    const p = Number(price);

    if (!name.trim()) return Alert.alert('Error', 'El nombre es obligatorio');
    if (isNaN(q) || q < 0 || !Number.isInteger(q)) return Alert.alert('Error', 'Cantidad debe ser un entero >= 0');
    if (isNaN(p) || p < 0 || !Number.isInteger(p)) return Alert.alert('Error', 'Precio debe ser un entero >= 0');

    try {
      if (productId) {
        await productsRepo.update(productId, { name: name.trim(), quantity: q, price: p });
      } else {
        await productsRepo.create({ name: name.trim(), quantity: q, price: p });
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Nombre del producto" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Cantidad" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
      <TextInput style={styles.input} placeholder="Precio (en pesos)" keyboardType="number-pad" value={price} onChangeText={setPrice} />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{productId ? 'Guardar cambios' : 'Crear producto'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', gap: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 16 },
  button: { backgroundColor: '#34C759', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});