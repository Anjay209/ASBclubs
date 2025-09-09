document.addEventListener('DOMContentLoaded', function() {
    const firebaseConfig = {
        apiKey: "AIzaSyBoQcPq9ftoTfE8Wm7TOOcol0c_XPBXRpE",
        authDomain: "asbclubs-40fe1.firebaseapp.com",
        projectId: "asbclubs-40fe1",
        storageBucket: "asbclubs-40fe1.appspot.com",
        messagingSenderId: "534365161502",
        appId: "1:534365161502:web:940ee13b2b3f105b65860f",
        measurementId: "G-WCSQQDHHR1"
    };

    // Initialize Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
        }
        
        // Initialize services
         db = firebase.firestore();
        const auth = firebase.auth();
        window.db = db;
        
        // Configure Firestore settings
        db.settings({
            merge: true
        });
        
        // Enable Firestore persistence
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => console.log("Firestore persistence enabled"))
            .catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn("Persistence enabled in another tab");
                } else if (err.code === 'unimplemented') {
                    console.warn("Browser doesn't support persistence");
                }
            });

        // Auth state listener to get current user
        auth.onAuthStateChanged(function(user) {
            if (user) {
                console.log("User authenticated:", user.uid);
                window.currentUser = user;
                 currentUser = user; 
                loadUserClubs(user.uid, db);
            } else {
                console.log("User not authenticated");
                const clubSelector = document.getElementById('clubSelector');
                if (clubSelector) {
                    clubSelector.innerHTML = '<option value="">Please log in</option>';
                }
                // Redirect to login page if needed
                // window.location.href = '/login.html';
            }
        });


        const thinSidebarBtns = document.querySelectorAll('.thin-sidebar-btn');

// Thin sidebar buttons functionality
thinSidebarBtns.forEach((btn, index) => {
    btn.addEventListener('click', function() {
        if (index === 0) { // Sparkle button
            console.log('Sparkle button clicked');
            this.style.transform = 'scale(0.9) rotate(18deg)';
            setTimeout(() => {
                this.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        } else { // Plus button
            console.log('Plus button clicked');
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        }
    });
});




// Function to load user's clubs in mini view
function loadUserClubsMini(userId) {
    const container = document.getElementById('userClubsMini');
    
    // Show loading spinner
    container.innerHTML = `
        <div class="loading-clubs-mini">
            <div class="spinner"></div>
        </div>
    `;
    
    // Get user document
    db.collection('users').doc(userId).get()
        .then(userDoc => {
            const userData = userDoc.data();
            const clubIds = userData.clubs || [];
            
            if (clubIds.length === 0) {
                container.innerHTML = '';
                return;
            }
            
            // Get all clubs the user is in
            db.collection('clubs')
                .where(firebase.firestore.FieldPath.documentId(), 'in', clubIds.slice(0, 10)) // Limit to 10 clubs
                .get()
                .then(querySnapshot => {
                    container.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const club = doc.data();
                        const clubElement = createClubMiniElement(club);
                        container.appendChild(clubElement);
                    });
                });
        })
        .catch(error => {
            console.error("Error loading clubs:", error);
            container.innerHTML = '';
        });
}

// Helper function to create mini club element
// Update your createClubMiniElement function to include proper styling
function createClubMiniElement(club) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initial = club.name.charAt(0).toUpperCase();
    
    const clubElement = document.createElement('div');
    clubElement.className = 'user-club-mini';
    
    // Add inline styles for the club buttons
    clubElement.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: ${randomColor};
        border-radius: 8px;
        color: white;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin: 5px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    
    clubElement.title = club.name;
    clubElement.textContent = initial;
    
    // Add hover effects
    clubElement.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });
    
    clubElement.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });
    
     clubElement.onclick = () => {
    window.location.href = `clubs.html?openClub=${club.clubId || club.id}`;
};
    
    return clubElement;
}

// Call this when user is authenticated
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserClubsMini(user.uid);
    } else {
        // User not logged in - you might want to redirect to login
        console.log("User not authenticated");
    }
});

    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
});

let currentClubId = null;

// Add this at the top of your budget control center code
let currentUser = null;

let db = null;
let auth = null;

window.db = null;
window.currentUser = null; 
window.currentClubId = null;


// Function to load user's clubs
async function loadUserClubs(userId, db) {
    const clubSelector = document.getElementById('clubSelector');
    
    try {
        const snapshot = await db.collection('clubs')
            .where('creatorId', '==', userId)
            .orderBy('createdAt', 'asc')
            .get();
        
        clubSelector.innerHTML = '';
        
        if (snapshot.empty) {
            clubSelector.innerHTML = '<option value="">No clubs found</option>';
            return;
        }
        
        let firstClub = true;
        let firstClubId = null;
        
        snapshot.forEach(doc => {
            const club = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = club.name || club.additionalInfo || 'Unnamed Club';
            
            if (firstClub) {
                option.selected = true;
                firstClubId = doc.id;
                firstClub = false;
            }
            
            clubSelector.appendChild(option);
        });
        
        // Set currentClubId and load data for first club
        if (firstClubId) {
            currentClubId = firstClubId; // ADD THIS LINE
            window.currentClubId = firstClubId;
            updateDashboardData(firstClubId, db);
            loadChecklistItems(); // ADD THIS LINE
        }
        
        clubSelector.addEventListener('change', handleClubChange);
        
    } catch (error) {
        console.error('Error loading clubs:', error);
        clubSelector.innerHTML = '<option value="">Error loading clubs</option>';
    }
}
async function loadMemberFeedback(clubId) {
    if (!clubId || !db) {
        console.log('❌ Missing clubId or db:', { clubId, db });
        return;
    }
    
    try {
        console.log('🔍 Loading feedback for club:', clubId);
        
        // First, let's check if surveys have clubId at all
        const allSurveysSnapshot = await db.collection('surveys').get();
        console.log('📊 Total surveys in collection:', allSurveysSnapshot.size);
        
        allSurveysSnapshot.forEach(doc => {
            const data = doc.data();
            console.log('Survey:', doc.id, 'has clubId:', data.clubId, 'eventId:', data.eventId);
        });
        
        // Try to get surveys for this club
        const surveysSnapshot = await db.collection('surveys')
            .where('clubId', '==', clubId)
            .get();
        
        console.log('📋 Surveys found for club', clubId, ':', surveysSnapshot.size);
        
        if (surveysSnapshot.empty) {
            console.log('⚠️ No surveys found for this club. Trying alternative method...');
            
            // Alternative: Get surveys by eventId and check if event belongs to this club
            await loadFeedbackByEvents(clubId);
            return;
        }
        
        // Process surveys normally if found
        processSurveyData(surveysSnapshot);
        
    } catch (error) {
        console.error('❌ Error loading member feedback:', error);
        displayErrorFeedback();
    }
}

// Alternative method: Get feedback through events
async function loadFeedbackByEvents(clubId) {
    try {
        console.log('🔄 Loading feedback via events for club:', clubId);
        
        // Get all events for this club
        const eventsSnapshot = await db.collection('events')
            .where('clubId', '==', clubId)
            .get();
        
        console.log('📅 Events found for club:', eventsSnapshot.size);
        
        if (eventsSnapshot.empty) {
            displayNoFeedback();
            return;
        }
        
        // Get event IDs
        const eventIds = [];
        eventsSnapshot.forEach(doc => {
            eventIds.push(doc.id);
            console.log('Event:', doc.data().title, 'ID:', doc.id);
        });
        
        // Get surveys for these events
        const allSurveys = [];
        for (const eventId of eventIds) {
            const surveySnapshot = await db.collection('surveys')
                .where('eventId', '==', eventId)
                .get();
            
            surveySnapshot.forEach(doc => {
                allSurveys.push({ id: doc.id, data: doc.data() });
                console.log('Found survey for event:', eventId, 'Survey ID:', doc.id);
            });
        }
        
        console.log('📋 Total surveys found via events:', allSurveys.length);
        
        if (allSurveys.length === 0) {
            displayNoFeedback();
            return;
        }
        
        // Process the survey data
        processSurveyDataFromArray(allSurveys);
        
    } catch (error) {
        console.error('❌ Error in alternative feedback loading:', error);
        displayErrorFeedback();
    }
}

