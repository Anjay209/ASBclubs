


document.addEventListener('DOMContentLoaded', function() {
   

    // Initialize Firebase (make sure this is at the top of your file)
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
            console.log("[INIT] Firebase initialized successfully");
        }

        let pendingSurveys = [];
let currentSurveyData = null;
        
        // Initialize services
      const auth = firebase.auth();
const db = firebase.firestore();

         let currentUser = null;
        let currentClubId = null;
        
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
            
            
            let currentSurveyEvent = null;
 

function initializeSurveySystem() {
    setupSurveySliders();
    setupSurveyEventListeners();
    loadUserSurveys();
}

// Listen for auth state changes (you might already have this)
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // User is signed out, redirect to login
        window.location.href = 'login.html';
    }
});


function debugCollaborationSystem() {
    console.log("=== COLLABORATION SYSTEM DEBUG ===");
    console.log("Current User:", currentUser);
    console.log("Current Club ID:", currentClubId);
    
    // Check if modal exists
    const modal = document.getElementById('collabRequestModal');
    console.log("Modal exists:", !!modal);
    
    // Check if we're listening for requests
    if (!currentClubId) {
        console.error("❌ No currentClubId - this is likely the problem!");
        return;
    }
    
    // Manual query to check for pending requests
    db.collection('collaborationRequests')
        .where('toClubId', '==', currentClubId)
        .where('status', '==', 'pending')
        .get()
        .then(snapshot => {
            console.log(`📬 Found ${snapshot.size} pending requests`);
            snapshot.forEach(doc => {
                console.log("Request:", doc.id, doc.data());
            });
            
            if (snapshot.size > 0) {
                console.log("🔧 Manually showing first request...");
                showCollabRequest(snapshot.docs[0]);
            }
        })
        .catch(error => {
            console.error("❌ Error querying requests:", error);
        });
}
function ensureCollabRequestModalExists() {
            if (!document.getElementById('collabRequestModal')) {
                console.log("[MODAL] Creating collaboration request modal");
                const modal = document.createElement('div');
                modal.id = 'collabRequestModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <div id="collabRequestContent"></div>
                        <div class="modal-actions">
                            <button id="rejectCollabRequest" class="btn-secondary">Decline</button>
                            <button id="acceptCollabRequest" class="btn-primary">Accept</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Add event listeners
                modal.querySelector('.close-modal').addEventListener('click', () => {
                    console.log("[MODAL] Closing request modal manually");
                    modal.style.display = 'none';
                });
            }
        }

       

        // Replace your existing listenForCollabRequests function with this:

function listenForCollabRequests() {
    if (!currentUser) {
        console.warn("[REQUESTS] No currentUser, cannot listen for requests");
        return;
    }
    
    console.log(`[REQUESTS] Loading user data for: ${currentUser.uid}`);
    
    // First, get the user's owned clubs from the users collection
    db.collection('users').doc(currentUser.uid).get()
        .then(userDoc => {
            if (!userDoc.exists) {
                console.warn("[REQUESTS] User document doesn't exist");
                return;
            }
            
            const userData = userDoc.data();
            const ownedClubs = userData.ownedClubs || [];
            
            console.log(`[REQUESTS] User owns ${ownedClubs.length} clubs:`, ownedClubs);
            
            if (ownedClubs.length === 0) {
                console.warn("[REQUESTS] User owns no clubs");
                return;
            }
            
            // Listen for collaboration requests for ALL owned clubs
            db.collection('collaborationRequests')
                .where('toClubId', 'in', ownedClubs) // Listen for requests to any owned club
                .where('status', '==', 'pending')
                .onSnapshot(snapshot => {
                    console.groupCollapsed("[REQUESTS] New snapshot received");
                    console.log(`[REQUESTS] Total pending requests: ${snapshot.size}`);
                    
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const requestData = change.doc.data();
                            console.log(`[REQUESTS] New request ID: ${change.doc.id}`);
                            console.log(`[REQUESTS] To club: ${requestData.toClubId}`);
                            console.log(`[REQUESTS] From club: ${requestData.fromClubId}`);
                            console.log("[REQUESTS] Request data:", requestData);
                            showCollabRequest(change.doc);
                        }
                    });
                    console.groupEnd();
                }, error => {
                    console.error("[REQUESTS] Listener error:", error);
                });
                
        })
        .catch(error => {
            console.error("[REQUESTS] Error loading user data:", error);
        });
}

        
        // Show collaboration request modal with all details
      function showCollabRequest(requestDoc) {
    const request = requestDoc.data();
    console.groupCollapsed(`[REQUEST] Showing request ${requestDoc.id}`);
    console.log("[REQUEST] To Club ID:", request.toClubId);
    console.log("[REQUEST] From Club ID:", request.fromClubId);
    console.log("[REQUEST] From User ID:", request.fromUserId);
    
    ensureCollabRequestModalExists();
    const modal = document.getElementById('collabRequestModal');
    
    // Get both the requesting club info AND the target club info
    Promise.all([
        db.collection('clubs').doc(request.fromClubId).get(),
        db.collection('clubs').doc(request.toClubId).get()
    ]).then(([fromClubDoc, toClubDoc]) => {
        const fromClub = fromClubDoc.exists ? fromClubDoc.data() : { name: 'Unknown Club' };
        const toClub = toClubDoc.exists ? toClubDoc.data() : { name: 'Unknown Club' };
        
        console.log("[REQUEST] From club details:", fromClub);
        console.log("[REQUEST] To club details:", toClub);
        
       document.getElementById('collabRequestContent').innerHTML = `
    <div class="collab-request-wrapper">
        <div class="request-header">
            <div class="header-icon"></div>
            <h3>New Collaboration Request</h3>
        </div>
        
        <div class="clubs-info">
            <div class="club-card to-club">
                <div class="club-label">To</div>
                <div class="club-name">${toClub.name}</div>
            </div>
            <div class="arrow">→</div>
            <div class="club-card from-club">
                <div class="club-label">From</div>
                <div class="club-name">${fromClub.name}</div>
            </div>
        </div>
        
        <div class="request-details">
            <div class="detail-item">
                <span class="detail-label">Mission:</span>
                <span class="detail-value">${fromClub.mission || 'Not specified'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Members:</span>
                <span class="detail-value">${fromClub.memberCount || 0}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Sent:</span>
                <span class="detail-value">${new Date(request.createdAt?.toDate() || Date.now()).toLocaleDateString()}</span>
            </div>
        </div>
        
        <input type="hidden" id="requestId" value="${requestDoc.id}">
        <input type="hidden" id="fromClubId" value="${request.fromClubId}">
        <input type="hidden" id="toClubId" value="${request.toClubId}">
    </div>
`;
        
        console.log("[REQUEST] Displaying modal");
        modal.style.display = 'block';
        console.groupEnd();
    }).catch(error => {
        console.error("[REQUEST] Error loading club data:", error);
        console.groupEnd();
    });
}
        
        // Handle accept/reject with full logging
       document.addEventListener('click', function(e) {
    if (e.target.id === 'acceptCollabRequest') {
        const requestId = document.getElementById('requestId').value;
        const fromClubId = document.getElementById('fromClubId').value;
        const toClubId = document.getElementById('toClubId').value;
        
        console.groupCollapsed(`[REQUEST] Accepting request ${requestId}`);
        console.log("[REQUEST] From Club ID:", fromClubId);
        console.log("[REQUEST] To Club ID:", toClubId);
        
        db.collection('collaborationRequests').doc(requestId).update({
            status: 'accepted',
            respondedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("[REQUEST] Status updated to 'accepted'");
            
            // Add to both clubs' partners lists
            const batch = db.batch();
            const toClubRef = db.collection('clubs').doc(toClubId);
            const fromClubRef = db.collection('clubs').doc(fromClubId);
            
            batch.update(toClubRef, {
                partners: firebase.firestore.FieldValue.arrayUnion(fromClubId)
            });
            batch.update(fromClubRef, {
                partners: firebase.firestore.FieldValue.arrayUnion(toClubId)
            });
            
            return batch.commit().then(() => {
                console.log("[REQUEST] Partners lists updated successfully");
                e.target.textContent = 'Request Accepted';
document.getElementById('collabRequestModal').style.display = 'none';
                console.groupEnd();
            });
        }).catch(error => {
            console.error("[REQUEST] Error accepting request:", error);
            console.groupEnd();
        });
    }
    
    if (e.target.id === 'rejectCollabRequest') {
        const requestId = document.getElementById('requestId').value;
        console.groupCollapsed(`[REQUEST] Rejecting request ${requestId}`);
        
        db.collection('collaborationRequests').doc(requestId).update({
            status: 'rejected',
            respondedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("[REQUEST] Status updated to 'rejected'");
            e.target.textContent = 'Request Declined';
document.getElementById('collabRequestModal').style.display = 'none';
            console.groupEnd();
        }).catch(error => {
            console.error("[REQUEST] Error rejecting request:", error);
            console.groupEnd();
        });
    }
});

// Debug function to check user's owned clubs
function debugOwnedClubs() {
    if (!currentUser) {
        console.log("No current user");
        return;
    }
    
    db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                console.log("User data:", data);
                console.log("Owned clubs:", data.ownedClubs);
            } else {
                console.log("User document doesn't exist");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
}


// Setup slider interactions
function setupSurveySliders() {
    document.querySelectorAll('.survey-slider').forEach(slider => {
        const valueDisplay = slider.parentNode.querySelector('.slider-value');
        
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });
        
        // Initialize display
        valueDisplay.textContent = slider.value;
    });
}

// Setup event listeners
function setupSurveyEventListeners() {
    // Close modal buttons
    document.querySelectorAll('.close-survey-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('surveyModal').classList.remove('show');
        });
    });

    // Submit survey
    document.getElementById('submitSurvey').addEventListener('click', submitSurveyResponse);

    // Banner buttons
    document.getElementById('viewSurveysBtn').addEventListener('click', showPendingSurveys);
    document.getElementById('dismissBannerBtn').addEventListener('click', dismissSurveyBanner);

    // Close modal when clicking outside
    document.getElementById('surveyModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
}

// Load user surveys from Firebase
async function loadUserSurveys() {
    if (!currentUser) return;
    
    try {
        const surveysSnapshot = await db.collection('surveys')
            .where('attendees', 'array-contains', currentUser.uid)
            .where('status', '==', 'active')
            .get();
        
        pendingSurveys = [];
        surveysSnapshot.forEach(doc => {
            const surveyData = doc.data();
            // Check if user hasn't responded yet
            if (!surveyData.responses || !surveyData.responses[currentUser.uid]) {
                pendingSurveys.push({
                    id: doc.id,
                    ...surveyData
                });
            }
        });
        
        console.log(`📊 Found ${pendingSurveys.length} pending surveys`);
        displaySurveyNotifications();
        
    } catch (error) {
        console.error('Error loading surveys:', error);
    }
}

// Display survey notifications
function displaySurveyNotifications() {
    const banner = document.getElementById('surveyBanner');
    const bannerText = document.getElementById('surveyBannerText');
    
    if (pendingSurveys.length > 0) {
        const surveyText = pendingSurveys.length === 1 ? 'survey' : 'surveys';
        bannerText.textContent = `You have ${pendingSurveys.length} event ${surveyText} to complete`;
        banner.style.display = 'block';
        
        // Add top padding to body to account for banner
        document.body.style.paddingTop = '80px';
    } else {
        banner.style.display = 'none';
        document.body.style.paddingTop = '0';
    }
}

// Show pending surveys list
function showPendingSurveys() {
    if (pendingSurveys.length === 0) {
        alert('No pending surveys');
        return;
    }
    
    // Show first pending survey
    showSurveyModal(pendingSurveys[0]);
}

// Show survey modal
function showSurveyModal(surveyData) {
    currentSurveyData = surveyData;
    
    // Populate modal
    document.getElementById('surveyEventTitle').textContent = `Feedback for "${surveyData.eventTitle}"`;
    document.getElementById('surveyEventDetails').textContent = 
        `Event Date: ${new Date(surveyData.eventDate).toLocaleDateString()}`;
    
    // Reset form
    document.querySelectorAll('.survey-slider').forEach(slider => {
        slider.value = 5;
        slider.parentNode.querySelector('.slider-value').textContent = '5';
    });
    document.getElementById('surveyComments').value = '';
    
    // Show modal
    document.getElementById('surveyModal').classList.add('show');
}

// Submit survey response
async function submitSurveyResponse() {
    if (!currentSurveyData || !currentUser) return;
    
    // Get ratings
    const ratings = {};
    document.querySelectorAll('.survey-slider').forEach(slider => {
        const question = slider.getAttribute('data-question');
        ratings[question] = parseInt(slider.value);
    });
    
    const comments = document.getElementById('surveyComments').value.trim();
    
    // Validate all questions answered
    const requiredQuestions = ['enjoyment', 'engagement', 'likelyToReturn', 'organization'];
    for (const question of requiredQuestions) {
        if (!ratings[question] || ratings[question] < 1 || ratings[question] > 10) {
            alert(`Please provide a rating for ${question.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return;
        }
    }
    
    const submitBtn = document.getElementById('submitSurvey');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Get club information from the associated event
        let clubInfo = {
            id: null,
            name: null
        };
        
        if (currentSurveyData.eventId) {
            console.log('🔍 Fetching event data for clubId:', currentSurveyData.eventId);
            const eventDoc = await db.collection('events').doc(currentSurveyData.eventId).get();
            
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                clubInfo.id = eventData.clubId;
                clubInfo.name = eventData.clubName;
                console.log('✅ Found club info:', clubInfo);
            } else {
                console.warn('⚠️ Event document not found for ID:', currentSurveyData.eventId);
            }
        }
        
        // Prepare response data with club information
        const responseData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            ratings: ratings,
            comments: comments,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Prepare survey update data
        const updateData = {
            [`responses.${currentUser.uid}`]: responseData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add club information to the survey document (if we have it)
        if (clubInfo.id) {
            updateData.clubId = clubInfo.id;
            updateData.clubName = clubInfo.name;
            console.log('📝 Adding club info to survey:', {
                clubId: clubInfo.id,
                clubName: clubInfo.name
            });
        }
        
        // Update survey document
        await db.collection('surveys').doc(currentSurveyData.id).update(updateData);
        
        // Remove from pending surveys
        pendingSurveys = pendingSurveys.filter(s => s.id !== currentSurveyData.id);
        
        // Close modal
        // Change button text instead of alert
submitBtn.textContent = 'Submitted';

// Close modal after delay and reset
setTimeout(() => {
    document.getElementById('surveyModal').classList.remove('show');
    
    // Update banner (add this back)
    displaySurveyNotifications();
    
    // Reset form
    document.querySelectorAll('.survey-slider').forEach(slider => {
        slider.value = 5; // or whatever default value
    });
    document.getElementById('surveyComments').value = '';
    submitBtn.textContent = originalText;
}, 1500);
        
        console.log('✅ Survey response submitted successfully with club info:', {
            surveyId: currentSurveyData.id,
            clubId: clubInfo.id,
            clubName: clubInfo.name
        });
        
    } catch (error) {
        console.error('❌ Error submitting survey:', error);
        alert('Failed to submit survey. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

document.querySelector('.go-live-btn').addEventListener('click', function() {
  document.getElementById('surveyCreationModal').style.display = 'flex';
});

// Close modal
document.querySelector('.close-survey-creation').addEventListener('click', function() {
  document.getElementById('surveyCreationModal').style.display = 'none';
});

document.getElementById('cancelSurvey').addEventListener('click', function() {
  document.getElementById('surveyCreationModal').style.display = 'none';
});

// Add question functionality
document.getElementById('addQuestionBtn').addEventListener('click', function() {
  const template = document.getElementById('questionTemplate');
  const clone = template.cloneNode(true);
  clone.style.display = 'block';
  document.getElementById('surveyQuestionsContainer').appendChild(clone);
  
  // Add event listener to question type change
  const typeSelect = clone.querySelector('.question-type');
  typeSelect.addEventListener('change', function() {
    updateQuestionOptions(this);
  });
  
  // Add remove question functionality
  clone.querySelector('.remove-question').addEventListener('click', function() {
    clone.remove();
  });
});

function updateQuestionOptions(selectElement) {
  const optionsContainer = selectElement.closest('.survey-question').querySelector('.question-options');
  const type = selectElement.value;
  
  optionsContainer.innerHTML = ''; // Clear previous options

  if (type === 'multiple-choice' || type === 'dropdown' || type === 'checkbox') {
    // Add two default options
    addOption(optionsContainer, 'Option 1');
    addOption(optionsContainer, 'Option 2');
    
    // Add option button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-option-btn';
    addBtn.textContent = '+ Add Option';
    addBtn.onclick = () => addOption(optionsContainer, 'New option');
    optionsContainer.appendChild(addBtn);
  } 
  else if (type === 'scale') {
    optionsContainer.innerHTML = `
      <div class="scale-display">
        Respondents will select from 1 (low) to 5 (high)
      </div>
    `;
  }
  else { // Text response
    optionsContainer.innerHTML = `
      <div class="scale-display">
        Respondents will type their answer
      </div>
    `;
  }
}


// Enhanced loadCurrentClub function with better debugging and UI updates
async function loadCurrentClub() {
    console.groupCollapsed("[CLUB] Loading current club - ENHANCED DEBUG");
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        console.error("[CLUB] No authenticated user found!");
        console.log("[CLUB] currentUser:", currentUser);
        console.groupEnd();
        return false;
    }
    
    console.log("[CLUB] User authenticated:", currentUser.uid);
    console.log("[CLUB] User email:", currentUser.email);
    
    // Add loading indicator to UI
    updateClubLoadingState('loading');
    
    try {
        console.log("[CLUB] Querying Firestore for clubs...");
        
        // First, let's check if the clubs collection exists and has data
        const allClubsSnapshot = await db.collection('clubs').limit(1).get();
        console.log("[CLUB] Total clubs in database:", allClubsSnapshot.size);
        
        // Now query for user's clubs
        const snapshot = await db.collection('clubs')
            .where('creatorId', '==', currentUser.uid)
            .get();
            
        console.log("[CLUB] Query completed. Results:", snapshot.size);
        
        if (!snapshot.empty) {
            const clubDoc = snapshot.docs[0];
            currentClubId = clubDoc.id;
            const clubData = clubDoc.data();
            
            console.log("[CLUB] Current club ID set to:", currentClubId);
            console.log("[CLUB] Club data:", clubData);
            
            // Update UI with club information
            updateClubUI(clubData);
            updateClubLoadingState('loaded');
            
            console.groupEnd();
            return true;
        } else {
            console.warn("[CLUB] User has no clubs created");
            
            // Check if user is a member of any clubs
            console.log("[CLUB] Checking if user is a member of any clubs...");
            const memberSnapshot = await db.collection('clubs')
                .where('members', 'array-contains', currentUser.uid)
                .limit(1)
                .get();
            
            if (!memberSnapshot.empty) {
                console.log("[CLUB] User is a member of clubs but not creator");
                updateClubLoadingState('member');
            } else {
                console.log("[CLUB] User is not associated with any clubs");
                updateClubLoadingState('no-club');
            }
            
            console.groupEnd();
            return false;
        }
    } catch (error) {
        console.error("[CLUB] Error loading current club:", error);
        console.error("[CLUB] Error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        
        updateClubLoadingState('error');
        console.groupEnd();
        return false;
    }
}

// Function to update UI based on club loading state
function updateClubLoadingState(state) {
    const statusElement = document.getElementById('clubStatus'); // You might need to create this
    const clubInfoElement = document.getElementById('clubInfo'); // You might need to create this
    
    switch (state) {
        case 'loading':
            console.log("[UI] Setting club status to loading...");
            if (statusElement) statusElement.textContent = 'Loading club information...';
            break;
            
        case 'loaded':
            console.log("[UI] Club loaded successfully");
            if (statusElement) statusElement.textContent = 'Club loaded successfully!';
            break;
            
        case 'member':
            console.log("[UI] User is club member");
            if (statusElement) statusElement.textContent = 'You are a member of clubs';
            break;
            
        case 'no-club':
            console.log("[UI] User has no clubs");
            if (statusElement) statusElement.textContent = 'No clubs found. Create or join a club!';
            break;
            
        case 'error':
            console.log("[UI] Error loading club");
            if (statusElement) statusElement.textContent = 'Error loading club information';
            break;
    }
}

// Function to update UI with club data
function updateClubUI(clubData) {
    console.log("[UI] Updating club UI with data:", clubData);
    
    // Update various UI elements with club information
    const elements = {
        'clubName': clubData.name,
        'clubMission': clubData.mission,
        'clubMemberCount': clubData.memberCount || 0,
        'clubCreatedAt': clubData.createdAt ? new Date(clubData.createdAt.toDate()).toLocaleDateString() : 'Unknown'
    };
    
    Object.entries(elements).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            console.log(`[UI] Updated ${elementId} with:`, value);
        } else {
            console.warn(`[UI] Element ${elementId} not found in DOM`);
        }
    });
}

// Consolidated and improved auth state change handler
auth.onAuthStateChanged(async (user) => {
    console.groupCollapsed("[AUTH] Auth state changed");
    
    if (user) {
        console.log("[AUTH] User authenticated:", user.uid);
        console.log("[AUTH] User email:", user.email);
        
        currentUser = user;
         await loadUserSurveys();
        
        // Wait for Firestore to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            // Initialize collaboration listening (doesn't need currentClubId anymore)
            console.log("[AUTH] Setting up collaboration listeners for all owned clubs...");
            listenForCollabRequests();
            
            // Load club information for UI (optional now)
            const hasClub = await loadCurrentClub();
            console.log("[AUTH] Club loading result:", hasClub);
            
            // Initialize other systems
            setupModal();
            updateNotificationsPanel();
            initializeSurveySystem();
            
        } catch (error) {
            console.error("[AUTH] Error during initialization:", error);
        }
        
    } else {
        console.log("[AUTH] User not authenticated, redirecting to login");
        window.location.href = 'login.html';
    }
    
    console.groupEnd();
});


// Debug function to manually test club loading
window.debugLoadClub = async function() {
    console.log("🔧 Manual club loading debug started...");
    console.log("Current user:", currentUser);
    console.log("Current club ID:", currentClubId);
    
    if (currentUser) {
        const result = await loadCurrentClub();
        console.log("Manual load result:", result);
    } else {
        console.log("No authenticated user for manual test");
    }
};

// Add some HTML elements for status display if they don't exist
document.addEventListener('DOMContentLoaded', function() {
    // Create status elements if they don't exist
    if (!document.getElementById('clubStatus')) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'clubStatus';
        statusDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #f0f0f0; padding: 10px; border-radius: 5px; z-index: 1000;';
        statusDiv.textContent = 'Initializing...';
        document.body.appendChild(statusDiv);
    }
});

function addOption(container, defaultValue) {
  const div = document.createElement('div');
  div.className = 'option-field';
  div.innerHTML = `
    <input type="text" value="${defaultValue}">
    <button onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(div);
}

function addOptionField(container) {
  const optionDiv = document.createElement('div');
  optionDiv.className = 'option-field';
  optionDiv.innerHTML = `
    <input type="text" placeholder="Option text">
    <button class="remove-option">&times;</button>
  `;
  
  optionDiv.querySelector('.remove-option').addEventListener('click', function() {
    optionDiv.remove();
  });
  
  container.insertBefore(optionDiv, container.querySelector('.add-option-btn'));
}

// Publish survey (placeholder functionality)
document.getElementById('publishSurvey').addEventListener('click', async function() {
  const clubId = getCurrentClubId();
  if (!clubId) {
    alert("Error: No club selected");
    return;
  }

  // Your existing survey data collection
  const surveyData = {
    title: document.getElementById('surveyTitle').value,
    questions: [...document.querySelectorAll('.question')].map(q => ({
      text: q.querySelector('.question-text').value,
      type: q.querySelector('.question-type').value,
      options: [...q.querySelectorAll('.option-input')].map(o => o.value)
    })),
    clubId: clubId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    // Save survey
    const surveyRef = await db.collection('surveys').add(surveyData);
    
    // Get all club members (including future-proof batching)
    const membersSnapshot = await db.collection('users')
      .where('clubs', 'array-contains', clubId)
      .get();

    // Batch notifications (optimal performance)
    const batch = db.batch();
    membersSnapshot.forEach(member => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        userId: member.id,
        type: 'new_survey',
        title: `New Survey: ${surveyData.title}`,
        message: `Please complete the ${surveyData.title} survey`,
        surveyId: surveyRef.id,
        clubId: clubId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        read: false,
        // Optional: Add badge color or icons
        meta: { badgeColor: '#3B82F6' } 
      });
    });
    await batch.commit();

    // UI feedback
    alert(`Survey published! Notified ${membersSnapshot.size} members`);
    closeModal();
    
  } catch (error) {
    console.error("Publish failed:", error);
    alert("Error: " + error.message);
  }
});

