const firebaseConfig = {
  apiKey: "AIzaSyAdSE29j85iVghbN63LGvCAxTQ5YkoQO_c",
  authDomain: "agniflix-25b59.firebaseapp.com",
  databaseURL: "https://agniflix-25b59-default-rtdb.firebaseio.com",
  projectId: "agniflix-25b59",
  storageBucket: "agniflix-25b59.firebasestorage.app",
  messagingSenderId: "594773029970",
  appId: "1:594773029970:web:5dd7b02ed67edca5965b8b"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tmdbApiKey = "e3191511e146bb06945ef43dfd47063f";
let allMoviesData = [];

function showView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
  document.querySelectorAll(".nav-item a").forEach(l => l.classList.remove("active"));
  
  const activeLink = document.querySelector(`.nav-item a[onclick*="${viewId}"]`);
  if (activeLink) activeLink.classList.add("active");
  
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth <= 992 && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }
}

const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
  const loginOverlay = document.getElementById('login-overlay');
  const loginBtn = document.getElementById('login-btn');
  const loginGoogleBtn = document.getElementById('login-google-btn');
  const loginError = document.getElementById('login-error');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email = document.getElementById('login-email').value;
      const pwd = document.getElementById('login-password').value;
      loginError.textContent = "Logging in...";
      try {
        await auth.signInWithEmailAndPassword(email, pwd);
      } catch (err) {
        loginError.textContent = err.message;
      }
    });
  }

  if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener('click', async () => {
      loginError.textContent = "Logging in with Google...";
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
      } catch (err) {
        loginError.textContent = err.message;
      }
    });
  }

  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("sidebar").classList.toggle("open");
    });
  }

  auth.onAuthStateChanged(user => {
    if (user) {
      if (loginOverlay) loginOverlay.style.display = 'none';
      
      loadDashboardData();
      loadMovies();
      loadSeries();
      loadAnime();
      loadLiveTvChannels();
      loadCategories();
      loadUsers();
      loadMovieRequests();
      loadMaintenanceStatus();
      loadPlans();
      loadAds();
      loadAppControlSettings();
      showView("dashboard-view");
    } else {
      if (loginOverlay) loginOverlay.style.display = 'flex';
    }
  });
});

function showStatus(message, type) {
  const el = document.getElementById("status-message");
  el.textContent = message;
  el.className = `status-message ${type}`;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 3000);
}

function loadDashboardData() {
   database.ref('movies').on('value', snap => {
      document.getElementById('total-movies-stat').textContent = snap.numChildren();
      allMoviesData = [];
      snap.forEach(c => allMoviesData.push({id: c.key, ...c.val()}));
   });
   database.ref('webseries').on('value', snap => document.getElementById('total-series-stat').textContent = snap.numChildren());
   database.ref('anime').on('value', snap => {
       const el = document.getElementById('total-anime-stat');
       if(el) el.textContent = snap.numChildren();
   });
   database.ref('live_tv').on('value', snap => document.getElementById('total-livetv-stat').textContent = snap.numChildren());
   database.ref('users').on('value', snap => document.getElementById('total-users-stat').textContent = snap.numChildren());
   // Optional premium user stats logic...
}

function deleteData(type, id) {
  if (confirm(`Are you sure you want to permanently delete this item?`)) {
    database.ref(`${type}/${id}`).remove()
      .then(() => showStatus("Deleted!", "success"))
      .catch((err) => showStatus("Delete failed", "error"));
  }
}

async function searchTmdb(type, overridePrefix) {
  const inputId = overridePrefix ? `${overridePrefix}-tmdb-search` : (type === 'tv' ? 'series-tmdb-search' : `${type}-tmdb-search`);
  const q = document.getElementById(inputId).value.trim();
  if(!q) return;
  if (/^\d+$/.test(q)) return fetchDetailsById(type, q, overridePrefix);
  
  const res = await fetch(`https://api.themoviedb.org/3/search/${type}?api_key=${tmdbApiKey}&query=${encodeURIComponent(q)}`);
  const data = await res.json();
  if(data.results && data.results.length > 0) {
     const c = document.getElementById('search-results-container');
     c.innerHTML = '';
     data.results.slice(0,10).forEach(item => {
        const title = type === 'movie' ? item.title : item.name;
        const year = (type === 'movie' ? item.release_date : item.first_air_date)?.split('-')[0] || '';
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://via.placeholder.com/50';
        const d = document.createElement('div');
        d.className = 'search-result-item';
        d.onclick = () => { closeSearchModal(); fetchDetailsById(type, item.id, overridePrefix); };
        d.innerHTML = `<img src="${poster}"><div><h4>${title}</h4><p>${year}</p></div>`;
        c.appendChild(d);
     });
     document.getElementById('search-modal').style.display = 'flex';
  }
}