function processSurveyDataFromArray(surveys) {
    let allResponses = [];
    let totalRatings = { enjoyment: 0, engagement: 0, likelyToReturn: 0, organization: 0 };
    let ratingCounts = { enjoyment: 0, engagement: 0, likelyToReturn: 0, organization: 0 };
    
    surveys.forEach(survey => {
        const surveyData = survey.data;
        console.log('Processing survey:', survey.id, 'Responses:', surveyData.responses ? Object.keys(surveyData.responses).length : 0);
        
        if (surveyData.responses) {
            Object.values(surveyData.responses).forEach(response => {
                // Collect comments
                if (response.comments && response.comments.trim()) {
                    allResponses.push({
                        comment: response.comments,
                        ratings: response.ratings,
                        submittedAt: response.submittedAt,
                        eventTitle: surveyData.eventTitle || 'Unknown Event'
                    });
                }
                
                // Aggregate ratings
                if (response.ratings) {
                    Object.keys(totalRatings).forEach(rating => {
                        if (response.ratings[rating]) {
                            totalRatings[rating] += response.ratings[rating];
                            ratingCounts[rating]++;
                        }
                    });
                }
            });
        }
    });
    
    console.log('📊 Processed data:', {
        totalResponses: allResponses.length,
        ratingCounts,
        totalRatings
    });
    
    // Calculate averages
    const averageRatings = {};
    let overallAverage = 0;
    let validRatings = 0;
    
    Object.keys(totalRatings).forEach(rating => {
        if (ratingCounts[rating] > 0) {
            averageRatings[rating] = totalRatings[rating] / ratingCounts[rating];
            overallAverage += averageRatings[rating];
            validRatings++;
        }
    });
    
    if (validRatings > 0) {
        overallAverage = overallAverage / validRatings;
    }
    
    console.log('📈 Final calculations:', {
        overallAverage,
        averageRatings,
        responseCount: allResponses.length
    });
    
    // Update display
    updateFeedbackDisplay(allResponses, overallAverage, averageRatings);
}

function processSurveyData(surveysSnapshot) {
    const surveys = [];
    surveysSnapshot.forEach(doc => {
        surveys.push({ id: doc.id, data: doc.data() });
    });
    processSurveyDataFromArray(surveys);
}

function updateFeedbackDisplay(responses, overallAverage, averageRatings) {
    console.log('🎨 Updating display with:', { responses: responses.length, overallAverage });
    
    // Update overall sentiment
    const sentimentContainer = document.querySelector('.sentiment-score');
    const sentimentEmoji = document.querySelector('.sentiment-emoji');
    const sentimentValue = document.querySelector('.sentiment-value');
    
    console.log('🎯 Found elements:', { sentimentContainer: !!sentimentContainer, sentimentEmoji: !!sentimentEmoji, sentimentValue: !!sentimentValue });
    
    if (sentimentContainer && sentimentEmoji && sentimentValue) {
        let sentiment, emoji, percentage;
        
        if (overallAverage >= 7) {
            sentiment = 'positive';
            emoji = '😊';
            percentage = Math.round((overallAverage / 10) * 100);
        } else if (overallAverage >= 5) {
            sentiment = 'neutral';
            emoji = '😐';
            percentage = Math.round((overallAverage / 10) * 100);
        } else if (overallAverage > 0) {
            sentiment = 'negative';
            emoji = '😞';
            percentage = Math.round((overallAverage / 10) * 100);
        } else {
            sentiment = 'neutral';
            emoji = '📊';
            percentage = 0;
        }
        
        console.log('✅ Updating sentiment to:', { sentiment, emoji, percentage });
        
        sentimentContainer.className = `sentiment-score ${sentiment}`;
        sentimentEmoji.textContent = emoji;
        sentimentValue.textContent = overallAverage > 0 ? 
            `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} (${percentage}%)` : 
            'No Ratings Yet';
    }
    
    // Update recent feedback
    const recentFeedbackContainer = document.querySelector('.recent-feedback');
    if (recentFeedbackContainer) {
        console.log('🔄 Updating recent feedback container');
        
        // Clear existing feedback items (keep the h4)
        const existingItems = recentFeedbackContainer.querySelectorAll('.feedback-item');
        existingItems.forEach(item => item.remove());
        
        if (responses.length === 0) {
            const noFeedback = document.createElement('div');
            noFeedback.className = 'feedback-item';
            noFeedback.innerHTML = '<span class="feedback-text">No feedback comments yet</span>';
            recentFeedbackContainer.appendChild(noFeedback);
            console.log('📝 Added "no feedback" message');
            return;
        }
        
        // Sort and display comments
        responses.sort((a, b) => {
            if (a.submittedAt && b.submittedAt) {
                return b.submittedAt.toDate() - a.submittedAt.toDate();
            }
            return 0;
        });
        
        const recentComments = responses.slice(0, 3);
        console.log('💬 Adding', recentComments.length, 'comments');
        
        recentComments.forEach((response, index) => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';
            
            let individualAverage = 0;
            let ratingCount = 0;
            
            if (response.ratings) {
                Object.values(response.ratings).forEach(rating => {
                    if (typeof rating === 'number') {
                        individualAverage += rating;
                        ratingCount++;
                    }
                });
                
                if (ratingCount > 0) {
                    individualAverage = individualAverage / ratingCount;
                }
            }
            
            let sentimentClass = 'neutral';
            if (individualAverage >= 7) sentimentClass = 'positive';
            else if (individualAverage < 5 && individualAverage > 0) sentimentClass = 'negative';
            
            feedbackItem.innerHTML = `
                <span class="feedback-text">"${response.comment}"</span>
                <span class="feedback-sentiment ${sentimentClass}">${sentimentClass.charAt(0).toUpperCase() + sentimentClass.slice(1)}</span>
            `;
            
            recentFeedbackContainer.appendChild(feedbackItem);
            console.log(`📝 Added comment ${index + 1}:`, response.comment.substring(0, 30) + '...');
        });
    }
}

// Simple health score calculation - only returns the score percentage
function calculateClubHealthScore(surveys) {
    // Define weightings for different aspects (total = 100%)
    const WEIGHTINGS = {
        satisfaction: 0.35,      // 35% - How satisfied members are (highest weight)
        engagement: 0.25,        // 25% - Member engagement levels
        likelyToReturn: 0.25,    // 25% - Retention indicator (high weight)
        organization: 0.15       // 15% - Event organization quality
    };
    
    if (!surveys || surveys.length === 0) {
        return 0;
    }
    
    console.log('🧮 Calculating health score from', surveys.length, 'surveys');
    
    // Initialize tracking variables
    let ratingTotals = {
        enjoyment: 0,      // Maps to satisfaction
        engagement: 0,
        likelyToReturn: 0,
        organization: 0
    };
    let ratingCounts = {
        enjoyment: 0,
        engagement: 0,
        likelyToReturn: 0,
        organization: 0
    };
    
    // Process all survey responses
    surveys.forEach(survey => {
        const surveyData = survey.data;
        
        if (surveyData.responses) {
            Object.values(surveyData.responses).forEach(response => {
                if (response.ratings) {
                    Object.keys(ratingTotals).forEach(rating => {
                        if (response.ratings[rating] && typeof response.ratings[rating] === 'number') {
                            ratingTotals[rating] += response.ratings[rating];
                            ratingCounts[rating]++;
                        }
                    });
                }
            });
        }
    });
    
    // Calculate component scores (0-100 scale)
    const componentScores = {};
    
    componentScores.satisfaction = ratingCounts.enjoyment > 0 
        ? (ratingTotals.enjoyment / ratingCounts.enjoyment) * 10 
        : 0;
    
    componentScores.engagement = ratingCounts.engagement > 0 
        ? (ratingTotals.engagement / ratingCounts.engagement) * 10 
        : 0;
    
    componentScores.likelyToReturn = ratingCounts.likelyToReturn > 0 
        ? (ratingTotals.likelyToReturn / ratingCounts.likelyToReturn) * 10 
        : 0;
    
    componentScores.organization = ratingCounts.organization > 0 
        ? (ratingTotals.organization / ratingCounts.organization) * 10 
        : 0;
    
    // Calculate weighted health score
    let healthScore = 0;
    let validComponents = 0;
    
    Object.keys(WEIGHTINGS).forEach(component => {
        if (componentScores[component] > 0) {
            healthScore += componentScores[component] * WEIGHTINGS[component];
            validComponents++;
        }
    });
    
    // Adjust for missing components (redistribute weights)
    if (validComponents > 0 && validComponents < Object.keys(WEIGHTINGS).length) {
        const totalValidWeight = Object.keys(WEIGHTINGS)
            .filter(comp => componentScores[comp] > 0)
            .reduce((sum, comp) => sum + WEIGHTINGS[comp], 0);
        
        if (totalValidWeight > 0) {
            healthScore = healthScore / totalValidWeight;
        }
    }
    
    // Round to nearest integer, ensure 0-100 range
    healthScore = Math.round(Math.max(0, Math.min(100, healthScore)));
    
    console.log('🏥 Health Score:', healthScore + '%');
    
    return healthScore;
}

// Function to update only the health score number in the UI
function updateHealthScoreDisplay(healthScore) {
    // Target specifically the Health Score stat card (2nd one)
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    const healthScoreElement = statCards[1]; // Index 1 = second card = Health Score
    
    if (healthScoreElement) {
        healthScoreElement.textContent = `${healthScore}%`;
        
        // Optional: Change color based on health score
        let color;
        if (healthScore >= 85) {
            color = '#10b981'; // Green - Excellent
        } else if (healthScore >= 70) {
            color = '#3b82f6'; // Blue - Good
        } else if (healthScore >= 55) {
            color = '#f59e0b'; // Orange - Fair
        } else {
            color = '#ef4444'; // Red - Poor
        }
        
        healthScoreElement.style.color = color;
        console.log('💚 Health score updated to:', healthScore + '%');
    }
}

