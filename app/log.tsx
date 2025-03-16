import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LOG_STORAGE_KEY = 'log_data';
const RECAP_STORAGE_KEY = 'recap_data';
const LAST_LOG_DATE_KEY = 'last_log_date';

export default function LogScreen() {
  const [logData, setLogData] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);

  // Run once when component mounts
  useEffect(() => {
    moveLogsToRecap();
  }, []);

  const moveLogsToRecap = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastLogDate = await AsyncStorage.getItem(LAST_LOG_DATE_KEY);

      // Skip if we've already processed today or if there's no last log date
      if (!lastLogDate || lastLogDate === today) {
        // Just set today as the last log date if it's not set
        if (!lastLogDate) {
          await AsyncStorage.setItem(LAST_LOG_DATE_KEY, today);
        }
        return;
      }

      // Get the stored log data
      const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (storedLog) {
        // Get existing recap data or initialize empty array
        const pastLogs = JSON.parse(await AsyncStorage.getItem(RECAP_STORAGE_KEY)) || [];
        
        // Add yesterday's logs to recap
        const logData = JSON.parse(storedLog);
        // Find yesterday's log if it exists
        const yesterdaysLog = logData.find(log => log.date === lastLogDate);
        
        if (yesterdaysLog) {
          pastLogs.push(yesterdaysLog);
          
          // Remove yesterday's log from the current log data
          const updatedLogData = logData.filter(log => log.date !== lastLogDate);
          
          // Save updated log data (without yesterday's log)
          await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogData));
          
          // Save updated recap data (with yesterday's log added)
          await AsyncStorage.setItem(RECAP_STORAGE_KEY, JSON.stringify(pastLogs));
        }
      }

      // Update the last log date to today
      await AsyncStorage.setItem(LAST_LOG_DATE_KEY, today);
    } catch (error) {
      console.error('Error moving logs to recap:', error);
    }
  };

  const loadLog = async () => {
    try {
      console.log('Loading log data...');
      const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      
      if (storedLog) {
        const logData = JSON.parse(storedLog);
        console.log('Log data loaded:', logData);
        setLogData(logData);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Find today's log entry
        const todayLog = logData.find(log => log.date === today);
        console.log('Today\'s log:', todayLog);
        
        if (todayLog && todayLog.meals) {
          setTodaysMeals(todayLog.meals);
        } else {
          setTodaysMeals([]);
        }
      } else {
        console.log('No log data found');
        setLogData([]);
        setTodaysMeals([]);
      }
    } catch (error) {
      console.error('Failed to load log data', error);
      setLogData([]);
      setTodaysMeals([]);
    }
  };

  const clearLog = () => {
    Alert.alert(
      "Clear Log",
      "Are you sure you want to clear today's log? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            try {
              // Get today's date
              const today = new Date().toISOString().split('T')[0];
              
              // Get current log data
              const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
              if (!storedLog) return;
              
              let logData = JSON.parse(storedLog);
              
              // Remove today's entry from the log data
              logData = logData.filter(log => log.date !== today);
              
              // Save the updated log data
              await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logData));
              
              // Also need to update the meals list to uncheck any checked meals
              const storedMeals = await AsyncStorage.getItem('meals_data');
              if (storedMeals) {
                let mealsData = JSON.parse(storedMeals);
                
                // Uncheck all meals
                mealsData = mealsData.map(meal => ({
                  ...meal,
                  checked: false,
                  rating: 0
                }));
                
                // Save the updated meals
                await AsyncStorage.setItem('meals_data', JSON.stringify(mealsData));
                
                // Update the timestamp to trigger sync in other screens
                await AsyncStorage.setItem('meals_updated_timestamp', Date.now().toString());
              }
              
              // Update state to show empty log
              setTodaysMeals([]);
            } catch (error) {
              console.error('Failed to clear log', error);
            }
          } 
        }
      ]
    );
  };

  // Ensure data updates when navigating back to the log page
  useFocusEffect(
    useCallback(() => {
      loadLog();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Today's Log</Text>
        {todaysMeals.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearLog}
          >
            <Ionicons name="trash-outline" size={22} color="#E74C3C" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {todaysMeals.length === 0 ? (
        <Text style={styles.noMealsText}>No meals logged yet.</Text>
      ) : (
        <FlatList
  data={todaysMeals}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.mealCard}>
      <Text style={styles.mealName}>{item.name}</Text>
      
      {item.associatedMeal ? (
        <>
          <Text style={styles.mealDetails}>
            <Text style={styles.boldText}>Meal:</Text> {item.associatedMeal.name}
          </Text>
          <Text style={styles.mealDetails}>
            <Text style={styles.boldText}>Health Rating:</Text> {item.associatedMeal.rating}/10
          </Text>
        </>
      ) : (
        <Text style={styles.mealDetails}>
          <Text style={styles.boldText}>Health Rating:</Text> {item.rating}/10
        </Text>
      )}
      
      {item.timeChecked && (
        <Text style={styles.mealDetails}>
          <Text style={styles.boldText}>Logged at:</Text> {item.timeChecked}
        </Text>
      )}
    </View>
  )}
/>

      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f8f9fa' 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  clearButtonText: {
    color: '#E74C3C',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 14,
  },
  noMealsText: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#888', 
    marginTop: 20 
  },
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
  mealName: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  mealDetails: { 
    fontSize: 14, 
    color: '#555',
    marginTop: 4
  },
  boldText: {
    fontWeight: 'bold'
  },
});