// Dismiss banner
function dismissSurveyBanner() {
    document.getElementById('surveyBanner').style.display = 'none';
    document.body.style.paddingTop = '0';
}

// Auto-check for surveys when user logs in


// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSurveySystem);
} else {
    initializeSurveySystem();
}

console.log('📊 Survey modal system loaded!');


            window.createEventEndedNotification = window.createEventEndNotification;

if (window.createEventEndNotification && !window.createEventEndedNotification) {
  window.createEventEndedNotification = window.createEventEndNotification;
}
            auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            setupModal();
            updateNotificationsPanel(); // Add this line
             loadUserSurveys();
            
            // Set up listener for new events
            db.collection('events')
                .orderBy('date', 'desc')
                .limit(1)
                .onSnapshot(() => {
                    updateNotificationsPanel();
                });
        } else {
            window.location.href = 'login.html';
        }
    });

    // notifications bootstrap (safe, no styling)
(() => {
  if (window.__notifMounted) return;
  window.__notifMounted = true;

  function onReady(cb){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else cb();
  }

  window.initNotifications = function initNotifications(opts = {}) {
    const {
      containerSelector = '#notifDropdown .notifications-container',
      createContainerIfMissing = false,
      limit = 20,
      realtime = true,
      renderer = window.addNotificationToUI // your existing renderer if you have one
    } = opts;

    const auth = firebase.auth();
    const db   = firebase.firestore();
    let unsub = null;

    onReady(() => {
      let container = document.querySelector(containerSelector);

      // Optional: create minimal structure if you want auto-mount
      if (!container && createContainerIfMissing) {
        const dd = document.createElement('div');
        dd.id = 'notifDropdown';
        dd.className = 'notif-dropdown';
        container = document.createElement('div');
        container.className = 'notifications-container';
        dd.appendChild(container);
        document.body.appendChild(dd);
      }
      if (!container) return console.warn('initNotifications: container not found, skipping');

      const renderOne = async (n) => {
        if (typeof renderer === 'function') return renderer(n); // use your styling
        // fallback: plain classes only (no inline styles)
        const div = document.createElement('div');
        div.className = 'notification-item';
        div.innerHTML = `
          <div class="notification-title">${n.title || ''}</div>
          <div class="notification-body">${n.message || ''}</div>`;
        container.prepend(div);
      };

      const loadOnce = async (uid) => {
        const snap = await db.collection('notifications')
          .where('userId', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();

        container.innerHTML = '';
        if (snap.empty) {
          container.innerHTML = '<div class="notification-empty">No notifications.</div>';
          return;
        }
        for (const doc of snap.docs) await renderOne({ id: doc.id, ...doc.data() });
        if (window.updateNotificationCount) window.updateNotificationCount();
      };

      auth.onAuthStateChanged(user => {
        if (unsub) { unsub(); unsub = null; }
        if (!user) {
          container.innerHTML = '<div class="notification-empty">Sign in to see notifications.</div>';
          return;
        }

        loadOnce(user.uid);

        if (realtime) {
          const ref = db.collection('notifications')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(limit);

          unsub = ref.onSnapshot(snap => {
            container.innerHTML = '';
            snap.forEach(d => renderOne({ id: d.id, ...d.data() }));
            if (window.updateNotificationCount) window.updateNotificationCount();
          });
        }
      });
    });

    return () => { if (unsub) unsub(); };
  };
})();


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
        function createClubMiniElement(club) {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const initial = club.name.charAt(0).toUpperCase();
            
            const clubElement = document.createElement('div');
            clubElement.className = 'user-club-mini';
            clubElement.style.backgroundColor = randomColor;
            clubElement.title = club.name;
            clubElement.textContent = initial;
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

        console.log('Community platform loaded successfully!');

        

    // DOM Elements with null checks
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
    const profileAvatar = document.querySelector('.profile-avatar');
    const closeIcon = document.querySelector('.close-icon');
    const welcomeSection = document.querySelector('.welcome-section');
    const notifBtn = document.querySelector('.icon-btn:nth-of-type(1)'); // Notification button
    const notifDropdown = document.getElementById('notifDropdown');
    const notifTabs = document.querySelectorAll('.notif-tab');
    const commentModal = document.getElementById('commentModal');
    const openCommentModalBtn = document.querySelector('.icon-btn[data-open-comment-modal]');
    const closeCommentModalBtn = document.getElementById('closeCommentModal');
     const studentCouncilModal = document.getElementById('studentCouncilModal');
  const closeStudentCouncilModalBtn = document.getElementById('closeStudentCouncilModal');
  const cancelStudentCouncilBtn = document.getElementById('cancelStudentCouncil');
  const sendStudentCouncilBtn = document.getElementById('sendStudentCouncil');
  const featuredModal = document.getElementById('featuredModal');
  const closeFeaturedModalBtn = document.getElementById('closeFeaturedModal');
  const cancelFeaturedBtn = document.getElementById('cancelFeatured');
  const submitFeaturedBtn = document.getElementById('submitFeatured');
  const clubUpdatesCard = document.querySelector('.feed-card-automation:nth-child(1)');
  const recommendedClubsCard = document.querySelector('.feed-card-automation:nth-child(2)');
  const memberSpotlightsCard = document.querySelector('.feed-card-automation:nth-child(3)');
  
  // Get all modal close buttons
  const closeButtons = document.querySelectorAll('.content-modal-close');
  
  // Function to close any modal
  function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }
  
  // Add click events to cards
  if (clubUpdatesCard) {
    clubUpdatesCard.addEventListener('click', function() {
      document.getElementById('clubUpdatesModal').style.display = 'flex';
    });
  }
  
  if (recommendedClubsCard) {
    recommendedClubsCard.addEventListener('click', function() {
      document.getElementById('recommendedClubsModal').style.display = 'flex';
    });
  }
  
  if (memberSpotlightsCard) {
    memberSpotlightsCard.addEventListener('click', function() {
      document.getElementById('memberSpotlightsModal').style.display = 'flex';
    });
  }
  
  // Add click events to close buttons
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.content-modal-overlay');
      modal.style.display = 'none';
    });
  });
  
  // Close modals when clicking outside
  document.querySelectorAll('.content-modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Function to open modal
  function openFeaturedModal() {
    featuredModal.style.display = 'flex';
  }

  // Function to close modal
  function closeFeaturedModal() {
    featuredModal.style.display = 'none';
  }

  // Add click event to all "Get Featured" buttons
  document.querySelectorAll('.create-btn').forEach(btn => {
    if (btn.textContent.includes('Get Featured')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openFeaturedModal();
      });
    }
  });

  // Close modal when X is clicked
  if (closeFeaturedModalBtn) {
    closeFeaturedModalBtn.addEventListener('click', closeFeaturedModal);
  }

  // Close modal when Cancel is clicked
  if (cancelFeaturedBtn) {
    cancelFeaturedBtn.addEventListener('click', closeFeaturedModal);
  }

  // Submit featured request
 // Replace the existing submit featured request functionality with this enhanced version

