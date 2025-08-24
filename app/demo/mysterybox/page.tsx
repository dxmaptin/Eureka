"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/context/wallet-context";
import { MysteryBoxV2ABI } from "@/lib/abis/MysteryBoxV2ABI";
import { toast } from "sonner";

export default function MysteryBoxDemoPage() {
  const { isConnected, address, connect } = useWallet();
  const [contractAddress, setContractAddress] = useState<string>(
    process.env.NEXT_PUBLIC_MYSTERYBOX_ADDRESS ?? "0x4AaC7FfF9e35C72d17ad9a45b87DaB2F64fA9FDE"
  );
  const [boxPriceWei, setBoxPriceWei] = useState<bigint | null>(null);
  const [prizesRemaining, setPrizesRemaining] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [boxId, setBoxId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [result, setResult] = useState<{
    user: string;
    boxId: string;
    tokenId: string;
    uri: string;
  } | null>(null);
  const [availablePrizes, setAvailablePrizes] = useState<string[]>([]);

  // Auto-import NFT to MetaMask
  const addNFTToMetaMask = async (tokenId: string) => {
    if (!window.ethereum) {
      toast.error("MetaMask not found");
      return;
    }

    try {
      const contractAddress = process.env.NEXT_PUBLIC_MYNFT_ADDRESS || "0x791c1B4A7aAfB6Cf1EDcC2404dd58d93080dc2E3";
      
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: contractAddress,
            tokenId: tokenId,
          },
        },
      });
      
      toast.success("NFT added to MetaMask", { description: `Token #${tokenId}` });
    } catch (error: any) {
      console.error("Failed to add NFT to MetaMask:", error);
      toast.error("Failed to add NFT", { description: error.message });
    }
  };

  const contract = useMemo<ethers.Contract | null>(() => {
    try {
      if (!contractAddress || !ethers.isAddress(contractAddress)) return null;
      if (typeof window === "undefined" || !window.ethereum) return null;
      const provider = new ethers.BrowserProvider(window.ethereum);
      return new ethers.Contract(contractAddress, MysteryBoxV2ABI, provider);
    } catch {
      return null;
    }
  }, [contractAddress]);

  // Read basic state and validate address
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!contract) return;
      try {
        // Validate there is contract code at the address
        const provider = new ethers.BrowserProvider(window.ethereum);
        const code = await provider.getCode(contractAddress);
        if (!mounted) return;
        if (!code || code === "0x") {
          toast.error("No contract found at address", {
            description: `${contractAddress}`,
          });
          return;
        }

        const c = contract as ethers.Contract;
        // Read essential fields first
        const price = await c.boxPrice();
        const remaining = await c.prizesRemaining();
        const prizes = await c.getPrizeURIs();
        if (!mounted) return;
        setBoxPriceWei(price);
        setPrizesRemaining(remaining);
        setAvailablePrizes(prizes);

        // Try VRF details optionally; ignore failures
        try {
          const subId = await c.vrfSubscriptionId();
          if (!mounted) return;
          console.log("VRF Subscription ID:", subId?.toString?.());
        } catch (vrfErr) {
          console.debug("VRF reads optional failed", vrfErr);
        }
      } catch (e: any) {
        console.error(e);
        toast.error("Failed to read contract state", {
          description: e?.shortMessage || e?.message,
        });
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [contract]);

  // Listen to events for live feedback - filtered by connected user
  useEffect(() => {
    if (!contract || !address) return;

    const onPurchased = (user: string, emittedBoxId: ethers.BigNumberish) => {
      console.log("BoxPurchased event received:", { user, emittedBoxId, connectedUser: address });
      
      // Only process events for the connected user
      if (user.toLowerCase() !== address.toLowerCase()) {
        console.log("Ignoring BoxPurchased event - not for connected user");
        return;
      }
      
      console.log("Processing BoxPurchased event for connected user");
      setBoxId(ethers.toNumber(emittedBoxId).toString());
      toast.message("Box purchased", { description: `Box ID ${emittedBoxId}` });
    };

    const onOpened = (
      user: string,
      emittedBoxId: ethers.BigNumberish,
      tokenId: ethers.BigNumberish,
      uri: string
    ) => {
      console.log("BoxOpened event received:", { user, emittedBoxId, tokenId, uri, connectedUser: address });
      
      // Only process events for the connected user
      if (user.toLowerCase() !== address.toLowerCase()) {
        console.log("Ignoring BoxOpened event - not for connected user");
        return;
      }
      
      console.log("Processing BoxOpened event for connected user - YOU GOT YOUR PRIZE!");
      setResult({
        user,
        boxId: ethers.toNumber(emittedBoxId).toString(),
        tokenId: ethers.toNumber(tokenId).toString(),
        uri,
      });
      toast.success("Box opened!", { description: `Token #${tokenId}` });
      // refresh basic state
      contract
        .prizesRemaining()
        .then((r: bigint) => setPrizesRemaining(r))
        .catch(() => {});
    };

    contract.on("BoxPurchased", onPurchased);
    contract.on("BoxOpened", onOpened);
    return () => {
      contract.off("BoxPurchased", onPurchased);
      contract.off("BoxOpened", onOpened);
    };
  }, [contract, address]);

  const handleBuyOpen = async () => {
    if (!isConnected) {
      await connect("metamask");
    }
    if (!contract) {
      toast.error("Invalid contract address");
      return;
    }
    try {
      setIsLoading(true);
      setTxHash(null);
      setRequestId(null);
      setResult(null);
      setBoxId(null);
      // Preflight: ensure code exists at address
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(contractAddress);
      if (!code || code === "0x") {
        toast.error("No contract found at address", { description: contractAddress });
        return;
      }

      const c = contract as ethers.Contract;
      const price = await c.boxPrice();
      const totalPrice = price * BigInt(quantity);
      
      // Use a signer-connected instance for the write call
      const signer = await provider.getSigner();
      const writeContract = new ethers.Contract(contractAddress, MysteryBoxV2ABI, signer);
      
      // Call batch function for quantity support
      const tx = quantity === 1 
        ? await writeContract.purchaseAndOpenBox({ value: totalPrice })
        : await writeContract.purchaseAndOpenBoxes(quantity, { value: totalPrice });
      setTxHash(tx.hash);
      toast.message("Transaction sent", { description: tx.hash });

      const receipt = await tx.wait();
      // Try to extract emitted BoxPurchased from receipt (as a fallback to listener)
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === "BoxPurchased") {
            setBoxId(ethers.toNumber(parsed.args.boxId).toString());
          }
        } catch {}
      }
      // Inform user we are awaiting VRF fulfillment (real VRF on Sepolia can take time)
      toast.message("Awaiting VRF fulfillment", {
        description: "This may take a moment on testnets. Listening for your prize...",
      });
      
      // Log for debugging
      console.log("VRF request sent. Waiting for BoxOpened event for user:", address);
      console.log("Current prizes remaining:", prizesRemaining?.toString());
    } catch (e: any) {
      console.error(e);
      toast.error("Buy & Open failed", { description: e?.shortMessage || e?.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MysteryBox Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="addr">Contract Address</Label>
            <Input
              id="addr"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity (1-10)</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <div>Connected: {isConnected ? "Yes" : "No"}</div>
            <div>Account: {isConnected ? address : "-"}</div>
            <div>
              Box Price: {boxPriceWei ? `${ethers.formatEther(boxPriceWei)} ETH` : "-"}
            </div>
            <div>
              Total Cost: {boxPriceWei ? `${ethers.formatEther(boxPriceWei * BigInt(quantity))} ETH` : "-"}
            </div>
            <div>Prizes Remaining: {prizesRemaining?.toString() ?? "-"}</div>
          </div>

          {availablePrizes.length > 0 && (
            <Card className="mt-4 border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-800">🎲 Available Prizes ({availablePrizes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  {availablePrizes.map((prize, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-mono">
                        {index + 1}
                      </span>
                      <span className="font-mono text-gray-700">{prize.split('/').pop()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-purple-600">
                  🎯 One will be randomly selected when you open a box!
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => connect("metamask")} disabled={isConnected} variant="secondary">
              {isConnected ? "Connected" : "Connect Wallet"}
            </Button>
            <Button onClick={handleBuyOpen} disabled={isLoading || !contract}>
              {isLoading ? "Processing..." : "Buy & Open"}
            </Button>
          </div>

          {txHash && (
            <div className="text-sm">
              <span className="font-medium">Tx:</span> {txHash}
            </div>
          )}

          {boxId && (
            <div className="text-sm">
              <span className="font-medium">Box ID:</span> {boxId}
            </div>
          )}

          {result && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-800">🎁 Mystery Box Opened!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Box ID:</span>
                    <div className="font-mono text-lg">#{result.boxId}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">NFT Token ID:</span>
                    <div className="font-mono text-lg">#{result.tokenId}</div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <span className="font-medium text-gray-600">Prize URI:</span>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                    {result.uri}
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <span className="font-medium text-gray-600">Prize Details:</span>
                  <div className="mt-1 text-sm text-gray-700">
                    You won prize: <span className="font-semibold">{result.uri.split('/').pop()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    This was randomly selected from {availablePrizes.length} available prizes
                  </div>
                </div>

                <div className="border-t pt-3 bg-blue-50 -mx-4 -mb-4 px-4 pb-4 rounded-b">
                  <div className="text-sm font-medium text-blue-800 mb-2">Add to MetaMask:</div>
                  <div className="text-xs space-y-1 text-blue-700 mb-3">
                    <div><span className="font-medium">Contract:</span> {process.env.NEXT_PUBLIC_MYNFT_ADDRESS || "0x791c1B4A7aAfB6Cf1EDcC2404dd58d93080dc2E3"}</div>
                    <div><span className="font-medium">Token ID:</span> {result.tokenId}</div>
                  </div>
                  <Button 
                    onClick={() => addNFTToMetaMask(result.tokenId)}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    Import NFT to MetaMask
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


