

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
        const db = firebase.firestore();
        const auth = firebase.auth();
        
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
    
    // Calendar generation code
    let currentDate = new Date();
    let currentModalEvent = null;
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYear = document.querySelector('.calendar-title h2');
    let events = [];
    let currentUser = null;
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
    
    // Listen for auth state changes
   auth.onAuthStateChanged(async (user) => {
    try {
        currentUser = user;
        
        if (user) {
            console.log('✅ User authenticated:', user.uid);
            console.log('📧 User email:', user.email);
            
            // Test Firebase connection
            await db.collection('users').doc(user.uid).get();
            console.log('✅ Firebase connection working');
            
            // Load events
            await loadEventsFromFirebase();
            
            // Setup dropdowns
            setupClubDropdown();
            
            // Wait a moment for UI to be ready
            setTimeout(async () => {
                await populateClubDropdown();
            }, 500);
            
        } else {
            console.log('❌ User not authenticated');
            events = [];
            generateCalendar();
        }
    } catch (error) {
        console.error('❌ Error in auth state change:', error);
        alert('Authentication error. Please refresh the page.');
    }
});

console.log('🔧 Club dropdown fixes loaded!');

    function setupClubDropdown() {
    const clubDropdown = document.getElementById('clubDropdown');
    const clubOptions = document.getElementById('clubOptions');
    
    if (clubDropdown && clubOptions) {
        clubDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            clubDropdown.classList.toggle('active');
            document.querySelectorAll('.dropdown').forEach(drop => {
                if (drop !== clubDropdown) drop.classList.remove('active');
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', function() {
            clubDropdown.classList.remove('active');
        });
    }
}
    
    // Firebase event functions
async function saveEventToFirebase(eventData) {
    console.log('💾 Saving event to Firebase');
    console.log('👤 Current user:', currentUser ? currentUser.uid : 'null');
    
    if (!currentUser) {
        alert('You must be logged in to create events');
        return null;
    }
    
    const clubDropdown = document.getElementById('clubDropdown');
    
    // Enhanced debugging for club selection
    console.log('🏠 Club dropdown element:', clubDropdown);
    console.log('🏠 Dataset:', clubDropdown?.dataset);
    console.log('🏠 All dataset properties:', Object.keys(clubDropdown?.dataset || {}));
    
    const selectedClubId = clubDropdown?.dataset?.selectedClubId;
    console.log('🏠 Selected club ID:', selectedClubId);
    
    if (!selectedClubId) {
        // More detailed error message
        const dropdownText = clubDropdown?.textContent || 'Unknown';
        console.error('❌ No club selected. Dropdown shows:', dropdownText);
        alert('Please select a club for this event. Current selection: ' + dropdownText);
        return null;
    }
    
    try {
        // Get club details
        console.log('📖 Getting club document:', selectedClubId);
        const clubDoc = await db.collection('clubs').doc(selectedClubId).get();
        
        if (!clubDoc.exists) {
            alert('Selected club not found');
            return null;
        }
        
        const clubData = clubDoc.data();
        console.log('🏠 Club data:', clubData);
        
        const eventToSave = {
            ...eventData,
            createdBy: currentUser.uid,
            createdByEmail: currentUser.email,
            clubId: selectedClubId,
            clubName: clubData.name || 'Unknown Club',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            attendees: [currentUser.uid],
            attendeeCount: 1,
            status: 'active'
        };
        
        console.log('📤 Event to save:', eventToSave);
        
        const docRef = await db.collection('events').add(eventToSave);
        console.log('✅ Event saved to Firebase with ID:', docRef.id);
        
        return docRef.id;
    } catch (error) {
        console.error('❌ Error saving event to Firebase:', error);
        alert('Failed to save event. Please try again.');
        return null;
    }
}

// PROBLEM 5: Debug function to check user clubs
async function debugUserClubs() {
    if (!currentUser) {
        console.log('❌ No current user');
        return;
    }
    
    try {
        console.log('🔍 Debugging user clubs for:', currentUser.uid);
        
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (!userDoc.exists) {
            console.log('❌ User document does not exist');
            return;
        }
        
        const userData = userDoc.data();
        console.log('👤 Full user data:', userData);
        console.log('🏠 User clubs array:', userData.clubs);
        
        if (userData.clubs && userData.clubs.length > 0) {
            console.log('📊 Checking each club:');
            
            for (const clubId of userData.clubs) {
                const clubDoc = await db.collection('clubs').doc(clubId).get();
                if (clubDoc.exists) {
                    console.log(`✅ Club ${clubId}:`, clubDoc.data());
                } else {
                    console.log(`❌ Club ${clubId}: Document not found`);
                }
            }
        } else {
            console.log('⚠️ User has no clubs in their profile');
        }
        
    } catch (error) {
        console.error('❌ Error debugging user clubs:', error);
    }
}

window.debugUserClubs = debugUserClubs;


    async function loadEventsFromFirebase() {
        if (!currentUser) return;
        
        try {
            console.log('Loading events from Firebase...');
            
            // Load events created by user or events they're attending
            const eventsSnapshot = await db.collection('events')
                .where('attendees', 'array-contains', currentUser.uid)
                .orderBy('date', 'asc')
                .get();
            
            events = [];
            eventsSnapshot.forEach(doc => {
                const eventData = doc.data();
                const event = {
                    id: doc.id,
                    firebaseId: doc.id,
                    title: eventData.title,
                    date: eventData.date,
                    startTime: eventData.startTime,
                    endTime: eventData.endTime,
                    formattedDate: eventData.formattedDate,
                    formattedStart: eventData.formattedStart,
                    formattedEnd: eventData.formattedEnd,
                    space: eventData.space,
                    topics: eventData.topics || [],
                    location: eventData.location,
                    paymentType: eventData.paymentType,
                    repeat: eventData.repeat,
                    color: eventData.color,
                    createdBy: eventData.createdBy,
                    attendees: eventData.attendees || [],
                    attendeeCount: eventData.attendeeCount || 0,
                    status: eventData.status || 'active'
                };
                events.push(event);
            });
            
            console.log(`Loaded ${events.length} events from Firebase`);
            generateCalendar();
            
        } catch (error) {
            console.error('Error loading events from Firebase:', error);
        }
    }
    
    async function updateEventInFirebase(eventId, updates) {
        if (!currentUser) return false;
        
        try {
            const updateData = {
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('events').doc(eventId).update(updateData);
            console.log('Event updated in Firebase');
            return true;
        } catch (error) {
            console.error('Error updating event:', error);
            return false;
        }
    }
    
    async function deleteEventFromFirebase(eventId) {
        if (!currentUser) return false;
        
        try {
            // Check if user is the creator
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                alert('Event not found');
                return false;
            }
            
            const eventData = eventDoc.data();
            if (eventData.createdBy !== currentUser.uid) {
                alert('You can only delete events you created');
                return false;
            }
            
            await db.collection('events').doc(eventId).delete();
            console.log('Event deleted from Firebase');
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            return false;
        }
    }
    
    async function joinEvent(eventId) {
        if (!currentUser) {
            alert('You must be logged in to join events');
            return false;
        }
        
        try {
            await db.collection('events').doc(eventId).update({
                attendees: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
                attendeeCount: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Successfully joined event');
            loadEventsFromFirebase(); // Refresh events
            return true;
        } catch (error) {
            console.error('Error joining event:', error);
            alert('Failed to join event');
            return false;
        }
    }
    
    async function leaveEvent(eventId) {
        if (!currentUser) return false;
        
        try {
            await db.collection('events').doc(eventId).update({
                attendees: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
                attendeeCount: firebase.firestore.FieldValue.increment(-1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Successfully left event');
            loadEventsFromFirebase(); // Refresh events
            return true;
        } catch (error) {
            console.error('Error leaving event:', error);
            return false;
        }
    }
    
    // Calendar generation function
    function generateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        if (monthYear) {
            monthYear.textContent = `${monthNames[month]} ${year}`;
        }

        // Clear previous calendar
        if (calendarGrid) {
            calendarGrid.innerHTML = '';

            // Add empty cells for days before the first of the month
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                calendarGrid.appendChild(emptyDay);
            }

            // Add cells for each day of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.dataset.date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = day;
                
                dayElement.appendChild(dayNumber);
                calendarGrid.appendChild(dayElement);
            }
            
            // Re-render events after calendar update
            renderEvents();
        }
    }

    // Navigation functionality
    const prevBtn = document.querySelector('.prev-month');
    const nextBtn = document.querySelector('.next-month');

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        });
    }
