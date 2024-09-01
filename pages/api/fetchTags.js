import { getSession } from "next-auth/react";

const headers = {
    Authorization: "Basic " + btoa(process.env.GITHUB_SERVER_USER + ":" + process.env.GITHUB_SERVER_ACCESS_TOKEN),
};

// Gets the tags for the given repo. The repo is passed as a query parameter like ?repo=owner/repo
export default async function handler(req, res) {
    // Get the session
    const session = await getSession({ req });

    // Wrap an authorization check around the API route.
    if (session && session.isCollaborator) {
        // If session exists, and has been checked to be a collaborator, respond with a message
        try {
            // Fetch the tags for the given repo.
            const response = await fetch(
                `https://api.github.com/repos/${req.query.repo}/tags`,
                { headers: { Authorization: "Basic " + btoa(process.env.GITHUB_SERVER_USER + ":" + process.env.GITHUB_SERVER_ACCESS_TOKEN) } }
            );

            // Extract and parse the content of the file.
            const data = await response.json();
            const tags = data.map(tag => ({
                name: tag.name,
                sha: tag.commit.sha,
            }));

            // Respond with the tags.
            res.status(200).json(tags);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}