import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/Feather";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Meal {
  id: number;
  name: string;
  ingredients: string;
  recipe: string;
  rating: number;
}

interface ChecklistItem {
  id: number;
  name: string;
  checked: boolean;
}

const STORAGE_KEY = "meals_data";
const LOG_STORAGE_KEY = "log_data";

const presetMeals: Meal[] = [
  {
    id: 1,
    name: "Grilled Salmon & Quinoa",
    ingredients: "Salmon, quinoa, spinach, lemon",
    recipe: "Grill salmon, cook quinoa, mix with spinach, drizzle lemon.",
    rating: 9,
  },
  {
    id: 2,
    name: "Avocado Toast with Egg",
    ingredients: "Whole grain bread, avocado, egg",
    recipe: "Toast bread, mash avocado, cook egg, assemble, season.",
    rating: 8,
  },
  {
    id: 3,
    name: "Mediterranean Chickpea Bowl",
    ingredients: "Chickpeas, cucumber, cherry tomatoes, red onion, feta cheese, olive oil, lemon juice, herbs",
    recipe: "Combine chickpeas with diced vegetables. Add crumbled feta, drizzle with olive oil and lemon juice. Sprinkle with herbs and serve.",
    rating: 8,
  },
  {
    id: 4,
    name: "Grilled Chicken Salad",
    ingredients: "Chicken breast, mixed greens, bell peppers, carrots, almonds, balsamic vinaigrette",
    recipe: "Grill seasoned chicken breast. Slice and arrange over mixed greens with chopped vegetables. Top with almonds and drizzle with dressing.",
    rating: 7,
  },
  {
    id: 5,
    name: "Vegetable Stir-Fry with Tofu",
    ingredients: "Firm tofu, broccoli, carrots, snap peas, bell peppers, garlic, ginger, soy sauce, sesame oil",
    recipe: "Press and cube tofu. Sauté with garlic and ginger. Add vegetables and cook until tender-crisp. Season with soy sauce and sesame oil.",
    rating: 8,
  },
  {
    id: 6,
    name: "Sweet Potato Black Bean Burrito",
    ingredients: "Sweet potatoes, black beans, brown rice, avocado, red onion, lime, cilantro, tortilla",
    recipe: "Roast diced sweet potatoes. Mix with cooked black beans and brown rice. Add diced avocado, red onion, and cilantro. Squeeze lime juice, wrap in tortilla.",
    rating: 9,
  },
  {
    id: 7,
    name: "Berry Protein Smoothie Bowl",
    ingredients: "Mixed berries, Greek yogurt, protein powder, almond milk, chia seeds, granola, honey",
    recipe: "Blend berries, yogurt, protein powder and almond milk until smooth. Pour into bowl. Top with chia seeds, granola, and a drizzle of honey.",
    rating: 7,
  },
];

export default function Meals() {
  const [meals, setMeals] = useState<Meal[]>(presetMeals);
  const [creatingMeal, setCreatingMeal] = useState(false);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealIngredients, setMealIngredients] = useState("");
  const [mealRecipe, setMealRecipe] = useState("");
  const [mealRating, setMealRating] = useState(5);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState("");

  useEffect(() => {
    const loadChecklistItems = async () => {
      try {
        // Get the meals data from storage
        const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMeals) {
          // Extract only the meal names to use as checklist items
          const parsedMeals = JSON.parse(storedMeals);
          const mealNames = parsedMeals.map(meal => ({
            id: meal.id,
            name: meal.name
          }));
          setChecklistItems(mealNames);
        } else {
          // Set default checklist items if no meals exist
          const defaultItems = [
            { id: 1, name: "Breakfast" },
            { id: 2, name: "Lunch" },
            { id: 3, name: "Dinner" },
            { id: 4, name: "Snack" }
          ];
          setChecklistItems(defaultItems);
        }
      } catch (error) {
        console.error("Error loading checklist items:", error);
      }
    };
  
    loadChecklistItems();
  }, []);
  // Add this useEffect to the Meals component
