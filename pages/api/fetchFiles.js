// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getSession } from "next-auth/react";

const headers = {
    Authorization: "Basic " + btoa(process.env.GITHUB_SERVER_USER + ":" + process.env.GITHUB_SERVER_ACCESS_TOKEN),
};

// Gets the file tree of all the ini files in the manifest repo, and formats them as a list of environments and their installs.
export default async function handler(req, res) {
    // Get the session
    const session = await getSession({ req });

    if (session && session.isCollaborator) {
        // If session exists, and has been checked to be a collaborator, respond with a message
        try {
            const response = await fetch(
                `https://api.github.com/repos/${process.env.NEXT_PUBLIC_MANIFEST_REPO}/git/trees/${process.env.NEXT_PUBLIC_MANIFEST_BRANCH}?recursive=1`,
                { headers }
            );

            const data = await response.json();
            // Extract the file tree from the response.
            const tree = data.tree;
            //res.status(200).json(files);

            // Parse the file listing to create a list of available environments and their installs.
            const paths = tree.reduce((acc, item) => {
                if (item.type !== 'blob') {
                    return acc;
                }

                // Extract the directory and file name from the path.
                const path = item.path.split('/');
                const file = path.pop();

                // If the file is not an ini file, skip it.
                if (file.split('.').pop() !== 'ini') {
                    return acc;
                }

                // Join the directory path back together.
                const dir = path.join('/');

                // If the directory is not in the accumulator, add it.
                if (!acc[dir]) {
                    acc[dir] = [];
                }

                // Add the file name to the directory's list of installs.
                acc[dir].push(file.split('.').shift());
                return acc;
            }, {});

            res.status(200).json(paths);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }

    } else {
        // If no session exists, or not a collaborator on the repo, respond with an unauthorized status
        res.status(401).json({ message: "Unauthorized" });
    }
}



