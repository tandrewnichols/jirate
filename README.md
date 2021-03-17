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

Note that most of the settings will probably work fine for you with the default even if it's not what you prefer, with the exception of `filterOnLabels`. Without this set, you'll see every issue in our board. Which is lot. If you ran `init` without the `-f` flag, you can still set that value now with `jira set filterOnLabels team-name` (for example, for me, `jira set filterOnLabels team-library`).

Once you've "authenticated," you can use `jira branch` (see [branch](#branch)) to list issues and create branches.

## Commands

### branch

Lists issues in To Do and In Progress that are assigned to you, issues in the current sprint in To Do, and (optionally) issues in the backlog, and let's you interactively choose one. Once you do, it will create a branch for you using our branch naming scheme (`type/SIDE-####-description`).  Depending on your options, it may also update the issue (making you the assignee and putting In Progress).

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
