const https = require('https');

const platform = '2900883';

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
                if (json.length > 0) {
                    console.log(`First Item ID: ${JSON.stringify(json[0]).substring(0, 100)}...`);
                }
            }
        });
    }).on('error', e => console.error(e));
}

// Test 1: Limit 1 (No Data) - Trying 'platform' instead of 'platform_number'
testUrl('Limit 1 (platform)', { platform: platform, limit: '1' });

// Test 2: Compression Minimal
testUrl('Compression Minimal', { platform: platform, compression: 'minimal' });

// Test 3: Date Range (Last 30 days - likely empty for this old float)
testUrl('Date Range (Recent)', { platform_number: platform, startDate: '2023-01-01T00:00:00Z' });

// Test 4: Date Range (Old known active time, if applicable)
// 2900883 is active ~2009-2015 based on previous chunks seen in search? 
// Let's try 2010.
testUrl('Date Range (2010)', { platform_number: platform, startDate: '2010-01-01T00:00:00Z', endDate: '2010-02-01T00:00:00Z' });
