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

    // Combine data for final assessment prompt
    setLoadingAssessment(true);
    try {
      const prompt = `
      ###No json remark its an api that calls you so be a valid json {}
      Assess this interview for a ${profile.jobTitle} position:

      Candidate Profile: ${JSON.stringify(profile)}

      Written Answers:
      ${answersData.questions.map((q, i) => `Q${i + 1}: ${q.text}\nA: ${answersData.answers[q.id] || "No answer"}`).join("\n\n")}

      Live Interview Transcript:
      ${liveData.map(m => `${m.sender === "ai" ? "Interviewer" : "Candidate"}: ${m.text}`).join("\n")}
      NO PREAMBLE

      Provide a JSON response with scores for Technical Skills, Communication, Problem Solving, Experience Relevance, Cultural Fit, Overall Rating (0-100) and detailed feedback.

this is format {
  "scores": {
    "technical":
    "communication":
    "problemSolving":
    "experience":
    "culturalFit":
    "overall":
  },
  "feedback": 
}

      `;

      const apiResponse = await groqChat(prompt, profile.apiKey);
      const parsed = JSON.parse(apiResponse);
      setAssessmentData(parsed);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      // Fallback or empty state
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
