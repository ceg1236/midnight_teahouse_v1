# Development Workflow

## Branching

- **main** = Production (Vercel deploys from here). Develop new designs on main.
- **design-v1** = Preserved branch with the icon-animation design. Use as reference or fallback.
- To spin off a new design branch: `git checkout -b design-<name>` from main, push with `git push -u origin design-<name>`.

## Commit Workflow

- **Commit after every series of changes**: After completing a logical set of changes (e.g., styling updates, feature additions, bug fixes), create a commit.
- **Commit messages**: Keep them simple but descriptive of the main change.
  - Format: Brief description of what was changed
  - Do not add "Co-authored-by: Cursor <cursoragent@cursor.com>" or equivalent AI branding content
  - Examples:
    - "Update header styling and add custom fonts"
    - "Add hover animations to navigation"
    - "Fix font loading issue"
- **Push after committing**: After creating a commit, push the changes to the remote repository.
  - Use: `git push` (or `git push origin <branch-name>` if needed)
- **Standard flow**: `git add <files>` → `git commit -m "message"` → `git push`

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
