import React, { useEffect, useState } from "react";
import { groqChat } from "../api";

export default function AIQuestions({ profile, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Groq interview questions
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      const prompt = `Generate 7 interview questions for a ${profile.jobTitle} with ${profile.experience} years. Skills: ${profile.skills}. Format: [{"question":...}]`;
      try {
        const res = await groqChat(prompt, profile.apiKey);
        const parsed = JSON.parse(res);
        setQuestions(parsed.map((q, i) => ({ id: i, text: q.question })));
        setLoading(false);
      } catch {
        setQuestions([
          { id: 0, text: "Describe the difference between supervised and unsupervised learning." },
          { id: 1, text: "What are hooks in React?" },
          { id: 2, text: "How do you manage large scale codebases?" },
          { id: 3, text: "Tell us about a project where you led an ML initiative." }
        ]);
        setLoading(false);
      }
    }
    getQuestions();
  }, [profile]);

  function handleChange(e) {
    setAnswers({ ...answers, [questions[current].id]: e.target.value });
  }

  function handleNext() {
    if (current < questions.length - 1) setCurrent(current + 1);
  }
  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }
  function handleSubmit() {
    onFinish({ answers, questions });
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <span className="text-white text-2xl animate-pulse">Loading questions...</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 max-w-xl w-full border border-white border-opacity-20 shadow-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Tech Assessment</h2>
          <span className="text-blue-400 font-medium">Question {current+1} of {questions.length}</span>
        </div>
        <div>
          <h3 className="text-lg text-white font-semibold mb-4">{questions[current].text}</h3>
          <textarea
            rows={6}
            className="w-full bg-white bg-opacity-20 px-4 py-3 rounded-lg text-white border border-white border-opacity-30"
            value={answers[questions[current].id] || ""}
            onChange={handleChange}
            placeholder="Type your answer here..."
          />
        </div>
        <div className="flex justify-between mt-4">
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg"
            onClick={handlePrev} disabled={current === 0}>← Previous</button>
          {current < questions.length - 1 ? (
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg"
              onClick={handleNext}>Next →</button>
          ) : (
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg"
              onClick={handleSubmit}>Submit & Continue</button>
          )}
        </div>
      </div>
    </div>
  );
}
