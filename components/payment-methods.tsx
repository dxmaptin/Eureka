"use client"

type Method = {
  name: string
  src: string // expected path under /public
}

const methods: Method[] = [
  { name: "Visa", src: "/payments/visa.png" },
  { name: "Mastercard", src: "/payments/mastercard.png" },
  { name: "Amex", src: "/payments/amex.png" },
  { name: "Apple Pay", src: "/payments/applepay.png" },
  { name: "Alipay", src: "/payments/alipay.png" },
  { name: "WeChat Pay", src: "/payments/wechatpay.png" },
]

export function PaymentMethodsRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <span className="text-xs text-slate-400">Fiat supported:</span>
      <div className="flex items-center gap-2">
        {methods.map((m) => (
          <div
            key={m.name}
            className="h-7 w-12 rounded-md bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center overflow-hidden"
            title={m.name}
          >
            {/* Try to show provided asset. If missing, show text fallback. */}
            <img
              src={m.src}
              alt={m.name}
              className="h-5 w-auto object-contain"
              onError={(e) => {
                const parent = (e.target as HTMLImageElement).parentElement
                if (parent) {
                  parent.textContent = m.name
                  parent.classList.add("text-[10px]", "text-slate-200")
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PaymentMethodsRow

