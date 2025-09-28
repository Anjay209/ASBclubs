
// COMPLETE SEARCH FIX - ADD THIS TO YOUR CODE

// 1. Make searchTemplates globally available (outside DOMContentLoaded)

window.searchTemplates = function() {
    console.log('🔍 Search function called');
    
    const searchInput = document.getElementById('templateSearch');
    const templateCards = document.querySelectorAll('.template-card');
    
    if (!searchInput) {
        console.error('❌ Search input not found');
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    console.log('🔎 Searching for:', searchTerm);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    // Remove any existing "no results" message
    const noResults = document.querySelector('.no-search-results');
    if (noResults) {
        noResults.remove();
    }
    
    templateCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.template-description')?.textContent.toLowerCase() || '';
        const type = card.querySelector('.template-type')?.textContent.toLowerCase() || '';
        
        const matches = searchTerm === '' || 
                       title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       type.includes(searchTerm);
        
        if (matches) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
            hiddenCount++;
        }
    });
    
    console.log(`📊 Search results: ${visibleCount} visible, ${hiddenCount} hidden`);
    
    // Show no results message if needed
    if (visibleCount === 0 && searchTerm !== '') {
        const templatesList = document.getElementById('templatesList');
        if (templatesList) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-search-results';
            noResultsDiv.innerHTML = `<p class="no-results">No templates found matching "${searchTerm}".</p>`;
            templatesList.appendChild(noResultsDiv);
        }
    }
};

// 2. Add live search event listeners (also outside DOMContentLoaded)
function setupSearchListeners() {
    console.log('🔗 Setting up search listeners...');
    
    const searchInput = document.getElementById('templateSearch');
    const searchBtn = document.getElementById('searchTemplatesBtn');
    
    if (searchInput) {
        // Live search as user types
        searchInput.addEventListener('input', function() {
            console.log('🎯 Search input changed:', this.value);
            searchTemplates();
        });
        
        // Search on Enter key
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                console.log('🎯 Enter key pressed in search');
                searchTemplates();
            }
        });
        
        console.log('✅ Search input listeners added');
    } else {
        console.warn('⚠️ Search input not found yet');
    }
    
    if (searchBtn) {
        // Search button click
        searchBtn.addEventListener('click', function() {
            console.log('🎯 Search button clicked');
            searchTemplates();
        });
        
        console.log('✅ Search button listener added');
    } else {
        console.warn('⚠️ Search button not found yet');
    }
}



// 3. Initialize search when templates are loaded
function initializeSearch() {
    // Try to setup listeners immediately
    setupSearchListeners();
    
    // Also try again after a short delay in case elements aren't ready
    setTimeout(setupSearchListeners, 500);
    setTimeout(setupSearchListeners, 1000);
}

// 4. Call initialization when document is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

// 5. Also initialize when templates modal opens
window.openTemplateModal = function() {
    document.getElementById('templateModal').style.display = 'block';
    loadTemplates();
    
    // Setup search after templates load
    setTimeout(() => {
        setupSearchListeners();
    }, 1000);
}


document.addEventListener('DOMContentLoaded', function() {


   

  window.openTemplateModal = function () {
    document.getElementById('templateModal').style.display = 'block';
    loadTemplates();
}

window.closeTemplateModal = function () {
    document.getElementById('templateModal').style.display = 'none';
}


window.switchTab = function(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate selected tab
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}


// Template functions
// Replace your existing loadTemplates function with this corrected version
function loadTemplates(searchTerm = '') {
    const templatesList = document.getElementById('templatesList');
    templatesList.innerHTML = '<div class="loading">Loading templates...</div>';
    
    let query = db.collection('templates');
    
    if (searchTerm) {
        query = query.where('title', '>=', searchTerm)
                     .where('title', '<=', searchTerm + '\uf8ff');
    }
    
    query.orderBy('createdAt', 'desc').get().then(snapshot => {
        templatesList.innerHTML = '';
        
        if (snapshot.empty) {
            templatesList.innerHTML = '<p class="no-results">No templates found.</p>';
            return;
        }
        
        snapshot.forEach(doc => {
            const template = doc.data();
            const templateElement = document.createElement('div');
            templateElement.className = 'template-card';
            
            // Enhanced PDF detection for free hosting services
            const isPDF = template.link && (
                template.link.toLowerCase().includes('.pdf') ||
                template.link.includes('drive.google.com') ||
                (template.link.includes('github.io') && template.link.toLowerCase().includes('.pdf')) ||
                (template.link.includes('dropbox.com') && template.link.toLowerCase().includes('.pdf')) ||
                template.link.toLowerCase().includes('pdf')
            );
            
            console.log('Template:', template.title);
            console.log('Link:', template.link);
            console.log('Is PDF?', isPDF);
            
            templateElement.innerHTML = `
                <div class="template-header">
                    <h3>${template.title}</h3>
                    <span class="template-type">${template.type}</span>
                </div>
                <p class="template-description">${template.description}</p>
                <div class="template-link-section">
                    <p class="template-link">
                        <strong>Resource:</strong> 
                        <a href="${template.link}" target="_blank" style="color: #007bff; text-decoration: none;">
                            ${template.link}
                        </a>
                    </p>
                </div>
                <div class="template-footer">
                    ${isPDF ? 
                        `<a href="${template.link}" target="_blank" class="link-btn" 
                           style="background: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 10px;">
                            <i class="fas fa-file-pdf"></i> View PDF
                        </a>` : 
                        ''
                    }
                    <div class="template-date" style="color: #666; font-size: 0.9em;">
                        ${template.createdAt?.toDate() ? 
                            new Date(template.createdAt.toDate()).toLocaleDateString() : 
                            'Recently added'
                        }
                    </div>
                </div>
            `;
            
            templatesList.appendChild(templateElement);
        });
    }).catch(error => {
        console.error('Error loading templates:', error);
        templatesList.innerHTML = '<p class="error">Error loading templates. Please try again.</p>';
    });
}

function searchTemplates() {
    console.log('🔍 Search function called');
    
    const searchInput = document.getElementById('templateSearch');
    const templateCards = document.querySelectorAll('.template-card');
    
    if (!searchInput) {
        console.error('❌ Search input not found');
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    console.log('🔎 Searching for:', searchTerm);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    // Remove any existing "no results" message
    const noResults = document.querySelector('.no-search-results');
    if (noResults) {
        noResults.remove();
    }
    
    templateCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.template-description')?.textContent.toLowerCase() || '';
        const type = card.querySelector('.template-type')?.textContent.toLowerCase() || '';
        
        const matches = searchTerm === '' || 
                       title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       type.includes(searchTerm);
        
        if (matches) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
            hiddenCount++;
        }
    });
    
    console.log(`📊 Search results: ${visibleCount} visible, ${hiddenCount} hidden`);
    
    // Show no results message if needed
    if (visibleCount === 0 && searchTerm !== '') {
        const templatesList = document.getElementById('templatesList');
        if (templatesList) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-search-results';
            noResultsDiv.innerHTML = `<p class="no-results">No templates found matching "${searchTerm}".</p>`;
            templatesList.appendChild(noResultsDiv);
        }
    }
}

