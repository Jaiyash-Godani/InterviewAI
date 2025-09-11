
import React, { useState, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { groqChat } from "../api";

export default function LiveInterview({ profile, onFinish }) {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm your AI interviewer. Please introduce yourself." }
  ]);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  function handleRecordClick() {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: false,
      language: "en-US"
    });
    setStatus("Listening...");
  }

  async function handleStopClick() {
    SpeechRecognition.stopListening();
    setStatus("Processing...");
    if (transcript.trim()) {
      await handleUserSend(transcript.trim());
      resetTranscript();
    } else {
      setStatus("Ready");
    }
  }

  // Clears current transcript, lets user speak again without sending answer
  function handleRerecordClick() {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: false,
      language: "en-US"
    });
    setStatus("Re-recording...");
  }

  function speak(text) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 0.97;
    utter.pitch = 1;
    utter.volume = 0.9;
    synthRef.current.speak(utter);
  }

  async function handleUserSend(text) {
    setLoading(true);
    setMessages(msg => [...msg, { sender: "user", text }]);
    setStatus("AI is thinking...");
    const history = messages
      .map(m => (m.sender === "ai" ? `Interviewer: ${m.text}` : `You: ${m.text}`))
      .slice(-6)
      .join("\n");
    const prompt = `You are an interviewer for a ${profile.jobTitle}. Profile: ${JSON.stringify(
      profile
    )}. Last turns: ${history}. Candidate just said: "${text}". 
Respond as a human interviewer, ask relevant questions, probe projects and experience, act conversational and professional (2-3 sentences) NO PREAMBLE.`;
    try {
      const aiReply = await groqChat(prompt, profile.apiKey);
      setMessages(msg => [...msg, { sender: "ai", text: aiReply }]);
      setLoading(false);
      setStatus("Ready");
      speak(aiReply);
    } catch {
      setMessages(msg => [...msg, { sender: "ai", text: "Sorry, couldn't get a response." }]);
      setLoading(false);
      setStatus("Ready");
    }
  }

  function handleEnd() {
    onFinish(messages);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 max-w-3xl w-full border border-white border-opacity-20 shadow-2xl space-y-6">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Live Interview</h2>
        <div className="h-64 overflow-y-auto bg-white bg-opacity-20 rounded-lg p-4 mb-4 shadow">
          {messages.map((m, i) => (
            <div key={i} className={`mb-3 text-white ${m.sender === "ai" ? "text-left" : "text-right"}`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  m.sender === "ai" ? "bg-blue-600 bg-opacity-70" : "bg-pink-500 bg-opacity-70"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {listening && (
            <div className="text-green-400 text-center mt-2">(Listening...) Transcript: {transcript}</div>
          )}
        </div>
        <div className="flex space-x-4 justify-center">
          {!listening ? (
            <>
              <button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg"
                onClick={handleRecordClick}
              >
                🎤 Start Speaking
              </button>
              <button className="bg-green-700 text-white px-6 py-3 rounded-lg" onClick={handleEnd}>
                End Interview →
              </button>
            </>
          ) : (
            <>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg" onClick={handleStopClick}>
                ⏹️ Stop
              </button>
              <button
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg"
                onClick={handleRerecordClick}
              >
                🔄 Re-record
              </button>
            </>
          )}
        </div>
        <div className="mt-4 text-center text-white opacity-75">
          <span>Status:</span> {status}
          {loading && "..."}
        </div>
      </div>
    </div>
  );
}
