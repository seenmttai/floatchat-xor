const https = require('https');

const platform = '2900883';
const dataFields = JSON.stringify(["TEMP_ADJUSTED", "PSAL_ADJUSTED", "PRES_ADJUSTED"]);

function testUrl(name, params) {
    const qs = new URLSearchParams(params).toString();
    const url = `https://argovis-api.colorado.edu/argo?${qs}`;
    console.log(`\n--- Testing ${name} ---`);
    console.log(`URL: ${url}`);

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode !== 200) {
                console.log(`Error Body: ${data.substring(0, 500)}`);
            } else {
                console.log(`Success! Data length: ${data.length}`);
                const json = JSON.parse(data);
                console.log(`Items returned: ${json.length}`);
            }
        });
    }).on('error', e => console.error(e));
}

// Test: Platform param + Limit 1 + Data
testUrl('Platform Param + Limit 1 + Data', {
    platform: platform,
    limit: '1',
    data: dataFields
});
