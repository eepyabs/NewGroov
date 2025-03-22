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

                            const textResponse = await response.text();
                            console.log("🔍 Raw Response: ", textResponse);

                            let data;
                            try {
                                data = JSON.parse(textResponse);
                            } catch (error) {
                                console.error("❌ JSON Parse Error: ", error);
                                Alert.alert("Error", "Server response is not in the correct format.");
                                return;
                            }

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

            <View style={styles.themeContainer}>
                <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
                    Dark Mode
                </Text>
                <Switch
                    value={isDarkMode}
                    onValueChange={() => {
                        toggleTheme();
                        Alert.alert("Theme Changed", `Switched to ${isDarkMode ? "Light Mode" : "Dark Mode"}.`);
                    }}
                />
            </View>

            <View style={[styles.divider, { backgroundColor: isDarkMode ? "#FFF" : "#000" }]} />

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
            <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? "#79E872" : "#188D1E" }]} onPress={handleChangePassword}>
                <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>Update Password</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isDarkMode ? "#FFF" : "#000" }]} />

            {/* Logout Button */}
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>Log Out</Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
                <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>Delete Account</Text>
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
        fontSize: 40,
        fontFamily: 'Lobster',
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: 'center',
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 5,
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
        borderWidth: 2,
        borderColor: "black",
    },
    buttonText: {
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
        borderWidth: 2,
        borderColor: "black",
    },
    deleteButton: {
        backgroundColor: "red",
        borderWidth: 2,
        borderColor: "black",
    },
    divider: {
        height: 1,
        width: "80%",
        marginVertical: 20,
    },
});

export default SettingsScreen;
