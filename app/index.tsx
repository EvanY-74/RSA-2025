import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

type Meal = {
  id: number;
  name: string;
  checked: boolean;
  editing: boolean;
  rating: number;
  assignedChecklistItem?: string;
};

const STORAGE_KEY = 'meals_data';
const LOG_STORAGE_KEY = 'log_data';
const CHECKLIST_STORAGE_KEY = 'checklist_items';

export default function ChecklistScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [checklistData, setChecklistData] = useState<{ [key: string]: { meals: Meal[]; highestRating: number } }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMeals) setMeals(JSON.parse(storedMeals));

        const storedChecklist = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
        if (storedChecklist) setChecklistItems(JSON.parse(storedChecklist));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveMeals = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
        updateChecklistData();
        updateLog();
      } catch (error) {
        console.error('Failed to save meals to storage', error);
      }
    };
    saveMeals();
  }, [meals]);

  useEffect(() => {
    const saveChecklistItems = async () => {
      try {
        await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklistItems));
      } catch (error) {
        console.error('Failed to save checklist items', error);
      }
    };
    saveChecklistItems();
  }, [checklistItems]);

  const updateChecklistData = () => {
    const updatedChecklistData: { [key: string]: { meals: Meal[]; highestRating: number } } = {};

    checklistItems.forEach(item => {
      const assignedMeals = meals.filter(meal => meal.assignedChecklistItem === item);
      const highestRating = assignedMeals.length > 0 ? Math.max(...assignedMeals.map(meal => meal.rating)) : 0;

      updatedChecklistData[item] = { meals: assignedMeals, highestRating };
    });

    setChecklistData(updatedChecklistData);
  };

  const updateLog = async () => {
    try {
      const checkedMeals = meals
        .filter(meal => meal.checked)
        .map(meal => ({
          id: meal.id,
          name: meal.name,
          rating: meal.rating,
          timeChecked: new Date().toLocaleTimeString(),
        }));
  
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(checkedMeals));
    } catch (error) {
      console.error('Failed to update log storage', error);
    }
  };

  const addMeal = () => {
    setMeals([...meals, { id: Date.now(), name: 'New Meal', checked: false, editing: true, rating: 5 }]);
  };

  const addChecklistItem = () => {
    const newItem = `Checklist Item ${checklistItems.length + 1}`;
    setChecklistItems([...checklistItems, newItem]);
  };

  const removeMeal = (id: number) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const toggleCheck = (id: number) => {
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, checked: !meal.checked, rating: meal.checked ? 0 : meal.rating } : meal
    ));
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

  const handleDragEnd = ({ data }: { data: Meal[] }) => {
    setMeals(data);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.screenTitle}>Meal Checklist</Text>

        <DraggableFlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          onDragEnd={handleDragEnd}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, drag }: RenderItemParams<Meal>) => (
            <View key={item.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                {item.editing ? (
                  <TextInput
                    style={styles.input}
                    value={item.name}
                    onChangeText={(text) => updateMealName(item.id, text)}
                    onBlur={() => saveEdit(item.id)}
                    autoFocus
                  />
                ) : (
                  <TouchableOpacity onPress={() => setMeals(meals.map(meal => 
                    meal.id === item.id ? { ...meal, editing: true } : meal
                  ))} style={styles.mealNameContainer}>
                    <Text style={styles.mealName}>{item.name}</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => toggleCheck(item.id)}>
                    <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={28} color="#3498db" />
                  </TouchableOpacity>

                  {!item.checked && (
                    <TouchableOpacity onPress={() => removeMeal(item.id)}>
                      <Ionicons name="close-circle-outline" size={26} color="red" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onLongPress={drag}>
                    <Ionicons name="reorder-three-outline" size={26} color="#888" />
                  </TouchableOpacity>
                </View>
              </View>

              {item.checked && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>Health: {item.rating}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={item.rating}
                    onValueChange={(value) => setRating(item.id, value)}
                    minimumTrackTintColor="#27ae60"
                    maximumTrackTintColor="#ddd"
                    thumbTintColor="#27ae60"
                  />
                </View>
              )}
            </View>
          )}
        />

        <TouchableOpacity style={styles.addMealButton} onPress={addMeal}>
          <Ionicons name="add-circle-outline" size={32} color="white" />
          <Text style={styles.buttonText}>Add Meal</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  screenTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  listContainer: { paddingBottom: 100 },
  mealCard: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 8, 
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  mealHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  mealName: { fontSize: 18, fontWeight: 'bold' },
  dropdownContainer: { marginTop: 10 },
  dropdownLabel: { fontSize: 14, fontWeight: 'bold' },
  picker: { height: 50, width: '100%' },
});
