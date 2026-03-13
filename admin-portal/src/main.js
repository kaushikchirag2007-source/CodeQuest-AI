import './style.css'

// --- Mock Data ---
const activity = [
  { user: 'Student_42', action: 'Finished Python Intro', xp: '+10', time: '2m ago' },
  { user: 'SkyWalker', action: 'Streak Day 7!', xp: '+15', time: '5m ago' },
  { user: 'Beginner_Coder', action: 'Started Spanish', xp: '+5', time: '12m ago' },
  { user: 'DevOps_Pro', action: 'Moderated Rust Content', xp: '-', time: '1h ago' },
];

// --- Init ---
function init() {
  renderActivity();
  setupNav();
}

function renderActivity() {
  const tableBody = document.getElementById('activity-log-body');
  tableBody.innerHTML = activity.map(log => `
    <tr>
      <td><strong>${log.user}</strong></td>
      <td>${log.action}</td>
      <td style="color:#58cc02; font-weight:700">${log.xp}</td>
      <td>${log.time}</td>
    </tr>
  `).join('');
}

function setupNav() {
  document.querySelectorAll('.nav-links li').forEach(li => {
    li.onclick = () => {
      document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      alert(`Navigation to ${li.dataset.page} is locked for security! This is a demo.`);
    };
  });
}

init();
