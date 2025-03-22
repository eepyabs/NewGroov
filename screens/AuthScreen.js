import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useTheme } from '@/utils/ThemeContext';

const AuthScreen = ({ navigation  }) => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [username, setUsername] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const { isDarkMode } = useTheme();

    const handleAuth = async () => {
        const endpoint = isSignUp ? "SignUp.php" : "SignIn.php";

        const requestBody = isSignUp
            ? { username, email: identifier, password }
            : { identifier, password };

        try {
            const response = await fetch(`http://192.168.195.24/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (data.success) {
                const userToStore = isSignUp ? username : data.username;
                if (userToStore) {
                    console.log("✅ Saving username to AsyncStorage: ", userToStore);
                    await AsyncStorage.setItem("username", userToStore);
                } else {
                    console.error("❌ Username is missing from response.");
                }
                Alert.alert("Success", data.success);
                navigation.navigate("GenreList");
            } else {
                Alert.alert("Error", data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Something went wrong. Try again.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#323231" : "#CCCCCC" }]}>
            <Text style={[styles.title, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>
                {isSignUp ? "Sign Up" : "Sign In"}
            </Text>

            {isSignUp && (
                <TextInput
                    style={[styles.input, { backgroundColor: isDarkMode ? "#91908F" : "#FFFFFF" }]}
                    placeholder="Choose a username"
                    placeholderTextColor="black"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                />
            )}

            <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? "#91908F" : "#FFFFFF" }]}
                placeholder={isSignUp ? "Email" : "Email or Username"}
                placeholderTextColor="black"
                keyboardType={isSignUp ? "email-address" : "default"}
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
            />

            <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? "#91908F" : "#FFFFFF" }]}
                placeholder="Password"
                placeholderTextColor="black"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={[styles.switchText, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "80%",
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 8,
    },
    button: {
        backgroundColor: "#C564E8",
        padding: 12,
        borderRadius: 8,
        width: "80%",
        alignItems: "center",
    },
    buttonText: {
        color: "black",
        fontSize: 16,
        fontWeight: "bold",
    },
    switchText: {
        marginTop: 15,
        fontWeight: "bold",
    },
});

export default AuthScreen;