// Submit featured request - Enhanced with Firebase integration
if (submitFeaturedBtn) {
    submitFeaturedBtn.addEventListener('click', async function() {
        console.log('🎯 Submit Featured Request clicked');
        
        const clubNameInput = document.querySelector('.featured-input-field');
        const descriptionTextarea = document.querySelector('.featured-textarea');
        const agreeCheckbox = document.getElementById('featured-agree');
        
        const clubName = clubNameInput?.value?.trim();
        const description = descriptionTextarea?.value?.trim();
        
        // Validation
        if (!clubName) {
            alert('Please enter your club name');
            return;
        }
        
        if (!description) {
            alert('Please describe why your club should be featured');
            return;
        }
        
        if (!agreeCheckbox?.checked) {
            alert('Please confirm you want your club to be featured');
            return;
        }
        
        // Check if user is authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('You must be logged in to submit a featured request');
            return;
        }
        
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Submitting...';
        this.disabled = true;
        
        try {
            // Create featured request object
            const featuredRequest = {
                clubName: clubName,
                description: description,
                requestedBy: currentUser.uid,
                requestedByEmail: currentUser.email || 'Unknown',
                requestDate: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending', // pending, approved, rejected
                priority: 'normal', // normal, high, low
                reviewedBy: null,
                reviewedDate: null,
                reviewNotes: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log('📤 Submitting featured request:', featuredRequest);
            
            // Add to Firebase queue
            const docRef = await db.collection('featuredRequests').add(featuredRequest);
            
            console.log('✅ Featured request submitted with ID:', docRef.id);
            
            // Optional: Also add to user's profile for tracking
            try {
                await db.collection('users').doc(currentUser.uid).update({
                    featuredRequests: firebase.firestore.FieldValue.arrayUnion({
                        requestId: docRef.id,
                        clubName: clubName,
                        status: 'pending',
                        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                });
                console.log('✅ Added request to user profile');
            } catch (userUpdateError) {
                console.warn('⚠️ Could not update user profile:', userUpdateError);
                // Don't fail the whole operation if user update fails
            }
            
            // Success notification
     
            
            // Clear the form
            clubNameInput.value = '';
            descriptionTextarea.value = '';
            agreeCheckbox.checked = false;
            
            // Close modal
            closeFeaturedModal();
            
        } catch (error) {
            console.error('❌ Error submitting featured request:', error);
            
            let errorMessage = 'Failed to submit your request. Please try again.';
            
            if (error.code === 'permission-denied') {
                errorMessage = 'You don\'t have permission to submit featured requests.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'Service temporarily unavailable. Please try again later.';
            }
            
            alert(errorMessage);
            
        } finally {
            // Reset button state
            this.textContent = originalText;
            this.disabled = false;
        }
    });
}

// Optional: Function to check if user has already submitted a request for this club
async function checkExistingFeaturedRequest(userId, clubName) {
    try {
        const query = await db.collection('featuredRequests')
            .where('requestedBy', '==', userId)
            .where('clubName', '==', clubName)
            .where('status', '==', 'pending')
            .get();
        
        return !query.empty; // Returns true if there's already a pending request
    } catch (error) {
        console.error('Error checking existing requests:', error);
        return false;
    }
}

// Enhanced submit function with duplicate checking (optional)
async function submitFeaturedRequestWithDuplicateCheck() {
    const clubNameInput = document.querySelector('.featured-input-field');
    const clubName = clubNameInput?.value?.trim();
    const currentUser = auth.currentUser;
    
    if (!clubName || !currentUser) return;
    
    // Check for existing pending requests
    const hasExistingRequest = await checkExistingFeaturedRequest(currentUser.uid, clubName);
    
    if (hasExistingRequest) {
        alert('You already have a pending featured request for this club. Please wait for it to be reviewed.');
        return;
    }
    
    // Continue with normal submission...
}

// Function to get user's featured requests (for displaying in profile/dashboard)
async function getUserFeaturedRequests(userId) {
    try {
        const snapshot = await db.collection('featuredRequests')
            .where('requestedBy', '==', userId)
            .orderBy('requestDate', 'desc')
            .get();
        
        const requests = [];
        snapshot.forEach(doc => {
            requests.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return requests;
    } catch (error) {
        console.error('Error fetching user featured requests:', error);
        return [];
    }
}

// Function for admins to get all pending featured requests
async function getPendingFeaturedRequests() {
    try {
        const snapshot = await db.collection('featuredRequests')
            .where('status', '==', 'pending')
            .orderBy('requestDate', 'asc')
            .get();
        
        const requests = [];
        snapshot.forEach(doc => {
            requests.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return requests;
    } catch (error) {
        console.error('Error fetching pending featured requests:', error);
        return [];
    }
}




// Function for admins to update request status
async function updateFeaturedRequestStatus(requestId, status, reviewNotes = null, reviewerId = null) {
    try {
        const updateData = {
            status: status, // 'approved' or 'rejected'
            reviewedBy: reviewerId,
            reviewedDate: firebase.firestore.FieldValue.serverTimestamp(),
            reviewNotes: reviewNotes,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('featuredRequests').doc(requestId).update(updateData);
        
        console.log(`✅ Featured request ${requestId} status updated to: ${status}`);
        return true;
    } catch (error) {
        console.error('Error updating featured request status:', error);
        return false;
    }
}

  // Close modal when clicking outside
  if (featuredModal) {
    featuredModal.addEventListener('click', function(e) {
      if (e.target === featuredModal) {
        closeFeaturedModal();
      }
    });
  }

  // Function to open modal
  function openStudentCouncilModal() {
    studentCouncilModal.style.display = 'flex';
  }

  // Function to close modal
  function closeStudentCouncilModal() {
    studentCouncilModal.style.display = 'none';
  }

  // Add click event to all "Join Student Council" links
  document.querySelectorAll('.link-item').forEach(item => {
    if (item.textContent.trim() === 'Join Student Council') {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        openStudentCouncilModal();
      });
    }
  });

  // Close modal when X is clicked
  if (closeStudentCouncilModalBtn) {
    closeStudentCouncilModalBtn.addEventListener('click', closeStudentCouncilModal);
  }

// Close modal when Cancel is clicked
// Close modal when Cancel is clicked
if (cancelStudentCouncilBtn) {
  cancelStudentCouncilBtn.addEventListener('click', closeStudentCouncilModal);
}

// Handle form submission
if (sendStudentCouncilBtn) {
  const form = document.getElementById('studentCouncilForm');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const message = document.querySelector('.student-council-textarea').value;
    if (!message) {
      alert('Please write your application message');
      return;
    }
    
    // Update button to show loading state
    sendStudentCouncilBtn.textContent = 'Sending...';
    sendStudentCouncilBtn.disabled = true;
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        sendStudentCouncilBtn.textContent = 'Submitted!';
        setTimeout(() => {
          closeStudentCouncilModal();
          form.reset();
          sendStudentCouncilBtn.textContent = 'Send Application';
          sendStudentCouncilBtn.disabled = false;
        }, 1500);
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      alert('Failed to send application. Please try again.');
      sendStudentCouncilBtn.textContent = 'Send Application';
      sendStudentCouncilBtn.disabled = false;
    }
  });
}

  // Close modal when clicking outside
  if (studentCouncilModal) {
    studentCouncilModal.addEventListener('click', function(e) {
      if (e.target === studentCouncilModal) {
        closeStudentCouncilModal();
      }
    });
  }

    // Comment Modal Functions
    if (commentModal && openCommentModalBtn) {
        function positionCommentModal() {
            const btnRect = openCommentModalBtn.getBoundingClientRect();
            const modalContainer = commentModal.querySelector('.comment-modal-container');
            
            modalContainer.style.position = 'absolute';
            modalContainer.style.top = `${btnRect.bottom + window.scrollY + 5}px`;
            modalContainer.style.right = `${window.innerWidth - btnRect.right}px`;
            modalContainer.style.width = '350px';
            modalContainer.style.transform = 'none';
        }

        function openCommentModal() {
            commentModal.style.display = 'flex';
            positionCommentModal();
        }

        function closeCommentModal() {
            commentModal.style.display = 'none';
        }

        openCommentModalBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = commentModal.style.display === 'flex';
            if (isVisible) {
                closeCommentModal();
            } else {
                openCommentModal();
            }
        });

        if (closeCommentModalBtn) {
            closeCommentModalBtn.addEventListener('click', closeCommentModal);
        }

        document.addEventListener('click', function(e) {
            if (!commentModal.contains(e.target) && e.target !== openCommentModalBtn) {
                closeCommentModal();
            }
        });

        window.addEventListener('resize', positionCommentModal);
    }

    // Notification Dropdown Functions
    if (notifBtn && notifDropdown) {
        function toggleNotifDropdown() {
            const isVisible = notifDropdown.style.display === 'block';
            notifDropdown.style.display = isVisible ? 'none' : 'block';
        }
   window.toggleNotifDropdown = toggleNotifDropdown;
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleNotifDropdown();
        });

        notifTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                notifTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });

        document.addEventListener('click', function(e) {
            if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
                notifDropdown.style.display = 'none';
            }
        });
    }




    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1.02)';
            }
        });

        searchInput.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1)';
            }
        });

        searchInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                console.log('Searching for:', this.value);
            }
        });
    }

    // Navigation interactions
    // Remove the preventDefault() if you want standard link behavior
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
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
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            console.log('Create action:', action);
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Link items functionality
    linkItems.forEach(link => {
        link.addEventListener('click', function() {
            const linkText = this.textContent.trim();
            console.log('Opening link:', linkText);
            
            if (linkText.includes('Android')) {
                console.log('Redirecting to Google Play Store...');
            } else if (linkText.includes('iOS')) {
                console.log('Redirecting to App Store...');
            }
        });
    });

    // Go Live button
    if (goLiveBtn) {
        goLiveBtn.addEventListener('click', function() {
            console.log('Starting live session...');
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background-color: rgba(59, 130, 246, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (rect.width / 2 - size / 2) + 'px';
            ripple.style.top = (rect.height / 2 - size / 2) + 'px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // Create post button
    if (createPostBtn) {
        createPostBtn.addEventListener('click', function() {
            console.log('Creating first post...');
            
            this.textContent = 'Creating post...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = 'Create the first post';
                this.disabled = false;
                console.log('Post creation interface would open here');
            }, 1500);
        });
    }

    // Thin sidebar buttons
    thinSidebarBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            if (index === 0) {
                console.log('Sparkle button clicked');
                this.style.transform = 'scale(0.9) rotate(18deg)';
                setTimeout(() => {
                    this.style.transform = 'scale(1) rotate(0deg)';
                }, 200);
            } else {
                console.log('Plus button clicked');
                this.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });

    // Floating buttons
    if (floatingChat) {
        floatingChat.addEventListener('click', function() {
            console.log('Opening chat...');
            
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }

    // Sort dropdown
    if (sortDropdown) {
        sortDropdown.addEventListener('click', function() {
            console.log('Opening sort options...');
            
            const arrow = this.querySelector('svg');
            if (arrow) {
                arrow.style.transform = arrow.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    }

    // More button
    if (moreBtn) {
        moreBtn.addEventListener('click', function() {
            console.log('Opening more options...');
            
            this.style.transform = 'rotate(90deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 200);
        });
    }

    // Community name dropdown
    if (communityName) {
        communityName.addEventListener('click', function() {
            console.log('Opening community dropdown...');
            
            const arrow = this.querySelector('.dropdown-arrow');
            if (arrow) {
                arrow.style.transform = arrow.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k' && searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        
        if (e.key === 'Escape' && document.activeElement === searchInput && searchInput) {
            searchInput.blur();
            searchInput.value = '';
        }
    });

    // Smooth scrolling for internal navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe welcome section for entrance animation
    if (welcomeSection) {
        welcomeSection.style.opacity = '0';
        welcomeSection.style.transform = 'translateY(30px)';
        welcomeSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(welcomeSection);
    }

    // Profile avatar click handler
    if (profileAvatar) {
        profileAvatar.addEventListener('click', function() {
            console.log('Opening profile menu...');
            
            this.style.animation = 'pulse 0.3s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    }

    // Add pulse animation
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
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
    document.head.appendChild(pulseStyle);

    // Close Getting Started item functionality
    if (closeIcon && closeIcon.parentElement) {
        closeIcon.parentElement.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Closing Getting Started...');
            
            this.style.transform = 'translateX(-100%)';
            this.style.opacity = '0';
            setTimeout(() => {
                this.remove();
            }, 300);
        });
    }

    // Icon button hover effects
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.transform = 'scale(1.1)';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.transform = 'scale(1)';
            }
        });
    });

    // Mobile menu toggle (for responsive design)
    let sidebarOpen = false;

    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebarOpen = !sidebarOpen;
            
            if (sidebarOpen) {
                sidebar.style.transform = 'translateX(0)';
            } else {
                sidebar.style.transform = 'translateX(-100%)';
            }
        }
    }

    // Add mobile menu button for smaller screens
    if (window.innerWidth <= 768) {
        const headerLeft = document.querySelector('.header-left');
        const logo = document.querySelector('.logo');
        
        if (headerLeft && logo) {
            const mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
            mobileMenuBtn.className = 'mobile-menu-btn icon-btn';
            mobileMenuBtn.addEventListener('click', toggleSidebar);
            
            headerLeft.insertBefore(mobileMenuBtn, logo);
        }
    }

    // Window resize handler
    window.addEventListener('resize', function() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (window.innerWidth > 768 && sidebarOpen) {
                sidebar.style.transform = 'translateX(0)';
            } else if (window.innerWidth <= 768) {
                sidebar.style.transform = 'translateX(-100%)';
                sidebarOpen = false;
            }
        }
    });

    // Add subtle entrance animations
    const elements = document.querySelectorAll('.sidebar-item, .nav-item');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });

    // Survey Modal Functionality
    const surveyModal = document.getElementById('surveyModal');
    const openSurveyModalBtn = document.querySelector('.go-live-btn');
    const closeSurveyModalBtn = document.getElementById('closeSurveyModal');
    const cancelSurveyBtn = document.getElementById('cancelSurvey');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const surveyQuestionsContainer = document.getElementById('surveyQuestions');
    const recipientBtns = document.querySelectorAll('.survey-recipient-btn');
    const specificRecipientsInput = document.querySelector('.survey-input-group .survey-input-field[type="text"]');
    const publishSurveyBtn = document.getElementById('publishSurvey');

    if (surveyModal && openSurveyModalBtn) {
        // Open modal when "Post a Survey" is clicked
        openSurveyModalBtn.addEventListener('click', function() {
            surveyModal.classList.add('active');
        });
    }

    // Close modal
    function closeSurveyModal() {
        if (surveyModal) {
            surveyModal.classList.remove('active');
        }
    }

    if (closeSurveyModalBtn) {
        closeSurveyModalBtn.addEventListener('click', closeSurveyModal);
    }

    if (cancelSurveyBtn) {
        cancelSurveyBtn.addEventListener('click', closeSurveyModal);
    }

    // Recipient selection
    if (recipientBtns.length > 0 && specificRecipientsInput) {
        recipientBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                recipientBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                if (this.textContent === 'Specific Members') {
                    specificRecipientsInput.style.display = 'block';
                } else {
                    specificRecipientsInput.style.display = 'none';
                }
            });
        });
    }

    // Question templates
    const questionTemplates = {
        'multiple-choice': `
            <div class="survey-question">
                <div class="survey-question-header">
                    <span class="survey-question-title">Multiple Choice</span>
                    <button class="survey-question-remove">&times;</button>
                </div>
                <input type="text" class="survey-question-input" placeholder="Question text">
                <div class="survey-options-container">
                    <div class="survey-option-input">
                        <input type="text" placeholder="Option 1">
                        <button class="survey-option-remove">&times;</button>
                    </div>
                    <div class="survey-option-input">
                        <input type="text" placeholder="Option 2">
                        <button class="survey-option-remove">&times;</button>
                    </div>
                </div>
                <button class="survey-add-option">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Add option
                </button>
            </div>
        `,
        'short-answer': `
            <div class="survey-question">
                <div class="survey-question-header">
                    <span class="survey-question-title">Short Answer</span>
                    <button class="survey-question-remove">&times;</button>
                </div>
                <input type="text" class="survey-question-input" placeholder="Question text">
                <input type="text" class="survey-question-input" placeholder="Short answer text" disabled>
            </div>
        `,
        'long-answer': `
            <div class="survey-question">
                <div class="survey-question-header">
                    <span class="survey-question-title">Long Answer</span>
                    <button class="survey-question-remove">&times;</button>
                </div>
                <input type="text" class="survey-question-input" placeholder="Question text">
                <textarea class="survey-question-input" placeholder="Long answer text" rows="3" disabled></textarea>
            </div>
        `
    };

    // Add question
    if (addQuestionBtn && surveyQuestionsContainer) {
        addQuestionBtn.addEventListener('click', function() {
            // Create a mini modal to select question type
            const questionTypeModal = document.createElement('div');
            questionTypeModal.style.position = 'fixed';
            questionTypeModal.style.top = '0';
            questionTypeModal.style.left = '0';
            questionTypeModal.style.right = '0';
            questionTypeModal.style.bottom = '0';
            questionTypeModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
            questionTypeModal.style.display = 'flex';
            questionTypeModal.style.justifyContent = 'center';
            questionTypeModal.style.alignItems = 'center';
            questionTypeModal.style.zIndex = '1001';
            
            questionTypeModal.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; width: 300px;">
                    <h3 style="margin-top: 0;">Select Question Type</h3> <br>
                    <button style="display: block; width: 100%; padding: 10px; margin-bottom: 10px; background: white; border: 1px solid #ddd; cursor: pointer;" data-type="multiple-choice">Multiple Choice</button>
                    <button style="display: block; width: 100%; padding: 10px; margin-bottom: 10px; background: white; border: 1px solid #ddd; cursor: pointer;" data-type="short-answer">Short Answer</button>
                    <button style="display: block; width: 100%; padding: 10px; background: white; border: 1px solid #ddd; cursor: pointer;" data-type="long-answer">Long Answer</button>
                </div>
            `;
            
            document.body.appendChild(questionTypeModal);
            
            // Add event listeners to the buttons
            questionTypeModal.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', function() {
                    const type = this.getAttribute('data-type');
                    surveyQuestionsContainer.insertAdjacentHTML('beforeend', questionTemplates[type]);
                    setupQuestionEvents();
                    document.body.removeChild(questionTypeModal);
                });
            });
        });
    }

    // Setup question events (remove, add options)
    function setupQuestionEvents() {
        // Remove question
        document.querySelectorAll('.survey-question-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.survey-question').remove();
            });
        });
        
        // Remove option
        document.querySelectorAll('.survey-option-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.survey-option-input').remove();
            });
        });
        
        // Add option
        document.querySelectorAll('.survey-add-option').forEach(btn => {
            btn.addEventListener('click', function() {
                const optionsContainer = this.closest('.survey-question').querySelector('.survey-options-container');
                if (optionsContainer) {
                    optionsContainer.insertAdjacentHTML('beforeend', `
                        <div class="survey-option-input">
                            <input type="text" placeholder="Option ${optionsContainer.children.length + 1}">
                            <button class="survey-option-remove">&times;</button>
                        </div>
                    `);
                    
                    // Add event to the new remove button
                    optionsContainer.lastElementChild.querySelector('.survey-option-remove').addEventListener('click', function() {
                        this.closest('.survey-option-input').remove();
                    });
                }
            });
        });
    }

    // Publish survey
    if (publishSurveyBtn) {
    publishSurveyBtn.addEventListener('click', async function() {
        try {
            const surveyNameInput = document.querySelector('.survey-input-field');
            const activeRecipientBtn = document.querySelector('.survey-recipient-btn.active');
            
            if (!surveyNameInput || !surveyNameInput.value) {
                alert('Please enter a survey name');
                return;
            }
            
            if (!activeRecipientBtn) {
                alert('Please select recipients');
                return;
            }
            
            const currentUser = auth.currentUser;
            if (!currentUser) {
                alert('You must be logged in to publish a survey');
                return;
            }
            
            // Get current club ID
            const clubId = getCurrentClubId();
            if (!clubId) {
                alert('Unable to determine club. Please try again.');
                return;
            }
            
            const surveyName = surveyNameInput.value;
            const recipients = activeRecipientBtn.textContent;
            const questions = [];
            
            // Collect all questions
            document.querySelectorAll('.survey-question').forEach(questionEl => {
                const questionText = questionEl.querySelector('.survey-question-input');
                const questionTitle = questionEl.querySelector('.survey-question-title');
                
                if (!questionText || !questionText.value || !questionTitle) {
                    return;
                }
                
                const question = {
                    text: questionText.value,
                    type: questionTitle.textContent.toLowerCase().replace(' ', '_') // "multiple choice" -> "multiple_choice"
                };
                
                if (question.type === 'multiple_choice') {
                    question.options = [];
                    questionEl.querySelectorAll('.survey-option-input input').forEach(option => {
                        if (option.value) {
                            question.options.push(option.value);
                        }
                    });
                    
                    if (question.options.length < 2) {
                        alert('Multiple choice questions must have at least 2 options');
                        return;
                    }
                }
                
                questions.push(question);
            });
            
            if (questions.length === 0) {
                alert('Please add at least one question');
                return;
            }
            
            // Show loading state
            publishSurveyBtn.disabled = true;
            publishSurveyBtn.textContent = 'Publishing...';
            
            console.log('Publishing survey:', { surveyName, recipients, questions, clubId });
            
            // Save survey to Firestore
            const surveyData = {
                title: surveyName,
                clubId: clubId,
                questions: questions,
                recipients: recipients,
                createdBy: currentUser.uid,
                createdByEmail: currentUser.email || 'Unknown',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true,
                responses: []
            };
            
            const surveyRef = await db.collection('surveys').add(surveyData);
            console.log('✅ Survey saved with ID:', surveyRef.id);
            
            // Get club information
            const clubDoc = await db.collection('clubs').doc(clubId).get();
            const clubName = clubDoc.exists ? clubDoc.data().name : 'Unknown Club';
            
            // Create notifications for club members
            await createSurveyNotifications(surveyRef.id, surveyData, clubId, clubName, recipients);
            
            alert('Survey published successfully!');
            closeSurveyModal();
            
            // Reset form
            resetSurveyForm();
            
        } catch (error) {
            console.error('❌ Error publishing survey:', error);
            alert('Error publishing survey. Please try again.');
        } finally {
            // Reset button state
            publishSurveyBtn.disabled = false;
            publishSurveyBtn.textContent = 'Publish Survey';
        }
    });
}
async function createSurveyNotifications(surveyId, surveyData, clubId, clubName, recipients) {
    try {
        console.log('📢 Creating survey notifications for club:', clubName);
        
        let memberIds = [];
        
        if (recipients === 'All Members') {
            // Get all club members
            const clubDoc = await db.collection('clubs').doc(clubId).get();
            if (clubDoc.exists) {
                memberIds = clubDoc.data().members || [];
            }
        } else if (recipients === 'Specific Members') {
            // Get specific members from input (you might need to implement member selection)
            const specificInput = document.querySelector('.survey-input-group .survey-input-field[type="text"]');
            if (specificInput && specificInput.value) {
                // Parse member emails/names from input
                const memberInputs = specificInput.value.split(',').map(m => m.trim());
                // You'll need to convert these to user IDs - this is a simplified version
                memberIds = memberInputs;
            }
        }
        
        console.log(`📋 Creating notifications for ${memberIds.length} members`);
        
        // Create notification for each member
        const batch = db.batch();
        const notificationPromises = [];
        
        for (const memberId of memberIds) {
            const notification = {
                userId: memberId,
                type: 'survey_published',
                title: 'New Survey Available',
                message: `${clubName} has published a new survey: "${surveyData.title}"`,
                surveyId: surveyId,
                surveyTitle: surveyData.title,
                clubId: clubId,
                clubName: clubName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false,
                priority: 'normal'
            };
            
            // Add to batch
            const notifRef = db.collection('notifications').doc();
            batch.set(notifRef, notification);
            
            // Also add to UI immediately if this is the current user
            const currentUser = auth.currentUser;
            if (currentUser && memberId === currentUser.uid) {
                notification.id = notifRef.id;
                addSurveyNotificationToUI(notification);
            }
        }
        
        // Commit all notifications
        await batch.commit();
        console.log('✅ Survey notifications created successfully');
        
    } catch (error) {
        console.error('❌ Error creating survey notifications:', error);
    }
}

// Function to add survey notification to UI
async function addSurveyNotificationToUI(notification) {
    try {
        console.log('🎨 Adding survey notification to UI:', notification.surveyTitle);
        
        const notifDropdown = document.querySelector('#notifDropdown');
        if (!notifDropdown) {
            console.warn('❌ #notifDropdown not found in DOM');
            return;
        }
        
        let notificationsContainer = notifDropdown.querySelector('.notifications-container');
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.className = 'notifications-container';
            
            const tabsElement = notifDropdown.querySelector('.notif-tabs');
            if (tabsElement) {
                tabsElement.insertAdjacentElement('afterend', notificationsContainer);
            } else {
                notifDropdown.appendChild(notificationsContainer);
            }
        }
        
        // Remove "no notifications" message if it exists
        const noNotifMsg = notificationsContainer.querySelector('.no-notifications');
        if (noNotifMsg) {
            noNotifMsg.remove();
        }
        
        const notificationId = notification.id || 'temp-' + Date.now();
        
        // Create survey notification HTML
        const notificationHTML = `
            <div class="notification-item unread survey-notification" data-club-id="${notification.clubId}" data-notification-id="${notificationId}">
                <div class="notification-avatar">
                    <div class="club-avatar" style="background: ${getClubColor(notification.clubName)};">
                        📋
                    </div>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <span class="notification-title">${notification.title}</span>
                        <span class="notification-time">just now</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-meta">📊 Survey: ${notification.surveyTitle}</div>
                </div>
                <div class="notification-actions">
                    <button class="notification-action-btn take-survey-btn" 
                            onclick="openSurveyModal('${notification.surveyId}', '${notification.surveyTitle}')"
                            title="Take the survey">
                        Take Survey
                    </button>
                    <button class="notification-action-btn mark-read-btn" 
                            onclick="markNotificationAsRead('${notificationId}')"
                            title="Mark as read">
                        ✓
                    </button>
                </div>
            </div>
        `;
        
        // Add to top of notifications
        notificationsContainer.insertAdjacentHTML('afterbegin', notificationHTML);
        
        console.log('✅ Survey notification added to UI');
        
        // Update notification count
        updateNotificationCount();
        
        // Show toast notification
        showToastNotification(`New survey available: "${notification.surveyTitle}"`);
        
    } catch (error) {
        console.error('❌ Error adding survey notification to UI:', error);
    }
}

// Function to open survey taking modal
window.openSurveyModal = async function(surveyId, surveyTitle) {
    try {
        console.log('📋 Opening survey modal for:', surveyTitle);
        
        // Fetch survey data from Firestore
        const surveyDoc = await db.collection('surveys').doc(surveyId).get();
        if (!surveyDoc.exists) {
            alert('Survey not found');
            return;
        }
        
        const surveyData = surveyDoc.data();
        console.log('📊 Survey data:', surveyData);
        
        // Remove existing modal if present
        const existingModal = document.querySelector('.survey-taking-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const surveyModal = document.createElement('div');
        surveyModal.className = 'survey-taking-modal';
        surveyModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        // Build questions HTML
        let questionsHTML = '';
        surveyData.questions.forEach((question, index) => {
            questionsHTML += `
                <div class="survey-question-container" style="margin-bottom: 24px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                    <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #333;">
                        ${index + 1}. ${question.text}
                    </label>
            `;
            
            if (question.type === 'multiple_choice') {
                question.options.forEach((option, optionIndex) => {
                    questionsHTML += `
                        <div style="margin-bottom: 8px;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="radio" name="question_${index}" value="${option}" style="margin-right: 10px;">
                                <span>${option}</span>
                            </label>
                        </div>
                    `;
                });
            } else if (question.type === 'short_answer') {
                questionsHTML += `
                    <input type="text" class="survey-answer" data-question="${index}" placeholder="Your answer..." style="
                        width: 100%; 
                        padding: 12px; 
                        border: 1px solid #ddd; 
                        border-radius: 6px;
                        font-family: inherit;
                    ">
                `;
            } else if (question.type === 'long_answer') {
                questionsHTML += `
                    <textarea class="survey-answer" data-question="${index}" placeholder="Your detailed answer..." style="
                        width: 100%; 
                        height: 80px; 
                        padding: 12px; 
                        border: 1px solid #ddd; 
                        border-radius: 6px;
                        resize: vertical;
                        font-family: inherit;
                    "></textarea>
                `;
            }
            
            questionsHTML += '</div>';
        });
        
        surveyModal.innerHTML = `
            <div class="survey-modal-content" style="
                background: white; 
                padding: 30px; 
                border-radius: 12px; 
                width: 600px; 
                max-width: 90vw; 
                max-height: 90vh; 
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #333; flex: 1;">📋 ${surveyData.title}</h3>
                    <button onclick="closeSurveyTakingModal()" style="
                        background: none; 
                        border: none; 
                        font-size: 24px; 
                        cursor: pointer;
                        color: #666;
                        padding: 5px;
                        border-radius: 50%;
                    ">&times;</button>
                </div>
                
                <div class="survey-questions">
                    ${questionsHTML}
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button onclick="closeSurveyTakingModal()" style="
                        padding: 12px 24px; 
                        background: #f5f5f5; 
                        border: 1px solid #ddd; 
                        border-radius: 6px; 
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel</button>
                    <button onclick="submitSurveyResponse('${surveyId}')" style="
                        padding: 12px 24px; 
                        background: #2196f3; 
                        color: white; 
                        border: none; 
                        border-radius: 6px; 
                        cursor: pointer;
                        font-weight: 500;
                    ">Submit Survey</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(surveyModal);
        window.currentSurveyModal = surveyModal;
        
        // Close modal when clicking outside
        surveyModal.addEventListener('click', function(e) {
            if (e.target === surveyModal) {
                closeSurveyTakingModal();
            }
        });
        
    } catch (error) {
        console.error('❌ Error opening survey modal:', error);
        alert('Error loading survey. Please try again.');
    }
};

// Function to close survey taking modal
window.closeSurveyTakingModal = function() {
    const modal = document.querySelector('.survey-taking-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    window.currentSurveyModal = null;
};

// Function to submit survey response
window.submitSurveyResponse = async function(surveyId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('You must be logged in to submit a survey');
            return;
        }
        
        const modal = window.currentSurveyModal;
        if (!modal) return;
        
        // Collect answers
        const answers = [];
        const questionContainers = modal.querySelectorAll('.survey-question-container');
        
        questionContainers.forEach((container, index) => {
            const radioInputs = container.querySelectorAll('input[type="radio"]');
            const textInput = container.querySelector('.survey-answer');
            
            let answer = '';
            
            if (radioInputs.length > 0) {
                // Multiple choice
                const selectedRadio = container.querySelector('input[type="radio"]:checked');
                answer = selectedRadio ? selectedRadio.value : '';
            } else if (textInput) {
                // Text input
                answer = textInput.value.trim();
            }
            
            answers.push({
                questionIndex: index,
                answer: answer
            });
        });
        
        // Validate that at least some questions are answered
        const answeredQuestions = answers.filter(a => a.answer !== '').length;
        if (answeredQuestions === 0) {
            alert('Please answer at least one question');
            return;
        }
        
        // Show loading state
        const submitBtn = modal.querySelector('[onclick*="submitSurveyResponse"]');
        if (submitBtn) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }
        
        // Save response to Firestore
        await db.collection('surveyResponses').add({
            surveyId: surveyId,
            userId: currentUser.uid,
            userEmail: currentUser.email || 'Unknown',
            answers: answers,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Survey response submitted successfully');
        
        // Show success message
        const modalContent = modal.querySelector('.survey-modal-content');
        modalContent.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                <h3 style="color: #4caf50; margin-bottom: 10px;">Thank You!</h3>
                <p style="color: #666; margin-bottom: 20px;">Your survey response has been submitted successfully.</p>
                <button onclick="closeSurveyTakingModal()" style="
                    padding: 12px 24px; 
                    background: #4caf50; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer;
                    font-weight: 500;
                ">Close</button>
            </div>
        `;
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            closeSurveyTakingModal();
        }, 3000);
        
        // Mark the survey notification as read
        const surveyNotifs = document.querySelectorAll('.notification-item.survey-notification');
        surveyNotifs.forEach(notif => {
            const takeSurveyBtn = notif.querySelector(`[onclick*="${surveyId}"]`);
            if (takeSurveyBtn) {
                const notifId = notif.dataset.notificationId;
                if (notifId && !notifId.startsWith('temp-') && typeof markNotificationAsRead === 'function') {
                    markNotificationAsRead(notifId);
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error submitting survey response:', error);
        alert('Error submitting survey. Please try again.');
        
        // Reset button
        const submitBtn = window.currentSurveyModal?.querySelector('[onclick*="submitSurveyResponse"]');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Survey';
            submitBtn.disabled = false;
        }
    }
};

// Function to reset survey form
function resetSurveyForm() {
    const surveyQuestionsContainer = document.getElementById('surveyQuestions');
    const surveyNameInput = document.querySelector('.survey-input-field');
    const specificRecipientsInput = document.querySelector('.survey-input-group .survey-input-field[type="text"]');
    const recipientBtns = document.querySelectorAll('.survey-recipient-btn');
    
    if (surveyQuestionsContainer) {
        surveyQuestionsContainer.innerHTML = '';
    }
    if (surveyNameInput) {
        surveyNameInput.value = '';
    }
    if (specificRecipientsInput) {
        specificRecipientsInput.style.display = 'none';
        specificRecipientsInput.value = '';
    }
    if (recipientBtns.length > 0) {
        recipientBtns[0].classList.add('active');
        recipientBtns.forEach((btn, index) => {
            if (index !== 0) btn.classList.remove('active');
        });
    }
}

// Enhanced CSS for survey notifications
const surveyNotificationStyles = document.createElement('style');
surveyNotificationStyles.textContent = `
   .survey-notification {
       border-left: 4px solid #2196f3 !important;
       background: linear-gradient(135deg, #e3f2fd 0%, #f3f9ff 100%) !important;
       border-radius: 12px !important;
       box-shadow: 0 4px 20px rgba(33, 150, 243, 0.12) !important;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
       position: relative !important;
       overflow: hidden !important;
       backdrop-filter: blur(10px) !important;
   }

   .survey-notification::before {
       content: '';
       position: absolute;
       top: 0;
       left: 0;
       right: 0;
       height: 2px;
       background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.4), transparent);
   }

   .survey-notification:hover {
       transform: translateY(-3px) !important;
       box-shadow: 0 8px 35px rgba(33, 150, 243, 0.2) !important;
   }

   .take-survey-btn {
       background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%) !important;
       color: white !important;
       border: none !important;
       border-radius: 8px !important;
       font-weight: 500 !important;
       padding: 12px 24px !important;
       font-size: 14px !important;
       letter-spacing: 0.3px !important;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
       position: relative !important;
       overflow: hidden !important;
       box-shadow: 0 3px 12px rgba(33, 150, 243, 0.25) !important;
       cursor: pointer !important;
   }

   .take-survey-btn::before {
       content: '';
       position: absolute;
       top: 0;
       left: -100%;
       width: 100%;
       height: 100%;
       background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
       transition: left 0.6s ease;
   }

   .take-survey-btn:hover:not(:disabled) {
       background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
       transform: translateY(-2px) !important;
       box-shadow: 0 6px 25px rgba(33, 150, 243, 0.35) !important;
   }

   .take-survey-btn:hover:not(:disabled)::before {
       left: 100%;
   }

   .take-survey-btn:active {
       transform: translateY(0) !important;
       transition: transform 0.1s ease !important;
   }

   @keyframes fadeIn {
       from { 
           opacity: 0;
           transform: translateY(15px) scale(0.95);
       }
       to { 
           opacity: 1;
           transform: translateY(0) scale(1);
       }
   }

   @keyframes fadeOut {
       from { 
           opacity: 1;
           transform: translateY(0) scale(1);
       }
       to { 
           opacity: 0;
           transform: translateY(-15px) scale(0.95);
       }
   }

   @keyframes slideIn {
       from {
           opacity: 0;
           transform: translateY(-40px) scale(0.92);
           filter: blur(8px);
       }
       to {
           opacity: 1;
           transform: translateY(0) scale(1);
           filter: blur(0px);
       }
   }

   .survey-taking-modal .survey-question-container {
       border-radius: 12px !important;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
       border: 2px solid transparent !important;
       background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%) !important;
   }

   .survey-taking-modal .survey-question-container:hover {
       background: linear-gradient(135deg, #f0f4ff 0%, #e8f2ff 100%) !important;
       border-color: rgba(33, 150, 243, 0.3) !important;
       box-shadow: 0 4px 15px rgba(33, 150, 243, 0.1) !important;
       transform: translateY(-2px) !important;
   }

   .survey-taking-modal input[type="radio"] {
       width: 20px !important;
       height: 20px !important;
       accent-color: #2196f3 !important;
       transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
       cursor: pointer !important;
   }

   .survey-taking-modal input[type="radio"]:hover {
       transform: scale(1.15) !important;
       filter: drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3)) !important;
   }

   .survey-taking-modal input[type="text"],
   .survey-taking-modal textarea {
       border: 2px solid #e0e0e0 !important;
       border-radius: 8px !important;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
       background: rgba(255, 255, 255, 0.9) !important;
       padding: 12px 16px !important;
       font-size: 14px !important;
   }

   .survey-taking-modal input[type="text"]:focus,
   .survey-taking-modal textarea:focus {
       border-color: #2196f3 !important;
       outline: none !important;
       box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.15) !important;
       background: white !important;
       transform: translateY(-1px) !important;
   }

   .survey-taking-modal input[type="text"]:hover,
   .survey-taking-modal textarea:hover {
       border-color: rgba(33, 150, 243, 0.6) !important;
       box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1) !important;
   }

   /* Slider Improvements */
   .survey-slider {
       -webkit-appearance: none !important;
       appearance: none !important;
       width: 100% !important;
       height: 8px !important;
       background: linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 100%) !important;
       border-radius: 50px !important;
       outline: none !important;
       cursor: pointer !important;
       transition: all 0.3s ease !important;
   }

   .survey-slider::-webkit-slider-thumb {
       -webkit-appearance: none !important;
       appearance: none !important;
       width: 24px !important;
       height: 24px !important;
       background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%) !important;
       border-radius: 50% !important;
       cursor: pointer !important;
       box-shadow: 0 3px 12px rgba(33, 150, 243, 0.3) !important;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
       border: 3px solid white !important;
   }

   .survey-slider::-webkit-slider-thumb:hover {
       transform: scale(1.2) !important;
       box-shadow: 0 5px 20px rgba(33, 150, 243, 0.4) !important;
   }

   .slider-value {
       background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%) !important;
       color: white !important;
       padding: 6px 12px !important;
       border-radius: 12px !important;
       font-weight: 600 !important;
       font-size: 14px !important;
       min-width: 28px !important;
       text-align: center !important;
       box-shadow: 0 3px 12px rgba(33, 150, 243, 0.25) !important;
       transition: all 0.3s ease !important;
       display: inline-block !important;
   }
