import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useFocusEffect } from '@react-navigation/native';

// Define a consistent color palette
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

type Meal = {
  id: number;
  name: string;
  checked: boolean;
  editing: boolean;
  rating: number;
  timeChecked?: string;  // Make timeChecked optional
};

const STORAGE_KEY = 'meals_data';
const LOG_STORAGE_KEY = 'log_data';

export default function ChecklistScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newItemAnimation] = useState(new Animated.Value(0));
  
  // Load saved meals on component mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMeals !== null) {
          setMeals(JSON.parse(storedMeals).map((meal: Meal) => ({ ...meal, editing: false }))); 
        }
      } catch (error) {
        console.error('Failed to load meals from storage', error);
      }
    };
    loadMeals();
  }, []);
  // Add this near your other useEffect hooks
useEffect(() => {
  // Set up an interval to check for updates
  const checkForUpdates = async () => {
    try {
      const lastUpdate = await AsyncStorage.getItem('meals_updated_timestamp');
      if (lastUpdate && lastUpdate !== lastCheckedUpdate.current) {
        // Update the reference so we don't reload for the same update
        lastCheckedUpdate.current = lastUpdate;
        
        // Reload meals data
        const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMeals !== null) {
          setMeals(JSON.parse(storedMeals).map((meal) => ({ 
            ...meal, 
            editing: false 
          })));
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const updateInterval = setInterval(checkForUpdates, 1000);
  
  // Clean up interval on unmount
  return () => clearInterval(updateInterval);
}, []);
// Add this import at the top

// Add this in your ChecklistScreen component
useFocusEffect(
  React.useCallback(() => {
    const loadMeals = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMeals !== null) {
          setMeals(JSON.parse(storedMeals).map((meal) => ({ 
            ...meal, 
            editing: false 
          })));
        }
      } catch (error) {
        console.error('Failed to load meals from storage', error);
      }
    };

    loadMeals();
    
    // Reset the lastCheckedUpdate when screen comes into focus
    AsyncStorage.getItem('meals_updated_timestamp')
      .then(timestamp => {
        lastCheckedUpdate.current = timestamp;
      })
      .catch(error => console.error(error));
      
    return () => {};
  }, [])
);

