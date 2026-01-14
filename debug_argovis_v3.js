const https = require('https');

const platform = '2900883';
const dataFields = JSON.stringify(["temperature", "salinity", "pressure"]);

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) reject(`Status ${res.statusCode}: ${data}`);
                else resolve(JSON.parse(data));
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log('1. Fetching platform metadata...');
        // Step 1: Get list of profiles
        const metaUrl = `https://argovis-api.colorado.edu/argo?platform=${platform}&compression=minimal`;
        const profiles = await fetchJson(metaUrl);
        console.log(`Found ${profiles.length} profiles.`);

        // Step 2: Sort by date (index 3) descendng
        // Profile format: [id, lon, lat, date, source, key]
        profiles.sort((a, b) => new Date(b[3]) - new Date(a[3]));

        const latestProfile = profiles[0];
        const latestID = latestProfile[0];
        console.log(`Latest Profile ID: ${latestID} (Date: ${latestProfile[3]})`);

        // Step 3: Fetch full data for THIS profile
        console.log('2. Fetching full data for latest profile...');
        const dataqs = new URLSearchParams({ id: latestID, data: dataFields }).toString();
        const dataUrl = `https://argovis-api.colorado.edu/argo?${dataqs}`;

        const fullData = await fetchJson(dataUrl);
        console.log(`Success! Fetched data for ${fullData[0]._id}`);
        console.log(`Data points: ${fullData[0].measurements.length}`);

        // Inspect valid keys
        if (fullData[0].measurements.length > 0) {
            console.log('Measurement Keys:', Object.keys(fullData[0].measurements[0]));
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
