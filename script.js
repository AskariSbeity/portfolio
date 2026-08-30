// Smooth scroll with offset for fixed header
const header = document.querySelector('.header'); // your fixed header

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      // Calculate offset
      const headerHeight = header.offsetHeight;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerHeight - 20; // 20px extra space

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});


// ===== Header Animation on Scroll =====
const header1 = document.querySelector('.header');

const handleHeaderScroll = () => {
  if (window.scrollY > 60) {
    header1.classList.add('scrolled');
  } else {
    header1.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();

// ===== Scroll Reveal for Sections =====
const reveals = document.querySelectorAll('.reveal');
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineLine = document.querySelector('.timeline-line');
const timelineContainer = document.querySelector('.timeline-container');
const staggerSection = document.querySelector('.stagger');
const cards = document.querySelectorAll('.about-card.expandable');

const handleScroll = () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;

  // ----- Scroll Reveal -----
  reveals.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top < windowHeight - 120) {
      section.classList.add('active');
    }
  });

 const timelineContainer = document.querySelector('.timeline-container');
const timelineLine = document.querySelector('.timeline-line');
const timelineItems = document.querySelectorAll('.timeline-item');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;

  if (timelineContainer && timelineLine) {
    const containerTop = timelineContainer.offsetTop;
    const containerHeight = timelineContainer.offsetHeight;

    // Vertical line grows with scroll
    let progress = scrollTop + windowHeight / 2 - containerTop;
    progress = Math.max(0, Math.min(progress, containerHeight));
    timelineLine.style.height = progress + 'px';

    // Reveal timeline items
    timelineItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.top < windowHeight - 150) {
        item.classList.add('active');
      }
    });
  }
});



  // ----- Scroll progress bar -----
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    const docHeight = document.documentElement.scrollHeight - windowHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }
};

window.addEventListener('scroll', handleScroll);
handleScroll(); // initial call

// ===== Rotating Statement =====
const words = ["design", "build", "lead"];
let index = 0;
const rotateText = document.getElementById("rotate-text");

if (rotateText) {
  setInterval(() => {
    rotateText.style.opacity = 0;
    rotateText.style.transform = "translateY(10px)";

    setTimeout(() => {
      index = (index + 1) % words.length;
      rotateText.textContent = words[index];
      rotateText.style.opacity = 1;
      rotateText.style.transform = "translateY(0)";
    }, 400);
  }, 2500);
}

//Project Modal Logic
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDesc = document.getElementById('modalDesc');
const modalTech = document.getElementById('modalTech');
const modalCode = document.getElementById('modalCode');
const modalFeatures = document.getElementById('modalFeatures');
const modalContribution = document.getElementById('modalContribution');
const modalContributionWrap = document.getElementById('modalContributionWrap');
const modalLinks = document.getElementById('modalLinks');
const closeBtn = modal.querySelector('.close');

document.querySelectorAll('.project-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.project-card');

    // Modal Text
    modalTitle.textContent = card.dataset.title;
    modalCategory.textContent = card.dataset.categoryLabel || "";
    modalCategory.style.display = card.dataset.categoryLabel ? "block" : "none";
    modalDesc.textContent = card.dataset.desc;
    modalTech.textContent = "Technologies: " + card.dataset.tech;

    // Key Features
    modalFeatures.innerHTML = "";
    if (card.dataset.features) {
      card.dataset.features.split("|").forEach(feature => {
        const li = document.createElement("li");
        li.textContent = feature.trim();
        modalFeatures.appendChild(li);
      });
      modalFeatures.parentElement.style.display = "block";
    } else {
      modalFeatures.parentElement.style.display = "none";
    }

    // Contribution
    if (card.dataset.contribution) {
      modalContribution.textContent = card.dataset.contribution;
      modalContributionWrap.style.display = "block";
    } else {
      modalContributionWrap.style.display = "none";
    }

    // Links
    modalLinks.innerHTML = "";
    if (card.dataset.live) {
      const liveLink = document.createElement("a");
      liveLink.href = card.dataset.live;
      liveLink.target = "_blank";
      liveLink.rel = "noopener noreferrer";
      liveLink.innerHTML = '<i class="fas fa-arrow-up-right-from-square"></i> Live Site';
      modalLinks.appendChild(liveLink);
    }
    if (card.dataset.github) {
      const githubLink = document.createElement("a");
      githubLink.href = card.dataset.github;
      githubLink.target = "_blank";
      githubLink.rel = "noopener noreferrer";
      githubLink.innerHTML = '<i class="fab fa-github"></i> View Code';
      modalLinks.appendChild(githubLink);
    }

    // Set Preview Image
    const previewImg = document.getElementById('modalPreview');
    previewImg.src = card.dataset.preview || "images/placeholder.png";
    
    // Split code by lines
    const lines = card.dataset.code.split("\n");
    modalCode.innerHTML = ""; // Clear previous code

    lines.forEach(line => {
      // Escape HTML
      let escaped = line.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Highlight: tags blue, attributes cyan, values orange
      escaped = escaped
        .replace(/(&lt;\/?.*?&gt;)/g, "<span style='color: #9cdcfe'>$1</span>") // tags
        .replace(/\b(class|id|href)\b/g, "<span style='color: #569cd6'>$1</span>") // attributes
        .replace(/"(.*?)"/g, "<span style='color:#ce9178'>\"$1\"</span>"); // values

      // Add line with a <div> to preserve line breaks
      const div = document.createElement("div");
      div.innerHTML = escaped || " "; // keep empty lines visible
      modalCode.appendChild(div);
    });

    modal.classList.add('show');
  });
});

