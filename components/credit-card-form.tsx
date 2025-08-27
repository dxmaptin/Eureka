"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { CreditCard } from "lucide-react"

interface CreditCardFormProps {
  onValidityChange?: (isValid: boolean) => void
  onDataChange?: (data: CreditCardData) => void
}

export interface CreditCardData {
  cardNumber: string
  expiryDate: string
  cvc: string
  nameOnCard: string
}

export function CreditCardForm({ onValidityChange, onDataChange }: CreditCardFormProps) {
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    nameOnCard: ""
  })

  const [errors, setErrors] = useState<Partial<CreditCardData>>({})

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    // Limit to 16 digits
    const limited = cleaned.substring(0, 16)
    // Add spaces every 4 digits
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    // Limit to 4 digits
    const limited = cleaned.substring(0, 4)
    // Add slash after 2 digits
    if (limited.length >= 2) {
      return limited.substring(0, 2) + '/' + limited.substring(2)
    }
    return limited
  }

  // Format CVC (3 or 4 digits)
  const formatCVC = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 4)
  }

  // Validate card number using Luhn algorithm
  const validateCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.length < 13 || cleaned.length > 19) return false

    let sum = 0
    let alternate = false
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let n = parseInt(cleaned.charAt(i), 10)
      if (alternate) {
        n *= 2
        if (n > 9) {
          n = (n % 10) + 1
        }
      }
      sum += n
      alternate = !alternate
    }
    return sum % 10 === 0
  }

  // Validate expiry date
  const validateExpiryDate = (expiry: string) => {
    if (expiry.length !== 5) return false
    const [month, year] = expiry.split('/')
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt('20' + year, 10)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    if (monthNum < 1 || monthNum > 12) return false
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) return false
    return true
  }

  // Validate CVC
  const validateCVC = (cvc: string) => {
    return cvc.length >= 3 && cvc.length <= 4
  }

  // Validate name on card
  const validateNameOnCard = (name: string) => {
    return name.trim().length >= 2
  }

  // Check if form is valid
  const isFormValid = () => {
    return validateCardNumber(cardData.cardNumber) &&
           validateExpiryDate(cardData.expiryDate) &&
           validateCVC(cardData.cvc) &&
           validateNameOnCard(cardData.nameOnCard)
  }

  // Handle input changes
  const handleInputChange = (field: keyof CreditCardData, value: string) => {
    let formattedValue = value
    let newErrors = { ...errors }

    // Format based on field type
    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value)
        if (formattedValue && !validateCardNumber(formattedValue)) {
          newErrors.cardNumber = 'Please enter a valid card number'
        } else {
          delete newErrors.cardNumber
        }
        break
      case 'expiryDate':
        formattedValue = formatExpiryDate(value)
        if (formattedValue.length === 5 && !validateExpiryDate(formattedValue)) {
          newErrors.expiryDate = 'Please enter a valid expiry date'
        } else {
          delete newErrors.expiryDate
        }
        break
      case 'cvc':
        formattedValue = formatCVC(value)
        if (formattedValue && !validateCVC(formattedValue)) {
          newErrors.cvc = 'Please enter a valid CVC'
        } else {
          delete newErrors.cvc
        }
        break
      case 'nameOnCard':
        if (value && !validateNameOnCard(value)) {
          newErrors.nameOnCard = 'Please enter the name on card'
        } else {
          delete newErrors.nameOnCard
        }
        break
    }

    const newCardData = { ...cardData, [field]: formattedValue }
    setCardData(newCardData)
    setErrors(newErrors)

    // Call callbacks
    onDataChange?.(newCardData)
    onValidityChange?.(Object.keys(newErrors).length === 0 && isFormValid())
  }

  // Detect card type
  const getCardType = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.startsWith('4')) return 'Visa'
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard'
    if (cleaned.startsWith('3')) return 'American Express'
    return 'Credit Card'
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Card Number</label>
        <div className="relative">
          <Input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            className="bg-slate-900 border-slate-600 text-white pl-10 pr-20"
            maxLength={19}
          />
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          {cardData.cardNumber && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
              {getCardType(cardData.cardNumber)}
            </div>
          )}
        </div>
        {errors.cardNumber && (
          <p className="text-sm text-red-400">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Expiry Date</label>
          <Input
            type="text"
            placeholder="MM/YY"
            value={cardData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            className="bg-slate-900 border-slate-600 text-white"
            maxLength={5}
          />
          {errors.expiryDate && (
            <p className="text-sm text-red-400">{errors.expiryDate}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">CVC</label>
          <Input
            type="text"
            placeholder="123"
            value={cardData.cvc}
            onChange={(e) => handleInputChange('cvc', e.target.value)}
            className="bg-slate-900 border-slate-600 text-white"
            maxLength={4}
          />
          {errors.cvc && (
            <p className="text-sm text-red-400">{errors.cvc}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Name on Card</label>
        <Input
          type="text"
          placeholder="John Doe"
          value={cardData.nameOnCard}
          onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
          className="bg-slate-900 border-slate-600 text-white"
        />
        {errors.nameOnCard && (
          <p className="text-sm text-red-400">{errors.nameOnCard}</p>
        )}
      </div>

      {/* Card preview */}
      {cardData.cardNumber && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
          <div className="flex justify-between items-start mb-8">
            <div className="text-sm opacity-80">{getCardType(cardData.cardNumber)}</div>
            <div className="text-sm opacity-80">****</div>
          </div>
          <div className="font-mono text-lg mb-4 tracking-wider">
            {cardData.cardNumber || '•••• •••• •••• ••••'}
          </div>
          <div className="flex justify-between">
            <div>
              <div className="text-xs opacity-80">CARDHOLDER</div>
              <div className="text-sm font-medium">
                {cardData.nameOnCard || 'NAME ON CARD'}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-80">EXPIRES</div>
              <div className="text-sm font-medium">
                {cardData.expiryDate || 'MM/YY'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}