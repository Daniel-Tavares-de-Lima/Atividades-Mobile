import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailsScreen = ({ route }) => {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.football-data.org/v4/matches/${matchId}`,
          {
            headers: { 'X-Auth-Token': '87b94f0551de4257a3232a62a3152c6e' } // TOKEN DA API
          }
        );
        setMatch(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMatchDetails();
  }, [matchId]);

  const addToFavorites = async () => {
    try {
      const existingFavorites = await AsyncStorage.getItem('favoriteMatches') || '[]';
      const favorites = JSON.parse(existingFavorites);
      if (!favorites.some((fav) => fav.id === match.id)) {
        favorites.push(match);
        await AsyncStorage.setItem('favoriteMatches', JSON.stringify(favorites));
        alert('Partida adicionada aos favoritos!');
      } else {
        alert('Partida já está nos favoritos!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!match) {
    return <Paragraph>Carregando...</Paragraph>;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{`${match.homeTeam.name} vs ${match.awayTeam.name}`}</Title>
          <Paragraph>Competição: {match.competition.name}</Paragraph>
          <Paragraph>Data: {new Date(match.utcDate).toLocaleDateString()}</Paragraph>
          <Paragraph>Placar: {match.score.fullTime.home ?? '-'} x {match.score.fullTime.away ?? '-'}</Paragraph>
          <Paragraph>Estádio: {match.venue || 'Não informado'}</Paragraph>
          <Paragraph>Status: {match.status}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={addToFavorites} mode="contained" style={styles.button}>
            Adicionar aos Favoritos
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 8,
    elevation: 4,
  },
  button: {
    backgroundColor: '#1e90ff',
  },
});

export default DetailsScreen;