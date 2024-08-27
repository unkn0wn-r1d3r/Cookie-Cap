document.addEventListener('DOMContentLoaded', function() {
    const captureCookiesBtn = document.getElementById('captureCookies');
    const exportNamesBtn = document.getElementById('exportNames');
    const exportFullBtn = document.getElementById('exportFull');
    const viewAuthCookiesBtn = document.getElementById('viewAuthCookies');
    const backBtn = document.getElementById('backButton');
    const themeToggleBtn = document.getElementById('themeToggle');
    const cookieList = document.getElementById('cookieList');
    const cookieContent = document.getElementById('cookieContent');
    const authCookieContent = document.getElementById('authCookieContent');
    const mainView = document.getElementById('mainView');
    const authView = document.getElementById('authView');
  
    let capturedCookies = [];
    let isDarkTheme = false;
  
    captureCookiesBtn.addEventListener('click', function() {
      chrome.runtime.sendMessage({action: "getCookies"}, function(response) {
        capturedCookies = response.cookies;
        displayCookies(capturedCookies);
        cookieList.classList.remove('hidden');
      });
    });

    const themeToggle = document.getElementById('themeToggle');
  
  // Check for saved theme preference or default to light theme
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark-theme', currentTheme === 'dark');
  themeToggle.checked = currentTheme === 'dark';

  themeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  });
  
    exportNamesBtn.addEventListener('click', function() {
      exportCookies('names');
    });
  
    exportFullBtn.addEventListener('click', function() {
      exportCookies('full');
    });
  
    viewAuthCookiesBtn.addEventListener('click', function() {
      displayAuthCookies(capturedCookies);
      mainView.classList.add('hidden');
      authView.classList.remove('hidden');
    });
  
    backBtn.addEventListener('click', function() {
      authView.classList.add('hidden');
      mainView.classList.remove('hidden');
    });
  
    themeToggleBtn.addEventListener('click', function() {
      isDarkTheme = !isDarkTheme;
      document.body.classList.toggle('dark-theme', isDarkTheme);
    });
  
    function displayCookies(cookies) {
      cookieContent.innerHTML = '';
      cookies.forEach(function(cookie) {
        const cookieItem = createCookieItem(cookie);
        cookieContent.appendChild(cookieItem);
      });
    }
  
    function displayAuthCookies(cookies) {
      authCookieContent.innerHTML = '';
      const authCookies = cookies.filter(isAuthCookie);
      authCookies.forEach(function(cookie) {
        const cookieItem = createCookieItem(cookie);
        authCookieContent.appendChild(cookieItem);
      });
    }
  
    function createCookieItem(cookie) {
      const cookieItem = document.createElement('div');
      cookieItem.classList.add('cookie-item');
      
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('cookie-name');
      nameSpan.textContent = cookie.name;
      
      const typeSpan = document.createElement('span');
      typeSpan.classList.add('cookie-type');
      if (cookie.session) {
        typeSpan.textContent = 'Session Cookie';
        typeSpan.classList.add('session');
      } else {
        typeSpan.textContent = 'Persistent Cookie';
      }
      
      const valueSpan = document.createElement('span');
      valueSpan.classList.add('cookie-value');
      valueSpan.textContent = cookie.value;
      
      cookieItem.appendChild(nameSpan);
      cookieItem.appendChild(typeSpan);
      cookieItem.appendChild(valueSpan);
      
      if (isAuthCookie(cookie)) {
        const authSpan = document.createElement('span');
        authSpan.classList.add('auth-cookie');
        authSpan.textContent = 'Potential Auth Token';
        cookieItem.appendChild(authSpan);
      }
      
      return cookieItem;
    }
  
    function isAuthCookie(cookie) {
      const authKeywords = ['session', 'token', 'auth', 'login', 'jwt'];
      return authKeywords.some(keyword => cookie.name.toLowerCase().includes(keyword));
    }
  
    function exportCookies(format) {
      let exportData = '';
      if (format === 'names') {
        exportData = capturedCookies.map(cookie => cookie.name).join('\n');
      } else {
        exportData = capturedCookies.map(cookie => {
          return `Name: ${cookie.name}\nValue: ${cookie.value}\nDomain: ${cookie.domain}\nPath: ${cookie.path}\nExpires: ${cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toUTCString() : 'Session'}\nSecure: ${cookie.secure}\nHttpOnly: ${cookie.httpOnly}\nSameSite: ${cookie.sameSite}\n\n`;
        }).join('');
      }
  
      const blob = new Blob([exportData], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cookies_${format}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });