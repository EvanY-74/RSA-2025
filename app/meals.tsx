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

interface Meal {
  id: number;
  name: string;
  ingredients: string;
  recipe: string;
  rating: number;
}

// Preset healthy meals (7-10 health rating)
const presetMeals: Meal[] = [
  {
    id: 1,
    name: "Grilled Salmon & Quinoa",
    ingredients: "Salmon, quinoa, spinach, lemon, olive oil",
    recipe: "Grill salmon, cook quinoa, mix with spinach, squeeze lemon, drizzle olive oil.",
    rating: 9,
  },
  {
    id: 2,
    name: "Avocado Toast with Egg",
    ingredients: "Whole grain bread, avocado, egg, salt, pepper",
    recipe: "Toast bread, mash avocado, cook egg (fried/boiled), assemble, season to taste.",
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
  const [selectedItem, setSelectedItem] = useState<string>("");

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
  };

  const handleDeleteMeal = (id: number) => {
    setMeals(meals.filter((meal) => meal.id !== id));
    setViewingMeal(null);
  };

  return (
    <View style={styles.container}>
      {creatingMeal ? (
        <ScrollView style={styles.form}>
          <Text style={styles.header}>{editingMeal ? "Edit Meal" : "Create New Meal"}</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter meal name..."
            placeholderTextColor="#A9A9A9"
            value={mealName}
            onChangeText={setMealName}
          />

          <TextInput
            style={[styles.input, styles.largeInput]}
            placeholder="List ingredients (comma-separated)..."
            placeholderTextColor="#A9A9A9"
            value={mealIngredients}
            onChangeText={setMealIngredients}
            multiline
          />

          <TextInput
            style={[styles.input, styles.largeInput]}
            placeholder="Describe how to prepare the meal..."
            placeholderTextColor="#A9A9A9"
            value={mealRecipe}
            onChangeText={setMealRecipe}
            multiline
          />

          <Text style={styles.label}>Rating: {mealRating}/10</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={mealRating}
            onValueChange={setMealRating}
            minimumTrackTintColor="#6BBF59"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#6BBF59"
          />

          <TouchableOpacity onPress={handleSaveMeal} style={styles.saveButton}>
            <Text style={styles.buttonText}>Save Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={resetForm} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : viewingMeal ? (
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

  {/* Old Buttons: Edit, Delete, Back */}
  <View style={styles.buttonRow}>
    <TouchableOpacity 
      onPress={() => { setEditingMeal(viewingMeal); setCreatingMeal(true); }} 
      style={styles.iconButton}
    >
      <Icon name="edit" size={20} color="#4A4A4A" />
    </TouchableOpacity>
    <TouchableOpacity 
      onPress={() => handleDeleteMeal(viewingMeal.id)} 
      style={styles.iconButton}
    >
      <Icon name="trash" size={20} color="#E57373" />
    </TouchableOpacity>
    <TouchableOpacity onPress={resetForm} style={styles.backButton}>
      <Icon name="arrow-left" size={24} color="#4A4A4A" />
    </TouchableOpacity>
  </View>

  {/* New Dropdown & Log Button Section */}
  <View style={styles.dropdownContainer}>
  <Picker
  selectedValue={selectedItem} // This will now correctly be a string
  style={styles.picker}
  onValueChange={(itemValue) => setSelectedItem(itemValue)}
>
  <Picker.Item label="Select an option..." value="" />
  <Picker.Item label="Breakfast" value="breakfast" />
  <Picker.Item label="Lunch" value="lunch" />
  <Picker.Item label="Dinner" value="dinner" />
  <Picker.Item label="Snack" value="snack" />
</Picker>

    <TouchableOpacity 
      onPress={() => console.log(`Logged: ${viewingMeal.name}`)} 
      style={styles.logButton}
    >
      <Text style={styles.buttonText}>Log</Text>
    </TouchableOpacity>
  </View>
</View>
      ) : (
        <>
          <FlatList
            data={meals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.mealName}>{item.name}</Text>
                <Text style={styles.mealText}>Rating: {item.rating}/10</Text>
                <TouchableOpacity onPress={() => setViewingMeal(item)} style={styles.viewButton}>
                  <Text style={styles.buttonText}>View Meal</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 10,
  },
  largeInput: {
    height: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#E57373",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  mealText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  viewButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  mealView: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#EEE",
    alignItems: "center",
  },
  backButton: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#DDD",
    alignItems: "center",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  picker: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 8,
  },
  logButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 6,
    marginLeft: 10,
    alignItems: "center",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  logButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 6,
    marginLeft: 10,
    alignItems: "center",
  },
});