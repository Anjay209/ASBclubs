document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
  const firebaseConfig = {
        apiKey: "AIzaSyBoQcPq9ftoTfE8Wm7TOOcol0c_XPBXRpE",
        authDomain: "asbclubs-40fe1.firebaseapp.com",
        projectId: "asbclubs-40fe1",
        storageBucket: "asbclubs-40fe1.appspot.com",
        messagingSenderId: "534365161502",
        appId: "1:534365161502:web:940ee13b2b3f105b65860f",
        measurementId: "G-WCSQQDHHR1"
    };

    // Global database reference
    let db;
    let auth;

    // Initialize Firebase
    try {
        if (!firebase.apps.length) {
            const firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
            
            // Initialize services
            db = firebaseApp.firestore();
            auth = firebaseApp.auth();
            
            // Configure Firestore settings
            db.settings({
                experimentalForceLongPolling: true,
                merge: true
            });
            
            // Enable Firestore persistence with error handling
            firebase.firestore().enablePersistence({
                synchronizeTabs: true
            })
            .then(() => {
                console.log("Firestore persistence enabled");
            })
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn("Persistence enabled in another tab");
                } else if (err.code == 'unimplemented') {
                    console.warn("Browser doesn't support persistence");
                } else {
                    console.warn("Persistence error:", err);
                }
            });
        } else {
            // Use existing app if already initialized
            db = firebase.firestore();
            auth = firebase.auth();
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
        alert("Failed to initialize Firebase. Please refresh the page.");
        return;
    }

    // Rest of your code remains the same...
    let currentStep = 1;
    const totalSteps = 4;
    
    // Form data storage
    const formData = {
        clubName: '',
        goal: '',
        mission: '',
        meetingFrequency: '',
        meetingTime: '',
        additionalInfo: '',
        creatorId: '',
        creatorName: '',
        creatorEmail: ''
    };
    
    // Get elements
    const backBtn = document.getElementById('back-btn');
    const continueBtn = document.getElementById('continue-btn');
    const steps = document.querySelectorAll('.step');
    const dots = document.querySelectorAll('.dot');
    
    // Preview elements
    const previewName = document.getElementById('preview-name');
    const previewUrl = document.getElementById('preview-url');
    const previewGoal = document.getElementById('preview-goal');
    const previewMission = document.getElementById('preview-mission');
    const previewSchedule = document.getElementById('preview-schedule');
    const previewAdditional = document.getElementById('preview-additional');
    const userInitial = document.getElementById('user-initial');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    // Initialize with stored club name and user data
    function initializeData() {
        // Get club name from localStorage
        const clubName = localStorage.getItem('clubName') || 'Your Club';
        formData.clubName = clubName;
        previewName.textContent = clubName;
        previewUrl.textContent = `https://${clubName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.hhsasbclubs`;
        
        // Check if user is authenticated
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in
                formData.creatorId = user.uid;
                formData.creatorName = user.displayName || `${clubName} Creator`;
                formData.creatorEmail = user.email || '';
                
                // Update UI with user info
                userInitial.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : clubName.charAt(0).toUpperCase();
                userName.textContent = formData.creatorName;
                userEmail.textContent = formData.creatorEmail;
            } else {
                // No user is signed in - redirect to login
                window.location.href = 'login.html';
            }
        });
    }
    
    // Update step visibility
    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep - 1);
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < currentStep);
        });
        
        // Update navigation buttons
        backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        continueBtn.textContent = currentStep === totalSteps ? 'Create Club' : 'Continue';
        
        checkStepCompletion();
    }
    
    // Check if current step is completed
    function checkStepCompletion() {
        let isCompleted = false;
        
        switch(currentStep) {
            case 1:
                isCompleted = document.querySelector('input[name="goal"]:checked') !== null;
                break;
            case 2:
                isCompleted = document.getElementById('mission').value.trim() !== '';
                break;
            case 3:
                isCompleted = document.getElementById('meeting-frequency').value !== '' && 
                             document.getElementById('meeting-time').value.trim() !== '';
                break;
            case 4:
                isCompleted = true; // Optional step
                break;
        }
        
        continueBtn.disabled = !isCompleted;
    }
    
    // Update preview card
    function updatePreview() {
        // Update goal
        const selectedGoal = document.querySelector('input[name="goal"]:checked');
        if (selectedGoal) {
            formData.goal = selectedGoal.value;
            const goalText = {
                'build': 'To learn skills',
                'migrate': 'Compete in events',
                'explore': 'Other'
            };
            previewGoal.textContent = goalText[selectedGoal.value] || 'Not specified';
        }
        
        // Update mission
        const mission = document.getElementById('mission').value.trim();
        if (mission) {
            formData.mission = mission;
            previewMission.textContent = mission.length > 100 ? mission.substring(0, 100) + '...' : mission;
        }
        
        // Update meeting schedule
        const frequency = document.getElementById('meeting-frequency').value;
        const time = document.getElementById('meeting-time').value.trim();
        if (frequency && time) {
            formData.meetingFrequency = frequency;
            formData.meetingTime = time;
            previewSchedule.textContent = `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} - ${time}`;
        } else if (frequency) {
            previewSchedule.textContent = frequency.charAt(0).toUpperCase() + frequency.slice(1);
        }
        
        // Update additional info
        const additional = document.getElementById('additional-info').value.trim();
        if (additional) {
            formData.additionalInfo = additional;
            previewAdditional.textContent = additional.length > 80 ? additional.substring(0, 80) + '...' : additional;
        }
    }
    
    // Event listeners for form inputs
    function setupEventListeners() {
        // Goal radio buttons
        document.querySelectorAll('input[name="goal"]').forEach(radio => {
            radio.addEventListener('change', () => {
                updatePreview();
                checkStepCompletion();
            });
        });
        
        // Mission textarea
        document.getElementById('mission').addEventListener('input', () => {
            updatePreview();
            checkStepCompletion();
        });
        
        // Meeting inputs
        document.getElementById('meeting-frequency').addEventListener('change', () => {
            updatePreview();
            checkStepCompletion();
        });
        
        document.getElementById('meeting-time').addEventListener('input', () => {
            updatePreview();
            checkStepCompletion();
        });
        
        // Additional info
        document.getElementById('additional-info').addEventListener('input', () => {
            updatePreview();
            checkStepCompletion();
        });
        
        // Navigation buttons
        backBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStep();
            }
        });
        
        continueBtn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStep();
            } else {
                // Final step - create club
                handleClubCreation();
            }
        });
        
        // Progress dots navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (index < currentStep) { // Only allow going back
                    currentStep = index + 1;
                    updateStep();
                }
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !continueBtn.disabled) {
                continueBtn.click();
            } else if (e.key === 'ArrowLeft' && currentStep > 1) {
                backBtn.click();
            } else if (e.key === 'ArrowRight' && currentStep < totalSteps && !continueBtn.disabled) {
                continueBtn.click();
            }
        });
        
        // Allow editing club name
        previewName.addEventListener('click', () => {
            const newName = prompt('Enter your club name:', formData.clubName);
            if (newName && newName.trim()) {
                formData.clubName = newName.trim();
                previewName.textContent = formData.clubName;
                previewUrl.textContent = `https://${formData.clubName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.circle.so`;
            }
        });
    }
    
    // Handle final club creation in Firebase
    // Handle final club creation in Firebase
