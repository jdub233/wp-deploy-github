import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

import ini from "ini";

import { getCurrentESTDateTimeString } from '../../lib/getCurrentESTDateTimeString';
import { commitToRepo } from '../../lib/commitToRepo';

export default async function handler(req, res) {

    // Get the session
    const session = await getServerSession(req, res, authOptions);

    // Wrap an authorization check around the API route.
    if (session && session.isCollaborator) {
        if (req.method === 'POST') {
            const { query: { path }, body } = req;

            if (!path || !body) {
                return res.status(400).json({ message: "Path and file content are required" });
            }

            // Extract the message and manifest from the request body.
            const { message, manifest } = body;

            // Format the array of manifest objects into an object with the id as the key for ini encoding.
            const parsedIniObject = manifest.reduce((acc, item) => {
                const { id, ...rest } = item;
                acc[id] = rest;
                return acc;
            }, {});

            // Encode the object back into an .ini formatted string
            let iniString = ini.encode(parsedIniObject);

            // Add spaces around the "=" sign
            iniString = iniString.replace(/=/g, ' = ');

            // Get the Github login name from the session
            const githubLogin = session.user.login;

            // Prepend the build information to the ini file
            const iniFile = `; BUILD ${getCurrentESTDateTimeString()}-cms\n` 
                + `; MSG = ${message}\n`
                + `; USER = ${githubLogin}\n\n`
                + iniString;

            // Commit the ini file to the given path in the manifest repo
            const commitResult = await commitToRepo(path, iniFile, message);

            // return the result of the commit operation.
            const resultStatus = commitResult ? 200 : 500;
            const resultMessage = commitResult ? "Success" : "Error committing file";

            res.status(resultStatus).json({ message: resultMessage });

        } else {
            res.status(405).json({ message: "Method Not Allowed" });
        }
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}