`;
document.head.appendChild(surveyNotificationStyles);

console.log('✅ Enhanced Survey Notification System loaded');

    // Function to dynamically load club tabs
async function loadClubTabs() {
    const tabsContainer = document.querySelector('.notif-tabs');
    
    if (!tabsContainer) {
        console.error('Notification tabs container not found');
        return;
    }

    try {
        // Show loading state
        const allTab = tabsContainer.querySelector('.notif-tab.active');
        if (allTab) {
            allTab.textContent = 'Loading...';
        }

        // Get all clubs from Firestore
        const clubsRef = db.collection('clubs');
        const snapshot = await clubsRef.orderBy('name').get();
        
        // Clear existing tabs except "All"
        const existingTabs = tabsContainer.querySelectorAll('.notif-tab:not(.active)');
        existingTabs.forEach(tab => tab.remove());
        
        // Reset "All" tab text
        if (allTab) {
            allTab.textContent = 'All';
        }
        
        // Add club tabs
        snapshot.forEach(doc => {
            const club = doc.data();
            const clubName = club.name;
            
            if (clubName) {
                const tabButton = document.createElement('button');
                tabButton.className = 'notif-tab';
                tabButton.textContent = clubName;
                tabButton.setAttribute('data-club-id', doc.id);
                
                // Add click handler for club tab
                tabButton.addEventListener('click', function() {
                    // Remove active class from all tabs
                    tabsContainer.querySelectorAll('.notif-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Filter notifications by club (you can implement this)
                    filterNotificationsByClub(doc.id, clubName);
                });
                
                tabsContainer.appendChild(tabButton);
            }
        });

        // Add click handler for "All" tab
        if (allTab && !allTab.hasAttribute('data-listener-added')) {
            allTab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabsContainer.querySelectorAll('.notif-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active class to "All" tab
                this.classList.add('active');
                
                // Show all notifications
                showAllNotifications();
            });
            allTab.setAttribute('data-listener-added', 'true');
        }

        console.log(`Loaded ${snapshot.size} club tabs`);

    } catch (error) {
        console.error('Error loading club tabs:', error);
        
        // Reset "All" tab on error
        if (allTab) {
            allTab.textContent = 'All';
        }
    }
}

// Function to filter notifications by club
function filterNotificationsByClub(clubId, clubName) {
    console.log(`Filtering notifications for club: ${clubName} (ID: ${clubId})`);
    
    // Get all notification items
    const notificationItems = document.querySelectorAll('.notification-item');
    
    notificationItems.forEach(item => {
        // Check if notification belongs to this club
        const itemClubId = item.getAttribute('data-club-id');
        
        if (itemClubId === clubId) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update page title or header if needed
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = `${clubName} Notifications`;
    }
}

// Function to show all notifications
function showAllNotifications() {
    console.log('Showing all notifications');
    
    // Show all notification items
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.style.display = 'block';
    });
    
    // Reset page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'All Notifications';
    }
}

// Function to load clubs that user is a member of only
async function loadUserClubTabs(userId) {
    console.log('🔍 Starting loadUserClubTabs for user:', userId);
    
    const tabsContainer = document.querySelector('.notif-tabs');
    
    if (!tabsContainer) {
        console.error('❌ Notification tabs container not found');
        return;
    }

    try {
        console.log('📖 Getting user document...');
        
        // Get user's clubs
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log('❌ User document not found for userId:', userId);
            return;
        }

        const userData = userDoc.data();
        console.log('👤 User data:', userData);
        
        const userClubs = userData.clubs || [];
        console.log('🏠 User clubs array:', userClubs);
        
        if (userClubs.length === 0) {
            console.log('⚠️ User is not a member of any clubs');
            return;
        }

        // Show loading state
        const allTab = tabsContainer.querySelector('.notif-tab.active');
        if (allTab) {
            allTab.textContent = 'Loading...';
            console.log('⏳ Set loading state');
        }

        console.log('🔎 Querying clubs collection for user\'s clubs...');
        
        // Get clubs that user is a member of
        const clubsRef = db.collection('clubs');
        const snapshot = await clubsRef
            .where(firebase.firestore.FieldPath.documentId(), 'in', userClubs.slice(0, 10))
            .get(); // Remove orderBy temporarily to debug
        
        console.log('📊 Clubs query result - size:', snapshot.size);
        
        // Clear existing tabs except "All"
        const existingTabs = tabsContainer.querySelectorAll('.notif-tab:not(.active)');
        console.log('🗑️ Removing', existingTabs.length, 'existing tabs');
        existingTabs.forEach(tab => tab.remove());
        
        // Reset "All" tab text
        if (allTab) {
            allTab.textContent = 'All';
        }
        
        // Add club tabs for user's clubs only
        let tabsAdded = 0;
        snapshot.forEach(doc => {
            const club = doc.data();
            const clubName = club.name;
            console.log('🏠 Processing club:', clubName, 'ID:', doc.id);
            
            if (clubName) {
                const tabButton = document.createElement('button');
                tabButton.className = 'notif-tab';
                tabButton.textContent = clubName;
                tabButton.setAttribute('data-club-id', doc.id);
                
                // Add click handler for club tab
                tabButton.addEventListener('click', function() {
                    console.log('🔘 Club tab clicked:', clubName);
                    
                    // Remove active class from all tabs
                    tabsContainer.querySelectorAll('.notif-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Filter notifications by club
                    filterNotificationsByClub(doc.id, clubName);
                });
                
                tabsContainer.appendChild(tabButton);
                tabsAdded++;
                console.log('✅ Added tab for:', clubName);
            } else {
                console.log('⚠️ Club has no name:', doc.id);
            }
        });

        console.log('🎯 Total tabs added:', tabsAdded);

        // Add click handler for "All" tab if not already added
        if (allTab && !allTab.hasAttribute('data-listener-added')) {
            allTab.addEventListener('click', function() {
                console.log('🔘 All tab clicked');
                
                // Remove active class from all tabs
                tabsContainer.querySelectorAll('.notif-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active class to "All" tab
                this.classList.add('active');
                
                // Show all notifications
                showAllNotifications();
            });
            allTab.setAttribute('data-listener-added', 'true');
            console.log('✅ Added click handler for All tab');
        }

        console.log('🎉 Successfully loaded', tabsAdded, 'user club tabs');

    } catch (error) {
        console.error('❌ Error loading user club tabs:', error);
        
        // Reset "All" tab on error
        const allTab = tabsContainer.querySelector('.notif-tab.active');
        if (allTab) {
            allTab.textContent = 'All';
        }
    }
}

// Also add this debug function to check Firebase connection
async function debugFirebaseConnection() {
    try {
        console.log('🔍 Testing Firebase connection...');
        const testDoc = await db.collection('users').limit(1).get();
        console.log('✅ Firebase connected, found', testDoc.size, 'documents');
        return true;
    } catch (error) {
        console.error('❌ Firebase connection error:', error);
        return false;
    }
}

auth.onAuthStateChanged(async (user) => {
    console.log('🔐 Auth state changed. User:', user ? user.uid : 'null');
    
    if (user) {
        console.log('👤 User authenticated:', user.uid);
        console.log('📧 User email:', user.email);
        
        // Test Firebase connection first
        const connected = await debugFirebaseConnection();
        if (!connected) {
            console.error('❌ Cannot connect to Firebase');
            return;
        }
        
        // Load user clubs
        loadUserClubsMini(user.uid);
        
        // Wait a bit for Firebase to be fully ready
        setTimeout(() => {
            console.log('⏰ Starting club tabs loading after delay...');
            loadUserClubTabs(user.uid);
        }, 1000);
        
    } else {
        console.log('❌ User not authenticated - not loading club tabs');
    }
});

// Call this function when the page loads


       async function loadClubsFromFirebase() {
    try {
        const db = firebase.firestore();
        const querySnapshot = await db.collection("featuredRequests")
            .orderBy("createdAt", "desc") // Newest first
            .limit(3) // Get 3 to check if we need to delete
            .get();

        const clubsHTML = [];
        let count = 0;
        
        // Process and keep only the 2 newest clubs
        querySnapshot.forEach((doc) => {
            if (count < 2) { // Only show 2 most recent
                const data = doc.data();
                clubsHTML.push(`
                    <div class="feed-card feed-card-half">                     
                        <h3 class="feed-card-title-sm">${data.clubName}</h3>                     
                        <p class="feed-card-description" style="width: 340px;">${data.description}</p>                 
                    </div>
                `);
                count++;
            } else {
                // Delete older clubs (3rd and beyond)
                db.collection("featuredRequests").doc(doc.id).delete()
                    .then(() => console.log("Deleted old club:", doc.id))
                    .catch(err => console.error("Error deleting old club:", err));
            }
        });

        // Insert the 2 newest club cards
        const container = document.getElementById('clubs-container');
        if (container) {
            container.innerHTML = clubsHTML.join('');
            
            // Add CSS to display side by side
            const style = document.createElement('style');
            style.textContent = `
                
                .feed-card-half {
                    flex: 1;
                    min-width: 400px;
                }
            `;
            document.head.appendChild(style);
        }
        
    } catch (error) {
        console.error("Error loading clubs:", error);
        const container = document.getElementById('clubs-container');
        if (container) {
            container.innerHTML = '<p>Error loading featured clubs. Please try again later.</p>';
        }
    }
}

        loadClubsFromFirebase();

        // Event Notification System - Enhanced with RSVP functionality

// Function to listen for new events and create notifications
function setupEventNotifications(userId) {
    console.log('🔔 Setting up event notifications for user:', userId);
    
    // First, get user's clubs
    db.collection('users').doc(userId).get()
        .then(userDoc => {
            if (!userDoc.exists) {
                console.log('User document not found');
                return;
            }
            
            const userData = userDoc.data();
            const userClubs = userData.clubs || [];
            console.log('👤 User clubs:', userClubs);
            
            if (userClubs.length === 0) {
                console.log('User is not a member of any clubs');
                return;
            }
            
            // Listen for events in user's clubs
            userClubs.forEach(clubId => {
                listenForClubEvents(userId, clubId);
            });
        })
        .catch(error => {
            console.error('Error getting user clubs:', error);
        });
}



// Function to listen for events in a specific club
function listenForClubEvents(userId, clubId) {
    console.log('👂 Listening for events in club:', clubId);
    
    // Listen for new events in this club
    db.collection('events')
        .where('clubId', '==', clubId)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const eventData = change.doc.data();
                    const eventId = change.doc.id;
                    
                    console.log('🆕 New event detected:', eventData);
                    
                    // Check if this is a newly created event (not just loaded on page refresh)
                    const eventCreatedAt = eventData.createdAt?.toDate();
                    const now = new Date();
                    const timeDiff = now - eventCreatedAt;
                    
                    // Only create notification for events created in the last 5 minutes
                    if (timeDiff < 5 * 60 * 1000) { // 5 minutes in milliseconds
                        createEventNotification(userId, eventData, eventId);
                    }
                }
            });
        }, (error) => {
            console.error('Error listening to events:', error);
        });
}

// Function to create a notification for a new event
async function createEventNotification(userId, eventData, eventId) {
    try {
        console.log('📝 Creating notification for event:', eventData);
        
        // Get club name for the notification
        let clubName = eventData.clubName || 'Unknown Club';
        
        // If clubName is not in the event, get it from clubs collection
        if (!eventData.clubName && eventData.clubId) {
            try {
                const clubDoc = await db.collection('clubs').doc(eventData.clubId).get();
                if (clubDoc.exists) {
                    clubName = clubDoc.data().name || 'Unknown Club';
                }
            } catch (error) {
                console.warn('Could not fetch club name:', error);
            }
        }
        
        // Create notification object
        const notification = {
            userId: userId,
            type: 'event_scheduled',
            title: 'New Event Scheduled',
            message: `${clubName} has scheduled a new event: "${eventData.title || 'Untitled Event'}"`,
            eventId: eventId,
            clubId: eventData.clubId,
            clubName: clubName,
            eventTitle: eventData.title,
            eventDate: eventData.date,
            eventTime: eventData.startTime || eventData.endTime,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
            priority: 'normal'
        };
        
        console.log('💾 Saving notification:', notification);
        
        // Save notification to Firestore
        await db.collection('notifications').add(notification);
        
        // Add notification to the UI immediately
        addNotificationToUI(notification);
        
        console.log('✅ Event notification created successfully');
        
    } catch (error) {
        console.error('❌ Error creating event notification:', error);
    }
}

// Function to check if user has already RSVPed to an event
async function checkUserRSVP(userId, eventId) {
    try {
        const eventDoc = await db.collection('events').doc(eventId).get();
        if (!eventDoc.exists) return false;
        
        const eventData = eventDoc.data();
        const attendees = eventData.attendees || [];
        
        return attendees.includes(userId);
    } catch (error) {
        console.error('Error checking RSVP status:', error);
        return false;
    }
}

// Function to handle RSVP action
window.handleRSVP = async function(eventId, notificationElement) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('User not authenticated');
            return;
        }
        
        const userId = currentUser.uid;
        const rsvpBtn = notificationElement.querySelector('.rsvp-btn');
        const attendeeCount = notificationElement.querySelector('.attendee-count');
        
        // Disable button during processing
        rsvpBtn.disabled = true;
        rsvpBtn.textContent = 'Processing...';
        
        // Check current RSVP status
        const hasRSVPed = await checkUserRSVP(userId, eventId);
        
        const eventRef = db.collection('events').doc(eventId);
        
        if (hasRSVPed) {
            // Remove RSVP
            await eventRef.update({
                attendees: firebase.firestore.FieldValue.arrayRemove(userId),
                attendeeCount: firebase.firestore.FieldValue.increment(-1)
            });
            
            rsvpBtn.textContent = 'RSVP';
            rsvpBtn.classList.remove('rsvped');
            
            // Update attendee count display
            const currentCount = parseInt(attendeeCount.textContent) || 0;
            attendeeCount.textContent = Math.max(0, currentCount - 1);
            
            console.log('✅ RSVP removed successfully');
        } else {
            // Add RSVP
            await eventRef.update({
                attendees: firebase.firestore.FieldValue.arrayUnion(userId),
                attendeeCount: firebase.firestore.FieldValue.increment(1)
            });
            
            rsvpBtn.textContent = 'RSVPed ✓';
            rsvpBtn.classList.add('rsvped');
            
            // Update attendee count display
            const currentCount = parseInt(attendeeCount.textContent) || 0;
            attendeeCount.textContent = currentCount + 1;
            
            console.log('✅ RSVP added successfully');
        }
        
        rsvpBtn.disabled = false;
        
    } catch (error) {
        console.error('❌ Error handling RSVP:', error);
        
        // Re-enable button and reset text
        const rsvpBtn = notificationElement.querySelector('.rsvp-btn');
        rsvpBtn.disabled = false;
        rsvpBtn.textContent = 'RSVP';
    }
};

// Function to add notification to the UI
async function addNotificationToUI(notification) {
    // Find or create a notifications container AFTER the tabs
    const notifDropdown = document.querySelector('#notifDropdown');
    
    if (!notifDropdown) {
        console.warn('❌ #notifDropdown not found in DOM');
        return;
    }

    // Look for existing notifications container
    let notificationsContainer = notifDropdown.querySelector('.notifications-container');
    
    if (!notificationsContainer) {
        // Create notifications container after any existing tabs
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        
        // Find where to insert it (after tabs if they exist)
        const tabsElement = notifDropdown.querySelector('.notif-tabs') || 
                           notifDropdown.querySelector('[class*="tab"]');
        
        if (tabsElement && tabsElement.parentElement === notifDropdown) {
            // Insert after the tabs element
            tabsElement.insertAdjacentElement('afterend', notificationsContainer);
        } else {
            // If no tabs found, append to end
            notifDropdown.appendChild(notificationsContainer);
        }
        
        console.log('✅ Created notifications container');
    }
    
    // Format the event date and time
    let eventDateTime = '';
    if (notification.eventDate) {
        eventDateTime = notification.eventDate;
        if (notification.eventTime) {
            eventDateTime += ` at ${notification.eventTime}`;
        }
    }
    
    // Check if current user has RSVPed (for existing notifications)
    const currentUser = auth.currentUser;
    let hasRSVPed = false;
    let attendeeCount = 0;
    
    if (currentUser && notification.eventId) {
        try {
            const eventDoc = await db.collection('events').doc(notification.eventId).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                const attendees = eventData.attendees || [];
                hasRSVPed = attendees.includes(currentUser.uid);
                attendeeCount = eventData.attendeeCount || attendees.length || 0;
            }
        } catch (error) {
            console.warn('Could not fetch RSVP status:', error);
        }
    }
    
    const notificationId = notification.id || 'temp-' + Date.now();
    
    // Create notification HTML with improved layout
    const notificationHTML = `
        <div class="notification-item ${notification.read ? '' : 'unread'}" data-club-id="${notification.clubId}" data-notification-id="${notificationId}">
            <div class="notification-avatar">
                <div class="club-avatar" style="background: ${getClubColor(notification.clubName)};">
                    ${notification.clubName.charAt(0).toUpperCase()}
                </div>
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${notification.title}</span>
                    <span class="notification-time">just now</span>
                </div>
                <p class="notification-message">${notification.message}</p>
                ${eventDateTime ? `<div class="notification-meta">📅 ${eventDateTime}</div>` : ''}
                <div class="notification-stats">
                    <span class="attendee-info">👥 <span class="attendee-count">${attendeeCount}</span> attending</span>
                </div>
            </div>
            <div class="notification-actions">
                <button class="notification-action-btn rsvp-btn ${hasRSVPed ? 'rsvped' : ''}" 
                        onclick="handleRSVP('${notification.eventId}', this.closest('.notification-item'))"
                        title="${hasRSVPed ? 'You have RSVPed' : 'RSVP to this event'}">
                    ${hasRSVPed ? 'RSVPed ✓' : 'RSVP'}
                </button>
                <button class="notification-action-btn mark-read-btn" 
                        onclick="markNotificationAsRead('${notificationId}')"
                        title="Mark as read">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="notification-action-btn view-btn" 
                        onclick="viewEvent('${notification.eventId}')"
                        title="View event details">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Add to notifications container instead of directly to dropdown
    notificationsContainer.insertAdjacentHTML('afterbegin', notificationHTML);
    
    // Update notification count
    updateNotificationCount();
    
    // Show a brief toast notification
    showToastNotification(`New event scheduled in ${notification.clubName}`);
}

