const { ethers } = require("ethers");
const provider = new ethers.providers.WebSocketProvider("wss://arbitrum-one.publicnode.com");
const privateKey = ""; // 输入你的密钥
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.address;
const currentChallenge = ethers.utils.formatBytes32String("rARB"); //0x7241524200000000000000000000000000000000000000000000000000000000
console.log("address: ", account);

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

//data:application/json,{"p":"rARB-20","op":"mint","tick":"rARB","solution":"0xbbe116f3236aa29d0e0fa0b327a07cd76c6b0175b57b540b6db1ea7a53ce9042","amt":"10000"}
async function send_transaction(solution, nonce) {
    const jsonData = {
        p: "rARB-20",
        op: "mint",
        tick: "rARB",
        solution: solution,
        amt: "10000",
    };
    const dataHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("data:application/json," + JSON.stringify(jsonData)));
    // send transaction
    const gasLimit = await provider.estimateGas({
        to: "0x0000000000000000000000000000000001664799",
        data: dataHex,
    });
    const tx = {
        to: "0x0000000000000000000000000000000001664799",
        nonce: nonce,
        gasLimit: gasLimit.toNumber(),
        data: dataHex,
    };
    await wallet.sendTransaction(tx);
}

async function main(difficulty) {
    let count = 0;
    let nonce = await provider.getTransactionCount(account);
    while (true) {
        let solution = findSolution(difficulty);
        await send_transaction(solution, nonce++);
        console.log(`第${++count}次已完成, solution: ${solution}`);
    }
}

main("0x9999");