class DynamicChecklist {
    constructor(currentUser, db) {
        this.currentUser = currentUser;
        this.db = db;
        this.checklistItems = [
            { id: 'create_profile', text: 'Create your club profile' },
            { id: 'define_goals', text: 'Define collaboration goals' },
            { id: 'browse_partnerships', text: 'Browse partnership opportunities' },
            { id: 'setup_resources', text: 'Set up resource sharing' },
            { id: 'launch_collaboration', text: 'Launch your first collaboration' }
        ];
        this.userProgress = {};
        this.init();
    }

    async init() {
        await this.loadUserProgress();
        this.renderChecklist();
        this.setupEventListeners();
    }

    async loadUserProgress() {
        try {
            const doc = await this.db.collection('userProgress').doc(this.currentUser.uid).get();
            if (doc.exists) {
                this.userProgress = doc.data().checklist || {};
            }
        } catch (error) {
            console.error('Error loading checklist progress:', error);
            this.userProgress = {};
        }
    }

    async saveProgress() {
        try {
            await this.db.collection('userProgress').doc(this.currentUser.uid).set({
                checklist: this.userProgress,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving checklist progress:', error);
        }
    }

    calculateProgress() {
        const completedItems = Object.values(this.userProgress).filter(Boolean).length;
        return { completed: completedItems, total: this.checklistItems.length };
    }

    renderChecklist() {
        const sidebar = document.querySelector('.sidebar');
        const progress = this.calculateProgress();
        
        const checklistHTML = `
            <div class="sidebar-widget featured-collab" style="color: white;">
                <h3 style="color: white;">Collaboration launch checklist</h3>
                <p class="progress-text" style="color: white;">
                    ${progress.completed}/${progress.total} steps completed
                </p>
                
                <div class="progress-bar-container" style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 8px; margin: 15px 0;">
                    <div class="progress-bar" style="
                        background: linear-gradient(90deg, #4CAF50, #45a049);
                        height: 100%;
                        border-radius: 10px;
                        width: ${(progress.completed / progress.total) * 100}%;
                        transition: width 0.5s ease;
                    "></div>
                </div>
                
                <div class="checklist">
                    ${this.checklistItems.map(item => this.renderChecklistItem(item)).join('')}
                </div>
                
                ${progress.completed === progress.total ? 
                    '<div class="completion-celebration" style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(76, 175, 80, 0.2); border-radius: 8px; border: 1px solid #4CAF50;"><div style="font-size: 24px; margin-bottom: 5px;">🎉</div><p style="color: #4CAF50; font-weight: 600; margin: 0;">Congratulations!</p><small style="color: white;">You\'ve completed the collaboration checklist!</small></div>' : ''
                }
            </div>
        `;
        
        // Replace the existing sidebar content
        sidebar.innerHTML = checklistHTML;
    }

    renderChecklistItem(item) {
        const isCompleted = this.userProgress[item.id] || false;
        
        return `
            <div class="checklist-item ${isCompleted ? 'completed' : ''}" data-item-id="${item.id}">
                <div class="checkbox ${isCompleted ? 'checked' : ''}" style="
                    width: 20px;
                    height: 20px;
                    border: 2px solid ${isCompleted ? '#4CAF50' : 'rgba(255,255,255,0.5)'};
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: ${isCompleted ? '#4CAF50' : 'transparent'};
                ">
                    ${isCompleted ? '<i class="fas fa-check" style="color: white; font-size: 12px;"></i>' : ''}
                </div>
                <span style="
                    color: white;
                    margin-left: 12px;
                    text-decoration: ${isCompleted ? 'line-through' : 'none'};
                    opacity: ${isCompleted ? '0.7' : '1'};
                    transition: all 0.3s ease;
                    cursor: pointer;
                    flex: 1;
                ">${item.text}</span>
            </div>
        `;
    }

    setupEventListeners() {
        // Add click listeners to all checklist items
        document.querySelectorAll('.checklist-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const itemId = item.dataset.itemId;
                
                // Toggle the completion status
                this.userProgress[itemId] = !this.userProgress[itemId];
                
                // Save to Firebase
                await this.saveProgress();
                
                // Re-render with animation
                this.animateToggle(item, this.userProgress[itemId]);
                
                // Update progress bar and text
                setTimeout(() => {
                    this.updateProgressDisplay();
                }, 300);
            });
        });
    }

    animateToggle(item, isCompleted) {
        const checkbox = item.querySelector('.checkbox');
        const span = item.querySelector('span');
        
        // Animate checkbox
        checkbox.style.transform = 'scale(0.8)';
        setTimeout(() => {
            checkbox.style.border = `2px solid ${isCompleted ? '#4CAF50' : 'rgba(255,255,255,0.5)'}`;
            checkbox.style.background = isCompleted ? '#4CAF50' : 'transparent';
            checkbox.innerHTML = isCompleted ? '<i class="fas fa-check" style="color: white; font-size: 12px;"></i>' : '';
            checkbox.style.transform = 'scale(1)';
        }, 150);
        
        // Animate text
        span.style.textDecoration = isCompleted ? 'line-through' : 'none';
        span.style.opacity = isCompleted ? '0.7' : '1';
        
        // Add completion class
        if (isCompleted) {
            item.classList.add('completed');
        } else {
            item.classList.remove('completed');
        }
    }

    updateProgressDisplay() {
        const progress = this.calculateProgress();
        const progressText = document.querySelector('.progress-text');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressText) {
            progressText.textContent = `${progress.completed}/${progress.total} steps completed`;
        }
        
        if (progressBar) {
            progressBar.style.width = `${(progress.completed / progress.total) * 100}%`;
        }
        
        // Show celebration if completed
        if (progress.completed === progress.total) {
            this.showCompletionCelebration();
        }
    }

    showCompletionCelebration() {
        // Re-render to show celebration
        setTimeout(() => {
            this.renderChecklist();
            this.setupEventListeners();
        }, 500);
    }
}