// Add this to your existing updateDashboardData function
async function updateDashboardData(clubId, db) {
    if (!clubId) return;
    
    console.log('🏢 Updating dashboard for club:', clubId);
    await updateEventPerformanceCard(clubId);
    
    try {
        const clubDoc = await db.collection('clubs').doc(clubId).get();
        
        if (clubDoc.exists) {
            const clubData = clubDoc.data();
            
            // Keep Active Members update as before - target first stat card
            const memberCountElement = document.querySelectorAll('.stat-card .stat-number')[0];
            if (memberCountElement && clubData.memberCount) {
                memberCountElement.textContent = clubData.memberCount;
            }
            
            // Load member feedback for this club
            console.log('🔄 Loading member feedback...');
            await loadMemberFeedback(clubId);
            
            // Load analytics for this club
            console.log('📊 Loading analytics...');
            await updateAnalyticsGrid(clubId);
            
            // Calculate and update health score
            console.log('💚 Calculating health score...');
            await updateHealthScore(clubId);
            
            // NEW: Calculate and update upcoming events count
            console.log('📅 Calculating upcoming events...');
            await updateUpcomingEventsCount(clubId);
            
            console.log('✅ Dashboard updated for club:', clubData.name);
        }
    } catch (error) {
        console.error('❌ Error updating dashboard data:', error);
        displayErrorFeedback();
        displayErrorAnalytics();
        // Set upcoming events to 0 on error
        updateUpcomingEventsDisplay(0);
    }
}

// Alternative query method if date filtering doesn't work as expected
async function updateUpcomingEventsCountAlternative(clubId) {
    if (!clubId || !db) return;
    
    try {
        console.log('📅 Loading upcoming events (alternative method) for club:', clubId);
        
        // Get all active events for this club
        const eventsSnapshot = await db.collection('events')
            .where('clubId', '==', clubId)
            .where('status', '==', 'active')
            .get();
        
        const now = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(now.getDate() + 7);
        
        let upcomingCount = 0;
        
        eventsSnapshot.forEach(doc => {
            const eventData = doc.data();
            
            // Try multiple date fields and formats
            let eventDate = null;
            
            if (eventData.formattedDate) {
                eventDate = new Date(eventData.formattedDate);
            } else if (eventData.date) {
                eventDate = new Date(eventData.date);
            } else if (eventData.createdAt && eventData.createdAt.toDate) {
                eventDate = eventData.createdAt.toDate();
            }
            
            if (eventDate && !isNaN(eventDate.getTime())) {
                // Check if event is between now and one week from now
                if (eventDate >= now && eventDate <= oneWeekFromNow) {
                    upcomingCount++;
                    console.log('✅ Upcoming event found:', eventData.title, 'on', eventDate.toDateString());
                }
            }
        });
        
        console.log('📊 Total upcoming events (alternative):', upcomingCount);
        updateUpcomingEventsDisplay(upcomingCount);
        
    } catch (error) {
        console.error('❌ Error in alternative upcoming events calculation:', error);
        updateUpcomingEventsDisplay(0);
    }
}


// New function to update health score
async function updateHealthScore(clubId) {
    if (!clubId || !db) return;
    
    try {
        // Get all surveys for this club (same logic as analytics)
        let allSurveys = [];
        
        // Try direct clubId query first
        const surveysSnapshot = await db.collection('surveys')
            .where('clubId', '==', clubId)
            .get();
        
        if (!surveysSnapshot.empty) {
            surveysSnapshot.forEach(doc => {
                allSurveys.push({ id: doc.id, data: doc.data() });
            });
        } else {
            // Fallback: Get surveys through events
            const eventsSnapshot = await db.collection('events')
                .where('clubId', '==', clubId)
                .get();
            
            if (!eventsSnapshot.empty) {
                for (const eventDoc of eventsSnapshot.docs) {
                    const eventSurveys = await db.collection('surveys')
                        .where('eventId', '==', eventDoc.id)
                        .get();
                    
                    eventSurveys.forEach(doc => {
                        allSurveys.push({ id: doc.id, data: doc.data() });
                    });
                }
            }
        }
        
        // Calculate health score
        const healthScore = calculateClubHealthScore(allSurveys);
        
        // Update display
        updateHealthScoreDisplay(healthScore);
        
    } catch (error) {
        console.error('❌ Error calculating health score:', error);
        // Show 0% on error
        updateHealthScoreDisplay(0);
    }
}


function displayNoFeedback() {
    const sentimentValue = document.querySelector('.sentiment-value');
    const sentimentEmoji = document.querySelector('.sentiment-emoji');
    const sentimentContainer = document.querySelector('.sentiment-score');
    const recentFeedbackContainer = document.querySelector('.recent-feedback');
    
    if (sentimentContainer && sentimentEmoji && sentimentValue) {
        sentimentContainer.className = 'sentiment-score neutral';
        sentimentEmoji.textContent = '📊';
        sentimentValue.textContent = 'No Data Yet';
    }
    
    if (recentFeedbackContainer) {
        const existingItems = recentFeedbackContainer.querySelectorAll('.feedback-item');
        existingItems.forEach(item => item.remove());
        
        const noFeedback = document.createElement('div');
        noFeedback.className = 'feedback-item';
        noFeedback.innerHTML = '<span class="feedback-text">No survey responses yet for this club</span>';
        recentFeedbackContainer.appendChild(noFeedback);
    }
}

function displayErrorFeedback() {
    const sentimentValue = document.querySelector('.sentiment-value');
    const sentimentEmoji = document.querySelector('.sentiment-emoji');
    const sentimentContainer = document.querySelector('.sentiment-score');
    
    if (sentimentContainer && sentimentEmoji && sentimentValue) {
        sentimentContainer.className = 'sentiment-score neutral';
        sentimentEmoji.textContent = '⚠️';
        sentimentValue.textContent = 'Error Loading Data';
    }
}

// Update your existing updateDashboardData function to include feedback loading
async function updateUpcomingEventsCount(clubId) {
    if (!clubId || !db) {
        updateUpcomingEventsDisplay(0);
        return;
    }
    
    try {
        console.log('📅 Loading upcoming events for club:', clubId);
        
        const eventsSnapshot = await db.collection('events')
            .where('clubId', '==', clubId)
            .get();
        
        const now = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(now.getDate() + 7);
        
        let upcomingCount = 0;
        
        eventsSnapshot.forEach(doc => {
            const eventData = doc.data();
            
            // Skip inactive events
            if (eventData.status !== 'active') return;
            
            // Try to get event date - check multiple fields
            let eventDate = null;
            
            if (eventData.date) {
                eventDate = new Date(eventData.date);
            } else if (eventData.formattedDate) {
                eventDate = new Date(eventData.formattedDate);
            }
            
            // Check if date is valid and upcoming
            if (eventDate && !isNaN(eventDate.getTime())) {
                if (eventDate >= now && eventDate <= oneWeekFromNow) {
                    upcomingCount++;
                    console.log('✅ Found upcoming event:', eventData.title, eventDate);
                }
            }
        });
        
        console.log('📊 Total upcoming events:', upcomingCount);
        updateUpcomingEventsDisplay(upcomingCount);
        
    } catch (error) {
        console.error('❌ Error:', error);
        updateUpcomingEventsDisplay(0);
    }
}

// Helper function to format date for comparison
function formatDateForComparison(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to check if event is in the next week
function isEventInNextWeek(eventDate, todayStr, nextWeekStr) {
    // Handle different date formats that might be in Firebase
    let eventDateStr;
    
    if (eventDate.includes('-')) {
        // Already in YYYY-MM-DD format
        eventDateStr = eventDate;
    } else if (eventDate.includes('/')) {
        // Convert MM/DD/YYYY to YYYY-MM-DD
        const parts = eventDate.split('/');
        if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            eventDateStr = `${year}-${month}-${day}`;
        } else {
            return false;
        }
    } else {
        // Try to parse other formats
        const parsedDate = new Date(eventDate);
        if (!isNaN(parsedDate.getTime())) {
            eventDateStr = formatDateForComparison(parsedDate);
        } else {
            return false;
        }
    }
    
    // Check if event date is between today and next week
    return eventDateStr >= todayStr && eventDateStr <= nextWeekStr;
}



// Function to update the upcoming events display
function updateUpcomingEventsDisplay(count) {
    // Target the third stat card (Upcoming Events)
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    const upcomingEventsElement = statCards[2]; // Index 2 = third card = Upcoming Events
    
    if (upcomingEventsElement) {
        upcomingEventsElement.textContent = count.toString();
        
        // Optional: Change color based on number of events
        let color;
        if (count === 0) {
            color = '#9ca3af'; // Gray - No events
        } else if (count <= 2) {
            color = '#3b82f6'; // Blue - Few events
        } else if (count <= 5) {
            color = '#10b981'; // Green - Good number of events
        } else {
            color = '#f59e0b'; // Orange - Many events
        }
        
        upcomingEventsElement.style.color = color;
        console.log('📅 Upcoming events count updated to:', count);
    } else {
        console.log('❌ Could not find upcoming events element');
    }
}