async function populateClubDropdown() {
    console.log('🏠 Starting populateClubDropdown');
    console.log('👤 Current user:', currentUser ? currentUser.uid : 'null');
    
    const clubDropdown = document.getElementById('clubDropdown');
    const clubOptions = document.getElementById('clubOptions');
    
    if (!clubDropdown || !clubOptions) {
        console.error("❌ Dropdown elements not found");
        return;
    }

    // Check if user is authenticated
    if (!currentUser) {
        console.error("❌ No authenticated user");
        clubDropdown.innerHTML = '<span>Please log in</span>';
        return;
    }

    // Show loading state
    clubDropdown.innerHTML = '<span>Loading clubs...</span>';
    clubOptions.innerHTML = '';

    try {
        console.log('📖 Getting user document for:', currentUser.uid);
        
        // 1. Get user's clubs
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (!userDoc.exists) {
            console.error("❌ User document not found for:", currentUser.uid);
            clubDropdown.innerHTML = '<span>User profile not found</span>';
            return;
        }

        const userData = userDoc.data();
        console.log('👤 User data:', userData);
        
        const clubIds = userData.clubs || [];
        console.log('🏠 User clubs:', clubIds);
        
        if (clubIds.length === 0) {
            console.log('⚠️ User has no clubs');
            clubDropdown.innerHTML = '<span>No clubs available</span>';
            return;
        }

        // 2. Get all club documents (handle Firestore 'in' query limit of 10)
        const clubSnapshots = [];
        
        // Process in batches of 10 (Firestore limitation)
        for (let i = 0; i < clubIds.length; i += 10) {
            const batch = clubIds.slice(i, i + 10);
            console.log('📊 Querying clubs batch:', batch);
            
            const batchSnapshots = await Promise.all(
                batch.map(id => db.collection('clubs').doc(id).get())
            );
            
            clubSnapshots.push(...batchSnapshots);
        }

        // 3. Filter valid clubs and create options
        clubOptions.innerHTML = '';
        let hasValidClubs = false;
        let validClubs = [];
        
        clubSnapshots.forEach(snap => {
            if (snap.exists) {
                hasValidClubs = true;
                const club = snap.data();
                validClubs.push({ id: snap.id, data: club });
                console.log('🏠 Processing club:', club.name, 'ID:', snap.id);
                
                const option = document.createElement('div');
                option.className = 'dropdown-option';
                option.textContent = club.name || `Club (${snap.id})`;
                
                // Fixed: Store club ID properly and set up click handler correctly
                option.addEventListener('click', function() {
                    console.log('🔘 Selected club:', club.name, 'ID:', snap.id);
                    
                    // Update dropdown display
                    clubDropdown.innerHTML = `<span>${club.name || snap.id}</span><i class="fas fa-chevron-down"></i>`;
                    
                    // CRITICAL FIX: Set the dataset property correctly
                    clubDropdown.dataset.selectedClubId = snap.id;
                    
                    // Close dropdown
                    clubDropdown.classList.remove('active');
                    
                    // Debug log to confirm
                    console.log('✅ Club ID stored:', clubDropdown.dataset.selectedClubId);
                });
                
                clubOptions.appendChild(option);
            } else {
                console.warn('⚠️ Club document not found:', snap.id);
            }
        });

        if (!hasValidClubs) {
            clubDropdown.innerHTML = '<span>No valid clubs found</span>';
        } else if (validClubs.length === 1) {
            // Auto-select if only one club
            const club = validClubs[0];
            clubDropdown.innerHTML = `<span>${club.data.name || club.id}</span><i class="fas fa-chevron-down"></i>`;
            clubDropdown.dataset.selectedClubId = club.id;
            console.log('🔄 Auto-selected single club:', club.id);
        } else {
            // Show default text when multiple clubs available
            clubDropdown.innerHTML = '<span>Select a club</span><i class="fas fa-chevron-down"></i>';
            // Clear any previous selection
            delete clubDropdown.dataset.selectedClubId;
        }

        console.log('✅ Club dropdown populated successfully');

    } catch (error) {
        console.error("❌ Failed to load clubs:", error);
        clubDropdown.innerHTML = '<span>Error loading clubs</span>';
    }
}




    

    // Initial calendar generation
    generateCalendar();
    
    // Modal functionality
    const newEventBtn = document.querySelector('.new-event-btn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    const cancelEvent = document.getElementById('cancelEvent');
    const createEvent = document.getElementById('createEvent');
    
    // Initialize modal state
    function resetModal() {
        const eventTitleEl = document.getElementById('eventTitle');
        const eventDateEl = document.getElementById('eventDate');
        const startTimeEl = document.getElementById('startTime');
        const endTimeEl = document.getElementById('endTime');
        const startAmPmEl = document.getElementById('startAmPm');
        const endAmPmEl = document.getElementById('endAmPm');
           const spaceInput = document.getElementById('spaceDropdown');
        
        if (eventTitleEl) eventTitleEl.value = '';
        if (eventDateEl) eventDateEl.value = '';
        if (startTimeEl) startTimeEl.value = '09:00';
        if (endTimeEl) endTimeEl.value = '10:00';
        if (startAmPmEl) startAmPmEl.value = 'AM';
        if (endAmPmEl) endAmPmEl.value = 'AM';
         if (spaceInput) spaceInput.value = '';
        
        // Reset dropdowns
        const spaceDropdown = document.getElementById('spaceDropdown');
        const topicsDropdown = document.getElementById('topicsDropdown');
        const locationDropdown = document.getElementById('locationDropdown');
        
        if (spaceDropdown) spaceDropdown.innerHTML = '<span>Select space</span><i class="fas fa-chevron-down"></i>';
        if (topicsDropdown) topicsDropdown.innerHTML = '<span>Choose up to 5 topics</span><i class="fas fa-chevron-down"></i>';
        if (locationDropdown) locationDropdown.innerHTML = '<span>Select location</span><i class="fas fa-chevron-down"></i>';
        
        // Reset checkboxes
        document.querySelectorAll('#topicsOptions input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset radio buttons
        document.querySelectorAll('.radio-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('.fa-check')?.remove();
        });
        const freeOption = document.querySelector('.radio-option[data-value="free"]');
        if (freeOption) {
            freeOption.classList.add('selected');
            freeOption.innerHTML = `
                <div class="radio-circle"></div>
                <span>Free event</span>
                <i class="fas fa-check"></i>
            `;
        }
        
        // Reset repeat options
        document.querySelectorAll('.repeats-option').forEach(option => {
            option.classList.remove('selected');
            option.querySelector('.fa-check')?.remove();
        });
        const noneOption = document.querySelector('.repeats-option[data-value="none"]');
        if (noneOption) {
            noneOption.classList.add('selected');
            noneOption.innerHTML = `
                <span>Does not repeat</span>
                <i class="fas fa-check"></i>
            `;
        }
    }
    
    // Dropdown functionality
 function setupDropdowns() {
    console.log('🔧 Setting up all dropdowns...');
    
    // Space dropdown
    const spaceDropdown = document.getElementById('spaceDropdown');
    const spaceOptions = document.getElementById('spaceOptions');
    
    if (spaceDropdown && spaceOptions) {
        console.log('🏢 Setting up space dropdown');
        
        spaceDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('🔽 Space dropdown clicked');
            spaceDropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(drop => {
                if (drop !== spaceDropdown) drop.classList.remove('active');
            });
        });
        
        // Set up space options click handlers
        spaceOptions.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('🏢 Space selected:', this.textContent);
                spaceDropdown.innerHTML = `<span>${this.textContent}</span><i class="fas fa-chevron-down"></i>`;
                spaceDropdown.classList.remove('active');
                
                // Store selected value in dataset
                spaceDropdown.dataset.selectedValue = this.textContent;
            });
        });
    }
    
    // Topics dropdown (multi-select)
    const topicsDropdown = document.getElementById('topicsDropdown');
    const topicsOptions = document.getElementById('topicsOptions');
    
    if (topicsDropdown && topicsOptions) {
        console.log('📚 Setting up topics dropdown');
        
        topicsDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('🔽 Topics dropdown clicked');
            topicsDropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(drop => {
                if (drop !== topicsDropdown) drop.classList.remove('active');
            });
        });
        
        // Set up topics checkboxes
        topicsOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                
                const checkedOptions = topicsOptions.querySelectorAll('input[type="checkbox"]:checked');
                
                if (checkedOptions.length > 5) {
                    this.checked = false;
                    alert('You can select up to 5 topics only');
                    return;
                }
                
                console.log('📚 Topics selected:', checkedOptions.length);
                
                if (checkedOptions.length === 0) {
                    topicsDropdown.innerHTML = '<span>Choose up to 5 topics</span><i class="fas fa-chevron-down"></i>';
                } else {
                    const selectedLabels = Array.from(checkedOptions).map(cb => 
                        cb.nextElementSibling.textContent).join(', ');
                    topicsDropdown.innerHTML = `<span>${selectedLabels}</span><i class="fas fa-chevron-down"></i>`;
                }
            });
        });
        
        // Prevent dropdown from closing when clicking inside topics options
        topicsOptions.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Location dropdown
    const locationDropdown = document.getElementById('locationDropdown');
    const locationOptions = document.getElementById('locationOptions');
    
    if (locationDropdown && locationOptions) {
        console.log('📍 Setting up location dropdown');
        
        locationDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('🔽 Location dropdown clicked');
            locationDropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(drop => {
                if (drop !== locationDropdown) drop.classList.remove('active');
            });
        });
        
        // Set up location options click handlers
        locationOptions.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('📍 Location selected:', this.textContent);
                locationDropdown.innerHTML = `<span>${this.textContent}</span><i class="fas fa-chevron-down"></i>`;
                locationDropdown.classList.remove('active');
                
                // Store selected value in dataset
                locationDropdown.dataset.selectedValue = this.textContent;
            });
        });
    }
    
    // Club dropdown setup (separate function)
    setupClubDropdownOnly();
    
    // Close all dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        // Only close if click is outside any dropdown
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(drop => {
                drop.classList.remove('active');
            });
        }
    });
    
    console.log('✅ All dropdowns setup complete');
}

