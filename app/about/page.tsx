import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Shield, Zap, RefreshCw, DollarSign, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            About NFTickets
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Revolutionizing event ticketing with blockchain technology
          </p>
        </div>

        {/* Executive Summary */}
        <Card className="bg-slate-800/50 border-slate-700 mb-12 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
            <CardContent className="p-8 relative">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Executive Summary</h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Traditional ticketing faces rampant fraud, unpredictable pricing, and opaque revenue flows that
                disadvantage organizers and fans alike. NFTickets's blockchain-enabled platform remedies these
                shortcomings by minting tickets as NFTs, enforcing programmable royalties, and integrating dynamic
                ticket validation for secure entry. By providing seamless onboarding for both web2 and web3 users
                through email sign-up or wallet connection, alongside flexible payment options in both fiat and crypto,
                NFTickets creates an intuitive experience that meets users at their level of blockchain familiarity.
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Mission & Vision + Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-slate-800/50 border-slate-700 h-full">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Core Mission & Vision</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Democratized Access</h3>
                    <p className="text-slate-300">
                      Creating equitable opportunities for the general public to attend live events at fair prices.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Anti-Scalping Measures</h3>
                    <p className="text-slate-300">
                      Implementing technological solutions to prevent ticket scalping and price manipulation.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Revenue Sharing</h3>
                    <p className="text-slate-300">
                      Ensuring event organizers benefit from secondary market sales through automated royalty
                      distribution.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Market Regulation</h3>
                    <p className="text-slate-300">
                      Facilitating authentic ticket trading through a regulated secondary marketplace system.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 h-full">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Value Proposition</h2>
              <p className="text-slate-300 mb-6">
                By addressing the critical challenges of ticket scalping and inflated resale prices, NFTickets creates a
                win-win scenario for both event organizers and attendees.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-500 mb-2" />
                  <h3 className="font-semibold text-white mb-1">Fair Revenue Share</h3>
                  <p className="text-sm text-slate-300">
                    Event organizers receive a fair share of secondary market revenues
                  </p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <Users className="h-8 w-8 text-purple-500 mb-2" />
                  <h3 className="font-semibold text-white mb-1">Fan Access</h3>
                  <p className="text-sm text-slate-300">Genuine fans can access events at reasonable prices</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-500 mb-2" />
                  <h3 className="font-semibold text-white mb-1">Authentic Transactions</h3>
                  <p className="text-sm text-slate-300">Secondary market transactions remain authentic and regulated</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <RefreshCw className="h-8 w-8 text-purple-500 mb-2" />
                  <h3 className="font-semibold text-white mb-1">Enhanced Experience</h3>
                  <p className="text-sm text-slate-300">
                    The overall event experience is enhanced through transparent and fair ticketing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology Solution */}
        <Card className="bg-slate-800/50 border-slate-700 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Our Technology Solution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-800 p-6 rounded-xl border border-purple-700/30">
                <Shield className="h-10 w-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Fraud Reduction</h3>
                <p className="text-slate-300">
                  Time-sensitive QR codes and on‑chain ownership checks eliminate counterfeit tickets and screenshot
                  scams.
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-900/40 to-slate-800 p-6 rounded-xl border border-pink-700/30">
                <Zap className="h-10 w-10 text-pink-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Cost Savings</h3>
                <p className="text-slate-300">
                  Lazy minting defers on‑chain costs until purchase, minimizing upfront gas fees.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-slate-800 p-6 rounded-xl border border-blue-700/30">
                <RefreshCw className="h-10 w-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Transparency & Trust</h3>
                <p className="text-slate-300">Immutable ledger of all ticket transfers with embedded royalty logic.</p>
              </div>
              <div className="bg-gradient-to-br from-violet-900/40 to-slate-800 p-6 rounded-xl border border-violet-700/30">
                <Users className="h-10 w-10 text-violet-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Enhanced UX</h3>
                <p className="text-slate-300">
                  Simplified onboarding via custodial wallets plus optional self‑custody for crypto‑native fans.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tickets">Tickets & NFTs</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-slate-700">
                      <AccordionTrigger className="text-white">What is NFTickets?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        NFTickets is a blockchain-based ticketing platform that converts event tickets into NFTs
                        (Non-Fungible Tokens), providing enhanced security, transparency, and new opportunities for both
                        event organizers and attendees.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border-slate-700">
                      <AccordionTrigger className="text-white">
                        How does NFTickets prevent ticket scalping?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        NFTickets uses smart contracts to enforce price caps on resales and ensures that a percentage of
                        secondary sales goes back to event organizers. This reduces the incentive for scalping while
                        creating a more sustainable ecosystem.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border-slate-700">
                      <AccordionTrigger className="text-white">
                        Do I need to understand blockchain to use NFTickets?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Not at all! We've designed NFTickets to be user-friendly for everyone. You can sign up with just
                        an email address and purchase tickets with a credit card. The blockchain technology works behind
                        the scenes to provide you with benefits without requiring technical knowledge.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-slate-700">
                      <AccordionTrigger className="text-white">What is an NFT ticket?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        An NFT ticket is a digital ticket that exists on the blockchain. It contains all the information
                        of a traditional ticket but with added benefits: it can't be counterfeited, its ownership
                        history is transparent, and it can include programmable features like royalties for resales.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border-slate-700">
                      <AccordionTrigger className="text-white">How do I access my NFT tickets?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Your tickets are accessible through your NFTickets account. Simply log in to view your tickets
                        in the "My Tickets" section. Each ticket includes a QR code that will be scanned for entry at
                        the event.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border-slate-700">
                      <AccordionTrigger className="text-white">
                        Can I transfer my ticket to someone else?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Yes, you can transfer your NFT ticket to another user through our platform. The transfer will be
                        recorded on the blockchain, ensuring transparency and security. Some events may have
                        restrictions on transfers or resale price caps set by the organizers.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border-slate-700">
                      <AccordionTrigger className="text-white">
                        What happens to my NFT ticket after the event?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Your NFT ticket remains in your collection as a digital memorabilia of the event you attended.
                        Some event organizers may add post-event benefits to ticket holders, such as exclusive content
                        or discounts on future events.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-slate-700">
                      <AccordionTrigger className="text-white">What payment methods are accepted?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        NFTickets accepts both traditional payment methods (credit/debit cards) and cryptocurrency
                        payments. You can choose your preferred payment method during checkout.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border-slate-700">
                      <AccordionTrigger className="text-white">
                        Are there additional fees when purchasing tickets?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        There is a small service fee added to each ticket purchase to cover platform costs. When using
                        cryptocurrency, there may be network gas fees that vary depending on blockchain congestion. We
                        use lazy minting to minimize these costs.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border-slate-700">
                      <AccordionTrigger className="text-white">How do refunds work?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Refund policies are set by event organizers and vary by event. When an event allows refunds, you
                        can request one through your account. Approved refunds will be processed to your original
                        payment method.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border-slate-700">
                      <AccordionTrigger className="text-white">
                        Do I need cryptocurrency to use NFTickets?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        No, you don't need cryptocurrency to use NFTickets. While we support crypto payments, you can
                        purchase tickets using traditional payment methods like credit cards. The blockchain benefits
                        are still applied to your tickets regardless of your payment method.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-slate-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Have More Questions?</h2>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              We're here to help! If you have any questions or need assistance, our support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:support@nftickets.com"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                Visit Help Center
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
