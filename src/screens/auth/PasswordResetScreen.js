import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
//import { auth } from '../../services/firebase/firebaseConfig';

export default function PasswordResetScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const auth = getAuth();

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
       console.error('❌ Error enviando email de recuperación:', error);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
       console.log('✅ Se ha enviado recuperacion de password a :',email);
      Alert.alert(
        'Correo enviado',
        'Revisa tu bandeja de entrada para restablecer la contraseña.'
      );
      navigation.goBack();
    } catch (error) {
     // Alert.alert('Error', error.message);
       console.error('❌ Error enviando al recuperación PW:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 15 }}>Restablecer contraseña</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />
      <Button title="Enviar enlace de recuperación" onPress={handlePasswordReset} />
    </View>
  );
}