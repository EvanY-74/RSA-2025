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
          >
            <Picker.Item label="Select checklist item..." value="" />
            {checklistItems.map((item) => (
              <Picker.Item key={item.id} label={item.name} value={item.name} />
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5", 
    padding: 20 
  },
  header: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  mealText: { 
    fontSize: 16, 
    marginBottom: 5 
  },
  picker: {
    backgroundColor: "#FFF",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    color: "#000",
  },
  logButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  bold: { 
    fontWeight: "bold" 
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    backgroundColor: "white",
    fontSize: 16,
  },
  largeInput: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    backgroundColor: "white",
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  deleteButton: {
    backgroundColor: "#FF5252",
    padding: 12,
    borderRadius: 6,
    flex: 1,
  },
  editButton: {
    backgroundColor: "#FFA726",
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    backgroundColor: "#757575",
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  addMealButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  mealName: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  viewButton: {
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  mealView: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: "#D32F2F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
});