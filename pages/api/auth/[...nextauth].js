import NextAuth from 'next-auth';
import GithubProvider from "next-auth/providers/github";

import checkIsCollaborator from "./lib/checkIsCollaborator";

export default NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            // Check if the user is a collaborator based on the identity of the user's avatar image
            const isCollaborator = await checkIsCollaborator(
                session.user.image,
            );

            // Add the collaborator status to the session
            session.isCollaborator = isCollaborator;

            // Return the session
            return session;
        },
    },
});