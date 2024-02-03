const { ethers } = require('ethers');
const log4js = require("log4js");
log4js.configure({
    appenders: { rollup: { type: 'file', filename: 'rollup_logs.log', flags: 'w' } },
    categories: { default: { appenders: ['rollup'], level: 'all' } }
});


// queste magari vanno messe in un file apposito
const MINISTER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const RECIPIENT_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
const NODE_URL_PRIVATE = 'http://localhost:8545';
const NODE_URL_PUBLIC = 'http://localhost:8546';
const ROLLUP_ONCE_EVERY = 5;

// questa va bene qui penso
var lastRollupCheckpoint = -1;

/**
 * Write a rollup of the private chain on the public chain
 * @param {ethers.JsonRpcProvider} privateProvider provider of the private chain
 * @param {string} publicUrl url of the public chain
 * @param {Number} endBlock id of the last block to be included in the rollup
 */
async function writeRollup(privateProvider, publicUrl, endBlock, logger) {
    let toHash = '';
    let startBlock = lastRollupCheckpoint + 1;

    // Iterate through all new blocks of private chain
    for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
        let block = await privateProvider.getBlock(blockNumber);

        // Concatenate all hashes of the blocks
        toHash += block.hash;
    }

    // compute hash of concatenated hashes
    let hashDigest = ethers.keccak256(ethers.toUtf8Bytes(toHash))

    // Pack the data to be sent in the transaction
    let packedData = ethers.solidityPacked(['bytes32', 'uint256', 'uint256'], [hashDigest, startBlock, endBlock]);

    // Extracting info from packed data to verify correctness
    let revertedhash = packedData.slice(0, 66);
    let lowerLimit = Number(BigInt('0x' + packedData.slice(66, 130)));
    let upperLimit = Number(BigInt('0x' + packedData.slice(130)));
    if ((lowerLimit != startBlock) || (upperLimit != endBlock) || (revertedhash != hashDigest)) {
        logger.error('Packed data for blocks from', startBlock, 'to', endBlock, 'is incorrect');
    }

    // Connect to the public chain
    let publicProvider = new ethers.JsonRpcProvider(publicUrl);
    let wallet = new ethers.Wallet(MINISTER_PRIVATE_KEY, publicProvider);

    // Send the transaction
    let transaction = {
        to: RECIPIENT_ADDRESS,
        value: ethers.parseUnits('1', 'wei'),
        data: packedData
    };
    let transactionResponse = await wallet.sendTransaction(transaction);

    // Log the result into the log file
    logger.info('Rollup sent\n'
        + 'Public chain tx id:', transactionResponse.hash, '\n'
    + 'Rollup hash:', hashDigest, '\n'
    + 'Starting block:', startBlock, '\n'
    + 'Ending block:', endBlock);
}

/**
 * Put the script in listening for new blocks published on the private chain
 * @param {string} nodeUrl url of the private chain
 */
async function listenForBlocks(nodeUrl) {
    const privateProvider = new ethers.JsonRpcProvider(nodeUrl);
    const logger = log4js.getLogger("rollup");

    // Listen for new blocks
    privateProvider.on('block', async (blockNumber) => {
        let finalizedBlock = await privateProvider.getBlock('finalized');

        if ((finalizedBlock.number != 0) && (finalizedBlock.number != lastRollupCheckpoint) && (finalizedBlock.number % ROLLUP_ONCE_EVERY === 0)) {
            await writeRollup(privateProvider, NODE_URL_PUBLIC, finalizedBlock.number, logger);
            lastRollupCheckpoint = finalizedBlock.number;
        }
    });

    // Poll for connection status
    const checkConnectionStatus = async () => {
        try {
            await privateProvider.getBlockNumber(); // Try to fetch the block number to check the connection
        } catch (error) {
            // shutdown the script in case of connection loss
            await logger.warn('Connection to Ethereum node is lost:', error);
            process.exit(1);
        }
    };
    setInterval(checkConnectionStatus, 2000);
}

async function main() {
    listenForBlocks(NODE_URL_PRIVATE);
}

main();