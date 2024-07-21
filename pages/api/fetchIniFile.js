// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getSession } from "next-auth/react";

import ini from "ini";

const headers = {
    Authorization: "Basic " + btoa(process.env.GITHUB_SERVER_USER + ":" + process.env.GITHUB_SERVER_ACCESS_TOKEN),
};

// Gets the ini file from the given path in the manifest repo. The path is passed as a query parameter like ?path=dir/file.ini
export default async function handler(req, res) {
    // Get the session
    const session = await getSession({ req });

    // Wrap an authorization check around the API route.
    if (session && session.isCollaborator) {
        // If session exists, and has been checked to be a collaborator, respond with a message
        try {
            // Fetch the ini file from the given path in the manifest repo.
            const response = await fetch(
                `https://api.github.com/repos/${process.env.MANIFEST_REPO}/contents/${req.query.path}`,
                { headers }
            );

            // Extract and parse the content of the file.
            const data = await response.json();
            const parsedIni = ini.decode(atob(data.content));

            // Convert the parsed ini object into an array of objects.
            const parsedIniArray = Object.keys(parsedIni).map(key => {
                var item = parsedIni[key];
                item.id = key;
                return item;
            });

            // Respond with the content of the file.
            res.status(200).json(parsedIniArray);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }


}