import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';

// Simple app with authentication and tab-based navigation
export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Current tab
  const [currentTab, setCurrentTab] = useState('Checklist');
  
  // Login screen variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [users, setUsers] = useState([{ username: 'test', password: 'test' }]);

  // Handle login
  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  // Handle signup
  const handleSignUp = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
    
    if (users.some(u => u.username === username)) {
      Alert.alert('Error', 'Username already exists');
      return;
    }
    
    setUsers([...users, { username, password }]);
    Alert.alert('Success', 'Account created! You can now log in');
    setIsSigningUp(false);
  };

  // Render login/signup screen
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Health Tracker</Text>
          
          <Text style={styles.subtitle}>{isSigningUp ? 'Create Account' : 'Login'}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={isSigningUp ? handleSignUp : handleLogin}
          >
            <Text style={styles.buttonText}>{isSigningUp ? 'Sign Up' : 'Login'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsSigningUp(!isSigningUp)}>
            <Text style={styles.switchText}>
              {isSigningUp 
                ? 'Already have an account? Log in' 
                : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render main app with tabs
  return (
    <SafeAreaView style={styles.container}>
      {/* Content area */}
      <ScrollView style={styles.content}>
        <View style={styles.screenContainer}>
          {currentTab === 'Checklist' && (
            <Text style={styles.screenTitle}>Daily Checklist</Text>
          )}
          
          {currentTab === 'Meals' && (
            <Text style={styles.screenTitle}>Meals Page</Text>
          )}
          
          {currentTab === 'Log' && (
            <Text style={styles.screenTitle}>Log Page</Text>
          )}
          
          {currentTab === 'Recap' && (
            <Text style={styles.screenTitle}>Daily Recap</Text>
          )}
          
          {currentTab === 'Settings' && (
            <Text style={styles.screenTitle}>Settings & Notifications</Text>
          )}
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              setIsAuthenticated(false);
              setUsername('');
              setPassword('');
            }}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'Checklist' && styles.activeTab]} 
          onPress={() => setCurrentTab('Checklist')}
        >
          <Text style={styles.tabText}>Checklist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'Meals' && styles.activeTab]} 
          onPress={() => setCurrentTab('Meals')}
        >
          <Text style={styles.tabText}>Meals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'Log' && styles.activeTab]} 
          onPress={() => setCurrentTab('Log')}
        >
          <Text style={styles.tabText}>Log</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'Recap' && styles.activeTab]} 
          onPress={() => setCurrentTab('Recap')}
        >
          <Text style={styles.tabText}>Recap</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'Settings' && styles.activeTab]} 
          onPress={() => setCurrentTab('Settings')}
        >
          <Text style={styles.tabText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#3498db',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 20,
    color: '#3498db',
  },
  content: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 500,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    width: 200,
    height: 50,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#3498db',
  },
  tabText: {
    fontSize: 12,
  },
});