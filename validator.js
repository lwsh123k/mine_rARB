const { ethers } = require("ethers");

const currentChallenge = ethers.utils.formatBytes32String("rARB");
const potentialSolution = "0x44449989e4da9f266507447cf15a99fbe5e271f1f7ab7d55df36036aa6c11a42";
const mineAddr = "0x6C2648A41696227276aC781E5DbAB8166f9df420";
const hashedSolution = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "address"],
        [potentialSolution, currentChallenge, mineAddr]
    )
);
console.log(hashedSolution);

let difficulty = "0x9999";
if (hashedSolution.startsWith(difficulty)) {
    isvalidSolution = true;
    console.log(isvalidSolution);
}
