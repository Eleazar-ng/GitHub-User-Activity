#!/usr/bin/env node

import { fetchGithubActivity, showHelp } from "./helper.js";

//Main Function
async function main(){
  const args = process.argv.slice(2);
  if(args.length === 0){
    showHelp();
    return
  }

  try {
    const username = args[0];
    console.log(`Fetching recent activity for ${username}...\n`);
    const activities = await fetchGithubActivity(username);
    if(activities.error){
      console.error(activities.message);
      return
    }
    
    if(activities.data.length === 0){
      console.log('No recent activities found for this user');
      return
    }

    const userActivities = activities.data
    console.log(`******** Github Activity for ${username} ********\n`)
    userActivities.forEach((activity, index) => {
      console.log(`- ${index + 1}. Type: ${activity.type}, Repo: ${activity.repo.name}`)
    });
    return
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main()