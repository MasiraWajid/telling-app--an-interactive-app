// Telling — front-end demo
// Confessions and likes are stored in this browser's localStorage.
// Login/signup are demo-only; no password or account is stored.

const STORAGE_KEY = "telling_confessions";
const defaultConfessions = [
  {
    id: 1,
    title: "A little reminder",
    text: "You do not have to have everything figured out today. One step at a time.",
    category: "Life", author: "Anonymous", likes: 3, liked: false, mine: false
  },
  {
    id: 2,
    title: "The things we never say",
    text: "Sometimes, listening without judging is the kindest thing we can do for someone.",
    category: "Relationships", author: "Anonymous", likes: 5, liked: false, mine: false
  }
];

const $ = (id) => document.getElementById(id);
let confessions = loadConfessions();
let currentUser = "";
let activeCategory = "All";
let showingMine = false;
let toastTimer;

function loadConfessions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return structuredCopy(defaultConfessions);
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : structuredCopy(defaultConfessions);
  } catch (error) {
    console.error("Could not load confessions:", error);
    return structuredCopy(defaultConfessions);
  }
}
function structuredCopy(value) {
  return JSON.parse(JSON.stringify(value));
}
function saveConfessions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(confessions));
    return true;
  } catch (error) {
    console.error("Could not save confessions:", error);
    notify("Could not save data in this browser. Check storage settings.");
    return false;
  }
}
function notify(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2800);
}
function showScreen(screenId) {
  ["landingScreen", "welcomeScreen", "loginScreen", "signupScreen", "mainScreen", "publicShareScreen"].forEach((id) => {
    const screen = $(id);
    if (screen) screen.classList.toggle("hidden", id !== screenId);
  });
}
function openMainScreen(username) {
  currentUser = username.trim() || "friend";
  $("greetingName").textContent = currentUser;
  $("profileName").textContent = currentUser;
  activeCategory = "All";
  showingMine = false;
  closePanels();
  showScreen("mainScreen");
  renderConfessions();
  setActiveNav("home");
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
function renderConfessions() {
  const feed = $("confessionFeed");
  const emptyFeed = $("emptyFeed");
  const postCount = $("postCount");
  if (!feed || !emptyFeed || !postCount) return;

  const visible = confessions
    .filter((post) => (activeCategory === "All" || post.category === activeCategory)
      && (!showingMine || post.mine === true))
    .sort((a, b) => Number(b.id) - Number(a.id));

  feed.innerHTML = visible.map((post) => {
    const liked = post.liked === true;
    const likes = Math.max(0, Number(post.likes) || 0);
    return `
      <article class="confession-card">
        <div class="confession-meta">
          <span class="category-tag">${escapeHTML(post.category || "Other")}</span>
          <span class="confession-author">${escapeHTML(post.author || "Anonymous")}</span>
        </div>
        <h3>${escapeHTML(post.title || "Untitled")}</h3>
        <p class="confession-text">${escapeHTML(post.text || "")}</p>
        <div class="confession-actions">
          <button class="like-btn ${liked ? "liked" : ""}" data-like-id="${escapeHTML(post.id)}"
            aria-pressed="${liked}" aria-label="${liked ? "Unlike" : "Like"} confession">
            ${liked ? "♥" : "♡"} ${likes}
          </button>
          <button class="share-btn" data-share-id="${escapeHTML(post.id)}" type="button">↗ Share</button>
        </div>
      </article>`;
  }).join("");

  postCount.textContent = `${visible.length} ${visible.length === 1 ? "story" : "stories"}`;
  emptyFeed.classList.toggle("hidden", visible.length !== 0);
  $("feedHeading").textContent = showingMine ? "My Confessions"
    : activeCategory === "All" ? "Latest Confessions" : `${activeCategory} Confessions`;
}
function closePanels() {
  $("composer").classList.add("hidden");
  $("profilePanel").classList.add("hidden");
}
function setActiveNav(page) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
}
function openComposer() {
  closePanels();
  showingMine = false;
  $("composer").classList.remove("hidden");
  setActiveNav("create");
  $("postTitle").focus();
}
function openProfile() {
  closePanels();
  showingMine = false;
  $("profilePanel").classList.remove("hidden");
  setActiveNav("profile");
}

