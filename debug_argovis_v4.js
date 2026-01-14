const https = require('https');

const platform = '2900883';

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) resolve({ error: true, status: res.statusCode, body: data });
                else resolve(JSON.parse(data));
            });
        }).on('error', reject);
    });
}

async function testDataParam(name, dataParamValue) {
    try {
        // Step 1: Get metadata (we know this works, so we cheat and hardcode a known ID from previous runs or just fetch fresh)
        // To be robust we fetch fresh.
        const metaUrl = `https://argovis-api.colorado.edu/argo?platform=${platform}&compression=minimal`;

        // We'll wrap the whole flow
        const profiles = await fetchJson(metaUrl);
        if (profiles.error) { console.log(`[${name}] Meta Error: ${profiles.status}`); return; }

        profiles.sort((a, b) => new Date(b[3]) - new Date(a[3]));
        const latestID = profiles[0][0];
        console.log(`[${name}] Latest ID: ${latestID}`);

        const qs = new URLSearchParams({ id: latestID, data: dataParamValue }).toString();
        // Decode the QS to inspect what we are actually sending? 
        // URLSearchParams encodes brackets. Argovis might want encoded or not?

        const dataUrl = `https://argovis-api.colorado.edu/argo?${qs}`;
        console.log(`[${name}] Requesting: ${dataUrl}`);

        const result = await fetchJson(dataUrl);

        if (result.error) {
            console.log(`[${name}] API Error ${result.status}: ${result.body.substring(0, 200)}...`);
        } else if (result.length > 0) {
            console.log(`[${name}] Success! Full Data[0]: ${JSON.stringify(result[0]).substring(0, 500)}`);
            if (result[0].measurements) {
                console.log(`[${name}] Measurements count: ${result[0].measurements.length}`);
                if (result[0].measurements.length > 0) console.log(`[${name}] Meas Keys: ${Object.keys(result[0].measurements[0])}`);
            } else if (result[0].data) {
                console.log(`[${name}] Data array found! Length: ${result[0].data.length}`);
                console.log(`[${name}] First row: ${JSON.stringify(result[0].data[0])}`);
            }
        } else {
            console.log(`[${name}] Success (Empty array?)`);
        }
    } catch (e) {
        console.error(`[${name}] Script Error:`, e.message);
    }
}

async function runAll() {
    // Test 1: JSON String Array (What we tried)
    // await testDataParam('JSON_Array', JSON.stringify(["temperature", "salinity", "pressure"]));

    // Test 2: Comma Separated String
    await testDataParam('Comma_String', "temperature,salinity,pressure");

    // Test 3: Raw TEMP (Check if standard names allowed)
    // await testDataParam('Raw_Names', JSON.stringify(["temp", "psal", "pres"]));
}

runAll();
