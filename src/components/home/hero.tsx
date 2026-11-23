"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRightIcon } from "@hugeicons/core-free-icons"
import { buttonVariants } from "@/components/ui/button"
import { HeroPizzaScene } from "@/components/home/hero-pizza-scene"

const HEADLINE = ["Hot.", "Fresh.", "Pizza."]

export function Hero() {
  const reduceMotion = useReducedMotion()
  const rise = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0 } }
  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_8%,rgba(255,159,28,0.14),transparent_45%),radial-gradient(circle_at_8%_92%,rgba(230,57,70,0.08),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 80% 15%, transparent 0, transparent 36px, rgba(245,241,232,0.05) 37px, transparent 38px)",
        }}
      />

      <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
          className="max-w-xl space-y-7"
        >
          <h1 className="font-display text-[clamp(3rem,7vw,5.25rem)] leading-[0.92] tracking-[-0.02em]">
            {HEADLINE.map((line) => (
              <motion.span
                key={line}
                variants={rise}
                transition={{ duration: 0.7, ease }}
                className={
                  line === "Pizza." ? "block text-brand" : "block text-foreground"
                }
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={rise}
            transition={{ duration: 0.7, ease }}
            className="max-w-[430px] text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Handcrafted pizzas from approved local kitchens, delivered to your
            door. Browse the menu, place an order, and follow it from pending to
            accepted.
          </motion.p>

          <motion.div
            variants={rise}
            transition={{ duration: 0.7, ease }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/menu"
              className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}
            >
              Explore Pizza Menu
              <HugeiconsIcon icon={ArrowUpRightIcon} className="size-4" />
            </Link>
            <Link
              href="#how-it-works"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              How It Works
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative aspect-[4/3] w-full"
          >
            <HeroPizzaScene />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