window.submitTemplate = async function() {
    console.log("Submit template function called");
    
    if (!window.db) {
        console.error("Firebase DB not initialized!");
        alert('Database not ready. Please try again.');
        return;
    }
    
    const title = document.getElementById('templateTitle')?.value;
    const description = document.getElementById('templateDescription')?.value;
    const type = document.getElementById('templateType')?.value;
    const link = document.getElementById('templateLink')?.value;
    
    // Validate ALL fields including link
    if (!title || !description || !type || !link) {
        alert('Please fill in all fields including a link to your PDF/resource');
        return;
    }
    
    const submitBtn = document.querySelector('#submitTemplateForm button[type="submit"]');
    if (!submitBtn) {
        console.error("Submit button not found!");
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        const templateData = {
            title,
            description,
            type,
            link,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            timestamp: Date.now()
        };
        
        console.log("Saving template data:", templateData);
        
        const docRef = await window.db.collection('templates').add(templateData);
        console.log("Template saved with ID:", docRef.id);
        
        // Reset form
        document.getElementById('submitTemplateForm').reset();
        
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted!';
        submitBtn.style.backgroundColor = '#4CAF50';
        
        if (typeof showNotification === 'function') {
            showNotification('Template submitted successfully!', 'success');
        }
        
        setTimeout(() => {
            if (typeof switchTab === 'function') {
                switchTab('browse-tab');
            }
            if (typeof loadTemplates === 'function') {
                loadTemplates();
            }
            submitBtn.innerHTML = originalText;
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting template:', error);
        submitBtn.innerHTML = '<i class="fas fa-times"></i> Error!';
        submitBtn.style.backgroundColor = '#f44336';
        
        alert('Error submitting template: ' + error.message);
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
        }, 2000);
    }
}
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
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
        }
        
        // Initialize services
       // Initialize services
window.db = firebase.firestore();
window.auth = firebase.auth();



        const openToCollabBtn = document.getElementById('openToCollabBtn');
        const statusIndicator = document.createElement('span');
    statusIndicator.className = 'collab-status';
    statusIndicator.innerHTML = '<span class="status-dot"></span><span class="status-text">Closed to collaborations</span>';
    openToCollabBtn.parentNode.appendChild(statusIndicator);

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

// Listen for auth state changes (you might already have this)
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // User is signed out, redirect to login
        window.location.href = 'login.html';
    }
});

// Call this when user is authenticated
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserClubsMini(user.uid);
    } else {
        // User not logged in - you might want to redirect to login
        console.log("User not authenticated");
    }
});

    let isOpenToCollab = false;
    let vendorsCollection = null; // Global variable to store the collection reference
// Immediate fix - run this right after Firebase initialization
function fixTemplateSubmission() {
    const form = document.getElementById('submitTemplateForm');
    if (form) {
        // Remove existing listeners
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add proper listener with preventDefault
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted - calling submitTemplate');
            if (typeof window.submitTemplate === 'function') {
                await window.submitTemplate();
            } else {
                console.error('submitTemplate function not found!');
            }
        });
        
        console.log('Template form fixed!');
    }
}

// Call this after Firebase is ready
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        setTimeout(fixTemplateSubmission, 1000); // Give time for DOM
    }
});

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        setTimeout(fixTemplateSubmission, 1000); // Give time for DOM
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Remove the individual button click listener and use form submission instead
    const templateForm = document.getElementById('submitTemplateForm');
    if (templateForm) {
        templateForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // ← THIS WAS MISSING
            await submitTemplate();
        });
        console.log("Template form listener added successfully");
    } else {
        console.error("Template form not found!");
    }
    
    // Keep other event listeners
    document.getElementById('getTemplatesBtn').addEventListener('click', openTemplateModal);
    document.querySelector('.close-modal').addEventListener('click', closeTemplateModal);
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.getAttribute('data-tab'));
        });
    });
    
    // Search button
    document.getElementById('searchTemplatesBtn').addEventListener('click', searchTemplates);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('templateModal');
        if (event.target === modal) {
            closeTemplateModal();
        }
    });
});


// Add event listener for the collaboration button
document.getElementById('openToCollabBtn').addEventListener('click', toggleCollabStatus);

// Add this notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        padding: 12px 20px; border-radius: 5px; color: white;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


document.querySelector('.marketplace-card').addEventListener('click', () => {
    document.getElementById('activeCollabModal').style.display = 'block';
    loadActiveCollabClubs();
});

// Close modal functionality
document.getElementById('closeActiveCollabModal').addEventListener('click', () => {
    document.getElementById('activeCollabModal').style.display = 'none';
});

// Load clubs that are open to collaboration
function loadActiveCollabClubs(searchTerm = '') {
    const activeCollabList = document.getElementById('activeCollabList');
    activeCollabList.innerHTML = '<div class="loading">Loading clubs...</div>';
    
    let query = db.collection('clubs').where('openToCollaborate', '==', true);
    
    if (searchTerm) {
        query = query.where('name', '>=', searchTerm)
                    .where('name', '<=', searchTerm + '\uf8ff');
    }
    
    query.get().then(snapshot => {
        activeCollabList.innerHTML = '';
        
        if (snapshot.empty) {
            activeCollabList.innerHTML = '<p class="no-results">No clubs are currently open to collaboration.</p>';
            return;
        }
        
        snapshot.forEach(doc => {
            const club = doc.data();
            if (doc.id !== currentClubId) { // Don't show current user's club
                const clubElement = document.createElement('div');
                clubElement.className = 'club-card';
                clubElement.innerHTML = `
                    <div class="club-info">
                        <h3>${club.name}</h3>
                        <p>${club.mission || 'No mission statement'}</p>
                       <div class="club-stats">
    <div class="stats-left">
        <span class="stat">
            <i class="fas fa-users"></i>
            ${club.memberCount || 0} members
        </span>
        <span class="stat">
            <i class="fas fa-calendar"></i>
            ${club.meetingFrequency || 'No set schedule'}
        </span>
        <span class="collab-badge">
            <i class="fas fa-handshake"></i>
            Open to collaborate
        </span>
    </div>
    <button class="btn-primary request-collab-btn" data-club-id="${doc.id}">
        Request Collaboration
    </button>
</div>
                    </div>
                   
                `;
                activeCollabList.appendChild(clubElement);
            }
        });
        
        // Add event listeners to all request buttons
       // Add event listeners to all request buttons
document.querySelectorAll('.request-collab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clubId = btn.getAttribute('data-club-id');
        sendCollabRequest(clubId, btn); // Pass the button element
    });
});
    }).catch(error => {
        console.error('Error loading active collaboration clubs:', error);
        activeCollabList.innerHTML = '<p class="error">Error loading clubs. Please try again.</p>';
    });
}

// Fix 1: Define functions properly
function openVendorModal() {
    document.getElementById('vendorModal').style.display = 'block';
    loadVendors();
}

function closeVendorModal() {
    document.getElementById('vendorModal').style.display = 'none';
}

// Fix 2: Make sure these functions are available globally
window.openVendorModal = openVendorModal;
window.closeVendorModal = closeVendorModal;

// Fix 3: Ensure Firebase collections are properly initialized


// Initialize after Firebase is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be initialized
    const initVendors = () => {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            vendorsCollection = db.collection('vendors');
            console.log('Vendors collection initialized');
        } else {
            setTimeout(initVendors, 100); // Try again in 100ms
        }
    };
    
    initVendors();
});

