import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const LOG_STORAGE_KEY = 'log_data';
const RECAP_STORAGE_KEY = 'recap_data';
const LAST_LOG_DATE_KEY = 'last_log_date';

export default function LogScreen() {
  const [logMeals, setLogMeals] = useState([]);

  useEffect(() => {
    moveLogsToRecap();
  }, []);

  const moveLogsToRecap = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastLogDate = await AsyncStorage.getItem(LAST_LOG_DATE_KEY);

      if (lastLogDate === today) return; // Already processed today

      const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (storedLog) {
        const pastLogs = JSON.parse(await AsyncStorage.getItem(RECAP_STORAGE_KEY)) || [];
        pastLogs.push({ date: lastLogDate, logs: JSON.parse(storedLog) });

        await AsyncStorage.setItem(RECAP_STORAGE_KEY, JSON.stringify(pastLogs));
        await AsyncStorage.removeItem(LOG_STORAGE_KEY);
      }

      await AsyncStorage.setItem(LAST_LOG_DATE_KEY, today);
    } catch (error) {
      console.error('Error moving logs to recap:', error);
    }
  };

  const loadLog = async () => {
    try {
      const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (storedLog) {
        setLogMeals(JSON.parse(storedLog));
      }
    } catch (error) {
      console.error('Failed to load log data', error);
    }
  };

  const updateLog = async (mealId: number) => {
    try {
      const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      let updatedLog = storedLog ? JSON.parse(storedLog) : [];

      updatedLog = updatedLog.map((meal: any) =>
        meal.id === mealId ? { ...meal, timeChecked: new Date().toLocaleTimeString() } : meal
      );

      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLog));
      setLogMeals(updatedLog);
    } catch (error) {
      console.error('Failed to update log data', error);
    }
  };

  // Ensure data updates when navigating back to the log page
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