// Function to handle club selection change
function handleClubChange(event) {
    const selectedClubId = event.target.value;
    const selectedClubName = event.target.options[event.target.selectedIndex].text;
    
    console.log('Selected club:', selectedClubName, 'ID:', selectedClubId);
    
    currentClubId = selectedClubId;
    window.currentClubId = selectedClubId;
    
window.db = firebase.firestore();
db = window.db;
    updateDashboardData(selectedClubId, db);
    loadChecklistItems();
    
    // Load feedback for the new club
    loadMemberFeedback(selectedClubId);
}

async function updateAnalyticsGrid(clubId) {
    if (!clubId || !db) return;
    
    try {
        console.log('📊 Loading analytics for club:', clubId);
        
        // Get all surveys for this club (using the same logic as feedback)
        let allSurveys = [];
        
        // Try direct clubId query first
        const surveysSnapshot = await db.collection('surveys')
            .where('clubId', '==', clubId)
            .get();
        
        if (!surveysSnapshot.empty) {
            surveysSnapshot.forEach(doc => {
                allSurveys.push({ id: doc.id, data: doc.data() });
            });
        } else {
            // Fallback: Get surveys through events
            const eventsSnapshot = await db.collection('events')
                .where('clubId', '==', clubId)
                .get();
            
            if (!eventsSnapshot.empty) {
                for (const eventDoc of eventsSnapshot.docs) {
                    const eventSurveys = await db.collection('surveys')
                        .where('eventId', '==', eventDoc.id)
                        .get();
                    
                    eventSurveys.forEach(doc => {
                        allSurveys.push({ id: doc.id, data: doc.data() });
                    });
                }
            }
        }
        
        console.log('📋 Found surveys for analytics:', allSurveys.length);
        
        if (allSurveys.length === 0) {
            displayEmptyAnalytics();
            return;
        }
        
        // Process survey data for analytics
        const analytics = calculateAnalytics(allSurveys);
        updateAnalyticsDisplay(analytics);
        
    } catch (error) {
        console.error('❌ Error loading analytics:', error);
        displayErrorAnalytics();
    }
}

function calculateAnalytics(surveys) {
    let totalResponses = 0;
    let totalSurveys = surveys.length;
    let totalAttendees = 0;
    
    let ratingTotals = {
        enjoyment: 0,
        engagement: 0,
        likelyToReturn: 0,
        organization: 0
    };
    let ratingCounts = {
        enjoyment: 0,
        engagement: 0,
        likelyToReturn: 0,
        organization: 0
    };
    
    surveys.forEach(survey => {
        const surveyData = survey.data;
        
        // Count attendees
        if (surveyData.attendeeCount) {
            totalAttendees += surveyData.attendeeCount;
        } else if (surveyData.attendees && Array.isArray(surveyData.attendees)) {
            totalAttendees += surveyData.attendees.length;
        }
        
        // Process responses
        if (surveyData.responses) {
            const responseCount = Object.keys(surveyData.responses).length;
            totalResponses += responseCount;
            
            Object.values(surveyData.responses).forEach(response => {
                if (response.ratings) {
                    Object.keys(ratingTotals).forEach(rating => {
                        if (response.ratings[rating]) {
                            ratingTotals[rating] += response.ratings[rating];
                            ratingCounts[rating]++;
                        }
                    });
                }
            });
        }
    });
    
    // Calculate averages and percentages
    const averageRatings = {};
    Object.keys(ratingTotals).forEach(rating => {
        if (ratingCounts[rating] > 0) {
            averageRatings[rating] = ratingTotals[rating] / ratingCounts[rating];
        } else {
            averageRatings[rating] = 0;
        }
    });
    
    // Calculate response rate (responses vs attendees)
    const responseRate = totalAttendees > 0 ? (totalResponses / totalAttendees) * 100 : 0;
    
    // Calculate overall satisfaction (average of all ratings)
    const satisfactionRatings = Object.values(averageRatings).filter(rating => rating > 0);
    const overallSatisfaction = satisfactionRatings.length > 0 
        ? (satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length / 10) * 100 
        : 0;
    
    return {
        responseRate: Math.round(responseRate),
        overallSatisfaction: Math.round(overallSatisfaction),
        averageRatings,
        totalResponses,
        totalAttendees,
        totalSurveys
    };
}

function updateAnalyticsDisplay(analytics) {
    console.log('📈 Updating analytics display:', analytics);
    
    const metrics = document.querySelectorAll('.analytics-grid .metric');
    
    if (metrics.length >= 2) {
        // Update first metric - Response Rate
        const firstMetric = metrics[0];
        const firstLabel = firstMetric.querySelector('.metric-label');
        const firstValue = firstMetric.querySelector('.metric-value');
        const firstProgress = firstMetric.querySelector('.progress-fill');
        
        if (firstLabel && firstValue && firstProgress) {
            firstLabel.textContent = 'Response Rate';
            firstValue.textContent = `${analytics.responseRate}%`;
            firstProgress.style.width = `${Math.min(analytics.responseRate, 100)}%`;
            
            // Color coding for response rate
            firstProgress.className = 'progress-fill';
            if (analytics.responseRate >= 70) {
                firstProgress.classList.add('green-fill');
            } else if (analytics.responseRate >= 40) {
                firstProgress.classList.add('orange-fill');
            } else {
                firstProgress.classList.add('red-fill');
            }
        }
        
        // Update second metric - Overall Satisfaction
        const secondMetric = metrics[1];
        const secondLabel = secondMetric.querySelector('.metric-label');
        const secondValue = secondMetric.querySelector('.metric-value');
        const secondProgress = secondMetric.querySelector('.progress-fill');
        
        if (secondLabel && secondValue && secondProgress) {
            secondLabel.textContent = 'Overall Satisfaction';
            secondValue.textContent = `${analytics.overallSatisfaction}%`;
            secondProgress.style.width = `${Math.min(analytics.overallSatisfaction, 100)}%`;
            
            // Color coding for satisfaction
            secondProgress.className = 'progress-fill';
            if (analytics.overallSatisfaction >= 70) {
                secondProgress.classList.add('green-fill');
            } else if (analytics.overallSatisfaction >= 50) {
                secondProgress.classList.add('orange-fill');
            } else {
                secondProgress.classList.add('red-fill');
            }
        }
    }
    
    // Generate and display dynamic advice
    const advice = generateAnalyticsAdvice(analytics.responseRate, analytics.overallSatisfaction);
    displayAnalyticsAdvice(advice);

  updateMemberAnalyticsSuggestions(analytics.responseRate, analytics.overallSatisfaction);

    
    console.log('✅ Analytics display updated');
}

function updateMemberAnalyticsSuggestions(responseRate, satisfaction) {
    const suggestions = generateSuggestionsList(responseRate, satisfaction);
    addSuggestionsToAnalytics(suggestions);
}



