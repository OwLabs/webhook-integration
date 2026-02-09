# 🧾 Commit Guidelines

This project uses **[Commitizen](https://github.com/commitizen/cz-cli)** to standardize commit messages across all contributors.  
Please follow the guidelines below to ensure consistent and meaningful commit history.

---

## 🚀 Quick Start

### 1. Install Commitizen (Globally or in Dev)

```bash
npm install -g commitizen
```

or (recommended for project-level setup):

```bash
npm install --save-dev commitizen
```

### 2. Initialize Conventional Commit Adapter

```bash
npx commitizen init cz-conventional-changelog --save-dev --save-exact
```

This enables the standard [Conventional Commit](https://www.conventionalcommits.org/) format, which tools like `semantic-release` and changelogs rely on.

### 3. Use Commitizen for All Commits

Instead of:

```bash
git commit -m "some message"
```

Use:

```bash
npx cz
```

Commitizen will guide you through prompts for:

- **Type** (feat, fix, chore, etc.)
- **Scope** (optional — e.g. `auth`, `tests`, `bookings`)
- **Short description**
- **Detailed description**
- **Breaking changes**
- **Issues references**

---

## 🧩 Conventional Commit Format

Each commit message should follow this structure:

```
<type>(<scope>): <short summary>
```

### Example

```
feat(scope): introduce a new feature or user-facing enhancement
fix(scope): correct a bug or unintended behavior
chore(scope): routine maintenance, tooling, or configuration changes
```

---

## 🧠 Commit Types

| Type         | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| **feat**     | A new feature for the application                             |
| **fix**      | A bug fix                                                     |
| **docs**     | Documentation changes only                                    |
| **style**    | Code style changes (formatting, missing semicolons, etc.)     |
| **refactor** | Code changes that neither fix a bug nor add a feature         |
| **perf**     | Performance improvements                                      |
| **test**     | Adding or updating tests                                      |
| **build**    | Changes that affect the build system or external dependencies |
| **ci**       | Continuous integration configuration changes                  |
| **chore**    | Routine maintenance, package updates, or minor improvements   |
| **revert**   | Reverts a previous commit                                     |

---

## 🧭 Branch Naming Convention

Follow a simple branch naming pattern for clarity and automation:

```
<name>/<type>/<short-description>
```

### Examples

```
aiman/feat/webhook-integration
chad/chore/update-dependencies
```

---

## 🧩 Example Workflow

```bash
# Create a new branch
git checkout -b chad/feat/update-dependencies

# Make changes, then stage them
git add .

# Commit using Commitizen
npm run commit

# Push your branch
git push --set-upstream origin feat/update-dependencies
```

---

## ✅ Summary

- Always use `npm run commit` instead of `git commit -m`.
- Follow the **Conventional Commit** format.
- Use clear branch names that match the type of change.
- This helps automate changelog generation and improve project readability.

---

## 🔗 References

- [Commitizen CLI](https://github.com/commitizen/cz-cli)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)
