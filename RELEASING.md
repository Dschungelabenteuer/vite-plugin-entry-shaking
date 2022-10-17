> **Note**
> This repository uses [changesets](https://github.com/changesets/changesets) to do versioning.

> **Note**
> This repository uses [changesets/actions](https://github.com/changesets/action) to handle releases.

> **Note**
> This requires the organization/repository  to be allowed to [create and approve pull requests from GitHub Actions.](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#preventing-github-actions-from-creating-or-approving-pull-requests)

# How to create a release

### Procedure

1. Checkout the `main` branch
2. Make or merge the changes you want to the source code
3. Run `pnpm i` within the monorepository root to make sure everything is up to date
4. Run `pnpm changeset` to prepare release's changelog:

    4.1. `🦋  Which packages would you like to include?`
    * Pick all of `changed packages`
    * Pick all of `unchanged packages`

    4.2. `🦋 Which packages should have a MAJOR bump?`
    * If you're releasing a major version, pick `all packages`
    * If you're releasing a minor version or a patch, press <kbd>Enter</kbd>.

    4.3. `🦋 Which packages should have a MINOR bump?`
    * If you're releasing a minor version, pick `all packages`
    * If you're releasing a a patch, press <kbd>Enter</kbd>.

    4.4. `🦋 Please enter a summary for this change (this will be in the changelogs)`
    * Type in a markdown message that will be appended to changelogs.

    4.5. `🦋 Is this your desired changeset?`
    * Review output summary of changesets:
      * Type in <kbd>Y</kbd> to confirm.
      * Type in <kbd>n</kbd> to cancel.

> **Note**
> By now, if you confirmed changeset, a temporary `.md` file containing changelog date should
> have been created within the `.changeset` folder.

5. Commit changes.

6. Push changes.

### Outcome

This triggers a GitHub Action which creates a pull request including changes and generated changelog.

Once the pull request is merged, packages are published on the NPM registry and a release is added to GitHub.