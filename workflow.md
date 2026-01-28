# Development Workflow

## Commit Workflow

- **Commit after every series of changes**: After completing a logical set of changes (e.g., styling updates, feature additions, bug fixes), create a commit.
- **Commit messages**: Keep them simple but descriptive of the main change.
  - Format: Brief description of what was changed
  - Examples:
    - "Update header styling and add custom fonts"
    - "Add hover animations to navigation"
    - "Fix font loading issue"
- **Push after committing**: After creating a commit, push the changes to the remote repository.
  - Use: `git push` (or `git push origin <branch-name>` if needed)

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
