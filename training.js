const modalContents = {
  'event': {
    title: "🚀 Ultimate Event Planning Master Kit",
    content: `
      <div class="modal-section">
        <h3>Venue Selection & Setup</h3>
        <ul>
          <li><strong>Capacity Calculator</strong> - Formulas to determine optimal space based on event type (lecture: 15 sq ft/person, networking: 25 sq ft/person)</li>
          <li><strong>Tech Rider Template</strong> - Detailed AV requirements for different events:
            <ul>
              <li>Panel discussions: 2 wireless mics, 1 lapel mic, dual projector setup</li>
              <li>Workshops: 6 power strips, 3 extension cords, whiteboard markers</li>
            </ul>
          </li>
          <li><strong>Permit Playbook</strong> - School-specific requirements for:
            <ul>
              <li>Food service: Health department waiver thresholds</li>
              <li>Amplified sound: Decibel limits by campus zone</li>
              <li>After-hours access: Custodian overtime policies</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>6-Week Countdown Planner</h3>
        <ol>
          <li><strong>Week 6:</strong> 
            <ul>
              <li>Venue contract review checklist (insurance clauses, cancellation policies)</li>
              <li>Social media asset kit (10 Canva templates sized for Instagram/TikTok)</li>
            </ul>
          </li>
          <li><strong>Week 4:</strong> 
            <ul>
              <li>Speaker confirmation scripts (3 follow-up email templates)</li>
              <li>Volunteer sign-up sheet with role descriptions</li>
            </ul>
          </li>
          <li><strong>Week 2:</strong> 
            <ul>
              <li>Tech rehearsal run sheet (includes equipment testing sequence)</li>
              <li>Day-of emergency contacts (IT support, facilities, security extensions)</li>
            </ul>
          </li>
        </ol>
      </div>
      
      <div class="modal-extra">
        <h4>Event Run Sheet Template</h4>
        <p>Pre-formatted timeline with:</p>
        <ul>
          <li>15-minute increments from setup (-3 hours) to teardown (+1 hour)</li>
          <li>Volunteer assignments matrix (name, contact, location, responsibility)</li>
          <li>Speaker bios pre-loaded for introductions (30-60-90 second versions)</li>
          <li>Contingency plans for 12 common issues (AV failure, no-shows, overcrowding)</li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(135deg, rgba(255,232,223,0.9) 0%, rgba(255,211,186,0.9) 100%);
      border: 1px solid #FFD3BA;
      color: #d35400;
      box-shadow: 0 2px 8px rgba(255,211,186,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(135deg, #FFE8DF 0%, #FFD3BA 100%);
      color: #d35400;
    `
  },
  'fundraising': {
    title: "💸 Advanced Fundraising Playbook",
    content: `
      <div class="modal-section">
        <h3>TikTok Viral Campaign Builder</h3>
        <ul>
          <li><strong>5 Challenge Templates</strong>:
            <ul>
              <li>"Teacher Dance-Off" - Participation increased donations by 37% at Lincoln HS</li>
              <li>"Club Chain Reaction" - Viral trend with 12-step setup diagram</li>
            </ul>
          </li>
          <li><strong>Algorithm Playbook</strong>:
            <ul>
              <li>Optimal posting times: Tuesday 3-4pm, Friday 11am-12pm</li>
              <li>Hashtag strategy: #SchoolSpirit (broad) vs #ForTheKids (emotional)</li>
            </ul>
          </li>
          <li><strong>Donation Link Optimization</strong>:
            <ul>
              <li>Bio link vs story link CTR comparisons (22% vs 41%)</li>
              <li>Comment placement timing (within 15 minutes of post)</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>Sponsorship Toolkit</h3>
        <ul>
          <li><strong>Tiered Ask Templates</strong>:
            <ol>
              <li>$500 Level:
                <ul>
                  <li>Logo on t-shirts (vector file requirements)</li>
                  <li>Social media shoutout (sample captions)</li>
                </ul>
              </li>
              <li>$1,000 Level:
                <ul>
                  <li>2-minute speaking opportunity (intro script)</li>
                  <li>Booth space dimensions (8x8 layout diagram)</li>
                </ul>
              </li>
            </ol>
          </li>
          <li><strong>Local Business Pitch Deck</strong>:
            <ul>
              <li>Tax benefit calculator (input revenue for deduction estimate)</li>
              <li>Demographic reach stats (student population + family numbers)</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-extra">
        <h4>Financial Tracking System</h4>
        <ul>
          <li><strong>Expense Tracker</strong>:
            <ul>
              <li>Automatic categorization (supplies, food, marketing)</li>
              <li>Receipt upload system (Google Form integration)</li>
            </ul>
          </li>
          <li><strong>Donor Management</strong>:
            <ul>
              <li>Contact database (tags for businesses, alumni, parents)</li>
              <li>Thank you note scheduler (3-day follow-up reminder)</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(to right, rgba(224,247,233,0.9) 0%, rgba(200,244,222,0.9) 50%, rgba(176,241,211,0.9) 100%);
      border: 1px solid #B0F1D3;
      color: #27ae60;
      box-shadow: 0 2px 8px rgba(176,241,211,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(to right, #E0F7E9 0%, #C8F4DE 50%, #B0F1D3 100%);
      color: #27ae60;
    `
  },
  'engagement': {
    title: "💡 Member Engagement Accelerator",
    content: `
      <div class="modal-section">
        <h3>Icebreaker Database</h3>
        <ul>
          <li><strong>First Meeting</strong>:
            <ul>
              <li>"Two Truths and a Club Lie" - Modified version with club-related prompts</li>
              <li>"Common Ground" - Find shared experiences among members</li>
            </ul>
          </li>
          <li><strong>Mid-Year</strong>:
            <ul>
              <li>"Skill Bingo" - Grid of 25 hidden talents members might have</li>
              <li>"Project Pitch" - 60-second idea sharing with feedback</li>
            </ul>
          </li>
          <li><strong>Virtual</strong>:
            <ul>
              <li>"Emoji Intro" - Members describe themselves using 3 emojis</li>
              <li>"Screen Share Challenge" - Fun rapid-fire show-and-tell</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>Retention Email Sequences</h3>
        <ul>
          <li><strong>New Member</strong>:
            <ol>
              <li>Day 1: Welcome email with onboarding checklist</li>
              <li>Day 3: "Getting to Know You" survey link</li>
              <li>Day 7: Upcoming events calendar</li>
            </ol>
          </li>
          <li><strong>Lapsing Member</strong>:
            <ol>
              <li>Week 1: "We Miss You" with personalized participation recap</li>
              <li>Week 2: Exclusive preview of upcoming activities</li>
              <li>Week 3: Alumni success story feature</li>
            </ol>
          </li>
        </ul>
      </div>
      
      <div class="modal-extra">
        <h4>Participation Tracker</h4>
        <ul>
          <li><strong>Attendance Analytics</strong>:
            <ul>
              <li>Heat maps showing meeting popularity by time/day</li>
              <li>Member engagement scores (formula: events attended + roles taken)</li>
            </ul>
          </li>
          <li><strong>Recognition System</strong>:
            <ul>
              <li>Automated milestone alerts (10 events, 25 hours)</li>
              <li>Customizable certificate templates</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(135deg, rgba(226,243,253,0.9) 0%, rgba(209,233,255,0.9) 100%);
      border: 1px solid #D1E9FF;
      color: #2980b9;
      box-shadow: 0 2px 8px rgba(209,233,255,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(135deg, #E2F3FD 0%, #D1E9FF 100%);
      color: #2980b9;
    `
  },
    'forms': {
    title: "📝 School Paperwork Navigation System",
    content: `
      <div class="modal-section">
        <h3>Form Walkthroughs</h3>
        <ul>
          <li><strong>Facility Request Forms</strong>:
            <ul>
              <li>Room diagrams showing exact field requirements (include fire exit locations)</li>
              <li>Approval flowchart with average processing times per department</li>
            </ul>
          </li>
          <li><strong>Fundraising Approval</strong>:
            <ul>
              <li>Sample budget templates that pass review on first submission</li>
              <li>Food handling waiver checklist (certificates required per county)</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>Deadline Management</h3>
        <ul>
          <li><strong>Academic Year Calendar</strong>:
            <ul>
              <li>Color-coded submission windows for different forms</li>
              <li>Buffer periods (submit 2 weeks before actual deadline)</li>
            </ul>
          </li>
          <li><strong>Recurring Forms</strong>:
            <ul>
              <li>Annual renewal tracker with reminder settings</li>
              <li>Copies of previous submissions for reference</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-extra">
        <h4>Rejection Fix Kit</h4>
        <ul>
          <li><strong>Common Errors</strong>:
            <ul>
              <li>Missing advisor signatures (highlight where to sign)</li>
              <li>Incomplete risk assessments (sample responses)</li>
            </ul>
          </li>
          <li><strong>Appeal Process</strong>:
            <ul>
              <li>Who to contact at each rejection stage</li>
              <li>Template for reconsideration requests</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(135deg, rgba(243,232,255,0.9) 0%, rgba(233,213,255,0.9) 100%);
      border: 1px solid #E9D5FF;
      color: #8e44ad;
      box-shadow: 0 2px 8px rgba(233,213,255,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%);
      color: #8e44ad;
    `
  },
    'ai': {
    title: "🤖 AI Club Assistant Toolkit",
    content: `
      <div class="modal-section">
        <h3>Content Creation</h3>
        <ul>
          <li><strong>Post Generator</strong>:
            <ul>
              <li>Event captions with emoji variations (+15% engagement)</li>
              <li>Hashtag suggestions based on past performance</li>
            </ul>
          </li>
          <li><strong>Meeting Minutes</strong>:
            <ul>
              <li>Template for AI transcription processing</li>
              <li>Action item extraction prompts</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>Member Support</h3>
        <ul>
          <li><strong>FAQ Chatbot</strong>:
            <ul>
              <li>50 common questions with verified responses</li>
              <li>Escalation triggers for human help</li>
            </ul>
          </li>
          <li><strong>Personalized Recommendations</strong>:
            <ul>
              <li>Role matching based on skills/interests</li>
              <li>Event attendance predictions</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-extra">
        <h4>Grant Opportunity Finder</h4>
        <ul>
          <li><strong>Filters</strong>:
            <ul>
              <li>By deadline (1mo/3mo/6mo windows)</li>
              <li>By funding amount ($500-$5k+)</li>
            </ul>
          </li>
          <li><strong>Application Tips</strong>:
            <ul>
              <li>Keyword optimization for education grants</li>
              <li>Budget justification templates</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(135deg, rgba(255,214,224,0.9) 0%, rgba(255,195,208,0.9) 100%);
      border: 1px solid #FFC3D0;
      color: #c0392b;
      box-shadow: 0 2px 8px rgba(255,195,208,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(135deg, #FFD6E0 0%, #FFC3D0 100%);
      color: #c0392b;
    `
  },

    'onboarding': {
    title: "👋 New Member Integration System",
    content: `
      <div class="modal-section">
        <h3>30-60-90 Day Plan</h3>
        <ul>
          <li><strong>First 30 Days</strong>:
            <ul>
              <li>Shadow schedule (pair with 3 different officers)</li>
              <li>Club history primer (key accomplishments timeline)</li>
            </ul>
          </li>
          <li><strong>60 Day Mark</strong>:
            <ul>
              <li>Skill assessment (identify strengths/growth areas)</li>
              <li>First project leadership opportunity</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>Buddy Program</h3>
        <ul>
          <li><strong>Matching Guide</strong>:
            <ul>
              <li>Compatibility factors (schedule, communication style)</li>
              <li>Icebreaker activities for first meeting</li>
            </ul>
          </li>
          <li><strong>Checklist</strong>:
            <ul>
              <li>Week 1: Tour of key locations</li>
              <li>Week 2: Introduce to 3 veteran members</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-extra">
        <h4>Role Exploration</h4>
        <ul>
          <li><strong>Skill Quizzes</strong>:
            <ul>
              <li>Event planning aptitude test</li>
              <li>Leadership style assessment</li>
            </ul>
          </li>
          <li><strong>Pathway Templates</strong>:
            <ul>
              <li>Technical track (webmaster, data analysis)</li>
              <li>Creative track (design, content creation)</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(135deg, rgba(224,247,250,0.9) 0%, rgba(200,244,240,0.9) 100%);
      border: 1px solid #C8F4F0;
      color: #16a085;
      box-shadow: 0 2px 8px rgba(200,244,240,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(135deg, #E0F7FA 0%, #C8F4F0 100%);
      color: #16a085;
    `
  },
    'crisis': {
    title: "🚨 Emergency Response Playbook",
    content: `
      <div class="modal-section">
        <h3>Conflict Resolution</h3>
        <ul>
          <li><strong>Script Library</strong>:
            <ul>
              <li>"I feel" statement templates for member disputes</li>
              <li>Faculty mediation request email drafts</li>
            </ul>
          </li>
          <li><strong>Scenario Guides</strong>:
            <ul>
              <li>Budget shortfalls: 5 cost-cutting strategies</li>
              <li>Leadership gaps: Interim role assignment flowchart</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>Meeting Recovery</h3>
        <ul>
          <li><strong>Backup Activities</strong>:
            <ul>
              <li>15-minute improv games (no prep needed)</li>
              <li>Discussion prompts for unexpected free time</li>
            </ul>
          </li>
          <li><strong>Tech Failure Protocols</strong>:
            <ul>
              <li>Low-tech alternatives to presentations</li>
              <li>Campus IT emergency contacts by building</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-extra">
        <h4>No-Show Response Kit</h4>
        <ul>
          <li><strong>Prevention</strong>:
            <ul>
              <li>RSVP tracking system template</li>
              <li>Reminder message sequence (3 touchpoints)</li>
            </ul>
          </li>
          <li><strong>Last-Minute</strong>:
            <ul>
              <li>Small group discussion formats</li>
              <li>Plan B activity bank</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(135deg, rgba(245,232,255,0.9) 0%, rgba(235,213,255,0.9) 100%);
      border: 1px solid #EBD5FF;
      color: #9b59b6;
      box-shadow: 0 2px 8px rgba(235,213,255,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(135deg, #F5E8FF 0%, #EBD5FF 100%);
      color: #9b59b6;
    `
  },
    'legacy': {
    title: "🏛️ Leadership Transition System",
    content: `
      <div class="modal-section">
        <h3>Knowledge Transfer</h3>
        <ul>
          <li><strong>Handoff Checklist</strong>:
            <ul>
              <li>Digital assets (login credentials, file locations)</li>
              <li>Stakeholder contacts (advisors, vendors, partners)</li>
            </ul>
          </li>
          <li><strong>Shadow Period</strong>:
            <ul>
              <li>30-day overlap schedule template</li>
              <li>Observation feedback forms</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-section">
        <h3>Institutional Memory</h3>
        <ul>
          <li><strong>Annual Report</strong>:
            <ul>
              <li>Section templates (achievements, finances, lessons)</li>
              <li>Visualization ideas for key metrics</li>
            </ul>
          </li>
          <li><strong>Alumni Network</strong>:
            <ul>
              <li>Engagement calendar (homecoming, mentoring)</li>
              <li>Update request email sequence</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="modal-extra">
        <h4>Continuity Planning</h4>
        <ul>
          <li><strong>Documentation Standards</strong>:
            <ul>
              <li>File naming conventions</li>
              <li>Meeting minute templates</li>
            </ul>
          </li>
          <li><strong>Emergency Contacts</strong>:
            <ul>
              <li>Previous officer availability calendar</li>
              <li>Advisor backup list</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    buttonStyle: `
      background: linear-gradient(135deg, rgba(232,247,224,0.9) 0%, rgba(212,240,200,0.9) 100%);
      border: 1px solid #D4F0C8;
      color: #2ecc71;
      box-shadow: 0 2px 8px rgba(212,240,200,0.3);
    `,
    downloadBtnStyle: `
      background: linear-gradient(135deg, #E8F7E0 0%, #D4F0C8 100%);
      color: #2ecc71;
    `
  }
};

let auth;
let db;
let currentUser = null;
let currentClubId = null;
let pendingSurveys = [];
let currentSurveyData = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {

  
  const modal = document.getElementById('gamifyModal');
  const modalBody = document.querySelector('.modal-body');


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
    
  
  // Thin sidebar buttons
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

// Mobile menu toggle (for responsive design)


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
  
  // Style all card buttons
  document.querySelectorAll('.gamify-masonry-card').forEach(card => {
    const btn = card.querySelector('.gamify-btn');
    const cardType = getCardType(card);
    
    if (modalContents[cardType]) {
      // Apply button styles
      btn.style.cssText = `
        ${modalContents[cardType].buttonStyle}
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      `;
      
      // Add hover effects
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateX(4px)';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = modalContents[cardType].buttonStyle.match(/box-shadow: ([^;]+)/)[0];
      });
    }
  });

  // Handle button clicks
  document.querySelectorAll('.gamify-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const card = this.closest('.gamify-masonry-card');
      const cardType = getCardType(card);
      
      if (modalContents[cardType]) {
        // Create modal content
        modalBody.innerHTML = `
          <h2 style="
            color: ${modalContents[cardType].downloadBtnStyle.match(/color: ([^;]+)/)[1]};
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid ${modalContents[cardType].downloadBtnStyle.match(/color: ([^;]+)/)[1]};
          ">${modalContents[cardType].title}</h2>
          ${modalContents[cardType].content}
          <button class="modal-download-btn" style="
            ${modalContents[cardType].downloadBtnStyle}
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 25px;
            width: 100%;
            transition: all 0.3s ease;
            font-size: 16px;
          ">
            Download Guide
          </button>
        `;
        
        // Add hover effect to download button
        const downloadBtn = modalBody.querySelector('.modal-download-btn');
        downloadBtn.addEventListener('mouseenter', () => {
          downloadBtn.style.transform = 'translateY(-2px)';
          downloadBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        downloadBtn.addEventListener('mouseleave', () => {
          downloadBtn.style.transform = '';
          downloadBtn.style.boxShadow = '';
        });
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  });

   } catch (error) {
        console.error("Firebase initialization error:", error);
    }

  // Close modal handlers
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// Helper function to determine card type
function getCardType(card) {
  const title = card.querySelector('.gamify-feature-title').textContent;
  if (title.includes('Event')) return 'event';
  if (title.includes('Fundraising')) return 'fundraising';
  if (title.includes('Engagement')) return 'engagement';
  if (title.includes('Forms')) return 'forms';
  if (title.includes('AI')) return 'ai';
  if (title.includes('Onboarding')) return 'onboarding';
  if (title.includes('Crisis')) return 'crisis';
  if (title.includes('Legacy')) return 'legacy';
  return '';
}


// Listen for auth state changes (you might already have this)
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // User is signed out, redirect to login
        window.location.href = 'login.html';
    }
});