// Add this ref to track the last checked update
const lastCheckedUpdate = React.useRef(null);

  // Load checklist items
  useEffect(() => {
    const loadChecklist = async () => {
      try {
        const storedChecklist = await AsyncStorage.getItem("selectedChecklistItem");
        if (storedChecklist) {
          setChecklistItems(JSON.parse(storedChecklist));
        }
      } catch (error) {
        console.error("Failed to load checklist items:", error);
      }
    };
  
    loadChecklist();
  }, []);

  // Save meals whenever they change
  useEffect(() => {
    const saveMeals = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
      } catch (error) {
        console.error('Failed to save meals to storage', error);
      }
    };
    saveMeals();
  }, [meals]);

  // Update log data - modified function
  const handleLogMeal = async () => {
    if (!selectedChecklistItem || !viewingMeal) return;
  
    try {
      // Get existing meals from storage - using STORAGE_KEY
      const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
      let mealsData = storedMeals ? JSON.parse(storedMeals) : [];
      
      // Find if this meal time already exists in the list
      const existingIndex = mealsData.findIndex(meal => meal.name === selectedChecklistItem);
      
      if (existingIndex >= 0) {
        // Update existing meal time entry
        mealsData[existingIndex] = {
          ...mealsData[existingIndex],
          checked: true,
          rating: viewingMeal.rating,
          timeChecked: new Date().toLocaleTimeString()
        };
      } else {
        // Add new meal time entry
        mealsData.push({
          id: Date.now(),
          name: selectedChecklistItem,
          checked: true,
          editing: false,
          rating: viewingMeal.rating,
          timeChecked: new Date().toLocaleTimeString()
        });
      }
      
      // Save the updated meals back to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mealsData));
      
      // NOTE: We've removed the LOG_STORAGE_KEY update from here
      // The ChecklistScreen component will handle that part
      
      console.log(`Successfully updated ${selectedChecklistItem} with ${viewingMeal.name}`);
    } catch (error) {
      console.error("Error updating meal:", error);
    }
    
    // Reset UI state
    setSelectedChecklistItem("");
    setViewingMeal(null);
  };

  // Add a new meal
  const addMeal = () => {
    const newMeal = { 
      id: Date.now(), 
      name: 'New Meal', 
      checked: false, 
      editing: true, 
      rating: 5 
    };
    
    setMeals([...meals, newMeal]);

    // Animate new item
    newItemAnimation.setValue(0);
    Animated.timing(newItemAnimation, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  };
  // Update the log data for a specific meal
// Update the log data for a specific meal
// Update the log data for a specific meal
const updateLog = async (mealId: number) => {
  try {
    // Get the meal we're updating
    const mealToUpdate = meals.find(meal => meal.id === mealId);
    if (!mealToUpdate) return;
    
    // Get existing log data
    const storedLogData = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    let logData = storedLogData ? JSON.parse(storedLogData) : [];
    
    // Format today's date as YYYY-MM-DD for log entries
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's log entry if it exists
    let todayLog = logData.find(log => log.date === today);
    
    if (!todayLog) {
      // Create a new log entry for today if it doesn't exist
      todayLog = { date: today, meals: [] };
      logData.push(todayLog);
    }
    
    if (mealToUpdate.checked) {
      // If the meal is now checked, add/update it in today's log
      const existingMealIndex = todayLog.meals.findIndex(
        m => m.id === mealId
      );
      
      const logEntry = {
        id: mealId,
        name: mealToUpdate.name,
        rating: mealToUpdate.rating || 5,
        timeChecked: new Date().toLocaleTimeString()
      };
      
      if (existingMealIndex >= 0) {
        // Update existing entry
        todayLog.meals[existingMealIndex] = logEntry;
      } else {
        // Add new entry
        todayLog.meals.push(logEntry);
      }
    } else {
      // If the meal is now unchecked, remove it from today's log
      todayLog.meals = todayLog.meals.filter(m => m.id !== mealId);
      
      // If no meals left for today, remove today's entry completely
      if (todayLog.meals.length === 0) {
        logData = logData.filter(log => log.date !== today);
      }
    }
    
    // Save updated log data
    await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logData));
    
    // Update the timestamp to trigger sync in other screens
    await AsyncStorage.setItem('meals_updated_timestamp', Date.now().toString());
    
  } catch (error) {
    console.error('Failed to update log data', error);
  }
};

  // Remove a meal
  const removeMeal = (id: number) => {
    // If the meal was checked, also update the log
    const mealToRemove = meals.find(meal => meal.id === id);
    if (mealToRemove?.checked) {
      updateLog(id); // This will remove it from the log
    }
    
    setMeals(meals.filter(meal => meal.id !== id));
  };

  // Add this to your state
const [refreshing, setRefreshing] = useState(false);

// Add this function
const onRefresh = React.useCallback(() => {
  setRefreshing(true);
  
  const loadMeals = async () => {
    try {
      const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMeals !== null) {
        setMeals(JSON.parse(storedMeals).map((meal) => ({ 
          ...meal, 
          editing: false 
        })));
      }
    } catch (error) {
      console.error('Failed to load meals from storage', error);
    }
    setRefreshing(false);
  };

  loadMeals();
}, []);

// Then in your DraggableFlatList add these props:


  // Toggle check status - modified function
  // Toggle check status
// In ChecklistScreen (index.tsx)
// Modified toggleCheck function to preserve meal info
const toggleCheck = (id: number) => {
  // First update the meals state
  const updatedMeals = meals.map(meal => {
    if (meal.id === id) {
      const newCheckedState = !meal.checked;
      return { 
        ...meal, 
        checked: newCheckedState, 
        rating: newCheckedState ? (meal.rating || 5) : 0,
        timeChecked: newCheckedState ? new Date().toLocaleTimeString() : undefined
      };
    }
    return meal;
  });
  
  // Update state immediately
  setMeals(updatedMeals);
  
  // Then update the log
  const mealToUpdate = updatedMeals.find(meal => meal.id === id);
  if (mealToUpdate) {
    updateLogForMeal(mealToUpdate);
  }
};