// Public landing navigation and mobile menu
$("openDemoBtn").addEventListener("click", () => showScreen("welcomeScreen"));
$("backToLandingBtn").addEventListener("click", () => showScreen("landingScreen"));
$("menuToggle").addEventListener("click", () => {
  const nav = $("siteNav");
  const open = nav.classList.toggle("open");
  $("menuToggle").setAttribute("aria-expanded", String(open));
  $("menuToggle").setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
document.querySelectorAll("#siteNav a").forEach((link) => link.addEventListener("click", () => {
  $("siteNav").classList.remove("open");
  $("menuToggle").setAttribute("aria-expanded", "false");
}));
$("copyrightYear").textContent = new Date().getFullYear();

// Welcome and authentication navigation
$("getStartedBtn").addEventListener("click", () => showScreen("loginScreen"));
$("welcomeBackBtn").addEventListener("click", () => showScreen("welcomeScreen"));
$("signupBackBtn").addEventListener("click", () => showScreen("loginScreen"));
$("showSignupBtn").addEventListener("click", () => {
  showScreen("signupScreen");
  $("newUsername").focus();
});

$("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = $("username").value.trim();
  const password = $("password").value;
  if (!username || password.length < 4) {
    notify("Enter a username and a password of at least 4 characters.");
    return;
  }
  openMainScreen(username);
  $("loginForm").reset();
  notify("Welcome to Telling!");
});

$("signupForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = $("newUsername").value.trim();
  const password = $("newPassword").value;
  if (!username || password.length < 4) {
    notify("Choose a username and a password of at least 4 characters.");
    return;
  }
  // Do not save the demo password.
  $("username").value = username;
  $("signupForm").reset();
  showScreen("loginScreen");
  notify("Demo signup complete! Please log in.");
});

// Confession composer
$("createPostBtn").addEventListener("click", openComposer);
$("closeComposerBtn").addEventListener("click", () => {
  $("composer").classList.add("hidden");
  setActiveNav("home");
});
$("postText").addEventListener("input", () => {
  $("charCount").textContent = $("postText").value.length;
});
$("confessionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = $("postTitle").value.trim();
  const text = $("postText").value.trim();
  const category = $("postCategory").value;
  if (!title || !text) {
    notify("Please enter a title and confession.");
    return;
  }

  confessions.push({
    id: Date.now(), title, text, category,
    author: "Anonymous", likes: 0, liked: false, mine: true
  });
  saveConfessions();
  $("confessionForm").reset();
  $("charCount").textContent = "0";
  activeCategory = "All";
  showingMine = false;
  closePanels();
  renderConfessions();
  setActiveNav("home");
  notify("Your confession has been posted!");
});

// Like/unlike with delegated click handling
$("confessionFeed").addEventListener("click", async (event) => {
  const shareButton = event.target.closest("[data-share-id]");
  if (shareButton) {
    const post = confessions.find((item) => String(item.id) === shareButton.dataset.shareId);
    if (!post) return;
    const shareUrl = new URL(window.location.href);
    shareUrl.search = "";
    shareUrl.hash = "";
    shareUrl.searchParams.set("sharedTitle", post.title || "A Telling confession");
    shareUrl.searchParams.set("sharedText", post.text || "");
    const shareData = { title: post.title || "A Telling confession", text: `${post.text || ""}

Shared from Telling`, url: shareUrl.toString() };
    if (window.location.protocol === "file:") {
      notify("Sharing links work across devices only after the website is hosted online. You can still share the story text.");
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(`${shareData.text}
${shareData.url}`);
        notify("Story text and preview link copied. Cross-device replies need backend setup.");
      } else {
        window.prompt("Copy this story and preview link:", `${shareData.text}
${shareData.url}`);
      }
    } catch (error) {
      if (error.name !== "AbortError") notify("Sharing could not be opened. Please try copying the story manually.");
    }
    return;
  }
  const button = event.target.closest("[data-like-id]");
  if (!button) return;
  const post = confessions.find((item) => String(item.id) === button.dataset.likeId);
  if (!post) return;

  if (post.liked) {
    post.likes = Math.max(0, (Number(post.likes) || 0) - 1);
    post.liked = false;
  } else {
    post.likes = (Number(post.likes) || 0) + 1;
    post.liked = true;
  }
  saveConfessions();
  renderConfessions();
});

// Room category filters
document.querySelectorAll("[data-room]").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.room;
    showingMine = false;
    closePanels();
    renderConfessions();
    setActiveNav("rooms");
    $("confessionFeed").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Bottom navigation
