# Waypoint 🧭

A modern, gamified career tracking dashboard built with pure JavaScript.

A career development dashboard for students, built around a simple idea: your career is a journey, and you should be able to see the whole trail. Waypoint tracks the skills you're building, the applications you're sending out, and the goals you're working toward, all in one place.

No backend, lightweight authentication using browser storage, and no external dependencies beyond a browser.

**Live Demo:** https://deepthivinayagam.github.io/waypoint/

---

## Why this exists

Students juggling internship applications, skill-building, and long-term goals usually end up with that information scattered across notes apps, spreadsheets, and sticky notes. Waypoint pulls it into a single dashboard so you can see, at a glance, what's tracked, what's coming up, and how far you've come.

---

## Features

**Dashboard**

* At-a-glance stats: skills tracked, active applications, goals in progress, deadlines this week
* A visual "trail" of your goals as progress rings, plotted along a path
* A combined, sorted list of upcoming deadlines pulled from both applications and goals

**Skills**

* Log technical skills, soft skills, certifications, languages, or tools
* Track progress with a slider (0–100%), with an optional target date and notes
* Gamified tier system (Spark → Apex) based on progress
* Visual "tier unlock" moments to motivate users

**Applications**

* Track company, role, status (Wishlist → Applied → Interview → Offer/Rejected), application date, next deadline, link, and notes
* Filter by status with one click
* Update status inline as things move forward — no need to delete and re-add

**Goals**

* Set goals with a category, target date, and notes
* Track progress with a live slider, reflected immediately on the dashboard trail

**Practice & Journal**

* Track coding practice platforms (LeetCode, CodeChef, etc.)
* Maintain a personal journal to log progress and reflections

All data is saved to your browser's `localStorage`, so it persists between visits without any server.

---

## Tech stack

* HTML5
* CSS3 (custom properties, flexbox, CSS grid, animations)
* Vanilla JavaScript (ES6+, no frameworks)
* Browser Storage (LocalStorage & SessionStorage)
* Google Fonts (Orbitron, Inter, JetBrains Mono)

---

## Getting started

No build tools or installation needed.

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/waypoint.git
   cd waypoint
   ```

2. Open `index.html` in your browser.

To run the project locally in a simple way (so you can open it in your browser and even test it on other devices on the same Wi-Fi):

```bash
python3 -m http.server 8000
```

This command starts a small local server on your computer.

After running it, open your browser and go to:
`http://localhost:8000`

This will load your project just like a website.

---

## Project structure

```
waypoint/
├── index.html      # Main UI and layout
├── style.css       # Styling and animations
├── script.js       # Logic, state management, and storage
└── README.md
```

---

## Deployment

This is a static site, so GitHub Pages works well:

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to your main branch and root folder
4. Your app will be live at:
   https://your-username.github.io/waypoint/

---

## License

MIT — free to use, modify, and share.
