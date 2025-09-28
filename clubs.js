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

    // Initialize Firebase
    try {
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
        }
        
        // Initialize services
        const db = firebase.firestore();
        const auth = firebase.auth();
        
        // Configure Firestore settings
        db.settings({
            experimentalForceLongPolling: true,
            merge: true
        });
        
        // Enable Firestore persistence with error handling
        const enablePersistence = async () => {
            try {
                await db.enablePersistence({ synchronizeTabs: true });
                console.log("Firestore persistence enabled");
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn("Persistence enabled in another tab");
                    // Clear incompatible persistence data
                    await clearPersistedData();
                    // Retry enabling persistence
                    try {
                        await db.enablePersistence({ synchronizeTabs: true });
                        console.log("Firestore persistence enabled after clearing old data");
                    } catch (retryErr) {
                        console.warn("Persistence couldn't be enabled after clearing data", retryErr);
                    }
                } else if (err.code === 'unimplemented') {
                    console.warn("Browser doesn't support persistence");
                } else {
                    console.error("Error enabling persistence:", err);
                }
            }
        };
        
        // Function to clear persisted data
        const clearPersistedData = async () => {
            try {
                const databases = await window.indexedDB.databases();
                for (const dbInfo of databases) {
                    if (dbInfo.name && dbInfo.name.includes('firestore')) {
                        console.log(`Clearing IndexedDB: ${dbInfo.name}`);
                        await new Promise((resolve, reject) => {
                            const request = window.indexedDB.deleteDatabase(dbInfo.name);
                            request.onsuccess = resolve;
                            request.onerror = reject;
                        });
                    }
                }
            } catch (clearErr) {
                console.error("Error clearing persisted data:", clearErr);
            }
        };
        
        // Call the persistence function
        enablePersistence();

        // DOM elements
        const clubsContainer = document.getElementById('clubsContainer');
        const createClubBtn = document.getElementById('createClubBtn');
        const filterTabs = document.querySelectorAll('.filter-tab');
        const modal = document.getElementById('clubModal');
        const closeBtn = document.querySelector('.close-modal');
        const modalTabs = document.querySelectorAll('.modal-tab');
        const joinButton = document.querySelector('.join-button');

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
        
        let currentUser = null;
        let allClubs = [];

        // Check authentication state
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                loadClubs();
                setupModal();
            } else {
                window.location.href = 'login.html';
            }
        });

        function updateActiveSince(club) {
    let activeSince = 'Unknown';
    
    if (club.createdAt) {
        let createdDate;
        
        if (club.createdAt.seconds) {
            // Firestore timestamp
            createdDate = new Date(club.createdAt.seconds * 1000);
        } else if (typeof club.createdAt === 'string') {
            // String date
            createdDate = new Date(club.createdAt);
        }
        
        if (createdDate) {
            // Format as "Jan 2023"
            activeSince = createdDate.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
        }
    }
    
    // Update the Active Since stat card (assuming it's the 3rd stat card)
    modal.querySelector('#overview .stat-card:nth-child(3) p').textContent = activeSince;
}


      

        // Load clubs from Firestore
        function loadClubs(filter = 'all') {
            clubsContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading clubs...</p></div>';
            
            db.collection('clubs').get()
                .then(querySnapshot => {
                    allClubs = [];
                    clubsContainer.innerHTML = '';
                    
                    if (querySnapshot.empty) {
                        clubsContainer.innerHTML = '<div class="no-clubs"><p>No clubs found</p></div>';
                        return;
                    }
                    
                    querySnapshot.forEach(doc => {
                        const club = { id: doc.id, ...doc.data() };
                        allClubs.push(club);
                        
                        if (filter === 'all' || 
                           (filter === 'yours' && club.members && club.members.includes(currentUser.uid))) {
                            renderClubCard(club);
                        }
                    });
                })
                .catch(error => {
                    console.error("Error loading clubs:", error);
                    clubsContainer.innerHTML = '<div class="error-message"><p>Error loading clubs. Please refresh.</p></div>';
                });
        }
