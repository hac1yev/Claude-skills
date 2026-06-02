---
name: commit-message
description: Writes commit messages. Use when committing changes, or when the user asks to summarize changes for a commit.
---

When writing a commit message:  
1. Run `git diff --cached` to see all staged changes
2. Write a message following this format:

```
Short summary of the commit (50 characters or less)
Detailed description of the commit, explaining what changes were made and why. This can be multiple lines and should provide enough context for someone reviewing the commit history.
```
- The first line should be a concise summary of the changes (50 characters or less).
- The second line should be blank.
- The following lines should provide a detailed description of the changes, explaining what was changed and why. This can be multiple lines and should provide enough context for someone reviewing the commit history.
- If the commit relates to a specific issue or ticket, mention it in the description (e.g., "Fixes #123").
- Use the imperative mood in the subject line (e.g., "Add feature" instead of "Added feature" or "Adds feature").
- Avoid using the word "fix" in the subject line unless the commit is specifically fixing a bug. Instead, describe what the commit does (e.g., "Update README" instead of "Fix README").
- If the commit includes breaking changes, mention it in the description (e.g., "BREAKING CHANGE: ...").
- If the commit includes any new features, mention it in the description (e.g., "feat: ...").
- If the commit includes any bug fixes, mention it in the description (e.g., "fix: ...").
- If the commit includes any refactoring, mention it in the description (e.g., "refactor: ...").
- If the commit includes any documentation changes, mention it in the description (e.g., "docs: ...").
- If the commit includes any tests, mention it in the description (e.g., "test: ...").
- If the commit includes any chore changes (e.g., build process, dependencies), mention it in the description (e.g., "chore: ...").
- If the commit includes any performance improvements, mention it in the description (e.g., "perf: ...").
- If the commit includes any style changes (e.g., formatting, linting), mention it in the description (e.g., "style: ...").
- If the commit includes any revert changes, mention it in the description (e.g., "revert: ...").
- If the commit includes any merge changes, mention it in the description (e.g., "Merge branch 'master' into feature-branch").
- If the commit includes any other types of changes, mention it in the description (e.g., "ci: ...", "build: ...", "deps: ...", etc.).
- If the commit includes any breaking changes, mention it in the description (e.g., "BREAKING CHANGE: ...").
- If the commit includes any new features, mention it in the description (e.g., "feat: ...").
- If the commit includes any bug fixes, mention it in the description (e.g., "fix: ...").
- If the commit includes any refactoring, mention it in the description (e.g., "refactor: ...").
- If the commit includes any documentation changes, mention it in the description (e.g., "docs: ...").
- If the commit includes any tests, mention it in the description (e.g., "test: ...").
- If the commit includes any chore changes (e.g., build process, dependencies), mention it in the description (e.g., "chore: ...").
- If the commit includes any performance improvements, mention it in the description (e.g., "perf: ...").
- If the commit includes any style changes (e.g., formatting, linting), mention it in the description (e.g., "style: ...").
- If the commit includes any revert changes, mention it in the description (e.g., "revert: ...").