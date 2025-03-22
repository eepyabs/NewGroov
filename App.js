import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import { Audio } from 'expo-av';
import { ThemeProvider } from './utils/ThemeContext';
import SongRecommendationScreen from './screens/SongRecommendationScreen';
import AddSongScreen from './screens/AddSongScreen';
import GenreListScreen from './screens/GenreListScreen';
import GenreDetailScreen from './screens/GenreDetailScreen';
import AuthScreen from './screens/AuthScreen';
import SettingsScreen from './screens/SettingsScreen';
import FindGenresScreen from './screens/FindGenresScreen';

const Stack = createStackNavigator();

function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const loadFonts = async () => {
            try {
                await Font.loadAsync({
                    'Lobster': require('./assets/fonts/Lobster-Regular.ttf'),
                });
                setFontsLoaded(true);
            } catch (error) {
                console.error('Error loading fonts:', error);
            }
        };

        const setupAudioCleanup = () => {
            return () => {
                Audio.setIsEnabledAsync(false).catch((error) => {
                    console.error('Error disabling audio globally:', error);
                });
            };
        };

        loadFonts();

        return setupAudioCleanup();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#66BEBA" />
            </View>
        );
    }

    return (
        <ThemeProvider>
            <NavigationContainer>
                <Stack.Navigator 
                    initialRouteName="Auth" // Start on AuthScreen
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#6200EE'
                        },
                        headerTintColor: '#fff',
                        headerTintStyle: {
                            fontWeight: 'bold',
                            fontFamily: 'Lobster',
                        },
                    }}
                >
                    <Stack.Screen 
                        name="Auth" 
                        component={AuthScreen} 
                        options={{ title: 'Sign In / Sign Up' }} 
                    />
                    <Stack.Screen 
                        name="SongRecommendation" 
                        component={SongRecommendationScreen} 
                        options={{ title: 'Share a Song' }} 
                    />
                    <Stack.Screen
                        name="FindGenres"
                        component={FindGenresScreen}
                        options={{ title: 'Find a Genre' }}
                    />
                    <Stack.Screen 
                        name="AddSong" 
                        component={AddSongScreen} 
                        options={{ title: 'Add a Song' }}
                    />
                    <Stack.Screen 
                        name="GenreList" 
                        component={GenreListScreen} 
                        options={{ title: 'Genre List' }}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{ title: 'Settings'}}
                    />
                    <Stack.Screen 
                        name="GenreDetail" 
                        component={GenreDetailScreen} 
                        options={{ title: 'Genre Details' }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}

export default App;