// Updated updateLogForMeal to preserve meal association
const updateLogForMeal = async (meal: { id: any; name: any; checked: any; editing?: boolean; rating: any; timeChecked: any; associatedMeal?: any; }) => {
  try {
    // Get existing log data
    const storedLogData = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    let logData = storedLogData ? JSON.parse(storedLogData) : [];
    
    // Format today's date as YYYY-MM-DD for log entries
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's log entry if it exists
    let todayLogIndex = logData.findIndex((log: { date: string; }) => log.date === today);
    let todayLog;
    
    if (todayLogIndex >= 0) {
      todayLog = logData[todayLogIndex];
    } else {
      // Create a new log entry for today if it doesn't exist
      todayLog = { date: today, meals: [] };
      logData.push(todayLog);
      todayLogIndex = logData.length - 1;
    }
    
    if (meal.checked) {
      // Find if meal already exists in today's log
      const existingMealIndex = todayLog.meals.findIndex(m => m.id === meal.id);
      
      const logEntry = {
        id: meal.id,
        name: meal.name,
        rating: meal.rating || 5,
        timeChecked: meal.timeChecked || new Date().toLocaleTimeString(),
        // Preserve associatedMeal if it exists
        associatedMeal: meal.associatedMeal || null
      };
      
      if (existingMealIndex >= 0) {
        // Update existing entry but preserve associatedMeal if it exists
        if (todayLog.meals[existingMealIndex].associatedMeal) {
          logEntry.associatedMeal = todayLog.meals[existingMealIndex].associatedMeal;
        }
        todayLog.meals[existingMealIndex] = logEntry;
      } else {
        // Add new entry
        todayLog.meals.push(logEntry);
      }
      
      // Update the log data with the modified today's entry
      logData[todayLogIndex] = todayLog;
    } else {
      // Remove the meal from today's log
      todayLog.meals = todayLog.meals.filter((m: { id: any; }) => m.id !== meal.id);
      
      // If today's log is now empty, remove it completely
      if (todayLog.meals.length === 0) {
        logData = logData.filter((log: { date: string; }) => log.date !== today);
      } else {
        // Otherwise update the log data with modified today's entry
        logData[todayLogIndex] = todayLog;
      }
    }
    
    // Save updated log data
    await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logData));
    
    // Update the timestamp to trigger sync in other screens
    await AsyncStorage.setItem('meals_updated_timestamp', Date.now().toString());
    
    console.log(`Updated log for meal ${meal.id} - checked: ${meal.checked}`);
  } catch (error) {
    console.error('Failed to update log data', error);
  }
};

  // Update meal name
  const updateMealName = (id: number, newName: string) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, name: newName } : meal)));
    
    // If this meal is checked, update its name in the log too
    const mealToUpdate = meals.find(meal => meal.id === id);
    if (mealToUpdate?.checked) {
      updateLog(id);
    }
  };

  // Save edit mode
  const saveEdit = (id: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, editing: false } : meal)));
  };

  // Set rating - modified function
  const setRating = (id: number, rating: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, rating } : meal)));
    
    // If this meal is checked, update its rating in the log too
    const mealToUpdate = meals.find(meal => meal.id === id);
    if (mealToUpdate?.checked) {
      updateLog(id);
    }
  };

  // Handle drag end
  const handleDragEnd = ({ data }: { data: Meal[] }) => {
    setMeals(data);
  };

  // Render rating label based on value
  const getRatingLabel = (rating: number) => {
    if (rating <= 3) return "Unhealthy";
    if (rating <= 6) return "Average";
    if (rating <= 8) return "Healthy";
    return "Super Healthy";
  };
  
  // Render meal item - unchanged from original
  const renderMealItem = ({ item, drag, isActive }: RenderItemParams<Meal>) => (
    <Animated.View 
      key={item.id} 
      style={[
        styles.mealCard,
        item.checked && styles.checkedMealCard,
        isActive && styles.activeDragItem,
        { opacity: newItemAnimation }
      ]}
    >
      <View style={styles.mealHeader}>
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => toggleCheck(item.id)}
        >
          <Ionicons 
            name={item.checked ? "checkmark-circle" : "ellipse-outline"} 
            size={28} 
            color={item.checked ? COLORS.secondary : COLORS.lightText} 
          />
        </TouchableOpacity>

        {item.editing ? (
          <TextInput
            style={styles.input}
            value={item.name}
            onChangeText={(text) => updateMealName(item.id, text)}
            onBlur={() => saveEdit(item.id)}
            autoFocus
          />
        ) : (
          <TouchableOpacity 
            onPress={() => setMeals(meals.map(meal => 
              meal.id === item.id ? { ...meal, editing: true } : meal
            ))} 
            style={styles.mealNameContainer}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.mealName,
              item.checked && styles.checkedText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.iconContainer}>
          <TouchableOpacity 
            onPress={() => removeMeal(item.id)}
            style={styles.iconButton}
          >
<Ionicons name="trash-outline" size={22} color={COLORS.danger} />
          </TouchableOpacity>

          <TouchableOpacity 
            onLongPress={drag}
            style={styles.dragHandler}
          >
            <Ionicons name="menu-outline" size={24} color={COLORS.lightText} />
          </TouchableOpacity>
        </View>
      </View>

      {item.checked && (
        <View style={styles.ratingContainer}>
          <View style={styles.ratingLabelContainer}>
            <Text style={styles.ratingLabel}>Health Rating</Text>
            <View style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(item.rating) }
            ]}>
              <Text style={styles.ratingBadgeText}>{getRatingLabel(item.rating)}</Text>
            </View>
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.ratingValue}>{item.rating}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={item.rating}
              onValueChange={(value) => setRating(item.id, value)}
              minimumTrackTintColor={COLORS.secondary}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.secondary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderMinLabel}>1</Text>
              <Text style={styles.sliderMaxLabel}>10</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Meal Tracker</Text>
            <Text style={styles.subtitle}>Track your daily meals and their health rating</Text>
          </View>

          {meals.length === 0 ? (
            <ScrollView contentContainerStyle={styles.emptyStateContainer}>
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={60} color="#ccc" />
                <Text style={styles.emptyStateText}>No meals added yet</Text>
                <Text style={styles.emptyStateSubtext}>Tap the button below to add your first meal</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.listWrapper}>
              <DraggableFlatList
                data={meals}
                keyExtractor={(item) => item.id.toString()}
                onDragEnd={handleDragEnd}
                contentContainerStyle={styles.listContainer}
                renderItem={renderMealItem}
                showsVerticalScrollIndicator={true}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.addMealButton} 
              onPress={addMeal}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.buttonText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

