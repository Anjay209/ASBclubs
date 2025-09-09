document.addEventListener('DOMContentLoaded', async function() {
    const firebaseConfig = {
        apiKey: "AIzaSyBoQcPq9ftoTfE8Wm7TOOcol0c_XPBXRpE",
        authDomain: "asbclubs-40fe1.firebaseapp.com",
        projectId: "asbclubs-40fe1",
        storageBucket: "asbclubs-40fe1.appspot.com",
        messagingSenderId: "534365161502",
        appId: "1:534365161502:web:940ee13b2b3f105b65860f",
        measurementId: "G-WCSQQDHHR1"
    };

    try {
        // Initialize Firebase
       // Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
}

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();

// Configure Firestore settings FIRST
db.settings({
    host: 'firestore.googleapis.com',
    cache: {
        kind: 'memory'
    }
}, { merge: true });

// Then initialize persistence
try {
    await db.enablePersistence({ synchronizeTabs: true })
        .then(() => console.log("Firestore persistence enabled"))
        .catch(err => {
            console.warn("Persistence error, using memory cache:", err);
        });
} catch (err) {
    console.error("Persistence initialization failed:", err);
}

// Now proceed with the rest of your app

        // Global variables for club joining
        let joiningClubData = null;
        
        // Debug access
        window.clubJoinDebug = {
            getClubData: () => joiningClubData,
            setClubData: (data) => { joiningClubData = data; }
        };

        // Function to load user's clubs in mini view
        function loadUserClubsMini(userId) {
            const container = document.getElementById('userClubsMini');
            
            // Check if container exists - if not, silently skip (this feature is optional)
            if (!container) {
                return; // Remove the console.warn since this is optional
            }
            
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
                    const clubIds = userData?.clubs || [];
                    
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
                                const clubElement = createClubMiniElement(club, doc.id);
                                container.appendChild(clubElement);
                            });
                        })
                        .catch(error => {
                            console.error("Error loading clubs:", error);
                            container.innerHTML = '<div class="error">Failed to load clubs</div>';
                        });
                })
                .catch(error => {
                    console.error("Error loading user data:", error);
                    container.innerHTML = '<div class="error">Failed to load user data</div>';
                });
        }

        // Helper function to create mini club element
        function createClubMiniElement(club, clubId) {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const initial = club.name ? club.name.charAt(0).toUpperCase() : '?';
            
            const clubElement = document.createElement('div');
            clubElement.className = 'user-club-mini';
            clubElement.style.backgroundColor = randomColor;
            clubElement.title = club.name || 'Unknown Club';
            clubElement.textContent = initial;
            clubElement.onclick = () => {
                window.location.href = `club.html?id=${clubId}`;
            };
            
            return clubElement;
        }

        // Function to handle joining a club
        async function handleJoinClub(isOfficer) {
            const user = auth.currentUser;
            if (!user) {
                alert('Please sign in first');
                return;
            }

            console.log('Joining club data:', joiningClubData); // Debug log
            
            if (!joiningClubData || !joiningClubData.id) {
                alert('Club information not found. Please search for the club again.');
                showInitialState();
                return;
            }

            try {
                // Show loading state
                const officerButtons = document.querySelectorAll('#officer-yes-inline, #officer-no-inline');
                officerButtons.forEach(btn => {
                    btn.disabled = true;
                    btn.textContent = 'Joining...';
                });

                // Add club to user's profile
                const userRef = db.collection('users').doc(user.uid);
                await db.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    const userData = userDoc.data() || {};
                    const userClubs = userData.clubs || [];
                    const userOfficerClubs = userData.officerClubs || [];

                    if (!userClubs.includes(joiningClubData.id)) {
                        userClubs.push(joiningClubData.id);
                    }

                    if (isOfficer && !userOfficerClubs.includes(joiningClubData.id)) {
                        userOfficerClubs.push(joiningClubData.id);
                    }

                    transaction.set(userRef, {
                        ...userData,
                        clubs: userClubs,
                        officerClubs: userOfficerClubs
                    }, { merge: true });
                });

                // Add user to club's members list
                const clubRef = db.collection('clubs').doc(joiningClubData.id);
                await clubRef.update({
                    members: firebase.firestore.FieldValue.arrayUnion(user.uid)
                });

                alert('Successfully joined the club!');
                
                // Redirect to index page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error joining club:', error);
                alert('Failed to join club. Please try again.');
                
                // Reset button states
                const officerYes = document.getElementById('officer-yes-inline');
                const officerNo = document.getElementById('officer-no-inline');
                if (officerYes && officerNo) {
                    officerYes.disabled = false;
                    officerYes.textContent = 'Yes';
                    officerNo.disabled = false;
                    officerNo.textContent = 'No';
                }
            }
        }

        // Function to hide all forms and show initial buttons
        function showInitialState() {
            const elements = {
                initialButtons: document.getElementById('initial-buttons'),
                joinForm: document.getElementById('join-form'),
                createForm: document.getElementById('create-form'),
                officerQuestion: document.getElementById('officer-question'),
                joinInput: document.getElementById('join-input'),
                createInput: document.getElementById('create-input')
            };

            // Show initial buttons and hide forms
            if (elements.initialButtons) elements.initialButtons.classList.remove('hidden');
            if (elements.joinForm) elements.joinForm.classList.add('hidden');
            if (elements.createForm) elements.createForm.classList.add('hidden');
            if (elements.officerQuestion) elements.officerQuestion.classList.add('hidden');
            
            // Clear input values
            if (elements.joinInput) elements.joinInput.value = '';
            if (elements.createInput) elements.createInput.value = '';
            
            // Reset global state - but don't reset if we're in the middle of joining
            // joiningClubData = null; // Commented out to preserve club data during join process
        }

        // Function to show join form
        function showJoinForm() {
            const elements = {
                initialButtons: document.getElementById('initial-buttons'),
                joinForm: document.getElementById('join-form'),
                createForm: document.getElementById('create-form'),
                joinInput: document.getElementById('join-input')
            };

            if (elements.initialButtons) elements.initialButtons.classList.add('hidden');
            if (elements.joinForm) elements.joinForm.classList.remove('hidden');
            if (elements.createForm) elements.createForm.classList.add('hidden');
            
            // Focus on input field
            setTimeout(() => {
                if (elements.joinInput) elements.joinInput.focus();
            }, 100);
        }

        // Function to show create form
        function showCreateForm() {
            const elements = {
                initialButtons: document.getElementById('initial-buttons'),
                joinForm: document.getElementById('join-form'),
                createForm: document.getElementById('create-form'),
                createInput: document.getElementById('create-input')
            };

            if (elements.initialButtons) elements.initialButtons.classList.add('hidden');
            if (elements.joinForm) elements.joinForm.classList.add('hidden');
            if (elements.createForm) elements.createForm.classList.remove('hidden');
            
            // Focus on input field
            setTimeout(() => {
                if (elements.createInput) elements.createInput.focus();
            }, 100);
        }

        // Initialize event listeners
        function initializeEventListeners() {
            // Get all necessary elements
            const elements = {
                joinClubBtn: document.getElementById('join-club-btn'),
                createClubBtn: document.getElementById('create-club-btn'),
                backFromJoin: document.getElementById('back-from-join'),
                backFromCreate: document.getElementById('back-from-create'),
                joinSubmit: document.getElementById('join-submit'),
                createSubmit: document.getElementById('create-submit'),
                joinInput: document.getElementById('join-input'),
                createInput: document.getElementById('create-input'),
                officerYesInline: document.getElementById('officer-yes-inline'),
                officerNoInline: document.getElementById('officer-no-inline'),
                officerQuestion: document.getElementById('officer-question')
            };

            // IMPORTANT: Make sure officer question is hidden initially
            if (elements.officerQuestion) {
                elements.officerQuestion.classList.add('hidden');
                console.log('Officer question hidden on init');
            }

            // Event listeners for main buttons
            if (elements.joinClubBtn) {
                elements.joinClubBtn.addEventListener('click', showJoinForm);
            }
            if (elements.createClubBtn) {
                elements.createClubBtn.addEventListener('click', showCreateForm);
            }

            // Event listeners for back buttons
            if (elements.backFromJoin) {
                elements.backFromJoin.addEventListener('click', () => {
                    console.log('Back from join clicked - clearing club data');
                    joiningClubData = null; // Only clear when explicitly going back
                    showInitialState();
                });
            }
            if (elements.backFromCreate) {
                elements.backFromCreate.addEventListener('click', () => {
                    showInitialState();
                });
            }

            // Join form submission
            if (elements.joinSubmit) {
                elements.joinSubmit.addEventListener('click', async function() {
                    console.log('Join submit clicked'); // Debug
                    const clubName = elements.joinInput ? elements.joinInput.value.trim() : '';
                    console.log('Club name entered:', clubName); // Debug
                    
                    if (!clubName) {
                        alert('Please enter a club name');
                        if (elements.joinInput) elements.joinInput.focus();
                        return;
                    }

                    try {
                        // Show loading state
                        elements.joinSubmit.disabled = true;
                        elements.joinSubmit.textContent = 'Searching...';

                        console.log('Starting club search for:', clubName); // Debug

                        // Search for club by name (case-insensitive)
                        const clubsRef = db.collection('clubs');
                        const snapshot = await clubsRef.where('name', '==', clubName).get();
                        
                        console.log('Search snapshot size:', snapshot.size); // Debug
                        
                        if (snapshot.empty) {
                            console.log('No exact match found, trying case-insensitive search'); // Debug
                            
                            // Try case-insensitive search as backup
                            const allClubs = await clubsRef.get();
                            let foundClub = null;
                            
                            console.log('Total clubs to search through:', allClubs.size); // Debug
                            
                            allClubs.forEach(doc => {
                                const club = doc.data();
                                console.log('Checking club:', club.name, 'vs', clubName); // Debug
                                if (club.name && club.name.toLowerCase() === clubName.toLowerCase()) {
                                    foundClub = { id: doc.id, data: club };
                                    console.log('Found matching club:', foundClub); // Debug
                                }
                            });
                            
                            if (!foundClub) {
                                console.log('No club found at all'); // Debug
                                alert('Club not found. Please check the name and try again.');
                                elements.joinSubmit.disabled = false;
                                elements.joinSubmit.textContent = 'Join Club';
                                return;
                            }
                            
                            joiningClubData = foundClub;
                        } else {
                            // Store the club data
                            const clubDoc = snapshot.docs[0];
                            joiningClubData = {
                                id: clubDoc.id,
                                data: clubDoc.data()
                            };
                            console.log('Found club via exact match:', joiningClubData); // Debug
                        }
                        
                        console.log('Final joiningClubData:', joiningClubData); // Debug log
                        console.log('Club ID:', joiningClubData.id); // Debug log
                        console.log('Club name:', joiningClubData.data.name); // Debug log
                        
                        // Double-check that joiningClubData is set
                        if (!joiningClubData || !joiningClubData.id) {
                            alert('Error: Failed to store club information');
                            elements.joinSubmit.disabled = false;
                            elements.joinSubmit.textContent = 'Join Club';
                            return;
                        }
                        
                        // Show the officer question
                        const officerQuestion = document.getElementById('officer-question');
                        if (officerQuestion) {
                            officerQuestion.classList.remove('hidden');
                            console.log('Officer question shown'); // Debug
                        } else {
                            console.error('Officer question element not found');
                        }

                        // Reset button state
                        elements.joinSubmit.disabled = false;
                        elements.joinSubmit.textContent = 'Join Club';
                        
                    } catch (error) {
                        console.error('Error searching for club:', error);
                        alert('An error occurred while searching for the club.');
                        elements.joinSubmit.disabled = false;
                        elements.joinSubmit.textContent = 'Join Club';
                    }
                });
            }

            // Create form submission
            if (elements.createSubmit) {
                elements.createSubmit.addEventListener('click', function() {
                    const clubName = elements.createInput ? elements.createInput.value.trim() : '';
                    if (clubName) {
                        // Store the club name and redirect to create.html
                        localStorage.setItem('clubName', clubName);
                        localStorage.setItem('action', 'create');
                        window.location.href = 'creating.html';
                    } else {
                        alert('Please enter a club name');
                        if (elements.createInput) elements.createInput.focus();
                    }
                });
            }

            // Officer question handlers - with safety checks
            if (elements.officerYesInline) {
                elements.officerYesInline.addEventListener('click', () => {
                    console.log('Officer Yes clicked, club data:', joiningClubData);
                    
                    if (!joiningClubData) {
                        alert('Please search for a club first by clicking "Join Club"');
                        return;
                    }
                    
                    handleJoinClub(true);
                });
            }
            if (elements.officerNoInline) {
                elements.officerNoInline.addEventListener('click', () => {
                    console.log('Officer No clicked, club data:', joiningClubData);
                    
                    if (!joiningClubData) {
                        alert('Please search for a club first by clicking "Join Club"');
                        return;
                    }
                    
                    handleJoinClub(false);
                });
            }

            // Handle Enter key press in input fields
            if (elements.joinInput) {
                elements.joinInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && elements.joinSubmit) {
                        elements.joinSubmit.click();
                    }
                });
            }

            if (elements.createInput) {
                elements.createInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && elements.createSubmit) {
                        elements.createSubmit.click();
                    }
                });
            }

            // Handle Escape key to go back
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const joinForm = document.getElementById('join-form');
                    const createForm = document.getElementById('create-form');
                    if ((joinForm && !joinForm.classList.contains('hidden')) || 
                        (createForm && !createForm.classList.contains('hidden'))) {
                        showInitialState();
                    }
                }
            });
        }

        // Authentication state observer
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("User authenticated:", user.uid);
                // Only load mini clubs if the container exists
                const miniContainer = document.getElementById('userClubsMini');
                if (miniContainer) {
                    loadUserClubsMini(user.uid);
                }
            } else {
                console.log("User not authenticated");
                // Clear mini clubs display if container exists
                const container = document.getElementById('userClubsMini');
                if (container) {
                    container.innerHTML = '';
                }
            }
        });

        // Initialize event listeners
        initializeEventListeners();

        console.log('Community platform loaded successfully!');

    } catch (error) {
        console.error("Firebase initialization error:", error);

    }
});