// Gets the club ID from your current context (page URL, selected club, etc.)
function getCurrentClubId() {
    console.log('Debug: Trying to get current club ID...');
    
    // Method 1: URL parameter
    if (window.location.pathname.includes('club.html')) {
        const clubId = new URLSearchParams(window.location.search).get('id');
        console.log('Debug: Found club ID in URL:', clubId);
        return clubId;
    }
    
    // Method 2: Global state
    if (window.currentClub) {
        console.log('Debug: Found club ID in window.currentClub:', window.currentClub.id);
        return window.currentClub.id;
    }
    
    // Method 3: Dropdown selector
    const clubDropdown = document.getElementById('clubSelector');
    if (clubDropdown) {
        console.log('Debug: Found club ID in dropdown:', clubDropdown.value);
        return clubDropdown.value;
    }
    
    // Method 4: User's first club
    const user = auth.currentUser;
    if (user && window.currentUserClubs && window.currentUserClubs.length > 0) {
        console.log('Debug: Using first club from user clubs:', window.currentUserClubs[0]);
        return window.currentUserClubs[0];
    }
    
    console.error("No club ID found - implement getCurrentClubId() for your app");
    return null;
}

function updateNotificationsPanel() {
    const notificationsPanel = document.getElementById('notificationsPanel'); // Make sure you have this element
    const currentDate = new Date();
    
    // Clear existing notifications
    notificationsPanel.innerHTML = '<h2>Notifications</h2><div class="notification-section"><h3>All</h3></div>';
    
    // Get events from Firestore
    db.collection('events')
        .orderBy('date', 'desc')
        .limit(5) // Show 5 most recent events
        .get()
        .then(querySnapshot => {
            const section = notificationsPanel.querySelector('.notification-section');
            
            querySnapshot.forEach(doc => {
                const event = doc.data();
                const eventDate = new Date(event.date.seconds * 1000);
                const minsAgo = Math.floor((currentDate - eventDate) / (1000 * 60));
                
                // 1. Always show the event notification (the only type we keep)
                const eventNotif = document.createElement('div');
                eventNotif.className = 'notification-item';
                eventNotif.innerHTML = `
                    <strong>New Event Scheduled</strong>
                    <p>${minsAgo} min ago</p>
                    <p>Your Club has scheduled a new event: "${event.title}"</p>
                `;
                section.appendChild(eventNotif);
                
                // 2. Add survey prompt if event is past
                if (eventDate < currentDate) {
                    const surveyNotif = document.createElement('div');
                    surveyNotif.className = 'notification-item survey-prompt';
                    surveyNotif.innerHTML = `
                        <strong>Feedback Requested</strong>
                        <p>Please complete the survey for "${event.title}"</p>
                        <button class="btn-small">Take Survey</button>
                    `;
                    section.appendChild(surveyNotif);
                }
            });
        })
        .catch(error => {
            console.error("Error loading notifications:", error);
            notificationsPanel.innerHTML += '<p>Error loading notifications</p>';
        });
}

