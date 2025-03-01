import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

type Meal = {
  id: number;
  name: string;
  checked: boolean;
  editing: boolean;
  rating: number;
};

export default function ChecklistScreen() {
  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: 'Breakfast', checked: false, editing: false, rating: 0 },
    { id: 2, name: 'Lunch', checked: false, editing: false, rating: 0 },
    { id: 3, name: 'Dinner', checked: false, editing: false, rating: 0 },
  ]);

  const addMeal = () => {
    setMeals([...meals, { id: Date.now(), name: 'New Meal', checked: false, editing: true, rating: 0 }]);
  };

  const removeMeal = (id: number) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const toggleCheck = (id: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, checked: !meal.checked } : meal)));
  };

  const updateMealName = (id: number, newName: string) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, name: newName } : meal)));
  };

  const saveEdit = (id: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, editing: false } : meal)));
  };

  const setRating = (id: number, rating: number) => {
    setMeals(meals.map(meal => (meal.id === id ? { ...meal, rating } : meal)));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Checklist</Text>

          <DraggableFlatList
            data={meals}
            keyExtractor={(item) => item.id.toString()}
            onDragEnd={({ data }) => setMeals(data)}
            contentContainerStyle={styles.flatListContainer}
            renderItem={({ item, drag }: RenderItemParams<Meal>) => (
              <View key={item.id} style={styles.mealItem}>
                {item.editing ? (
                  <TextInput
                    style={styles.input}
                    value={item.name}
                    onChangeText={(text) => updateMealName(item.id, text)}
                    onBlur={() => saveEdit(item.id)}
                    autoFocus
                  />
                ) : (
                  <TouchableOpacity onPress={() => saveEdit(item.id)}>
                    <Text style={styles.mealName}>{item.name}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => toggleCheck(item.id)} style={styles.checkbox}>
                  <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={24} color="#3498db" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeMeal(item.id)}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>

                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(item.id, star)}>
                      <Ionicons 
                        name={item.rating >= star ? "star" : "star-outline"} 
                        size={24} 
                        color={item.rating >= star ? "#f1c40f" : "#ccc"} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity onLongPress={drag}>
                  <Ionicons name="reorder-three-outline" size={24} color="#888" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              </View>
            )}
          />
          
          <TouchableOpacity style={styles.addMealButton} onPress={addMeal}>
            <Text style={styles.buttonText}>+ Add Meal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView> 
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  screenContainer: { flex: 1, alignItems: 'center', padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  flatListContainer: { paddingBottom: 100 },

  input: { 
    width: 200, 
    height: 40, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    backgroundColor: '#fff' 
  },

  mealItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%', 
    padding: 10, 
    borderBottomWidth: 1, 
    borderColor: '#ddd', 
    backgroundColor: '#fff' 
  },

  mealName: { 
    fontSize: 16, 
    flex: 1 
  },

  checkbox: { 
    padding: 10 
  },

  ratingContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 10 
  },

  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  addMealButton: {
    marginVertical: 10,
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    width: '80%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 60,
  }
});