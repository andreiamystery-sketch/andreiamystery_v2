import { Gem, Gift, HandHeart, PackageCheck, Sparkles } from "lucide-react";
import { storeBenefits } from "@/data/store-settings";

const icons = { gem: Gem, sparkles: Sparkles, gift: Gift, hand: HandHeart, package: PackageCheck };

export function BenefitsStrip() {
  return (
    <section aria-label="Vantagens da Andrea's Mystery" className="border-y border-gold/20 bg-black-warm">
      <div className="mx-auto grid max-w-[90rem] grid-cols-2 divide-x divide-y divide-gold/15 md:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        {storeBenefits.map((benefit) => {
          const Icon = icons[benefit.icon];
          return (
            <div key={benefit.title} className="flex min-h-32 flex-col items-center justify-center px-4 py-7 text-center">
              <Icon size={22} strokeWidth={1.3} className="text-gold" aria-hidden="true" />
              <strong className="mt-3 font-serif text-base text-ivory">{benefit.title}</strong>
              <span className="mt-1 text-xs leading-relaxed text-warm-gray">{benefit.description}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