// Fix 4: Corrected vendor form submission
document.getElementById('addVendorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.add-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;

    const vendorData = {
        type: document.getElementById('vendorType').value,
        name: document.getElementById('vendorName').value,
        email: document.getElementById('vendorEmail').value,
        usage: document.getElementById('vendorUsage').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        timestamp: Date.now()
    };

    try {
        // Debug: Show what we're trying to save
        console.log("Attempting to save vendor:", vendorData);
        
        // Get reference to Firestore
        const db = firebase.firestore();
        
        // Add document to vendors collection
        const docRef = await db.collection('vendors').add(vendorData);
        
        // Debug: Show success
        console.log("Vendor added with ID:", docRef.id);
        
        // Reset form
        e.target.reset();
        
        // Show success feedback
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Added Successfully!';
        submitBtn.style.background = '#28a745';
        
        // Refresh the vendors list
        loadVendors();
        
    } catch (error) {
        console.error('Error adding vendor:', error);
        submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error - Try Again';
        submitBtn.style.background = '#dc3545';
        
        // Show error details in console
        console.error("Full error details:", {
            error: error,
            firebase: firebase,
            firestore: firebase.firestore,
            config: firebaseConfig
        });
    } finally {
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 3000);
    }
});

// Fix 5: Improved loadVendors function
async function loadVendors() {
    const vendorsList = document.getElementById('vendorsList');
    
    // Show loading state immediately
    vendorsList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading vendors...
        </div>
    `;
    
    try {
        // Ensure Firebase is initialized
        if (!firebase.apps.length) {
            await initializeFirebase();
        }
        
        // Initialize vendorsCollection if not exists
        if (!vendorsCollection) {
            vendorsCollection = firebase.firestore().collection('vendors');
        }
        
        // Proceed with loading vendors
        const snapshot = await vendorsCollection.get();
        
        if (snapshot.empty) {
            vendorsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Vendors Yet</h3>
                    <p>Add the first vendor to get started!</p>
                </div>
            `;
            return;
        }
        
        // Display vendors
        displayVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
    } catch (error) {
        console.error('Error loading vendors:', error);
        vendorsList.innerHTML = `
            <div class="empty-state error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Loading Error</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// Fix 6: Improved displayVendors function
function displayVendors(vendors) {
    const vendorsList = document.getElementById('vendorsList');
    
    if (vendors.length === 0) {
        vendorsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Vendors Yet</h3>
                <p>Add the first vendor to get started!</p>
            </div>
        `;
        return;
    }

    const vendorsHTML = vendors.map(vendor => {
        let createdDate = 'Recently added';
        
        if (vendor.createdAt) {
            try {
                if (vendor.createdAt.seconds) {
                    // Firestore timestamp
                    createdDate = new Date(vendor.createdAt.seconds * 1000).toLocaleDateString();
                } else if (vendor.createdAt.toDate) {
                    // Firestore timestamp object
                    createdDate = vendor.createdAt.toDate().toLocaleDateString();
                } else {
                    // Regular date
                    createdDate = new Date(vendor.createdAt).toLocaleDateString();
                }
            } catch (error) {
                console.warn('Error parsing date:', error);
            }
        }

        return `
            <div class="vendor-card">
                <div class="vendor-header">
                    <div>
                        <div class="vendor-name">${escapeHtml(vendor.name)}</div>
                        <div class="vendor-email">
                            <i class="fas fa-envelope"></i> ${escapeHtml(vendor.email)}
                        </div>
                    </div>
                    <span class="vendor-type">${escapeHtml(vendor.type)}</span>
                </div>
                <div class="vendor-details">
                    <i class="fas fa-calendar-alt"></i> Added ${createdDate}
                </div>
                <div class="vendor-usage">
                    <strong><i class="fas fa-star"></i> Experience:</strong><br>
                    ${escapeHtml(vendor.usage)}
                </div>
            </div>
        `;
    }).join('');

    vendorsList.innerHTML = `
        <h3 style="margin-bottom: 1.5rem; color: #2c3e50;">
            <i class="fas fa-list"></i> All Vendors (${vendors.length})
        </h3>
        <div class="vendors-list">${vendorsHTML}</div>
    `;
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fix 7: Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('vendorModal');
    if (event.target === modal) {
        closeVendorModal();
    }
});

console.log('Vendor modal JavaScript loaded');

// Search functionality
document.getElementById('activeCollabSearch').addEventListener('input', (e) => {
    loadActiveCollabClubs(e.target.value);
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('activeCollabModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


        
        // Configure Firestore settings
        db.settings({
            experimentalForceLongPolling: true,
            merge: true
        });
        
        // Enable Firestore persistence
      

             auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            await loadCurrentClub();
            await loadCollabStatus();
            const dynamicChecklist = new DynamicChecklist(user, db);
        }
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
     

        // Call this when user is authenticated
      auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        await loadClubSwitcher(); // Load dropdown first
        const hasClub = await loadCurrentClub();
        if (hasClub) {
            await loadCollabStatus();
            listenForCollabRequests();
            loadPartners();
        }
    } else {
        window.location.href = 'login.html';
    }
});

// Load user's owned clubs into dropdown
async function loadClubSwitcher() {
    if (!currentUser) return;
    
    const clubSelect = document.getElementById('clubSelect');
    clubSelect.innerHTML = '<option value="">Loading...</option>';
    
    try {
        // Get user document to find owned clubs
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (!userDoc.exists) {
            clubSelect.innerHTML = '<option value="">No clubs found</option>';
            return;
        }
        
        const userData = userDoc.data();
        const ownedClubs = userData.ownedClubs || [];
        
        if (ownedClubs.length === 0) {
            clubSelect.innerHTML = '<option value="">No clubs owned</option>';
            return;
        }
        
        // Clear dropdown
        clubSelect.innerHTML = '<option value="">Select a club...</option>';
        
        // Get details for each owned club
        const clubPromises = ownedClubs.map(clubId => 
            db.collection('clubs').doc(clubId).get()
        );
        
        const clubDocs = await Promise.all(clubPromises);
        
        clubDocs.forEach((doc, index) => {
            if (doc.exists) {
                const club = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = club.name || `Club ${index + 1}`;
                clubSelect.appendChild(option);
            }
        });
        
        // Set current club as selected if it exists
        if (currentClubId && ownedClubs.includes(currentClubId)) {
            clubSelect.value = currentClubId;
        } else if (ownedClubs.length > 0) {
            // Auto-select first club if no current club
            clubSelect.value = ownedClubs[0];
            currentClubId = ownedClubs[0];
        }
        
    } catch (error) {
        console.error('Error loading club switcher:', error);
        clubSelect.innerHTML = '<option value="">Error loading clubs</option>';
    }
}

