import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { registerRootComponent } from 'expo';
import * as Font from 'expo-font';
import SongRecommendationScreen from './screens/SongRecommendationScreen';
import AddSongScreen from './screens/AddSongScreen';
import GenreListScreen from './screens/GenreListScreen';
import GenreDetailScreen from './screens/GenreDetailScreen';

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

        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#66BEBA" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName="SongRecommendation"
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
                <Stack.Screen //Song Rec Screen
                    name="SongRecommendation" 
                    component={SongRecommendationScreen} 
                    options={{ title: 'Share a Song' }} 
                />
                <Stack.Screen //Add Song Screen
                    name="AddSong" 
                    component={AddSongScreen} 
                    options={{ title: 'Add a Song' }}
                />
                <Stack.Screen //Genre List Screen
                    name="GenreList" 
                    component={GenreListScreen} 
                    options={{ title: 'Genre List' }}
                />
                <Stack.Screen 
                    name="GenreDetail" 
                    component={GenreDetailScreen} 
                    options={{ title: 'Genre Details' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

registerRootComponent(App);

export default App;