// Function to update the Event Performance card (the one with Last Event Attendance, Feedback Score, Financial Impact)
async function updateEventPerformanceCard(clubId) {
    if (!clubId || !db) {
        console.log('❌ Missing clubId or db for event performance');
        displayEventPerformanceError();
        return;
    }
    
    try {
        console.log('📊 Loading event performance for club:', clubId);
        
        // Get the most recent event for this club
        const eventsSnapshot = await db.collection('events')
            .where('clubId', '==', clubId)
            .orderBy('createdAt', 'desc')
            .limit(5) // Get last 5 events for trend calculation
            .get();
        
        if (eventsSnapshot.empty) {
            displayNoEventPerformanceData();
            return;
        }
        
        const events = [];
        eventsSnapshot.forEach(doc => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        const lastEvent = events[0]; // Most recent event
        
        // Get survey data for the most recent event
        const surveySnapshot = await db.collection('surveys')
            .where('eventId', '==', lastEvent.id)
            .get();
        
        // Calculate performance metrics
const performanceData = await calculateLastEventPerformance(lastEvent, surveySnapshot, events);
        
        // Update the UI
        updateEventPerformanceDisplay(performanceData);
        
    } catch (error) {
        console.error('❌ Error loading event performance:', error);
        displayEventPerformanceError();
    }
}

async function calculateLastEventPerformance(lastEvent, surveySnapshot, allEvents) {
    const performance = {
        participation: {
            rsvped: lastEvent.rsvpCount || lastEvent.attendeeCount || 0,
            totalMembers: 0 // Will be filled from club data
        },
        overallSatisfaction: 0,
        financialImpact: 0,
        attendanceTrend: 0,
        eventTitle: lastEvent.title || 'Last Event',
        eventDate: lastEvent.date || lastEvent.formattedDate,
        suggestions: []
    };
    
    // Get club member count
    // Get club member count
// Get club member count
try {
    console.log('Looking for club with ID:', lastEvent.clubId);
    console.log('Last event data:', lastEvent);
    
    const clubRef = db.collection('clubs').doc(lastEvent.clubId);
    const clubDoc = await clubRef.get();
    
    console.log('Club doc exists:', clubDoc.exists);
    
    if (clubDoc.exists) {
        const clubData = clubDoc.data();
        console.log('Club data:', clubData);
        const members = clubData.members || [];
        performance.participation.totalMembers = members.length;
        console.log('Member count:', members.length);
    } else {
        console.log('Club document not found');
        performance.participation.totalMembers = 0;
    }
} catch (error) {
    console.log('Error fetching club:', error);
    performance.participation.totalMembers = 0;
}
    
    // Calculate participation rate
    const participationRate = performance.participation.totalMembers > 0 
        ? (performance.participation.rsvped / performance.participation.totalMembers) * 100 
        : 0;
    
    // Calculate overall satisfaction from surveys (looking specifically for satisfaction ratings)
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    let totalResponses = 0;
    
    surveySnapshot.forEach(doc => {
        const surveyData = doc.data();
        
        if (surveyData.responses) {
            totalResponses += Object.keys(surveyData.responses).length;
            
            Object.values(surveyData.responses).forEach(response => {
                if (response.ratings && response.ratings.enjoyment) {
                    // Use enjoyment rating as overall satisfaction
                    totalSatisfaction += response.ratings.enjoyment;
                    satisfactionCount++;
                }
            });
        }
    });
    
    if (satisfactionCount > 0) {
        performance.overallSatisfaction = Math.round((totalSatisfaction / satisfactionCount) * 10); // Convert to percentage
    }
    
    // Calculate financial impact (simplified - you can enhance this based on your budget data)
    const eventCost = lastEvent.budget || lastEvent.cost || 0;
    const revenuePerAttendee = lastEvent.ticketPrice || lastEvent.feePerMember || 0;
    const totalRevenue = performance.participation.rsvped * revenuePerAttendee;
    performance.financialImpact = totalRevenue - eventCost;
    
    // Calculate attendance trend (compare to previous events)
    if (allEvents.length >= 2) {
        const currentParticipation = performance.participation.rsvped;
        const previousParticipation = allEvents.slice(1).map(e => e.rsvpCount || e.attendeeCount || 0);
        const avgPrevious = previousParticipation.reduce((sum, a) => sum + a, 0) / previousParticipation.length;
        
        if (avgPrevious > 0) {
            performance.attendanceTrend = ((currentParticipation - avgPrevious) / avgPrevious) * 100;
        }
    }
    
    // Generate tailored suggestions for the most recent event
    performance.suggestions = generateLastEventSuggestions(performance, totalResponses, participationRate);
    
    return performance;
}

function generateLastEventSuggestions(performance, responseCount, participationRate) {
    const suggestions = [];
    const satisfactionScore = performance.overallSatisfaction;
    const responseRate = performance.participation.rsvped > 0 ? (responseCount / performance.participation.rsvped) * 100 : 0;
    
    // Participation-based suggestions
    if (participationRate < 30) {
        suggestions.push("Low member participation - review event appeal and timing");
        suggestions.push("Survey non-participants about barriers to attendance");
    } else if (participationRate > 80) {
        suggestions.push("Excellent member engagement - consider hosting more frequent events");
        suggestions.push("Document successful promotion strategies for future use");
    } else if (participationRate < 60) {
        suggestions.push("Moderate participation - experiment with different event formats");
    }
    
    // Satisfaction-based suggestions
    if (satisfactionScore < 50) {
        suggestions.push("Address content quality concerns immediately");
        suggestions.push("Consider changing event facilitator or format");
    } else if (satisfactionScore < 70) {
        suggestions.push("Polish event execution - good foundation but needs improvement");
        suggestions.push("Add more engaging activities or adjust event length");
    } else if (satisfactionScore >= 85) {
        suggestions.push("Replicate this successful event format for future events");
        suggestions.push("Share success strategies with other event organizers");
    }
    
    // Response rate suggestions
    if (responseRate < 30) {
        suggestions.push("Simplify feedback collection - low survey response rate");
    }
    
    // Financial impact suggestions
    if (performance.financialImpact < 0) {
        suggestions.push("Review event budget allocation - operating at a loss");
    } else if (performance.financialImpact > 200) {
        suggestions.push("Scale successful event model - strong financial performance");
    }
    
    // Trend-based suggestions
    if (performance.attendanceTrend < -20) {
        suggestions.push("Address declining attendance trend immediately");
    } else if (performance.attendanceTrend > 20) {
        suggestions.push("Maintain momentum - attendance trending positively");
    }
    
    // Default suggestions if no specific issues
    if (suggestions.length === 0) {
        suggestions.push("Continue current approach - steady performance");
        suggestions.push("Experiment with one small improvement next event");
    }
    
    // Return max 2 most relevant suggestions
    return suggestions.slice(0, 2);
}

function updateEventPerformanceDisplay(performance) {
    console.log('📊 Updating event performance display:', performance);
    
    // Update Last Event Participation (RSVPs vs Total Members)
    const attendanceElements = document.querySelectorAll('.event-metric');
    if (attendanceElements.length > 0) {
        const participationValue = attendanceElements[0].querySelector('.event-value');
        if (participationValue) {
            participationValue.textContent = `${performance.participation.rsvped} / ${performance.participation.totalMembers}`;
        }
        
        // Update the label too
        const participationLabel = attendanceElements[0].querySelector('.event-label');
        if (participationLabel) {
            participationLabel.textContent = 'Member Participation';
        }
    }
    
    // Update Overall Satisfaction
    if (attendanceElements.length > 1) {
        const satisfactionValue = attendanceElements[1].querySelector('.event-value');
        
        if (performance.overallSatisfaction > 0) {
            if (satisfactionValue) {
                satisfactionValue.textContent = `${performance.overallSatisfaction}%`;
            }
        } else {
            if (satisfactionValue) satisfactionValue.textContent = 'No feedback';
        }
        
        // Update the label
        const satisfactionLabel = attendanceElements[1].querySelector('.event-label');
        if (satisfactionLabel) {
            satisfactionLabel.textContent = 'Overall Satisfaction';
        }
        
        // Remove stars element if it exists
        const starsElement = attendanceElements[1].querySelector('.stars');
        if (starsElement) {
            starsElement.style.display = 'none';
        }
    }
    
    // Update Financial Impact
    if (attendanceElements.length > 2) {
        const financialValue = attendanceElements[2].querySelector('.event-value');
        if (financialValue) {
            const impact = performance.financialImpact;
            const sign = impact >= 0 ? '+' : '';
            const color = impact >= 0 ? '#10b981' : '#ef4444';
            financialValue.textContent = `${sign}$${Math.abs(impact)}`;
            financialValue.style.color = color;
        }
    }
    
    // Update performance trend indicator
    const performanceIndicator = document.querySelector('.performance-indicator');
    if (performanceIndicator) {
        const trend = performance.attendanceTrend;
        
        if (trend > 10) {
            performanceIndicator.className = 'performance-indicator green';
            performanceIndicator.textContent = `↗ +${Math.round(trend)}%`;
        } else if (trend < -10) {
            performanceIndicator.className = 'performance-indicator red';
            performanceIndicator.textContent = `↘ ${Math.round(trend)}%`;
        } else {
            performanceIndicator.className = 'performance-indicator neutral';
            performanceIndicator.textContent = `→ ${Math.round(Math.abs(trend))}%`;
        }
    }
    
    // Update improvement suggestions
    const suggestionsList = document.querySelector('.improvement-suggestions ul');
    if (suggestionsList && performance.suggestions.length > 0) {
        suggestionsList.innerHTML = performance.suggestions
            .map(suggestion => `<li>${suggestion}</li>`)
            .join('');
    }
    
    console.log('✅ Event performance display updated successfully');
}

function generateStarDisplay(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '★';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

function displayNoEventPerformanceData() {
    const attendanceElements = document.querySelectorAll('.event-metric');
    
    if (attendanceElements.length > 0) {
        const participationValue = attendanceElements[0].querySelector('.event-value');
        if (participationValue) participationValue.textContent = '0 / 0';
        
        const participationLabel = attendanceElements[0].querySelector('.event-label');
        if (participationLabel) participationLabel.textContent = 'Member Participation';
    }
    
    if (attendanceElements.length > 1) {
        const satisfactionValue = attendanceElements[1].querySelector('.event-value');
        if (satisfactionValue) satisfactionValue.textContent = 'No events';
        
        const satisfactionLabel = attendanceElements[1].querySelector('.event-label');
        if (satisfactionLabel) satisfactionLabel.textContent = 'Overall Satisfaction';
        
        // Hide stars if present
        const starsElement = attendanceElements[1].querySelector('.stars');
        if (starsElement) starsElement.style.display = 'none';
    }
    
    if (attendanceElements.length > 2) {
        const financialValue = attendanceElements[2].querySelector('.event-value');
        if (financialValue) financialValue.textContent = '$0';
    }
    
    const performanceIndicator = document.querySelector('.performance-indicator');
    if (performanceIndicator) {
        performanceIndicator.className = 'performance-indicator neutral';
        performanceIndicator.textContent = 'New Club';
    }
    
    const suggestionsList = document.querySelector('.improvement-suggestions ul');
    if (suggestionsList) {
        suggestionsList.innerHTML = `
            <li>Plan your first event to start collecting performance data</li>
            <li>Set clear attendance goals and budget expectations</li>
        `;
    }
}

function displayEventPerformanceError() {
    const attendanceElements = document.querySelectorAll('.event-metric .event-value');
    attendanceElements.forEach(element => {
        if (element) element.textContent = 'Error';
    });
    
    const performanceIndicator = document.querySelector('.performance-indicator');
    if (performanceIndicator) {
        performanceIndicator.className = 'performance-indicator red';
        performanceIndicator.textContent = 'Error';
    }
}

// Add this CSS for the financial impact colors
const eventPerformanceCSS = `
.performance-indicator.green {
    background-color: #10b981;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
}

.performance-indicator.red {
    background-color: #ef4444;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
}

.performance-indicator.neutral {
    background-color: #6b7280;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
}

.stars {
    color: #fbbf24;
    font-size: 18px;
}
`;

// Add CSS if not already present
if (!document.querySelector('#event-performance-css')) {
    const style = document.createElement('style');
    style.id = 'event-performance-css';
    style.innerHTML = eventPerformanceCSS;
    document.head.appendChild(style);
}

// Add this to your updateDashboardData function:
/*
console.log('📊 Loading event performance...');
await updateEventPerformanceCard(clubId);
*/

function generateSuggestionsList(responseRate, satisfaction) {
    const getLevel = (percentage) => {
        if (percentage >= 70) return 'high';
        if (percentage >= 40) return 'medium';
        return 'low';
    };
    
    const responseLevel = getLevel(responseRate);
    const satisfactionLevel = getLevel(satisfaction);
    
    if (responseLevel === 'high' && satisfactionLevel === 'high') {
        return ['Share success strategies with other clubs', 'Consider expanding event frequency', 'Document best practices for future reference'];
    } else if (responseLevel === 'high' && satisfactionLevel === 'medium') {
        return ['Survey members about specific pain points', 'Review event content and format quality', 'Ask for detailed feedback on recent events'];
    } else if (responseLevel === 'high' && satisfactionLevel === 'low') {
        return ['Hold emergency feedback session with members', 'Review and revise event planning process', 'Consider leadership or format changes'];
    } else if (responseLevel === 'medium' && satisfactionLevel === 'high') {
        return ['Simplify feedback process to increase responses', 'Send reminder messages about surveys', 'Try shorter, more frequent feedback requests'];
    } else if (responseLevel === 'medium' && satisfactionLevel === 'medium') {
        return ['A/B test different event formats', 'Increase communication frequency', 'Create member focus groups'];
    } else if (responseLevel === 'medium' && satisfactionLevel === 'low') {
        return ['Conduct comprehensive member interviews', 'Review club mission and value proposition', 'Consider leadership training or changes'];
    } else if (responseLevel === 'low' && satisfactionLevel === 'high') {
        return ['Streamline survey process (make it shorter)', 'Use quick pulse polls instead of long surveys', 'Gamify feedback with rewards or recognition'];
    } else if (responseLevel === 'low' && satisfactionLevel === 'medium') {
        return ['Switch to mobile-friendly feedback methods', 'Use in-person feedback during events', 'Create anonymous suggestion boxes'];
    } else {
        return ['Pause new events to focus on member retention', 'Conduct one-on-one conversations with key members', 'Completely reassess club direction and leadership'];
    }
}

function addSuggestionsToAnalytics(suggestions) {
    // Remove existing suggestions
    const existing = document.querySelector('.dynamic-suggestions');
    if (existing) existing.remove();
    
    // Find the analytics container - FIXED: look for the right parent
    const analyticsGrid = document.querySelector('.analytics-grid');
    if (!analyticsGrid) {
        console.log('Analytics grid not found');
        return;
    }
    
    // FIXED: Insert after the analytics grid, not inside it
    const suggestionsHTML = `
        <div class="dynamic-suggestions" style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #374151;">💡 Improvement Suggestions</h4>
            <ul style="margin: 0; padding-left: 16px; color: #4b5563; font-size: 13px; line-height: 1.4;">
                ${suggestions.map(s => `<li style="margin-bottom: 6px;">${s}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // FIXED: Insert after the analytics grid
    analyticsGrid.insertAdjacentHTML('afterend', suggestionsHTML);
    
    console.log('✅ Suggestions added successfully');
}



function generateAnalyticsAdvice(responseRate, satisfaction) {
    const advice = {
        priority: 'medium',
        title: '',
        message: '',
        actions: [],
        icon: '📊'
    };
    
    // Categorize metrics
    const responseLevel = getMetricLevel(responseRate);
    const satisfactionLevel = getMetricLevel(satisfaction);
    
    // Generate advice based on combination of metrics
    if (responseLevel === 'high' && satisfactionLevel === 'high') {
        // Both high (70%+) - Excellent performance
        advice.priority = 'success';
        advice.title = 'Outstanding Performance! 🎉';
        advice.message = 'Your club is thriving with excellent engagement and satisfaction rates.';
        advice.icon = '🌟';
        advice.actions = [
            'Share success strategies with other clubs',
            'Consider expanding event frequency',
            'Document what\'s working for future reference',
            'Explore advanced engagement features'
        ];
        
    } else if (responseLevel === 'high' && satisfactionLevel === 'medium') {
        // High response, medium satisfaction (50-69%)
        advice.priority = 'warning';
        advice.title = 'Good Engagement, Room for Improvement';
        advice.message = 'Members are responding but satisfaction could be higher.';
        advice.icon = '⚡';
        advice.actions = [
            'Survey members about specific pain points',
            'Review event content and format quality',
            'Ask for detailed feedback on recent events',
            'Consider adjusting event timing or location'
        ];
        
    } else if (responseLevel === 'high' && satisfactionLevel === 'low') {
        // High response, low satisfaction (<50%)
        advice.priority = 'danger';
        advice.title = 'Urgent: High Engagement, Low Satisfaction';
        advice.message = 'Members are responding but aren\'t satisfied. Immediate action needed.';
        advice.icon = '🚨';
        advice.actions = [
            'Hold emergency feedback session with members',
            'Review and revise event planning process',
            'Consider leadership or format changes',
            'Implement member suggestion system'
        ];
        
    } else if (responseLevel === 'medium' && satisfactionLevel === 'high') {
        // Medium response, high satisfaction
        advice.priority = 'info';
        advice.title = 'Quality Over Quantity';
        advice.message = 'Those who engage are very satisfied, but response rates could improve.';
        advice.icon = '💎';
        advice.actions = [
            'Simplify feedback process to increase responses',
            'Send reminder messages about surveys',
            'Offer incentives for survey completion',
            'Try shorter, more frequent feedback requests'
        ];
        
    } else if (responseLevel === 'medium' && satisfactionLevel === 'medium') {
        // Both medium (40-69% response, 50-69% satisfaction)
        advice.priority = 'warning';
        advice.title = 'Steady but Improvable';
        advice.message = 'Your club is performing adequately but has potential for growth.';
        advice.icon = '📈';
        advice.actions = [
            'A/B test different event formats',
            'Increase communication frequency',
            'Create member focus groups',
            'Implement regular check-ins with active members'
        ];
        
    } else if (responseLevel === 'medium' && satisfactionLevel === 'low') {
        // Medium response, low satisfaction
        advice.priority = 'danger';
        advice.title = 'Concerning Trends';
        advice.message = 'Moderate engagement with low satisfaction suggests systemic issues.';
        advice.icon = '⚠️';
        advice.actions = [
            'Conduct comprehensive member interviews',
            'Review club mission and value proposition',
            'Consider leadership training or changes',
            'Temporarily reduce event frequency to focus on quality'
        ];
        
    } else if (responseLevel === 'low' && satisfactionLevel === 'high') {
        // Low response, high satisfaction
        advice.priority = 'info';
        advice.title = 'Silent Satisfaction';
        advice.message = 'Your core members love the club, but many aren\'t providing feedback.';
        advice.icon = '🤫';
        advice.actions = [
            'Streamline survey process (make it shorter)',
            'Use quick pulse polls instead of long surveys',
            'Gamify feedback with rewards or recognition',
            'Ask satisfied members to encourage others to respond'
        ];
        
    } else if (responseLevel === 'low' && satisfactionLevel === 'medium') {
        // Low response, medium satisfaction
        advice.priority = 'warning';
        advice.title = 'Engagement Challenge';
        advice.message = 'Low response rates make it hard to gauge true member sentiment.';
        advice.icon = '📱';
        advice.actions = [
            'Switch to mobile-friendly, quick feedback methods',
            'Use in-person feedback during events',
            'Create anonymous suggestion boxes',
            'Simplify communication channels'
        ];
        
    } else {
        // Both low (<40% response, <50% satisfaction)
        advice.priority = 'danger';
        advice.title = 'Critical Attention Required';
        advice.message = 'Both engagement and satisfaction need immediate improvement.';
        advice.icon = '🆘';
        advice.actions = [
            'Pause new events to focus on member retention',
            'Conduct one-on-one conversations with key members',
            'Completely reassess club direction and leadership',
            'Consider bringing in external facilitation help'
        ];
    }
    
    // Handle edge cases for no data
    if (responseRate === 0 && satisfaction === 0) {
        advice.priority = 'info';
        advice.title = 'Getting Started';
        advice.message = 'No data yet - time to launch your first surveyed event!';
        advice.icon = '🚀';
        advice.actions = [
            'Plan your first event with built-in feedback',
            'Set up simple post-event surveys',
            'Create member onboarding process',
            'Establish regular communication rhythm'
        ];
    }
    
    return advice;
}

// Helper function to categorize metric levels
function getMetricLevel(percentage) {
    if (percentage >= 70) return 'high';
    if (percentage >= 40 && percentage < 70) return 'medium';
    return 'low';
}

// Display advice in the UI
function displayAnalyticsAdvice(advice) {
    // Find or create advice container
    let adviceContainer = document.querySelector('.analytics-advice');
    if (!adviceContainer) {
        adviceContainer = createAdviceContainer();
    }
    
    // Update advice content
    updateAdviceContent(adviceContainer, advice);
}

// Create advice container if it doesn't exist
function createAdviceContainer() {
    const analyticsSection = document.querySelector('.analytics-grid').parentNode;
    
    const adviceHTML = `
        <div class="analytics-advice">
            <div class="advice-header">
                <span class="advice-icon">📊</span>
                <h4 class="advice-title">Analytics Insights</h4>
            </div>
            <div class="advice-content">
                <p class="advice-message">Loading insights...</p>
                <div class="advice-actions">
                    <h5>Recommended Actions:</h5>
                    <ul class="actions-list"></ul>
                </div>
            </div>
        </div>
    `;
    
    analyticsSection.insertAdjacentHTML('beforeend', adviceHTML);
    return document.querySelector('.analytics-advice');
}


function displayEmptyAnalytics() {
    const metrics = document.querySelectorAll('.analytics-grid .metric');
    
    metrics.forEach((metric, index) => {
        const label = metric.querySelector('.metric-label');
        const value = metric.querySelector('.metric-value');
        const progress = metric.querySelector('.progress-fill');
        
        if (index === 0) {
            if (label) label.textContent = 'Response Rate';
            if (value) value.textContent = '0%';
        } else if (index === 1) {
            if (label) label.textContent = 'Overall Satisfaction';
            if (value) value.textContent = '0%';
        }
        
        if (progress) {
            progress.style.width = '0%';
            progress.className = 'progress-fill';
        }
    });
    
    // Show getting started advice
    const advice = generateAnalyticsAdvice(0, 0);
    displayAnalyticsAdvice(advice);
}

function displayErrorAnalytics() {
    const metrics = document.querySelectorAll('.analytics-grid .metric');
    
    metrics.forEach((metric, index) => {
        const label = metric.querySelector('.metric-label');
        const value = metric.querySelector('.metric-value');
        const progress = metric.querySelector('.progress-fill');
        
        if (index === 0) {
            if (label) label.textContent = 'Response Rate';
            if (value) value.textContent = 'Error';
        } else if (index === 1) {
            if (label) label.textContent = 'Overall Satisfaction';
            if (value) value.textContent = 'Error';
        }
        
        if (progress) {
            progress.style.width = '0%';
            progress.className = 'progress-fill red-fill';
        }
    });
    
    // Show error-specific advice
    const errorAdvice = {
        priority: 'danger',
        title: 'Data Loading Error',
        message: 'Unable to load analytics data. Please try refreshing or check your connection.',
        icon: '⚠️',
        actions: [
            'Refresh the page to retry data loading',
            'Check your internet connection',
            'Contact support if the problem persists',
            'Try switching to a different club and back'
        ]
    };
    
    displayAnalyticsAdvice(errorAdvice);
}

// Add CSS for the different progress bar colors
const analyticsCSS = `
.progress-fill.green-fill {
    background-color: #10b981 !important;
}

.progress-fill.orange-fill {
    background-color: #f59e0b !important;
}

.progress-fill.red-fill {
    background-color: #ef4444 !important;
}

.metric-label {
    font-weight: 500;
    color: #374151;
    font-size: 14px;
}

.metric-value {
    font-weight: 600;
    color: #111827;
    font-size: 16px;
    margin-top: 8px;
}
`;

// Add the CSS to the page
if (!document.querySelector('#analytics-css')) {
    const analyticsStyle = document.createElement('style');
    analyticsStyle.id = 'analytics-css';
    analyticsStyle.innerHTML = analyticsCSS;
    document.head.appendChild(analyticsStyle);
}

function updateAdviceContent(container, advice) {
    const icon = container.querySelector('.advice-icon');
    const title = container.querySelector('.advice-title');
    const message = container.querySelector('.advice-message');
    const actionsList = container.querySelector('.actions-list');
    
    if (icon) icon.textContent = advice.icon;
    if (title) title.textContent = advice.title;
    if (message) message.textContent = advice.message;
    
    // Update container priority class
    container.className = `analytics-advice ${advice.priority}`;
    
    // Update actions list
    if (actionsList && advice.actions.length > 0) {
        actionsList.innerHTML = advice.actions
            .map(action => `<li>${action}</li>`)
            .join('');
    }
}

// Enhanced CSS for advice display
const adviceCSS = `
.analytics-advice {
    margin-top: 20px;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid;
    background: #f8f9fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.analytics-advice.success {
    border-left-color: #10b981;
    background: #f0fdfa;
}

.analytics-advice.warning {
    border-left-color: #f59e0b;
    background: #fefbf0;
}

.analytics-advice.danger {
    border-left-color: #ef4444;
    background: #fef7f7;
}

.analytics-advice.info {
    border-left-color: #3b82f6;
    background: #f0f7ff;
}

.advice-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.advice-icon {
    font-size: 20px;
}

.advice-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.advice-message {
    margin: 0 0 16px 0;
    color: #4b5563;
    line-height: 1.5;
}

.advice-actions h5 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.actions-list {
    margin: 0;
    padding-left: 20px;
    color: #4b5563;
}

.actions-list li {
    margin-bottom: 4px;
    line-height: 1.4;
}

.actions-list li:last-child {
    margin-bottom: 0;
}
`;

// Add the advice CSS to the existing analytics CSS
const existingAnalyticsCSS = `
.progress-fill.green-fill {
    background-color: #10b981 !important;
}

.progress-fill.orange-fill {
    background-color: #f59e0b !important;
}

.progress-fill.red-fill {
    background-color: #ef4444 !important;
}

.metric-label {
    font-weight: 500;
    color: #374151;
    font-size: 14px;
}

.metric-value {
    font-weight: 600;
    color: #111827;
    font-size: 16px;
    margin-top: 8px;
}

${adviceCSS}
`;

// Update the existing CSS
if (!document.querySelector('#analytics-css')) {
    const analyticsStyle = document.createElement('style');
    analyticsStyle.id = 'analytics-css';
    analyticsStyle.innerHTML = existingAnalyticsCSS;
    document.head.appendChild(analyticsStyle);
} else {
    document.querySelector('#analytics-css').innerHTML = existingAnalyticsCSS;
}




async function initBudgetControlCenter(clubId) {
    currentClubId = clubId;
    console.log(`Initializing Budget Control Center for club: ${clubId}`);
    
    // Load club data
    const clubDoc = await db.collection('clubs').doc(clubId).get();
    if (!clubDoc.exists()) {
        console.error('Club not found');
        return;
    }
    
    // Load checklist items
    loadChecklistItems();
    
    // Load pending approvals
    loadPendingApprovals();
}

// Checklist functionality
// Checklist add function - fixed version
const addChecklistBtn = document.getElementById('addChecklistItem');
    if (addChecklistBtn) {
        // Remove any existing listeners first
       
        
        addChecklistBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default behavior
            e.stopPropagation(); // Stop event bubbling
            
            try {
                const input = document.getElementById('checklistItemInput');
                if (!input) {
                    console.error('Input element not found');
                    return;
                }
                
                const text = input.value.trim();
                
                if (!text) {
                    alert('Please enter text');
                    return;
                }

                if (!currentClubId) {
                    alert('Please select a club first');
                    console.error('No club ID set. Current club ID:', currentClubId);
                    return;
                }

                if (!currentUser) {
                    alert('Please log in first');
                    console.error('No current user');
                    return;
                }

                if (!db) {
                    console.error('Database not initialized');
                    return;
                }

                console.log('Adding checklist item:', { text, clubId: currentClubId, user: currentUser.uid });

                // Add to Firestore
                await db.collection('clubs').doc(currentClubId).collection('checklist').add({
                    text: text,
                    completed: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: currentUser.uid
                });
                
                input.value = ''; // Clear input
                console.log('✅ Checklist item added successfully');
                
            } catch (error) {
                console.error('❌ Add failed:', error);
                alert('Failed to add item: ' + error.message);
            }
        });
    }

