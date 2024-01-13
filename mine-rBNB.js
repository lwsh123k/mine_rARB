const { ethers } = require("ethers");
const axios = require("axios");
const https = require("https");
const provider = new ethers.providers.WebSocketProvider("wss://arbitrum-one.publicnode.com");
const privateKey = ""; // 输入你的密钥
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.address;
const currentChallenge = ethers.utils.hexlify("0x72424e4200000000000000000000000000000000000000000000000000000000");
console.log("address: ", account);

// close tls
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
    }),
});

// 查找可能的solution
function findSolution(difficulty) {
    while (1) {
        const random_value = ethers.utils.randomBytes(32);
        const potential_solution = ethers.utils.hexlify(random_value);
        const hashed_solution = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["bytes32", "bytes32", "address"],
                [potential_solution, currentChallenge, account]
            )
        );
        if (hashed_solution.startsWith(difficulty)) {
            return potential_solution;
        }
    }
}

// 发送交易到对方服务器
async function send_request(solution) {
    // construct a request
    const url = "https://ec2-18-217-135-255.us-east-2.compute.amazonaws.com/validate";
    const jsonData = {
        solution: solution,
        challenge: "0x72424e4200000000000000000000000000000000000000000000000000000000",
        address: account,
        difficulty: "0x9999",
        tick: "rBNB",
    };
    headers = {
        authority: "ec2-18-217-135-255.us-east-2.compute.amazonaws.com",
        accept: "application/json, text/plain, */*",
        "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://bnb.reth.cc",
        pragma: "no-cache",
        referer: "https://bnb.reth.cc/",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    // send requests
    try {
        const response = await axiosInstance.post(url, jsonData, { headers: headers });
        console.log(response.data);
    } catch (error) {
        console.error("Error making the request:", error);
    }
}

async function main(difficulty) {
    let count = 0;
    while (true) {
        let solution = findSolution(difficulty);
        await send_request(solution);
        console.log(`第${++count}次已完成, solution: ${solution}`);
    }
}

main("0x9999");
