
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

export {
  showHelp,
  fetchGithubActivity
}