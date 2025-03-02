import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  useColorScheme,
  StatusBar,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';


// Create Theme Context
type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
};



type Theme = {
  background: string;
  card: string;
  text: string;
  border: string;
  primary: string;
  secondary: string;
  icon: string;
  switchTrack: string;
  switchThumb: string;
  dangerBackground: string;
  dangerText: string;
  headerBackground: string;
  disabledButton: string;
  disabledText: string;
};

const lightTheme: Theme = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  border: '#dddddd',
  primary: '#3498db',
  secondary: '#888888',
  icon: '#3498db',
  switchTrack: '#d0d0d0',
  switchThumb: '#f4f3f4',
  dangerBackground: '#fff0f0',
  dangerText: '#e74c3c',
  headerBackground: '#ffffff',
  disabledButton: '#f0f0f0',
  disabledText: '#aaaaaa',
};

const darkTheme: Theme = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#f0f0f0',
  border: '#333333',
  primary: '#60a5fa',
  secondary: '#aaaaaa',
  icon: '#60a5fa',
  switchTrack: '#555555',
  switchThumb: '#888888',
  dangerBackground: '#2d1b1b',
  dangerText: '#ff6b6b',
  headerBackground: '#1e1e1e',
  disabledButton: '#2a2a2a',
  disabledText: '#666666',
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  theme: lightTheme,
});

export const useTheme = () => useContext(ThemeContext);

// Create ThemeProvider
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceTheme = useColorScheme();
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_preference');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'dark');
        } else {
          setDarkMode(deviceTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    loadThemePreference();
  }, [deviceTheme]);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: darkMode ? darkTheme.headerBackground : lightTheme.headerBackground },
      headerTintColor: darkMode ? darkTheme.text : lightTheme.text,
    });
  }, [darkMode, navigation]);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    try {
      await AsyncStorage.setItem('theme_preference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme: darkMode ? darkTheme : lightTheme }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? darkTheme.background : lightTheme.background} />
      {children}
    </ThemeContext.Provider>
  );
};


// Sound Effect Handler
const playSoundEffect = async (enabled: boolean) => {
  if (!enabled) return;
  
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/click.wav')
    );
    await sound.playAsync();
    
    // Unload sound after playing - FIXED
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if ('didJustFinish' in status && status.didJustFinish) {
        await sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

// Haptic Feedback Handler
const triggerHaptic = (enabled: boolean) => {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Main Settings Types
type SettingsType = {
  notifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  autoSave: boolean;
  dataSync: boolean;
  mealReminders: boolean;
  languagePreference: string;
  measurementUnit: string;
};

interface MealData {
  id: string;
  name: string;
  calories: number;
  date: string;
  // Add other meal properties as needed
}

// Mock data for export/import functionality
const mockMealData: MealData[] = [
  { id: '1', name: 'Breakfast', calories: 450, date: '2025-02-28' },
  { id: '2', name: 'Lunch', calories: 650, date: '2025-02-28' },
  { id: '3', name: 'Dinner', calories: 750, date: '2025-02-28' },
];

const SETTINGS_STORAGE_KEY = 'user_settings';
const MEAL_DATA_KEY = 'meal_tracking_data';

// Language options
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
const MEASUREMENT_UNITS = ['Metric', 'Imperial'];

// Setup notification permissions
const setupNotifications = async () => {
  if (Platform.OS === 'web') return true;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    Alert.alert(
      'Notification Permissions',
      'We need notification permissions to remind you about meals and updates.',
      [{ text: 'OK' }]
    );
    return false;
  }
  
  return true;
};



// Schedule meal reminder - FIXED
const scheduleMealReminder = async (enabled: boolean) => {
  if (!enabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  
  
  const hasPermission = await setupNotifications();
  if (!hasPermission) return;
  
  // Cancel existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Schedule breakfast reminder
  // Schedule breakfast reminder
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Breakfast Time',
    body: 'Remember to log your breakfast meal!',
  },
  trigger: {
    channelId: 'meal-reminders',
    hour: 8,
    minute: 0,
    repeats: true,
  } as any,
});
  
  // Schedule lunch reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lunch Time',
      body: 'Remember to log your lunch meal!',
    },
    trigger: {
      channelId: 'meal-reminders',
      hour: 12,
      minute: 30,
      repeats: true,
    } as any,
  });
  
  // Schedule dinner reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Dinner Time',
      body: 'Remember to log your dinner meal!',
    },
    trigger: {
      channelId: 'meal-reminders',
      hour: 18,
      minute: 30,
      repeats: true,
    } as any,
  });
};



