const headers = {
    Authorization: "Basic " + btoa(process.env.GITHUB_SERVER_USER + ":" + process.env.GITHUB_SERVER_ACCESS_TOKEN),
};

// Get the Github login name for a given avatar URL.
// This is because the session.user object only contains the avatar URL, and not the login name.
// This could also be fetched from the contributor list and not require an additional API call, but this works in the meantime.
async function getGithubLogin( avatarURL ) {
    // Extract the user ID from the avatar URL
    // Where the avatar URL is in the format https://avatars.githubusercontent.com/u/11111111?v=4
    const id = avatarURL.split('/').pop().split('?').shift();

    const response = await fetch(`https://api.github.com/user/${id}`, { headers });
    const data = await response.json();
    return data.login;
}

export { getGithubLogin };