document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;
    if (page === "home") {
      activeCategory = "All"; showingMine = false; closePanels();
      renderConfessions(); setActiveNav("home");
    } else if (page === "rooms") {
      activeCategory = "All"; showingMine = false; closePanels();
      renderConfessions(); setActiveNav("rooms");
      $("confessionFeed").scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (page === "create") {
      openComposer();
    } else if (page === "profile") {
      openProfile();
    } else if (page === "landing") {
      showScreen("landingScreen");
    }
  });
});

// Profile and personal posts
$("closeProfileBtn").addEventListener("click", () => {
  $("profilePanel").classList.add("hidden");
  setActiveNav("home");
});
$("myPostsBtn").addEventListener("click", () => {
  activeCategory = "All";
  showingMine = true;
  closePanels();
  renderConfessions();
  setActiveNav("profile");
  $("confessionFeed").scrollIntoView({ behavior: "smooth", block: "start" });
  const count = confessions.filter((post) => post.mine === true).length;
  notify(count ? `Showing your ${count} confession${count === 1 ? "" : "s"}.`
    : "You haven't posted any confessions yet.");
});

// Logout and logo navigation
$("logoutBtn").addEventListener("click", () => {
  currentUser = "";
  activeCategory = "All";
  showingMine = false;
  closePanels();
  $("loginForm").reset();
  showScreen("welcomeScreen");
  notify("You have logged out.");
});
document.querySelector(".small-brand").addEventListener("click", (event) => {
  event.preventDefault();
  activeCategory = "All";
  showingMine = false;
  closePanels();
  renderConfessions();
  setActiveNav("home");
});

// Public shared-confession preview. The story travels in the URL, but replies
// cannot be delivered to an owner without a configured backend/database.
const query = new URLSearchParams(window.location.search);
const sharedTitle = query.get("sharedTitle");
const sharedText = query.get("sharedText");
if (sharedTitle !== null && sharedText !== null) {
  $("sharedTitle").textContent = sharedTitle;
  $("sharedText").textContent = sharedText;
  showScreen("publicShareScreen");
} else {
  showScreen("landingScreen");
}
$("publicReplyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const reply = $("publicReplyText").value.trim();
  if (!reply) return;
  $("replyStatus").textContent = "Reply preview captured in this page only. It has NOT been sent to the confession owner because the backend is not configured.";
  notify("Not sent: connect a backend to deliver replies to the owner.");
});
$("shareLogo").addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = window.location.pathname;
});
renderConfessions();

