import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert,
  Animated,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

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
  placeholderText: '#AAAAAA',
};

interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}

const GOALS_STORAGE_KEY = 'goals_data';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));

  // Load goals when component mounts or when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadGoals();
      return () => {};
    }, [])
  );

  const loadGoals = async () => {
    try {
      const storedGoals = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      if (storedGoals !== null) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.error('Failed to load goals from storage', error);
    }
  };

  // Save goals whenever they change
  useEffect(() => {
    const saveGoals = async () => {
      try {
        await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
      } catch (error) {
        console.error('Failed to save goals to storage', error);
      }
    };
    saveGoals();
  }, [goals]);

  // Add a new goal
  const addGoal = () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      title: newGoalTitle,
      description: newGoalDescription,
      targetDate: newGoalDate || undefined,
      progress: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setGoals([...goals, newGoal]);
    resetForm();
  };

  // Update goal progress
  const updateProgress = (id: number, progress: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const isCompleted = progress >= 100;
        return { ...goal, progress, isCompleted };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false
    }).start();
  };

  // Delete a goal
  const deleteGoal = (id: number) => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setGoals(goals.filter(goal => goal.id !== id))
        }
      ]
    );
  };

  // Reset form
  const resetForm = () => {
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalDate('');
    setIsAddingGoal(false);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No target date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days remaining
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Reset time portion for accurate day calculation
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Render a goal item
  const renderGoalItem = ({ item }: { item: Goal }) => {
    const daysRemaining = getDaysRemaining(item.targetDate);
    
    return (
      <View style={[styles.goalCard, item.isCompleted && styles.completedGoalCard]}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <TouchableOpacity onPress={() => deleteGoal(item.id)}>
            <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
        
        {item.description ? (
          <Text style={styles.goalDescription}>{item.description}</Text>
        ) : null}
        
        {item.targetDate ? (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              Target: {formatDate(item.targetDate)}
            </Text>
            {daysRemaining !== null && (
              <Text style={[
                styles.daysRemaining,
                daysRemaining < 0 ? styles.overdue : 
                daysRemaining <= 3 ? styles.urgent : null
              ]}>
                {daysRemaining < 0 ? 
                  `${Math.abs(daysRemaining)} days overdue` : 
                  daysRemaining === 0 ? 
                    'Due today' : 
                    `${daysRemaining} days remaining`}
              </Text>
            )}
          </View>
        ) : null}
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { width: `${item.progress}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.progressButton}
            onPress={() => updateProgress(item.id, Math.min(item.progress + 10, 100))}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.progressButton, styles.decreaseButton]}
            onPress={() => updateProgress(item.id, Math.max(item.progress - 10, 0))}
          >
            <Text style={styles.buttonText}>Subtract</Text>
          </TouchableOpacity>
          
          {!item.isCompleted ? (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => updateProgress(item.id, 100)}
            >
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Goals</Text>
        <Text style={styles.subtitle}>Track your progress towards your goals</Text>
      </View>

      {!isAddingGoal ? (
        <>
          {goals.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="flag-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>No goals added yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap the button below to add your first goal</Text>
            </View>
          ) : (
            <FlatList
              data={goals}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderGoalItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setIsAddingGoal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Add Goal</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Goal</Text>
          
          <TextInput
  style={styles.input}
  placeholder="Goal Title"
  placeholderTextColor={COLORS.placeholderText}
  value={newGoalTitle}
  onChangeText={setNewGoalTitle}
/>

<TextInput
  style={[styles.input, styles.textArea]}
  placeholder="Description (optional)"
  placeholderTextColor={COLORS.placeholderText}
  value={newGoalDescription}
  onChangeText={setNewGoalDescription}
  multiline
/>

<TextInput
  style={styles.input}
  placeholder="Target Date (YYYY-MM-DD)"
  placeholderTextColor={COLORS.placeholderText}
  value={newGoalDate}
  onChangeText={setNewGoalDate}
/>
          
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={addGoal}
            >
              <Text style={styles.buttonText}>Save Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      padding: 20,
      paddingBottom: 12,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    subtitle: {
      fontSize: 14,
      color: COLORS.lightText,
      marginTop: 4,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    goalCard: {
      backgroundColor: COLORS.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    completedGoalCard: {
      borderLeftWidth: 4,
      borderLeftColor: COLORS.success,
      opacity: 0.8,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    goalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.text,
      flex: 1,
    },
    goalDescription: {
      fontSize: 14,
      color: COLORS.lightText,
      marginBottom: 12,
    },
    dateContainer: {
      marginBottom: 12,
    },
    dateText: {
      fontSize: 14,
      color: COLORS.text,
    },
    daysRemaining: {
      fontSize: 12,
      marginTop: 4,
      color: COLORS.lightText,
    },
    urgent: {
      color: COLORS.danger,
      fontWeight: '500',
    },
    overdue: {
      color: COLORS.danger,
      fontWeight: 'bold',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    progressBarContainer: {
      flex: 1,
      height: 8,
      backgroundColor: COLORS.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 10,
    },
    progressBar: {
      height: '100%',
      backgroundColor: COLORS.progressBar,
    },
    progressText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: COLORS.text,
      width: 40,
      textAlign: 'right',
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    progressButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    decreaseButton: {
      backgroundColor: COLORS.lightText,
      marginLeft: 8,
    },
    completeButton: {
      backgroundColor: COLORS.success,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 12,
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0FFF0',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
    },
    completedText: {
      color: COLORS.success,
      fontWeight: '600',
      fontSize: 12,
      marginLeft: 4,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.secondary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 50,
      justifyContent: 'center',
      width: '80%',
      alignSelf: 'center',
      position: 'absolute',
      bottom: 25,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 5,
    },
    addButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
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
    formContainer: {
      padding: 20,
    },
    formTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 16,
    },
    input: {
      backgroundColor: COLORS.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      fontSize: 16,
      color: COLORS.text, // Explicitly set text color
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    formButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    saveButton: {
      backgroundColor: COLORS.secondary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginRight: 8,
    },
    cancelButton: {
      backgroundColor: COLORS.lightText,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginLeft: 8,
    },
  });