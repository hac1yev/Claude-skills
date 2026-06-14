# Commit Message Format

Always generate commit messages using the following format:

[<ticket-branch>]: <brief description>

Where:
- <ticket-branch> is the first two segments of the current branch name.
- Ignore any segments after the ticket identifier.

Examples:

Branch: feature/CSBB-1/Added-new-method
Commit: [feature/CSBB-1]: Added new registration method

Branch: bugfix/CSBB-25/Fixed-token-validation
Commit: [bugfix/CSBB-25]: Fixed token validation

Branch: hotfix/CSBB-99/Resolve-production-error
Commit: [hotfix/CSBB-99]: Resolved production error

Rules:
- Extract only `<type>/<ticket>` from the branch name.
- Use the format `[<type>/<ticket>]: <description>`.
- Keep descriptions concise and action-oriented.
- Use verbs such as Added, Fixed, Updated, Removed, Refactored, Improved, Implemented.
- Generate only the commit message unless additional explanation is requested.