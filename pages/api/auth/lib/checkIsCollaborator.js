import { Octokit } from "octokit";

const contributorCache = new Map();

// This function checks if the user's image is a collaborator in the manifest repo
export default async function checkIsCollaborator(userImage) {
    // Create a cache key based on the manifest repo and the user's image
    const cacheKey = `${process.env.MANIFEST_REPO}-${userImage}`;

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
        const [owner, repo] = process.env.MANIFEST_REPO.split('/');

        // Fetch the list of collaborators
        const collaborators = await octokit.request('GET /repos/{owner}/{repo}/collaborators', {
            owner: owner,
            repo: repo,
        });

        // Check if the user is a collaborator by matching the user's image with the collaborators' avatar_url
        const isCollaborator = collaborators.data.some(
            (collaborator) => collaborator.avatar_url === userImage
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