function closeSearchModal() { document.getElementById('search-modal').style.display='none'; }

async function fetchDetailsById(type, id, overridePrefix) {
  const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${tmdbApiKey}&append_to_response=credits`);
  const data = await res.json();
  const prefix = overridePrefix ? overridePrefix : (type === 'movie' ? 'movie' : 'series');
  document.getElementById(`${prefix}-title`).value = data.title || data.name;
  document.getElementById(`${prefix}-poster`).value = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '';
  document.getElementById(`${prefix}-backdrop`).value = data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : '';
  document.getElementById(`${prefix}-rating`).value = data.vote_average ? data.vote_average.toFixed(1) : '';
  document.getElementById(`${prefix}-year`).value = (data.release_date || data.first_air_date || '').split('-')[0];
  document.getElementById(`${prefix}-storyline`).value = data.overview;
  
  const cats = data.genres?.map(g => g.name) || [];
  document.querySelectorAll(`#${prefix}-category-wrapper input`).forEach(cb => { cb.checked = cats.includes(cb.value); });
  showStatus("Fetched from TMDB", "success");
}

function loadCategories() {
  database.ref('categories').on('value', snap => {
     let mw = document.getElementById('movie-category-wrapper');
     let sw = document.getElementById('series-category-wrapper');
     let aw = document.getElementById('anime-category-wrapper');
     let lc = document.getElementById('category-list-container');
     
     const mwFrag = document.createDocumentFragment();
     const swFrag = document.createDocumentFragment();
     const awFrag = document.createDocumentFragment();
     const lcFrag = document.createDocumentFragment();
     
     snap.forEach(c => {
         const cat = c.val();
         const id = c.key;
         
         const chkM = document.createElement('label');
         chkM.className = 'category-checkbox-item';
         chkM.innerHTML = `<input type="checkbox" value="${cat.name}"> ${cat.name}`;
         if(mw) mwFrag.appendChild(chkM);

         const chkS = document.createElement('label');
         chkS.className = 'category-checkbox-item';
         chkS.innerHTML = `<input type="checkbox" value="${cat.name}"> ${cat.name}`;
         if(sw) swFrag.appendChild(chkS);
         
         const chkA = document.createElement('label');
         chkA.className = 'category-checkbox-item';
         chkA.innerHTML = `<input type="checkbox" value="${cat.name}"> ${cat.name}`;
         if(aw) awFrag.appendChild(chkA);

         if(lc) {
             const div = document.createElement('div');
             div.className = 'search-result-item'; // repurpose style
             div.innerHTML = `<div style="flex:1"><h4>${cat.name}</h4></div><button class="btn-icon" onclick="deleteData('categories', '${id}')"><i class="fa fa-trash"></i></button>`;
             lcFrag.appendChild(div);
         }
     });

     if(mw) { mw.innerHTML = ''; mw.appendChild(mwFrag); }
     if(sw) { sw.innerHTML = ''; sw.appendChild(swFrag); }
     if(aw) { aw.innerHTML = ''; aw.appendChild(awFrag); }
     if(lc) { lc.innerHTML = ''; lc.appendChild(lcFrag); }
  });
}

function handleSaveCategory() {
   const name = document.getElementById('category-name').value;
   if(name) {
      database.ref('categories').push({name, timestamp: Date.now()});
      document.getElementById('category-name').value = '';
      showStatus("Saved!", "success");
   }
}

// Minimal movie logic
function handleSaveMovie() {
  const selectedCats = Array.from(document.querySelectorAll('#movie-category-wrapper input:checked')).map(cb => cb.value);
  const data = {
    title: document.getElementById('movie-title').value,
    poster: document.getElementById('movie-poster').value,
    backdrop: document.getElementById('movie-backdrop').value,
    rating: parseFloat(document.getElementById('movie-rating').value) || 0,
    year: parseInt(document.getElementById('movie-year').value) || 2024,
    storyline: document.getElementById('movie-storyline').value,
    category: selectedCats,
    link: document.getElementById('movie-link').value,
    access: document.getElementById('movie-is-premium').checked ? 'Premium' : 'Free',
    timestamp: Date.now()
  };
  const id = document.getElementById('movie-edit-id').value;
  const ref = id ? database.ref('movies/' + id) : database.ref('movies').push();
  ref.set(data).then(() => {
     showStatus("Movie Saved!", "success");
     showView('manage-movies-view');
  });
}

