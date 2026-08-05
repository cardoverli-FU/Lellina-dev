'use client'

import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

/**
 * FAQ — Tab panel: Galz
 *
 * Answers the questions every galz asks before joining.
 * Light bg (bg-ivory) → dark text per Contrast Rule.
 * No tech stack exposed. No "lesbian" word. No subscription language.
 * Public surfaces contain NO pricing — pricing questions live in-app.
 */
const FAQS = [
  {
    q: 'Can men join?',
    a: 'No. Period. Every galz passes the same four-step gate before she can even register. No exceptions. No backdoors. This is not a policy — it\u2019s code.',
  },
  {
    q: 'How do you verify women?',
    a: 'A live selfie, a voice note, a live code on camera, and a final review. Every signal is checked. If anything feels off, the gate stays closed. We never store your verification data — it flows through and is gone.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your verification data is never written to disk. Your social handles (Telegram, Instagram, Signal) stay hidden until you choose to share them. Your boundary is the architecture.',
  },
  {
    q: 'What if I want to leave?',
    a: 'You can leave at any time. Deleting your account is final — your profile, your messages, your traces. Gone. Quiet. Clean. No lingering shadow, no creepy ghost of you still floating around.',
  },
  {
    q: 'Who is Lellina for?',
    a: 'Women who love women. Real ones. Not browsers, not catfish, not men posing as women. If you\u2019re a galz looking for genuine connection with another galz — this is your space.',
  },
] as const

export function FAQ() {
  return (
    <section className="relative bg-ivory py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-warm-rose/10 border border-warm-rose/20 px-4 py-1.5 mb-4">
            <HelpCircle className="h-3.5 w-3.5 text-warm-rose" />
            <span className="font-body text-xs font-medium uppercase tracking-[0.18em] text-warm-rose-dark">
              Questions
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-soft-charcoal leading-tight">
            Every galz <span className="text-lellina-gradient">asks</span>.
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            Straight answers. No corporate talk. Just the truth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-border bg-white px-5 shadow-sm"
              >
                <AccordionTrigger className="font-display text-lg font-semibold text-soft-charcoal hover:no-underline text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-base text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
