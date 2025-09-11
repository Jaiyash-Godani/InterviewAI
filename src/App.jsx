import React, { useState } from "react";
import MultiStepForm from "./components/MultiStepForm";
import AIQuestions from "./components/AIQuestions";
import LiveInterview from "./components/LiveInterview";
import AssessmentResults from "./components/AssessmentResults";
import { groqChat } from "./api"; // Import your Groq API helper
import './styles/index.css';

export default function App() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [answersData, setAnswersData] = useState(null);
  const [liveInterviewData, setLiveInterviewData] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  function handleProfileSubmit(data) {
    setProfile(data);
    setStep(2);
  }

  function handleQuestionsFinish(data) {
    setAnswersData(data);
    setStep(3);
  }

  async function handleLiveInterviewFinish(liveData) {
    setLiveInterviewData(liveData);
    setLoadingAssessment(true);
    try {
      const prompt = `
Please respond ONLY with a valid JSON object adhering exactly to the format below (no extra text or commentary):

{ "scores": { "technical": 0-100, "communication": 0-100, "problemSolving": 0-100, "experience": 0-100, "culturalFit": 0-100, "overall": 0-100 }, "feedback": "Detailed feedback on the candidate's performance." }

Assess the following interview for the position of Software Engineer:

Assess this interview for a ${profile.jobTitle} position:
Candidate Profile: ${JSON.stringify(profile)}

Written Answers:
${answersData.questions.map((q, i) => `Q${i + 1}: ${q.text}\nA: ${answersData.answers[q.id] || "No answer"}`).join("\n\n")}

Live Interview Transcript:
${liveData.map(m => `${m.sender === "ai" ? "Interviewer" : "Candidate"}: ${m.text}`).join("\n")}
NO PREAMBLE OR EXTRA TEXT
`;

      const apiResponse = await groqChat(prompt, profile.apiKey);

      // Extract JSON string from API response if wrapped in extra text or code blocks
      const jsonStringMatch = apiResponse.match(/\{[\s\S]*\}/);
      if (!jsonStringMatch) throw new Error("No JSON found in API response");

      const parsed = JSON.parse(jsonStringMatch[0]);
      setAssessmentData(parsed);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setAssessmentData(null);
    }
    setLoadingAssessment(false);
    setStep(4);
  }

  function handleRestart() {
    setStep(1);
    setProfile(null);
    setAnswersData(null);
    setLiveInterviewData(null);
    setAssessmentData(null);
  }

  return (
    <>
      {step === 1 && <MultiStepForm onSubmit={handleProfileSubmit} />}
      {step === 2 && profile && (
        <AIQuestions profile={profile} onFinish={handleQuestionsFinish} />
      )}
      {step === 3 && profile && !loadingAssessment && (
        <LiveInterview profile={profile} onFinish={handleLiveInterviewFinish} />
      )}
      {loadingAssessment && (
        <div className="min-h-screen flex items-center justify-center text-white text-2xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          Loading final assessment...
        </div>
      )}
      {step === 4 && (
        <AssessmentResults assessment={assessmentData} onRestart={handleRestart} />
      )}
    </>
  );
}