// Handle club switching
document.getElementById('clubSelect').addEventListener('change', async function() {
    const selectedClubId = this.value;
    
    if (!selectedClubId) return;
    
    console.log('Switching to club:', selectedClubId);
    
    // Update current club ID
    currentClubId = selectedClubId;
    
    // Reload everything for the new club
    try {
        await loadCollabStatus();
        loadPartners();
        
        // Refresh any other club-specific data
        console.log('Successfully switched to club:', selectedClubId);
        
        // Show confirmation
        showNotification(`Switched to club: ${this.options[this.selectedIndex].text}`, 'success');
        
    } catch (error) {
        console.error('Error switching clubs:', error);
        showNotification('Error switching clubs', 'error');
    }
});


        console.log('Community platform loaded successfully!');

// DOM elements
const createCollabBtn = document.getElementById('createCollabBtn');
const browsePartnersBtn = document.getElementById('browsePartnersBtn');
const clubsModal = document.getElementById('clubsModal');
const partnersModal = document.getElementById('partnersModal');
const collabRequestModal = document.getElementById('collabRequestModal');
const closeClubsModal = document.getElementById('closeClubsModal');
const closePartnersModal = document.getElementById('closePartnersModal');
const closeCollabRequestModal = document.getElementById('closeCollabRequestModal');
const clubsList = document.getElementById('clubsList');
const partnersList = document.getElementById('partnersList');
const clubSearch = document.getElementById('clubSearch');
const rejectCollabRequest = document.getElementById('rejectCollabRequest');
const acceptCollabRequest = document.getElementById('acceptCollabRequest');
const collabRequestContent = document.getElementById('collabRequestContent');

// Current user and club info
let currentUser = null;
let currentClubId = null;

// Listen for auth state changes
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadCurrentClub();
        listenForCollabRequests();
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
});

// Load current club info
async function loadCurrentClub() {
    if (!currentUser) return false;
    
    // If we already have a club ID from the switcher, use it
    if (currentClubId) {
        console.log('Using selected club ID:', currentClubId);
        return true;
    }
    
    // Otherwise, find user's first owned club (fallback)
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const ownedClubs = userData.ownedClubs || [];
            
            if (ownedClubs.length > 0) {
                currentClubId = ownedClubs[0];
                console.log('Auto-selected first club:', currentClubId);
                return true;
            }
        }
    } catch (error) {
        console.error('Error loading club:', error);
    }
    return false;
}

