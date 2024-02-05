const { ethers } = require('ethers');
const config = require('./rollup_config.js');
const log4js = require("log4js");
log4js.configure({
    appenders: { rollup: { type: 'file', filename: 'scripts/rollup_logs.log', flags: 'w' } },
    categories: { default: { appenders: ['rollup'], level: 'all' } }
});


// Last block number included in the last rollup
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
    let numberDigest = BigInt(hashDigest); // convert to integer to save gas

    // Pack the data to be sent in the transaction
    let packedData = ethers.solidityPacked(['uint256', 'uint256', 'uint256'], [numberDigest, startBlock, endBlock]);

    // Extracting info from packed data to verify correctness
    let revertedhash = packedData.slice(0, 66);
    let lowerLimit = Number(BigInt('0x' + packedData.slice(66, 130)));
    let upperLimit = Number(BigInt('0x' + packedData.slice(130)));
    if ((lowerLimit != startBlock) || (upperLimit != endBlock) || (revertedhash != hashDigest)) {
        logger.error('Packed data for blocks from', startBlock, 'to', endBlock, 'is incorrect');
    }

    // Connect to the public chain
    let publicProvider = new ethers.JsonRpcProvider(publicUrl);
    let wallet = new ethers.Wallet(config.MINISTER_PRIVATE_KEY, publicProvider);

    // Send the transaction
    let transaction = {
        to: config.RECIPIENT_ADDRESS,
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
    const logger = log4js.getLogger("rollup"); // logs are written in rollup_logs.log

    // Listen for new blocks
    privateProvider.on('block', async (blockNumber) => {
        if (blockNumber % config.ROLLUP_ONCE_EVERY === 0) { // when 1 block out of ROLLUP_ONCE_EVERY is proposed
            let finalizedBlock = (await privateProvider.getBlock('finalized')).number; // get the latest finalized block number, so history is very likely to be stable
            let endBlock = lastRollupCheckpoint === -1 ? config.ROLLUP_ONCE_EVERY : lastRollupCheckpoint + config.ROLLUP_ONCE_EVERY; // compute the next rollup endpoint block number

            if ((finalizedBlock != 0) && (finalizedBlock != lastRollupCheckpoint) && (finalizedBlock >= endBlock)) { // if the rollup endpoint block is already finalized
                await writeRollup(privateProvider, config.NODE_URL_PUBLIC, endBlock, logger); // write the rollup
                lastRollupCheckpoint = endBlock; // update the last rollup checkpoint
            }
        }
    });

    // Poll for connection status
    const checkConnectionStatus = async () => {
        try {
            await privateProvider.getBlockNumber(); // Try to fetch the block number to check the connection
        } catch (error) {
            // shutdown the script when hardhat is shut down
            await logger.warn('Connection to Ethereum node is lost:', error);
            process.exit(1);
        }
    };
    setInterval(checkConnectionStatus, 3000);
}

async function main() {
    listenForBlocks(config.NODE_URL_PRIVATE);
}

main();
