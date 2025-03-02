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
  {
    id: 3,
    name: "Greek Yogurt & Berries",
    ingredients: "Greek yogurt, blueberries, honey, almonds",
    recipe: "Mix yogurt with berries, drizzle honey, sprinkle almonds.",
    rating: 7,
  },
  {
    id: 4,
    name: "Chicken & Veggie Stir-fry",
    ingredients: "Chicken breast, broccoli, carrots, bell pepper, soy sauce, garlic",
    recipe: "Sauté chicken, add veggies, stir in soy sauce and garlic.",
    rating: 8,
  },
  {
    id: 5,
    name: "Oatmeal with Banana & Nuts",
    ingredients: "Oats, banana, walnuts, cinnamon, honey",
    recipe: "Cook oats, slice banana, add walnuts, sprinkle cinnamon, drizzle honey.",
    rating: 9,
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
          <Text style={styles.mealText}><Text style={styles.bold}>Ingredients:</Text> {viewingMeal.ingredients}</Text>
          <Text style={styles.mealText}><Text style={styles.bold}>Recipe:</Text> {viewingMeal.recipe}</Text>
          <Text style={styles.mealText}><Text style={styles.bold}>Rating:</Text> {viewingMeal.rating}/10</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={() => { setEditingMeal(viewingMeal); setCreatingMeal(true); }} style={styles.iconButton}>
              <Icon name="edit" size={20} color="#4A4A4A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteMeal(viewingMeal.id)} style={styles.iconButton}>
              <Icon name="trash" size={20} color="#E57373" />
            </TouchableOpacity>
            <TouchableOpacity onPress={resetForm} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#4A4A4A" />
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

          {/* Floating Add Button */}
          <TouchableOpacity style={styles.fabButton} onPress={() => setCreatingMeal(true)}>
            <Icon name="plus" size={28} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    marginBottom: 12,
  },
  largeInput: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#555",
  },
  slider: {
    width: "100%",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#6BBF59",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#AAA",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  mealText: {
    fontSize: 14,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
  },
  viewButton: {
    marginTop: 8,
    backgroundColor: "#4A90E2",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  fabButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6BBF59",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  mealView: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  iconButton: {
    padding: 10,
    backgroundColor: "#DDD",
    borderRadius: 8,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#CCC",
    borderRadius: 8,
  },
  form: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});