import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';

const COLORS = {
  primary: '#2E86C1',       // Primary blue
  secondary: '#27AE60',     // Secondary green
  background: '#F8F9FA',    // Light background
  card: '#FFFFFF',          // Card background
  text: '#333333',          // Primary text
  lightText: '#777777',     // Secondary text
  danger: '#E74C3C',        // Red for delete
  border: '#EEEEEE',        // Light border color
  checkedBackground: '#F0F9F0', // Light green for checked items
};

const LOG_STORAGE_KEY = 'log_data';
const RECAP_STORAGE_KEY = 'recap_data';
const LAST_LOG_DATE_KEY = 'last_log_date';

export default function LogScreen() {
  const [logData, setLogData] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState('');

  // Run once when component mounts
  useEffect(() => {
    const initializeApp = async () => {
      updateCurrentDay();
      await moveLogsToRecap();
      await loadLog();
      setIsLoading(false);
    };
    
    initializeApp();
  }, []);

  // Function to update the current day
  const updateCurrentDay = () => {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    setCurrentDay(formattedDate);
  };

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

  // Load meals data directly from meals_data storage
  const loadLog = async () => {
    try {
      // Get all the meals data
      const storedMeals = await AsyncStorage.getItem('meals_data');
      
      if (!storedMeals) {
        setTodaysMeals([]);
        return;
      }
      
      const mealsData = JSON.parse(storedMeals);
      
      // Filter to find only checked meals for today
      const checkedMeals = mealsData.filter(meal => meal.checked === true);
      
      // Format them for display, preserving the original structure including associatedMeal
      const formattedMeals = checkedMeals.map(meal => {
        // Create a properly formatted meal object
        const formattedMeal = {
          id: meal.id,
          name: meal.name,
          rating: meal.rating || 0,
          timeChecked: meal.timeChecked || new Date().toLocaleTimeString()
        };
        
        // If this meal has an associated meal, include that information
        if (meal.associatedMeal) {
          formattedMeal.associatedMeal = {
            id: meal.associatedMeal.id,
            name: meal.associatedMeal.name,
            rating: meal.associatedMeal.rating || 0
          };
        }
        
        return formattedMeal;
      });
      
      setTodaysMeals(formattedMeals);
      
      // Update the log data for historical purposes
      const today = new Date().toISOString().split('T')[0];
      const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      let logData = storedLog ? JSON.parse(storedLog) : [];
      
      // Find today's log entry if it exists
      const todayLogIndex = logData.findIndex(log => log.date === today);
      
      if (todayLogIndex >= 0) {
        // Update existing entry
        logData[todayLogIndex].meals = formattedMeals;
      } else if (formattedMeals.length > 0) {
        // Only create a new entry if there are meals to log
        logData.push({
          date: today,
          meals: formattedMeals
        });
      }
      
      // Save updated log data
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logData));
      setLogData(logData);
      
    } catch (error) {
      console.error('Failed to load meals data', error);
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
              // 1. Get today's date
              const today = new Date().toISOString().split('T')[0];
              
              // 2. Clear all meals (uncheck and reset ratings)
              const storedMeals = await AsyncStorage.getItem('meals_data');
              if (storedMeals) {
                let mealsData = JSON.parse(storedMeals);
                
                // Completely uncheck all meals and reset their properties
                mealsData = mealsData.map(meal => ({
                  ...meal,
                  checked: false,
                  rating: 0,
                  timeChecked: null,
                  associatedMeal: null // Clear any meal associations
                }));
                
                // Save the updated meals
                await AsyncStorage.setItem('meals_data', JSON.stringify(mealsData));
              }
              
              // 3. Remove today's log entry completely
              const storedLog = await AsyncStorage.getItem(LOG_STORAGE_KEY);
              if (storedLog) {
                let logData = JSON.parse(storedLog);
                // Filter out today's entry
                logData = logData.filter(log => log.date !== today);
                await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logData));
                setLogData(logData);
              }
              
              // 4. Update state to show empty log
              setTodaysMeals([]);
              
              // 5. Create a force refresh signal by setting a unique timestamp
              const clearTimestamp = Date.now().toString();
              await AsyncStorage.setItem('meals_updated_timestamp', clearTimestamp);
              await AsyncStorage.setItem('log_cleared_timestamp', clearTimestamp);
              
              console.log('Log cleared successfully');
            } catch (error) {
              console.error('Failed to clear log', error);
              Alert.alert("Error", "Failed to clear log. Please try again.");
            }
          } 
        }
      ]
    );
  };

  // Ensure data updates when navigating back to the log page
  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        updateCurrentDay();
        loadLog();
      }
    }, [isLoading])
  );

  // Set up a listener for changes in meals
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const lastUpdateStr = await AsyncStorage.getItem('meals_updated_timestamp');
        if (lastUpdateStr && !isLoading) {
          loadLog();
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };
    
    // Check once on mount
    checkForUpdates();
    
    // Listen for app state changes (like when app comes back from background)
    const interval = setInterval(checkForUpdates, 3000); // Check every 3 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [isLoading]);

  // Generate a safe key for the FlatList items
  const getItemKey = (item, index) => {
    return item && item.id ? item.id.toString() : `meal-${index}`;
  };

  // This render item function matches the original format
  const renderMealItem = ({ item }) => {
    if (!item) return null;
    
    return (
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
    );
  };

  return (
    <View style={styles.container}>
      {/* Current Day Display */}
      <Text style={styles.currentDay}>{currentDay}</Text>
      
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
      
      {isLoading ? (
        <Text style={styles.noMealsText}>Loading...</Text>
      ) : todaysMeals.length === 0 ? (
        <View style={styles.emptyStateContainer}>
                    <Icon name="list-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyStateText}>No items selected yet</Text>
                    <Text style={styles.emptyStateSubtext}>Check off items for them to appear</Text>
                  </View>
      ) : (
        <FlatList
          data={todaysMeals}
          keyExtractor={getItemKey}
          renderItem={renderMealItem}
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
  currentDay: {
    fontSize: 16,
    color: COLORS.lightText,
    marginBottom: 6,
    fontWeight: '500',
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 8,
  },
});
