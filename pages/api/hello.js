// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getSession } from "next-auth/react";

const headers = {
  Authorization: "Basic " + btoa(process.env.GITHUB_SERVER_USER + ":" + process.env.GITHUB_SERVER_ACCESS_TOKEN),
};

export default async function handler(req, res) {
  // Get the session
  const session = await getSession({ req });

  if (session) {
    // If session exists, respond with a message

    // Fetch all the collaborators of a repository
    const collaborators = await fetchCollaborators();

    // Filter the collaborators to see if the user is a collaborator by matching the session.user.image with the collaborators.avatar_url
    const isCollaborator = collaborators.some(
      (collaborator) => collaborator.avatar_url === session.user.image
    );

    if (isCollaborator) {
      res.status(200).json({ message: "You are a collaborator" });
    } else {
      res.status(200).json({ message: "You are not a collaborator" });
    }
    } else {
      // If no session exists, respond with an unauthorized status
      res.status(401).json({ message: "Unauthorized" });
  }
}

// Function to fetch all the collaborators of a repository
 async function fetchCollaborators() {

  const response = await fetch(
    `https://api.github.com/repos/${process.env.MANIFEST_REPO}/collaborators`,
    { headers }
  );

  const collaborators = await response.json();
  return collaborators;
 }