function loadMovies() {
   database.ref('movies').on('value', snap => {
       const grid = document.getElementById('movie-grid-container');
       const fragment = document.createDocumentFragment();
       const items = [];
       snap.forEach(child => {
          const m = child.val();
          const card = document.createElement('div');
          card.className = 'movie-card';
          card.innerHTML = `<img src="${m.poster}"><div class="movie-card-info"><h3>${m.title}</h3><p>${m.year}</p></div>
            <div class="movie-card-actions">
              <button class="btn-icon" onclick="deleteData('movies', '${child.key}')"><i class="fa fa-trash"></i></button>
            </div>
          `;
          items.push(card);
       });
       items.reverse().forEach(card => fragment.appendChild(card));
       grid.innerHTML = '';
       grid.appendChild(fragment);
   });
}

// Similar for series
function handleSaveSeries() {
  const selectedCats = Array.from(document.querySelectorAll('#series-category-wrapper input:checked')).map(cb => cb.value);
  const eps = [];
  document.querySelectorAll('.season-block').forEach(s => {
      const sNum = s.querySelector('.season-number').value;
      s.querySelectorAll('.episode-block').forEach(e => {
         eps.push({
            season: sNum, number: e.querySelector('.episode-number').value,
            title: e.querySelector('.episode-title').value,
            link: e.querySelector('.episode-link').value
         });
      });
  });
  const data = {
    title: document.getElementById('series-title').value,
    poster: document.getElementById('series-poster').value,
    backdrop: document.getElementById('series-backdrop').value,
    rating: parseFloat(document.getElementById('series-rating').value) || 0,
    year: parseInt(document.getElementById('series-year').value) || 2024,
    storyline: document.getElementById('series-storyline').value,
    category: selectedCats,
    episodes: eps,
    access: document.getElementById('series-is-premium').checked ? 'Premium' : 'Free',
    type: 'webseries',
    timestamp: Date.now()
  };
  const id = document.getElementById('series-edit-id').value;
  const ref = id ? database.ref('webseries/' + id) : database.ref('webseries').push();
  ref.set(data).then(() => {
     showStatus("Series Saved!", "success");
     showView('manage-series-view');
  });
}

function loadSeries() {
   database.ref('webseries').on('value', snap => {
       const grid = document.getElementById('series-grid-container');
       const fragment = document.createDocumentFragment();
       const items = [];
       snap.forEach(child => {
          const m = child.val();
          const card = document.createElement('div');
          card.className = 'movie-card';
          card.innerHTML = `<img src="${m.poster}"><div class="movie-card-info"><h3>${m.title}</h3><p>${m.year}</p></div>
            <div class="movie-card-actions">
              <button class="btn-icon" onclick="deleteData('webseries', '${child.key}')"><i class="fa fa-trash"></i></button>
            </div>
          `;
          items.push(card);
       });
       items.reverse().forEach(card => fragment.appendChild(card));
       grid.innerHTML = '';
       grid.appendChild(fragment);
   });
}

function handleSaveAnime() {
  const selectedCats = Array.from(document.querySelectorAll('#anime-category-wrapper input:checked')).map(cb => cb.value);
  const eps = [];
  document.querySelectorAll('#anime-seasons-container .season-block').forEach(s => {
      const sNum = s.querySelector('.season-number').value;
      s.querySelectorAll('.episode-block').forEach(e => {
         eps.push({
            season: sNum, number: e.querySelector('.episode-number').value,
            title: e.querySelector('.episode-title').value,
            link: e.querySelector('.episode-link').value
         });
      });
  });
  const data = {
    title: document.getElementById('anime-title').value,
    poster: document.getElementById('anime-poster').value,
    backdrop: document.getElementById('anime-backdrop').value,
    rating: parseFloat(document.getElementById('anime-rating').value) || 0,
    year: parseInt(document.getElementById('anime-year').value) || 2024,
    storyline: document.getElementById('anime-storyline').value,
    category: selectedCats,
    episodes: eps,
    access: document.getElementById('anime-is-premium').checked ? 'Premium' : 'Free',
    type: 'anime',
    timestamp: Date.now()
  };
  const id = document.getElementById('anime-edit-id').value;
  const ref = id ? database.ref('anime/' + id) : database.ref('anime').push();
  ref.set(data).then(() => {
     showStatus("Anime Saved!", "success");
     showView('manage-anime-view');
  });
}

