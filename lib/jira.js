const JiraClient = require('jira-client');
const cache = require('./cache');

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

exports.findIssues = async () => {
  const assignedToMeJql = `assignee=${ this.username.replace('@', '\\u0040') } AND status in ("To Do", "In Progress")`;
  const unassigedJql = `status = "To Do" AND sprint in openSprints() AND labels = "team-library" AND issuetype != "Design"`;
  const [assignedToMe, unassigned] = await Promise.all([
    this.client.getIssuesForBoard(388, 0, 50, assignedToMeJql, null, ['labels', 'assignee', 'issuetype', 'summary', 'status', 'customfield_12700']),
    this.client.getIssuesForBoard(388, 0, 50, unassigedJql, null, ['labels', 'assignee', 'issuetype', 'summary', 'status', 'customfield_12700'])
  ]);

  return assignedToMe.issues.concat(unassigned.issues);
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