/* Telling testing prototype extensions. These are browser-local simulations, not production services. */
(function addTestingFeatures(){
  const EXTRA_KEY = 'telling_testing_state_v2';
  const readState = () => { try { return JSON.parse(localStorage.getItem(EXTRA_KEY)) || {}; } catch { return {}; } };
  let state = readState();
  const persist = () => localStorage.setItem(EXTRA_KEY, JSON.stringify(state));
  state.friends ||= [];
  state.inbox ||= [];
  state.reports ||= [];
  state.comments ||= {};
  state.replies ||= {};
  state.roomMessages ||= {};
  state.matureEnabled ??= false;
  state.adsSeen ||= [];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Seed a small mix of ordinary and mature-labelled sample posts for QA.
  if (!confessions.some(p => p.testingSeed)) {
    const samples = [
      {id: Date.now()+11,title:'A small win today',text:'I finally asked for help with something I was struggling with.',category:'Life',author:'BigBoss',likes:4,liked:false,mine:false,mature:false,testingSeed:true},
      {id: Date.now()+12,title:'Campus thoughts',text:'Sometimes the busiest days are the ones when you feel most alone.',category:'Campus',author:'Alexa',likes:8,liked:false,mine:false,mature:false,testingSeed:true},
      {id: Date.now()+13,title:'A difficult topic',text:'This sample is labelled mature so you can test the profile setting. It contains no explicit content.',category:'Relationships',author:'Anonymous',likes:2,liked:false,mine:false,mature:true,testingSeed:true}
    ];
    confessions.push(...samples); saveConfessions();
  }

  const main = $('mainScreen');
  if (!main || $('testingTools')) return;
  const tools = document.createElement('section');
  tools.id = 'testingTools';
  tools.className = 'testing-tools';
  tools.innerHTML = `
    <div class="qa-panel"><p class="eyebrow">TESTING CONTROLS</p><h2>Friends & Feed</h2>
      <div class="qa-inline"><input id="friendSearch" placeholder="Search username (e.g. BigBoss, Alexa)" aria-label="Search username"><button id="findFriendBtn" class="secondary-btn" type="button">Search</button><button id="addFriendBtn" class="primary-btn" type="button">Add friend</button></div>
      <p id="friendSearchResult" class="muted small-text">Search sample users or add a username for this browser demo.</p><p><strong>Friends:</strong> <span id="friendList">None yet</span></p>
      <div class="qa-inline"><label class="qa-toggle"><input type="checkbox" id="matureToggle"> Mature setting enabled</label><button id="engagementBtn" class="secondary-btn" type="button">Sort by engagement</button><button id="normalFeedBtn" class="secondary-btn" type="button">Latest feed</button></div>
      <p id="matureStatus" class="muted small-text">Mature-labelled sample confessions are currently hidden.</p>
    </div>
    <div class="qa-panel"><p class="eyebrow">PROFILE & INBOX</p><h2>My account</h2><div class="qa-inline"><button id="showInboxBtn" class="secondary-btn" type="button">Replies inbox <span id="inboxCount">0</span></button><button id="showReportsBtn" class="secondary-btn" type="button">My reports</button><button id="newTestAccountBtn" class="secondary-btn" type="button">Switch test account</button></div><div id="qaResults" class="qa-results"></div>
    </div>
    <div class="qa-panel"><p class="eyebrow">AD CHECK</p><h2>Ad loading observation</h2><p class="muted small-text">A clearly labelled placeholder for testing layout/interval recording only. It is not a real ad network or proof that production ads load.</p><div id="testAd" class="test-ad"><strong>TEST AD PLACEHOLDER</strong><span>Sample ad slot — no advertiser connected</span></div><p id="adObservation" class="muted small-text">No placeholder interval recorded yet.</p><button id="recordAdBtn" class="secondary-btn" type="button">Record placeholder visible</button>
    </div>`;
  const greeting = main.querySelector('.greeting');
  greeting.insertAdjacentElement('afterend', tools);
  const style = document.createElement('style');
  style.textContent = `
  .testing-tools{display:grid;gap:14px;margin:20px 0}.qa-panel{background:#24151e;border:1px solid #51313f;border-radius:18px;padding:18px;color:#f8edf0}.qa-panel h2{font-size:1.15rem;margin:4px 0 14px}.qa-inline{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}.qa-inline input:not([type=checkbox]){flex:1;min-width:180px;padding:11px;border-radius:10px;border:1px solid #654452;background:#170e13;color:#fff}.qa-inline .primary-btn,.qa-inline .secondary-btn,.qa-panel .secondary-btn{font-size:.82rem;padding:9px 12px}.qa-toggle{display:flex;gap:8px;align-items:center}.qa-results{margin-top:12px;display:grid;gap:8px}.qa-item{background:#180e14;border:1px solid #49303a;border-radius:10px;padding:11px;font-size:.9rem}.qa-item p{margin:6px 0}.qa-item button,.confession-actions button{cursor:pointer}.qa-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.qa-actions button{border:1px solid #654452;background:#33202a;color:#ffe9ef;border-radius:9px;padding:7px 10px}.qa-comment{width:100%;padding:10px;border-radius:9px;background:#180e14;color:#fff;border:1px solid #654452;margin-top:8px}.test-ad{display:flex;flex-direction:column;gap:4px;padding:16px;border:1px dashed #bb8a9b;border-radius:12px;background:#1a1015}.test-ad strong{letter-spacing:.1em;font-size:.75rem;color:#f4b8c9}.test-ad span{font-size:.85rem;color:#d8bdc6}.confession-card .extra-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.confession-card .extra-actions button{border:1px solid #69404e;border-radius:9px;background:#2a1821;color:#ffe8ef;padding:7px 10px;font-size:.82rem}.mature-tag{font-size:.7rem;border-radius:8px;padding:3px 7px;background:#604050;color:#ffe5ee;margin-left:6px}.confession-comments{font-size:.84rem;color:#d8bdc6;margin-top:8px}.qa-panel .small-text{font-size:.82rem}.confession-card{content-visibility:auto;contain-intrinsic-size:220px}
  `;
  document.head.appendChild(style);

  // Re-render with mature filter, comments, reply, report, and engagement sorting.
  let sortByEngagement = false;
  const baseRender = renderConfessions;
  renderConfessions = function(){
    const old = activeCategory;
    const oldShow = showingMine;
    if (!state.matureEnabled) confessions = confessions.filter(p => !p.mature || p.testingSeed || p.mature === false);
    baseRender();
    // Replace cards with full QA actions. Keep original like/share controls and add other actions.
    document.querySelectorAll('#confessionFeed .confession-card').forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const post = confessions.find(p => p.title === title);
      if (!post) return;
      if (post.mature && !state.matureEnabled) { card.remove(); return; }
      const id = String(post.id);
      const commentList = (state.comments[id] || []).map(c => `<p>💬 <strong>${esc(c.user)}:</strong> ${esc(c.text)}</p>`).join('');
      const actions = document.createElement('div');
      actions.className = 'extra-actions';
      actions.innerHTML = `<button type="button" data-comment="${esc(id)}">Comment</button><button type="button" data-reply="${esc(id)}">Reply</button><button type="button" data-report="${esc(id)}">Report</button>`;
      card.appendChild(actions);
      const comments = document.createElement('div'); comments.className = 'confession-comments';
      comments.innerHTML = commentList || '<p>No comments yet.</p>';
      card.appendChild(comments);
      if (post.mature) card.querySelector('.category-tag')?.insertAdjacentHTML('afterend',' <span class="mature-tag">MATURE</span>');
      if (sortByEngagement) card.dataset.engagement = String((post.likes||0) + (state.comments[id]||[]).length + (state.replies[id]||[]).length);
    });
    if (sortByEngagement) {
      const feed = $('confessionFeed');
      [...feed.children].sort((a,b)=>Number(b.dataset.engagement||0)-Number(a.dataset.engagement||0)).forEach(el=>feed.appendChild(el));
      $('feedHeading').textContent = 'Highest Engagement';
    }
    $('matureToggle').checked = !!state.matureEnabled;
    $('matureStatus').textContent = state.matureEnabled ? 'Mature setting is ON: mature-labelled sample confessions can appear.' : 'Mature setting is OFF: mature-labelled confessions are hidden.';
    $('friendList').textContent = state.friends.length ? state.friends.join(', ') : 'None yet';
    $('inboxCount').textContent = state.inbox.length;
  };

  $('findFriendBtn').addEventListener('click',()=>{
    const name=$('friendSearch').value.trim();
    $('friendSearchResult').textContent = !name ? 'Enter a username to search.' : ['bigboss','alexa'].includes(name.toLowerCase()) ? `Found ${name} in sample users. You can add them in this local demo.` : `No exact sample match for “${name}”. You can still add it as a test username.`;
  });
  $('addFriendBtn').addEventListener('click',()=>{
    const name=$('friendSearch').value.trim(); if(!name){notify('Enter a username first.');return;}
    if(name.toLowerCase()===currentUser.toLowerCase()){notify('You cannot add your own account.');return;}
    if(!state.friends.includes(name)) state.friends.push(name);
    persist(); $('friendSearchResult').textContent=`${name} added to your demo friends list.`; renderConfessions();
  });
  $('matureToggle').addEventListener('change',e=>{state.matureEnabled=e.target.checked;persist();renderConfessions();notify(`Mature setting ${state.matureEnabled?'enabled':'disabled'}.`);});
  $('engagementBtn').addEventListener('click',()=>{sortByEngagement=true;renderConfessions();});
  $('normalFeedBtn').addEventListener('click',()=>{sortByEngagement=false;activeCategory='All';showingMine=false;renderConfessions();});
  $('showInboxBtn').addEventListener('click',()=>{const box=$('qaResults');box.innerHTML=state.inbox.length?state.inbox.map(x=>`<div class="qa-item"><strong>Reply to: ${esc(x.title)}</strong><p>${esc(x.reply)}</p><small>From ${esc(x.from)} · saved in this browser</small></div>`).join(''):'<div class="qa-item">No replies yet. Use Reply on a confession to test the local inbox flow.</div>';});
  $('showReportsBtn').addEventListener('click',()=>{const box=$('qaResults');box.innerHTML=state.reports.length?state.reports.map(x=>`<div class="qa-item"><strong>Report #${esc(x.id)}</strong><p>${esc(x.title)}</p><small>Reason: ${esc(x.reason)}</small></div>`).join(''):'<div class="qa-item">No reports submitted yet.</div>';});
  $('newTestAccountBtn').addEventListener('click',()=>{const name=prompt('Enter a different test username (do not use your real name):');if(name&&name.trim()){openMainScreen(name.trim());notify('Switched local demo user. This is not a real account login.');}});
  $('recordAdBtn').addEventListener('click',()=>{const now=new Date();state.adsSeen.push(now.toLocaleTimeString());persist();$('adObservation').textContent=`Placeholder recorded ${state.adsSeen.length} time(s): ${state.adsSeen.join(' → ')}. This does not measure real ad intervals.`;notify('Test placeholder observation recorded.');});

  $('confessionFeed').addEventListener('click',e=>{
    const comment=e.target.closest('[data-comment]'); const reply=e.target.closest('[data-reply]'); const report=e.target.closest('[data-report]');
    const button=comment||reply||report; if(!button)return;
    const post=confessions.find(p=>String(p.id)===button.dataset.comment||String(p.id)===button.dataset.reply||String(p.id)===button.dataset.report);if(!post)return;
    const id=String(post.id);
    if(comment){const text=prompt('Write a comment for this confession:');if(text&&text.trim()){(state.comments[id] ||= []).push({user:currentUser||'TestUser',text:text.trim()});persist();renderConfessions();notify('Comment added in this browser demo.');}}
    if(reply){const text=prompt('Write a reply to this confession:');if(text&&text.trim()){state.inbox.unshift({title:post.title,reply:text.trim(),from:currentUser||'TestUser'});(state.replies[id] ||= []).push({user:currentUser||'TestUser',text:text.trim()});persist();renderConfessions();notify('Demo reply saved to Replies inbox.');}}
    if(report){const reason=prompt('Report reason (e.g. inappropriate, harassment, spam):');if(reason&&reason.trim()){state.reports.unshift({id:Date.now(),title:post.title,reason:reason.trim()});persist();notify('Report saved locally for testing. It has NOT been sent to Telling moderators or Classroom.');}}
  });

  // Room cards open a simple local text-chat panel so messaging can be tested.
  document.querySelectorAll('[data-room]').forEach(btn=>btn.addEventListener('dblclick',()=>openRoom(btn.dataset.room)));
  function openRoom(room){
    let panel=$('roomChatPanel');if(!panel){panel=document.createElement('section');panel.id='roomChatPanel';panel.className='qa-panel';$('testingTools').appendChild(panel);}
    const messages=state.roomMessages[room]||[];
    panel.innerHTML=`<p class="eyebrow">CONFESSION ROOM</p><h2>${esc(room)} room · demo chat</h2><div class="qa-results">${messages.map(m=>`<div class="qa-item"><strong>${esc(m.user)}</strong><p>${esc(m.text)}</p></div>`).join('')||'<p class="muted">No messages yet.</p>'}</div><form id="roomChatForm" class="qa-inline"><input id="roomMessageText" placeholder="Type a room message…" required maxlength="500"><button class="primary-btn" type="submit">Send</button></form><p class="muted small-text">Local demo only: no other users receive this message. Double-click a room card to open chat.</p>`;
    $('roomChatForm').addEventListener('submit',e=>{e.preventDefault();const text=$('roomMessageText').value.trim();if(!text)return;(state.roomMessages[room] ||= []).push({user:currentUser||'TestUser',text});persist();openRoom(room);notify('Message added to local room chat.');});
    panel.scrollIntoView({behavior:'smooth',block:'center'});
  }
  // Add a direct chat opener beside room cards without changing the original visual design.
  document.querySelectorAll('[data-room]').forEach(btn=>{const open=document.createElement('button');open.type='button';open.className='secondary-btn';open.textContent='Open chat';open.style.marginTop='8px';open.addEventListener('click',()=>openRoom(btn.dataset.room));btn.insertAdjacentElement('afterend',open);});

  // If this is a public share preview, make its limitation explicit and avoid implying delivery.
  if (sharedTitle !== null && sharedText !== null) {
    $('replyStatus').textContent='Demo only: a reply can be previewed, but cannot reach the owner without backend/authentication setup.';
  }
  const previousRender = renderConfessions;
  renderConfessions = function(){previousRender();$('inboxCount').textContent=state.inbox.length;};
  renderConfessions();
})();