function loadAnime() {
   database.ref('anime').on('value', snap => {
       const grid = document.getElementById('anime-grid-container');
       if(!grid) return;
       const fragment = document.createDocumentFragment();
       const items = [];
       snap.forEach(child => {
          const m = child.val();
          const card = document.createElement('div');
          card.className = 'movie-card';
          card.innerHTML = `<img src="${m.poster}"><div class="movie-card-info"><h3>${m.title}</h3><p>${m.year}</p></div>
            <div class="movie-card-actions">
              <button class="btn-icon" onclick="deleteData('anime', '${child.key}')"><i class="fa fa-trash"></i></button>
            </div>
          `;
          items.push(card);
       });
       items.reverse().forEach(card => fragment.appendChild(card));
       grid.innerHTML = '';
       grid.appendChild(fragment);
   });
}

function addSeason(prefix = 'series') {
  const c = document.getElementById(`${prefix}-seasons-container`);
  const d = document.createElement('div');
  d.className = 'season-block';
  d.innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:10px;">
       <input type="number" placeholder="Season" class="season-number" style="width:100px;padding:5px;" value="1">
       <button type="button" onclick="addEp(this)" class="btn-sm">Add Ep</button>
    </div>
    <div class="eps"></div>
  `;
  c.appendChild(d);
}

function addEp(btn) {
  const c = btn.parentElement.nextElementSibling;
  const d = document.createElement('div');
  d.className = 'episode-block';
  d.style.marginBottom = '10px';
  d.innerHTML = `
    <input type="number" placeholder="EpNum" class="episode-number" style="width:60px;padding:5px;">
    <input type="text" placeholder="Title" class="episode-title" style="width:120px;padding:5px;">
    <input type="text" placeholder="Video Link" class="episode-link" style="width:200px;padding:5px;">
    <button type="button" onclick="this.parentElement.remove()" style="color:red">X</button>
  `;
  c.appendChild(d);
}

function handleSaveLiveTv() {
  const data = {
     name: document.getElementById('livetv-name').value,
     logo: document.getElementById('livetv-logo').value,
     link: document.getElementById('livetv-stream').value,
     category: document.getElementById('livetv-category').value,
     timestamp: Date.now()
  };
  database.ref('live_tv').push(data).then(() => {
     showStatus("Live TV Saved", "success");
     showView('manage-livetv-view');
  });
}

function loadLiveTvChannels() {
   database.ref('live_tv').on('value', snap => {
       const grid = document.getElementById('livetv-grid-container');
       const fragment = document.createDocumentFragment();
       const items = [];
       snap.forEach(child => {
          const m = child.val();
          const card = document.createElement('div');
          card.className = 'movie-card';
          card.innerHTML = `<img src="${m.logo}" style="object-fit:contain;background:#fff;padding:10px;"><div class="movie-card-info"><h3>${m.name}</h3></div>
            <div class="movie-card-actions">
              <button class="btn-icon" onclick="deleteData('live_tv', '${child.key}')"><i class="fa fa-trash"></i></button>
            </div>
          `;
          items.push(card);
       });
       items.reverse().forEach(card => fragment.appendChild(card));
       grid.innerHTML = '';
       grid.appendChild(fragment);
   });
}

function loadUsers() {
  database.ref('users').on('value', snap => {
     const tbody = document.getElementById('user-list-body');
     const fragment = document.createDocumentFragment();
     snap.forEach(child => {
         const u = child.val();
         const tr = document.createElement('tr');
         tr.innerHTML = `<td>${u.name||u.username||'User'}</td><td>${u.email}</td><td>${u.id || child.key}</td>
            <td>${u.isBanned ? 'Banned' : 'Active'}</td>
            <td><button class="btn-sm" onclick="toggleBan('${child.key}', ${!!u.isBanned})">${u.isBanned ? 'Unban' : 'Ban'}</button></td>
         `;
         fragment.appendChild(tr);
     });
     tbody.innerHTML = '';
     tbody.appendChild(fragment);
  });
}

function toggleBan(id, isBanned) {
   database.ref(`users/${id}/isBanned`).set(!isBanned);
}

function loadMovieRequests() {
   database.ref('requests').on('value', snap => {
       const tbody = document.getElementById('request-list-body');
       const fragment = document.createDocumentFragment();
       snap.forEach(child => {
           const r = child.val();
           const tr = document.createElement('tr');
           tr.innerHTML = `<td>${r.movieName}</td><td>${r.year}</td><td>${r.language}</td><td>${r.requestedBy}</td>
             <td><button class="btn-sm success" onclick="deleteData('requests', '${child.key}')">Done</button></td>
           `;
           fragment.appendChild(tr);
       });
       tbody.innerHTML = '';
       tbody.appendChild(fragment);
   });
}

function handleSaveAd() {
   const data = {
      title: document.getElementById('ad-title').value,
      type: document.getElementById('ad-type').value,
      content: document.getElementById('ad-media-url').value,
      placement: document.getElementById('ad-placement').value,
      targetCategory: document.getElementById('ad-target-category').value,
      link: document.getElementById('ad-target-url').value,
      duration: document.getElementById('ad-duration').value,
      isActive: document.getElementById('ad-is-active').checked
   };
   database.ref('ads').push(data).then(() => {
       showStatus("Ad Saved", "success");
   });
}

function loadAds() {
   database.ref('ads').on('value', snap => {
       const grid = document.getElementById('ads-grid-container');
       const fragment = document.createDocumentFragment();
       snap.forEach(child => {
           const a = child.val();
           const card = document.createElement('div');
           card.className = 'movie-card';
           card.innerHTML = `<img src="${a.type==='image' ? a.content : 'https://placehold.co/100x100?text=VIDEO'}"><div class="movie-card-info"><h3>${a.title}</h3><p>${a.placement}</p></div>
              <div class="movie-card-actions"><button class="btn-icon" onclick="deleteData('ads', '${child.key}')"><i class="fa fa-trash"></i></button></div>
           `;
           fragment.appendChild(card);
       });
       grid.innerHTML = '';
       grid.appendChild(fragment);
   });
}

function savePlan() {
   const data = {
      name: document.getElementById('plan-name').value,
      rate: document.getElementById('plan-price').value,
      validity: document.getElementById('plan-days').value,
      conveniences: document.getElementById('plan-desc').value.split(',').map(s=>s.trim()),
      qrUrl: document.getElementById('plan-qr').value
   };
   database.ref(`subscriptions/plans/${data.name}`).set(data).then(() => showStatus("Saved", "success"));
}
function loadPlans() {
   database.ref('subscriptions/plans').on('value', snap => {
       const grid = document.getElementById('plans-list-container');
       const fragment = document.createDocumentFragment();
       snap.forEach(child => {
           const p = child.val();
           const card = document.createElement('div');
           card.className = 'movie-card';
           card.innerHTML = `
              <div class="movie-card-info" style="text-align:center;padding:20px;">
                 <h2 style="font-size:24px;color:#F2AE01">${p.name}</h2>
                 <h3 style="font-size:32px;margin:10px 0;">₹${p.rate}</h3>
                 <p>${p.validity} Days</p>
                 <button class="btn-sm" style="margin-top:10px" onclick="deleteData('subscriptions/plans', '${child.key}')">Delete</button>
              </div>
           `;
           fragment.appendChild(card);
       });
       grid.innerHTML = '';
       grid.appendChild(fragment);
   });
}

function handleSaveMaintenance() {
   const enabled = document.getElementById('maintenance-toggle').checked;
   database.ref('serverManagement').set({ status: enabled ? 'MAINTENANCE' : 'LIVE' }).then(() => {
       document.getElementById('maintenance-status-text').textContent = enabled ? 'MAINTENANCE ON' : 'LIVE';
   });
}
function loadMaintenanceStatus() {
   database.ref('serverManagement').on('value', snap => {
       const stat = snap.val()?.status;
       document.getElementById('maintenance-toggle').checked = stat === 'MAINTENANCE';
       document.getElementById('maintenance-status-text').textContent = stat === 'MAINTENANCE' ? 'MAINTENANCE ON' : 'LIVE';
   });
}

function saveAppControlSettings() {
   database.ref('settings').update({
       latestVersionCode: document.getElementById('app-ver-code').value,
       updateUrl: document.getElementById('app-apk-url').value,
       logoText: document.getElementById('app-logo-text').value
   }).then(() => showStatus('Saved', 'success'));
}
function loadAppControlSettings() {
   database.ref('settings').on('value', snap => {
       const d = snap.val();
       if(d) {
          document.getElementById('app-ver-code').value = d.latestVersionCode || '';
          document.getElementById('app-apk-url').value = d.updateUrl || '';
          document.getElementById('app-logo-text').value = d.logoText || '';
       }
   });
}
