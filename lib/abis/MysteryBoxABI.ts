export const MysteryBoxABI = [
  // Events
  {
    type: "event",
    name: "BoxPurchased",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "boxId", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "BoxOpened",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "boxId", type: "uint256", indexed: false },
      { name: "prizeTokenId", type: "uint256", indexed: false },
      { name: "prizeURI", type: "string", indexed: false }
    ],
    anonymous: false
  },
  // Read
  {
    type: "function",
    stateMutability: "view",
    name: "boxPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "prizesRemaining",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "vrfSubscriptionId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "COORDINATOR",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "isConsumerRegistered",
    inputs: [],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getSubscriptionInfo",
    inputs: [],
    outputs: [
      { name: "balance", type: "uint96" },
      { name: "reqCount", type: "uint64" },
      { name: "owner", type: "address" },
      { name: "consumers", type: "address[]" }
    ]
  },
  // Write
  {
    type: "function",
    stateMutability: "payable",
    name: "purchaseAndOpenBox",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    stateMutability: "payable",
    name: "purchaseAndOpenBoxes",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [{ name: "boxIds", type: "uint256[]" }]
  }
];