// Helper function to get consistent club colors
function getClubColor(clubName) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCF7F', '#4D4D4D'];
    let hash = 0;
    for (let i = 0; i < clubName.length; i++) {
        hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Function to show toast notification
function showToastNotification(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Function to update notification count badge
function updateNotificationCount() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread').length;
    
    // Try different selectors for the notification button
    const notifBtn = document.querySelector('.icon-btn:nth-of-type(1)') || 
                     document.querySelector('[data-notif-btn]') ||
                     document.querySelector('.notif-btn') ||
                     document.querySelectorAll('.icon-btn')[0]; // First icon button
    
    if (!notifBtn) {
        console.warn('⚠️ Notification button not found for badge update');
        return;
    }
    
    // Remove existing badge
    const existingBadge = notifBtn.querySelector('.notification-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add badge if there are unread notifications
    if (unreadNotifications > 0) {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = unreadNotifications > 99 ? '99+' : unreadNotifications.toString();
        badge.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff4444;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        `;
        
        notifBtn.style.position = 'relative';
        notifBtn.appendChild(badge);
    }
}

// Check if page was loaded with notification parameter
// Check if page was loaded with notification parameter
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openNotifications') === 'true') {
        // Use your existing toggle function
        toggleNotifDropdown();
    }
});

// Function to mark notification as read
window.markNotificationAsRead = async function(notificationId) {
    try {
        if (notificationId.startsWith('temp-')) {
            console.log('Cannot mark temporary notification as read');
            return;
        }
        
        // Update in Firestore
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update in UI
        const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationElement) {
            notificationElement.classList.remove('unread');
        }
        
        updateNotificationCount();
        console.log('✅ Notification marked as read');
        
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
    }
};

// Function to view event
window.viewEvent = function(eventId) {
    console.log('👀 Viewing event:', eventId);
    // You can implement navigation to event details page here
    window.location.href = `event.html?id=${eventId}`;
};

// Function to load existing notifications for a user
async function loadUserNotifications(userId) {
    try {
        console.log('📥 Loading existing notifications for user:', userId);
        
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50) // Limit to recent 50 notifications
            .get();
        
        // Use the existing #notifDropdown
        const notifDropdown = document.querySelector('#notifDropdown');
        
        if (!notifDropdown) {
            console.error('❌ #notifDropdown not found');
            return;
        }
        
        // Find or create notifications container
        let notificationsContainer = notifDropdown.querySelector('.notifications-container');
        
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.className = 'notifications-container';
            
            // Insert after tabs if they exist
            const tabsElement = notifDropdown.querySelector('.notif-tabs') || 
                               notifDropdown.querySelector('[class*="tab"]');
            
            if (tabsElement && tabsElement.parentElement === notifDropdown) {
                tabsElement.insertAdjacentElement('afterend', notificationsContainer);
            } else {
                notifDropdown.appendChild(notificationsContainer);
            }
        }
        
        // Clear existing notifications from the container
        const existingNotifications = notificationsContainer.querySelectorAll('.notification-item');
        existingNotifications.forEach(item => item.remove());
        
        if (snapshot.empty) {
            // Add a "no notifications" message to the container
            const noNotifMsg = document.createElement('div');
            noNotifMsg.className = 'no-notifications';
            noNotifMsg.textContent = 'No notifications yet';
            notificationsContainer.appendChild(noNotifMsg);
            return;
        }
        
        // Add each notification to UI
        for (const doc of snapshot.docs) {
            const notification = { id: doc.id, ...doc.data() };
            await addNotificationToUI(notification);
        }
        
        updateNotificationCount();
        console.log('✅ Loaded', snapshot.size, 'notifications');
        
    } catch (error) {
        console.error('❌ Error loading notifications:', error);
    }
}

// Debug function to inspect notification dropdown structure
function debugNotificationStructure() {
    console.log('🔍 Debugging notification dropdown structure:');
    
    const notifDropdown = document.querySelector('#notifDropdown');
    console.log('notifDropdown element:', notifDropdown);
    
    if (notifDropdown) {
        console.log('notifDropdown has', notifDropdown.children.length, 'children');
        // Don't log the full innerHTML as it's too long, just the structure
        const childElements = Array.from(notifDropdown.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id
        }));
        console.log('Child elements:', childElements);
    }
    
    // Check for notification tabs specifically
    const notifTabs = document.querySelector('.notif-tabs');
    console.log('notif-tabs element:', notifTabs);
}

// Function to preserve and restore notification tabs structure
function preserveNotificationTabs() {
    const notifDropdown = document.querySelector('#notifDropdown');
    if (!notifDropdown) return null;
    
    // Look for existing tabs structure
    const existingTabs = notifDropdown.querySelector('.notif-tabs') || 
                        notifDropdown.querySelector('[class*="tab"]');
    
    if (existingTabs) {
        console.log('📋 Found existing tabs structure, preserving it');
        return existingTabs.cloneNode(true);
    }
    
    return null;
}

// Function to restore tabs if they were lost
function restoreNotificationTabs(savedTabs) {
    const notifDropdown = document.querySelector('#notifDropdown');
    if (!notifDropdown || !savedTabs) return;
    
    // Check if tabs already exist
    if (!notifDropdown.querySelector('.notif-tabs')) {
        console.log('🔄 Restoring notification tabs');
        notifDropdown.insertBefore(savedTabs, notifDropdown.firstChild);
    }
}

// Initialize the notification system when user is authenticated
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('🔐 Auth state changed. User:', user.uid);
        
        // Initialize the event end checker here
        startEventEndChecker(user.uid);
        
        // Rest of your existing code...
        loadUserClubsMini(user.uid);
        
        // Wait a bit for Firebase to be fully ready
        setTimeout(() => {
            console.log('⏰ Starting club tabs loading after delay...');
            loadUserClubTabs(user.uid);
        }, 1000);
        
        // Set up real-time event notifications
        setupEventNotifications(user.uid);
        
        // Load user clubs for mini view
        loadUserClubsMini(user.uid);
        
        // Load club tabs for notification filtering
        setTimeout(() => {
            loadUserClubTabs(user.uid);
        }, 1500);
        
    } else {
        console.log('❌ User not authenticated');
    }
});

// Enhanced CSS for the notification styling with improved layout
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-item {
        display: flex;
        align-items: flex-start;
        padding: 14px 16px;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s ease;
        gap: 12px;
    }
    
    .notification-item:hover {
        background-color: #f8f9fa;
    }
    
    .notification-item.unread {
        background-color: #e3f2fd;
        border-left: 3px solid #2196f3;
    }
    
    .notification-avatar {
        flex-shrink: 0;
    }
    
    .club-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
    }
    
    .notification-content {
        flex: 1;
        min-width: 0;
    }
    
    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }
    
    .notification-title {
        font-weight: 600;
        font-size: 14px;
        color: #1a1a1a;
    }
    
    .notification-time {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
    }
    
    .notification-message {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #444;
        line-height: 1.4;
    }
    
    .notification-meta {
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
    }
    
    .notification-stats {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .attendee-info {
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .attendee-count {
        font-weight: 600;
        color: #333;
    }
    
    .notification-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex-shrink: 0;
        align-items: flex-end;
    }
    
    .notification-action-btn {
        background: #f5f5f5;
        border: 1px solid #ddd;
        padding: 6px 12px;
        cursor: pointer;
        border-radius: 6px;
        color: #333;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        min-width: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }
    
    .notification-action-btn:hover {
        background-color: #e9e9e9;
        border-color: #ccc;
        transform: translateY(-1px);
    }
    
    .notification-action-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    
    .rsvp-btn {
        background: #2196f3;
        color: white;
        border-color: #2196f3;
        font-weight: 600;
    }
    
    .rsvp-btn:hover:not(:disabled) {
        background: #1976d2;
        border-color: #1976d2;
    }
    
    .rsvp-btn.rsvped {
        background: #4caf50;
        border-color: #4caf50;
    }
    
    .rsvp-btn.rsvped:hover:not(:disabled) {
        background: #388e3c;
        border-color: #388e3c;
    }
    
    .mark-read-btn, .view-btn {
        background: transparent;
        border: 1px solid #ddd;
        padding: 6px;
        width: 32px;
        height: 32px;
    }
    
    .mark-read-btn:hover, .view-btn:hover {
        background-color: #f0f0f0;
    }
    
    .no-notifications {
        padding: 40px 20px;
        text-align: center;
        color: #666;
        font-style: italic;
    }
    
    .notifications-container {
        max-height: 400px;
        overflow-y: auto;
    }
    
    /* Ensure proper spacing in the dropdown */
    #notifDropdown {
        display: flex;
        flex-direction: column;
    }
    
    .notif-tabs {
        flex-shrink: 0;
        border-bottom: 1px solid #eee;
        margin-bottom: 8px;
        padding-bottom: 8px;
    }
    
    /* Responsive adjustments */
    @media (max-width: 480px) {
        .notification-item {
            padding: 12px;
            gap: 10px;
        }
        
        .notification-actions {
            gap: 4px;
        }
        
        .notification-action-btn {
            padding: 4px 8px;
            font-size: 11px;
            min-width: 50px;
        }
        
        .club-avatar {
            width: 32px;
            height: 32px;
            font-size: 12px;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Add this function to your existing JavaScript file

// Function to check for ended events and create post-event survey notifications
// Function to check for events that have ended and create notifications



async function checkForEndedEvents(userId) {
    try {
        console.log('🕐 Checking for ended events for user:', userId);
        
        // Get user's clubs first
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        const userClubs = userData.clubs || [];
        
        if (userClubs.length === 0) return;
        
        const now = new Date();
        
        // Get events from user's clubs
        const eventsSnapshot = await db.collection('events')
            .where('clubId', 'in', userClubs)
            .get();
        
        for (const eventDoc of eventsSnapshot.docs) {
            const eventData = eventDoc.data();
            const eventId = eventDoc.id;
            
            // Parse event end time from your Firebase structure
            const eventEndTime = parseEventEndTime(eventData);
            
            if (!eventEndTime) continue;
            
            // Check if event has ended in the last hour (for recent events)
            const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
            const timeSinceEnd = now - eventEndTime;
            
            if (timeSinceEnd > 0 && timeSinceEnd < oneWeek) {
                // Check if user attended the event
                const attendees = eventData.attendees || [];
                if (attendees.includes(userId)) {
                    // Check if notification already exists
                    const existingNotif = await checkEventEndNotificationExists(userId, eventId);
                    
                    if (!existingNotif) {
                        await createEventEndedNotification(userId, eventData, eventId);
                    }
                }
            }
        }

       // Fixed Event End Notification System

// Function to parse event end time from Firebase data
function parseEventEndTime(eventData) {
    try {
        console.log('🔍 Parsing event data:', eventData);
        
        // Handle different date formats from Firebase
        let eventDate;
        
        // If date is a Firebase Timestamp
        if (eventData.date && typeof eventData.date.toDate === 'function') {
            eventDate = eventData.date.toDate();
        }
        // If date is a string like "2025-08-09" or "Aug 8, 2025"
        else if (typeof eventData.date === 'string') {
            eventDate = new Date(eventData.date);
        }
        // If formattedDate exists (your format)
        else if (eventData.formattedDate) {
            eventDate = new Date(eventData.formattedDate);
        }
        // If date is already a Date object
        else if (eventData.date instanceof Date) {
            eventDate = eventData.date;
        }
        else {
            console.error('❌ Unable to parse event date:', eventData.date);
            return null;
        }
        
        // Validate the parsed date
        if (isNaN(eventDate.getTime())) {
            console.error('❌ Invalid date parsed:', eventDate);
            return null;
        }
        
        // Parse the end time
        let endTimeStr = eventData.endTime || eventData.formattedEnd || eventData.time;
        
        if (!endTimeStr) {
            // If no end time, assume 1 hour after start time
            const startTimeStr = eventData.startTime || eventData.formattedStart;
            if (startTimeStr) {
                const startTime = parseTimeString(startTimeStr);
                if (startTime) {
                    const endTime = new Date(eventDate);
                    endTime.setHours(startTime.hours + 1, startTime.minutes, 0, 0);
                    console.log('📅 Calculated end time (start + 1hr):', endTime);
                    return endTime;
                }
            }
            
            console.warn('⚠️ No end time found for event:', eventData.title);
            return null;
        }
        
        // Parse the time string
        const timeInfo = parseTimeString(endTimeStr);
        if (!timeInfo) {
            console.error('❌ Unable to parse end time:', endTimeStr);
            return null;
        }
        
        // Create the complete end date/time
        const endDateTime = new Date(eventDate);
        endDateTime.setHours(timeInfo.hours, timeInfo.minutes, 0, 0);
        
        console.log('✅ Parsed event end time:', endDateTime);
        return endDateTime;
        
    } catch (error) {
        console.error('❌ Error parsing event end time:', error);
        return null;
    }
}

// Helper function to parse time strings
function parseTimeString(timeStr) {
    try {
        const cleanTimeStr = timeStr.toString().trim().toUpperCase();
        
        // Handle "10:00 AM/PM" format
        const ampmMatch = cleanTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
        if (ampmMatch) {
            let hours = parseInt(ampmMatch[1]);
            const minutes = parseInt(ampmMatch[2]);
            const period = ampmMatch[3];
            
            // Convert to 24-hour format
            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }
            
            return { hours, minutes };
        }
        
        // Handle "10:00" or "22:30" format (24-hour)
        const timeMatch = cleanTimeStr.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return { hours, minutes };
            }
        }
        
        // Handle hour only formats like "10 AM", "10AM", "22"
        const hourMatch = cleanTimeStr.match(/(\d{1,2})\s*(AM|PM)?/);
        if (hourMatch) {
            let hours = parseInt(hourMatch[1]);
            const period = hourMatch[2];
            
            if (period) {
                if (period === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (period === 'AM' && hours === 12) {
                    hours = 0;
                }
            }
            
            return { hours, minutes: 0 };
        }
        
        console.error('❌ Unable to parse time format:', timeStr);
        return null;
        
    } catch (error) {
        console.error('❌ Error parsing time string:', error);
        return null;
    }
}

// Fixed function to check for recently ended events
async function checkForRecentlyEndedEvents(userId) {
    try {
        console.log('🔍 Starting comprehensive event end check for user:', userId);
        
        if (!db || !auth.currentUser) {
            console.error('❌ Firebase not ready or user not authenticated');
            return;
        }
        
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000)); // 1 hour ago
        
        console.log('🕐 Current time:', now.toLocaleString());
        console.log('🕐 Checking for events ended after:', oneHourAgo.toLocaleString());
        
        // Get user's clubs
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.log('❌ User document not found');
            return;
        }
        
        const userData = userDoc.data();
        const userClubs = userData.clubs || [];
        
        if (userClubs.length === 0) {
            console.log('⚠️ User is not a member of any clubs');
            return;
        }
        
        console.log('🏠 User clubs:', userClubs);
        
        // Get all events from user's clubs
        let allEvents = [];
        
        // Handle Firestore 'in' query limitation (max 10 items)
        for (let i = 0; i < userClubs.length; i += 10) {
            const clubBatch = userClubs.slice(i, i + 10);
            
            try {
                const eventsSnapshot = await db.collection('events')
                    .where('clubId', 'in', clubBatch)
                    .get();
                
                eventsSnapshot.forEach(doc => {
                    allEvents.push({ id: doc.id, ...doc.data() });
                });
                
                console.log(`📊 Found ${eventsSnapshot.size} events for clubs batch ${i/10 + 1}`);
                
            } catch (error) {
                console.error(`❌ Error querying events for clubs batch ${i/10 + 1}:`, error);
            }
        }
        
        console.log(`📊 Total events found: ${allEvents.length}`);
        
        // Check each event
        for (const event of allEvents) {
            console.log(`🔍 Checking event: "${event.title}" (ID: ${event.id})`);
            
            // Parse the event end time
            const eventEndTime = parseEventEndTime(event);
            
            if (!eventEndTime) {
                console.log(`⚠️ Could not parse end time for event: ${event.title}`);
                continue;
            }
            
            const timeSinceEnd = now - eventEndTime;
            const minutesSinceEnd = Math.floor(timeSinceEnd / (1000 * 60));
            
            console.log(`⏰ Event "${event.title}" ended ${minutesSinceEnd} minutes ago`);
            
            // Check if event ended in the last hour
            if (timeSinceEnd > 0 && timeSinceEnd < (60 * 60 * 1000)) {
                console.log(`✅ Event "${event.title}" recently ended`);
                
                // Check if user was an attendee
                const attendees = event.attendees || [];
                const userAttended = attendees.includes(userId);
                
                console.log(`👤 User attended: ${userAttended}`);
                
                if (userAttended) {
                    // Check if we already created a notification for this event
                    const existingNotification = await checkEventEndNotificationExists(userId, event.id);
                    
                    if (!existingNotification) {
                        console.log(`📝 Creating end notification for event: ${event.title}`);
                        await createEventEndNotification(userId, event, event.id);
                    } else {
                        console.log(`⏭️ End notification already exists for event: ${event.title}`);
                    }
                } else {
                    console.log(`👤 User did not attend event: ${event.title}`);
                }
            } else if (timeSinceEnd > 0) {
                console.log(`⏰ Event "${event.title}" ended too long ago (${Math.floor(timeSinceEnd / (1000 * 60 * 60))} hours ago)`);
            } else {
                console.log(`⏰ Event "${event.title}" has not ended yet (ends in ${Math.abs(minutesSinceEnd)} minutes)`);
            }
        }
        
        console.log('✅ Finished checking for recently ended events');
        
    } catch (error) {
        console.error('❌ Error in checkForRecentlyEndedEvents:', error);
    }
}

// Fixed function to check if notification exists
async function checkEventEndNotificationExists(userId, eventId) {
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('eventId', '==', eventId)
            .where('type', '==', 'event_ended')
            .limit(1)
            .get();
        
        const exists = !snapshot.empty;
        console.log(`🔍 Event end notification exists for ${eventId}: ${exists}`);
        return exists;
        
    } catch (error) {
        console.error('❌ Error checking existing notification:', error);
        return false; // Assume it doesn't exist if we can't check
    }
}

// Fixed function to create event end notification
async function createEventEndNotification(userId, eventData, eventId) {
    try {
        console.log('📝 Creating event end notification for:', eventData.title);
        
        // Get club name
        let clubName = eventData.clubName || 'Unknown Club';
        if (!eventData.clubName && eventData.clubId) {
            try {
                const clubDoc = await db.collection('clubs').doc(eventData.clubId).get();
                if (clubDoc.exists) {
                    clubName = clubDoc.data().name || 'Unknown Club';
                }
            } catch (error) {
                console.warn('⚠️ Could not fetch club name:', error);
            }
        }
        
        // Create notification object
       
        
        console.log('💾 Saving event end notification to Firestore:', notification);
        
        // Save to Firestore
        const docRef = await db.collection('notifications').add(notification);
        notification.id = docRef.id;
        
        console.log(`✅ Event end notification saved with ID: ${docRef.id}`);
        
        // Add to UI immediately
        await addEventEndNotificationToUI(notification);
        
        console.log('✅ Event end notification created and displayed successfully');
        
    } catch (error) {
        console.error('❌ Error creating event end notification:', error);
        throw error; // Re-throw to handle in calling function
    }
}

// Enhanced notification UI function
async function addEventEndNotificationToUI(notification) {
    try {
        console.log('🎨 Adding event end notification to UI:', notification.eventTitle);
        
        const notifDropdown = document.querySelector('#notifDropdown');
        if (!notifDropdown) {
            console.warn('❌ #notifDropdown not found in DOM');
            return;
        }
        
        let notificationsContainer = notifDropdown.querySelector('.notifications-container');
        if (!notificationsContainer) {
            console.log('📦 Creating notifications container');
            notificationsContainer = document.createElement('div');
            notificationsContainer.className = 'notifications-container';
            
            const tabsElement = notifDropdown.querySelector('.notif-tabs');
            if (tabsElement) {
                tabsElement.insertAdjacentElement('afterend', notificationsContainer);
            } else {
                notifDropdown.appendChild(notificationsContainer);
            }
        }
        
        // Remove "no notifications" message if it exists
        const noNotifMsg = notificationsContainer.querySelector('.no-notifications');
        if (noNotifMsg) {
            noNotifMsg.remove();
        }
        
        const notificationId = notification.id || 'temp-' + Date.now();
        const timeAgo = notification.createdAt ? 'just now' : 'just now';
        
        // Create event end notification HTML
        const notificationHTML = `
            <div class="notification-item unread event-ended" data-club-id="${notification.clubId}" data-notification-id="${notificationId}">
                <div class="notification-avatar">
                    <div class="club-avatar" style="background: ${getClubColor(notification.clubName)};">
                        🎉
                    </div>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <span class="notification-title">${notification.title}</span>
                        <span class="notification-time">${timeAgo}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-meta">📅 Event: ${notification.eventTitle}</div>
                </div>
                <div class="notification-actions">
                    <button class="notification-action-btn feedback-btn" 
                            onclick="openEventFeedback('${notification.eventId}', '${notification.eventTitle}')"
                            title="Share feedback about this event">
                        Give Feedback
                    </button>
                    <button class="notification-action-btn mark-read-btn" 
                            onclick="markNotificationAsRead('${notificationId}')"
                            title="Mark as read">
                        ✓
                    </button>
                </div>
            </div>
        `;
        
        // Add to top of notifications
        notificationsContainer.insertAdjacentHTML('afterbegin', notificationHTML);
        
        console.log('✅ Event end notification added to UI');
        
        // Update notification count
        updateNotificationCount();
        
        // Show toast notification
        showToastNotification(`"${notification.eventTitle}" has ended - share your feedback!`);
        
    } catch (error) {
        console.error('❌ Error adding notification to UI:', error);
    }
}

// Enhanced feedback modal
window.openEventFeedback = function(eventId, eventTitle) {
    console.log('📋 Opening feedback modal for:', eventTitle);
    
    // Remove existing modal if present
    const existingModal = document.querySelector('.feedback-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const feedbackModal = document.createElement('div');
    feedbackModal.className = 'feedback-modal';
    feedbackModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    feedbackModal.innerHTML = `
        <div class="feedback-modal-content" style="
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            width: 500px; 
            max-width: 90vw; 
            max-height: 90vh; 
            overflow-y: auto;
            animation: slideIn 0.3s ease;
        ">
            <h3 style="margin-top: 0; color: #333; display: flex; align-items: center; gap: 10px;">
                🎉 Event Feedback
                <button onclick="closeFeedbackModal()" style="
                    margin-left: auto; 
                    background: none; 
                    border: none; 
                    font-size: 24px; 
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                ">&times;</button>
            </h3>
            <p style="color: #666; margin-bottom: 20px;">How was <strong>"${eventTitle}"</strong>?</p>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Overall Rating:</label>
                <div class="rating-stars" style="display: flex; gap: 8px; margin-bottom: 15px;">
                    ${[1,2,3,4,5].map(num => `
                        <button class="star-btn" data-rating="${num}" style="
                            background: none; 
                            border: none; 
                            font-size: 28px; 
                            cursor: pointer; 
                            color: #ddd; 
                            transition: all 0.2s;
                            padding: 5px;
                            border-radius: 50%;
                        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">⭐</button>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">What did you enjoy most?</label>
                <textarea id="eventFeedbackText" placeholder="Tell us what you loved about this event..." style="
                    width: 100%; 
                    height: 80px; 
                    padding: 12px; 
                    border: 2px solid #ddd; 
                    border-radius: 8px; 
                    resize: vertical; 
                    font-family: inherit;
                    transition: border-color 0.2s;
                " onfocus="this.style.borderColor='#4caf50'" onblur="this.style.borderColor='#ddd'"></textarea>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Suggestions for improvement:</label>
                <textarea id="eventSuggestions" placeholder="How could this event be even better next time?" style="
                    width: 100%; 
                    height: 60px; 
                    padding: 12px; 
                    border: 2px solid #ddd; 
                    border-radius: 8px; 
                    resize: vertical; 
                    font-family: inherit;
                    transition: border-color 0.2s;
                " onfocus="this.style.borderColor='#4caf50'" onblur="this.style.borderColor='#ddd'"></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="closeFeedbackModal()" style="
                    padding: 12px 24px; 
                    background: #f5f5f5; 
                    border: 1px solid #ddd; 
                    border-radius: 6px; 
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                " onmouseover="this.style.backgroundColor='#e9e9e9'" onmouseout="this.style.backgroundColor='#f5f5f5'">Skip for Now</button>
                <button onclick="submitEventFeedback('${eventId}', '${eventTitle}')" style="
                    padding: 12px 24px; 
                    background: #4caf50; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                " onmouseover="this.style.backgroundColor='#45a049'" onmouseout="this.style.backgroundColor='#4caf50'">Submit Feedback</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(feedbackModal);
    
    // Add star rating functionality
    const starBtns = feedbackModal.querySelectorAll('.star-btn');
    let selectedRating = 0;
    
    starBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStarDisplay();
        });
        
        btn.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            highlightStars(hoverRating);
        });
    });
    
    feedbackModal.addEventListener('mouseleave', updateStarDisplay);
    
    function updateStarDisplay() {
        starBtns.forEach((star, index) => {
            if (index < selectedRating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#ddd';
            }
        });
    }
    
    function highlightStars(rating) {
        starBtns.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#ddd';
            }
        });
    }
    
    // Store reference for submit function
    window.currentFeedbackModal = feedbackModal;
    window.currentFeedbackRating = () => selectedRating;
    
    // Close modal when clicking outside
    feedbackModal.addEventListener('click', function(e) {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });
};

// Close feedback modal
window.closeFeedbackModal = function() {
    const modal = document.querySelector('.feedback-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    window.currentFeedbackModal = null;
};

// Submit feedback
window.submitEventFeedback = async function(eventId, eventTitle) {
    try {
        const rating = window.currentFeedbackRating();
        const feedback = document.getElementById('eventFeedbackText').value.trim();
        const suggestions = document.getElementById('eventSuggestions').value.trim();
        
        if (rating === 0) {
            alert('Please select a rating before submitting');
            return;
        }
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('You must be logged in to submit feedback');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('[onclick*="submitEventFeedback"]');
        if (submitBtn) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }
        
        // Save feedback to Firestore
        await db.collection('eventFeedback').add({
            eventId: eventId,
            eventTitle: eventTitle,
            userId: currentUser.uid,
            userEmail: currentUser.email || 'Unknown',
            rating: rating,
            feedback: feedback || '',
            suggestions: suggestions || '',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Event feedback submitted successfully');
        
        // Show success message
        const modal = window.currentFeedbackModal;
        if (modal) {
            const content = modal.querySelector('.feedback-modal-content');
            content.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                    <h3 style="color: #4caf50; margin-bottom: 10px;">Thank You!</h3>
                    <p style="color: #666;">Your feedback has been submitted successfully.</p>
                    <button onclick="closeFeedbackModal()" style="
                        margin-top: 20px;
                        padding: 12px 24px; 
                        background: #4caf50; 
                        color: white; 
                        border: none; 
                        border-radius: 6px; 
                        cursor: pointer;
                        font-weight: 500;
                    ">Close</button>
                </div>
            `;
        }
        
        // Auto-close after 2 seconds
        setTimeout(() => {
            closeFeedbackModal();
        }, 2000);
        
        // Mark the event end notification as read
        const eventEndNotifs = document.querySelectorAll('.notification-item.event-ended');
        eventEndNotifs.forEach(notif => {
            const notifEventId = notif.querySelector('[onclick*="' + eventId + '"]');
            if (notifEventId) {
                const notifId = notif.dataset.notificationId;
                if (notifId && !notifId.startsWith('temp-')) {
                    markNotificationAsRead(notifId);
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error submitting event feedback:', error);
        alert('Error submitting feedback. Please try again.');
        
        // Reset button
        const submitBtn = document.querySelector('[onclick*="submitEventFeedback"]');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Feedback';
            submitBtn.disabled = false;
        }
    }
};

// Enhanced event end checker with better error handling
function startEventEndChecker(userId) {
    console.log('🚀 Starting enhanced event end checker for user:', userId);
    
    // Stop any existing checker
    if (window.eventEndCheckInterval) {
        clearInterval(window.eventEndCheckInterval);
    }
    
    // Check immediately
    setTimeout(() => {
        checkForRecentlyEndedEvents(userId);
    }, 2000); // 2 second delay to ensure Firebase is ready
    
    // Then check every 10 minutes
    window.eventEndCheckInterval = setInterval(() => {
        checkForRecentlyEndedEvents(userId);
    }, 10 * 60 * 1000); // 10 minutes
    
    console.log('✅ Event end checker started (checking every 10 minutes)');
}

// Stop event end checker
function stopEventEndChecker() {
    if (window.eventEndCheckInterval) {
        clearInterval(window.eventEndCheckInterval);
        window.eventEndCheckInterval = null;
        console.log('🛑 Event end checker stopped');
    }
}

// Add CSS animations for the modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideIn {
        from { 
            opacity: 0;
            transform: translateY(-50px) scale(0.9); 
        }
        to { 
            opacity: 1;
            transform: translateY(0) scale(1); 
        }
    }
    
    .event-ended {
        border-left: 3px solid #4caf50 !important;
        background-color: #e8f5e8 !important;
    }
    
    .feedback-btn {
        background: #4caf50 !important;
        color: white !important;
        border-color: #4caf50 !important;
        font-weight: 600 !important;
    }
    
    .feedback-btn:hover:not(:disabled) {
        background: #45a049 !important;
        border-color: #45a049 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    }
`;
document.head.appendChild(modalStyles);

// Debug function to manually test event end checking
window.debugEventEndCheck = function(userId = null) {
    const user = userId || (auth.currentUser && auth.currentUser.uid);
    if (!user) {
        console.log('❌ No user provided or authenticated');
        return;
    }
    
    console.log('🔧 DEBUG: Manually checking for ended events...');
    checkForRecentlyEndedEvents(user);
};

// Export functions for testing
window.testEventEndSystem = {
    checkForRecentlyEndedEvents,
    parseEventEndTime,
    startEventEndChecker,
    stopEventEndChecker
};

console.log('✅ Fixed Event End Notification System loaded');
   

// 5. Initialize when user logs in
auth.onAuthStateChanged(user => {
    if (user) {
        startEventEndChecker(user.uid);
        
        // Also set up the notification listener
        setupNotificationListener(user.uid);
    }
});

// 6. Add this function to listen for new notifications
function setupNotificationListener(userId) {
    return db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            renderNotifications(notifications);
        });
}

// 7. Update your renderNotifications function to handle event-ended notifications


// 8. Add these helper functions
function formatTime(date) {
    if (!date) return 'just now';
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)} min ago`;
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

window.handleEventFeedback = function(eventId) {
    console.log('Opening feedback for event:', eventId);
    // Implement your feedback modal here
    alert(`Feedback form would open for event ${eventId}`);
};
        
    } catch (error) {
        console.error('❌ Error checking for ended events:', error);
    }
}

// Check if page was loaded with notification parameter
function checkForNotificationParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openNotifications') === 'true') {
        if (typeof window.toggleNotifDropdown === 'function') {
            window.toggleNotifDropdown();
        }
    }
}

// Run immediately if page is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForNotificationParam);
} else {
    checkForNotificationParam();
}


// Function to add event ended notification to UI
function addEventEndedNotificationToUI(notification) {
    const notifDropdown = document.querySelector('#notifDropdown');
    if (!notifDropdown) return;
    
    let notificationsContainer = notifDropdown.querySelector('.notifications-container');
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        notifDropdown.appendChild(notificationsContainer);
    }
    
    const notificationId = notification.id || 'temp-' + Date.now();
    
    // Create notification HTML
    const notificationHTML = `
        <div class="notification-item unread event-ended" data-club-id="${notification.clubId}" data-notification-id="${notificationId}">
            <div class="notification-avatar">
                <div class="club-avatar" style="background: ${getClubColor(notification.clubName)};">
                    🎉
                </div>
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${notification.title}</span>
                    <span class="notification-time">just now</span>
                </div>
                <p class="notification-message">${notification.message}</p>
                <div class="notification-actions">
                    <button class="notification-action-btn feedback-btn" 
                            onclick="openEventFeedback('${notification.eventId}', '${notification.eventTitle}')"
                            title="Share feedback">
                        Share Feedback
                    </button>
                    <button class="notification-action-btn mark-read-btn" 
                            onclick="markNotificationAsRead('${notificationId}')"
                            title="Mark as read">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    notificationsContainer.insertAdjacentHTML('afterbegin', notificationHTML);
    updateNotificationCount();
    showToastNotification(notification.message);
}

// Function to start the event end checker
function startEventEndChecker(userId) {
    console.log('🚀 Starting event end checker for user:', userId);
    
    // Check immediately
    checkForEndedEvents(userId);
    
    // Then check every 5 minutes
    setInterval(() => {
        checkForEndedEvents(userId);
    }, 5 * 60 * 1000); // 5 minutes
}

// Add this to your auth state change handler
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('🔐 Auth state changed. User:', user.uid);
        
        // Initialize the event end checker
        startEventEndChecker(user.uid);
        
        // Rest of your existing code...
        loadUserClubsMini(user.uid);
        
        // Wait a bit for Firebase to be fully ready
        setTimeout(() => {
            console.log('⏰ Starting club tabs loading after delay...');
            loadUserClubTabs(user.uid);
        }, 1000);
    }
});


// Function to load and display weekly events from Firebase
// Function to populate the weekly events checklist
async function populateWeeklyEvents(clubId) {
  try {
    const now = new Date();
    const { startOfWeek, endOfWeek } = getCurrentWeekDates();
    
    // Get events for this week
    const snapshot = await firebase.firestore()
      .collection('events')
      .where('clubId', '==', clubId)
      .where('date', '>=', startOfWeek.toISOString().split('T')[0])
      .where('date', '<=', endOfWeek.toISOString().split('T')[0])
      .orderBy('date')
      .orderBy('startTime')
      .get();

    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        isPast: isEventPast(data.date, data.endTime || data.startTime)
      };
    });

    updateEventsChecklist(events);
  } catch (error) {
    console.error('Error loading events:', error);
    document.querySelector('.feed-card-progress').textContent = 'Error loading events';
  }
}

// Helper functions
function getCurrentWeekDates() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // End of week (Saturday)
  end.setHours(23, 59, 59, 999);
  
  return { startOfWeek: start, endOfWeek: end };
}

function isEventPast(eventDate, eventTime) {
  const now = new Date();
  const [hours, minutes] = eventTime.split(':').map(Number);
  const eventDateTime = new Date(eventDate);
  eventDateTime.setHours(hours, minutes);
  return eventDateTime < now;
}

function formatEventDisplay(event) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const eventDate = new Date(event.date);
  const dayName = days[eventDate.getDay()];
  const time = event.formattedStart || event.startTime;
  return `${event.title} - ${dayName} ${time}`;
}

function updateEventsChecklist(events) {
  const container = document.querySelector('.feed-checklist-items');
  const progressText = document.querySelector('.feed-card-progress');
  
  if (!container || !progressText) return;

  // Calculate completed events
  const completed = events.filter(e => e.isPast).length;
  progressText.textContent = `${completed}/${events.length} events completed`;

  // Clear existing items
  container.innerHTML = '';

  // Add each event as a checklist item
  events.forEach((event, index) => {
    const item = document.createElement('li');
    item.className = 'feed-checklist-item';
    
    item.innerHTML = `
      <input type="checkbox" id="event-${index}" class="feed-checkbox" 
             ${event.isPast ? 'checked disabled' : ''}>
      <label for="event-${index}" class="feed-checklist-label ${event.isPast ? 'completed' : ''}">
        ${formatEventDisplay(event)}
      </label>
    `;
    
    container.appendChild(item);
  });
}

// Usage: Call this when page loads or club changes
populateWeeklyEvents('your-club-id');
// ==============================================
// UPCOMING EVENTS WIDGET - FINAL TIMEZONE FIX
// ==============================================

// Wait for auth to be ready before initializing
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('🔔 Initializing events widget for user:', user.uid);
    initializeEventsWidget();
  }
});

async function initializeEventsWidget() {
  try {
    // Add minimal styles if not already present
    addEventWidgetStyles();
    
    // Load and display initial events
    await loadAndDisplayUpcomingEvents();
    
    // Set up real-time listener for new events
    setupRealtimeEventListener();
    
    console.log('✅ Events widget initialized');
  } catch (error) {
    console.error('❌ Events widget error:', error);
    updateStatusMessage('Error loading events');
  }
}

// Convert to local date string (YYYY-MM-DD)
function getLocalDateString(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
}

// Check if event is in future using local time
function isFutureEvent(eventDate, eventTime) {
  const now = new Date();
  const [hours, minutes] = eventTime.split(':');
  const eventDateObj = new Date(eventDate);
  eventDateObj.setHours(parseInt(hours), parseInt(minutes));
  return eventDateObj > now;
}

async function loadAndDisplayUpcomingEvents() {
  const user = firebase.auth().currentUser;
  if (!user) throw new Error('User not authenticated');
  
  updateStatusMessage('Loading events...');
  
  // Get user's clubs
  const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
  const clubIds = userDoc.data()?.clubs || [];
  if (clubIds.length === 0) throw new Error('No club memberships');
  
  // Get today's date in local timezone
  const todayLocal = getLocalDateString(new Date());
  
  // Query events starting from today
  const eventsSnapshot = await firebase.firestore()
    .collection('events')
    .where('clubId', '==', clubIds[0])
    .where('date', '>=', todayLocal)
    .orderBy('date')
    .orderBy('startTime')
    .limit(10) // Get extra in case some are past
    .get();

  // Process and filter to only future events
  const futureEvents = eventsSnapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        date: data.date,
        time: data.startTime, // Use raw time for comparison
        location: data.space || data.location || '',
        color: data.color || '#3b82f6'
      };
    })
    .filter(event => isFutureEvent(event.date, event.time))
    .slice(0, 5); // Only keep first 5 future events

  displayEvents(futureEvents);
}

function setupRealtimeEventListener() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  // Get user's clubs (should use the same logic as loadAndDisplayUpcomingEvents)
  const clubId = 'your-club'; // In production, get from user data
  
  // Get today's date in local timezone
  const todayLocal = getLocalDateString(new Date());
  
  // Set up real-time listener for new events
  firebase.firestore()
    .collection('events')
    .where('clubId', '==', clubId)
    .where('date', '>=', todayLocal)
    .orderBy('date')
    .orderBy('startTime')
    .limit(10)
    .onSnapshot((snapshot) => {
      const futureEvents = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            date: data.date,
            time: data.startTime,
            location: data.space || data.location || '',
            color: data.color || '#3b82f6'
          };
        })
        .filter(event => isFutureEvent(event.date, event.time))
        .slice(0, 5);
      
      displayEvents(futureEvents);
    });
}

function displayEvents(events) {
  const container = document.querySelector('.feed-checklist-items');
  if (!container) {
    console.error('Events container not found');
    return;
  }
  
  // Clear existing items
  container.innerHTML = '';
  
  if (events.length === 0) {
    updateStatusMessage('No upcoming events');
    container.innerHTML = '<li class="no-events-message">No upcoming events scheduled</li>';
    return;
  }
  
  updateStatusMessage(`${events.length} upcoming event${events.length !== 1 ? 's' : ''}`);
  
  // Add each event to the UI
  events.forEach(event => {
    const item = document.createElement('li');
    item.className = 'feed-checklist-item';
    item.style.borderLeft = `3px solid ${event.color}`;
    item.style.padding = '10px';
    item.style.margin = '8px 0';
    
    // Format date and time in local timezone
    const eventDate = new Date(`${event.date}T${event.time}`);
    const formattedDate = eventDate.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const formattedTime = eventDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    item.innerHTML = `
      <div class="event-item">
        <strong>${event.title}</strong>
        <div class="event-details">
          ${formattedDate} at ${formattedTime}
          ${event.location ? `<span class="event-location">(${event.location})</span>` : ''}
        </div>
      </div>
    `;
    
    container.appendChild(item);
  });
}

// Helper functions
function updateStatusMessage(message) {
  const statusEl = document.querySelector('.feed-card-progress');
  if (statusEl) statusEl.textContent = message;
}

function addEventWidgetStyles() {
  if (document.getElementById('events-widget-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'events-widget-styles';
  style.textContent = `
    .feed-checklist-item {
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    }
    .feed-checklist-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .event-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .event-details {
      font-size: 0.9em;
      color: #4b5563;
    }
    .event-location {
      color: #6b7280;
    }
    .feed-card-progress {
      color: #4b5563;
      font-size: 0.9em;
      margin-bottom: 12px;
    }
    .no-events-message {
      padding: 10px;
      color: #6b7280;
      font-style: italic;
    }
  `;
  document.head.appendChild(style);
}


async function updateDashboardData(clubId, db) {
    if (!clubId) return;
    
    console.log('🏢 Updating dashboard for club:', clubId);
    
    try {
        const clubDoc = await db.collection('clubs').doc(clubId).get();
        
        if (clubDoc.exists) {
            const clubData = clubDoc.data();
            
            const memberCountElement = document.querySelector('.stat-card .stat-content .stat-number');
            if (memberCountElement && clubData.memberCount) {
                memberCountElement.textContent = clubData.memberCount;
            }
            
            // Load member feedback for this club
            console.log('🔄 Loading member feedback...');
            await loadMemberFeedback(clubId);
            
            // Load analytics for this club
            console.log('📊 Loading analytics...');
            await updateAnalyticsGrid(clubId);
            
            // Load weekly events for this club
            console.log('📅 Loading weekly events...');
            await loadWeeklyEvents(clubId);
            
            console.log('✅ Dashboard updated for club:', clubData.name);
        }
    } catch (error) {
        console.error('❌ Error updating dashboard data:', error);
        displayErrorFeedback();
        displayErrorAnalytics();
        displayWeeklyEventsError();
    }
}

function setupWeeklyEventsListener(clubId) {
    if (!clubId || !db) return;
    
    const { startOfWeek, endOfWeek } = getCurrentWeekDates();
    
    // Set up real-time listener for events
    const unsubscribe = db.collection('events')
        .where('clubId', '==', clubId)
        .where('date', '>=', startOfWeek.toISOString().split('T')[0])
        .where('date', '<=', endOfWeek.toISOString().split('T')[0])
        .orderBy('date')
        .orderBy('startTime')
        .onSnapshot((snapshot) => {
            const events = [];
            snapshot.forEach(doc => {
                events.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('📱 Real-time events update:', events.length, 'events');
            updateWeeklyEventsDisplay(events);
        }, (error) => {
            console.error('❌ Real-time events listener error:', error);
            displayWeeklyEventsError();
        });
    
    // Store the unsubscribe function to clean up later if needed
    window.weeklyEventsUnsubscribe = unsubscribe;
}

function handleClubChange(event) {
    const selectedClubId = event.target.value;
    const selectedClubName = event.target.options[event.target.selectedIndex].text;
    
    console.log('Selected club:', selectedClubName, 'ID:', selectedClubId);
    
    currentClubId = selectedClubId;
    window.currentClubId = selectedClubId;
    
    // Clean up previous listener if it exists
    if (window.weeklyEventsUnsubscribe) {
        window.weeklyEventsUnsubscribe();
    }
    
    window.db = firebase.firestore();
    db = window.db;
    
    updateDashboardData(selectedClubId, db);
    loadChecklistItems();
    
    // Load feedback for the new club
    loadMemberFeedback(selectedClubId);
    
    // Set up real-time listener for weekly events
    setupWeeklyEventsListener(selectedClubId);
}

// CSS for styling the weekly events
const weeklyEventsCSS = `
.no-events-message {
    color: #6b7280;
    font-style: italic;
    padding: 8px 0;
    display: block;
}

.error-message {
    color: #ef4444;
    font-style: italic;
    padding: 8px 0;
    display: block;
}

.feed-checklist-label.completed {
    text-decoration: line-through;
    color: #6b7280;
}

.feed-checkbox:checked + .feed-checklist-label {
    text-decoration: line-through;
    color: #6b7280;
}

.feed-card-progress {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 12px;
}
`;

// Add the CSS if not already added
if (!document.querySelector('#weekly-events-css')) {
    const weeklyEventsStyle = document.createElement('style');
    weeklyEventsStyle.id = 'weekly-events-css';
    weeklyEventsStyle.innerHTML = weeklyEventsCSS;
    document.head.appendChild(weeklyEventsStyle);
}

console.log('✅ Dynamic Weekly Events system loaded');

// Function to format event display text
function formatEventDisplay(event) {
    const eventDate = new Date(event.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[eventDate.getDay()];
    
    // Format time from 24h to 12h format
    const formattedTime = formatTime(event.startTime);
    
    return `${event.title} - ${dayName} ${formattedTime}`;
}

// Function to format time from 24h to 12h
function formatTime(timeString) {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'pm' : 'am';
    
    return `${hour12}${minutes !== '00' ? ':' + minutes : ''}${ampm}`;
}

// Function to check if event has already occurred
function hasEventOccurred(event) {
    const now = new Date();
    const eventDateTime = new Date(`${event.date}T${event.endTime || event.startTime}`);
    return eventDateTime < now;
}

// Function to update the weekly events display
function updateWeeklyEventsDisplay(events) {
    const eventsContainer = document.querySelector('.feed-card-wide');
    
    if (!eventsContainer) {
        console.warn('Weekly events container not found');
        return;
    }

    const title = eventsContainer.querySelector('.feed-card-title-sm');
    const progress = eventsContainer.querySelector('.feed-card-progress');
    const checklist = eventsContainer.querySelector('.feed-checklist-items');

    if (!title || !progress || !checklist) {
        console.warn('Weekly events elements not found');
        return;
    }

    // Update title
    title.textContent = 'Club Events This Week';

    // Count completed events (events that have already occurred)
    const completedEvents = events.filter(event => hasEventOccurred(event)).length;
    
    // Update progress
    if (events.length === 0) {
        progress.textContent = 'No events scheduled this week';
    } else {
        progress.textContent = `${completedEvents}/${events.length} events completed`;
    }

    // Clear existing checklist items
    checklist.innerHTML = '';

    if (events.length === 0) {
        // Display message when no events
        const noEventsItem = document.createElement('li');
        noEventsItem.className = 'feed-checklist-item';
        noEventsItem.innerHTML = `
            <span class="no-events-message">No events scheduled for this week</span>
        `;
        checklist.appendChild(noEventsItem);
        return;
    }

    // Create checklist items for each event
    events.forEach((event, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'feed-checklist-item';
        
        const checkboxId = `feed-event-${event.id}`;
        const isCompleted = hasEventOccurred(event);
        const displayText = formatEventDisplay(event);
        
        listItem.innerHTML = `
            <input type="checkbox" 
                   id="${checkboxId}" 
                   class="feed-checkbox" 
                   ${isCompleted ? 'checked' : ''}
                   data-event-id="${event.id}">
            <label for="${checkboxId}" 
                   class="feed-checklist-label ${isCompleted ? 'completed' : ''}">
                ${displayText}
            </label>
        `;
        
        checklist.appendChild(listItem);
    });

    console.log('✅ Weekly events display updated');
}

// Function to display error state
function displayWeeklyEventsError() {
    const eventsContainer = document.querySelector('.feed-card-wide');
    
    if (eventsContainer) {
        const title = eventsContainer.querySelector('.feed-card-title-sm');
        const progress = eventsContainer.querySelector('.feed-card-progress');
        const checklist = eventsContainer.querySelector('.feed-checklist-items');
        
        if (title) title.textContent = 'Club Events This Week';
        if (progress) progress.textContent = 'Error loading events';
        if (checklist) {
            checklist.innerHTML = `
                <li class="feed-checklist-item">
                    <span class="error-message">Unable to load events. Please try again.</span>
                </li>
            `;
        }
    }
}

// Function to handle manual checkbox changes (for future events)
function handleEventCheckboxChange(eventId, isChecked) {
    console.log(`Event ${eventId} manually marked as ${isChecked ? 'completed' : 'incomplete'}`);
    
    // You can add logic here to update event status in Firebase if needed
    // For example, add a 'manuallyCompleted' field to the event document
    
    if (db && currentClubId) {
        db.collection('events').doc(eventId).update({
            manuallyCompleted: isChecked,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error('Error updating event status:', error);
        });
    }
}

// Event listener for checkbox changes
document.addEventListener('change', function(e) {
    if (e.target.matches('.feed-checkbox[data-event-id]')) {
        const eventId = e.target.getAttribute('data-event-id');
        const isChecked = e.target.checked;
        handleEventCheckboxChange(eventId, isChecked);
    }
});

// Add CSS for event-ended notifications
const eventEndedStyles = document.createElement('style');
eventEndedStyles.textContent = `
    .event-ended {
        border-left: 3px solid #4caf50 !important;
        background-color: #e8f5e9 !important;
    }
    
    .feedback-btn {
        background: #4caf50 !important;
        color: white !important;
        border-color: #4caf50 !important;
        font-weight: 600 !important;
    }
    
    .feedback-btn:hover:not(:disabled) {
        background: #388e3c !important;
        border-color: #388e3c !important;
    }
`;
document.head.appendChild(eventEndedStyles);

// Function to open event feedback (similar to the survey function)
window.openEventFeedback = function(eventId, eventTitle) {
    console.log('📋 Opening feedback for event:', eventTitle);
    // You can reuse the survey modal code from earlier or implement a simpler version
    alert(`Feedback form would open for: ${eventTitle}`);
};



// Function to create post-event survey notification


// Function to add post-event survey notification to UI
async function addPostEventSurveyToUI(notification) {
    const notifDropdown = document.querySelector('#notifDropdown');
    if (!notifDropdown) return;
    
    let notificationsContainer = notifDropdown.querySelector('.notifications-container');
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        notifDropdown.appendChild(notificationsContainer);
    }
    
    const notificationId = notification.id || 'temp-' + Date.now();
    
    // Create post-event survey notification HTML
    const notificationHTML = `
        <div class="notification-item unread post-event-survey" data-club-id="${notification.clubId}" data-notification-id="${notificationId}">
            <div class="notification-avatar">
                <div class="club-avatar" style="background: ${getClubColor(notification.clubName)};">
                    📋
                </div>
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${notification.title}</span>
                    <span class="notification-time">just now</span>
                </div>
                <p class="notification-message">${notification.message}</p>
                <div class="notification-meta">🎯 Takes just 2 minutes</div>
            </div>
            <div class="notification-actions">
                <button class="notification-action-btn survey-btn" 
                        onclick="openPostEventSurvey('${notification.eventId}', '${notification.eventTitle}')"
                        title="Fill out survey">
                    Take Survey
                </button>
                <button class="notification-action-btn later-btn" 
                        onclick="remindLater('${notificationId}')"
                        title="Remind me later">
                    Later
                </button>
                <button class="notification-action-btn mark-read-btn" 
                        onclick="markNotificationAsRead('${notificationId}')"
                        title="Mark as read">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Add to top of notifications
    notificationsContainer.insertAdjacentHTML('afterbegin', notificationHTML);
    
    updateNotificationCount();
    showToastNotification(`Please share feedback for "${notification.eventTitle}"`);
}

