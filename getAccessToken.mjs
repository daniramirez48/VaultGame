import fetch from 'node-fetch';

async function getAccessToken() {
    const clientId = 'vrpgcba5ula9916zp8c7xu98jx572z'; // Reemplaza con tu Client ID
    const clientSecret = 'uehf0o2m7pqtu218nquktvcb1w90ex'; // Reemplaza con tu Client Secret

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    });

    const data = await response.json();
    console.log(data);
    return data.access_token;
}

getAccessToken().then(accessToken => {
    console.log('Access Token:', accessToken);
}).catch(error => {
    console.error('Error:', error);
});
