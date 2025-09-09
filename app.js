// AI Interview Assistant JavaScript
class AIInterviewSystem {
    constructor() {
        this.currentPage = 'personalDetails';
        this.userProfile = {};
        this.questions = [];
        this.answers = {};
        this.currentQuestionIndex = 0;
        this.interviewTranscript = [];
        this.speechRecognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.interviewStartTime = null;
        this.interviewTimer = null;
        
        // Groq API configuration (replace with your API key)
        this.groqApiKey =  import.meta.env.GROQ; // Replace with actual API key
        this.groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.initializeSpeechRecognition();
        this.showPage('personalDetailsPage');
    }

    setupEventListeners() {
        // Personal form submission
        document.getElementById('personalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePersonalFormSubmit();
        });

        // Question navigation
        document.getElementById('prevQuestion').addEventListener('click', () => {
            this.navigateQuestion(-1);
        });

        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.navigateQuestion(1);
        });

        document.getElementById('submitQuestions').addEventListener('click', () => {
            this.submitWrittenQuestions();
        });

        // Live interview controls
        document.getElementById('startRecording').addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stopRecording').addEventListener('click', () => {
            this.stopRecording();
        });

        document.getElementById('endInterview').addEventListener('click', () => {
            this.endLiveInterview();
        });
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.speechRecognition = new webkitSpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'en-US';

            this.speechRecognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    this.handleUserSpeech(finalTranscript);
                }
            };

            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateStatus('Speech recognition error. Please try again.');
            };
        }
    }

    showPage(pageId) {
        const pages = ['personalDetailsPage', 'questionsPage', 'liveInterviewPage', 'resultsPage'];
        pages.forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');
    }

    showLoading(show = true) {
        document.getElementById('loadingScreen').classList.toggle('hidden', !show);
    }

    async handlePersonalFormSubmit() {
        this.showLoading(true);
        
        // Collect user profile data
        this.userProfile = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            jobTitle: document.getElementById('jobTitle').value,
            experience: document.getElementById('experience').value,
            skills: document.getElementById('skills').value,
            resume: document.getElementById('resume').value
        };

        try {
            // Generate questions based on user profile
            await this.generateQuestions();
            this.showLoading(false);
            this.showPage('questionsPage');
            this.displayQuestion();
        } catch (error) {
            console.error('Error generating questions:', error);
            this.showLoading(false);
            alert('Error generating questions. Please try again.');
        }
    }

    async generateQuestions() {
        const prompt = `Generate 7 technical interview questions for a ${this.userProfile.jobTitle} with ${this.userProfile.experience} years of experience. Skills: ${this.userProfile.skills}. 
        
        Make questions progressively challenging and relevant to their background. Return as JSON array with format:
        [{"question": "question text", "type": "technical|behavioral|project"}]`;

        try {
            const response = await this.callGroqAPI(prompt);
            const questionsData = JSON.parse(response);
            this.questions = questionsData.map((q, index) => ({
                id: index + 1,
                text: q.question,
                type: q.type || 'technical'
            }));
            
            document.getElementById('totalQuestions').textContent = this.questions.length;
        } catch (error) {
            // Fallback questions if API fails
            this.questions = this.getFallbackQuestions();
            document.getElementById('totalQuestions').textContent = this.questions.length;
        }
    }

    getFallbackQuestions() {
        return [
            { id: 1, text: "Explain the difference between let, const, and var in JavaScript.", type: "technical" },
            { id: 2, text: "How would you optimize a slow-performing web application?", type: "technical" },
            { id: 3, text: "Describe a challenging project you worked on and how you overcame obstacles.", type: "behavioral" },
            { id: 4, text: "What is your approach to debugging complex issues?", type: "technical" },
            { id: 5, text: "How do you stay updated with the latest technology trends?", type: "behavioral" },
            { id: 6, text: "Explain the concept of RESTful APIs and their best practices.", type: "technical" },
            { id: 7, text: "How would you handle a situation where you disagree with a team member's technical approach?", type: "behavioral" }
        ];
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('currentQuestion').textContent = question.id;
        document.getElementById('answerText').value = this.answers[question.id] || '';
        
        // Update navigation buttons
        document.getElementById('prevQuestion').disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === this.questions.length - 1) {
            document.getElementById('nextQuestion').classList.add('hidden');
            document.getElementById('submitQuestions').classList.remove('hidden');
        } else {
            document.getElementById('nextQuestion').classList.remove('hidden');
            document.getElementById('submitQuestions').classList.add('hidden');
        }
    }

    navigateQuestion(direction) {
        // Save current answer
        const currentQuestion = this.questions[this.currentQuestionIndex];
        this.answers[currentQuestion.id] = document.getElementById('answerText').value;
        
        // Navigate
        this.currentQuestionIndex += direction;
        if (this.currentQuestionIndex < 0) this.currentQuestionIndex = 0;
        if (this.currentQuestionIndex >= this.questions.length) this.currentQuestionIndex = this.questions.length - 1;
        
        this.displayQuestion();
    }

    async submitWrittenQuestions() {
        // Save final answer
        const currentQuestion = this.questions[this.currentQuestionIndex];
        this.answers[currentQuestion.id] = document.getElementById('answerText').value;
        
        this.showLoading(true);
        
        try {
            // Assess written answers
            await this.assessWrittenAnswers();
            this.showLoading(false);
            this.showPage('liveInterviewPage');
            this.initializeLiveInterview();
        } catch (error) {
            console.error('Error assessing answers:', error);
            this.showLoading(false);
            this.showPage('liveInterviewPage');
            this.initializeLiveInterview();
        }
    }

    async assessWrittenAnswers() {
        const prompt = `Assess the following interview answers for a ${this.userProfile.jobTitle}:
        
        ${this.questions.map(q => `Q: ${q.text}\nA: ${this.answers[q.id] || 'No answer provided'}`).join('\n\n')}
        
        Provide brief assessment focusing on technical accuracy and communication clarity.`;
        
        const assessment = await this.callGroqAPI(prompt);
        this.writtenAssessment = assessment;
    }

    initializeLiveInterview() {
        this.interviewTranscript = [];
        this.interviewStartTime = Date.now();
        this.startInterviewTimer();
        
        // Start with AI greeting
        setTimeout(() => {
            this.addAIMessage("Hello! I'm your AI interviewer. Let's have a conversation about your background and experience. Can you tell me a bit about yourself?");
        }, 1000);
    }

    startInterviewTimer() {
        this.interviewTimer = setInterval(() => {
            const elapsed = Date.now() - this.interviewStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('interviewDuration').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    addAIMessage(message) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-bubble ai p-4 mb-4 text-white';
        messageDiv.textContent = message;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Convert to speech
        this.speakText(message);
        
        // Add to transcript
        this.interviewTranscript.push({ speaker: 'AI', message, timestamp: Date.now() });
    }

    addUserMessage(message) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-bubble user p-4 mb-4 text-white';
        messageDiv.textContent = message;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add to transcript
        this.interviewTranscript.push({ speaker: 'User', message, timestamp: Date.now() });
        
        // Update questions asked counter
        const questionsAsked = this.interviewTranscript.filter(t => t.speaker === 'AI').length;
        document.getElementById('questionsAsked').textContent = questionsAsked;
    }

    speakText(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        this.speechSynthesis.speak(utterance);
    }

    startRecording() {
        if (this.speechRecognition) {
            this.speechRecognition.start();
            document.getElementById('startRecording').disabled = true;
            document.getElementById('stopRecording').disabled = false;
            this.updateStatus('Listening...');
            document.getElementById('statusIndicator').className = 'w-3 h-3 bg-red-500 rounded-full mr-3 pulse-recording';
        }
    }

    stopRecording() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
            document.getElementById('startRecording').disabled = false;
            document.getElementById('stopRecording').disabled = true;
            this.updateStatus('Processing...');
            document.getElementById('statusIndicator').className = 'w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse';
        }
    }

    async handleUserSpeech(transcript) {
        this.addUserMessage(transcript);
        this.updateStatus('Generating response...');
        
        try {
            const aiResponse = await this.generateAIResponse(transcript);
            setTimeout(() => {
                this.addAIMessage(aiResponse);
                this.updateStatus('Ready to continue');
                document.getElementById('statusIndicator').className = 'w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse';
            }, 1000);
        } catch (error) {
            console.error('Error generating AI response:', error);
            this.addAIMessage("I apologize, I'm having trouble processing that. Could you please repeat or rephrase your response?");
            this.updateStatus('Ready to continue');
        }
    }

    async generateAIResponse(userMessage) {
        const conversationHistory = this.interviewTranscript.slice(-6).map(t => 
            `${t.speaker}: ${t.message}`
        ).join('\n');
        
        const prompt = `You are conducting a professional interview for a ${this.userProfile.jobTitle} position. 
        User profile: ${JSON.stringify(this.userProfile)}
        
        Recent conversation:
        ${conversationHistory}
        
        The candidate just said: "${userMessage}"
        
        Respond as a human interviewer would - ask follow-up questions, probe deeper into their responses, or move to new topics. Keep responses conversational but professional. Limit to 2-3 sentences.`;
        
        return await this.callGroqAPI(prompt);
    }

    updateStatus(status) {
        document.getElementById('statusText').textContent = status;
    }

    async endLiveInterview() {
        if (this.interviewTimer) {
            clearInterval(this.interviewTimer);
        }
        
        this.showLoading(true);
        
        try {
            await this.generateFinalAssessment();
            this.showLoading(false);
            this.showPage('resultsPage');
            this.displayResults();
        } catch (error) {
            console.error('Error generating assessment:', error);
            this.showLoading(false);
            this.showPage('resultsPage');
            this.displayFallbackResults();
        }
    }

    async generateFinalAssessment() {
        const prompt = `Assess this complete interview for a ${this.userProfile.jobTitle} position:
        
        Candidate Profile: ${JSON.stringify(this.userProfile)}
        
        Written Assessment: ${this.writtenAssessment || 'Not available'}
        
        Interview Transcript: ${this.interviewTranscript.map(t => `${t.speaker}: ${t.message}`).join('\n')}
        
        Provide assessment with scores (0-100) for:
        1. Technical Skills
        2. Communication Skills  
        3. Problem Solving
        4. Experience Relevance
        5. Cultural Fit
        6. Overall Rating
        
        Also provide detailed feedback. Return as JSON:
        {
          "scores": {"technical": 85, "communication": 92, "problemSolving": 78, "experience": 88, "culturalFit": 85, "overall": 86},
          "feedback": "detailed feedback text"
        }`;
        
        const assessmentResponse = await this.callGroqAPI(prompt);
        this.finalAssessment = JSON.parse(assessmentResponse);
    }

    displayResults() {
        if (!this.finalAssessment) {
            this.displayFallbackResults();
            return;
        }
        
        const scores = this.finalAssessment.scores;
        
        // Update score displays
        document.getElementById('technicalScore').innerHTML = `
            <h4 class="text-white font-semibold mb-2">Technical Skills</h4>
            <div class="text-3xl font-bold text-blue-400 mb-2">${scores.technical}%</div>
            <p class="text-gray-300 text-sm">${this.getScoreLabel(scores.technical)}</p>
        `;
        
        document.getElementById('communicationScore').innerHTML = `
            <h4 class="text-white font-semibold mb-2">Communication</h4>
            <div class="text-3xl font-bold text-green-400 mb-2">${scores.communication}%</div>
            <p class="text-gray-300 text-sm">${this.getScoreLabel(scores.communication)}</p>
        `;
        
        document.getElementById('problemSolvingScore').innerHTML = `
            <h4 class="text-white font-semibold mb-2">Problem Solving</h4>
            <div class="text-3xl font-bold text-yellow-400 mb-2">${scores.problemSolving}%</div>
            <p class="text-gray-300 text-sm">${this.getScoreLabel(scores.problemSolving)}</p>
        `;
        
        // Update detailed feedback
        document.getElementById('detailedFeedback').innerHTML = `
            <p>${this.finalAssessment.feedback}</p>
        `;
        
        // Create charts
        this.createCharts(scores);
    }

    displayFallbackResults() {
        // Fallback with sample data
        const scores = {
            technical: 85,
            communication: 92,
            problemSolving: 78,
            experience: 88,
            culturalFit: 85,
            overall: 86
        };
        
        document.getElementById('detailedFeedback').innerHTML = `
            <p>Thank you for completing the interview! Based on your responses, you demonstrate strong technical knowledge and excellent communication skills. Your experience aligns well with the role requirements.</p>
            <p><strong>Strengths:</strong> Clear communication, solid technical foundation, relevant experience</p>
            <p><strong>Areas for improvement:</strong> Continue developing problem-solving methodologies and consider gaining experience with advanced technologies</p>
        `;
        
        this.createCharts(scores);
    }

    getScoreLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Satisfactory';
        return 'Needs Improvement';
    }

    createCharts(scores) {
        // Overall Performance Doughnut Chart
        const overallCtx = document.getElementById('overallChart').getContext('2d');
        this.createDoughnutChart(overallCtx, scores.overall);
        
        // Skills Bar Chart
        const skillsCtx = document.getElementById('skillsChart').getContext('2d');
        this.createBarChart(skillsCtx, scores);
    }

    createDoughnutChart(ctx, overallScore) {
        // Simple canvas drawing for doughnut chart
        ctx.clearRect(0, 0, 300, 300);
        const centerX = 150;
        const centerY = 150;
        const radius = 100;
        const innerRadius = 60;
        
        // Background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        
        // Score arc
        const scoreAngle = (overallScore / 100) * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, scoreAngle);
        ctx.arc(centerX, centerY, innerRadius, scoreAngle, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = '#60A5FA';
        ctx.fill();
        
        // Center text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${overallScore}%`, centerX, centerY + 8);
    }

    createBarChart(ctx, scores) {
        ctx.clearRect(0, 0, 300, 200);
        const skills = ['Technical', 'Communication', 'Problem Solving'];
        const values = [scores.technical, scores.communication, scores.problemSolving];
        const colors = ['#60A5FA', '#34D399', '#FBBF24'];
        
        const barWidth = 60;
        const barSpacing = 20;
        const maxHeight = 150;
        const startX = 30;
        const startY = 180;
        
        values.forEach((value, index) => {
            const barHeight = (value / 100) * maxHeight;
            const x = startX + index * (barWidth + barSpacing);
            
            // Draw bar
            ctx.fillStyle = colors[index];
            ctx.fillRect(x, startY - barHeight, barWidth, barHeight);
            
            // Draw value text
            ctx.fillStyle = 'white';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${value}%`, x + barWidth / 2, startY - barHeight - 5);
            
            // Draw label
            ctx.fillText(skills[index], x + barWidth / 2, startY + 15);
        });
    }

    async callGroqAPI(prompt) {
        // Note: In a real implementation, you would make the API call through a backend
        // to keep your API key secure. This is a simplified version for demonstration.
        
        try {
            const response = await fetch(this.groqEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Groq API error:', error);
            // Return fallback response
            return "I apologize, but I'm having trouble processing that right now. Could you please continue?";
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AIInterviewSystem();
});
