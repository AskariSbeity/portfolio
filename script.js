(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  const scrollBehavior = () => (reduceMotion ? 'auto' : 'smooth');

  /* ───────── Header, progress, nav, back-to-top ───────── */
  const header = $('.site-header');
  const menuToggle = $('.menu-toggle');
  const nav = $('.site-nav');
  const progress = $('.scroll-progress');
  const navLinks = $$('.nav-link');
  const floatingTop = $('.floating-back-top');
  const bttRing = $('#btt-ring');
  const bttPct = $('#btt-pct');
  const RING = 182.2;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? clamp(y / max, 0, 1) : 0;
    header.classList.toggle('scrolled', y > 28);
    progress.style.width = `${ratio * 100}%`;
    floatingTop.classList.toggle('is-visible', y > 520);
    if (bttRing) bttRing.style.strokeDashoffset = String(RING * (1 - ratio));
    if (bttPct) bttPct.textContent = `${Math.round(ratio * 100)}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  };
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
  });

  // "#top" now truly scrolls to the top of the page. (The old code called scrollIntoView on the header, which is fixed, so nothing happened.)
  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior() });
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (hash === '#top') { event.preventDefault(); scrollToTop(); closeMenu(); return; }
    const target = hash.length > 1 ? $(hash) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    closeMenu();
  }));
  window.addEventListener('keydown', event => {
    if (event.key === 'Home' && !/input|textarea|select/i.test(event.target.tagName) && !$('#project-dialog').open) { event.preventDefault(); scrollToTop(); }
  });

  const sections = $$('main section[id], main section.hero');
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id === 'home' || !entry.target.id ? 'top' : entry.target.id;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
    }), { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(s => so.observe(s));
  }

  /* ───────── Hero: I design / I build / I lead ───────── */
  const lines = $$('.stmt-line');
  const caption = $('#manifesto-caption');
  const indexEl = $('#manifesto-index');
  const barFill = $('#stmt-bar-fill');
  const CYCLE = 3200;
  let active = 0, cycleTimer;
  const setActive = (i, restart = true) => {
    active = (i + lines.length) % lines.length;
    lines.forEach((l, n) => l.classList.toggle('is-active', n === active));
    caption.classList.add('swap');
    window.setTimeout(() => {
      caption.textContent = lines[active].dataset.caption;
      indexEl.textContent = lines[active].dataset.index;
      caption.classList.remove('swap');
    }, reduceMotion ? 0 : 160);
    if (restart) startCycle();
  };
  const startCycle = () => {
    window.clearTimeout(cycleTimer);
    barFill.style.transition = 'none'; barFill.style.width = '0';
    if (reduceMotion) return;
    void barFill.offsetWidth;
    barFill.style.transition = `width ${CYCLE}ms linear`; barFill.style.width = '100%';
    cycleTimer = window.setTimeout(() => setActive(active + 1), CYCLE);
  };
  lines.forEach((l, i) => l.addEventListener('click', () => setActive(i)));
  document.addEventListener('visibilitychange', () => { if (document.hidden) window.clearTimeout(cycleTimer); else startCycle(); });
  startCycle();

  /* ───────── Project content ───────── */
  const projectData = {
    syncora: {
      title: 'Syncora', category: 'FULL STACK · COLLABORATION',
      lede: 'A real-time collaborative project management platform where teams plan work on boards, talk about it in context, and always see the same up-to-date state.',
      tech: ['React', 'TypeScript', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Socket.IO', 'Tailwind CSS'],
      sections: [
        { h: 'The idea', p: ['Most teams juggle one tool for tasks, another for chat, and a third for files. Syncora brings projects, boards, tasks, conversations and notifications into one focused workspace, so context never gets lost between tools.'] },
        { h: 'What it does', ul: [
          '<b>Workspaces and projects</b> with members, roles and permissions.',
          '<b>Kanban boards</b> where tasks move from To Do through In Progress and Review to Done by drag and drop.',
          '<b>Task detail</b> with checklists, comments, file uploads and short readable keys like SYNC-1.',
          '<b>Real-time updates</b> for chat, activity and notifications, pushed to everyone instantly.',
          '<b>Search and a dashboard</b> that aggregates progress across projects.'] },
        { h: 'How it\'s built', p: ['A TypeScript full-stack app: an Express API with Prisma on PostgreSQL, and a React + Vite client using TanStack Query for server state and dnd-kit for drag and drop. A few architecture decisions are deliberate and documented:'], ul: [
          '<b>The database is the source of truth.</b> Every change goes through validation and a database transaction (activity log and notifications are written in the same transaction) and only then is broadcast over Socket.IO. Sockets never drive state.',
          '<b>Fractional indexing for task order.</b> Moving a task updates a single row, with no re-numbering of its neighbours.',
          '<b>Atomic task keys</b> generated from a counter on the project, so keys never collide under concurrent writes.',
          '<b>Centralised authorization.</b> All permission checks live in one service and never trust IDs from the URL alone.',
          '<b>Storage abstraction.</b> File uploads use Cloudinary with a local fallback, so the app runs fully without cloud credentials.'] },
        { h: 'What it demonstrates', p: ['Designing a larger full-stack system with clean separation of concerns, consistent real-time behaviour, and a data model that stays correct as it scales.'] }
      ],
      repo: 'https://github.com/AskariSbeity/test'
    },
    chefmate: {
      title: 'ChefMate Website', category: 'FULL STACK · WEB APPLICATION',
      lede: 'The ChefMate website is a full-stack recipe discovery platform that starts from what is already in your kitchen and suggests meals you can actually make.',
      tech: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'JWT'],
      sections: [
        { h: 'The idea', p: ['Deciding what to cook is harder than cooking. ChefMate flips the usual search: instead of browsing recipes and then shopping, you tell it which ingredients you have and it surfaces the recipes that fit, helping reduce food waste along the way.'] },
        { h: 'What it does', ul: [
          '<b>Ingredient matching</b> that finds recipes based on the ingredients you already have.',
          '<b>User accounts</b> with secure sign-in.',
          '<b>Recipe pages</b> with clear ingredients, steps and food photography.'] },
        { h: 'How it\'s built', p: ['A React and TypeScript front end talks to a Node.js and Express API backed by MySQL. Authentication uses JWT, and ingredient matching runs against a relational recipe and ingredient model. This entry covers the website only; the Flutter application is listed separately as ChefMate Mobile.'] },
        { h: 'Good to know', p: ['The recipes and food photos shown in the app are my own.'] }
      ],
      repo: 'https://github.com/AskariSbeity/chefmate'
    },
    krispy: {
      title: 'Krispy Tender', category: 'FRONTEND · BRAND EXPERIENCE',
      lede: 'A restaurant website built around appetising visuals, a confident visual identity, and navigation that works as well on a phone as on a desktop.',
      tech: ['HTML', 'CSS', 'JavaScript'],
      sections: [
        { h: 'The idea', p: ['For a food brand the first impression is visual. This site leads with large food photography and a bold, memorable look, then makes the practical things easy to reach.'] },
        { h: 'What it does', ul: [
          '<b>Food-led layout</b> with strong imagery and clear typography.',
          '<b>Responsive navigation</b> that adapts cleanly from large screens down to mobile.',
          '<b>Lightweight interactions</b> written in plain JavaScript, with no framework overhead.'] },
        { h: 'How it\'s built', p: ['Hand-written HTML, CSS and vanilla JavaScript with a responsive approach and optimised images to keep pages fast.'] },
        { h: 'What it demonstrates', p: ['Strong fundamentals: semantic structure, responsive layout and visual polish without leaning on libraries.'] }
      ],
      repo: 'https://github.com/AskariSbeity/Krispy-Tender'
    },
    'chefmate-mobile': {
      title: 'ChefMate Mobile', category: 'MOBILE · FLUTTER APPLICATION',
      lede: 'The pocket version of ChefMate: open the app in the kitchen, tell it what you have, and get something to cook.',
      tech: ['Flutter', 'Dart', 'REST API', 'Material UI'],
      sections: [
        { h: 'The idea', p: ['Cooking happens away from the desk. The mobile app brings ingredient-based recipe discovery to where it is most useful: standing in front of the fridge.'] },
        { h: 'What it does', ul: [
          '<b>Find recipes from your ingredients</b> with a touch-friendly flow.',
          '<b>Browse recipes</b> with large, readable cards and photos.',
          '<b>One codebase</b> that runs on both Android and iOS.'] },
        { h: 'How it\'s built', p: ['Built with Flutter and Dart using Material components. The app talks to the ChefMate backend over a REST API, keeping the business logic in one place while the interface stays fast and native-feeling.'] },
        { h: 'What it demonstrates', p: ['Taking a web product to mobile: adapting layout and interaction for small screens and consuming a REST API from a Flutter client.'] }
      ],
      repo: 'https://github.com/AskariSbeity/chefmate'
    },
    'krispy-db': {
      title: 'Krispy Tender Database', category: 'DATABASE DESIGN · NORMALIZATION',
      lede: 'A relational database for a restaurant, modelled so that orders, menu items and customers stay consistent and easy to query.',
      tech: ['MySQL', 'ER Modeling', 'Normalization', '3NF'],
      sections: [
        { h: 'The idea', p: ['A restaurant needs reliable answers: what was ordered, by whom, at what price. That only works if the data is organised well. This project designs the schema from scratch, starting from the business rules.'] },
        { h: 'What it covers', ul: [
          '<b>Entity-relationship model</b> of customers, orders, order items, menu items and categories.',
          '<b>Normalization to third normal form</b> to remove redundancy and update anomalies.',
          '<b>Keys and constraints</b> that enforce the relationships between tables.'] },
        { h: 'How it\'s built', p: ['Designed as an ER diagram first, then translated into MySQL tables with primary and foreign keys. An order is split from its order items so that one order can hold many lines without duplicating data.'] },
        { h: 'What it demonstrates', p: ['Thinking in data first: modelling real-world rules, normalizing, and building queries on top of a clean schema.'] }
      ]
    },
    'tcp-recipe': {
      title: 'TCP Recipe Exchange', category: 'NETWORK PROGRAMMING · TCP/IP',
      lede: 'A client and server that exchange recipes over raw TCP using a custom protocol, with no HTTP or web framework involved.',
      tech: ['Python', 'Sockets', 'TCP/IP'],
      sections: [
        { h: 'The idea', p: ['Most developers meet networking through high-level frameworks. This project goes one level down, to see what actually happens between two machines when data is exchanged.'] },
        { h: 'What it does', ul: [
          '<b>A server</b> that binds to a port, listens, and accepts client connections.',
          '<b>A client</b> that connects, requests a recipe and receives the response.',
          '<b>A custom application protocol</b> that defines how requests and recipe data are structured on the wire.'] },
        { h: 'How it\'s built', p: ['Written in Python on the standard socket library, following the classic socket lifecycle: bind, listen, accept, send and receive. Because TCP is a stream, the protocol has to decide where one message ends and the next begins, which is what makes it a good learning project.'] },
        { h: 'What it demonstrates', p: ['A real understanding of client-server communication, TCP behaviour and protocol design, beyond what frameworks hide.'] }
      ]
    },
    expense: {
      title: 'Expense Tracker', category: 'TEAM PROJECT · WEB APPLICATION',
      lede: 'A finance app built with a team that turns everyday transactions into a clear monthly picture of where the money goes.',
      tech: ['React', 'Node.js', 'MySQL', 'JWT'],
      sections: [
        { h: 'The idea', p: ['Tracking spending is easy to start and hard to keep up. The goal was an interface simple enough to use daily, with summaries that make the numbers meaningful.'] },
        { h: 'What it does', ul: [
          '<b>Record expenses</b> with amounts, categories and dates.',
          '<b>Monthly overview</b> showing totals and how spending changes over time.',
          '<b>Secure accounts</b> so each person only sees their own data.'] },
        { h: 'How it\'s built', p: ['A React front end, a Node.js API and a MySQL database, with JWT-based authentication. Built as a team with shared conventions and Git workflows.'] },
        { h: 'What it demonstrates', p: ['Working effectively in a team on a full-stack application, from data model to dashboard.'] }
      ]
    }
  };

  /* ───────── 3D project stage: scroll-driven, layouts morph into each other ───────── */
  const scrollEl = $('#p3-scroll');
  const sticky = $('#p3-sticky');
  const viewport = $('#p3-viewport');
  const world = $('#p3-world');
  const ghost = $('#p3-ghost');
  const info = $('#p3-info');
  const allCards = $$('.p3-card', world);
  const rad = Math.PI / 180;

  allCards.forEach(c => {
    const d = projectData[c.dataset.project];
    c.dataset.label = d ? d.title : '';
    c.dataset.description = d ? d.short : '';
    c.setAttribute('aria-label', d ? `${d.title}. ${d.short}` : 'Project');
  });

  let visible = allCards.slice();
  const mode = 'helix';
  let ps = 0;                       // smoothed position (card units)
  let cur = [], from = [], blendT = 1;
  let activeIdx = -1;
  let pointerX = 0, pointerY = 0, px = 0, py = 0;
  let unit = 400, top = 0, running = false, lastT = 0;

  // Per-layout transform for a card at offset d from the focused card. Returns [x,y,z,rx,ry,rz,scale,opacity,shade]
  const layouts = {
    helix(d, k) {           // a spiral staircase around a cylinder
      const a = d * 42 * rad, R = 560 * k;
      return [R * Math.sin(a), d * 112 * k, R * Math.cos(a) - R, 0, d * 42, 0, 1, clamp(1.5 - Math.abs(d) * .16, 0, 1), clamp(1 - Math.abs(d) * .26, .22, 1)];
    }
  };
  const scaleK = () => (parseFloat(getComputedStyle(sticky).getPropertyValue('--cw')) || 320) / 320;

  const applyCard = (card, v) => {
    card.style.transform = `translate3d(${v[0].toFixed(2)}px,${v[1].toFixed(2)}px,${v[2].toFixed(2)}px) rotateX(${v[3].toFixed(2)}deg) rotateY(${v[4].toFixed(2)}deg) rotateZ(${v[5].toFixed(2)}deg) scale(${v[6].toFixed(3)})`;
    card.style.opacity = v[7].toFixed(3);
    card.style.pointerEvents = v[7] < .2 ? 'none' : 'auto';
    card.firstElementChild.nextElementSibling; // (art + shade are children; shade is last)
    card.lastElementChild.style.opacity = (1 - v[8]).toFixed(3);
  };

  const layoutScroll = () => {
    unit = window.innerHeight * 0.55;
    scrollEl.style.height = `${window.innerHeight + Math.max(visible.length - 1, 0) * unit}px`;
    top = scrollEl.getBoundingClientRect().top + window.scrollY;
  };
  const targetP = () => clamp((window.scrollY - top) / unit, 0, Math.max(visible.length - 1, 0));
  const scrollTo = (i, behavior) => window.scrollTo({ top: top + clamp(i, 0, visible.length - 1) * unit, behavior: behavior || scrollBehavior() });

  const updateInfo = idx => {
    const card = visible[idx]; if (!card) return;
    const d = projectData[card.dataset.project];
    info.classList.add('swap'); ghost.classList.add('swap');
    window.setTimeout(() => {
      $('#p3-idx').textContent = pad(allCards.indexOf(card) + 1);
      $('#p3-type').textContent = d.category;
      $('#p3-title').textContent = d.title;
      $('#p3-desc').textContent = d.short;
      $('#p3-tags').replaceChildren(...d.tech.slice(0, 5).map(t => Object.assign(document.createElement('span'), { textContent: t })));
      ghost.textContent = d.title;
      void info.offsetWidth;
      info.classList.remove('swap'); ghost.classList.remove('swap');
    }, reduceMotion ? 0 : 140);
  };

  const frame = now => {
    if (!running) return;
    const dt = Math.min(now - lastT || 16, 50); lastT = now;
    ps += (targetP() - ps) * (reduceMotion ? 1 : 1 - Math.exp(-dt / 105));
    if (Math.abs(targetP() - ps) < .0005) ps = targetP();
    if (blendT < 1) blendT = Math.min(1, blendT + dt / (reduceMotion ? 1 : 850));
    const e = blendT < .5 ? 4 * blendT ** 3 : 1 - ((-2 * blendT + 2) ** 3) / 2;
    const k = scaleK(), fn = layouts[mode];
    const N = visible.length;
    visible.forEach((card, i) => {
      // Layouts wrap around, so the arrangement is balanced around the focused card at every position
      let dd = i - ps;
      if (N > 2) dd = ((((dd + N / 2) % N) + N) % N) - N / 2;
      const t = fn(dd, k).slice();
      if (N > 2) t[7] *= clamp((N / 2 - Math.abs(dd)) / .7, 0, 1);
      const v = blendT < 1 && from[i] ? t.map((val, n) => from[i][n] + (val - from[i][n]) * e) : t;
      cur[i] = v;
      applyCard(card, v);
    });
    px += (pointerX - px) * .07; py += (pointerY - py) * .07;
    world.style.transform = reduceMotion ? 'none' : `rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg)`;

    const idx = clamp(Math.round(ps), 0, visible.length - 1);
    if (idx !== activeIdx) {
      activeIdx = idx;
      visible.forEach((c, i) => c.classList.toggle('is-active', i === idx));
      visible.forEach((c, i) => c.setAttribute('tabindex', i === idx ? '0' : '-1'));
      $('#p3-current').textContent = pad(idx + 1);
      $('#p3-fill').style.width = `${((idx + 1) / visible.length) * 100}%`;
      updateInfo(idx);
    }
    requestAnimationFrame(frame);
  };
  const start = () => { if (running) return; running = true; lastT = performance.now(); requestAnimationFrame(frame); };
  const stop = () => { running = false; };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(en => en.isIntersecting ? start() : stop()), { rootMargin: '200px 0px' }).observe(scrollEl);
  } else start();

  // Filters
  // Project filters must stay scoped to the Projects reel; certificate issuer buttons use the same visual class.
  const filterButtons = $$('.p3-top .filter-button[data-filter]');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const f = button.dataset.filter;
    filterButtons.forEach(b => { const on = b === button; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    from = cur.map(v => v.slice()); blendT = 0;
    allCards.forEach(c => c.classList.toggle('is-hidden', !(f === 'all' || c.dataset.categories.split(' ').includes(f))));
    visible = allCards.filter(c => !c.classList.contains('is-hidden'));
    from = visible.map((c, i) => cur[i] ? cur[i].slice() : layouts[mode](i, scaleK()));
    layoutScroll();
    $('#p3-total').textContent = pad(visible.length);
    $('#p3-total-btn').textContent = pad(visible.length);
    activeIdx = -1; ps = 0;
    window.scrollTo({ top, behavior: 'auto' });
  }));

  // Arrows, keyboard, click, drag
  $('#p3-prev').addEventListener('click', () => scrollTo(Math.round(ps) - 1));
  $('#p3-next').addEventListener('click', () => scrollTo(Math.round(ps) + 1));
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); scrollTo(Math.round(ps) + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); scrollTo(Math.round(ps) - 1); }
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('p3-card')) { e.preventDefault(); openProject(e.target); }
  });
  let drag = false, moved = false, lastX = 0, downX = 0;
  viewport.addEventListener('pointerdown', e => { if (e.button) return; drag = true; moved = false; lastX = downX = e.clientX; });
  window.addEventListener('pointermove', e => {
    const r = viewport.getBoundingClientRect();
    pointerX = clamp((e.clientX - r.left) / r.width - .5, -.5, .5) * 2;
    pointerY = clamp((e.clientY - r.top) / r.height - .5, -.5, .5) * 2;
    if (!drag) return;
    if (!moved && Math.abs(e.clientX - downX) > 6) { moved = true; viewport.classList.add('is-dragging'); }
    if (moved) { window.scrollBy({ top: -(e.clientX - lastX) * (unit / 280), behavior: 'auto' }); lastX = e.clientX; }
  });
  const endDrag = () => { drag = false; viewport.classList.remove('is-dragging'); window.setTimeout(() => { moved = false; }, 0); };
  window.addEventListener('pointerup', endDrag); window.addEventListener('pointercancel', endDrag);
  allCards.forEach(card => card.addEventListener('click', () => {
    if (moved) return;
    const i = visible.indexOf(card);
    if (Math.abs(i - ps) < .5) openProject(card); else scrollTo(i);
  }));
  $('#p3-open').addEventListener('click', () => { const c = visible[clamp(Math.round(ps), 0, visible.length - 1)]; if (c) openProject(c); });

  // Settle onto the nearest project when scrolling stops
  let settleTimer;
  window.addEventListener('scroll', () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if ($('#project-dialog').open || drag) return;
      const p = (window.scrollY - top) / unit;
      if (p < -0.02 || p > visible.length - 1 + 0.02) return;
      const n = Math.round(p);
      if (Math.abs(p - n) > .04) scrollTo(n);
    }, 160);
  }, { passive: true });

  window.addEventListener('resize', () => { layoutScroll(); onScroll(); });
  layoutScroll();
  window.addEventListener('load', layoutScroll);
  // Fonts / images can shift layout; re-measure shortly after load.
  window.setTimeout(layoutScroll, 600);
  visible.forEach((c, i) => { cur[i] = layouts.helix(i, scaleK()); applyCard(c, cur[i]); });

  /* ───────── Project detail dialog ───────── */
  const dialog = $('#project-dialog');
  const dScroll = $('#dialog-scroll');
  let lastFocus = null;
  function openProject(card) {
    const p = projectData[card.dataset.project]; if (!p) return;
    lastFocus = card;
    $('#dialog-title').textContent = p.title;
    $('#dialog-category').textContent = p.category;
    $('#dialog-lede').textContent = p.lede;
    $('#dialog-count').textContent = `PROJECT ${pad(allCards.indexOf(card) + 1)} / ${pad(allCards.length)}`;
    $('#dialog-tags').replaceChildren(...p.tech.map(t => Object.assign(document.createElement('span'), { textContent: t })));
    $('#dialog-body').replaceChildren(...p.sections.map(sec => {
      const wrap = document.createElement('section'); wrap.className = 'd-section';
      const h = document.createElement('h3'); h.textContent = sec.h;
      const box = document.createElement('div');
      (sec.p || []).forEach(t => { const el = document.createElement('p'); el.textContent = t; box.append(el); });
      if (sec.ul) { const ul = document.createElement('ul'); sec.ul.forEach(t => { const li = document.createElement('li'); li.innerHTML = t; ul.append(li); }); box.append(ul); }
      wrap.append(h, box); return wrap;
    }));
    const actions = $('#dialog-actions'); actions.replaceChildren();
    if (p.repo) actions.append(Object.assign(document.createElement('a'), { href: p.repo, target: '_blank', rel: 'noopener', textContent: 'View source on GitHub ↗' }));
    actions.append(Object.assign(document.createElement('a'), { href: 'mailto:askarisbeity@gmail.com?subject=' + encodeURIComponent('Question about ' + p.title), textContent: 'Ask me about this project ↗' }));
    dScroll.scrollTop = 0;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }
  const closeDialog = () => (dialog.close ? dialog.close() : dialog.removeAttribute('open'));
  $('#dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
  dialog.addEventListener('close', () => { if (lastFocus) lastFocus.focus({ preventScroll: true }); });

  /* ───────── Reveal + timeline ───────── */
  const revealTargets = $$('.section-heading, .case-layout, .about-panel, .skills-panel, .about-side, .skill-group, .contact-intro, .contact-form-panel, .experience-item, .certificate-item, .process-step');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const ro = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); ro.unobserve(en.target); } }), { threshold: .08, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(t => { t.classList.add('reveal'); ro.observe(t); });
  }
  const journey = $('.journey-track'), journeyFill = $('#journey-line-fill'), journeyItems = $$('.journey-item');
  const updateJourney = () => {
    if (!journey) return;
    const rect = journey.getBoundingClientRect();
    journeyFill.style.height = `${clamp(window.innerHeight * .58 - rect.top, 0, journey.offsetHeight)}px`;
    journeyItems.forEach(it => { if (it.getBoundingClientRect().top < window.innerHeight * .78) it.classList.add('is-visible'); });
  };
  window.addEventListener('scroll', updateJourney, { passive: true });
  updateJourney();


  /* ───────── Hero: pointer parallax, spotlight, count-up ───────── */
  const hero = $('.hero');
  const heroVisual = $('.hero-visual');
  const heroSpot = $('.hero-spot');
  if (hero && !reduceMotion) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      heroVisual.style.setProperty('--px', ((x - .5) * 2).toFixed(3));
      heroVisual.style.setProperty('--py', ((y - .5) * 2).toFixed(3));
      heroSpot.style.setProperty('--sx', `${(x * 100).toFixed(1)}%`);
      heroSpot.style.setProperty('--sy', `${(y * 100).toFixed(1)}%`);
    });
    hero.addEventListener('pointerleave', () => { heroVisual.style.setProperty('--px', 0); heroVisual.style.setProperty('--py', 0); });
  }
  const counters = $$('[data-count]');
  const runCount = el => {
    const end = Number(el.dataset.count), t0 = performance.now(), dur = reduceMotion ? 1 : 1400;
    const step = now => {
      const p = clamp((now - t0) / dur, 0, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = pad(v);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  window.setTimeout(() => counters.forEach(runCount), 500);

  /* ───────── Awards: filter, spotlight, certificate viewer ───────── */
  const certCards = $$('.cert-card');
  const certButtons = $$('[data-cert-filter]');
  certButtons.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.certFilter;
    certButtons.forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    $('#cert-grid').classList.toggle('is-filtered', f !== 'all');
    let n = 0;
    certCards.forEach(c => {
      const issuer = (c.dataset.issuer || '').trim().toLowerCase();
      const show = f === 'all' || issuer === String(f).trim().toLowerCase();
      c.classList.toggle('is-hidden', !show);
      c.hidden = !show;
      if (show) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; c.style.animationDelay = `${n++ * 45}ms`; }
    });
  }));
  certCards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
  const certDialog = $('#cert-dialog');
  let certLast = null;
  const openCert = card => {
    certLast = card;
    $('#cert-dialog-img').src = card.dataset.img;
    $('#cert-dialog-img').alt = `${card.dataset.title} certificate`;
    $('#cert-dialog-title').textContent = card.dataset.title;
    $('#cert-dialog-meta').textContent = `${card.dataset.org} · ${card.dataset.date}`.toUpperCase();
    if (typeof certDialog.showModal === 'function') certDialog.showModal(); else certDialog.setAttribute('open', '');
  };
  certCards.forEach(card => {
    card.addEventListener('click', () => openCert(card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCert(card); } });
  });
  const closeCert = () => (certDialog.close ? certDialog.close() : certDialog.removeAttribute('open'));
  $('#cert-dialog-close').addEventListener('click', closeCert);
  certDialog.addEventListener('click', e => { if (e.target === certDialog) closeCert(); });
  certDialog.addEventListener('close', () => { if (certLast) certLast.focus({ preventScroll: true }); });

  /* ───────── Contact form (EmailJS) ───────── */
  const EMAILJS_PUBLIC_KEY = 'W2rdOmeOMOQwCwniL';
  const EMAILJS_SERVICE_ID = 'service_5hjr19m';
  const EMAILJS_TEMPLATE_ID = 'template_i4pr5fn';
  const form = $('#contact-form'), feedback = $('#formFeedback');
  if (window.emailjs) { try { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch (e) { console.warn('EmailJS init failed', e); } }
  const setFeedback = (text, kind) => { feedback.textContent = text; feedback.className = 'form-feedback' + (kind ? ' ' + kind : ''); };
  // Uses the SDK; if it was blocked (ad blocker / CDN down) it falls back to EmailJS's REST endpoint, so the form still works.
  async function sendMessage(values) {
    if (window.emailjs) return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, values, { publicKey: EMAILJS_PUBLIC_KEY });
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service_id: EMAILJS_SERVICE_ID, template_id: EMAILJS_TEMPLATE_ID, user_id: EMAILJS_PUBLIC_KEY, template_params: values }) });
    if (!res.ok) throw new Error(await res.text());
    return res;
  }
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const fields = $$('input, textarea', form);
    fields.forEach(f => f.classList.remove('invalid'));
    const bad = fields.find(f => (f.required && !f.value.trim()) || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value.trim())));
    if (bad) { bad.classList.add('invalid'); bad.focus(); setFeedback(bad.type === 'email' ? 'Please enter a valid email address.' : 'Please fill in the highlighted field.', 'err'); return; }
    const data = new FormData(form);
    const values = { name: data.get('name').trim(), email: data.get('email').trim(), phone: (data.get('phone') || '').trim() || 'Not provided', message: data.get('message').trim(), from_name: data.get('name').trim(), reply_to: data.get('email').trim(), title: 'Portfolio contact form' };
    const submit = $('[type="submit"]', form);
    submit.disabled = true; submit.innerHTML = 'Sending… <span>↗</span>'; setFeedback('', '');
    try { await sendMessage(values); setFeedback('Message sent — thanks for reaching out. I\u2019ll be in touch soon.', 'ok'); form.reset(); }
    catch (error) { console.error('EmailJS error:', error); setFeedback('Your message could not be sent right now. Please email askarisbeity@gmail.com directly.', 'err'); }
    finally { submit.disabled = false; submit.innerHTML = 'Send message <span>↗</span>'; }
  });

  $('#year').textContent = new Date().getFullYear();
})();