// 2. Separate club dropdown setup function
function setupClubDropdownOnly() {
    const clubDropdown = document.getElementById('clubDropdown');
    const clubOptions = document.getElementById('clubOptions');
    
    if (clubDropdown && clubOptions) {
        console.log('🏠 Setting up club dropdown');
        
        // Remove existing listeners by cloning (only for club dropdown)
        const newClubDropdown = clubDropdown.cloneNode(true);
        const newClubOptions = clubOptions.cloneNode(true);
        
        clubDropdown.parentNode.replaceChild(newClubDropdown, clubDropdown);
        clubOptions.parentNode.replaceChild(newClubOptions, clubOptions);
        
        // Get fresh references
        const freshClubDropdown = document.getElementById('clubDropdown');
        const freshClubOptions = document.getElementById('clubOptions');
        
        if (freshClubDropdown && freshClubOptions) {
            freshClubDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('🔽 Club dropdown clicked');
                freshClubDropdown.classList.toggle('active');
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown').forEach(drop => {
                    if (drop !== freshClubDropdown) drop.classList.remove('active');
                });
            });
        }
        
        console.log('✅ Club dropdown setup complete');
    }
}

    // Radio button functionality
    function setupRadioButtons() {
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.radio-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('.fa-check')?.remove();
                });
                
                this.classList.add('selected');
                this.innerHTML = `
                    <div class="radio-circle"></div>
                    <span>${this.querySelector('span').textContent}</span>
                    <i class="fas fa-check"></i>
                `;
            });
        });
    }
    
    // Repeat options functionality
    function setupRepeatOptions() {
        document.querySelectorAll('.repeats-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.repeats-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('.fa-check')?.remove();
                });
                
                this.classList.add('selected');
                this.innerHTML = `
                    <span>${this.querySelector('span').textContent}</span>
                    <i class="fas fa-check"></i>
                `;
            });
        });
    }
    
    // Initialize all modal components
    setupDropdowns();
    setupRadioButtons();
    setupRepeatOptions();
    
    // Modal open/close
  if (newEventBtn) {
    newEventBtn.addEventListener('click', async function() {
        console.log('🎯 New event button clicked');
        console.log('👤 Current user:', currentUser ? currentUser.uid : 'null');
        
        if (!currentUser) {
            alert('Please log in to create events');
            return;
        }
        
        // Show loading state on button
        const originalText = this.textContent;
        this.textContent = 'Loading...';
        this.disabled = true;
        
        try {
            resetModal();
            
            // Set today's date as default
            const today = new Date();
            const eventDateEl = document.getElementById('eventDate');
            if (eventDateEl) {
                eventDateEl.valueAsDate = today;
            }
            
            // Load clubs before showing modal
            await populateClubDropdown();
            
            // Check if user has clubs
            const clubDropdown = document.getElementById('clubDropdown');
            const dropdownText = clubDropdown.textContent.trim();
            
            if (dropdownText.includes("No clubs available") || 
                dropdownText.includes("User profile not found") ||
                dropdownText.includes("Error loading clubs")) {
                alert("You need to join a club before creating events. Please visit the clubs page to join a club.");
                return;
            }
            
            // Show modal only after clubs are loaded
            if (modalOverlay) {
                modalOverlay.style.display = 'flex';
            }
            
        } catch (error) {
            console.error("❌ Error loading clubs:", error);
            alert("Failed to load your clubs. Please try again.");
        } finally {
            // Reset button state
            this.textContent = originalText;
            this.disabled = false;
        }
    });
}

    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
    
    if (cancelEvent) {
        cancelEvent.addEventListener('click', function() {
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
    
    // Event creation
    if (createEvent) {
        createEvent.addEventListener('click', async function() {
            if (!currentUser) {
                alert('Please log in to create events');
                return;
            }
            
            const eventTitleEl = document.getElementById('eventTitle');
            const eventDateEl = document.getElementById('eventDate');
            const startTimeEl = document.getElementById('startTime');
            const startAmPmEl = document.getElementById('startAmPm');
            const endTimeEl = document.getElementById('endTime');
            const endAmPmEl = document.getElementById('endAmPm');
            
            const eventTitle = eventTitleEl ? eventTitleEl.value.trim() : '';
            const eventDate = eventDateEl ? eventDateEl.value : '';
            const startTime = startTimeEl ? startTimeEl.value : '09:00';
            const startAmPm = startAmPmEl ? startAmPmEl.value : 'AM';
            const endTime = endTimeEl ? endTimeEl.value : '10:00';
            const endAmPm = endAmPmEl ? endAmPmEl.value : 'AM';
            
            // Validate required fields
            if (!eventTitle) {
                alert('Please enter a title for your event');
                return;
            }
            
            if (!eventDate) {
                alert('Please select a date for your event');
                return;
            }
            
            const spaceInput = document.getElementById('spaceDropdown');
        const spaceValue = spaceInput ? spaceInput.value.trim() : '';
        if (!spaceValue) {
            alert('Please enter a space for your event');
            return;
        }
            
            // Show loading state
            const originalText = this.textContent;
            this.textContent = 'Creating...';
            this.disabled = true;
            
            try {
                // Convert 12-hour time to 24-hour for proper sorting
                const convertTo24Hour = (time, ampm) => {
                    const [hours, minutes] = time.split(':');
                    let hour = parseInt(hours, 10);
                    
                    if (ampm === 'PM' && hour < 12) {
                        hour += 12;
                    } else if (ampm === 'AM' && hour === 12) {
                        hour = 0;
                    }
                    
                    return `${hour.toString().padStart(2, '0')}:${minutes}`;
                };
                
                const startTime24 = convertTo24Hour(startTime, startAmPm);
                const endTime24 = convertTo24Hour(endTime, endAmPm);
                
                // Format the date for display
                const dateObj = new Date(eventDate);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                
                // Format time for display
                const formatTimeDisplay = (time, ampm) => {
                    const [hours, minutes] = time.split(':');
                    let hour = parseInt(hours, 10);
                    const period = ampm;
                    const hour12 = hour % 12 || 12;
                    return `${hour12}:${minutes} ${period}`;
                };
                
                const formattedStartTime = formatTimeDisplay(startTime, startAmPm);
                const formattedEndTime = formatTimeDisplay(endTime, endAmPm);
                
                // Get selected topics
                const selectedTopics = [];
                const topicsOptions = document.getElementById('topicsOptions');
                if (topicsOptions) {
                    topicsOptions.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                        selectedTopics.push(checkbox.nextElementSibling.textContent);
                    });
                }
                
                // Get selected values
                const selectedSpace = spaceValue;
                const locationDropdown = document.getElementById('locationDropdown');
                const selectedLocation = locationDropdown ? locationDropdown.querySelector('span').textContent : '';
                const selectedPayment = document.querySelector('.radio-option.selected');
                const selectedRepeat = document.querySelector('.repeats-option.selected');
                
                // Create the event object
                const event = {
                    id: Date.now().toString(),
                    title: eventTitle,
                    date: eventDate,
                    startTime: startTime24,
                    endTime: endTime24,
                    formattedDate: formattedDate,
                    formattedStart: formattedStartTime,
                    formattedEnd: formattedEndTime,
                    space: selectedSpace,
                    topics: selectedTopics,
                    location: selectedLocation === 'Select location' ? '' : selectedLocation,
                    paymentType: selectedPayment ? selectedPayment.dataset.value : 'free',
                    repeat: selectedRepeat ? selectedRepeat.dataset.value : 'none',
                    color: getRandomColor()
                };
                
                // Save the event to Firebase
                const firebaseId = await saveEventToFirebase(event);
                
                if (firebaseId) {
                    // Add to local events array
                    event.firebaseId = firebaseId;
                    event.createdBy = currentUser.uid;
                    event.attendees = [currentUser.uid];
                    events.push(event);
                    
                    // Close the modal
                    if (modalOverlay) {
                        modalOverlay.style.display = 'none';
                    }
                    
                    // Refresh the calendar to show the new event
                    renderEvents();
                    
                    console.log('Event created successfully:', event);
                } else {
                    // Firebase save failed, don't add to local array
                    console.error('Failed to save event to Firebase');
                }
                
            } catch (error) {
                console.error('Error creating event:', error);
                alert('Failed to create event. Please try again.');
            } finally {
                // Reset button state
                this.textContent = originalText;
                this.disabled = false;
            }
        });
    }
    // Add this near your other modal functions
async function sendEventSurvey(event) {
    if (!currentUser || event.createdBy !== currentUser.uid) {
        alert('Only the event creator can send surveys');
        return;
    }

    // Enhanced attendee count checking
    let attendeeCount = 0;
    let attendeesList = [];
    
    console.log('🔍 Checking event attendees:', event);
    
    if (event.attendees && Array.isArray(event.attendees)) {
        attendeesList = event.attendees.filter(attendeeId => attendeeId && attendeeId.trim() !== '');
        attendeeCount = attendeesList.length;
        console.log('📊 Attendees array:', attendeesList);
    } else if (event.attendeeCount && typeof event.attendeeCount === 'number') {
        attendeeCount = event.attendeeCount;
        console.log('📊 Using attendeeCount field:', attendeeCount);
    }
    
    console.log('👥 Final attendee count:', attendeeCount);

    // Check if event has attendees
    if (attendeeCount === 0) {
        alert('No attendees to send survey to. Make sure people have RSVPed to your event first.');
        return;
    }

    // More detailed confirmation message
    const attendeeText = attendeeCount === 1 ? 'attendee' : 'attendees';
   

    try {
        // Show loading state
        const surveyBtn = document.querySelector('.event-modal-btn.survey');
        if (surveyBtn) {
            const originalText = surveyBtn.textContent;
            surveyBtn.textContent = 'Sending...';
            surveyBtn.disabled = true;
        }

        // Create survey document in Firebase
        const surveyData = {
            eventId: event.firebaseId || event.id,
            eventTitle: event.title,
            eventDate: event.date,
            creatorId: currentUser.uid,
            creatorEmail: currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            attendees: attendeesList.length > 0 ? attendeesList : [currentUser.uid], // Fallback
            attendeeCount: attendeeCount,
            responses: {},
            status: 'active'
        };

        console.log('📤 Survey data to save:', surveyData);

        const docRef = await db.collection('surveys').add(surveyData);
        console.log('✅ Survey created with ID:', docRef.id);

        // Create notifications for each attendee
        if (attendeesList.length > 0) {
            const notifications = attendeesList.map(attendeeId => ({
                userId: attendeeId,
                type: 'survey_request',
                eventId: event.firebaseId || event.id,
                surveyId: docRef.id,
                eventTitle: event.title,
                message: `Please provide feedback for "${event.title}"`,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            }));

            // Save all notifications in batches
            const batch = db.batch();
            notifications.forEach(notification => {
                const notifRef = db.collection('notifications').doc();
                batch.set(notifRef, notification);
            });
            
            await batch.commit();
            console.log('✅ Notifications sent to all attendees');
        }
        
        // Success message with actual count
        // Update button to show success
if (surveyBtn) {
    surveyBtn.textContent = 'Survey Sent';
}

// Close modal after delay
setTimeout(() => {
    const eventModal = document.getElementById('eventModal');
    if (eventModal) eventModal.style.display = 'none';
    
    // Reset button state
    if (surveyBtn) {
        surveyBtn.textContent = 'Send Survey';
        surveyBtn.disabled = false;
    }
}, 1500);

    } catch (error) {
        console.error('❌ Error sending survey:', error);
        
        // More specific error messages
        let errorMessage = 'Failed to send survey. ';
        if (error.code === 'permission-denied') {
            errorMessage += 'You do not have permission to create surveys.';
        } else if (error.code === 'unavailable') {
            errorMessage += 'Service is currently unavailable. Please try again later.';
        } else {
            errorMessage += 'Please check your internet connection and try again.';
        }
        
        alert(errorMessage);
        
        // Reset button state on error
        const surveyBtn = document.querySelector('.event-modal-btn.survey');
        if (surveyBtn) {
            surveyBtn.textContent = 'Send Survey';
            surveyBtn.disabled = false;
        }
    }
}

// Also add a helper function to refresh attendee count from Firebase
async function refreshEventAttendeeCount(eventId) {
    if (!eventId) return 0;
    
    try {
        const eventDoc = await db.collection('events').doc(eventId).get();
        if (eventDoc.exists) {
            const eventData = eventDoc.data();
            const attendees = eventData.attendees || [];
            const count = attendees.filter(id => id && id.trim() !== '').length;
            
            console.log('🔄 Refreshed attendee count:', count);
            return count;
        }
    } catch (error) {
        console.error('❌ Error refreshing attendee count:', error);
    }
    
    return 0;
}



async function loadUserSurveys() {
    if (!currentUser) return;
    
    try {
        // Get surveys where current user is an attendee
        const surveysSnapshot = await db.collection('surveys')
            .where('attendees', 'array-contains', currentUser.uid)
            .where('status', '==', 'active')
            .get();
        
        const surveys = [];
        surveysSnapshot.forEach(doc => {
            const surveyData = doc.data();
            // Check if user hasn't responded yet
            if (!surveyData.responses || !surveyData.responses[currentUser.uid]) {
                surveys.push({
                    id: doc.id,
                    ...surveyData
                });
            }
        });
        
        // Display survey notifications/badges
        displaySurveyNotifications(surveys);
        
    } catch (error) {
        console.error('Error loading surveys:', error);
    }
}

function displaySurveyNotifications(surveys) {
    if (surveys.length === 0) return;
    
    // Create a simple notification badge or banner
    const existingBanner = document.getElementById('surveyBanner');
    if (existingBanner) existingBanner.remove();
    
    const banner = document.createElement('div');
    banner.id = 'surveyBanner';
    banner.className = 'survey-notification-banner';
    banner.innerHTML = `
        <div class="survey-banner-content">
            <i class="fas fa-clipboard-list"></i>
            <span>You have ${surveys.length} event survey${surveys.length > 1 ? 's' : ''} to complete</span>
            <button onclick="showPendingSurveys()" class="btn btn-small btn-primary">View Surveys</button>
            <button onclick="dismissSurveyBanner()" class="btn btn-small btn-secondary">&times;</button>
        </div>
    `;
    
    // Insert at top of page
    document.body.insertBefore(banner, document.body.firstChild);
}

// Add this to your auth state change listener
auth.onAuthStateChanged(async (user) => {
    try {
        currentUser = user;
        
        if (user) {
            console.log('✅ User authenticated:', user.uid);
            console.log('📧 User email:', user.email);
            
            // Test Firebase connection
            await db.collection('users').doc(user.uid).get();
            console.log('✅ Firebase connection working');
            
            // Load events
            await loadEventsFromFirebase();
            
            // Load pending surveys
            await loadUserSurveys();
            
            // Setup dropdowns
            setupClubDropdown();
            
            // Wait a moment for UI to be ready
            setTimeout(async () => {
                await populateClubDropdown();
            }, 500);
            
        } else {
            console.log('❌ User not authenticated');
            events = [];
            generateCalendar();
        }
    } catch (error) {
        console.error('❌ Error in auth state change:', error);
        alert('Authentication error. Please refresh the page.');
    }
});

async function submitSurvey(event) {
  const ratings = {
    enjoyment: parseInt(document.querySelector('[data-question="enjoyment"]').value),
    engagement: parseInt(document.querySelector('[data-question="engagement"]').value),
    likelyToReturn: parseInt(document.querySelector('[data-question="likelyToReturn"]').value),
    organization: parseInt(document.querySelector('[data-question="organization"]').value),
  };

  // Validate ratings
  for (const [question, rating] of Object.entries(ratings)) {
    if (isNaN(rating)) {  // Added missing parenthesis here
      alert(`Please provide a rating for ${question}`);
      return;
    }
    if (rating < 1 || rating > 10) {
      alert(`Rating for ${question} must be between 1-10`);
      return;
    }
}

  try {
    // Save survey to Firebase
    const surveyData = {
      eventId: event.firebaseId,
      eventTitle: event.title,
      creatorId: currentUser.uid,
      ratings,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      sentTo: event.attendees,
      responses: [] // Will store responses as they come in
    };

    const docRef = await db.collection('surveys').add(surveyData);
    console.log('Survey created with ID:', docRef.id);

    // Close modals
    document.getElementById('surveyModal').style.display = 'none';
    document.getElementById('eventModal').style.display = 'none';

    alert('Survey sent successfully to all attendees!');
    
    // In a real app, you would:
    // 1. Send notifications to attendees
    // 2. Store the survey ID in the event document
    // 3. Track responses as they come in

    // Add this to your DOMContentLoaded event listener:
document.querySelector('.close-survey-modal').addEventListener('click', function() {
  document.getElementById('surveyModal').style.display = 'none';
});

document.getElementById('surveyModal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
  }
});

  } catch (error) {
    console.error('Error sending survey:', error);
    alert('Failed to send survey. Please try again.');
  }
}



