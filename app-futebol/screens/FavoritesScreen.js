import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const FavoriteItem = ({ item, removeFavorite, navigateToDetails }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{`${item.homeTeam.name} vs ${item.awayTeam.name}`}</Title>
        <Paragraph>Data: {new Date(item.utcDate).toLocaleDateString()}</Paragraph>
        <Paragraph>Competição: {item.competition.name}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigateToDetails(item.id)}>Ver Detalhes</Button>
        <Button onPress={() => removeFavorite(item.id)}>Remover dos Favoritos</Button>
      </Card.Actions>
    </Card>
  );
};

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const storedFavorites = await AsyncStorage.getItem('favoriteMatches');
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
          }
        } catch (error) {
          console.error(error);
        }
      };
      loadFavorites();
    }, [])
  );

  const removeFavorite = async (matchId) => {
    try {
      const updatedFavorites = favorites.filter((match) => match.id !== matchId);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favoriteMatches', JSON.stringify(updatedFavorites));
      alert('Partida removida dos favoritos!');
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToDetails = (matchId) => {
    navigation.navigate('Details', { matchId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FavoriteItem
            item={item}
            removeFavorite={removeFavorite}
            navigateToDetails={navigateToDetails}
          />
        )}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
        windowSize={10}
        maxToRenderPerBatch={5}
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
  card: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 4,
  },
});

export default FavoritesScreen;