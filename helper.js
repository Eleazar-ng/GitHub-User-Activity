
import https from "https";
import { URL } from "url";



function showHelp(){
  console.log(
    `
    ******* Github User Activity CLI  *******

    A cli application to fetch the recent activity of a GitHub user

    USAGE:
      github-activity <username>

    ARGUMENTS:
      username                GitHub username to fetch activity

    EXAMPLES:
      github-activity Eleazar-ng
    `
  )

  return
}

async function fetchGithubActivity(username){
  return new Promise((resolve, reject) => {
    const API_URL = `https://api.github.com/users/${username}/events`;
    const parsedUrl = new URL(API_URL);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'MyCLIApp/1.0'
      }
    };

    const request = https.request(options, (response) => {
      const { statusCode } = response;

      let data = '';
      response.setEncoding('utf8');

      // Collect chunks of data
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if(statusCode === 200){
          try {
            const parsedData = JSON.parse(data);
            const obj = {
              error: false,
              message: `Data retrieved successfully. Status Code: ${statusCode}`,
              data: parsedData
            }
            resolve(obj)
          } catch (e) {
            const obj = {
              error: true,
              message: 'Failed to parse response data'
            }
            reject(obj)
          }
        } else if (statusCode === 404){
            const obj = {
              error: true,
              message: `Github Username: ${username} not found on Github !`
            }
            reject(obj)
        }else {
          const obj = {
            error: true,
            message: `${JSON.parse(data).message || 'Request Failed'}`
          }
          reject(obj)
        }
      });
    })

    // Handle request errors
    const errorObj = {
      error: true
    }

    request.on('error', (e) => {
      errorObj ['message'] = `Request error: ${e.message}`
      if (e.code === 'ECONNRESET') {
        errorObj ['message'] = `Connection was reset by the server`
      } else if (e.code === 'ETIMEDOUT') {
        errorObj ['message'] = `Request timed out`
      }
      reject(errorObj);
    });

    request.end();
  })
}

function formatDate(createdAtDate){
  const date = new Date(createdAtDate);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 366) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
      return date.toLocaleDateString();
  }
}

function formatActivity(event, index){
  const time = formatDate(event.created_at);
  let message = '';

  switch(event.type) {
    case 'PushEvent':
      const branch = event.payload.ref.replace('refs/heads/', '');
      message = `Pushed commit(s) to ${branch} in ${event.repo.name}`;
      break;
    case 'CreateEvent':
      const refType = event.payload.ref_type;
      const refName = event.payload.ref || '';
      message = `Created ${refType} ${refName ? `"${refName}"` : ''} in ${event.repo.name}`;
      break;
    case 'IssuesEvent':
      const action = event.payload.action;
      const issue = event.payload.issue;
      message = `${action} issue #${issue.number}: "${issue.title}" in ${event.repo.name}`;
      break;
    case 'PullRequestEvent':
      const prAction = event.payload.action;
      const pr = event.payload.pull_request;
      message = `${prAction} pull request #${pr.number} in ${event.repo.name}`;
      break;
    case 'ForkEvent':
      const forkee = event.payload.forkee;
      message = `Forked ${event.repo.name} to ${forkee.full_name}`;
      break;
    case 'WatchEvent':
      message = `Starred ${event.repo.name}`;
      break;
    case 'CommitCommentEvent':
      const comment = event.payload.comment;
      message = `Commented on commit in ${event.repo.name}: "${comment.body.substring(0, 50)}${comment.body.length > 50 ? '...' : ''}"`;
      break;
    case 'IssueCommentEvent':
      const issueComment = event.payload.comment;
      const issueInfo = event.payload.issue;
      message = `Commented on issue #${issueInfo.number} in ${event.repo.name}: "${issueComment.body.substring(0, 50)}${issueComment.body.length > 50 ? '...' : ''}"`;
      break;
    case 'DeleteEvent':
      const delRefType = event.payload.ref_type;
      const delRefName = event.payload.ref || '';
      message = `Deleted ${delRefType} ${delRefName ? `"${delRefName}"` : ''} in ${event.repo.name}`;
      break;
    case 'DiscussionEvent':
      const discussionAction = event.payload.action
      message = `${discussionAction} a discussion in ${event.repo.name}`;
      break;
    case 'GollumEvent':
      message = `${event.type} in ${event.repo.name}`;
      break;
    case 'MemberEvent':
      const memberAction = event.payload.action;
      const member = event.payload.member.login;
      message = `${memberAction} ${member} to ${event.repo.name}`;
      break;
    case 'PublicEvent':
      message = `Made repository ${event.repo.name} public`;
      break;
    case 'PullRequestReviewEvent':
       const prReviewRequest = event.payload.pull_request
       message = `Reviewed pull request #${prReviewRequest.number} in ${event.repo.name}`
      break;
    case 'PullRequestReviewCommentEvent':
      const prComment = event.payload.comment;
      const pullRequest = event.payload.pull_request
      message = `Commented on pull request #${pullRequest.number} in ${event.repo.name}: "${prComment.body.substring(0, 50)}${prComment.body.length > 50 ? '...' : ''}"`;
      break; 
    case 'ReleaseEvent':
      const release = event.payload.release;
      message = `Published release ${release.tag_name} in ${event.repo.name}`;
      break;
    default:
      message = `${event.type} in ${event.repo.name}`;

  }

  return ` - ${index + 1} ${message}; ${time}`
}



export {
  showHelp,
  fetchGithubActivity,
  formatActivity
}