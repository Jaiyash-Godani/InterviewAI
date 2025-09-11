import React, { useEffect, useRef } from "react";
import { Chart,DoughnutController, ArcElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, DoughnutController,BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AssessmentResults({ assessment, onRestart }) {
  const overallChartRef = useRef(null);
  const skillsChartRef = useRef(null);

  useEffect(() => {
    if (!assessment) return;

    const scores = assessment.scores;

    // Overall Doughnut chart
    new Chart(overallChartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Score', 'Remaining'],
        datasets: [{
          data: [scores.overall, 100 - scores.overall],
          backgroundColor: ['#60A5FA', 'rgba(255,255,255,0.1)'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '75%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false }
        },
        maintainAspectRatio: false
      }
    });

    // Skills Bar chart
    new Chart(skillsChartRef.current, {
      type: 'bar',
      data: {
        labels: ['Technical', 'Communication', 'Problem Solving', 'Experience', 'Cultural Fit'],
        datasets: [{
          label: 'Score (%)',
          data: [scores.technical, scores.communication, scores.problemSolving, scores.experience, scores.culturalFit],
          backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#a855f7', '#f97316']
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, max: 100 }
        },
        plugins: {
          legend: { display: false }
        },
        maintainAspectRatio: false
      }
    });

  }, [assessment]);

  if (!assessment) return null;

  const { feedback, scores } = assessment;
  const scoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl w-full max-w-6xl p-8 border border-white border-opacity-20 shadow-2xl text-white">
        <h2 className="text-3xl font-bold text-center mb-6">Interview Assessment Results</h2>
        <p className="text-center text-gray-300 mb-8">Here's your comprehensive interview evaluation</p>
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="h-64 relative">
            <canvas ref={overallChartRef}></canvas>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-white text-4xl font-bold">{scores.overall}%</span>
              <span className="text-gray-300 text-sm mt-1">Overall Rating</span>
            </div>
          </div>
          <div className="h-64">
            <canvas ref={skillsChartRef}></canvas>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
            <h4 className="font-semibold mb-2">Technical Skills</h4>
            <div className="text-3xl font-bold text-blue-400">{scores.technical}%</div>
            <p className="text-gray-300">{scoreLabel(scores.technical)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
            <h4 className="font-semibold mb-2">Communication</h4>
            <div className="text-3xl font-bold text-green-400">{scores.communication}%</div>
            <p className="text-gray-300">{scoreLabel(scores.communication)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
            <h4 className="font-semibold mb-2">Problem Solving</h4>
            <div className="text-3xl font-bold text-yellow-400">{scores.problemSolving}%</div>
            <p className="text-gray-300">{scoreLabel(scores.problemSolving)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
            <h4 className="font-semibold mb-2">Experience Relevance</h4>
            <div className="text-3xl font-bold text-purple-400">{scores.experience}%</div>
            <p className="text-gray-300">{scoreLabel(scores.experience)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
            <h4 className="font-semibold mb-2">Cultural Fit</h4>
            <div className="text-3xl font-bold text-orange-400">{scores.culturalFit}%</div>
            <p className="text-gray-300">{scoreLabel(scores.culturalFit)}</p>
          </div>
        </div>
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
          <p className="text-gray-300 whitespace-pre-line">{feedback}</p>
        </div>
        <div className="text-center">
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-300"
          >
            Restart Interview
          </button>
        </div>
      </div>
    </div>
  );
}
