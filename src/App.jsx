import React, { useState } from "react";
import MultiStepForm from "./components/MultiStepForm";
import AIQuestions from "./components/AIQuestions";
import LiveInterview from "./components/LiveInterview";
import AssessmentResults from "./components/AssessmentResults";
import './styles/index.css';
export default function App() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [answersData, setAnswersData] = useState(null);
  const [liveInterviewData, setLiveInterviewData] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);

  function handleProfileSubmit(data) {
    setProfile(data);
    setStep(2);
  }

  function handleQuestionsFinish(data) {
    setAnswersData(data);
    setStep(3);
  }

  function handleLiveInterviewFinish(data) {
    setLiveInterviewData(data);
    // Could combine data here or call final assessment API
    // For now, move directly to results with mocked assessment (can expand later)
    setAssessmentData(null);
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
      {step === 3 && profile && (
        <LiveInterview profile={profile} onFinish={handleLiveInterviewFinish} />
      )}
      {step === 4 && (
        <AssessmentResults assessment={assessmentData} onRestart={handleRestart} />
      )}
    </>
  );
}