// SOLUTION 1: Fix the showEventModal function to properly set up RSVP button
function showEventModal(event) {
    console.log('🔍 Showing event modal for:', event);
    
    const eventModal = document.getElementById('eventModal');
    if (!eventModal) {
        console.error('❌ Event modal not found in DOM');
        return;
    }
    
    // Store the current event globally
    currentModalEvent = event;
    console.log('📝 Set currentModalEvent:', currentModalEvent);
    
    // Populate modal fields
    const modalEventTitle = document.getElementById('modalEventTitle');
    const modalEventClub = document.getElementById('modalEventClub');
    const modalEventDateTime = document.getElementById('modalEventDateTime');
    const modalEventLocation = document.getElementById('modalEventLocation');
    const modalEventHost = document.getElementById('modalEventHost');
    const modalEventDescription = document.getElementById('modalEventDescription');
    
    if (modalEventTitle) modalEventTitle.textContent = event.title || 'Untitled Event';
    if (modalEventClub) modalEventClub.textContent = event.clubName || 'No club specified';
    if (modalEventDateTime) {
        const dateTime = `${event.formattedDate || event.date} · ${event.formattedStart || event.startTime} - ${event.formattedEnd || event.endTime}`;
        modalEventDateTime.textContent = dateTime;
    }
    if (modalEventLocation) modalEventLocation.textContent = event.location || event.space || 'Location not specified';
    if (modalEventHost) modalEventHost.textContent = event.host || event.createdByEmail || 'Host not specified';
    if (modalEventDescription) {
        let description = event.description || '';
        if (!description && event.topics && event.topics.length > 0) {
            description = `Topics: ${event.topics.join(', ')}`;
        }
        if (!description) description = 'No description provided';
        
        // Add attendee count to description
        const attendeeCount = event.attendees ? event.attendees.length : (event.attendeeCount || 0);
        const attendeeText = attendeeCount === 1 ? 'person attending' : 'people attending';
        description += `\n\n👥 ${attendeeCount} ${attendeeText}`;
        
        modalEventDescription.textContent = description;
    }
    
    // Handle RSVP button setup
    setupRSVPButtonForEvent(event);
    
    // Handle survey button with updated attendee info
    const surveyBtn = eventModal.querySelector('.event-modal-btn.survey');
    if (surveyBtn) {
        if (currentUser && event.createdBy === currentUser.uid) {
            const attendeeCount = event.attendees ? event.attendees.length : (event.attendeeCount || 0);
            surveyBtn.style.display = 'block';
            surveyBtn.textContent = `Send Survey (${attendeeCount} attendees)`;
            surveyBtn.onclick = () => sendEventSurvey(event);
        } else {
            surveyBtn.style.display = 'none';
        }
    }
    
    // Show modal
    eventModal.style.display = 'flex';
    console.log('✅ Modal displayed');
}

