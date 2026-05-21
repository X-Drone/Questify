export * from "./types";

export * from "./axios";
export * from "./errors";
export * from "./request";

export * from "./tests.api";
export * from "./questions.api";
export * from "./attempts.api";

// await testsApi.create({
//   title: "Physics Test",
//   description: "Quantum mechanics",
//   tags: ["physics", "science"],
// });

// await questionsApi.create(testId, {
//   title: "2 + 2 = ?",
//   type: "single_choice",

//   answer_options: [
//     {
//       text: "3",
//       is_correct: false,
//     },
//     {
//       text: "4",
//       is_correct: true,
//     },
//   ],
// });

// await attemptsApi.submitAnswer(
//   attemptId,
//   questionId,
//   {
//     selected_id: 1,
//   }
// );

// await attemptsApi.submitAnswer(
//   attemptId,
//   questionId,
//   {
//     selected_ids: [1, 2],
//   }
// );

// await attemptsApi.submitAnswer(
//   attemptId,
//   questionId,
//   {
//     selected_value: true,
//   }
// );

// await attemptsApi.submitAnswer(
//   attemptId,
//   questionId,
//   {
//     text: "Newton",
//   }
// );

// await attemptsApi.submitAnswer(
//   attemptId,
//   questionId,
//   {
//     value: 9.81,
//     tolerance: 0.01,
//   }
// );

// await attemptsApi.submitAnswer(
//   attemptId,
//   questionId,
//   {
//     pairs: [
//       {
//         left: 1,
//         right: 10,
//       },
//       {
//         left: 2,
//         right: 20,
//       },
//     ],
//   }
// );

// await attemptsApi.submitAnswer(
//   attemptId,
//   questionId,
//   {
//     order: [3, 1, 2],
//   }
// );
