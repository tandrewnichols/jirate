# Jirate

An interactive command line integration for Jira that let's you create git branches for issues assigned to you or in the current sprint.

## Installation

For now (because this hasn't been published on npm yet . . . and may not be cause then I have to maintain it), clone this repo whereever you clone stuff and run `npm link` within the repo. That will make it globally available via the `jira` command.

## Setup

Jira deprecated Basic Auth via username/password, but you can still do it using a token in place of your password. Go to [your account settings](https://id.atlassian.com/manage-profile/security/api-tokens) to create a token. There are also instructions [here](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) that you can follow to get setup. Once you've copied the token, create a file on your computer somewhere to hold it. I created on at `~/.jira-creds`. This file should contain a json object with your username and "password" (token). So something like this:

```json
{
  "username": "bob.saget@myorg.com",
  "password": "token copied from jira"
}
```

Every API request to Jira requires authentication. There are number of ways to do that authentication, but the simplest (that also gets other stuff set up), is to run `jira init -c path/to/my/creds`. See [init](#init) below for the full documentation, but a relevant summary follows hereafter. N.B. I do not recommend (or support as a method of authentication) using environment variables for this, since that makes them available to other processes, and you don't know what they might do with them.

`jira init` takes either the `-u`/`--username` and `-p`/`--password` flags _or_ the `-c`/`--credentials` flags (where `credentials` is the path to the credential file you created above). This will cache your credentials (by which I means, store them in a file in a place `jirate` is expecting to find them), and set the defaults options for you (see the [options](#options) section below for more about the options). Alternatively, you can pass the `-f`/`--full` flag to walk through each option manually and choose your preference (it will prompt you for answers and give you the valid values as options). You may prefer that if you don't like my defaults. ¯\\_(ツ)_/¯

Note that most of the settings will probably work fine for you with the default even if it's not what you prefer, with the exception of `filterLabels`. Without this set, you'll see every issue in our board. Which is lot. If you ran `init` without the `-f` flag, you can still set that value now with `jira set filterLabels team-name` (for example, for me, `jira set filterLabels team-library`).

Once you've "authenticated," you can use `jira branch` (see [branch](#branch)) to list issues and create branches.

## Commands

First of all, `jira -h` will give you all this info if you forget, and `jira <command> -h` will give you help on a specific command.

### branch

Lists issues in To Do and In Progress that are assigned to you, issues in the current sprint in To Do, and (optionally) issues in the backlog, and let's you interactively choose one. Once you do, it will create a branch for you using our branch naming scheme (`type/SIDE-####-description`).  Depending on your options, it may also update the issue (making you the assignee and putting In Progress).

### Format

`jira branch [options]`

#### Options

- `-u`/`--username <username>` - If you choose not to initialize/cache your credentials, you _can_ pass them per request using this and the following options. But that's more work, so why do that?
- `-p`/`--password <password>` - See above.
- `-c`/`--credentials <credentials-file>` - See above.
- `-b`/`-- backlog [max]` - Include backlog issues. Without `max`, it defaults to jira's default max results (50). Pass a number here to get less.

#### Example Usage

```sh
jira branch # List issues in current sprint only
jira branch -b # List issues in current sprint and backlog
jira branch -b 5 # Lists issues in current spring and up to 5 in the backlog
```

#### Notes

1. If you are not on master and your git index is dirty (uncommitted changes), running `jira branch` will do nothing. Auto stashing changes seems like a bad idea, so you just be forced to deal with it first.
2. If you are not on master and `autocheckoutMaster` is set to true, `git checkout master` will be run. If it is set to `prompt`, you will be asked if you want to to checkout master.
3. If you have `autoupdateMaster` set to true, one of `git pull`, `git fetch && git merge origin/master`, or `git fetch && git rebase origin/master` will be run (right away if you are on master already or after checking out master as per 2 above) depending on your `updateCommand` setting.
4. If `autoupdateIssue` is set, once the new branch is created, the issue will be assigned to you and marked as "In Progress." (I wanted to make it move backlog issues to the current sprint as well, but there's a bug in the jira wrapper that prevents this at the moment).

### init

Initializes your credentials and settings.

### Format

`jira init [options]`

#### Options

- `-u`/`--username <username>` - Your jira username (email address).
- `-p`/`--password <password>` - Your jira token (see [setup](#setup)).
- `-c`/`--credentials <credentials-file>` - A json file containing your username and token (see [setup](#setup)).
- `-f`/`--full` - Prompt for each setting (otherwise the defaults will be used).

Besides passing `-u`/`-p` or `-c`, you can also pass a credentials file path right after `init` (see the examples below). You can also pass no credentials, and you will instead be prompted for them.

#### Example Usage

```sh
jira init ~/.jira-creds # Pass cred file directly
jira init -c ~/.jira-creds # Pass cred file using -c option
jira init -u bob.saget@oliveai.com -p fullhouse # Pass username and token separately
jira init -c ~/.jira-creds -f # Run through the options and configure them based on your preference
```

### set

Set an option.

### Format

`jira set [setting] [value]`

Both `setting` and `value` are optional here. If `value` is omitted, you will be prompted for the value, and if setting is omitted, you will be asked to choose one from the list of known settings.

#### Options

There are no flags that can be passed with this command at this time. The following settings are supported.

- `autocacheCredentials` - Cache credentials for later use after they are manually entered.  Valid values: true, false.
- `autocheckoutMaster` - Automatically checkout master when `jira branch` is run on a non-master branch. Valid values: true, false, prompt.
- `autoupdateMaster` - Automatically pull after checking out master before creating a new branch. Valid values: true, false, prompt.
- `updateCommand` - Indicates how to resolve updates when switching to master. Pull runs `git pull` and relies on your local configuration. Merge and rebase both fetch first, and then run `git merge origin/master` and `git rebase origin/master` respectively. Valid values: pull, merge, rebase
- `allowNonMasterBranching` - Allow `jira branch` to create branches off of non-master branches. Valid values: true, false, prompt.
- `autoupdateIssue` - Automatically set the status and assignee of an issue when creating a branch for that issue. Valid values: true, false, prompt.
- `filterLabels` - Only show issues tagged with particular labels. You can pass multiple labels at once, separated by commas.

### get

Display the current value of an option.

#### Format

`jira get [setting]`

Without `setting`, the full settings options will be displayed.

#### Options

None.

### logout

Removes cached credentials.

#### Format

`jira logout`

#### Options

None.

### reset

Resets your settings to the default settings. Don't do this if you prefer custom settings.

#### Format

`jira reset`

#### Options

None.

## Upcoming/Todo

Some other ideas/enhancements I'd like to work on when I get time:

1. Create a command that lists all issues assigned to you and displays their status.
2. Move `set`/`get`/`reset` under a `config` option to more closely mirror how git works (e.g. `git config set property value`).
3. Create a `jira push` command that runs `git push` on your behalf, but then also transitions the issue to "Code Review" and opens the PR page in a browser for you.
4. Make the boad id configurable (it's currently hard-coded which means this is only currently usable by people within Olive Helps).
5. Possibly other Jira integrations . . . view/add comments on an issue, create a new issue, etc.