// SOLUTION 2: Create a dedicated RSVP button setup function
function setupRSVPButtonForEvent(event) {
    console.log('🎯 Setting up RSVP button for event:', event.title);
    
    // Find the RSVP button with multiple selectors
    const selectors = [
        '.event-modal-actions .primary',
        '#eventModal .primary',
        '.event-modal-btn.primary',
        '[data-action="rsvp"]',
        '.rsvp-btn'
    ];
    
    let rsvpBtn = null;
    for (const selector of selectors) {
        rsvpBtn = document.querySelector(selector);
        if (rsvpBtn) {
            console.log(`✅ Found RSVP button with selector: ${selector}`);
            break;
        }
    }
    
    if (!rsvpBtn) {
        console.error('❌ RSVP button not found with any selector');
        console.log('Available buttons in modal:', 
            Array.from(document.querySelectorAll('#eventModal button')).map(btn => btn.className)
        );
        return;
    }
    
    // Remove any existing click listeners by cloning the element
    const newRsvpBtn = rsvpBtn.cloneNode(true);
    rsvpBtn.parentNode.replaceChild(newRsvpBtn, rsvpBtn);
    rsvpBtn = newRsvpBtn;
    
    // Check if user is already attending
    const isAttending = currentUser && event.attendees && event.attendees.includes(currentUser.uid);
    const isCreator = currentUser && event.createdBy === currentUser.uid;
    
    // Update button text and state
    if (isCreator) {
        rsvpBtn.textContent = 'You created this event';
        rsvpBtn.disabled = true;
        rsvpBtn.style.opacity = '0.6';
        return;
    } else if (isAttending) {
        rsvpBtn.textContent = 'Leave Event';
        rsvpBtn.classList.add('secondary');
        rsvpBtn.classList.remove('primary');
    } else {
        rsvpBtn.textContent = 'RSVP';
        rsvpBtn.classList.add('primary');
        rsvpBtn.classList.remove('secondary');
    }
    
    rsvpBtn.disabled = false;
    rsvpBtn.style.opacity = '1';
    
    // Add the click event listener
    rsvpBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🎯 RSVP button clicked!');
        console.log('👤 Current user:', currentUser ? currentUser.uid : 'null');
        console.log('📅 Event:', event);
        
        if (!currentUser) {
            alert('Please log in to RSVP');
            return;
        }
        
        if (!event || !event.firebaseId) {
            console.error('❌ No valid event data:', event);
            alert('Error: Event data not available');
            return;
        }
        
        // Show loading state
        const originalText = rsvpBtn.textContent;
        rsvpBtn.textContent = 'Processing...';
        rsvpBtn.disabled = true;
        
        try {
            let success = false;
            
          if (isAttending) {
    console.log('📤 Leaving event...');
    success = await leaveEvent(event.firebaseId);
    if (success) {
        // Button text will be updated by the function that called this
    }
} else {
    console.log('📥 Joining event...');
    success = await joinEvent(event.firebaseId);
    if (success) {
        // Button text will be updated by the function that called this
    }
}
            
            if (success) {
                // Close modal and refresh
                const modal = document.getElementById('eventModal');
                if (modal) modal.style.display = 'none';
                
                // Refresh the calendar
                await loadEventsFromFirebase();
            } else {
                alert('Could not complete RSVP. Please try again.');
            }
            
        } catch (error) {
            console.error('❌ RSVP error:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            // Reset button state
            rsvpBtn.textContent = originalText;
            rsvpBtn.disabled = false;
        }
    });
    
    console.log('✅ RSVP button event listener attached');
}

    // Function to generate a random color for the event
    function getRandomColor() {
        const colors = [
            '#3b82f6', // blue
            '#10b981', // green
            '#f59e0b', // amber
            '#ef4444', // red
            '#8b5cf6'  // violet
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
   function renderEvents() {
    // Clear all existing event blocks
    document.querySelectorAll('.event-block').forEach(el => el.remove());
    
    // Sort events by time
    events.sort((a, b) => {
        if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
        }
        return a.date.localeCompare(b.date);
    });
    
    // Add event blocks for each event
    events.forEach(event => {
        const dayElement = document.querySelector(`.calendar-day[data-date="${event.date}"]`);
        if (dayElement) {
            const eventBlock = document.createElement('div');
            eventBlock.className = 'event-block';
            eventBlock.dataset.eventId = event.id;
            
            // Add club name to the event display
            eventBlock.innerHTML = `
                <div class="event-time">${event.formattedStart}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-club">${event.clubName || ''}</div>
            `;
            
            eventBlock.style.backgroundColor = event.color;
            eventBlock.addEventListener('click', function(e) {
                e.stopPropagation();
                showEventModal(event);
            });
            
            dayElement.appendChild(eventBlock);
        }
    });
}
    
    // Replace any alert-based event display with this function


// Debug function to check which elements exist
function debugModalElements() {
    const elements = [
        'eventModal',
        'modalEventTitle', 
        'modalEventClub',
        'modalEventDateTime',
        'modalEventLocation', 
        'modalEventHost',
        'modalEventDescription'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? '✅ Found' : '❌ Not found');
    });
}

