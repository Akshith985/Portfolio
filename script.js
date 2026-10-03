const btn=document.getElementById("themeBtn");
const saved=localStorage.getItem("portfolio-theme");
if(saved==="light") document.body.classList.add("light");
btn.addEventListener("click",()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("portfolio-theme",document.body.classList.contains("light")?"light":"dark");
});
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",e=>{
    const el=document.querySelector(a.getAttribute("href"));
    if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth"});}
  });
});

/* GitHub public activity heatmap — no token required. */
(async function loadGitHubActivity(){
  const graph = document.getElementById("commitGraph");
  const count = document.getElementById("commitCount");
  const status = document.getElementById("activityStatus");
  if(!graph) return;

  const days = 30;
  const buckets = Array.from({length: days}, () => 0);
  const now = new Date();
  now.setHours(23,59,59,999);

  try {
    let page = 1;
    let events = [];
    // Public Events API currently exposes recent public events; paginate a few pages.
    while(page <= 3){
      const res = await fetch(`https://api.github.com/users/Akshith985/events/public?per_page=100&page=${page}`, {
        headers: {"Accept":"application/vnd.github+json"}
      });
      if(!res.ok) throw new Error(`GitHub API ${res.status}`);
      const batch = await res.json();
      if(!batch.length) break;
      events.push(...batch);
      if(batch.length < 100) break;
      page++;
    }

    const pushes = events.filter(e => e.type === "PushEvent");
    pushes.forEach(event => {
      const d = new Date(event.created_at);
      const diff = Math.floor((now - d) / 86400000);
      if(diff >= 0 && diff < days) buckets[days - 1 - diff] += (event.payload?.commits?.length || 1);
    });

    const max = Math.max(...buckets, 1);
    buckets.forEach((value, i) => {
      const day = document.createElement("div");
      const level = value === 0 ? 0 : Math.min(4, Math.ceil((value / max) * 4));
      const d = new Date(now);
      d.setDate(now.getDate() - (days - 1 - i));
      day.className = "commit-day";
      day.dataset.level = level;
      day.dataset.tip = `${d.toLocaleDateString(undefined,{month:"short",day:"numeric"})} · ${value} commit${value===1?"":"s"}`;
      graph.appendChild(day);
    });

    count.textContent = pushes.reduce((sum,e)=>sum+(e.payload?.commits?.length || 1),0);
    status.textContent = "● live public activity";
    status.style.color = "var(--accent)";
  } catch(err) {
    for(let i=0;i<days;i++){
      const day=document.createElement("div");
      day.className="commit-day";
      day.dataset.level="0";
      day.dataset.tip="GitHub activity unavailable";
      graph.appendChild(day);
    }
    count.textContent = "—";
    status.textContent = "GitHub activity unavailable";
    console.warn(err);
  }
})();