// Helper function to get color based on rating
const getRatingColor = (rating: number) => {
  if (rating <= 3) return '#E74C3C'; // Red for unhealthy
  if (rating <= 6) return '#F39C12'; // Orange for average
  if (rating <= 8) return '#27AE60'; // Green for healthy
  return '#2ECC71';                  // Bright green for super healthy
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background
  },
  
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  
  screenTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.text
  },
  
  subtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4
  },
  
  listWrapper: {
    flex: 1,
    paddingHorizontal: 20
  },
  
  listContainer: { 
    paddingBottom: 100
  },

  mealCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 0,
  },
  
  checkedMealCard: {
    backgroundColor: COLORS.checkedBackground,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  
  activeDragItem: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    transform: [{ scale: 1.02 }]
  },

  mealHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  
  checkboxContainer: {
    marginRight: 12,
  },

  input: { 
    flex: 1, 
    fontSize: 16, 
    borderBottomWidth: 1, 
    borderColor: COLORS.primary, 
    padding: 6,
    color: COLORS.text,
  },

  mealNameContainer: { 
    flex: 1, 
    paddingVertical: 6 
  },

  mealName: { 
    fontSize: 18, 
    fontWeight: '600',
    color: COLORS.text,
  },
  
  checkedText: {
    color: COLORS.lightText,
  },

  iconContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  
  iconButton: {
    padding: 6,
  },
  
  dragHandler: {
    padding: 6,
    marginLeft: 4,
  },

  ratingContainer: { 
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  ratingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.lightText,
  },
  
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  ratingBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  sliderContainer: {
    marginTop: 6,
  },
  
  ratingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },

  slider: { 
    width: '100%', 
    height: 40,
  },
  
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  
  sliderMinLabel: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  
  sliderMaxLabel: {
    fontSize: 12,
    color: COLORS.lightText,
  },

  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 5 
  },

  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 14,     // Taller button
    paddingHorizontal: 20,   // Wider button
    borderRadius: 50,
    justifyContent: 'center',
    width: '80%',            // Not too wide
    alignSelf: 'center',
    position: 'absolute',
    bottom: 25,              // Slightly higher
    shadowColor: "#000",     // Add shadow to button
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 16
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center'
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10
  },
});