// Run this in console to see which elements are missing:
window.debugModalElements = debugModalElements;

console.log('🔧 Event modal fixes loaded! Run debugModalElements() to check your HTML.');



// Add event listeners for modal
document.querySelector('.close-event-modal').addEventListener('click', function() {
    document.getElementById('eventModal').style.display = 'none';
});

document.querySelector('.event-modal-btn.secondary').addEventListener('click', function() {
    document.getElementById('eventModal').style.display = 'none';
});

// Close modal when clicking outside
document.getElementById('eventModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

    
    async function deleteEvent(event) {
        if (!currentUser || event.createdBy !== currentUser.uid) {
            alert('You can only delete events you created');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
        
        const success = await deleteEventFromFirebase(event.firebaseId);
        if (success) {
            // Remove from local events array
            events = events.filter(e => e.id !== event.id);
            renderEvents();
            alert('Event deleted successfully');
        }
    }
    
    function getRepeatText(repeatValue) {
        switch(repeatValue) {
            case 'daily': return 'Daily';
            case 'weekly': return 'Weekly';
            case 'monthly': return 'Monthly';
            default: return 'Does not repeat';
        }
    }
    
    // Close modal when clicking outside
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
    
    // Listen for real-time updates from Firebase
    if (currentUser) {
        // Real-time listener for events
        db.collection('events')
            .where('attendees', 'array-contains', currentUser.uid)
            .onSnapshot((snapshot) => {
                console.log('Events updated in real-time');
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        console.log('New event: ', change.doc.data());
                    }
                    if (change.type === 'modified') {
                        console.log('Modified event: ', change.doc.data());
                    }
                    if (change.type === 'removed') {
                        console.log('Removed event: ', change.doc.data());
                    }
                });
                
                // Reload events from Firebase to get latest data
                loadEventsFromFirebase();
            });
    }
    
    // Additional utility functions for enhanced Firebase integration
    
    // Function to get all public events (events that others can join)
    async function loadPublicEvents() {
        try {
            const publicEventsSnapshot = await db.collection('events')
                .where('status', '==', 'active')
                .where('paymentType', '==', 'free') // Only show free public events
                .orderBy('date', 'asc')
                .limit(50)
                .get();
            
            const publicEvents = [];
            publicEventsSnapshot.forEach(doc => {
                const eventData = doc.data();
                if (!currentUser || !eventData.attendees || !eventData.attendees.includes(currentUser.uid)) {
                    publicEvents.push({
                        id: doc.id,
                        ...eventData
                    });
                }
            });
            
            return publicEvents;
        } catch (error) {
            console.error('Error loading public events:', error);
            return [];
        }
    }
    
    // Function to search events by title or topic
    async function searchEvents(searchTerm) {
        if (!searchTerm.trim()) return [];
        
        try {
            const eventsSnapshot = await db.collection('events')
                .where('status', '==', 'active')
                .get();
            
            const matchingEvents = [];
            eventsSnapshot.forEach(doc => {
                const eventData = doc.data();
                const titleMatch = eventData.title && eventData.title.toLowerCase().includes(searchTerm.toLowerCase());
                const topicMatch = eventData.topics && eventData.topics.some(topic => 
                    topic.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if (titleMatch || topicMatch) {
                    matchingEvents.push({
                        id: doc.id,
                        ...eventData
                    });
                }
            });
            
            return matchingEvents;
        } catch (error) {
            console.error('Error searching events:', error);
            return [];
        }
    }
    
    // Function to get events for a specific date
    function getEventsForDate(date) {
        return events.filter(event => event.date === date);
    }
    
    // Function to get upcoming events (next 7 days)
    function getUpcomingEvents() {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const todayStr = today.toISOString().split('T')[0];
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        
        return events.filter(event => event.date >= todayStr && event.date <= nextWeekStr)
                    .sort((a, b) => {
                        if (a.date === b.date) {
                            return a.startTime.localeCompare(b.startTime);
                        }
                        return a.date.localeCompare(b.date);
                    });
    }
    
    // Function to export events to calendar format (iCal)
    function exportEventsToICal() {
        if (events.length === 0) {
            alert('No events to export');
            return;
        }
        
        let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Your App//Your App//EN\n';
        
        events.forEach(event => {
            const startDateTime = `${event.date.replace(/-/g, '')}T${event.startTime.replace(':', '')}00`;
            const endDateTime = `${event.date.replace(/-/g, '')}T${event.endTime.replace(':', '')}00`;
            
            icalContent += `BEGIN:VEVENT\n`;
            icalContent += `UID:${event.id}@yourapp.com\n`;
            icalContent += `DTSTART:${startDateTime}\n`;
            icalContent += `DTEND:${endDateTime}\n`;
            icalContent += `SUMMARY:${event.title}\n`;
            icalContent += `DESCRIPTION:${event.topics.join(', ')}\n`;
            icalContent += `LOCATION:${event.location}\n`;
            icalContent += `END:VEVENT\n`;
        });
        
        icalContent += 'END:VCALENDAR';
        
        // Create download link
        const blob = new Blob([icalContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Function to handle recurring events
    async function createRecurringEvents(baseEvent) {
        if (baseEvent.repeat === 'none') {
            return [baseEvent];
        }
        
        const recurringEvents = [];
        const baseDate = new Date(baseEvent.date);
        let currentDate = new Date(baseDate);
        
        // Create events for the next 12 occurrences (or 1 year for monthly)
        const maxOccurrences = baseEvent.repeat === 'monthly' ? 12 : 
                               baseEvent.repeat === 'weekly' ? 12 : 
                               baseEvent.repeat === 'daily' ? 30 : 1;
        
        for (let i = 0; i < maxOccurrences; i++) {
            if (i === 0) {
                recurringEvents.push(baseEvent);
            } else {
                // Calculate next date based on repeat type
                switch (baseEvent.repeat) {
                    case 'daily':
                        currentDate.setDate(currentDate.getDate() + 1);
                        break;
                    case 'weekly':
                        currentDate.setDate(currentDate.getDate() + 7);
                        break;
                    case 'monthly':
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        break;
                }
                
                const recurringEvent = {
                    ...baseEvent,
                    id: `${baseEvent.id}_${i}`,
                    date: currentDate.toISOString().split('T')[0],
                    formattedDate: currentDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    isRecurring: true,
                    originalEventId: baseEvent.id,
                    occurrenceNumber: i + 1
                };
                
                recurringEvents.push(recurringEvent);
            }
        }
        
        return recurringEvents;
    }
    // RSVP button in the event-details modal
const rsvpBtn = document.querySelector('.event-modal-actions .primary');

    if (rsvpBtn) {
  rsvpBtn.addEventListener('click', async () => {
    if (!currentUser) {
      alert('Please log in to RSVP');
      return;
    }
    if (!currentModalEvent || !currentModalEvent.firebaseId) {
      console.error('No event selected');
      return;
    }
    
    try {
      const success = await joinEvent(currentModalEvent.firebaseId);
      if (success) {
        alert('RSVP confirmed!');
        document.getElementById('eventModal').style.display = 'none';
      } else {
        alert('Could not confirm RSVP. Try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error.');
    }
  });
}

// RSVP button in the event-details modal - with better debugging
function setupRSVPButton() {
    console.log('🔍 Setting up RSVP button...');
    
    // Try multiple selectors to find the RSVP button
    let rsvpBtn = document.querySelector('.event-modal-actions .primary');
    
    if (!rsvpBtn) {
        rsvpBtn = document.querySelector('#eventModal .primary');
    }
    
    if (!rsvpBtn) {
        rsvpBtn = document.querySelector('[data-action="rsvp"]');
    }
    
    if (!rsvpBtn) {
        rsvpBtn = document.querySelector('.rsvp-btn');
    }
    
    console.log('🎯 RSVP button found:', rsvpBtn);
    
    if (rsvpBtn) {
        // Remove any existing listeners to prevent duplicates
        rsvpBtn.replaceWith(rsvpBtn.cloneNode(true));
        rsvpBtn = document.querySelector('.event-modal-actions .primary') || 
                 document.querySelector('#eventModal .primary');
        
        if (rsvpBtn) {
            rsvpBtn.addEventListener('click', async () => {
                console.log('🎯 RSVP button clicked!');
                
                if (!currentUser) {
                    alert('Please log in to RSVP');
                    return;
                }
                if (!currentModalEvent || !currentModalEvent.firebaseId) {
                    console.error('No event selected');
                    return;
                }
                
                try {
                    console.log('📝 Attempting to join event:', currentModalEvent.firebaseId);
                    const success = await joinEvent(currentModalEvent.firebaseId);
                    if (success) {
                        alert('RSVP confirmed!');
                        const modal = document.getElementById('eventModal');
                        if (modal) modal.style.display = 'none';
                    } else {
                        alert('Could not confirm RSVP. Try again.');
                    }
                } catch (err) {
                    console.error('❌ RSVP error:', err);
                    alert('Unexpected error.');
                }
            });
            console.log('✅ RSVP button listener attached');
        }
    } else {
        console.error('❌ RSVP button not found with any selector');
    }
}

    // Enhanced event creation with recurring events
    async function createEventWithRecurring(eventData) {
        try {
            const recurringEvents = await createRecurringEvents(eventData);
            const savedEventIds = [];
            
            for (const event of recurringEvents) {
                const firebaseId = await saveEventToFirebase(event);
                if (firebaseId) {
                    event.firebaseId = firebaseId;
                    savedEventIds.push(firebaseId);
                    events.push(event);
                }
            }
            
            if (savedEventIds.length > 0) {
                console.log(`Created ${savedEventIds.length} recurring events`);
                renderEvents();
                return savedEventIds;
            }
            
            return null;
        } catch (error) {
            console.error('Error creating recurring events:', error);
            return null;
        }
    }
    
    // Function to get event statistics
    function getEventStatistics() {
        const stats = {
            totalEvents: events.length,
            upcomingEvents: getUpcomingEvents().length,
            eventsCreated: events.filter(e => currentUser && e.createdBy === currentUser.uid).length,
            eventsAttending: events.filter(e => currentUser && e.attendees && e.attendees.includes(currentUser.uid)).length,
            topTopics: {}
        };
        
        // Calculate top topics
        events.forEach(event => {
            if (event.topics) {
                event.topics.forEach(topic => {
                    stats.topTopics[topic] = (stats.topTopics[topic] || 0) + 1;
                });
            }
        });
        
        return stats;
    }
    
    // Function to send event notifications (would integrate with push notifications in a real app)
    function scheduleEventNotifications(event) {
        const eventDate = new Date(`${event.date}T${event.startTime}`);
        const now = new Date();
        
        // Schedule notification 1 hour before event
        const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
        
        if (oneHourBefore > now) {
            const timeUntilNotification = oneHourBefore.getTime() - now.getTime();
            
            setTimeout(() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`Event starting in 1 hour: ${event.title}`, {
                        body: `${event.formattedStart} at ${event.location}`,
                        icon: '/path/to/icon.png' // Add your app icon path
                    });
                }
            }, timeUntilNotification);
        }
        
        // Schedule notification 15 minutes before event
        const fifteenMinutesBefore = new Date(eventDate.getTime() - 15 * 60 * 1000);
        
        if (fifteenMinutesBefore > now) {
            const timeUntilNotification = fifteenMinutesBefore.getTime() - now.getTime();
            
            setTimeout(() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`Event starting soon: ${event.title}`, {
                        body: `Starting in 15 minutes at ${event.location}`,
                        icon: '/path/to/icon.png' // Add your app icon path
                    });
                }
            }, timeUntilNotification);
        }
    }

    async function getUserClubs() {
    if (!currentUser) return [];
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            return userDoc.data().clubs || [];
        }
        return [];
    } catch (error) {
        console.error('Error getting user clubs:', error);
        return [];
    }
}
    
    // Request notification permission on page load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
    
    // Expose useful functions to global scope for debugging/external use
    window.eventsDebug = {
        loadEventsFromFirebase,
        getEventStatistics,
        searchEvents,
        loadPublicEvents,
        exportEventsToICal,
        getUpcomingEvents,
        events: () => events,
        currentUser: () => currentUser
    };
    
    console.log('Enhanced Firebase Events system loaded successfully!');
    console.log('Available debug functions: window.eventsDebug');

     } catch (error) {
        console.error("Firebase initialization error:", error);
        alert("Failed to initialize Firebase. Please refresh the page.");
    }
});

