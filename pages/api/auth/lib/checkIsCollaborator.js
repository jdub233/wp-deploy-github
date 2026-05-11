import { Octokit } from "octokit";

const contributorCache = new Map();

// This function checks if the user's GitHub ID is a collaborator in the manifest repo
export default async function checkIsCollaborator(githubUserId) {
    // Create a cache key based on the manifest repo and the user's GitHub ID
    const cacheKey = `${process.env.NEXT_PUBLIC_MANIFEST_REPO}-${githubUserId}`;

    // Check if the contributor match is already in the cache
    if (contributorCache.has(cacheKey)) {
        console.log('Cache hit:', cacheKey);
        return contributorCache.get(cacheKey);
    }

    // If the contributor match is not in the cache, fetch the list of collaborators and check if the user is a collaborator.
    try {
        const octokit = new Octokit({
            auth: process.env.GITHUB_SERVER_ACCESS_TOKEN,
        });
        
        // Split the repo slug into owner and repo
        const [owner, repo] = process.env.NEXT_PUBLIC_MANIFEST_REPO.split('/');

        // Fetch the list of collaborators
        const collaborators = await octokit.request('GET /repos/{owner}/{repo}/collaborators', {
            owner: owner,
            repo: repo,
        });

        // Check if the user is a collaborator by matching the user's GitHub ID with the collaborators' ID
        const isCollaborator = collaborators.data.some(
            (collaborator) => collaborator.id === githubUserId
        );

        // Cache the result
        contributorCache.set(cacheKey, isCollaborator);

        // Optionally, set a timeout to remove the item from cache after a certain period
        setTimeout(() => contributorCache.delete(cacheKey), 1000 * 60 * 60); // 1 hour

        console.log('Cache miss:', cacheKey);

        // Return the result
        return isCollaborator;
    } catch (error) {
        console.error('Error checking collaborator status:', error);
        return false;
    } 
}