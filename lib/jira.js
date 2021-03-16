const JiraClient = require('jira-client');
const cache = require('./cache');
const settings = require('./settings');

const boardId = 388;
const startAt = 0;
const max = 50;
const validateQuery = false;
const fields = ['labels', 'assignee', 'issuetype', 'summary', 'status', 'customfield_12700'];

exports.authenticate = ({ username, password }) => {
  this.username = username;
  this.client = new JiraClient({
    protocol: 'https',
    host: 'crosschx.atlassian.net',
    username,
    password,
    apiVersion: 2,
    strictSSL: true
  });
};

const findIssues = async (jql, maxResults = max) =>
  this.client.getIssuesForBoard(boardId, startAt, maxResults, jql, validateQuery, fields);

exports.findIssues = async (includeBacklog) => {
  const labels = (await settings.get('filterOnLabels')) || [];
  const assignedToMeJql = `assignee=${ this.username.replace('@', '\\u0040') } AND status in ("To Do", "In Progress")`;
  let unassigedJql = `status = "To Do" AND sprint in openSprints() AND issuetype not in ("Design", "Epic")`;
  let backlogJql = `status = "To Do" AND  (Sprint = EMPTY OR Sprint not in (openSprints(), futureSprints())) AND issuetype not in ("Design", "Epic")`;

  if (labels.length) {
    const labelJql = ` AND labels in ("${ labels.join('", "') }")`;
    unassigedJql += labelJql;
    backlogJql += labelJql;
  }

  const [assignedToMe, unassigned, backlog] = await Promise.all([
    findIssues(assignedToMeJql),
    findIssues(unassigedJql),
    includeBacklog
      ? findIssues(backlogJql, typeof includeBacklog === 'boolean' ? max : Number(includeBacklog), backlogJql)
      : []
  ]);

  return [assignedToMe.issues, unassigned.issues, backlog.issues];
};

exports.updateIssue = async (issue) => {
  const { transitions } = await this.client.listTransitions(issue.id);
  const transition = transitions.find((tr) => tr.name === 'In Progress');
  let user = await cache.read('user');

  if (Object.keys(user).length === 0) {
    const users = await this.client.searchUsers({ query: this.username.split('@')[0] });
    user = users.find((user) => user.emailAddress === this.username);
    await cache.write('user', user);
  }

  await this.client.updateAssigneeWithId(issue.key, user.accountId);
  await this.client.transitionIssue(issue.id, { transition });
};
