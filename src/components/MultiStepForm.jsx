import React, { useState } from "react";

export default function MultiStepForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    jobTitle: "",
    experience: "",
    skills: "",
    resume: "",
    apiKey: ""
  });
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.apiKey.trim()) {
      alert("Groq API key is required!");
      return;
    }
    onSubmit(form);
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex justify-center items-center">
      <form
        className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 w-full max-w-2xl border border-white border-opacity-20 shadow-2xl space-y-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-4xl font-bold text-white text-center mb-4">AI Interview Assistant</h1>
        <p className="text-gray-300 text-center mb-6">Let's get to know you better</p>
        <input className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
          name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
          name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
          name="jobTitle" placeholder="Job Title" value={form.jobTitle} onChange={handleChange} required />
        <select 
          className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-black focus:ring-2 focus:ring-blue-500"
          name="experience" value={form.experience} onChange={handleChange} required
        >
          <option value="">Years of Experience</option>
          <option value="0-1">0-1 (Entry)</option>
          <option value="2-3">2-3 (Junior)</option>
          <option value="4-6">4-6 (Mid)</option>
          <option value="7-10">7-10 (Senior)</option>
          <option value="10+">10+ (Expert)</option>
        </select>
        <textarea className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
          name="skills" placeholder="Skills (Python, React, ML, etc.)" value={form.skills} onChange={handleChange} />
        <textarea className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
          name="resume" rows="4" placeholder="Brief Resume/Background" value={form.resume} onChange={handleChange} />
        <div>
          <input className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
            name="apiKey" placeholder="Groq API Key" value={form.apiKey} onChange={handleChange} required />
          <p className="mt-1 text-blue-400 text-sm">
            Get it here: <a href="https://www.groq.ai" target="_blank" className="underline hover:text-blue-600">groq.ai</a>
          </p>
        </div>
        <button type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-300 transform hover:scale-105">
          Start Interview →
        </button>
      </form>
    </div>
  );
}