const equipmentData = {
    av: [
        { id: 'projector-1', name: 'HD Projector', description: 'Epson PowerLite 1080p projector' },
        { id: 'projector-2', name: 'Portable Projector', description: 'Mini projector for small rooms' },
        { id: 'microphone-1', name: 'Wireless Microphone Set', description: 'Shure wireless mic system' },
        { id: 'microphone-2', name: 'Lavalier Microphone', description: 'Clip-on microphone' },
        { id: 'speaker-1', name: 'PA Speaker System', description: 'JBL portable PA system' },
        { id: 'speaker-2', name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker' },
        { id: 'camera-1', name: 'DSLR Camera', description: 'Canon EOS camera with lens' },
        { id: 'camera-2', name: 'Video Camera', description: 'Sony Handycam for recordings' },
        { id: 'tripod-1', name: 'Camera Tripod', description: 'Adjustable height tripod' },
        { id: 'screen-1', name: 'Projection Screen', description: 'Portable projection screen' }
    ],
    event: [
        { id: 'table-round-1', name: 'Round Table (6-person)', description: 'White round table seats 6' },
        { id: 'table-round-2', name: 'Round Table (8-person)', description: 'White round table seats 8' },
        { id: 'table-rect-1', name: 'Rectangular Table', description: '6ft rectangular table' },
        { id: 'table-rect-2', name: 'Folding Table', description: '4ft folding table' },
        { id: 'chairs-1', name: 'Folding Chairs (Set of 10)', description: 'Black folding chairs' },
        { id: 'chairs-2', name: 'Stackable Chairs (Set of 8)', description: 'Blue stackable chairs' },
        { id: 'tent-1', name: 'Pop-up Tent (10x10)', description: 'White canopy tent' },
        { id: 'tent-2', name: 'Pop-up Tent (10x20)', description: 'Large canopy tent' },
        { id: 'tablecloth-1', name: 'Table Linens (White)', description: 'White tablecloths set of 5' },
        { id: 'tablecloth-2', name: 'Table Linens (Blue)', description: 'Blue tablecloths set of 5' }
    ],
    general: [
        { id: 'flipchart-1', name: 'Flip Chart Easel', description: 'Portable flip chart stand' },
        { id: 'markers-1', name: 'Marker Set', description: 'Assorted color markers' },
        { id: 'extension-1', name: 'Extension Cords (Set)', description: '25ft extension cords' },
        { id: 'clipboard-1', name: 'Clipboards (Set of 10)', description: 'Letter-size clipboards' },
        { id: 'banner-1', name: 'Banner Stand', description: 'Retractable banner stand' },
        { id: 'cooler-1', name: 'Large Cooler', description: '48-quart wheeled cooler' },
        { id: 'cooler-2', name: 'Small Cooler', description: '16-quart portable cooler' },
        { id: 'generator-1', name: 'Portable Generator', description: '2000W portable generator' },
        { id: 'toolkit-1', name: 'Basic Tool Kit', description: 'Screwdrivers, hammer, pliers' },
        { id: 'firstaid-1', name: 'First Aid Kit', description: 'Complete first aid supplies' }
    ]
};

let currentCategory = 'av';

// Initialize equipment in Firebase (run once)
async function initializeEquipment() {
    try {
        const equipmentRef = db.collection('equipment');
        const snapshot = await equipmentRef.get();
        
        // Only initialize if collection is empty
        if (snapshot.empty) {
            console.log('Initializing equipment in Firebase...');
            
            for (const category in equipmentData) {
                for (const item of equipmentData[category]) {
                    await equipmentRef.doc(item.id).set({
                        ...item,
                        category: category,
                        inUse: false,
                        reservedBy: null,
                        reservedAt: null,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            console.log('Equipment initialized successfully!');
        }
    } catch (error) {
        console.error('Error initializing equipment:', error);
    }
}

// Open equipment modal
document.querySelector('.resource-btn').addEventListener('click', () => {
    document.getElementById('equipmentModal').style.display = 'block';
    loadEquipment(currentCategory);
});

// Close modal
document.getElementById('closeEquipmentModal').addEventListener('click', () => {
    document.getElementById('equipmentModal').style.display = 'none';
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Load equipment for selected category
        currentCategory = btn.getAttribute('data-category');
        loadEquipment(currentCategory);
    });
});

// Load equipment from Firebase
// SIMPLE FIX: Update loadEquipment to show waitlist info
function loadEquipment(category) {
    const equipmentGrid = document.getElementById('equipmentGrid');
    equipmentGrid.innerHTML = '<div class="loading">Loading equipment...</div>';
    
    db.collection('equipment')
        .where('category', '==', category)
        .onSnapshot(async (snapshot) => {
            equipmentGrid.innerHTML = '';
            
            if (snapshot.empty) {
                equipmentGrid.innerHTML = '<p class="no-equipment">No equipment found.</p>';
                return;
            }
            
            // Load waitlist counts for all equipment
            const equipmentIds = snapshot.docs.map(doc => doc.id);
            const waitlistCounts = await getWaitlistCounts(equipmentIds);
            
            snapshot.forEach(doc => {
                const equipment = doc.data();
                const waitlistCount = waitlistCounts[doc.id] || 0;
                equipment.waitlistCount = waitlistCount; // Add to equipment object
                
                const equipmentCard = createEquipmentCard(doc.id, equipment);
                equipmentGrid.appendChild(equipmentCard);
            });
        });
}

// Helper function to get waitlist counts
async function getWaitlistCounts(equipmentIds) {
    const counts = {};
    
    try {
        const waitlistDocs = await db.collection('equipmentWaitlists')
            .where('equipmentId', 'in', equipmentIds)
            .get();
            
        waitlistDocs.forEach(doc => {
            const data = doc.data();
            counts[data.equipmentId] = data.users ? data.users.length : 0;
        });
    } catch (error) {
        console.error('Error getting waitlist counts:', error);
    }
    
    return counts;
}


// Create equipment card element
// SIMPLE FIX: Replace your createEquipmentCard function with this
// SIMPLE FIX: Update your equipment card creation
function createEquipmentCard(equipmentId, equipment) {
    const card = document.createElement('div');
    card.className = `equipment-card ${equipment.inUse ? 'in-use' : 'available'}`;
    
    const isReservedByCurrentUser = equipment.reservedBy === currentUser?.email;
    
    card.innerHTML = `
        <div class="equipment-info">
            <h4>${equipment.name}</h4>
            <p>${equipment.description}</p>
            <div class="equipment-status">
                <span class="status-indicator ${equipment.inUse ? 'busy' : 'free'}">
                    ${equipment.inUse ? 'In Use' : 'Available'}
                </span>
                ${equipment.reservedBy ? `<span class="reserved-by">Reserved by: ${equipment.reservedBy}</span>` : ''}
            </div>
        </div>
        <div class="equipment-controls">
            ${!equipment.inUse ? `
                <button class="btn-reserve" data-equipment-id="${equipmentId}">
                    Reserve
                </button>
            ` : isReservedByCurrentUser ? `
                <button class="btn-return" data-equipment-id="${equipmentId}">
                    Return Item
                </button>
                <button class="btn-request" data-equipment-id="${equipmentId}">
                    Ask for Return
                </button>
            ` : `
                <button class="btn-waitlist" data-equipment-id="${equipmentId}">
                    Join Waitlist
                </button>
                <button class="btn-view-waitlist" data-equipment-id="${equipmentId}">
                    View Waitlist
                </button>
            `}
        </div>
    `;
    
    // Add click listeners
    const reserveBtn = card.querySelector('.btn-reserve');
    const returnBtn = card.querySelector('.btn-return');
    const requestBtn = card.querySelector('.btn-request');
    const waitlistBtn = card.querySelector('.btn-waitlist');
    const viewWaitlistBtn = card.querySelector('.btn-view-waitlist');
    
    if (reserveBtn) reserveBtn.addEventListener('click', () => reserveEquipment(equipmentId));
    if (returnBtn) returnBtn.addEventListener('click', () => returnEquipment(equipmentId));
    if (requestBtn) requestBtn.addEventListener('click', () => askForReturn(equipmentId));
    if (waitlistBtn) waitlistBtn.addEventListener('click', () => joinWaitlist(equipmentId));
    if (viewWaitlistBtn) viewWaitlistBtn.addEventListener('click', () => viewWaitlist(equipmentId));
    
    return card;
}


 // SIMPLE FIREBASE WAITLIST INTEGRATION
async function reserveEquipment(equipmentId) {
    if (!currentUser) {
        alert('Please log in to reserve equipment');
        return;
    }
    
    try {
        // Check if equipment is available
        const equipmentDoc = await db.collection('equipment').doc(equipmentId).get();
        const equipment = equipmentDoc.data();
        
        if (equipment.inUse) {
            alert('This equipment is already in use. Would you like to join the waitlist?');
            return;
        }
        
        await db.collection('equipment').doc(equipmentId).update({
            inUse: true,
            reservedBy: currentUser.email,
            reservedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('Equipment reserved!');
        loadEquipment(currentCategory);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to reserve equipment');
    }
}

async function returnEquipment(equipmentId) {
    if (!currentUser) {
        alert('Please log in to return equipment');
        return;
    }
    
    try {
        // Check waitlist first
        const waitlistDoc = await db.collection('equipmentWaitlists').doc(equipmentId).get();
        const waitlist = waitlistDoc.exists ? waitlistDoc.data().users : [];
        
        if (waitlist.length > 0) {
            // Notify next person and assign to them
            const nextUser = waitlist[0];
            await db.collection('equipment').doc(equipmentId).update({
                inUse: true,
                reservedBy: nextUser.email,
                reservedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Remove from waitlist
            const updatedWaitlist = waitlist.slice(1);
            await db.collection('equipmentWaitlists').doc(equipmentId).update({
                users: updatedWaitlist
            });
            
            alert('Equipment returned and assigned to next person in waitlist!');
        } else {
            // No waitlist, just return
            await db.collection('equipment').doc(equipmentId).update({
                inUse: false,
                reservedBy: null,
                reservedAt: null
            });
            alert('Equipment returned!');
        }
        
        loadEquipment(currentCategory);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to return equipment');
    }
}

async function askForReturn(equipmentId) {
    // Simple notification system - just alert for now
    alert('Request sent to current user to return the equipment early.');
}

async function joinWaitlist(equipmentId) {
    if (!currentUser) {
        alert('Please log in to join waitlist');
        return;
    }
    
    try {
        const waitlistRef = db.collection('equipmentWaitlists').doc(equipmentId);
        const waitlistDoc = await waitlistRef.get();
        
        const userData = {
            userId: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || 'User',
            joinedAt: new Date()
        };
        
        if (!waitlistDoc.exists) {
            // Create new waitlist
            await waitlistRef.set({
                equipmentId: equipmentId,
                users: [userData],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Add to existing waitlist
            const currentWaitlist = waitlistDoc.data().users || [];
            
            // Check if already in waitlist
            if (currentWaitlist.some(user => user.userId === currentUser.uid)) {
                alert('You are already in the waitlist!');
                return;
            }
            
            await waitlistRef.update({
                users: [...currentWaitlist, userData]
            });
        }
        
        alert(`Joined waitlist! Position: #${(waitlistDoc.exists ? waitlistDoc.data().users.length : 0) + 1}`);
        loadEquipment(currentCategory);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to join waitlist');
    }
}

// NEW FUNCTION: View waitlist
async function viewWaitlist(equipmentId) {
    try {
        const waitlistDoc = await db.collection('equipmentWaitlists').doc(equipmentId).get();
        
        if (!waitlistDoc.exists || !waitlistDoc.data().users.length) {
            alert('No one in the waitlist yet.');
            return;
        }
        
        const waitlist = waitlistDoc.data().users;
        let waitlistText = 'Current Waitlist:\n\n';
        
        waitlist.forEach((user, index) => {
            const isYou = user.userId === currentUser?.uid;
            waitlistText += `${index + 1}. ${user.name} (${user.email}) ${isYou ? ' ← YOU' : ''}\n`;
        });
        
        const userInWaitlist = waitlist.some(user => user.userId === currentUser.uid);
        
        if (userInWaitlist) {
            const userPosition = waitlist.findIndex(user => user.userId === currentUser.uid) + 1;
            waitlistText += `\nYour position: #${userPosition}`;
            
            if (confirm(waitlistText + '\n\nDo you want to leave the waitlist?')) {
                await leaveWaitlist(equipmentId);
            }
        } else {
            alert(waitlistText);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load waitlist');
    }
}

// NEW FUNCTION: Leave waitlist
async function leaveWaitlist(equipmentId) {
    if (!currentUser) return;
    
    try {
        const waitlistRef = db.collection('equipmentWaitlists').doc(equipmentId);
        const waitlistDoc = await waitlistRef.get();
        
        if (waitlistDoc.exists) {
            const currentWaitlist = waitlistDoc.data().users || [];
            const updatedWaitlist = currentWaitlist.filter(user => user.userId !== currentUser.uid);
            
            await waitlistRef.update({
                users: updatedWaitlist
            });
            
            alert('You have left the waitlist.');
            loadEquipment(currentCategory);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to leave waitlist');
    }
}

// Toggle equipment status
async function toggleEquipmentStatus(equipmentId, inUse) {
    if (!currentUser) {
        alert('Please log in to reserve equipment');
        return;
    }
    
    try {
        const updateData = {
            inUse: inUse,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (inUse) {
            updateData.reservedBy = currentUser.email;
            updateData.reservedAt = firebase.firestore.FieldValue.serverTimestamp();
        } else {
            updateData.reservedBy = null;
            updateData.reservedAt = null;
        }
        
        await db.collection('equipment').doc(equipmentId).update(updateData);
        
        showNotification(
            inUse ? 'Equipment reserved successfully!' : 'Equipment returned successfully!',
            'success'
        );
        
    } catch (error) {
        console.error('Error updating equipment status:', error);
        showNotification('Error updating equipment status', 'error');
    }
}

// Initialize equipment when page loads
window.addEventListener('load', () => {
    // Only initialize if user is authenticated
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            initializeEquipment();
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('equipmentModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


    async function loadCollabStatus() {
        if (!currentClubId) return;
        
        try {
            const clubDoc = await db.collection('clubs').doc(currentClubId).get();
            if (clubDoc.exists) {
                const clubData = clubDoc.data();
                isOpenToCollab = clubData.openToCollaborate || false;
                updateButtonState();
            }
        } catch (error) {
            console.error('Error loading collab status:', error);
        }
    }

    // Update button and status display
    function updateButtonState() {
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');
        
        if (isOpenToCollab) {
            openToCollabBtn.textContent = 'Close to Collaborate';
            openToCollabBtn.classList.add('active');
            statusDot.classList.add('open');
            statusText.textContent = 'Open';
        } else {
            openToCollabBtn.textContent = 'Open to Collaborate';
            openToCollabBtn.classList.remove('active');
            statusDot.classList.remove('open');
            statusText.textContent = 'Closed';
        }
    }

    // Toggle collaboration status
    async function toggleCollabStatus() {
        if (!currentClubId || !currentUser) {
            alert('Error: Club not loaded');
            return;
        }

        // Show loading state
        openToCollabBtn.classList.add('loading');
        openToCollabBtn.textContent = 'Updating...';

        try {
            const newStatus = !isOpenToCollab;
            
            // Update in Firestore
            await db.collection('clubs').doc(currentClubId).update({
                openToCollaborate: newStatus,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local state
            isOpenToCollab = newStatus;
            updateButtonState();

            // Show success message
            const message = newStatus ? 
                'Your club is now open to collaboration requests!' : 
                'Your club is no longer accepting collaboration requests.';
            
            showNotification(message, newStatus ? 'success' : 'info');
            
            console.log(`Club collaboration status updated: ${newStatus}`);

        } catch (error) {
            console.error('Error updating collaboration status:', error);
            alert('Failed to update collaboration status. Please try again.');
        } finally {
            // Remove loading state
            openToCollabBtn.classList.remove('loading');
        }
    }
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
            <div class="request-header">
                <h3>New Collaboration Request</h3>
                <p><strong>To your club:</strong> ${toClub.name}</p>
                <p><strong>From:</strong> ${fromClub.name}</p>
            </div>
            <div class="request-details">
                <p><strong>Request ID:</strong> ${requestDoc.id}</p>
                <p><strong>From Club Mission:</strong> ${fromClub.mission || 'Not specified'}</p>
                <p><strong>From Club Members:</strong> ${fromClub.memberCount || 0}</p>
                <p><strong>Sent At:</strong> ${request.createdAt?.toDate() || 'Unknown time'}</p>
            </div>
            <input type="hidden" id="requestId" value="${requestDoc.id}">
            <input type="hidden" id="fromClubId" value="${request.fromClubId}">
            <input type="hidden" id="toClubId" value="${request.toClubId}">
        `;
        
        console.log("[REQUEST] Displaying modal");
        modal.style.display = 'block';
        console.groupEnd();
    }).catch(error => {
        console.error("[REQUEST] Error loading club data:", error);
        console.groupEnd();
    });
}

// Load all clubs for the clubs modal
function loadAllClubs(searchTerm = '') {
    clubsList.innerHTML = '';
    
    let query = db.collection('clubs');
    
    if (searchTerm) {
        query = query.where('name', '>=', searchTerm)
                    .where('name', '<=', searchTerm + '\uf8ff');
    }
    
    query.get().then(snapshot => {
        if (snapshot.empty) {
            clubsList.innerHTML = '<p>No clubs found.</p>';
            return;
        }
        
        snapshot.forEach(doc => {
            const club = doc.data();
            if (doc.id !== currentClubId) { // Don't show current user's club
                const clubElement = document.createElement('div');
                clubElement.className = 'club-card';
                clubElement.innerHTML = `
                    <div class="club-info">
                        <h3>${club.name}</h3>
                        <p>${club.mission || 'No mission statement'}</p>
                        <div class="club-stats">
                            <span>${club.memberCount || 0} members</span>
                            <span>${club.meetingFrequency || 'No set schedule'}</span>
                        </div>
                    </div>
                    <button class="btn-primary request-collab-btn" data-club-id="${doc.id}">Request Collaboration</button>
                `;
                clubsList.appendChild(clubElement);
            }
        });
        
        // Add event listeners to all request buttons
      // Add event listeners to all request buttons
document.querySelectorAll('.request-collab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const clubId = btn.getAttribute('data-club-id');
        sendCollabRequest(clubId, btn); // Pass the button element
    });
});
    });
}

// Send collaboration request
// In your collaboration page JS
async function sendCollabRequest(targetClubId, buttonElement = null) {
    // Verify we have a valid club ID
    if (!currentClubId) {
        const hasClub = await loadCurrentClub();
        if (!hasClub) {
            showErrorModal("You need to create a club before sending requests");
            return;
        }
    }
    
    try {
        await db.collection('collaborationRequests').add({
            fromClubId: currentClubId,
            toClubId: targetClubId,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            fromUserId: currentUser.uid
        });
        
        showSuccessModal('Collaboration request sent successfully!');
        updateRequestButton(targetClubId, buttonElement);
        
    } catch (error) {
        console.error('Error sending request:', error);
        showErrorModal('Failed to send request. Please try again.');
    }
}

// 🎯 ADD THIS FUNCTION
function updateRequestButton(clubId, buttonElement = null) {
    // Use the passed button element or find it by club ID
    const button = buttonElement || document.querySelector(`[data-club-id="${clubId}"]`);
    if (button) {
        button.textContent = 'Collaboration Requested';
        button.style.background = '#6c757d';
        button.style.opacity = '0.8';
        button.disabled = true;
        button.style.cursor = 'not-allowed';
        button.style.transform = 'none';
    }
}

// Listen for collaboration requests
function listenForCollabRequests() {
    if (!currentClubId) return;
    
    db.collection('collaborationRequests')
        .where('toClubId', '==', currentClubId)
        .where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    showCollabRequest(change.doc);
                }
            });
        });
}

// Show collaboration request modal
function showCollabRequest(requestDoc) {
    const request = requestDoc.data();
    
    // Get the club info that sent the request
    db.collection('clubs').doc(request.fromClubId).get().then(clubDoc => {
        const club = clubDoc.data();
        
        collabRequestContent.innerHTML = `
            <div class="request-header">
                <h3>New Collaboration Request</h3>
                <p>From: ${club.name}</p>
            </div>
            <div class="request-details">
                <p><strong>Mission:</strong> ${club.mission || 'Not specified'}</p>
                <p><strong>Members:</strong> ${club.memberCount || 0}</p>
                <p><strong>Meeting Schedule:</strong> ${club.meetingTime || 'Not specified'}</p>
            </div>
            <input type="hidden" id="requestId" value="${requestDoc.id}">
        `;
        
        collabRequestModal.style.display = 'block';
    });
}

// Handle accept/reject of collaboration request
acceptCollabRequest.addEventListener('click', () => {
    const requestId = document.getElementById('requestId').value;
    
    db.collection('collaborationRequests').doc(requestId).update({
        status: 'accepted',
        respondedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // Add to partners list for both clubs
        db.collection('collaborationRequests').doc(requestId).get().then(requestDoc => {
            const request = requestDoc.data();
            
            // Add to current club's partners
            db.collection('clubs').doc(currentClubId).update({
                partners: firebase.firestore.FieldValue.arrayUnion(request.fromClubId)
            });
            
            // Add to requesting club's partners
            db.collection('clubs').doc(request.fromClubId).update({
                partners: firebase.firestore.FieldValue.arrayUnion(currentClubId)
            });
            
            collabRequestModal.style.display = 'none';
            loadPartners(); // Refresh partners list
        });
    });
});

rejectCollabRequest.addEventListener('click', () => {
    const requestId = document.getElementById('requestId').value;
    
    db.collection('collaborationRequests').doc(requestId).update({
        status: 'rejected',
        respondedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        collabRequestModal.style.display = 'none';
    });
});

// Load current club's partners
function loadPartners() {
    if (!currentClubId) return;
    
    partnersList.innerHTML = '';
    
    db.collection('clubs').doc(currentClubId).get().then(doc => {
        const club = doc.data();
        const partners = club.partners || [];
        
        if (partners.length === 0) {
            partnersList.innerHTML = '<p>You don\'t have any partners yet. Start by sending collaboration requests to other clubs.</p>';
            return;
        }
        
        // Get info for each partner
        const promises = partners.map(partnerId => {
            return db.collection('clubs').doc(partnerId).get();
        });
        
        Promise.all(promises).then(snapshots => {
            snapshots.forEach(snapshot => {
                const partner = snapshot.data();
                const partnerElement = document.createElement('div');
                partnerElement.className = 'partner-card';
                partnerElement.innerHTML = `
                    <div class="partner-info">
                        <h3>${partner.name}</h3>
                        <p>${partner.mission || 'No mission statement'}</p>
                        <div class="partner-stats">
                            <span>${partner.memberCount || 0} members</span>
                        </div>
                    </div>
               
                `;
                partnersList.appendChild(partnerElement);
            });
        });
    });
}

// Event listeners for modals
createCollabBtn.addEventListener('click', () => {
    clubsModal.style.display = 'block';
    loadAllClubs();
});

browsePartnersBtn.addEventListener('click', () => {
    partnersModal.style.display = 'block';
    loadPartners();
});

closeClubsModal.addEventListener('click', () => {
    clubsModal.style.display = 'none';
});

closePartnersModal.addEventListener('click', () => {
    partnersModal.style.display = 'none';
});

closeCollabRequestModal.addEventListener('click', () => {
    collabRequestModal.style.display = 'none';
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === clubsModal) {
        clubsModal.style.display = 'none';
    }
    if (event.target === partnersModal) {
        partnersModal.style.display = 'none';
    }
    if (event.target === collabRequestModal) {
        collabRequestModal.style.display = 'none';
    }
});

// Search functionality for clubs
clubSearch.addEventListener('input', (e) => {
    loadAllClubs(e.target.value);
});

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
                document.getElementById('collabRequestModal').style.display = 'none';
                alert('Collaboration request accepted!');
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
            document.getElementById('collabRequestModal').style.display = 'none';
            alert('Collaboration request declined.');
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

function showSuccessModal(message) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="color: #28a745; margin-bottom: 1rem;">Success!</h3>
            <p>${message}</p>
            <button class="modal-close-btn" onclick="this.closest('.success-modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Auto close after 3 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 3000);
}

function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'error-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="color: #dc3545; margin-bottom: 1rem;">Error</h3>
            <p>${message}</p>
            <button class="modal-close-btn" onclick="this.closest('.error-modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

} catch (error) {
        console.error("Firebase initialization error:", error);
        alert("Failed to initialize Firebase. Please refresh the page.");
    }
});