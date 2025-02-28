import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Meal = {
  id: number;
  name: string;
  checked: boolean;
  editing: boolean;
  rating: number;
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('Checklist');
  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: 'Breakfast', checked: false, editing: false, rating: 0 },
    { id: 2, name: 'Lunch', checked: false, editing: false, rating: 0 },
    { id: 3, name: 'Dinner', checked: false, editing: false, rating: 0 },
  ]);

  const addMeal = () => {
    setMeals([...meals, { id: Date.now(), name: 'New Meal', checked: false, editing: false, rating: 0 }]);
  };

  const removeMeal = (id: number) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const toggleCheck = (id: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, checked: !meal.checked } : meal)));
  };

  const startEditing = (id: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, editing: true } : meal)));
  };

  const saveEdit = (id: number, newName: string) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, name: newName, editing: false } : meal)));
  };

  const setRating = (id: number, rating: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, rating } : meal)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>{currentTab} Page</Text>

          {currentTab === 'Checklist' && (
            <View style={styles.mealChecklistContainer}>
              {meals.map((meal) => (
                <View key={meal.id} style={styles.mealItem}>
                  {meal.editing ? (
                    <TextInput
                      style={styles.input}
                      value={meal.name}
                      onChangeText={(text) => saveEdit(meal.id, text)}
                      onBlur={() => saveEdit(meal.id, meal.name)}
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.mealName}>{meal.name}</Text>
                  )}

                  <TouchableOpacity onPress={() => toggleCheck(meal.id)} style={styles.checkbox}>
                    <Ionicons name={meal.checked ? "checkbox" : "square-outline"} size={24} color="#3498db" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => startEditing(meal.id)}>
                    <Ionicons name="create-outline" size={24} color="#3498db" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => removeMeal(meal.id)}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>

                  {/* ⭐ Star Rating Feature */}
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setRating(meal.id, star)}>
                        <Ionicons 
                          name={meal.rating >= star ? "star" : "star-outline"} 
                          size={24} 
                          color={meal.rating >= star ? "#f1c40f" : "#ccc"} 
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addMealButton} onPress={addMeal}>
                <Text style={styles.buttonText}>+ Add Meal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 🔽 Navigation Bar with Icons */}
      <View style={styles.tabBar}>
        {['Checklist', 'Meals', 'Log', 'Recap', 'Settings'].map(tab => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, currentTab === tab && styles.activeTab]} 
            onPress={() => setCurrentTab(tab)}
          >
            <Ionicons name={
              tab === 'Checklist' ? 'checkbox-outline' : 
              tab === 'Meals' ? 'fast-food-outline' : 
              tab === 'Log' ? 'document-text-outline' : 
              tab === 'Recap' ? 'calendar-outline' : 'settings-outline'
            } size={24} color={currentTab === tab ? '#3498db' : '#000'} />
            <Text style={[styles.tabText, currentTab === tab && { color: '#3498db' }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  screenContainer: { flex: 1, alignItems: 'center', padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  mealChecklistContainer: { width: '90%', alignItems: 'center' },
  mealItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  mealName: { fontSize: 16, flex: 1 },  // 🔽 Reduced from 18 to 16
  checkbox: { padding: 10 },
  addMealButton: { marginTop: 20, backgroundColor: '#27ae60', padding: 10, borderRadius: 8 },
  ratingContainer: { flexDirection: 'row', paddingHorizontal: 10 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ddd', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' },
  tab: { flex: 1, paddingVertical: 15, justifyContent: 'center', alignItems: 'center' },
  activeTab: { borderTopWidth: 3, borderTopColor: '#3498db' },
  tabText: { fontSize: 12 },
});
