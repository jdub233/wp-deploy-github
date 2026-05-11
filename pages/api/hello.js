// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  // Get the session
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // Session already includes isCollaborator and login from the auth callback
    if (session.isCollaborator) {
      res.status(200).json({ 
        message: "You are a collaborator",
        login: session.user.login,
        githubId: session.user.githubId
      });
    } else {
      res.status(200).json({ message: "You are not a collaborator" });
    }
  } else {
    // If no session exists, respond with an unauthorized status
    res.status(401).json({ message: "Unauthorized" });
  }
}

