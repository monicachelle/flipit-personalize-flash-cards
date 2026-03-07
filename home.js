setTimeout(() => {

  /* ================= GREETING SECTION ================= */

  const savedName = localStorage.getItem('username');
  const name = savedName || "Friend";
document.getElementById('userName').innerHTML = `🎀 ${name} 🎀`;


  const hour = new Date().getHours();
  let greet = "Good Morning";
  if(hour >= 12 && hour < 17) greet = "Good Afternoon";
  if(hour >= 17) greet = "Good Evening";

  
  document.getElementById("greetingText").innerHTML = 
  `🌤️ ${greet} 🌸✨`;


  // Typewriter Effect
  function typeWriter(text) {
    let i = 0;
    const el = document.getElementById("welcomeMessage");
    el.textContent = '';

    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, 35);
      }
    }
    type();
  }

  typeWriter("A soft little reminder — today is yours to bloom 🌷");
}, 100);