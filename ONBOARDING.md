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

## Part 4: Where to edit copy and content

| What to change | File to edit |
|----------------|--------------|
| Welcome paragraph (main page) | `content/event-invite.md` |
| Dates and tier names/prices | `content/event-invite.config.ts` |
| “Midnight Teahouse” modal text | `content/title-modal.md` |
| Tea / Candle / Kora / Table modal text | `content/modals/tea.md`, `candle.md`, `kora.md`, `table.md` |

For copy edits, she should focus on the `content/` folder. The `content/README.md` file has more details.

---

## Part 5: Making and sharing changes

### Simple workflow (direct to main)

1. Edit a file (e.g. `content/event-invite.md`)
2. Save
3. In Cursor’s terminal (or Source Control panel):

```bash
git add content/event-invite.md
git commit -m "Update welcome paragraph"
git push
```

### Safer workflow (branch + pull request)

1. Create a branch before editing:

```bash
git checkout -b update-welcome-copy
```

2. Edit the file(s) and save
3. Commit and push:

```bash
git add .
git commit -m "Update welcome paragraph"
git push -u origin update-welcome-copy
```

4. On GitHub, open the repo and click **Compare & pull request** (or create a PR from the branch)
5. You review and merge

---

## Part 6: Staying in sync

Before starting new work, pull the latest changes:

```bash
git pull
```

If she sees merge conflicts, she can ask you for help.

---

## Quick reference

| Task | Command |
|------|---------|
| Start the dev server | `pnpm dev` |
| Pull latest changes | `git pull` |
| Stage all changes | `git add .` |
| Commit | `git commit -m "Brief description"` |
| Push | `git push` |

---

## If something breaks

- **“Command not found”** → Node or pnpm may not be installed or not in PATH; restart the terminal
- **Port 3000 in use** → Another app is using it; close it or run `pnpm dev --port 3001`
- **Merge conflict** → Ask you to help resolve it
- **Permission denied on push** → Confirm she accepted the collaborator invite and is pushing to the right repo