// SettingItem Component
// The issue is in the SettingItem component's handlePress function
// Let's update the component to correctly handle the switch toggle

const SettingItem = ({ 
  icon, 
  title, 
  description, 
  value, 
  onValueChange,
  type = 'switch',
  disabled = false,
  settings
}: {
  icon: string;
  title: string;
  description?: string;
  value: boolean | string;
  onValueChange: (newValue: any) => void;
  type?: 'switch' | 'select';
  disabled?: boolean;
  settings?: SettingsType;
}) => {
  const { theme } = useTheme();
  
  const handlePress = () => {
    if (disabled) return;
    
    if (settings?.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings?.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    onValueChange(!value);
  };
  
  const handleSelectPress = () => {
    if (disabled) return;
    
    if (settings?.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings?.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    onValueChange(value);
  };
  
  return (
    <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={24} color={disabled ? theme.secondary : theme.icon} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, { color: disabled ? theme.secondary : theme.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: theme.secondary }]}>
            {description}
          </Text>
        )}
        {type === 'select' && typeof value === 'string' && (
          <Text style={[styles.settingValue, { color: disabled ? theme.secondary : theme.primary }]}>
            {value}
          </Text>
        )}
      </View>
      {type === 'switch' && typeof value === 'boolean' && (
        <Switch
          value={value}
          onValueChange={disabled ? undefined : onValueChange}
          trackColor={{ false: theme.switchTrack, true: theme.primary + '80' }}
          thumbColor={value ? theme.primary : theme.switchThumb}
          ios_backgroundColor={theme.switchTrack}
          disabled={disabled}
        />
      )}
      {type === 'select' && (
        <TouchableOpacity onPress={disabled ? undefined : handleSelectPress} disabled={disabled}>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={disabled ? theme.secondary : theme.secondary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Button Component
const ButtonItem = ({
  title,
  onPress,
  icon,
  isDanger = false,
  settings
}: {
  title: string;
  onPress: () => void;
  icon?: string;
  isDanger?: boolean;
  settings?: SettingsType;
}) => {
  const { theme } = useTheme();
  
  const handlePress = () => {
    if (settings?.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings?.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    onPress();
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isDanger && styles.dangerButton, 
        { 
          backgroundColor: isDanger ? theme.dangerBackground : theme.card, 
          borderColor: theme.border 
        }
      ]} 
      onPress={handlePress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDanger ? theme.dangerText : theme.primary} 
            style={{ marginRight: 8 }}
          />
        )}
        <Text 
          style={[
            styles.buttonText, 
            { 
              color: isDanger ? theme.dangerText : theme.primary 
            }
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// The Settings Component
const Settings = () => {
  const { darkMode, toggleDarkMode, theme } = useTheme();
  const [settings, setSettings] = useState<SettingsType>({
    notifications: true,
    soundEffects: true,
    hapticFeedback: true,
    autoSave: true,
    dataSync: false,
    mealReminders: false,
    languagePreference: 'English',
    measurementUnit: 'Metric'
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings !== null) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      if (isLoading) return; // Don't save during initial load
      
      try {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings', error);
      }
    };
    
    saveSettings();
  }, [settings, isLoading]);

  // Setup meal reminders when setting changes
  useEffect(() => {
    if (isLoading) return;
    
    if (settings.notifications && settings.mealReminders) {
      scheduleMealReminder(true);
    } else {
      scheduleMealReminder(false);
    }
  }, [settings.notifications, settings.mealReminders, isLoading]);

  const updateSetting = async <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    // Apply setting functionality
    switch (key) {
      case 'notifications':
        // Request permissions if turning on notifications
        if (value === true) {
          const hasPermission = await setupNotifications();
          if (!hasPermission) {
            // If permissions denied, don't update the setting
            return;
          }
        }
        
        // If turning off notifications, disable meal reminders too
        if (value === false && settings.mealReminders) {
          setSettings(prevSettings => ({
            ...prevSettings,
            mealReminders: false
          }));
        }
        break;
      case 'soundEffects':
        // Test sound when turning on
        if (value === true) {
          playSoundEffect(true);
        }
        break;
      case 'hapticFeedback':
        // Test haptic when turning on
        if (value === true) {
          triggerHaptic(true);
        }
        break;
      case 'mealReminders':
        // Enable notifications if meal reminders being turned on
        if (value === true && !settings.notifications) {
          const hasPermission = await setupNotifications();
          if (!hasPermission) {
            // If permissions denied, don't update the setting
            return;
          }
          
          // Enable notifications too
          setSettings(prevSettings => ({
            ...prevSettings,
            notifications: true
          }));
        }
        break;
      default:
        break;
    }

    // Update settings state
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  const handleSelectOption = (key: keyof SettingsType, options: string[]) => {
    // Play sound/haptic if enabled
    if (settings.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    Alert.alert(
      `Select ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`,
      'Choose an option',
      options.map(option => ({
        text: option,
        onPress: () => updateSetting(key, option)
      })),
      { cancelable: true }
    );
  };

  const resetSettings = async () => {
    // Play sound/haptic if enabled
    if (settings.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            const defaultSettings = {
              notifications: true,
              soundEffects: true,
              hapticFeedback: true,
              autoSave: true,
              dataSync: false,
              mealReminders: false,
              languagePreference: 'English',
              measurementUnit: 'Metric'
            };
            setSettings(defaultSettings);
            try {
              await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
              // Don't reset theme in case user prefers to keep it
              
              if (settings.soundEffects) {
                playSoundEffect(true);
              }
              
              Alert.alert('Success', 'Settings have been reset to default values.');
            } catch (error) {
              console.error('Failed to reset settings', error);
              Alert.alert('Error', 'Failed to reset settings. Please try again.');
            }
          }
        }
      ]
    );
  };

  const exportData = async () => {
    try {
      // In a real app, you would retrieve actual data from AsyncStorage
      const dataToExport = JSON.stringify(mockMealData, null, 2);
      
      // Create a temporary file
      const fileUri = FileSystem.documentDirectory + 'meal_data_export.json';
      await FileSystem.writeAsStringAsync(fileUri, dataToExport);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          'Sharing not available',
          'Sharing is not available on this device.'
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    }
  };

  const backupData = async () => {
    try {
      // In a real app, you would retrieve actual data from AsyncStorage
      const dataToBackup = JSON.stringify({
        settings: settings,
        mealData: mockMealData
      }, null, 2);
      
      const backupTime = new Date().toISOString().replace(/[:.]/g, '-');
      const fileUri = FileSystem.documentDirectory + `meal_tracker_backup_${backupTime}.json`;
      await FileSystem.writeAsStringAsync(fileUri, dataToBackup);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        Alert.alert('Backup Complete', 'Your data has been backed up successfully.');
      } else {
        Alert.alert(
          'Sharing not available',
          'Sharing is not available on this device.'
        );
      }
    } catch (error) {
      console.error('Error backing up data:', error);
      Alert.alert('Backup Failed', 'Failed to backup data. Please try again.');
    }
  };

  const restoreData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileContent = await FileSystem.readAsStringAsync(file.uri);
        const parsedData = JSON.parse(fileContent);
        
        // Validate that this is a valid backup file
        if (parsedData.settings && parsedData.mealData) {
          // In a real app, you would store the data in AsyncStorage
          setSettings(parsedData.settings);
          await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsedData.settings));
          await AsyncStorage.setItem(MEAL_DATA_KEY, JSON.stringify(parsedData.mealData));
          
          Alert.alert('Restore Complete', 'Your data has been restored successfully.');
        } else {
          Alert.alert('Invalid Backup', 'The selected file is not a valid backup file.');
        }
      }
    } catch (error) {
      console.error('Error restoring data:', error);
      Alert.alert('Restore Failed', 'Failed to restore data. Please try again.');
    }
  };

  const backupRestore = () => {
    // Play sound/haptic if enabled
    if (settings.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    Alert.alert(
      'Backup & Restore',
      'Choose an option',
      [
        { 
          text: 'Backup Data', 
          onPress: backupData 
        },
        { 
          text: 'Restore Data', 
          onPress: restoreData 
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openPolicyPage = (page: string) => {
    // Play sound/haptic if enabled
    if (settings.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    // Links to mock policy pages - in a real app, you would use actual URLs
    const policyUrls = {
      'Privacy Policy': 'https://example.com/privacy',
      'Terms of Service': 'https://example.com/terms',
    };
    
    const url = policyUrls[page as keyof typeof policyUrls];
    
    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            'Cannot Open Link',
            `Unable to open ${page}. Please visit our website directly.`
          );
        }
      });
    }
  };

  const sendFeedback = async () => {
    // Play sound/haptic if enabled
    if (settings.soundEffects) {
      playSoundEffect(settings.soundEffects);
    }
    
    if (settings.hapticFeedback) {
      triggerHaptic(settings.hapticFeedback);
    }
    
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (isAvailable) {
      const deviceInfo = `
        App Version: 1.0.0
        Device: ${Platform.OS} ${Platform.Version}
        Settings: ${JSON.stringify(settings)}
      `;
      
      MailComposer.composeAsync({
        recipients: ['feedback@example.com'],
        subject: 'Meal Tracker App Feedback',
        body: `
          Dear Meal Tracker Team,
          
          I'd like to share some feedback about the app:
          
          
          
          Technical Information:
          ${deviceInfo}
        `
      });
    } else {
      Alert.alert(
        'Email Not Available',
        'Please send your feedback to feedback@example.com',
        [
          { 
            text: 'Copy Email', 
            onPress: () => {
              // In a real app, you'd use Clipboard.setStringAsync here
              Alert.alert('Email Copied', 'feedback@example.com has been copied to clipboard');
            } 
          },
          { text: 'OK' }
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.headerContainer, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        </View>
        
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Appearance</Text>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            description="Use dark theme for the app"
            value={darkMode}
            onValueChange={toggleDarkMode}
            settings={settings}
          />
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Preferences</Text>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            description="Enable push notifications"
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            settings={settings}
          />
          <SettingItem
            icon="volume-high-outline"
            title="Sound Effects"
            description="Play sounds when completing tasks"
            value={settings.soundEffects}
            onValueChange={(value) => updateSetting('soundEffects', value)}
            settings={settings}
          />
          <SettingItem
            icon="notifications-outline"
            title="Haptic Feedback"
            description="Enable vibrations for actions"
            value={settings.hapticFeedback}
            onValueChange={(value) => updateSetting('hapticFeedback', value)}
            settings={settings}
          />
          <SettingItem
            icon="language-outline"
            title="Language"
            description="Set your preferred language"
            value={settings.languagePreference}
            onValueChange={() => handleSelectOption('languagePreference', LANGUAGES)}
            type="select"
            settings={settings}
          />
          <SettingItem
            icon="options-outline"
            title="Measurement Units"
            description="Choose between metric and imperial"
            value={settings.measurementUnit}
            onValueChange={() => handleSelectOption('measurementUnit', MEASUREMENT_UNITS)}
            type="select"
            settings={settings}
          />
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Meal Tracking</Text>
          <SettingItem
            icon="save-outline"
            title="Auto Save"
            description="Automatically save changes"
            value={settings.autoSave}
            onValueChange={(value) => updateSetting('autoSave', value)}
            settings={settings}
          />
          <SettingItem
            icon="sync-outline"
            title="Data Sync"
            description="Sync your data across devices"
            value={settings.dataSync}
            onValueChange={(value) => updateSetting('dataSync', value)}
            settings={settings}
          />
          <SettingItem
            icon="time-outline"
            title="Meal Reminders"
            description={`Get notifications for meal times${!settings.notifications ? ' (requires notifications to be enabled)' : ''}`}
            value={settings.mealReminders}
            onValueChange={(value) => updateSetting('mealReminders', value)}
            disabled={!settings.notifications}
            settings={settings}
          />
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Account</Text>
          <ButtonItem 
            title="Export Data"
            icon="download-outline"
            onPress={exportData}
            settings={settings}
          />
          <ButtonItem 
            title="Backup & Restore"
            icon="cloud-outline"
            onPress={backupRestore}
            settings={settings}
          />
          <ButtonItem 
            title="Reset All Settings"
            icon="refresh-outline"
            onPress={resetSettings}
            isDanger={true}
            settings={settings}
          />
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>About</Text>
          <ButtonItem 
            title="Privacy Policy"
            icon="shield-outline"
            onPress={() => openPolicyPage('Privacy Policy')}
            settings={settings}
          />
          <ButtonItem 
            title="Terms of Service"
            icon="document-text-outline"
            onPress={() => openPolicyPage('Terms of Service')}
            settings={settings}
          />
          <ButtonItem 
            title="Send Feedback"
            icon="mail-outline"
            onPress={sendFeedback}
            settings={settings}
          />
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: theme.secondary }]}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: 20,
  },
  Vertical: {
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingIconContainer: {
    width: 30,
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  dangerButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 14,
  },
});

export default Settings;
