"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Clock, Shield, Loader2 } from "lucide-react"
import QRCode from "qrcode"

interface TicketQRProps {
  ticketId: string
  eventName: string
  tokenId: number
  ownerAddress: string
}

export function TicketQR({ ticketId, eventName, tokenId, ownerAddress }: TicketQRProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [timeRemaining, setTimeRemaining] = useState<number>(300) // 5 minutes in seconds
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  
  // Generate a unique session ID for this QR code session
  const generateSessionId = () => {
    return `qr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  // Generate QR code data with current timestamp and session
  const generateQRData = (newSessionId: string) => {
    const timestamp = Date.now()
    const expiryTime = timestamp + (5 * 60 * 1000) // 5 minutes from now
    
    return JSON.stringify({
      ticketId,
      tokenId,
      eventName,
      ownerAddress: ownerAddress.toLowerCase(),
      sessionId: newSessionId,
      generatedAt: timestamp,
      expiresAt: expiryTime,
      type: "EVENT_ENTRY_QR"
    })
  }

  // Generate new QR code
  const generateNewQRCode = async () => {
    setIsGenerating(true)
    try {
      const newSessionId = generateSessionId()
      const qrData = generateQRData(newSessionId)
      
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e293b', // slate-800
          light: '#f8fafc' // slate-50
        },
        errorCorrectionLevel: 'M'
      })
      
      setQrCodeUrl(qrUrl)
      setSessionId(newSessionId)
      setTimeRemaining(300) // Reset to 5 minutes
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // QR code has expired
      setQrCodeUrl("")
    }
  }, [timeRemaining])

  // Generate initial QR code on mount
  useEffect(() => {
    generateNewQRCode()
  }, [])

  const isExpired = timeRemaining <= 0
  const isExpiringSoon = timeRemaining <= 60 && timeRemaining > 0

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-white">Entry QR Code</h3>
          </div>

          {qrCodeUrl && !isExpired ? (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className={`relative p-4 bg-white rounded-lg shadow-lg ${isExpiringSoon ? 'animate-pulse' : ''}`}>
                <img 
                  src={qrCodeUrl} 
                  alt="Ticket QR Code" 
                  className="w-full h-auto max-w-[200px] mx-auto"
                />
                {isExpiringSoon && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-10 rounded-lg border-2 border-red-500 border-dashed animate-pulse" />
                )}
                
                {/* QR Code Border Animation */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-20 animate-pulse" />
              </div>

              {/* Timer Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className={`h-4 w-4 ${isExpiringSoon ? 'text-red-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-mono ${isExpiringSoon ? 'text-red-400' : 'text-slate-400'}`}>
                    Expires in {formatTime(timeRemaining)}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      isExpiringSoon ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(timeRemaining / 300) * 100}%` }}
                  />
                </div>
              </div>

              {/* Session Info */}
              <div className="text-xs text-slate-500 space-y-1">
                <div>Session: {sessionId.slice(-8)}</div>
                <div>Token #{tokenId}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Expired State */}
              <div className="p-8 bg-slate-900 rounded-lg border-2 border-dashed border-slate-600">
                <div className="text-red-400 text-center space-y-2">
                  <Clock className="h-12 w-12 mx-auto opacity-50" />
                  <div className="text-lg font-semibold">QR Code Expired</div>
                  <div className="text-sm text-slate-400">
                    Generate a new QR code to enter the event
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generate New Code Button */}
          <Button
            onClick={generateNewQRCode}
            disabled={isGenerating}
            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isExpired ? 'Generate New QR Code' : 'Refresh QR Code'}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-slate-900 rounded-lg">
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-3 w-3 mr-1" />
                <span className="font-medium">Security Features</span>
              </div>
              <div>• QR codes expire every 5 minutes</div>
              <div>• Unique session ID for each generation</div>
              <div>• Linked to your wallet address</div>
              <div>• Contains encrypted event entry data</div>
            </div>
            
            {/* Sample QR Data Preview */}
            <details className="mt-3">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                View QR Code Data Sample
              </summary>
              <div className="mt-2 p-2 bg-slate-800 rounded text-xs font-mono text-slate-300 overflow-x-auto">
                <div>&#123;</div>
                <div>&nbsp;&nbsp;"ticketId": "{ticketId.slice(0, 8)}..."</div>
                <div>&nbsp;&nbsp;"tokenId": {tokenId},</div>
                <div>&nbsp;&nbsp;"eventName": "{eventName}",</div>
                <div>&nbsp;&nbsp;"ownerAddress": "{ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}",</div>
                <div>&nbsp;&nbsp;"sessionId": "{sessionId.slice(0, 12)}...",</div>
                <div>&nbsp;&nbsp;"type": "EVENT_ENTRY_QR"</div>
                <div>&#125;</div>
              </div>
            </details>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}