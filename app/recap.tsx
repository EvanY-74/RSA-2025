import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  SafeAreaView,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Meals from './meals';

const RECAP_STORAGE_KEY = 'recap_data';
const LOG_STORAGE_KEY = 'log_data';

export default function CalendarRecapScreen() {
  const [allLogs, setAllLogs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayMeals, setSelectedDayMeals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Load all logs (both current and past)
// Load all logs (both current and past)
const loadAllLogs = useCallback(async () => {
  try {
    // Get recap data (past logs)
    const storedRecap = await AsyncStorage.getItem(RECAP_STORAGE_KEY);
    const recapData = storedRecap ? JSON.parse(storedRecap) : [];
    
    // Get current log data
    const currentLogData = await AsyncStorage.getItem(LOG_STORAGE_KEY);
    const currentLogs = currentLogData ? JSON.parse(currentLogData) : [];
    
    // Add sample March data for testing
    const sampleMarchData = getSampleMarchData();
    
    // Combine all logs
    const combinedLogs = [...recapData, ...currentLogs, ...sampleMarchData];
    
    // Sort logs by date (newest first)
    combinedLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    combinedLogs.forEach(log => {
    });
    
    setAllLogs(combinedLogs);
  } catch (error) {
    console.error('Failed to load logs data', error);
    setAllLogs([]);
  }
}, []);

  // Add this function at the beginning of your component, before useEffect
const getSampleMarchData = () => {
  const currentYear = new Date().getFullYear();
  return [
    {date: `${currentYear}-02-01`, meals: [{rating: 8.5}]},
    {date: `${currentYear}-02-02`, meals: [{rating: 9.2}]},
    {date: `${currentYear}-02-03`, meals: [{rating: 9.0}]},
    {date: `${currentYear}-02-04`, meals: [{rating: 8.0}]},
    {date: `${currentYear}-02-05`, meals: [{rating: 7.8}]},
    {date: `${currentYear}-02-06`, meals: [{rating: 8.9}]},
    {date: `${currentYear}-02-07`, meals: [{rating: 7.6}]},
    {date: `${currentYear}-02-08`, meals: [{rating: 6.4}]},
    {date: `${currentYear}-02-09`, meals: [{rating: 5.4}]},
    {date: `${currentYear}-02-10`, meals: [{rating: 4.4}]},
    {date: `${currentYear}-02-11`, meals: [{rating: 5.5}]},
    {date: `${currentYear}-02-12`, meals: [{rating: 6.2}]},
    {date: `${currentYear}-02-13`, meals: [{rating: 7.0}]},
    {date: `${currentYear}-02-14`, meals: [{rating: 5.3}]},
    {date: `${currentYear}-02-15`, meals: [{rating: 3.7}]},
    {date: `${currentYear}-02-16`, meals: [{rating: 8.6}]},
    {date: `${currentYear}-02-17`, meals: [{rating: 9.5}]},
    {date: `${currentYear}-02-18`, meals: [{rating: 5.9}]},
    {date: `${currentYear}-02-19`, meals: [{rating: 7.6}]},
    {date: `${currentYear}-02-20`, meals: [{rating: 9.0}]},
    {date: `${currentYear}-02-21`, meals: [{rating: 2.2}]},
    {date: `${currentYear}-02-22`, meals: [{rating: 4.5}]},
    {date: `${currentYear}-02-23`, meals: [{rating: 6.8}]},
    {date: `${currentYear}-02-24`, meals: [{rating: 7.1}]},
    {date: `${currentYear}-02-25`, meals: [{rating: 5.0}]},
    {date: `${currentYear}-02-26`, meals: [{rating: 3.4}]},
    {date: `${currentYear}-02-27`, meals: [{rating: 8.9}]},
    {date: `${currentYear}-02-28`, meals: [{rating: 7.6}]},
  ]
};
const checkAsyncStorage = async () => {
  try {
    const recapData = await AsyncStorage.getItem('recap_data');
    const logData = await AsyncStorage.getItem('log_data');

    console.log('Recap Data:', recapData ? JSON.parse(recapData) : null);
    console.log('Log Data:', logData ? JSON.parse(logData) : null);
  } catch (error) {
    console.error('Failed to retrieve data from AsyncStorage', error);
  }
};

// ... then, you can call this function somewhere, like in a useEffect or a button press ...

useEffect(() => {
  checkAsyncStorage();
}, []);

  // Load logs when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadAllLogs();
    }, [loadAllLogs])
  );

  // Navigate to previous month
  const previousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  // Navigate to next month
  const nextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // Format date as YYYY-MM-DD
  const formatDateYMD = (date) => {
    console.log("Input Date:", date);
    let d;
    if (typeof date === 'string') {
      d = new Date(date + 'Z'); // Treat as UTC
    } else {
      d = new Date(date.toISOString()); // Convert to ISO string and add 'Z'
    }
    const year = d.getUTCFullYear(); // Use UTC methods
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    console.log("Formatted Date (inside formatDateYMD):", formatted);
    return formatted;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string | number | Date) => {
    console.log("Formatting Date (inside formatDateForDisplay):", dateString);
    let date;
    if (typeof dateString === 'string') {
      date = new Date(dateString + 'T00:00:00.000Z'); // Treat as UTC
    } else {
      date = new Date(dateString);
    }
    return date.toLocaleDateString(undefined, {
      timeZone: 'UTC', // Ensure UTC time zone
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  // Get logs for a specific date
  const getLogsForDate = (date: string | number | Date) => {
    const formattedDate = formatDateYMD(date);
    const foundLog = allLogs.find(log => log.date === formattedDate);

    return foundLog;
  };

  // Calculate average rating for a date
  const getAverageRating = (date: Date) => {
    const logs = getLogsForDate(date);
    if (!logs || !logs.meals || logs.meals.length === 0) return 0;
    
    let totalRating = 0;
    let mealCount = 0;
    
    logs.meals.forEach((meal: { associatedMeal: { rating: number; }; rating: number; }) => {
      if (meal.associatedMeal) {
        totalRating += meal.associatedMeal.rating;
        mealCount++;
      } else if (meal.rating) {
        totalRating += meal.rating;
        mealCount++;
      }
    });
    
    return mealCount > 0 ? totalRating / mealCount : 0;
  };

  // Get color based on rating
  const getRatingColor = (rating: number) => {
    if (rating === 0) return '#F0F0F0'; // No data
    if (rating < 3) return '#FF6B6B'; // Red for low ratings
    if (rating < 5) return '#FFD166'; // Yellow for medium-low
    if (rating < 7) return '#06D6A0'; // Green for medium
    if (rating < 9) return '#118AB2'; // Blue for medium-high
    return '#073B4C'; // Dark blue for high
  };

  // Handle day press
  const handleDayPress = (date: string | number | Date) => {
    const formattedDate = formatDateYMD(date);
    console.log("Day Pressed (Formatted):", formattedDate);
    const dayLog = getLogsForDate(date);
  
    setSelectedDate(formattedDate);
    console.log("Selected Date:", selectedDate); // Check the state value
    setSelectedDayMeals(dayLog?.meals || []);
    setModalVisible(true);
  };

  // Generate calendar days
  // Modify your generateCalendarDays function to add empty spaces after the last day of month
const generateCalendarDays = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  const firstDayIndex = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const lastDayIndex = lastDay.getDay(); // 0-6
  
  const days = [];
  
  // Add empty spaces for days before the first day of month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ day: '', empty: true });
  }
  
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const formattedDate = formatDateYMD(date);
    const avgRating = getAverageRating(date);
    const color = getRatingColor(avgRating);
    const hasData = avgRating > 0;
    
    days.push({ 
      day: i, 
      date: formattedDate,
      color,
      hasData,
      rating: avgRating,
    });
  }
  
  // Add empty spaces after the last day of month to complete the grid
  // If lastDayIndex is 6 (Saturday), we need 0 empty spaces
  // If lastDayIndex is 0 (Sunday), we need 6 empty spaces, etc.
  const remainingDays = 6 - lastDayIndex;
  for (let i = 0; i < remainingDays; i++) {
    days.push({ day: '', empty: true });
  }
  
  return days;
};

  // Render each day in the calendar
  const renderDay = ({ item }) => {
    if (item.empty) {
        return <View style={styles.emptyDay} />;
    }

    return (
        <TouchableOpacity
            style={[
                styles.day,
                { backgroundColor: item.color },
                item.hasData && styles.dayWithData
            ]}
            onPress={() => {
              console.log("Day Pressed (Raw):", new Date(item.date)); //add this line
        
              item.hasData && handleDayPress(new Date(item.date))}}
            activeOpacity={item.hasData ? 0.6 : 1}
        >
            <Text style={[
                styles.dayText,
                item.rating >= 7 && styles.darkDayText,
            ]}>
                {item.day}
            </Text>
            {item.hasData && item.rating > 0 && (
                <Text style={[
                    styles.ratingText,
                    item.rating >= 7 && styles.darkDayText,
                ]}>
                    {item.rating.toFixed(1)}
                </Text>
            )}
        </TouchableOpacity>
    );
};

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  // Calendar header with weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meal Calendar</Text>
      </View>
      
      <View style={styles.monthNavigator}>
        <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekdaysHeader}>
        {weekdays.map(day => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>
      
      <FlatList
        data={generateCalendarDays()}
        renderItem={renderDay}
        keyExtractor={(item, index) => `day-${index}`}
        numColumns={7}
        contentContainerStyle={styles.calendarContainer}
      />
      
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Health Rating Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>0-2.9</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFD166' }]} />
            <Text style={styles.legendText}>3-4.9</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#06D6A0' }]} />
            <Text style={styles.legendText}>5-6.9</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#118AB2' }]} />
            <Text style={styles.legendText}>7-8.9</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#073B4C' }]} />
            <Text style={styles.legendText}>9-10</Text>
          </View>
        </View>
      </View>
      
      {/* Day Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatDateForDisplay(selectedDate) : ''}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              {selectedDayMeals.length === 0 ? (
                <Text style={styles.noMealsText}>No meals logged for this day.</Text>
              ) : (
                selectedDayMeals.map((meal, index) => (
                  <View key={index} style={styles.mealItem}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    
                    {meal.associatedMeal ? (
                      <>
                        <Text style={styles.mealDetails}>
                          <Text style={styles.boldText}>Meal:</Text> {meal.associatedMeal.name}
                        </Text>
                        <Text style={styles.mealDetails}>
                          <Text style={styles.boldText}>Health Rating:</Text> {meal.associatedMeal.rating}/10
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.mealDetails}>
                        <Text style={styles.boldText}>Health Rating:</Text> {meal.rating}/10
                      </Text>
                    )}
                    
                    {meal.timeChecked && (
                      <Text style={styles.mealDetails}>
                        <Text style={styles.boldText}>Logged at:</Text> {meal.timeChecked}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekdaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    color: '#555555',
  },
  calendarContainer: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 8,
  },
  dayWithData: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyDay: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  darkDayText: {
    color: '#FFFFFF',
  },
  ratingText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  legendContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
      marginBottom: 6,
    },
    
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: '#555555',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '85%',
      maxHeight: '70%',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalScrollView: {
      maxHeight: '90%',
    },
    noMealsText: {
      textAlign: 'center',
      paddingVertical: 20,
      color: '#888888',
      fontStyle: 'italic',
    },
    mealItem: {
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: '#06D6A0',
    },
    mealName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
    },
    mealDetails: {
      fontSize: 14,
      color: '#666666',
      marginBottom: 4,
    },
    boldText: {
      fontWeight: '600',
    }
  });
