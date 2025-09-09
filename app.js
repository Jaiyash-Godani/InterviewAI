async handlePersonalFormSubmit() {
    this.showLoading(true);
    
    // Collect user profile data
    this.userProfile = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        jobTitle: document.getElementById('jobTitle').value,
        experience: document.getElementById('experience').value,
        skills: document.getElementById('skills').value,
        resume: document.getElementById('resume').value,
    };
    
    // Collect Groq API key
    this.groqApiKey = document.getElementById('groqApiKey').value.trim();
    
    if (!this.groqApiKey) {
        alert("Please enter your Groq API key to proceed.");
        this.showLoading(false);
        return;
    }
    
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
