// script.js

// IMPORTANT: Replace this with your actual Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5gfch9vmQbvfnTnjcRnqPzoo6iHV3nNEBbXMRlu2NxpWovcyi1re_Ln9fF6Q3mqgE/exec";

// --- Modal Functions (already in your HTML, just ensure they are here) ---
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// --- Division List (already in your HTML, just ensure they are here) ---
const divisions = document.querySelectorAll('.division-list li');
divisions.forEach(div => {
    div.addEventListener('click', () => {
        divisions.forEach(d => d.classList.remove('active'));
        div.classList.add('active');
        // TODO: Implement filtering logic here based on selected division
        // For now, just re-render all personnel
        fetchAndRenderPersonnel();
    });
});


// --- Data Fetching and Rendering Functions ---

async function fetchData(sheetName) {
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?sheet=${sheetName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${sheetName}:`, error);
        return []; // Return empty array on error
    }
}

async function fetchAndRenderPersonnel() {
    const personnelData = await fetchData('Personnel');
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    personnelData.forEach(person => {
        const row = tbody.insertRow();
        row.insertCell().textContent = person.ID;
        row.insertCell().textContent = person.Name;
        row.insertCell().textContent = person.Rank;
        row.insertCell().textContent = person.Division;
        row.insertCell().textContent = person.Status;
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `<button class="btn" style="padding: 5px 10px; font-size: 0.8rem;">View</button>`;
    });

    // Update Personnel Overview card
    const totalPersonnelSpan = document.querySelector('.card:nth-child(1) .stat:nth-child(1) .stat-value');
    totalPersonnelSpan.textContent = personnelData.length;

    const activeNow = personnelData.filter(p => p.Status === 'Active').length;
    document.querySelector('.card:nth-child(1) .stat:nth-child(2) .stat-value').textContent = activeNow;

    const onDeployment = personnelData.filter(p => p.Status === 'On Deployment').length;
    document.querySelector('.card:nth-child(1) .stat:nth-child(3) .stat-value').textContent = onDeployment;

    // You'll need to track new recruits in your sheet or calculate differently
    // For now, let's just set it to a placeholder or 0 if not tracked
    document.querySelector('.card:nth-child(1) .stat:nth-child(4) .stat-value').textContent = '0'; // Or implement logic to count new recruits
}

// Function to handle adding new personnel
async function addPersonnel(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const rank = document.getElementById('rank').value;
  const division = document.getElementById('division').value;
  const discord = document.getElementById('discord').value.trim();
  const robloxUsername = document.getElementById('robloxUsername').value.trim();

  if (!name || !rank || !division || !discord || !robloxUsername) {
    alert("Please fill in all fields.");
    return;
  }

  // Prepare URL-encoded form data
  const formData = new URLSearchParams();
  formData.append('name', name);
  formData.append('rank', rank);
  formData.append('division', division);
  formData.append('discord', discord);
  formData.append('robloxUsername', robloxUsername);

  try {
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?sheet=Personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      alert('Personnel added successfully!');
      closeModal('addPersonnel');
      document.querySelector('#addPersonnel form').reset();
      fetchAndRenderPersonnel();
    } else {
      alert('Error adding personnel: ' + (result.message || JSON.stringify(result)));
    }
  } catch (error) {
    console.error('Error adding personnel:', error);
    alert('Failed to add personnel. Please try again.');
  }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderPersonnel(); // Load personnel data when the page loads

    // Attach event listener to the Add Personnel form
    const addPersonnelForm = document.querySelector('#addPersonnel form');
    if (addPersonnelForm) {
        addPersonnelForm.addEventListener('submit', addPersonnel);
    }

    // TODO: Implement similar functions and event listeners for Operations and Equipment
    // For example: fetchAndRenderOperations(), fetchAndRenderEquipment()
    // And event listeners for 'logOperation' and 'addResource' forms
});

// --- Search Bar (Basic Client-Side Filtering) ---
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar button');

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

async function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const personnelData = await fetchData('Personnel'); // Fetch fresh data or use a cached version

    const filteredPersonnel = personnelData.filter(person =>
        person.Name.toLowerCase().includes(searchTerm) ||
        person.Rank.toLowerCase().includes(searchTerm) ||
        person.Division.toLowerCase().includes(searchTerm) ||
        person.ID.toLowerCase().includes(searchTerm)
    );

    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    filteredPersonnel.forEach(person => {
        const row = tbody.insertRow();
        row.insertCell().textContent = person.ID;
        row.insertCell().textContent = person.Name;
        row.insertCell().textContent = person.Rank;
        row.insertCell().textContent = person.Division;
        row.insertCell().textContent = person.Status;
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `<button class="btn" style="padding: 5px 10px; font-size: 0.8rem;">View</button>`;
    });
}