// Close modal
closeBtn.addEventListener('click', () => modal.classList.remove('show'));
window.addEventListener('click', e => {
  if(e.target === modal) modal.classList.remove('show');
});



// ===== Project Filter Tabs =====
const filterBtns = document.querySelectorAll('.filter-btn');
const allProjectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    allProjectCards.forEach(card => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !matches);
    });
  });
});

// Scroll reveal effect for project cards
const projectCards = document.querySelectorAll('.project-card');
function revealProjectCards() {
  const windowHeight = window.innerHeight;
  projectCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if(rect.top < windowHeight - 100){
      card.classList.add('active');
    }
  });
}
window.addEventListener('scroll', revealProjectCards);
window.addEventListener('load', revealProjectCards);

//Contact message -> delivered to your inbox via EmailJS
// SETUP (one-time, ~5 min): see EMAILJS_SETUP.md in this folder for step-by-step instructions.
// Replace the three placeholders below with the values from your EmailJS account.
const EMAILJS_PUBLIC_KEY  = "W2rdOmeOMOQwCwniL";   // EmailJS > Account > General
const EMAILJS_SERVICE_ID  = "service_5hjr19m";      // EmailJS > Email Services
const EMAILJS_TEMPLATE_ID = "template_i4pr5fn";     // EmailJS > Email Templates

if (window.emailjs) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const form = document.querySelector('.contact-form');
const feedback = document.getElementById('formFeedback');
const sendBtn = form.querySelector('.send-btn');

form.addEventListener('submit', function(e){
  e.preventDefault();

  if (!window.emailjs || EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
    feedback.textContent = "Contact form isn't set up yet — see EMAILJS_SETUP.md.";
    feedback.classList.add('show');
    setTimeout(() => feedback.classList.remove('show'), 4000);
    return;
  }

  sendBtn.disabled = true;
  const originalBtnText = sendBtn.textContent;
  sendBtn.textContent = "Sending...";

  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
    .then(() => {
      feedback.textContent = "Message sent! I'll get back to you soon.";
      feedback.classList.add('show');
      form.reset();
    })
    .catch((error) => {
      console.error('EmailJS error:', error);
      feedback.textContent = "Something went wrong — please email me directly.";
      feedback.classList.add('show');
    })
    .finally(() => {
      sendBtn.disabled = false;
      sendBtn.textContent = originalBtnText;
      setTimeout(() => feedback.classList.remove('show'), 4000);
    });
});


// ===== Skills Category Tabs =====
const skillTabs = document.querySelectorAll('.skill-tab');
const skillChips = document.querySelectorAll('.skill-chip');

skillTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    skillTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.dataset.tab;

    skillChips.forEach(chip => {
      const matches = target === 'all' || chip.dataset.tab === target;
      chip.classList.toggle('hidden', !matches);
    });
  });
});



//Back to top
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});


const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

function openMenu() {
  navLinks.classList.add('show');
  hamburger.classList.add('active');
  document.body.classList.add('menu-open');
  hamburger.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  navLinks.classList.remove('show');
  hamburger.classList.remove('active');
  document.body.classList.remove('menu-open');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  if (navLinks.classList.contains('show')) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Close the mobile menu whenever a nav link is tapped
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on outside click (tapping the dark overlay itself)
navLinks.addEventListener('click', (e) => {
  if (e.target === navLinks) closeMenu();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('show')) closeMenu();
});

// Close automatically if the viewport grows back to desktop size
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navLinks.classList.contains('show')) closeMenu();
});
