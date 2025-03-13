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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Checklist: 'checkbox-outline',
            Meals: 'fast-food-outline',
            Log: 'document-text-outline',
            Recap: 'calendar-outline',
            Settings: 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} style={{ marginBottom: -3 }} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#ecf0f1',
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 3,
        },
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen name="Checklist" component={ChecklistScreen} />
      <Tab.Screen name="Meals" component={MealsScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Recap" component={RecapScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}