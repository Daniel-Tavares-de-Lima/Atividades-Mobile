import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);

  const searchMatches = async () => {
    try {
      const response = await axios.get(
        `https://api.football-data.org/v4/matches?dateFrom=${query}&dateTo=${query}`,
        {
          headers: { 'X-Auth-Token': '87b94f0551de4257a3232a62a3152c6e' } // Token da API
        }
      );
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Digite a data (YYYY-MM-DD)"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      <Button mode="contained" onPress={searchMatches} style={styles.button}>
        Buscar Partidas
      </Button>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{`${item.homeTeam.name} vs ${item.awayTeam.name}`}</Title>
              <Paragraph>Data: {new Date(item.utcDate).toLocaleDateString()}</Paragraph>
              <Paragraph>Competição: {item.competition.name}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('Details', { matchId: item.id })}>
                Ver Det帶es
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 16,
    backgroundColor: '#1e90ff',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 4,
  },
});

export default HomeScreen;