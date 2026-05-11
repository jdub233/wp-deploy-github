import NextAuth from 'next-auth';
import GithubProvider from "next-auth/providers/github";

import checkIsCollaborator from "./lib/checkIsCollaborator";

export const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account, profile }) {
            // On first sign-in, add GitHub user ID to token
            // Subsequent calls will lose the account and profile info, but the GitHub ID will persist in the token.
            if (account && profile) {
                token.githubId = profile.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Add GitHub ID from the token to session
            session.user.githubId = token.githubId;

            // Check if the user is a collaborator and get their login
            const collaboratorData = await checkIsCollaborator(session.user.githubId);

            // Add the collaborator status and login to the session
            session.isCollaborator = collaboratorData.isCollaborator;
            session.user.login = collaboratorData.login;

            // Return the session
            return session;
        },
    },
};

export default NextAuth(authOptions);