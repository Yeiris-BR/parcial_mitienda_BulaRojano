import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || password.length < 6) {
      return setMessage('Escribe tu correo y una contraseña de al menos 6 caracteres.');
    }
    setBusy(true);
    setMessage(null);
    const error = await signIn(email, password);
    if (error) setMessage(error);
    setBusy(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Tienda</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {message && <Text style={styles.error}>{message}</Text>}

      <Pressable style={styles.button} disabled={busy} onPress={handleLogin}>
        <Text style={styles.buttonText}>{busy ? 'Ingresando...' : 'Ingresar'}</Text>
      </Pressable>

      <Link href="/registro" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: '#111' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  error: { color: '#DC2626', marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#007AFF', fontSize: 14 },
});