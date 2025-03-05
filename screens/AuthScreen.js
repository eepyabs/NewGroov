import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

const AuthScreen = ({ navigation  }) => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleAuth = async () => {
        const endpoint = isSignUp ? "signup.php" : "signin.php";

        try {
            const response = await fetch(`http://192.168.195.24/SignUp.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", data.success);
                navigation.navigate("SongRecommendation");
            } else {
                Alert.alert("Error", data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Something went wrong. Try again.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignUp ? "Sign Up" : "Sign In"}</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.switchText}>
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
        backgroundColor: "#323231",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#79E872",
    },
    input: {
        width: "80%",
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 8,
        backgroundColor: "#91908F",
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
        color: "#79E872",
        fontWeight: "bold",
    },
});

export default AuthScreen;