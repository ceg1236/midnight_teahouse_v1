# Development Workflow

## Branching

- **main** = Production (Vercel deploys from here). Nothing merges to main without a PR.
- **carl-n-team** = Carl's working branch. Work here, push, open PR to merge into main.
- **design-v1** = Preserved branch with the icon-animation design. Use as reference or fallback.
- To spin off a new design branch: `git checkout -b design-<name>` from main, push with `git push -u origin design-<name>`.

### Collaborator workflow (layout, CSS, copy)

Collaborators should **always use branches and pull requests** so changes can be reviewed before going live:

1. `git checkout main` → `git pull`
2. `git checkout -b descriptive-branch-name`
3. Make changes, run `pnpm test` and `pnpm build` to verify
4. `git add .` → `git commit -m "message"`
5. **Before pushing:** sync with `main` (see Pre-push checklist below), then `git push -u origin descriptive-branch-name`
6. Open a PR on GitHub; owner reviews and merges

## Pre-push checklist

**Before every push** (especially on feature branches open as PRs):

1. **Fetch and sync with `main`**
   - `git fetch origin main`
   - `git merge origin/main` (or rebase if you prefer a linear history)
   - Resolve any merge conflicts; prefer the feature branch for feature-specific work unless `main` has an unrelated fix you need
2. **Verify**
   - `pnpm test`
   - `pnpm build`
3. **Commit** the merge (if any) with a clear message
4. **Push**
   - `git push` (or `git push -u origin <branch-name>`)

Skipping step 1 is the most common reason a PR cannot auto-merge (conflicts with `main`).

## Commit Workflow

- **Commit after every series of changes**: After completing a logical set of changes (e.g., styling updates, feature additions, bug fixes), create a commit.
- **Commit messages**: Keep them simple but descriptive of the main change.
  - Format: Brief description of what was changed
  - Do not add "Co-authored-by: Cursor <cursoragent@cursor.com>" or equivalent AI branding content
  - DO NOT ADD A --trailer on commits
  - Examples:
    - "Update header styling and add custom fonts"
    - "Add hover animations to navigation"
    - "Fix font loading issue"
- **Push after committing**: After creating a commit, sync with `main` (Pre-push checklist), then push.
  - Use: `git push` (or `git push origin <branch-name>` if needed)
- **Standard flow**: `git add <files>` → `git commit -m "message"` → **merge `origin/main`** → `pnpm test` → `pnpm build` → `git push`

## Guidelines

### Code Style
- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Keep components modular and reusable

### Styling
- Use Tailwind CSS classes
- Custom colors should use hex values in square brackets (e.g., `text-[#2d5016]`)
- Add custom CSS classes to `global.css` when needed

### Fonts
- Use Next.js font optimization (`next/font/google`)
- Add font classes to `global.css` for easy application
- Document font choices in component comments

---

*This workflow document will be updated as we establish more guidelines.*

