const https = require('https');
const axios = require('axios');
const tunnel = require('tunnel');
const cheerio = require('cheerio');

const DELAY_BETWEEN_CHECKS = 2000; // 2 giây delay giữa các lần kiểm tra

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkUsrEbayStatus(usr, agent) {
    if (!usr) {
        return null;
    }

    if (usr === "") {
        return "";
    }

    try {
        // Fetch listing information
        const listingUrl = `https://www.ebay.com/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=${usr}&_oac=1`;
        const listingResponse = await axios.get(listingUrl, {
            httpsAgent: agent,
            timeout: 30000,
            maxRedirects: 5,
        });

        const $ = cheerio.load(listingResponse.data);
        const listingText = $('.srp-controls__count').text();
        const listing = listingText.includes("results") ?
            listingText.replace("results", "").trim() :
            listingText.replace("result", "").trim();

        // Fetch feedback information
        const feedbackUrl = `https://feedback.ebay.com/fdbk/feedback_profile/${usr}`;
        const feedbackResponse = await axios.get(feedbackUrl, {
            httpsAgent: agent,
            timeout: 30000,
            maxRedirects: 5,
        });

        const feedbackHtml = feedbackResponse.data;
        const memberSinceMatch = feedbackHtml.match(/Member since: ([A-z]{3}.+?) in ([A-z]{3}.+?)<\//);
        const feedbackScoreMatch = feedbackHtml.match(/Feedback score is (.+?)"/);

        if (feedbackHtml.includes("Not a registered user")) {
            return { status: "SUSPEND", user: usr };
        }

        const memberSince = memberSinceMatch ? memberSinceMatch[1] : 'N/A';
        const feedbackScore = feedbackScoreMatch ? feedbackScoreMatch[1] : 'N/A';

        return {
            user: usr,
            status: "ACTIVE",
            listing,
            feedbackScore,
            memberSince
        };

    } catch (error) {
        console.error(`Error checking eBay status for ${usr}:`, error.message);
        return { user: usr, status: "ERROR", error: error.message };
    }
}

async function main(proxy, userList) {
    const agent = proxy ? tunnel.httpsOverHttp({
        proxy: {
            host: proxy.split(':')[0],
            port: parseInt(proxy.split(':')[1])
        }
    }) : null;

    const results = [];
    for (const user of userList) {
        const result = await checkUsrEbayStatus(user.trim(), agent);
        results.push(result);
        await sleep(DELAY_BETWEEN_CHECKS);
    }
    return results;
}

module.exports = { main };