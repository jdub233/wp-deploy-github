// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  // Get the session
  const session = await getSession({ req });

  if (session) {
      // If session exists, respond with a message including the user's email
      res.status(200).json({ message: `Hello ${session.user.name}` });
    } else {
      // If no session exists, respond with an unauthorized status
      res.status(401).json({ message: "Unauthorized" });
  }
}