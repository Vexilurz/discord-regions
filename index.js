import dns from 'node:dns';
import fetch from 'node-fetch';
import regions from "./regions.json" assert { type: "json" };
import fs from 'node:fs';

const IPINFO_API_KEY = "key here";

const loops = 15000;
var regionscomplete = {};


async function processDomains() {
    for (const region of regions) {
        for (let i = 0; i < loops; i++) {
            const domain = `${region}${i + 1}.discord.gg`;
            console.log(domain)
            try {
                const address = await resolveDNS(domain);
                await resolveData(address, domain, region);
            } catch (error) {
                // console.error(`Error resolving ${domain}:`, error);
            }
        }
    }
}

function resolveDNS(domain) {
    return new Promise((resolve, reject) => {
        dns.lookup(domain, (err, address) => {
            if (err) {
                reject(err);
            } else {
                resolve(address);
            }
        });
    });
};

async function resolveData(ip, dnsDomain, region) {
    console.log('getting ip info');
    try {
        const response = await fetch(`https://ipinfo.io/${ip}/json?token=${IPINFO_API_KEY}`);
        const responseData = await response.json();
        const completeObject = {
            "ip": ip,
            "dns": dnsDomain,
            "city": responseData.city,
            "region": responseData.region,
            "country": responseData.country,
            "org": responseData.org
        };
        console.log(completeObject);
        pushRegionData(region, completeObject)
    } catch (error) {
        console.error(`Error fetching IP info for ${dnsDomain}:`, error);
    };
};

function pushRegionData(region, data) {

    if (!regionscomplete.hasOwnProperty(region)) {
        regionscomplete[region] = []; // initialize an empty array for the region if it doesn't exist already
    };
    
    regionscomplete[region].push(data); // add the resolved data to the region array
};

processDomains();
process.on('exit', beforeProcessExit);

function beforeProcessExit() {
    const jsonContent = JSON.stringify(regionscomplete);
    fs.writeFileSync('./output.json', jsonContent, (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('JSON file saved successfully!');
        }
    });
    console.log("Before process exit");
    console.log(regionscomplete);

    // Write the JSON string to a file
};