async function handleClubCreation() {
    // Show loading state
    continueBtn.disabled = true;
    continueBtn.innerHTML = '<span class="spinner"></span> Creating...';
    
    try {
        // Create URL-friendly club ID
        const clubId = formData.clubName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Prepare club data for Firestore
        const clubData = {
            name: formData.clubName,
            clubId: clubId,
            goal: formData.goal,
            mission: formData.mission,
            meetingFrequency: formData.meetingFrequency,
            meetingTime: formData.meetingTime,
            additionalInfo: formData.additionalInfo,
            creatorId: formData.creatorId,
            creatorName: formData.creatorName,
            creatorEmail: formData.creatorEmail,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            members: [formData.creatorId],
            memberCount: 1,
            status: 'active'
        };
        
        // Add club to Firestore
        await db.collection('clubs').doc(clubId).set(clubData);
        
        // Update user document with club reference
        await db.collection('users').doc(formData.creatorId).update({
            clubs: firebase.firestore.FieldValue.arrayUnion(clubId),
            ownedClubs: firebase.firestore.FieldValue.arrayUnion(clubId)
        });
        
        // Clear localStorage
        localStorage.removeItem('clubName');
        
        // Redirect to index.html after successful creation
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error creating club:', error);
        alert('There was an error creating your club. Please try again.');
        continueBtn.disabled = false;
        continueBtn.textContent = 'Create Club';
    }
}
    
    // Auto-advance for certain steps
    function setupAutoAdvance() {
        // Auto-advance when goal is selected (with delay)
        document.querySelectorAll('input[name="goal"]').forEach(radio => {
            radio.addEventListener('change', () => {
                setTimeout(() => {
                    if (!continueBtn.disabled && currentStep === 1) {
                        continueBtn.click();
                    }
                }, 800);
            });
        });
    }
    
    // Initialize everything
     initializeData();
    updateStep();
    setupEventListeners();
    setupAutoAdvance();
    
    // Clean up localStorage when leaving the page
    window.addEventListener('beforeunload', () => {
        if (currentStep === 1) {
            localStorage.removeItem('clubName');
        }
    });
});