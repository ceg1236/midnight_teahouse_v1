# Onboarding: Midnight Teahouse

A step-by-step guide for new collaborators. No prior coding experience required.

---

## Part 1: You (repo owner) add her as a collaborator

1. Go to your repo on GitHub: `https://github.com/ceg1236/midnight_teahouse_v1`
2. Click **Settings** → **Collaborators** (or **Collaborators and teams**)
3. Click **Add people**
4. Enter her GitHub username or email
5. She’ll get an invite email; she should accept it

---

## Part 2: She sets up her machine

### 1. Install Node.js (if needed)

- Go to [nodejs.org](https://nodejs.org)
- Download the **LTS** version
- Run the installer and follow the prompts
- Restart Cursor (or her terminal) after installing

To confirm it’s installed:

```bash
node --version
```

You should see something like `v20.x.x` or `v22.x.x`.

### 2. Install pnpm

In a terminal:

```bash
npm install -g pnpm
```

To confirm:

```bash
pnpm --version
```

### 3. Configure Git (first time only)

```bash
git config --global user.name "Her Full Name"
git config --global user.email "her-email@example.com"
```

Use the same email as her GitHub account.

---

## Part 3: Clone the project and run it

### 1. Clone the repo

In Cursor (or terminal):

- **Option A – Cursor:** File → Open Folder → Clone from Git → paste:  
  `https://github.com/ceg1236/midnight_teahouse_v1.git`
- **Option B – Terminal:**  
  `cd` to where she wants the project, then:

```bash
git clone https://github.com/ceg1236/midnight_teahouse_v1.git
cd midnight_teahouse_v1
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Copy the env file (for local dev)

```bash
cp .env.example .env.local
```

She doesn’t need to fill in real values for copy edits. The site may show some errors for Stripe/checkout, but the main page and content should load.

### 4. Run the dev server

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in a browser. She should see the site.

---

## Part 4: Where to edit

| What to change | File to edit |
|----------------|--------------|
| Welcome paragraph (main page) | `content/event-invite.md` |
| Dates and tier names/prices | `content/event-invite.config.ts` |
| “Midnight Teahouse” modal text | `content/title-modal.md` |
| Tea / Candle / Kora / Table modal text | `content/modals/tea.md`, `candle.md`, `kora.md`, `table.md` |
| Layout, styling, fonts | `app/components/*.tsx`, `app/global.css` |

The `content/` folder is for copy. Layout and CSS live in `app/components/` and `app/global.css`. See `content/README.md` for more details.

---

## Part 5: Making and sharing changes (use branches + PRs)

Because layout and CSS changes can break the site, **always use a branch and pull request.** That lets the repo owner review before changes go live.

### Step-by-step

1. **Before editing**, create a branch and make sure you're on main with latest changes:

```bash
git checkout main
git pull
git checkout -b update-hero-layout
```

2. Edit your files and save.

3. **Before pushing**, run a build to catch errors:

```bash
pnpm build
```

If it fails, fix the errors before pushing.

4. Commit and push:

```bash
git add .
git commit -m "Update hero layout and spacing"
git push -u origin update-hero-layout
```

5. On GitHub, open the repo. You should see a banner: **“Compare & pull request”.** Click it, add a brief description, and submit.

6. The repo owner will review and merge. Once merged, you can delete the branch and switch back to main:

```bash
git checkout main
git pull
```

---

## Part 6: Staying in sync

Before starting new work, always pull the latest:

```bash
git checkout main
git pull
```

Then create a new branch for your changes. If you see merge conflicts, ask the repo owner for help.

---

## Quick reference

| Task | Command |
|------|---------|
| Start the dev server | `pnpm dev` |
| Run build (check for errors) | `pnpm build` |
| Pull latest changes | `git checkout main` then `git pull` |
| Create a new branch | `git checkout -b your-branch-name` |
| Stage all changes | `git add .` |
| Commit | `git commit -m "Brief description"` |
| Push your branch | `git push -u origin your-branch-name` |

---

## If something breaks

- **“Command not found”** → Node or pnpm may not be installed or not in PATH; restart the terminal
- **Port 3000 in use** → Another app is using it; close it or run `pnpm dev --port 3001`
- **Merge conflict** → Ask you to help resolve it
- **Permission denied on push** → Confirm she accepted the collaborator invite and is pushing to the right repo
