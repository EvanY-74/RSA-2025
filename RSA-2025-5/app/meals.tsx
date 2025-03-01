import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Slider from '@react-native-community/slider'; // Import the Slider component
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for icons

const App = () => {
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState('');
  const [mealIngredients, setMealIngredients] = useState('');
  const [mealRecipe, setMealRecipe] = useState('');
  const [rating, setRating] = useState(5); // Default rating to 5
  const [isEditing, setIsEditing] = useState(false);
  const [currentMealIndex, setCurrentMealIndex] = useState(null);
  const [viewMeal, setViewMeal] = useState(null); // State to track the meal being viewed

  const createMeal = () => {
    // Check if all fields are filled before creating or editing the meal
    if (!mealName || !mealIngredients || !mealRecipe) {
      Alert.alert('Error', 'Please fill in all the fields before creating or editing a meal');
      return;
    }

    const newMeal = {
      name: mealName,
      ingredients: mealIngredients,
      recipe: mealRecipe,
      rating,
    };

    // If we are editing a meal, replace it with the new meal data
    if (isEditing && currentMealIndex !== null) {
      const updatedMeals = [...meals];
      updatedMeals[currentMealIndex] = newMeal; // Replace the existing meal at the index
      setMeals(updatedMeals); // Update the meal list with the edited meal
    } else {
      // Otherwise, just add the new meal to the list
      setMeals([...meals, newMeal]);
    }

    // After saving, reset form and go back to the meal list
    resetForm();
    setIsEditing(false); // Exit editing mode
  };

  const deleteMeal = (index) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this meal?', [
      {
        text: 'Cancel',
      },
      {
        text: 'Delete',
        onPress: () => {
          const updatedMeals = meals.filter((_, i) => i !== index);
          setMeals(updatedMeals); // Update the meal list
          setViewMeal(null); // Clear the view meal state after deletion
        },
      },
    ]);
  };

  const editMeal = (index) => {
    const mealToEdit = meals[index];
    setMealName(mealToEdit.name);
    setMealIngredients(mealToEdit.ingredients);
    setMealRecipe(mealToEdit.recipe);
    setRating(mealToEdit.rating);
    setIsEditing(true);
    setCurrentMealIndex(index);
  };

  const resetForm = () => {
    setMealName('');
    setMealIngredients('');
    setMealRecipe('');
    setRating(5); // Reset rating
  };

  const viewMealDetails = (index) => {
    setViewMeal(meals[index]);
  };

  const backToMealList = () => {
    setViewMeal(null); // Clear the viewMeal state to go back to the list
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meal Tracker</Text>

      {/* Create New Meal Button */}
      {!isEditing && !viewMeal && (
        <TouchableOpacity
          style={styles.createMealButton}
          onPress={() => {
            setIsEditing(true);
            resetForm();
          }}>
          <Text style={styles.createMealButtonText}>Create New Meal</Text>
        </TouchableOpacity>
      )}

      {/* If editing, show the meal creation screen */}
      {isEditing && !viewMeal ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Meal Name"
            value={mealName}
            onChangeText={setMealName}
          />
          <TextInput
            style={styles.input}
            placeholder="Ingredients"
            value={mealIngredients}
            onChangeText={setMealIngredients}
          />
          <TextInput
            style={styles.input}
            placeholder="Recipe"
            value={mealRecipe}
            onChangeText={setMealRecipe}
          />
          <Text style={styles.healthinessLabel}>Meal Rating</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={rating}
            onValueChange={setRating}
          />
          <Text style={styles.healthinessValue}>{rating} / 10</Text>

          <TouchableOpacity style={styles.createMealButton} onPress={createMeal}>
            <Text style={styles.createMealButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </>
      ) : viewMeal ? (
        // View Meal Page: Display details of the meal
        <View style={styles.viewMealContainer}>
          <Text style={styles.viewMealTitle}>{viewMeal.name}</Text>
          <Text style={styles.viewMealDetails}>Ingredients: {viewMeal.ingredients}</Text>
          <Text style={styles.viewMealDetails}>Recipe: {viewMeal.recipe}</Text>
          <Text style={styles.viewMealDetails}>Rating: {viewMeal.rating} / 10</Text>

          <View style={styles.viewMealButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setMealName(viewMeal.name);
                setMealIngredients(viewMeal.ingredients);
                setMealRecipe(viewMeal.recipe);
                setRating(viewMeal.rating);
                setIsEditing(true);
                setViewMeal(null); // Exit the view meal screen
              }}>
              <Icon name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteMeal(meals.indexOf(viewMeal))}>
              <Icon name="trash" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.backButton]}
              onPress={backToMealList}>
              <Icon name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // If not editing, show the meal list
        <View style={styles.mealsList}>
          {meals.map((meal, index) => (
            <View style={styles.mealCard} key={index}>
              <Text style={styles.mealCardTitle}>{meal.name}</Text>
              <Text style={styles.mealCardDetails}>Ingredients: {meal.ingredients}</Text>
              <Text style={styles.mealCardDetails}>Recipe: {meal.recipe}</Text>
              <Text style={styles.mealCardDetails}>Rating: {meal.rating} / 10</Text>

              <View style={styles.viewButtonContainer}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => viewMealDetails(index)}>
                  <Text style={styles.viewButtonText}>View Meal</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  createMealButton: {
    backgroundColor: '#4CAF50', // Green color
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createMealButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  healthinessLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 12,
  },
  healthinessValue: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mealCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mealCardDetails: {
    fontSize: 16,
    marginBottom: 6,
  },
  viewButtonContainer: {
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  viewMealContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  viewMealTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  viewMealDetails: {
    fontSize: 16,
    marginBottom: 10,
  },
  viewMealButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
  },
  backButton: {
    backgroundColor: '#FFA500', // Orange color for back button
  },
  mealsList: {
    marginTop: 20,
  },
});

export default App;