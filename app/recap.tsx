import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECAP_STORAGE_KEY = 'recap_data';

export default function RecapScreen() {
  const [pastLogs, setPastLogs] = useState([]);

  useEffect(() => {
    loadRecapLogs();
  }, []);

  const loadRecapLogs = async () => {
    try {
      const storedRecap = await AsyncStorage.getItem(RECAP_STORAGE_KEY);
      console.log('Stored Recap Data:', storedRecap); // Debugging: Check if data is being stored
  
      if (storedRecap) {
        setPastLogs(JSON.parse(storedRecap));
      }
    } catch (error) {
      console.error('Failed to load recap data', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Past Logs</Text>
      {pastLogs.length === 0 ? (
        <Text style={styles.noLogsText}>No past logs available.</Text>
      ) : (
        <FlatList
          data={pastLogs}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.logCard}>
              <Text style={styles.logDate}>{item.date}</Text>
              {item.logs.map((meal: { name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; rating: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; timeChecked: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; checklistItem: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                <View key={index} style={styles.mealItem}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDetails}>Health: {meal.rating}</Text>
                  <Text style={styles.mealDetails}>Checked at: {meal.timeChecked}</Text>
                  {meal.checklistItem && (
                    <Text style={styles.mealDetails}>✔ Linked to: {meal.checklistItem}</Text>
                  )}
                </View>
              ))}
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
  noLogsText: { fontSize: 16, textAlign: 'center', color: '#888', marginTop: 20 },
  logCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    textAlign: 'center',
  },
  logDate: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  mealItem: { marginTop: 5, paddingLeft: 10 },
  mealName: { fontSize: 16, fontWeight: 'bold' },
  mealDetails: { fontSize: 14, color: '#555' },
});