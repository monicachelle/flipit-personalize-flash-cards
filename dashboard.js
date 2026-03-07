

// Sidebar navigation
const menuItems = document.querySelectorAll('.sidebar-menu li');
const featureContent = document.getElementById('feature-content');

menuItems.forEach(item => {
  item.addEventListener('click', async () => {
    //  Remove active class
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Load the feature HTML dynamically
    const section = item.dataset.section; // e.g., "home", "create"
    try {
      const response = await fetch(`${section}.html`);
      if (!response.ok) throw new Error('Feature not found');
      const html = await response.text();
      featureContent.innerHTML = html;

      // Load the feature JS dynamically
      const script = document.createElement('script');
      script.src = `${section}.js`;
      document.body.appendChild(script);

      // Optional: dynamically load CSS too
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${section}.css`;
      document.head.appendChild(link);

    } catch (err) {
      featureContent.innerHTML = `<p>Error loading ${section} feature.</p>`;
      console.error(err);
    }
  });
});



// Activate Home by default
document.querySelector('.sidebar-menu li.active').click();

// Logout function - clears current user session
function logout() {
    // Clear only session data, not user's saved cards
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Go to main page without logging out
function goToMainPage() {
    window.location.href = 'index4.html';
}
