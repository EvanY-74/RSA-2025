import React, { useState } from "react";
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
import { useEffect } from "react";

  interface Meal {
    id: number;
    name: string;
    ingredients: string;
    recipe: string;
    rating: number;
  };
  const CHECKLIST_STORAGE_KEY = 'checklist_items';
  const presetMeals: Meal[] = [
    { id: 1, name: "Grilled Salmon & Quinoa", ingredients: "Salmon, quinoa, spinach, lemon", recipe: "Grill salmon, cook quinoa, mix with spinach, drizzle lemon.", rating: 9 },
    { id: 2, name: "Avocado Toast with Egg", ingredients: "Whole grain bread, avocado, egg", recipe: "Toast bread, mash avocado, cook egg, assemble, season.", rating: 8 },
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
    const [selectedChecklistItem, setSelectedChecklistItem] = useState("");
    const [checklistItems, setChecklistItems] = useState<{ id: number, name: string }[]>([]);

    useEffect(() => {
      const loadChecklistItems = async () => {
        try {
          const storedChecklist = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
          console.log("Loaded Checklist Items:", storedChecklist); // Debugging line
          if (storedChecklist) {
            setChecklistItems(JSON.parse(storedChecklist));
          }
        } catch (error) {
          console.error("Error loading checklist items:", error);
        }
      };
    
      loadChecklistItems();
    }, []);

    const saveChecklistItems = async (items: string[]) => {
      try {
        await AsyncStorage.setItem("checklist_items", JSON.stringify(items));
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
              ? { ...meal, name: mealName, ingredients: mealIngredients, recipe: mealRecipe, rating: mealRating }
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

    const handleLogMeal = async () => {
      if (!selectedChecklistItem || !viewingMeal) return;
    
      try {
        const storedChecklist = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
        let checklist = storedChecklist ? JSON.parse(storedChecklist) : {};
    
        // Ensure the checklist item exists and has the right structure
        if (!checklist[selectedChecklistItem]) {
          checklist[selectedChecklistItem] = { meals: [], highestRating: 0 };
        }
    
        // Add the selected meal if it's not already logged
        const isMealLogged = checklist[selectedChecklistItem].meals.some(
          (meal: Meal) => meal.id === viewingMeal.id
        );
    
        if (!isMealLogged) {
          checklist[selectedChecklistItem].meals.push(viewingMeal);
        }
    
        // Update the highest rating
        checklist[selectedChecklistItem].highestRating = Math.max(
          ...checklist[selectedChecklistItem].meals.map((meal: Meal) => meal.rating)
        );
    
        // Save back to AsyncStorage
        await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
    
        console.log(`Logged ${viewingMeal.name} under ${selectedChecklistItem}`);
      } catch (error) {
        console.error("Error logging meal:", error);
      }
    
      setSelectedChecklistItem(""); // Reset dropdown selection
      setViewingMeal(null); // Exit viewing mode
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
                  <TouchableOpacity onPress={() => setViewingMeal(item)} style={styles.viewButton}>
                    <Text style={styles.buttonText}>View Meal</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity style={styles.addMealButton} onPress={() => setCreatingMeal(true)}>
              <Icon name="plus" size={24} color="white" />
            </TouchableOpacity>
          </>
        )}

        {creatingMeal && (
          <ScrollView style={styles.form}>
            <Text style={styles.header}>{editingMeal ? "Edit Meal" : "Create New Meal"}</Text>
            <TextInput style={styles.input} placeholder="Meal name" value={mealName} onChangeText={setMealName} />
            <TextInput style={[styles.input, styles.largeInput]} placeholder="Ingredients" value={mealIngredients} onChangeText={setMealIngredients} multiline />
            <TextInput style={[styles.input, styles.largeInput]} placeholder="Recipe" value={mealRecipe} onChangeText={setMealRecipe} multiline />
            <Text style={styles.label}>Health Rating: {mealRating}/10</Text>
            <Slider style={styles.slider} minimumValue={0} maximumValue={10} step={1} value={mealRating} onValueChange={setMealRating} />

            <TouchableOpacity onPress={handleSaveMeal} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetForm} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {viewingMeal && (
          <View style={styles.mealView}>
            <Text style={styles.header}>{viewingMeal.name}</Text>
            <Text style={styles.mealText}><Text style={styles.bold}>Ingredients:</Text> {viewingMeal.ingredients}</Text>
            <Text style={styles.mealText}><Text style={styles.bold}>Recipe:</Text> {viewingMeal.recipe}</Text>
            <Text style={styles.mealText}><Text style={styles.bold}>Rating:</Text> {viewingMeal.rating}/10</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleEditMeal} style={styles.editButton}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteMeal(viewingMeal.id)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Checklist Dropdown and Log Button */}
            <Picker
  selectedValue={selectedChecklistItem}
  onValueChange={(itemValue) => setSelectedChecklistItem(itemValue)}
  style={[styles.picker, { color: "black" }]}
  dropdownIconColor="black"
>
  <Picker.Item label="Select checklist item..." value="" color="gray" />
  {checklistItems.map((item) => (
    <Picker.Item key={item.id} label={item.name} value={item.name} color="black" />
  ))}
</Picker>

            <TouchableOpacity onPress={handleLogMeal} style={styles.logButton}>
              <Text style={styles.buttonText}>Log Meal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5", padding: 20 },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    mealText: { fontSize: 16, marginBottom: 5 },
    picker: {
      backgroundColor: "#FFF",
      marginVertical: 10,
      borderWidth: 1,  // Adds a border for better visibility
      borderColor: "#000",  // Darker border for contrast
      borderRadius: 8,
      color: "#000",  // Ensures text inside is black
    },
    logButton: { backgroundColor: "#4CAF50", padding: 12, borderRadius: 6, marginTop: 10 },
    bold: { fontWeight: "bold" },
    container: { flex: 1, backgroundColor: "#F5F5F5", padding: 20 },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    input: { backgroundColor: "#FFF", padding: 12, borderRadius: 8, marginBottom: 10 },
    largeInput: { height: 80, textAlignVertical: "top" },
    saveButton: { backgroundColor: "#4CAF50", padding: 12, borderRadius: 6 },
    cancelButton: { backgroundColor: "#D32F2F", padding: 12, borderRadius: 6, marginTop: 10 },
    deleteButton: { backgroundColor: "#FF5252", padding: 12, borderRadius: 6, flex: 1 },
    editButton: { backgroundColor: "#FFA726", padding: 12, borderRadius: 6, flex: 1, marginRight: 10 },
    buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    buttonText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
    addMealButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#2196F3", padding: 15, borderRadius: 50, alignItems: "center" },
    card: { backgroundColor: "#FFF", padding: 15, borderRadius: 8, marginBottom: 10 },
    mealName: { fontSize: 18, fontWeight: "bold" },
    viewButton: { backgroundColor: "#1976D2", padding: 10, borderRadius: 6, marginTop: 10 },
    // (Other styles remain the same)
  });