useEffect(() => {
  // Check for log clearing events
  const checkForLogClearing = async () => {
    try {
      const logClearedTimestamp = await AsyncStorage.getItem('log_cleared_timestamp');
      
      if (logClearedTimestamp) {
        // If log was cleared, reset the selection state in this component
        setSelectedChecklistItem("");
        
        // Clear the timestamp to avoid repeated processing
        await AsyncStorage.removeItem('log_cleared_timestamp');
      }
    } catch (error) {
      console.error('Error checking for log clearing:', error);
    }
  };
  
  const interval = setInterval(checkForLogClearing, 1000);
  
  // Check once immediately
  checkForLogClearing();
  
  return () => clearInterval(interval);
}, []);

  const saveChecklistItems = async (items: ChecklistItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving checklist items:", error);
    }
  };

  const handleSaveMeal = () => {
    if (!mealName || !mealIngredients || !mealRecipe) return;

    if (editingMeal) {
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === editingMeal.id
            ? {
                ...meal,
                name: mealName,
                ingredients: mealIngredients,
                recipe: mealRecipe,
                rating: mealRating,
              }
            : meal
        )
      );
      setEditingMeal(null);
    } else {
      const newMeal: Meal = {
        id: Date.now(),
        name: mealName,
        ingredients: mealIngredients,
        recipe: mealRecipe,
        rating: mealRating,
      };
      setMeals([...meals, newMeal]);
    }

    resetForm();
  };

  const resetForm = () => {
    setMealName("");
    setMealIngredients("");
    setMealRecipe("");
    setMealRating(5);
    setCreatingMeal(false);
    setViewingMeal(null);
    setEditingMeal(null);
  };

  const handleDeleteMeal = (id: number) => {
    setMeals(meals.filter((meal) => meal.id !== id));
    setViewingMeal(null);
  };

  const handleEditMeal = () => {
    if (viewingMeal) {
      setEditingMeal(viewingMeal);
      setMealName(viewingMeal.name);
      setMealIngredients(viewingMeal.ingredients);
      setMealRecipe(viewingMeal.recipe);
      setMealRating(viewingMeal.rating);
      setCreatingMeal(true);
      setViewingMeal(null);
    }
  };

  // In Meals.tsx
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
        timeChecked: new Date().toLocaleTimeString(),
        // Store associated meal information
        associatedMeal: {
          id: viewingMeal.id,
          name: viewingMeal.name,
          rating: viewingMeal.rating
        }
      };
    } else {
      // Add new meal time entry
      mealsData.push({
        id: Date.now(),
        name: selectedChecklistItem,
        checked: true,
        editing: false,
        rating: viewingMeal.rating,
        timeChecked: new Date().toLocaleTimeString(),
        // Store associated meal information
        associatedMeal: {
          id: viewingMeal.id,
          name: viewingMeal.name,
          rating: viewingMeal.rating
        }
      });
    }
    
    // Save the updated meals back to storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mealsData));
    
    // IMPORTANT: Now also update the LOG_STORAGE_KEY to reflect this meal association
    const storedLogData = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    let logData = storedLogData ? JSON.parse(storedLogData) : [];
    
    // Format today's date as YYYY-MM-DD for log entries
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's log entry if it exists
    let todayLogIndex = logData.findIndex(log => log.date === today);
    let todayLog;
    
    if (todayLogIndex >= 0) {
      todayLog = logData[todayLogIndex];
    } else {
      // Create a new log entry for today if it doesn't exist
      todayLog = { date: today, meals: [] };
      logData.push(todayLog);
      todayLogIndex = logData.length - 1;
    }
    
    // Find if this checklist item already exists in today's log
    const existingMealIndex = todayLog.meals.findIndex(m => 
      m.name === selectedChecklistItem
    );
    
    const logEntry = {
      id: existingIndex >= 0 ? mealsData[existingIndex].id : Date.now(),
      name: selectedChecklistItem,
      rating: viewingMeal.rating,
      timeChecked: new Date().toLocaleTimeString(),
      associatedMeal: {
        id: viewingMeal.id,
        name: viewingMeal.name,
        rating: viewingMeal.rating
      }
    };
    
    if (existingMealIndex >= 0) {
      // Update existing log entry
      todayLog.meals[existingMealIndex] = logEntry;
    } else {
      // Add new log entry
      todayLog.meals.push(logEntry);
    }
    
    // Update the log data
    logData[todayLogIndex] = todayLog;
    
    // Save updated log data
    await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logData));
    
    // Update the timestamp to trigger sync in other screens
    await AsyncStorage.setItem('meals_updated_timestamp', Date.now().toString());
    
    console.log(`Successfully updated ${selectedChecklistItem} with ${viewingMeal.name}`);
  } catch (error) {
    console.error("Error updating meal:", error);
  }
  
  // Reset UI state
  setSelectedChecklistItem("");
  setViewingMeal(null);
};
  // Force a refresh of the index page 
