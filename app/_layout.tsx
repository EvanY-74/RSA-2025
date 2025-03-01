import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';
import ChecklistScreen from './index';
import MealsScreen from './meals';
import LogScreen from './log';
import RecapScreen from './recap';
import SettingsScreen from './settings';

const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: string;

            if (route.name === 'Checklist') {
              iconName = 'checkbox-outline';
            } else if (route.name === 'Meals') {
              iconName = 'fast-food-outline';
            } else if (route.name === 'Log') {
              iconName = 'document-text-outline';
            } else if (route.name === 'Recap') {
              iconName = 'calendar-outline';
            } else {
              iconName = 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: '#000',
        })}
      >
        <Tab.Screen name="Checklist" component={ChecklistScreen} />
        <Tab.Screen name="Meals" component={MealsScreen} />
        <Tab.Screen name="Log" component={LogScreen} />
        <Tab.Screen name="Recap" component={RecapScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </View>
  );
}