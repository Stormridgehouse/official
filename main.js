/* ==========================================================================
   STORMRIDGE HOUSE PUBLISHING - SPA ROUTER & INTERACTIVE FEATURES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. SPA Page Router ───────────────────────────────────────────
    let currentPage = 'page-home';
    const navbar = document.querySelector('.luxury-navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    function navigateTo(pageId) {
        // Hide all pages
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        // Show target
        const target = document.getElementById(pageId);
        if (target) {
            target.classList.add('active');
            currentPage = pageId;
        }
        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) link.classList.add('active');
        });
        // Navbar style: transparent on home, solid on others
        if (pageId === 'page-home') {
            if (window.scrollY <= 50) navbar.classList.remove('scrolled');
        } else {
            navbar.classList.add('scrolled');
        }
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Close mobile menu
        if (navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
        // Re-trigger scroll reveal for new page
        triggerScrollReveal();
    }

    function handleRoute() {
        const hash = window.location.hash.replace('#', '') || 'home';
        navigateTo('page-' + hash);
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);

    // Intercept all navigation clicks with data-page attribute
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-page]');
        if (link) {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            const hash = pageId.replace('page-', '');
            window.location.hash = hash;
        }
    });

    // ─── 2. Cinematic Loader ──────────────────────────────────────────
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.add('loaded');
            handleRoute(); // Set initial page after load
            triggerScrollReveal();
        }, 2200);
    });

    // ─── 3. Cursor Glow with Inertia ──────────────────────────────────
    const cursorGlow = document.querySelector('.cursor-glow');
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (cursorGlow.style.opacity !== '1') cursorGlow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });

    function updateCursorGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(updateCursorGlow);
    }
    updateCursorGlow();

    // ─── 4. Navbar Scroll Effect ──────────────────────────────────────
    window.addEventListener('scroll', () => {
        if (currentPage === 'page-home') {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // ─── 5. Mobile Menu Toggle ────────────────────────────────────────
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // ─── 6. Canvas Fog & Particles ────────────────────────────────────
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w; this.y = h + Math.random() * 100;
                this.size = Math.random() * 2.5 + 0.5; this.speedY = Math.random() * 0.6 + 0.2;
                this.speedX = Math.sin(Math.random() * 2) * 0.3; this.alpha = Math.random() * 0.4 + 0.1;
                this.decay = Math.random() * 0.001 + 0.0005;
                this.color = Math.random() > 0.65 ? '192,131,42' : '250,250,248';
            }
            update() { this.y -= this.speedY; this.x += this.speedX; this.alpha -= this.decay; if (this.alpha <= 0 || this.y < -10) this.reset(); }
            draw() { ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(${this.color},${this.alpha})`; ctx.shadowBlur = this.size * 2; ctx.shadowColor = `rgba(${this.color},0.5)`; ctx.fill(); ctx.restore(); }
        }

        class MistPuff {
            constructor() { this.reset(); this.y = Math.random() * h; }
            reset() {
                this.x = -200 - Math.random() * 300; this.y = Math.random() * h;
                this.radius = Math.random() * 150 + 100; this.speedX = Math.random() * 0.4 + 0.1;
                this.alpha = Math.random() * 0.15 + 0.05; this.angle = Math.random() * Math.PI * 2;
                this.waveSpeed = Math.random() * 0.005 + 0.002;
            }
            update() { this.x += this.speedX; this.angle += this.waveSpeed; this.y += Math.sin(this.angle) * 0.2; if (this.x > w + this.radius) this.reset(); }
            draw() {
                ctx.save(); let g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                g.addColorStop(0, `rgba(27,58,92,${this.alpha})`); g.addColorStop(0.5, `rgba(13,27,42,${this.alpha * 0.4})`); g.addColorStop(1, 'rgba(13,27,42,0)');
                ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.restore();
            }
        }

        const particles = Array.from({ length: 60 }, () => new Particle());
        const mists = Array.from({ length: 10 }, () => new MistPuff());

        function animateCanvas() {
            ctx.fillStyle = 'rgba(13,27,42,0.2)'; ctx.fillRect(0, 0, w, h);
            mists.forEach(m => { m.update(); m.draw(); });
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    // ─── 7. Real-Time Book Search ─────────────────────────────────────
    const searchInput = document.getElementById('library-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.book-card').forEach(card => {
                const title = card.querySelector('.book-card-title').textContent.toLowerCase();
                const author = card.querySelector('.book-card-author').textContent.toLowerCase();
                if (title.includes(q) || author.includes(q)) {
                    card.style.display = 'flex';
                    setTimeout(() => card.classList.add('revealed'), 50);
                } else {
                    card.classList.remove('revealed'); card.style.display = 'none';
                }
            });
        });
    }

    // ─── 8. Scroll Reveal Observer ────────────────────────────────────
    function triggerScrollReveal() {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => { entry.target.classList.add('revealed', 'active'); }, i * 80);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        // Only observe elements inside the active page + footer
        const activePage = document.querySelector('.page-section.active');
        if (activePage) {
            activePage.querySelectorAll('.fade-reveal, .book-card').forEach(el => {
                el.classList.remove('revealed', 'active'); // Reset for re-entry
                observer.observe(el);
            });
        }
    }

    // ─── 9. Labyrinth Maze Game ───────────────────────────────────────
    const mazeData = {
        entrance: { title: "The Iron Portal Gates", desc: "You stand before the towering, black iron gates of the Stormridge Vaults. Ivy clutches the stone work. A scent of aged leather and wax drifts from within.", options: [{ text: "Enter the Whispering Gallery", next: "gallery" }, { text: "Descend to the Crypt of Lost Scripts", next: "crypt" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
        gallery: { title: "The Whispering Gallery", desc: "A circular room whose shelves climb infinitely into shadows. Footsteps echo like soft murmurs. An old, forgotten script whispers from the lower shelves.", options: [{ text: "Climb the golden spiral stairs", next: "observatory" }, { text: "Follow the low whispering sound", next: "sanctuary" }, { text: "Return to the iron gates", next: "entrance" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
        crypt: { title: "Crypt of Lost Manuscripts", desc: "Cold and atmospheric. Stacks of leather binders reside on stone slabs. At the center sits a locked copper strongbox etched with gold leaf runes.", options: [{ text: "Inspect the strongbox locks", next: "chest" }, { text: "Walk into the Mirror Corridor", next: "mirrors" }, { text: "Ascend back to the iron gates", next: "entrance" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>' },
        observatory: { title: "The Astrolabe Observatory", desc: "A soaring domed ceiling of glass reveals constellations. Telescopes and ancient scrolls lie about. On a center dais, a glowing ledger charts the alignment of stars.", options: [{ text: "Read the celestial alignments", next: "reveal_celestial" }, { text: "Walk back to the gallery", next: "gallery" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>' },
        sanctuary: { title: "The Archival Sanctuary", desc: "Candlelight flickers against dark oak shelves. A small hearth fire burns. Resting on an easel is a velvet-bound book titled 'The Crimson Cartographer'.", options: [{ text: "Open the velvet-bound book", next: "reveal_crimson" }, { text: "Walk back to the gallery", next: "gallery" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3"/></svg>' },
        mirrors: { title: "The Mirror Corridor", desc: "An optical labyrinth of tall mirrors. Your reflections are infinite, holding ghosts of books in their hands.", options: [{ text: "Walk towards a golden glowing reflection", next: "reveal_mirror" }, { text: "Turn back to the crypt", next: "crypt" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' },
        chest: { title: "The Runed Copper Strongbox", desc: "You slide the brass dials. Inside, cushioned on black silk, is a handwritten folio titled 'The Cartographer\\'s Shadow' by Charles Stormridge.", options: [{ text: "Claim this manuscript's secrets", next: "reveal_shadow" }, { text: "Go back to the Crypt", next: "crypt" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
        reveal_celestial: { title: "Secret Unlocked", desc: "The astrolabe unlocks a hidden vault drawer: 'STARS OF THE NORTH' — You have successfully navigated the cosmic maze room!", options: [{ text: "Return to the Entrance Gates", next: "entrance" }, { text: "Go to the Library", next: "library_scroll" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>' },
        reveal_crimson: { title: "Secret Unlocked", desc: "You turn the heavy pages. A card drops out: 'Stormridge Code: ARCHIVE_9'. You have beaten the Labyrinth!", options: [{ text: "Start Maze Over", next: "entrance" }, { text: "Explore the Library", next: "library_scroll" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
        reveal_mirror: { title: "Secret Unlocked", desc: "You touch the glass. It ripples. The mirror reveals: 'Stories are keys to vaults we carry inside.' You are rewarded with the secret ebook: 'The Infinite Library'!", options: [{ text: "Return to the Entrance Gates", next: "entrance" }, { text: "View Books Shelf", next: "library_scroll" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' },
        reveal_shadow: { title: "Secret Unlocked", desc: "You lift the folio. The runes click shut. The code 'STORMRIDGE_1892' is carved on the inner lid. Outstanding exploration!", options: [{ text: "Return to Gates", next: "entrance" }, { text: "Go to Main Library", next: "library_scroll" }], icon: '<svg class="labyrinth-icon" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' }
    };

    const mazeTitle = document.getElementById('maze-title');
    const mazeDesc = document.getElementById('maze-desc');
    const mazeOptions = document.getElementById('maze-options');
    const mazeIconContainer = document.getElementById('maze-icon-container');

    function updateMazeRoom(roomKey) {
        if (roomKey === 'library_scroll') {
            window.location.hash = 'library';
            setTimeout(() => updateMazeRoom('entrance'), 500);
            return;
        }
        const room = mazeData[roomKey];
        if (!room) return;
        const card = document.querySelector('.labyrinth-card');
        card.style.opacity = '0'; card.style.transform = 'translateY(15px)';
        setTimeout(() => {
            mazeTitle.textContent = room.title;
            mazeDesc.textContent = room.desc;
            mazeIconContainer.innerHTML = room.icon;
            mazeOptions.innerHTML = '';
            room.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'labyrinth-btn'; btn.textContent = opt.text;
                btn.addEventListener('click', () => updateMazeRoom(opt.next));
                mazeOptions.appendChild(btn);
            });
            card.style.opacity = '1'; card.style.transform = 'translateY(0)';
        }, 300);
    }

    if (mazeTitle) updateMazeRoom('entrance');

    // ─── 10. Newsletter Form ──────────────────────────────────────────
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('.newsletter-input');
            if (input.value.trim()) {
                const orig = input.placeholder; input.value = '';
                input.placeholder = "Thank you for subscribing.";
                input.style.borderColor = 'var(--color-accent)';
                setTimeout(() => { input.placeholder = orig; input.style.borderColor = ''; }, 4000);
            }
        });
    }
});
