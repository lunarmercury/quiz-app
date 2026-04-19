import React, { useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Button, ButtonGroup } from "@rneui/themed";

const Stack = createStackNavigator();

// Question Component
export function Question({ route, navigation }) {
  const { data, index = 0, userAnswers = [] } = route.params;
  const question = data[index];

  const [selected, setSelected] = useState(
    question.type === "multiple-answer" ? [] : null
  );

  const onChoicePress = (choiceIndex) => {
    if (question.type === "multiple-answer") {
      if (selected.includes(choiceIndex)) {
        setSelected(selected.filter((i) => i !== choiceIndex));
      } else {
        setSelected([...selected, choiceIndex]);
      }
    } else {
      setSelected(choiceIndex);
    }
  };

  const buttons = question.choices.map((choice, i) => {
    if (question.type === "multiple-answer") {
      return selected.includes(i) ? `✓ ${choice}` : choice;
    }
    return choice;
  });

  const selectedIndex =
    question.type === "multiple-answer" ? -1 : selected === null ? -1 : selected;

  // Next press
  const onNext = () => {
    if (
      (question.type === "multiple-answer" && selected.length === 0) ||
      (question.type !== "multiple-answer" && selected === null)
    ) {
      alert("Please select an answer before continuing.");
      return;
    }

    // Save answer
    const newUserAnswers = [...userAnswers];
    newUserAnswers[index] = selected;

    if (index + 1 < data.length) {
      navigation.replace("Question", {
        data,
        index: index + 1,
        userAnswers: newUserAnswers,
      });
    } else {
      // Navigate to summary
      navigation.replace("Summary", { data, userAnswers: newUserAnswers });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <ButtonGroup
        buttons={buttons}
        selectedIndex={selectedIndex}
        onPress={onChoicePress}
        vertical
        containerStyle={{ marginBottom: 20 }}
        buttonStyle={{ justifyContent: "flex-start" }}
        testID="choices"
      />
      <Button
        title={index + 1 === data.length ? "Finish Quiz" : "Next Question"}
        onPress={onNext}
        testID="next-question"
      />
    </View>
  );
}

// Summary
export function Summary({ route }) {
  const { data, userAnswers } = route.params;

  // Score
  const score = data.reduce((acc, question, i) => {
    const userAns = userAnswers[i];
    const correct = question.correct;

    if (question.type === "multiple-answer") {
      if (
        Array.isArray(userAns) &&
        userAns.length === correct.length &&
        userAns.every((val) => correct.includes(val))
      ) {
        return acc + 1;
      }
      return acc;
    } else {
      if (userAns === correct) return acc + 1;
      return acc;
    }
  }, 0);

  const userSelected = (i, choiceIndex) => {
    const ans = userAnswers[i];
    if (Array.isArray(ans)) {
      return ans.includes(choiceIndex);
    }
    return ans === choiceIndex;
  };

  const isChoiceCorrect = (question, choiceIndex) => {
    if (Array.isArray(question.correct)) {
      return question.correct.includes(choiceIndex);
    }
    return question.correct === choiceIndex;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.score} testID="total">
        Total Score: {score} / {data.length}
      </Text>
      {data.map((question, i) => (
        <View key={i} style={styles.summaryQuestion}>
          <Text style={styles.prompt}>
            {i + 1}. {question.prompt}
          </Text>
          {question.choices.map((choice, idx) => {
            const selected = userSelected(i, idx);
            const correct = isChoiceCorrect(question, idx);

            let style = {};
            if (selected && correct) {
              style = { fontWeight: "bold" };
            } else if (selected && !correct) {
              style = { textDecorationLine: "line-through", color: "red" };
            } else if (!selected && correct) {
              style = { fontWeight: "bold" };
            }

            return (
              <Text key={idx} style={[styles.choiceText, style]}>
                {choice}
              </Text>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

// Main App

/*
Correct answers:
1) "What is 1 + 2?" - multiple-choice, correct: 1 ("3")
2) "What color is a flamingo?" - multiple-answer, correct: 1 & 2 ("Pink"), ("Orange")
3) "Professor Pan is a great professor." - true-false, correct: 1 ("False")
*/

export default function App() {
  const sampleData = [
    {
      prompt: "What is 1 + 2?",
      type: "multiple-choice",
      choices: ["5", "3", "8", "2"],
      correct: 1,
    },
    {
      prompt: "What color is a flamingo?",
      type: "multiple-answer",
      choices: ["Blue", "Pink", "Orange", "Green"],
      correct: [1, 2],
    },
    {
      prompt: "Professor Pan is a great professor.",
      type: "true-false",
      choices: ["True", "False"],
      correct: 1,
    },
  ];

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen
          name="Question"
          component={Question}
          initialParams={{ data: sampleData, index: 0, userAnswers: [] }}
          options={{ headerTitle: "Quiz" }}
        />
        <Stack.Screen
          name="Summary"
          component={Summary}
          options={{ headerTitle: "Summary" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  prompt: {
    fontSize: 18,
    marginBottom: 15,
  },
  score: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  summaryQuestion: {
    marginBottom: 25,
  },
  choiceText: {
    fontSize: 16,
    marginLeft: 10,
    marginVertical: 2,
  },
});

