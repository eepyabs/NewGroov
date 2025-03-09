import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/utils/ThemeContext";
import { AntDesign } from "@expo/vector-icons";

const SettingsScreen = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const { isDarkMode, toggleTheme } = useTheme();
    const navigation = useNavigation();
    
    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem("theme");
            if (storedTheme) {
                toggleTheme(storedTheme === "dark");
            }
        };
        loadTheme();
    }, []);

    // Change Password
    const handleChangePassword = async () => {
        const username = await AsyncStorage.getItem("username");

        if (!currentPassword || !newPassword) {
            Alert.alert("Error", "Please enter both current and new passwords.");
            return;
        }

        try {
            const response = await fetch(`http://192.168.195.24/ChangePassword.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, currentPassword, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
            } else {
                Alert.alert("Error", data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Something went wrong. Try again.");
        }
    };

    // Logout
    const handleLogout = async () => {
        await AsyncStorage.clear();
        Alert.alert("Logged Out", "You have been logged out.");
        navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    };

    // Delete Account
    const handleDeleteAccount = async () => {
        const username = await AsyncStorage.getItem("username");

        Alert.alert(
            "Delete Account?",
            "This action is irreversible. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`http://192.168.195.24/DeleteAccount.php`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ username }),
                            });

                            const data = await response.json();

                            if (data.success) {
                                await AsyncStorage.clear();
                                Alert.alert("Account Deleted", "Your account has been deleted.");
                                navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
                            } else {
                                Alert.alert("Error", data.error);
                            }
                        } catch (error) {
                            console.error("Error:", error);
                            Alert.alert("Error", "Something went wrong. Try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("GenreList")}
            >
                <AntDesign name="arrowleft" size={24} color={isDarkMode ? "#79E872" : "#188D1E"} />
                <Text style={[styles.backButtonText, { color: isDarkMode ? "#79e872" : "#188D1E"}]}>
                    Back to Genre List
                </Text>
            </TouchableOpacity>

            <Text style={[styles.title, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>Settings</Text>

            {/* Change Password Section */}
            <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>Change Password</Text>
            <TextInput
                style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                placeholder="Current Password"
                secureTextEntry
                placeholderTextColor={isDarkMode ? "#CCC" : "#555"}
                value={currentPassword}
                onChangeText={setCurrentPassword}
            />
            <TextInput
                style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                placeholder="New Password"
                secureTextEntry
                placeholderTextColor={isDarkMode ? "#CCC" : "#555"}
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>

            {/* Dark Mode Toggle */}
            <View style={styles.themeContainer}>
                <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>Dark Mode</Text>
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
                <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    lightContainer: {
        backgroundColor: "#CCCCCC",
    },
    darkContainer: {
        backgroundColor: "#323231",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    lightText: {
        color: "#000",
    },
    darkText: {
        color: "#fff",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
    },
    input: {
        width: "80%",
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderRadius: 8,
    },
    lightInput: {
        backgroundColor: "#F0F0F0",
        borderColor: "#777",
        color: "#000",
    },
    darkInput: {
        backgroundColor: "#444",
        borderColor: "#AAA",
        color: "#FFF",
    },
    button: {
        backgroundColor: "#C564E8",
        padding: 12,
        borderRadius: 8,
        width: "80%",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    themeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "80%",
        marginTop: 20,
    },
    logoutButton: {
        backgroundColor: "#D75D92",
    },
    deleteButton: {
        backgroundColor: "red",
    },
});

export default SettingsScreen;
