import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/utils/ThemeContext";

const quizQuestions = [
    {
        question: "What's your ideal vibe?",
        answers: [
            { text: "Chill & mellow", genre: "Lo-fi" },
            { text: "Upbeat & energetic", genre: "Pop" },
            { text: "Deep & emotional", genre: "R&B" },
            { text: "Hype & powerful", genre: "Hip Hop"},
        ],
    },
    {
        question: "Which setting do you enjoy music in most?",
        answers: [
            { text: "Alone with headphones", genre: "Indie" },
            { text: "Dancing with friends", genre: "Electronic" },
            { text: "At a live concert", genre: "Rock" },
            { text: "While studying or working", genre: "Classical" },
        ],
    },
];

const QuizScreen = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const handleAnswer = (genre) => {
        const updatedGenres = [...selectedGenres, genre];

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setSelectedGenres(updatedGenres);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const genreCount = {};
            updatedGenres.forEach((g) => {
                genreCount[g] = (genreCount[g] || 0) + 1;
            });
            const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
            const recommendedGenre = sorted[0][0];

            Alert.alert(
                "🎧 Your Vibe Match",
                `We think you'll enjoy: ${recommendedGenre}`,
                [
                    {
                        text: "Explore Genre",
                        onPress: () =>
                            navigation.navigate("GenreDetail", { genre: recommendedGenre }),
                    },
                    {
                        text: "Back to Search",
                        onPress: () => navigation.navigate("SongRecommendation"),
                        style: "cancel",
                    },
                ]
            );
        }
    };

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <View 
            style={[styles.container, { backgroundColor: isDarkMode ? "#323231" : "#CCCCCC" }, ]}
        >
            <Text style={[styles.questionText, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>
                {currentQuestion.question}
            </Text>
            {currentQuestion.answers.map((answer, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.answerButton, { backgroundColor: isDarkMode ? "#C564E8" : "#BB2BF4", }, ]}
                    onPress={() => handleAnswer(answer.genre)}
                >
                    <Text style={[styles.answerText, { color: isDarkMode ? "black" : "white" }]}>{answer.text}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        justifyContent: "center",
    },
    questionText: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    answerButton: {
        padding: 12,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "black",
    },
    answerText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default QuizScreen;