const forceIndexRefresh = async () => {
  try {
    // This is a trick to force the index page to refresh
    // We store a timestamp that the index page can watch for changes
    await AsyncStorage.setItem('last_meals_update', Date.now().toString());
  } catch (error) {
    console.error('Failed to set refresh trigger:', error);
  }
};

  return (
    <View style={styles.container}>
      {!creatingMeal && !viewingMeal && (
        <>
          <FlatList
            data={meals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.mealName}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => setViewingMeal(item)}
                  style={styles.viewButton}
                >
                  <Text style={styles.buttonText}>View Meal</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => setCreatingMeal(true)}
          >
            <Icon name="plus" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}

      {creatingMeal && (
        <ScrollView style={styles.mealView}>
          <Text style={styles.header}>
            {editingMeal ? "Edit Meal" : "Add a New Meal"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Meal Name"
            value={mealName}
            onChangeText={setMealName}
          />
          <TextInput
            style={[styles.input, styles.largeInput]}
            placeholder="Ingredients"
            value={mealIngredients}
            onChangeText={setMealIngredients}
            multiline
          />
          <TextInput
            style={[styles.input, styles.largeInput]}
            placeholder="Recipe"
            value={mealRecipe}
            onChangeText={setMealRecipe}
            multiline
          />
          <Text>Health Rating: {mealRating}/10</Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={mealRating}
            onValueChange={setMealRating}
          />
          <TouchableOpacity onPress={handleSaveMeal} style={styles.saveButton}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetForm} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {viewingMeal && (
        <View style={styles.mealView}>
          <Text style={styles.header}>{viewingMeal.name}</Text>
          <Text style={styles.mealText}>
            <Text style={styles.bold}>Ingredients:</Text> {viewingMeal.ingredients}
          </Text>
          <Text style={styles.mealText}>
            <Text style={styles.bold}>Recipe:</Text> {viewingMeal.recipe}
          </Text>
          <Text style={styles.mealText}>
            <Text style={styles.bold}>Rating:</Text> {viewingMeal.rating}/10
          </Text>

          <Picker
  selectedValue={selectedChecklistItem}
  onValueChange={(itemValue) => setSelectedChecklistItem(itemValue)}
  style={styles.picker}
  itemStyle={styles.pickerItem} // Add this line
>
  <Picker.Item label="Select checklist item..." value="" />
  {checklistItems.map((item) => (
    <Picker.Item 
      key={item.id} 
      label={item.name} 
      value={item.name} 
      color="#000000" // Force text color directly on items
    />
  ))}
</Picker>

          <TouchableOpacity onPress={handleLogMeal} style={styles.logButton}>
            <Text style={styles.buttonText}>Log Meal</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleEditMeal} style={styles.editButton}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteMeal(viewingMeal.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewingMeal(null)}
              style={styles.backButton}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// Define consistent colors similar to Goals page
const COLORS = {
  primary: '#2E86C1',
  secondary: '#27AE60',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#333333',
  lightText: '#777777',
  danger: '#E74C3C',
  border: '#EEEEEE',
  success: '#2ECC71',
  progressBar: '#3498DB',
  warning: '#F39C12',
  gray: '#95A5A6',
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    padding: 20 
  },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: COLORS.text,
    marginBottom: 12 
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
    marginBottom: 16,
  },
  mealText: { 
    fontSize: 16, 
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  // Update these styles in your StyleSheet:

picker: {
  backgroundColor: COLORS.card,
  marginVertical: 12,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  color: '#000000', // Force black text color for visibility
  padding: 8,
},

// Add this new style for the picker item text:
pickerItem: {
  color: '#000000', // Force black text for the dropdown items
},

// If you need a dark mode option:
pickerDarkMode: {
  backgroundColor: COLORS.card,
  marginVertical: 12,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  color: '#FFFFFF', // White text for dark mode
  padding: 8,
},
  logButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bold: { 
    fontWeight: "bold" 
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.text,
  },
  largeInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButton: {
    backgroundColor: COLORS.warning,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    backgroundColor: COLORS.gray,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "600", 
    textAlign: "center",
    fontSize: 16,
  },
  addMealButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    width: 60,
    height: 60,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mealName: { 
    fontSize: 18, 
    fontWeight: "600",
    color: COLORS.text,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  mealView: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingContainer: {
    marginVertical: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: COLORS.text,
  },
  sliderContainer: {
    width: "100%",
    height: 40,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.lightText,
    marginTop: 8,
    marginBottom: 4,
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
  mealRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  ratingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.lightText,
    marginBottom: 6,
  },
});