const urlParams = new URLSearchParams(window.location.search);
const clubToOpen = urlParams.get('openClub');
if (clubToOpen) {
    // Load the specific club and open its modal
    db.collection('clubs').doc(clubToOpen).get()
        .then(doc => {
            if (doc.exists) {
                const fullClubData = { id: doc.id, ...doc.data() };
                // Small delay to ensure page is fully loaded
                setTimeout(() => {
                    openClubModal(fullClubData);
                }, 100);
            }
        })
        .catch(error => {
            console.error("Error loading club data for modal:", error);
        });
}
        // Render a club card
        function renderClubCard(club) {
            const clubCard = document.createElement('div');
            clubCard.className = 'course-card';
            clubCard.dataset.clubId = club.id;
            
            const isMember = currentUser && club.members && club.members.includes(currentUser.uid);
            const isCreator = currentUser && club.creatorId === currentUser.uid;
            
            clubCard.innerHTML = `
                <div class="course-image" style="background-color: ${getRandomColor()}">
                    ${club.status === 'draft' ? '<div class="draft-badge">DRAFT</div>' : ''}
                    ${isCreator ? '<div class="creator-badge">CREATOR</div>' : ''}
                </div>
                <div class="course-content">
                    <div class="course-title">
                        <div class="course-dot" style="background-color: ${getRandomColor()}"></div>
                        <span>${club.name}</span>
                    </div>
                    <div class="course-category">${club.goal || 'General'}</div>
                    <div class="course-stats">
                        <div class="stat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span>${club.memberCount || (club.members ? club.members.length : 0)}</span>
                        </div>
                        ${isMember ? '<div class="member-badge">Member</div>' : ''}
                    </div>
                </div>
            `;
            
            clubCard.addEventListener('click', () => openClubModal(club));
            clubsContainer.appendChild(clubCard);
        }

        // Setup modal functionality
        function setupModal() {
            // Close modal when clicking X or outside
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Tab switching functionality
            modalTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
        }

        // Open club modal with data
        function openClubModal(club) {
            const modalTitle = modal.querySelector('.modal-title');
            const overviewContent = modal.querySelector('#overview .club-description');
            const membersTab = modal.querySelector('#members .member-directory');
            const eventsTab = modal.querySelector('#events .event-calendar');
            const joinBtn = modal.querySelector('.join-button');
            
            // Update basic info
            modalTitle.textContent = club.name;
            overviewContent.innerHTML = `
                <h3 style="margin-bottom: 5px;">About</h3>
                <p>${club.mission || 'No description provided.'}</p> <br>
                <h3 style="margin-bottom: 5px;">Meeting Schedule</h3>
                <p>${club.meetingFrequency || 'Not specified'} ${club.meetingTime ? 'at ' + club.meetingTime : ''}</p> <br>
                ${club.additionalInfo ? `<h3 style="margin-bottom: 5px;">Additional Info</h3><p>${club.additionalInfo}</p>` : ''}
            `;
            
            // Update stats
            modal.querySelector('#overview .stat-card:nth-child(1) p').textContent = club.memberCount || (club.members ? club.members.length : 0);
            modal.querySelector('#overview .stat-card:nth-child(1) p').textContent = club.memberCount || (club.members ? club.members.length : 0);
            modal.querySelector('#overview .stat-card:nth-child(1) p').textContent = club.memberCount || (club.members ? club.members.length : 0);

// Add this line right after:
updateUpcomingEventsCount(club.id);
updateActiveSince(club);
            
            // Load members
            loadClubMembers(club.id, membersTab);
            
            // Load events
            loadClubEvents(club.id, eventsTab);
            
           // Set up join button
const isMember = currentUser && club.members && club.members.includes(currentUser.uid);
const isOfficer = currentUser && club.officers && club.officers.includes(currentUser.uid);

if (isMember || isOfficer) {
    joinBtn.textContent = 'Leave Club';
    joinBtn.classList.add('joined');
    joinBtn.onclick = () => leaveClub(club.id);
} else {
    joinBtn.textContent = 'Join Club';
    joinBtn.classList.remove('joined');
    
    // Remove existing onclick and add new one with role selection
    joinBtn.onclick = null;
    joinBtn.onclick = () => showRoleSelection(club.id);
}
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Load members for a club
       function loadClubMembers(clubId, container) {
    container.innerHTML = '<div class="members-loading"><div class="spinner"></div><p>Loading members...</p></div>';
    
    db.collection('users')
        .where('clubs', 'array-contains', clubId)
        .get()
        .then(querySnapshot => {
            container.innerHTML = '';
            
            if (querySnapshot.empty) {
                container.innerHTML = `
                    <div class="no-members">
                        <div class="no-members-icon">👥</div>
                        <p>No members found</p>
                        <small>Be the first to join this club!</small>
                    </div>
                `;
                return;
            }
            
            // Create search container
            const searchContainer = document.createElement('div');
            searchContainer.className = 'members-search';
            searchContainer.innerHTML = `
                <div class="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="memberSearch" placeholder="Search members..." />
                </div>
            `;
            
            // Create members grid container
            const membersGrid = document.createElement('div');
            membersGrid.className = 'members-grid';
            
            // Store all members data for filtering
            const allMembers = [];
            
            querySnapshot.forEach(doc => {
                const user = doc.data();
                const userName = user.displayName || user.email?.split('@')[0] || 'User';
                const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=80&font-size=0.33&bold=true`;
                
                const memberCard = document.createElement('div');
                memberCard.className = 'member-card';
                memberCard.dataset.name = userName.toLowerCase();
                memberCard.dataset.email = (user.email || '').toLowerCase();
                
                memberCard.innerHTML = `
                    <div class="member-avatar">
                        <img src="${avatarUrl}" alt="${userName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=80&font-size=0.5&bold=true'" />
                        <div class="member-status online"></div>
                    </div>
                    <div class="member-info">
                        <h4 class="member-name">${userName}</h4>
                        <p class="member-email">${user.email || 'No email provided'}</p>
                        ${user.role ? `<span class="member-role">${user.role}</span>` : ''}
                    </div>
                `;
                
                allMembers.push(memberCard);
                membersGrid.appendChild(memberCard);
            });
            
            // Add elements to container
            container.appendChild(searchContainer);
            container.appendChild(membersGrid);
            
            // Add search functionality
            const searchInput = document.getElementById('memberSearch');
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                let visibleCount = 0;
                
                allMembers.forEach(memberCard => {
                    const name = memberCard.dataset.name;
                    const email = memberCard.dataset.email;
                    
                    const matches = name.includes(searchTerm) || email.includes(searchTerm);
                    
                    if (matches) {
                        memberCard.style.display = 'flex';
                        visibleCount++;
                    } else {
                        memberCard.style.display = 'none';
                    }
                });
                
                // Show "no results" message if no matches
                let noResultsMsg = container.querySelector('.no-search-results');
                if (visibleCount === 0 && searchTerm !== '') {
                    if (!noResultsMsg) {
                        noResultsMsg = document.createElement('div');
                        noResultsMsg.className = 'no-search-results';
                        noResultsMsg.innerHTML = `
                            <div class="no-results-icon">🔍</div>
                            <p>No members found for "${searchTerm}"</p>
                            <small>Try searching with a different term</small>
                        `;
                        container.appendChild(noResultsMsg);
                    }
                } else if (noResultsMsg) {
                    noResultsMsg.remove();
                }
            });
            
        })
        .catch(error => {
            console.error("Error loading members:", error);
            container.innerHTML = `
                <div class="members-error">
                    <div class="error-icon">⚠️</div>
                    <p>Error loading members</p>
                    <small>Please try refreshing the page</small>
                </div>
            `;
        });
}
// Listen for auth state changes (you might already have this)
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // User is signed out, redirect to login
        window.location.href = 'login.html';
    }
});

async function leaveClub(clubId) {
    if (!currentUser) return;
    
    try {
        const clubRef = db.collection('clubs').doc(clubId);
        const userRef = db.collection('users').doc(currentUser.uid);
        
        const batch = db.batch();
        
        // Remove from all possible roles in club
        batch.update(clubRef, {
            members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
            officers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
            memberCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        // Remove from all user arrays
        batch.update(userRef, {
            clubs: firebase.firestore.FieldValue.arrayRemove(clubId),
            officerClubs: firebase.firestore.FieldValue.arrayRemove(clubId)
        });
        
        await batch.commit();
        console.log('Successfully left club');
        
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        location.reload();
        
    } catch (error) {
        console.error('Error leaving club:', error);
        alert('Error leaving club. Please try again.');
    }
}

// Show role selection when joining club
function showRoleSelection(clubId) {
    const selectedRole = prompt('Are you joining as:\n\n1. Member (regular member)\n2. Officer (club leadership)\n\nEnter "1" for Member or "2" for Officer:');
    
    if (selectedRole === '1') {
        joinClub(clubId, 'member');
    } else if (selectedRole === '2') {
        joinClub(clubId, 'officer');
    } else if (selectedRole !== null) {
        alert('Please enter either "1" for Member or "2" for Officer');
    }
}

        // Load events for a club
      // Replace your loadClubEvents function with this:
function loadClubEvents(clubId, container) {
    container.innerHTML = '<div class="events-loading"><div class="spinner"></div><p>Loading events...</p></div>';
    
    db.collection('events')
        .where('clubId', '==', clubId)
        .orderBy('date', 'asc')
        .get()
        .then(querySnapshot => {
            container.innerHTML = '';
            
            if (querySnapshot.empty) {
                container.innerHTML = `
                    <div class="no-events">
                        <div class="no-events-icon">📅</div>
                        <p>No upcoming events</p>
                        <small>Check back later for exciting events!</small>
                    </div>
                `;
                return;
            }
            
            // Create search container
            const searchContainer = document.createElement('div');
            searchContainer.className = 'events-search';
            searchContainer.innerHTML = `
                <div class="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="eventSearch" placeholder="Search events..." />
                </div>
            `;
            
            // Create events grid container
            const eventsGrid = document.createElement('div');
            eventsGrid.className = 'events-grid';
            
            // Store all events for filtering
            const allEvents = [];
            
            querySnapshot.forEach(doc => {
                const event = doc.data();
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card-enhanced';
                
                // Fix date handling
                let displayDate = 'Date TBD';
                let eventDate = null;
                if (event.date) {
                    if (event.date.seconds) {
                        eventDate = new Date(event.date.seconds * 1000);
                    } else if (typeof event.date === 'string') {
                        eventDate = new Date(event.date);
                    }
                    
                    if (eventDate) {
                        displayDate = eventDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                    }
                }
                
                // Check if event is upcoming or past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isUpcoming = eventDate && eventDate >= today;
                
                const displayLocation = event.space && event.space.trim() !== '' ? event.space : 'Location TBD';
                const eventTitle = event.title || 'Untitled Event';
                const eventDescription = event.description || 'No description available';
                
                // Set search data attributes
                eventCard.dataset.title = eventTitle.toLowerCase();
                eventCard.dataset.location = displayLocation.toLowerCase();
                eventCard.dataset.description = eventDescription.toLowerCase();
                
                eventCard.innerHTML = `
                    <div class="event-header">
                        <div class="event-date-badge ${isUpcoming ? 'upcoming' : 'past'}">
                            <div class="event-month">${eventDate ? eventDate.toLocaleDateString('en-US', { month: 'short' }) : 'TBD'}</div>
                            <div class="event-day">${eventDate ? eventDate.getDate() : '??'}</div>
                            ${!isUpcoming && eventDate ? '<div class="past-indicator">Past</div>' : ''}
                        </div>
                        <div class="event-main-info">
                            <h4 class="event-title">${eventTitle}</h4>
                            <p class="event-description">${eventDescription}</p>
                        </div>
                    </div>
                    <div class="event-details">
                        <div class="event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            <span>${displayDate}</span>
                        </div>
                        <div class="event-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>${displayLocation}</span>
                        </div>
                    </div>
                `;
                
                allEvents.push(eventCard);
                eventsGrid.appendChild(eventCard);
            });
            
            // Add elements to container
            container.appendChild(searchContainer);
            container.appendChild(eventsGrid);
            
            // Add search functionality
            const searchInput = document.getElementById('eventSearch');
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                let visibleCount = 0;
                
                allEvents.forEach(eventCard => {
                    const title = eventCard.dataset.title;
                    const location = eventCard.dataset.location;
                    const description = eventCard.dataset.description;
                    
                    const matches = title.includes(searchTerm) || 
                                   location.includes(searchTerm) || 
                                   description.includes(searchTerm);
                    
                    if (matches) {
                        eventCard.style.display = 'block';
                        visibleCount++;
                    } else {
                        eventCard.style.display = 'none';
                    }
                });
                
                // Show "no results" message if no matches
                let noResultsMsg = container.querySelector('.no-search-results');
                if (visibleCount === 0 && searchTerm !== '') {
                    if (!noResultsMsg) {
                        noResultsMsg = document.createElement('div');
                        noResultsMsg.className = 'no-search-results';
                        noResultsMsg.innerHTML = `
                            <div class="no-results-icon">🔍</div>
                            <p>No events found for "${searchTerm}"</p>
                            <small>Try searching with a different term</small>
                        `;
                        container.appendChild(noResultsMsg);
                    }
                } else if (noResultsMsg) {
                    noResultsMsg.remove();
                }
            });
            
        })
        .catch(error => {
            console.error("Error loading events:", error);
            container.innerHTML = `
                <div class="events-error">
                    <div class="error-icon">⚠️</div>
                    <p>Error loading events</p>
                    <small>Please try refreshing the page</small>
                </div>
            `;
        });
}

async function updateUpcomingEventsCount(clubId) {
    try {
        const snapshot = await db.collection('events')
            .where('clubId', '==', clubId)
            .get();
        
        // Filter for upcoming events only
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        let upcomingCount = 0;
        snapshot.forEach(doc => {
            const event = doc.data();
            if (event.date) {
                const eventDate = new Date(event.date);
                if (eventDate >= today) {
                    upcomingCount++;
                }
            }
        });
        
        // Update the upcoming events stat card
        modal.querySelector('#overview .stat-card:nth-child(2) p').textContent = upcomingCount;
        
    } catch (error) {
        console.error('Error loading event count:', error);
        modal.querySelector('#overview .stat-card:nth-child(2) p').textContent = '0';
    }
}

        // Join a club - improved version with better error handling
        async function joinClub(clubId, role = 'member') {
    console.log("Attempting to join club as:", role);
    console.log("Current user UID:", currentUser.uid);

    const clubRef = db.collection('clubs').doc(clubId);
    const userRef = db.collection('users').doc(currentUser.uid);
    
    // Show loading state
    const joinBtn = modal.querySelector('.join-button');
    if (joinBtn) {
        joinBtn.disabled = true;
        joinBtn.textContent = 'Joining...';
    }

    try {
        const clubDoc = await clubRef.get();
        if (!clubDoc.exists) {
            throw new Error("Club not found");
        }
        
        const clubData = clubDoc.data();
        
        // Check if user is already in any role
        const isAlreadyMember = clubData.members && clubData.members.includes(currentUser.uid);
        const isAlreadyOfficer = clubData.officers && clubData.officers.includes(currentUser.uid);
        
        if (isAlreadyMember || isAlreadyOfficer) {
            throw new Error("You're already in this club");
        }

        const batch = db.batch();
        
        // Add to appropriate club array based on role
        if (role === 'officer') {
            batch.update(clubRef, {
                officers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            });
            
            // Add to user's officerClubs
            batch.update(userRef, {
                officerClubs: firebase.firestore.FieldValue.arrayUnion(clubId)
            });
        } else {
            // Default to member
            batch.update(clubRef, {
                members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
                memberCount: firebase.firestore.FieldValue.increment(1)
            });
            
            // Add to user's clubs
            batch.update(userRef, {
                clubs: firebase.firestore.FieldValue.arrayUnion(clubId)
            });
        }
        
        await batch.commit();
        console.log("Successfully joined club as:", role);
        
        // UI Updates
        if (joinBtn) {
            joinBtn.textContent = role === 'officer' ? 'Officer' : 'Member';
            joinBtn.classList.add('joined');
            joinBtn.disabled = false;
            joinBtn.onclick = () => leaveClub(clubId);
        }

        // Refresh data
        loadClubs();
        loadClubMembers(clubId, modal.querySelector('#members .member-directory'));
        
    } catch (error) {
        console.error("Error joining club:", error);
        
        if (joinBtn) {
            joinBtn.textContent = 'Join Club';
            joinBtn.disabled = false;
        }
        
        alert(error.message || 'There was an error joining the club. Please try again.');
    }
}

        // Close modal
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Helper function for random colors
        function getRandomColor() {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Event listeners
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                loadClubs(tab.dataset.filter);
            });
        });

        createClubBtn.addEventListener('click', () => {
            window.location.href = 'create-club.html';
        });
    } catch (error) {
        console.error("Firebase initialization error:", error);
        alert("Failed to initialize Firebase. Please refresh the page.");
    }
});