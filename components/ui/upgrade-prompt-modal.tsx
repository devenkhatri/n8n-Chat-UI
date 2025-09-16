'use client'

import React from 'react'
import Button from './button'
import Card from './card'
import Layout from './layout'
import { 
  XMarkIcon,
  SparklesIcon,
  CheckIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface UpgradePromptModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade?: (plan: 'pro' | 'premium') => void
  currentLimit?: number
  usedMessages?: number
  className?: string
}

const plans = [
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$9.99',
    period: 'month',
    description: 'Perfect for regular users',
    features: [
      '500 messages per month',
      'Priority support',
      'Advanced features',
      'Export conversations',
      'Custom themes'
    ],
    popular: false,
    color: 'primary'
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '$19.99',
    period: 'month',
    description: 'Best for power users',
    features: [
      'Unlimited messages',
      '24/7 priority support',
      'All advanced features',
      'API access',
      'Custom integrations',
      'Team collaboration'
    ],
    popular: true,
    color: 'primary'
  }
]

export function UpgradePromptModal({
  isOpen,
  onClose,
  onUpgrade,
  currentLimit = 5,
  usedMessages = 0,
  className
}: UpgradePromptModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<'pro' | 'premium'>('premium')

  const handleUpgrade = () => {
    onUpgrade?.(selectedPlan)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-4xl bg-background max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-6">
          {/* Header */}
          <Layout.Flex justify="between" align="center" className="mb-6">
            <div className="text-center flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <SparklesIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Upgrade Your Experience
              </h2>
              <p className="text-muted-foreground">
                You&apos;ve used {usedMessages} of {currentLimit} messages. Upgrade for unlimited conversations and premium features.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 absolute top-4 right-4"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </Layout.Flex>

          {/* Current usage */}
          <Card className="p-4 mb-6 bg-muted/50">
            <Layout.Flex justify="between" align="center">
              <div className="flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Current Usage</p>
                  <p className="text-xs text-muted-foreground">Free plan</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {usedMessages} / {currentLimit}
                </p>
                <p className="text-xs text-muted-foreground">messages used</p>
              </div>
            </Layout.Flex>
          </Card>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 cursor-pointer transition-all relative ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-border/80'
                } ${plan.popular ? 'border-primary/50' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <StarIcon className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan header */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <Layout.Flex key={index} align="center" className="gap-3">
                        <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </Layout.Flex>
                    ))}
                  </div>

                  {/* Selection indicator */}
                  <div className="pt-4">
                    <div className={`w-full h-2 rounded-full ${
                      selectedPlan === plan.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              Why Upgrade?
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-foreground">Unlimited Conversations</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Chat as much as you want without limits
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2">
                  <ClockIcon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-foreground">Priority Support</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Get help faster with priority support
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2">
                  <ShieldCheckIcon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-foreground">Advanced Features</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Access to all premium features
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Layout.Flex justify="center" className="gap-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-w-[120px]"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="min-w-[120px]"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Upgrade to {plans.find(p => p.id === selectedPlan)?.name}
            </Button>
          </Layout.Flex>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              30-day money-back guarantee • Cancel anytime • Secure payment
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default UpgradePromptModal