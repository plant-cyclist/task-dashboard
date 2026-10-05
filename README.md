# LabTasks - Laboratory Task & Media Preparation Dashboard

A collaborative, real-time lab task dashboard built with React, Vite, Tailwind CSS, and Lucide icons. Designed for biology, chemistry, and research labs to coordinate media preparation, buffer stocks, common reagent needs, equipment maintenance, and fair duty distribution.

## ✨ Features

- **Active Needs Board**: Track pending media, solutions, and consumables with priority tags (`urgent`, `medium`, `low`) and due dates (`overdue`, `due today`, `upcoming`).
- **"Task for" Assignment & Sorting**: Assign tasks to specific lab members or keep them open for "Anyone". Sort board items by due date, priority, recently added, or "Task for".
- **One-Click Completion ("I did this")**: Quick sign-off modal with member selection, optional batch volume, and custom notes.
- **Fair Distribution & Contribution Log**: Visual analytics chart showing completed task count and percentage breakdown across team members for equitable workload distribution.
- **Admin & Quick Templates**: PIN-protected admin area (`default PIN: 1234`) with customizable recipe templates, roster management, PIN management, and JSON database export/import.
- **Offline & Multi-Tab Persistence**: All data is automatically persisted to `localStorage` in real-time with cross-tab synchronization.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or newer)
- npm or yarn

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lab-tasks.git
   cd lab-tasks
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```
   The production-ready output will be in the `dist/` directory.

## 🌐 Free Hosting & Deployment (Share with Team)

### Option 1: GitHub Pages (Automated via GitHub Actions)
This repository includes a ready-to-go GitHub Actions workflow (`.github/workflows/deploy.yml`).
1. Go to your repository on **GitHub** > **Settings** > **Pages** (in the left menu).
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Every push to the `main` branch will automatically build and publish your app to:
   `https://<YOUR-USERNAME>.github.io/<REPO-NAME>/`

### Option 2: Vercel or Netlify (1-Click)
- **[Vercel](https://vercel.com)**: Import your GitHub repository, keep default settings (`Vite`), and click Deploy.
- **[Netlify](https://netlify.com)**: Connect to GitHub, set build command to `npm run build` and publish directory to `dist`.

## 📄 License
MIT License
