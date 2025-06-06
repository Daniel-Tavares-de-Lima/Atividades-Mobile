import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, ScrollView } from 'react-native';

export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    try {
      const res = await fetch('http://192.168.0.11:3000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });
      if (!res.ok) {
        throw new Error(`Erro na requisição: ${res.statusText}`);
      }
      const data = await res.json();
      setResponse(data.answer || 'Sem resposta');
    } catch (err) {
      console.error('Erro detalhado:', err);
      setResponse('Erro ao conectar com o servidor: ' + err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Consulta de Livros com Gemini</Text>
      <Text style={styles.subtitle}>Digite o título de um livro</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o título do livro ou trecho"
        value={input}
        onChangeText={setInput}
        multiline
      />
      <Button title="Enviar" onPress={handleSend} />
      <Text style={styles.responseTitle}>Resposta:</Text>
      <Text style={styles.response}>{response}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  responseTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  response: {
    fontSize: 16,
    marginTop: 10,
    lineHeight: 24,
  },
});