// Load checklist items
function loadChecklistItems() {
    if (!currentClubId) return;
    
    db.collection('clubs').doc(currentClubId).collection('checklist')
        .orderBy('createdAt')
        .onSnapshot((snapshot) => {
            const container = document.getElementById('checklistItemsContainer');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const item = doc.data();
                const itemElement = document.createElement('div');
                itemElement.className = 'checklist-item';
                itemElement.innerHTML = `
                    <input type="checkbox" ${item.completed ? 'checked' : ''} 
                           data-id="${doc.id}">
                    <span class="${item.completed ? 'completed' : ''}">${item.text}</span>
                    <button class="delete-btn" data-id="${doc.id}">×</button>
                `;
                container.appendChild(itemElement);
            });
        });
}

// Load pending approvals
function loadPendingApprovals() {
    if (!currentClubId) return;
    
    db.collection('budgetRequests')
        .where('clubId', '==', currentClubId)
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            const container = document.getElementById('approvalsContainer');
            container.innerHTML = '<h4></h4>';
            
            snapshot.forEach(doc => {
                const request = doc.data();
                const requestElement = document.createElement('div');
                requestElement.className = 'approval-item';
                requestElement.innerHTML = `
                    <span class="approval-desc">${request.description} - $${request.amount}</span>
                    <div class="approval-actions">
                        <button class="approve-btn" data-id="${doc.id}">✓</button>
                        <button class="reject-btn" data-id="${doc.id}">✗</button>
                    </div>
                `;
                container.appendChild(requestElement);
            });
        });
}

