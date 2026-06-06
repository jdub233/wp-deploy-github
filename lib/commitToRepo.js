const headers = {
    Authorization: "Basic " + btoa(process.env.GITHUB_SERVER_USER + ":" + process.env.GITHUB_SERVER_ACCESS_TOKEN),
};

// Commit the ini file to the given path in the manifest repo
async function commitToRepo( path, fileContents, message ) {
    
    const repoUrl = `https://api.github.com/repos/${process.env.NEXT_PUBLIC_MANIFEST_REPO}`;
    
    // Commit the ini file to the given path in the manifest repo
    try {
        // Step 1: Get the SHA of the latest commit
        const latestCommit = await fetch(repoUrl + '/git/refs/heads/' + process.env.NEXT_PUBLIC_MANIFEST_BRANCH, { headers });
        const latestCommitSha = (await latestCommit.json()).object.sha;

        // Step 2: Get the SHA of the tree for the latest commit
        const latestCommitTree = await fetch(repoUrl + '/git/commits/' + latestCommitSha, { headers });
        const latestTreeSha = (await latestCommitTree.json()).tree.sha;

        // Step 3: Create a new blob with the content of the new file
        const newBlob = await fetch(repoUrl + '/git/blobs', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                "content": fileContents,
                "encoding": "utf-8"
            })
        });
        const newBlobSha = (await newBlob.json()).sha;

        // Step 4: Create a new tree with the new blob
        const newTree = await fetch(repoUrl + '/git/trees', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                "base_tree": latestTreeSha,
                "tree": [
                    {
                        "path": path,
                        "mode": "100644",
                        "type": "blob",
                        "sha": newBlobSha
                    }
                ]
            })
        });
        const newTreeSha = (await newTree.json()).sha;

        // Step 5: Create a new commit with the new tree
        const newCommit = await fetch(repoUrl + '/git/commits', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                "message": message,
                "parents": [latestCommitSha],
                "tree": newTreeSha
            })
        });
        const newCommitSha = (await newCommit.json()).sha;

        // Validate that we got a commit SHA back
        if (!newCommitSha) {
            console.error("Failed to create commit: no SHA returned");
            return { success: false, sha: null };
        }

        // Step 6: Update the reference to the branch with the new commit
        await fetch(repoUrl + '/git/refs/heads/' + process.env.NEXT_PUBLIC_MANIFEST_BRANCH, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                "sha": newCommitSha
            })
        });

        console.log("Commit successful!");

        return { success: true, sha: newCommitSha };

    } catch (error) {
        console.error(error);
        return { success: false, sha: null };
    }
}

export { commitToRepo };