// Function to open post-event survey
window.openPostEventSurvey = function(eventId, eventTitle) {
    console.log('📋 Opening post-event survey for:', eventTitle);
    
    // Create simple survey modal
    const surveyModal = document.createElement('div');
    surveyModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    surveyModal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; width: 500px; max-width: 90vw;">
            <h3 style="margin-top: 0; color: #333;">Event Feedback</h3>
            <p style="color: #666; margin-bottom: 20px;">How was "${eventTitle}"?</p>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Overall Rating:</label>
                <div class="rating-stars" style="display: flex; gap: 5px; margin-bottom: 15px;">
                    ${[1,2,3,4,5].map(num => `
                        <button class="star-btn" data-rating="${num}" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #ddd;">⭐</button>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">What did you enjoy most?</label>
                <textarea id="surveyFeedback" placeholder="Share your thoughts..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical;"></textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="closeSurveyModal()" style="padding: 10px 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">Skip</button>
                <button onclick="submitEventSurvey('${eventId}')" style="padding: 10px 20px; background: #2196f3; color: white; border: none; border-radius: 6px; cursor: pointer;">Submit Feedback</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(surveyModal);
    
    // Add star rating functionality
    const starBtns = surveyModal.querySelectorAll('.star-btn');
    let selectedRating = 0;
    
    starBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            
            // Update star display
            starBtns.forEach((star, index) => {
                if (index < selectedRating) {
                    star.style.color = '#ffc107';
                } else {
                    star.style.color = '#ddd';
                }
            });
        });
    });
    
    // Store references for the submit function
    window.currentSurveyModal = surveyModal;
    window.currentSurveyRating = () => selectedRating;
};

// Function to close survey modal
window.closeSurveyModal = function() {
    if (window.currentSurveyModal) {
        document.body.removeChild(window.currentSurveyModal);
        window.currentSurveyModal = null;
    }
};

// Function to submit event survey
window.submitEventSurvey = async function(eventId) {
    try {
        const rating = window.currentSurveyRating();
        const feedback = document.getElementById('surveyFeedback').value;
        
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        // Save feedback to Firestore
        await db.collection('eventFeedback').add({
            eventId: eventId,
            userId: currentUser.uid,
            rating: rating,
            feedback: feedback,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Thank you for your feedback!');
        window.closeSurveyModal();
        
        // Mark the notification as read
        const surveyNotif = document.querySelector(`[data-notification-id*="post_event"]`);
        if (surveyNotif) {
            const notifId = surveyNotif.dataset.notificationId;
            markNotificationAsRead(notifId);
        }
        
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert('Error submitting feedback. Please try again.');
    }
};

// Function to remind later (reschedule notification)
window.remindLater = async function(notificationId) {
    try {
        // Mark current notification as read
        await markNotificationAsRead(notificationId);
        
        // Schedule a new notification for 1 hour later
        // You can implement this with a delayed cloud function or client-side timeout
        console.log('⏰ Will remind later for notification:', notificationId);
        
        showToastNotification('We\'ll remind you again in 1 hour');
        
    } catch (error) {
        console.error('Error setting reminder:', error);
    }
};

// Main function to start checking for ended events
function startEventEndChecker(userId) {
    console.log('🚀 Starting event end checker for user:', userId);
    
    // Check immediately
    checkForEndedEvents(userId);
    
    // Then check every 10 minutes
    setInterval(() => {
        checkForEndedEvents(userId);
    }, 10 * 60 * 1000); // 10 minutes
}

// Add CSS for post-event survey styling
const postEventStyles = document.createElement('style');
postEventStyles.textContent = `
    .post-event-survey {
        border-left: 3px solid #ff9800 !important;
        background-color: #fff3e0 !important;
    }
    
    .survey-btn {
        background: #ff9800 !important;
        color: white !important;
        border-color: #ff9800 !important;
        font-weight: 600 !important;
    }
    
    .survey-btn:hover:not(:disabled) {
        background: #f57c00 !important;
        border-color: #f57c00 !important;
    }
    
    .later-btn {
        background: #f5f5f5;
        color: #666;
        border-color: #ddd;
    }
    
    .later-btn:hover {
        background: #e9e9e9;
        border-color: #ccc;
    }
    
    .rating-stars button:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(postEventStyles);

if (!window._notifSystemInitialized) {
  window._notifSystemInitialized = true;
  window._endCheckerIntervalId = null;

  // ============ Helpers (global) ============
  function parseTimeString(timeStr) {
    if (!timeStr) return null;
    const s = String(timeStr).trim().toUpperCase();

    // hh:mm AM/PM
    let m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (m) {
      let h = parseInt(m[1], 10);
      const minutes = parseInt(m[2], 10);
      const period = m[3];
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return { hours: h, minutes };
    }

    // 24h hh:mm
    m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
      const h = parseInt(m[1], 10), minutes = parseInt(m[2], 10);
      if (h >= 0 && h <= 23 && minutes >= 0 && minutes <= 59) return { hours: h, minutes };
    }

    // hour only, optional AM/PM
    m = s.match(/^(\d{1,2})\s*(AM|PM)?$/);
    if (m) {
      let h = parseInt(m[1], 10);
      const period = m[2];
      if (period) {
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
      }
      return { hours: h, minutes: 0 };
    }
    return null;
  }

  function parseEventEndTime(event) {
    // event.date can be: Firestore Timestamp | {seconds} | ISO string | Date | formattedDate
    let eventDate = null;
    const d = event?.date;

    if (d?.toDate) eventDate = d.toDate();
    else if (d?.seconds) eventDate = new Date(d.seconds * 1000);
    else if (typeof d === 'string') eventDate = new Date(d);
    else if (d instanceof Date) eventDate = d;
    else if (event?.formattedDate) eventDate = new Date(event.formattedDate);

    if (!eventDate || isNaN(eventDate.getTime())) return null;

    // Prefer explicit endTime; otherwise infer start + 60min
    const endStr = event.endTime || event.formattedEnd || event.time;
    if (endStr) {
      const t = parseTimeString(endStr);
      if (!t) return null;
      const endDT = new Date(eventDate);
      endDT.setHours(t.hours, t.minutes, 0, 0);
      return endDT;
    }

    const startStr = event.startTime || event.formattedStart;
    if (startStr) {
      const t = parseTimeString(startStr);
      if (!t) return null;
      const endDT = new Date(eventDate);
      endDT.setHours(t.hours, t.minutes, 0, 0);
      endDT.setMinutes(endDT.getMinutes() + 60);
      return endDT;
    }

    // If truly nothing, assume 1 hour event starting at 17:00
    const endDT = new Date(eventDate);
    endDT.setHours(18, 0, 0, 0);
    return endDT;
  }

  async function checkEventEndNotificationExists(userId, eventId) {
    try {
      const snap = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('eventId', '==', eventId)
        .where('type', '==', 'event_ended')
        .limit(1).get();
      return !snap.empty;
    } catch (e) {
      console.warn('checkEventEndNotificationExists error', e);
      return false;
    }
  }

  function ensureNotifContainer() {
    const dropdown = document.querySelector('#notifDropdown');
    if (!dropdown) return null;
    let container = dropdown.querySelector('.notifications-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notifications-container';
      const tabs = dropdown.querySelector('.notif-tabs') || dropdown.firstChild;
      if (tabs) tabs.insertAdjacentElement('afterend', container);
      else dropdown.appendChild(container);
    }
    return container;
  }

  function getClubColor(clubName = 'C') {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6BCF7F', '#4D4D4D'];
    let hash = 0;
    for (let i = 0; i < clubName.length; i++) hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  function updateNotificationCount() {
    const unread = document.querySelectorAll('.notification-item.unread').length;
    const btn = document.querySelector('.icon-btn:nth-of-type(1)') ||
                document.querySelector('[data-notif-btn]') ||
                document.querySelector('.notif-btn') ||
                (document.querySelectorAll('.icon-btn')[0] || null);
    if (!btn) return;

    const existing = btn.querySelector('.notification-badge');
    if (existing) existing.remove();

    if (unread > 0) {
      const badge = document.createElement('span');
      badge.className = 'notification-badge';
      badge.textContent = unread > 99 ? '99+' : String(unread);
      Object.assign(badge.style, {
        position:'absolute', top:'-5px', right:'-5px', background:'#ff4444', color:'#fff',
        borderRadius:'50%', width:'18px', height:'18px', fontSize:'11px',
        display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'
      });
      btn.style.position = 'relative';
      btn.appendChild(badge);
    }
  }

  function showToastNotification(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; top:20px; right:20px; background:#333; color:#fff;
      padding:12px 20px; border-radius:8px; z-index:10000; transform:translateX(100%);
      transition:transform .3s ease; box-shadow:0 4px 12px rgba(0,0,0,.2);`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(()=>toast.style.transform='translateX(0)', 100);
    setTimeout(()=>{
      toast.style.transform='translateX(100%)';
      setTimeout(()=>toast.remove(), 300);
    }, 3000);
  }

  async function createEventEndNotification(userId, event, eventId) {
    // fetch club name if needed
    let clubName = event.clubName || 'Unknown Club';
    try {
      if (!event.clubName && event.clubId) {
        const clubDoc = await db.collection('clubs').doc(event.clubId).get();
        if (clubDoc.exists) clubName = clubDoc.data().name || clubName;
      }
    } catch (e) {}

    const notification = {
      userId,
      type: 'event_ended',
      title: 'Event Has Ended',
      message: `"${event.title || 'The event'}" by ${clubName} has concluded. Share your feedback!`,
      eventId,
      clubId: event.clubId,
      clubName,
      eventTitle: event.title || '',
      eventDate: event.date || null,
      eventTime: event.endTime || event.formattedEnd || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      read: false,
      priority: 'high'
    };

    const ref = await db.collection('notifications').add(notification);
    notification.id = ref.id;
    addEventEndNotificationToUI(notification);
  }

  function addEventEndNotificationToUI(notification) {
    const container = ensureNotifContainer();
    if (!container) return;

    const id = notification.id || `temp-${Date.now()}`;
    const html = `
      <div class="notification-item unread event-ended" data-club-id="${notification.clubId||''}" data-notification-id="${id}">
        <div class="notification-avatar">
          <div class="club-avatar" style="background:${getClubColor(notification.clubName)};">🎉</div>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">${notification.title}</span>
            <span class="notification-time">just now</span>
          </div>
          <p class="notification-message">${notification.message}</p>
          ${notification.eventTitle ? `<div class="notification-meta">📅 Event: ${notification.eventTitle}</div>` : ''}
        </div>
        <div class="notification-actions">
          <button class="notification-action-btn feedback-btn"
            onclick="openEventFeedback('${notification.eventId}','${(notification.eventTitle||'').replace(/'/g, "\\'")}')">
            Give Feedback
          </button>
          <button class="notification-action-btn mark-read-btn"
            onclick="(async()=>{try{
              if(!'${id}'.startsWith('temp-')) await db.collection('notifications').doc('${id}').update({read:true,readAt:firebase.firestore.FieldValue.serverTimestamp()});
              const el=document.querySelector('[data-notification-id=\\'${id}\\']'); if(el) el.classList.remove('unread');
              (${updateNotificationCount.toString()})();
            }catch(e){console.error(e)}})()">
            ✓
          </button>
        </div>
      </div>`;
    container.insertAdjacentHTML('afterbegin', html);
    updateNotificationCount();
    showToastNotification(`"${notification.eventTitle || 'The event'}" has ended - share your feedback!`);
  }

  // ============ Main checker (single source of truth) ============
  async function checkForRecentlyEndedEvents(userId) {
    try {
      if (!userId) return;
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) return;
      const clubs = userDoc.data().clubs || [];
      if (!clubs.length) return;

      const now = new Date();
      const cutoffMs = 60 * 60 * 1000; // last hour

      // Firestore 'in' limit of 10
      const batches = [];
      for (let i = 0; i < clubs.length; i += 10) batches.push(clubs.slice(i, i + 10));

      let allEvents = [];
      for (const batch of batches) {
        try {
          const snap = await db.collection('events').where('clubId', 'in', batch).get();
          snap.forEach(doc => allEvents.push({ id: doc.id, ...doc.data() }));
        } catch (e) {
          console.warn('events query batch error', e);
        }
      }

      for (const ev of allEvents) {
        const endTime = parseEventEndTime(ev);
        if (!endTime) continue;
        const dt = now - endTime;

        // ended within last hour
        if (dt > 0 && dt < cutoffMs) {
          const attendees = ev.attendees || [];
          if (!attendees.includes(userId)) continue;

          const exists = await checkEventEndNotificationExists(userId, ev.id);
          if (!exists) await createEventEndNotification(userId, ev, ev.id);
        }
      }
    } catch (e) {
      console.error('checkForRecentlyEndedEvents error', e);
    }
  }

  // ============ Feedback modal (simple) ============
  window.openEventFeedback = function(eventId, eventTitle) {
    const existing = document.querySelector('.feedback-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
    modal.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:10000;`;
    modal.innerHTML = `
      <div style="background:#fff; width:520px; max-width:90vw; border-radius:12px; padding:24px;">
        <div style="display:flex; align-items:center;">
          <h3 style="margin:0; font-size:18px;">🎉 Event Feedback</h3>
          <button onclick="this.closest('.feedback-modal').remove()" style="margin-left:auto; background:none; border:none; font-size:22px; cursor:pointer;">×</button>
        </div>
        <p style="color:#555;">How was <strong>"${eventTitle || ''}"</strong>?</p>
        <label style="display:block; margin:8px 0 4px;">Overall Rating</label>
        <div id="stars" style="display:flex; gap:8px; margin-bottom:12px;"></div>
        <label style="display:block; margin:8px 0 4px;">Comments</label>
        <textarea id="fb_text" style="width:100%; height:90px; border:1px solid #ddd; border-radius:8px; padding:10px;"></textarea>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:16px;">
          <button onclick="this.closest('.feedback-modal').remove()" style="padding:10px 16px; background:#f5f5f5; border:1px solid #ddd; border-radius:6px;">Skip</button>
          <button id="fb_submit" style="padding:10px 16px; background:#4caf50; color:#fff; border:none; border-radius:6px;">Submit</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    // stars
    const stars = modal.querySelector('#stars');
    let rating = 0;
    for (let i=1;i<=5;i++){
      const b = document.createElement('button');
      b.textContent = '⭐';
      Object.assign(b.style, {background:'none', border:'none', fontSize:'26px', cursor:'pointer', color:'#ddd'});
      b.dataset.rating = String(i);
      b.onmouseenter = ()=>{[...stars.children].forEach((s,idx)=>s.style.color = idx < i ? '#ffc107':'#ddd')};
      b.onclick = ()=>{rating = i; [...stars.children].forEach((s,idx)=>s.style.color = idx < rating ? '#ffc107':'#ddd')};
      stars.appendChild(b);
    }
    stars.onmouseleave = ()=>{[...stars.children].forEach((s,idx)=>s.style.color = idx < rating ? '#ffc107':'#ddd')};

    modal.querySelector('#fb_submit').onclick = async ()=>{
      try{
        const user = auth.currentUser;
        if(!user){ alert('Please sign in'); return; }
        if(!rating){ alert('Pick a rating'); return; }
        const txt = modal.querySelector('#fb_text').value.trim();
        await db.collection('eventFeedback').add({
          eventId, eventTitle: eventTitle || '', userId: user.uid, userEmail: user.email || '',
          rating, feedback: txt, submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        modal.remove();
        showToastNotification('Thanks for your feedback!');
      }catch(e){
        console.error(e); alert('Error submitting feedback.');
      }
    };
  };

  // ============ Start checker once on auth ============
  auth.onAuthStateChanged((user)=>{
    console.log('🔐 auth state:', user ? user.uid : 'null');
    if (!user) {
      if (window._endCheckerIntervalId) {
        clearInterval(window._endCheckerIntervalId);
        window._endCheckerIntervalId = null;
      }
      return;
    }

    // initial run after a tiny delay (to avoid race w/ first paints)
    setTimeout(()=>checkForRecentlyEndedEvents(user.uid), 1500);

    // every 10 minutes (adjust as needed)
    if (window._endCheckerIntervalId) clearInterval(window._endCheckerIntervalId);
    window._endCheckerIntervalId = setInterval(()=>checkForRecentlyEndedEvents(user.uid), 10*60*1000);
  });

  // ============ Minimal styles for ended card ============
  const style = document.createElement('style');
  style.textContent = `
    .event-ended{border-left:3px solid #4caf50 !important; background:#e8f5e9 !important;}
    .feedback-btn{background:#4caf50 !important; color:#fff !important; border-color:#4caf50 !important; font-weight:600;}
    .feedback-btn:hover{background:#388e3c !important; border-color:#388e3c !important;}
    .notifications-container{max-height:400px; overflow:auto;}
  `;
  document.head.appendChild(style);
}

function setupSurveyModal() {
    const closeSurveyModal = document.querySelector('.close-survey-modal');
    const surveyModal = document.getElementById('surveyModal');

    if (closeSurveyModal && surveyModal) {
        closeSurveyModal.addEventListener('click', function() {
            surveyModal.style.display = 'none';
        });

        surveyModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    } else {
        console.warn('Survey modal elements not found in DOM');
    }
}

// Call this function after DOM is loaded
setupSurveyModal();


     } catch (error) {
        console.error("Firebase initialization error:", error);
        alert("Failed to initialize Firebase. Please refresh the page.");
    }

    
});

console.log('Community platform JavaScript loaded!');