// Event delegation for dynamic elements
document.addEventListener('click', async (e) => {
    if (!currentClubId) return;
    
    // Checklist item completion toggle
    if (e.target.matches('.checklist-item input[type="checkbox"]')) {
        const itemId = e.target.getAttribute('data-id');
        try {
            await db.collection('clubs').doc(currentClubId).collection('checklist')
                .doc(itemId).update({
                    completed: e.target.checked,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        } catch (error) {
            console.error('Error updating checklist item:', error);
        }
    }
    
    // Checklist item deletion
    if (e.target.matches('.delete-btn')) {
        const itemId = e.target.getAttribute('data-id');
        try {
            await db.collection('clubs').doc(currentClubId).collection('checklist')
                .doc(itemId).delete();
        } catch (error) {
            console.error('Error deleting checklist item:', error);
        }
    }
    
    // Approval actions
    if (e.target.matches('.approve-btn')) {
        const requestId = e.target.getAttribute('data-id');
        try {
            await db.collection('budgetRequests').doc(requestId).update({
                status: 'approved',
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                reviewedBy: currentUser.uid
            });
        } catch (error) {
            console.error('Error approving request:', error);
        }
    }
    
    if (e.target.matches('.reject-btn')) {
        const requestId = e.target.getAttribute('data-id');
        try {
            await db.collection('budgetRequests').doc(requestId).update({
                status: 'rejected',
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                reviewedBy: currentUser.uid
            });
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    }
});

// New budget request
const newRequestBtn = document.getElementById('newRequestBtn');
if (newRequestBtn) {
   newRequestBtn.addEventListener('click', async () => {
       if (!currentClubId) return;
       
       const description = prompt('Enter request description:');
       if (!description) return;
       
       const amount = parseFloat(prompt('Enter amount:'));
       if (isNaN(amount)) {  // Fixed syntax error here
           alert('Please enter a valid number');
           return;
       }
       
       try {
           await db.collection('budgetRequests').add({
               clubId: currentClubId,
               description: description,
               amount: amount,
               status: 'pending',
               requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
               requestedBy: currentUser.uid
           });
       } catch (error) {
           console.error('Error creating budget request:', error);
           alert('Failed to create request. Please try again.');
       }
   });
}




// DOM Elements
const searchInput = document.querySelector('.search-input');
const navItems = document.querySelectorAll('.nav-item');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const createButtons = document.querySelectorAll('.create-btn');
const linkItems = document.querySelectorAll('.link-item');
const goLiveBtn = document.querySelector('.go-live-btn');
const createPostBtn = document.querySelector('.create-post-btn');
const thinSidebarBtns = document.querySelectorAll('.thin-sidebar-btn');
const floatingChat = document.querySelector('.floating-chat');
const sortDropdown = document.querySelector('.sort-dropdown');
const moreBtn = document.querySelector('.more-btn');
const communityName = document.querySelector('.community-name');

// Create modal HTML dynamically
const modalHTML = `
<div id="statsModal" class="stats-modal">
  <div class="modal-content">
    <button class="modal-close">&times;</button>
    <div class="modal-body">
      <h2>Stats Here</h2>
      <div class="stats-content">
        <p>Detailed analytics and statistics would appear in this space.</p>
        <div class="stat-item">
          <span class="stat-label">Engagement:</span>
          <span class="stat-value">78%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Attendance:</span>
          <span class="stat-value">65%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Satisfaction:</span>
          <span class="stat-value">4.2/5</span>
        </div>
      </div>
    </div>
  </div>
</div>
`;

// Add modal to body
document.body.insertAdjacentHTML('beforeend', modalHTML);

// CSS for the modal
const modalCSS = `
.stats-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.stats-modal .modal-content {
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  padding: 30px;
  position: relative;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
}

.stats-modal .modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.stats-modal h2 {
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 22px;
}

.stats-content {
  color: #555;
  line-height: 1.6;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  color: #333;
}
`;

// Add CSS to head
const style = document.createElement('style');
style.innerHTML = modalCSS;
document.head.appendChild(style);

// Function to open modal
function openStatsModal() {
  const modal = document.getElementById('statsModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Function to close modal
function closeStatsModal() {
  const modal = document.getElementById('statsModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Search functionality
searchInput.addEventListener('focus', function() {
  this.parentElement.style.transform = 'scale(1.02)';
});

searchInput.addEventListener('blur', function() {
  this.parentElement.style.transform = 'scale(1)';
});

searchInput.addEventListener('input', function() {
  if (this.value.length > 0) {
    console.log('Searching for:', this.value);
  }
});

// Navigation interactions
navItems.forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    navItems.forEach(nav => nav.classList.remove('active'));
    this.classList.add('active');
    console.log('Navigating to:', this.textContent);
  });
});

// Sidebar interactions
sidebarItems.forEach(item => {
  item.addEventListener('click', function() {
    sidebarItems.forEach(sidebar => sidebar.classList.remove('selected'));
    if (!this.classList.contains('active')) {
      this.classList.add('selected');
    }
    console.log('Selected sidebar item:', this.textContent.trim());
  });
});

// Create buttons functionality
createButtons.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const action = this.textContent.trim();
    console.log('Create action:', action);
    openStatsModal();
    
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 150);
  });
});

