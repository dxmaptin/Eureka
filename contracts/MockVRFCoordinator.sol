// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title VRFCoordinatorV2Mock
 * @dev Industry-standard VRF Coordinator mock for testing, based on Chainlink's design
 */
contract VRFCoordinatorV2Mock is VRFCoordinatorV2Interface {
    uint96 public constant BASE_FEE = 0.25 ether;
    uint96 public constant GAS_PRICE_LINK = 1e9; // 0.000000001 LINK per gas

    uint256 internal requestIdCounter = 1;
    uint256 internal subscriptionIdCounter = 1;
    mapping(uint256 => address) public requestIdToSender;
    mapping(uint256 => uint256) public requestIdToRequestCommitment;
    
    // Subscription management (supporting both uint64 and uint256)
    mapping(uint256 => address) public subscriptionOwners;
    mapping(uint256 => address[]) public subscriptionConsumers;
    mapping(uint256 => uint96) public subscriptionBalances;

    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );

    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256[] randomWords
    );

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external override returns (uint256 requestId) {
        requestId = requestIdCounter++;
        requestIdToSender[requestId] = msg.sender;
        
        uint256 requestCommitment = uint256(keccak256(abi.encode(
            keyHash,
            msg.sender,
            subId,
            requestIdCounter,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords
        )));
        requestIdToRequestCommitment[requestId] = requestCommitment;

        emit RandomWordsRequested(
            keyHash,
            requestId,
            0, // preSeed
            subId,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );

        return requestId;
    }

    /**
     * @dev Extended requestRandomWords for uint256 subscription ID support
     */
    function requestRandomWords(
        bytes32 keyHash,
        uint256 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        requestId = requestIdCounter++;
        requestIdToSender[requestId] = msg.sender;
        
        uint256 requestCommitment = uint256(keccak256(abi.encode(
            keyHash,
            msg.sender,
            subId,
            requestIdCounter,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords
        )));
        requestIdToRequestCommitment[requestId] = requestCommitment;

        emit RandomWordsRequested(
            keyHash,
            requestId,
            0, // preSeed
            uint64(subId), // Cast for event compatibility
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );

        return requestId;
    }

    /**
     * @dev Fulfill a randomness request for testing
     * @param requestId The request ID to fulfill
     * @param randomWords Array of random words to return
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        address sender = requestIdToSender[requestId];
        require(sender != address(0), "nonexistent request");
        require(requestIdToRequestCommitment[requestId] != 0, "already fulfilled");

        // Clear the request commitment
        delete requestIdToRequestCommitment[requestId];
        delete requestIdToSender[requestId];

        // Call the consumer's fulfillRandomWords function
        (bool success,) = sender.call(
            abi.encodeWithSignature("fulfillRandomWords(uint256,uint256[])", requestId, randomWords)
        );
        require(success, "callback failed");

        emit RandomWordsFulfilled(requestId, randomWords);
    }

    /**
     * @dev Fulfill a randomness request with deterministic randomness for testing
     * @param requestId The request ID to fulfill
     * @param seed Seed for generating deterministic randomness
     */
    function fulfillRandomWordsWithSeed(uint256 requestId, uint256 seed) external {
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = uint256(keccak256(abi.encode(seed, requestId, block.timestamp)));
        this.fulfillRandomWords(requestId, randomWords);
    }

    // Implementation of VRFCoordinatorV2Interface functions
    
    function getRequestConfig() external pure override returns (uint16, uint32, bytes32[] memory) {
        bytes32[] memory keyHashes = new bytes32[](1);
        keyHashes[0] = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
        return (3, 500000, keyHashes);
    }

    function createSubscription() external override returns (uint64 subId) {
        subId = uint64(subscriptionIdCounter++);
        subscriptionOwners[subId] = msg.sender;
        return subId;
    }

    function getSubscription(uint64 subId) external view override returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        return (
            subscriptionBalances[subId],
            0, // reqCount - simplified for testing
            subscriptionOwners[subId],
            subscriptionConsumers[subId]
        );
    }

    function requestSubscriptionOwnerTransfer(uint64 subId, address newOwner) external override {
        require(subscriptionOwners[subId] == msg.sender, "Not the owner");
        // In real implementation, this would be a two-step process
        subscriptionOwners[subId] = newOwner;
    }

    function acceptSubscriptionOwnerTransfer(uint64 subId) external override {
        // Simplified for testing - in real implementation, this completes the transfer
        subscriptionOwners[subId] = msg.sender;
    }

    function addConsumer(uint64 subId, address consumer) external override {
        require(subscriptionOwners[subId] == msg.sender, "Not the owner");
        subscriptionConsumers[subId].push(consumer);
    }

    function removeConsumer(uint64 subId, address consumer) external override {
        require(subscriptionOwners[subId] == msg.sender, "Not the owner");
        address[] storage consumers = subscriptionConsumers[subId];
        for (uint i = 0; i < consumers.length; i++) {
            if (consumers[i] == consumer) {
                consumers[i] = consumers[consumers.length - 1];
                consumers.pop();
                break;
            }
        }
    }

    function cancelSubscription(uint64 subId, address to) external override {
        require(subscriptionOwners[subId] == msg.sender, "Not the owner");
        // Transfer any remaining balance
        uint96 balance = subscriptionBalances[subId];
        if (balance > 0) {
            subscriptionBalances[subId] = 0;
            // In real implementation, this would transfer LINK tokens
        }
        delete subscriptionOwners[subId];
        delete subscriptionConsumers[subId];
    }

    function pendingRequestExists(uint64 subId) external view override returns (bool) {
        // For testing, we'll check if any requests are pending for this subscription
        // This is a simplified implementation
        return subscriptionOwners[subId] != address(0);
    }

    /**
     * @dev Check if a specific request exists and is pending (additional testing function)
     */
    function requestExists(uint256 requestId) external view returns (bool) {
        return requestIdToRequestCommitment[requestId] != 0;
    }

    /**
     * @dev Helper function to set up subscriptions for testing
     */
    function createSubscriptionWithId(uint256 subId, address owner, uint96 balance) external {
        subscriptionOwners[subId] = owner;
        subscriptionBalances[subId] = balance;
    }

    /**
     * @dev Helper function to add consumer to subscription for testing
     */
    function addConsumerToSubscription(uint256 subId, address consumer) external {
        subscriptionConsumers[subId].push(consumer);
    }

    /**
     * @dev Extended getSubscription for uint256 support
     */
    function getSubscription(uint256 subId) external view returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        return (
            subscriptionBalances[subId],
            0, // reqCount - simplified for testing
            subscriptionOwners[subId],
            subscriptionConsumers[subId]
        );
    }

}