import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const LOG_STORAGE_KEY = 'log_data';

export default function LogScreen() {
  const [logMeals, setLogMeals] = useState<{ id: number; name: string; rating: number; timeChecked: string; checklistItem?: string }[]>([]);

  const loadLog = async () => {
    try {
      const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (storedLog !== null) {
        setLogMeals(JSON.parse(storedLog));
      }
    } catch (error) {
      console.error('Failed to load log data', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLog();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Log</Text>
      {logMeals.length === 0 ? (
        <Text style={styles.noMealsText}>No meals logged yet.</Text>
      ) : (
        <FlatList
          data={logMeals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.mealDetails}>Health: {item.rating}</Text>
              <Text style={styles.mealDetails}>Checked at: {item.timeChecked}</Text>
              {item.checklistItem && (
                <Text style={styles.mealDetails}>✔ Linked to: {item.checklistItem}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  noMealsText: { fontSize: 16, textAlign: 'center', color: '#888', marginTop: 20 },
  mealCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealName: { fontSize: 18, fontWeight: 'bold' },
  mealDetails: { fontSize: 14, color: '#555' },
});