// Link items functionality
linkItems.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const linkText = this.textContent.trim();
    console.log('Opening link:', linkText);
    openStatsModal();
  });
});
// Add CSS animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(-50%) scale(1);
    }
    40%, 43% {
      transform: translateY(-50%) scale(1.1);
    }
    70% {
      transform: translateY(-50%) scale(1.05);
    }
    90% {
      transform: translateY(-50%) scale(1.02);
    }
  }
  
  .sidebar-item:hover {
    transform: translateX(2px);
  }
  
  .nav-item:hover {
    transform: translateY(-1px);
  }
  
  .create-post-btn:active {
    transform: scale(0.98);
  }
  
  .floating-chat:active {
    transform: scale(0.95);
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;
document.head.appendChild(animationStyle);

// Close modal handlers
document.querySelector('.modal-close').addEventListener('click', closeStatsModal);
document.getElementById('statsModal').addEventListener('click', function(e) {
  if (e.target === this) closeStatsModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('statsModal');
    if (modal.style.display === 'flex') {
      closeStatsModal();
    }
  }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Community platform loaded successfully!');
  
  // Add click handlers to all buttons
  

  // Profile avatar click handler
  const profileAvatar = document.querySelector('.profile-avatar');
  if (profileAvatar) {
    profileAvatar.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Opening profile menu...');
      openStatsModal();
      
      this.style.animation = 'pulse 0.3s ease-in-out';
      setTimeout(() => {
        this.style.animation = '';
      }, 300);
    });
  }
});

console.log('Community platform JavaScript loaded!');