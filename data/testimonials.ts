import type { LocaleCode } from "@/config/locales";

export type Testimonial = {
  id: string;
  customerName: string;
  text: string;
  translations?: Partial<Record<LocaleCode, string>>;
  rating?: 1 | 2 | 3 | 4 | 5;
  location?: string;
  productName?: string;
  purchaseDate?: string;
  source?: "website" | "instagram" | "facebook" | "in-person" | "other";
  isVerified?: boolean;
  isPublished: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "testemunho-exemplo-1",
    customerName: "Cliente exemplo",
    text: "As peças chegaram muito bem apresentadas e o acabamento é ainda mais bonito ao vivo.",
    translations: {
      en: "The pieces arrived beautifully presented and the finish is even more beautiful in person.",
      es: "Las piezas llegaron muy bien presentadas y el acabado es aún más bonito en persona.",
      fr: "Les pièces sont arrivées très bien présentées et la finition est encore plus belle en vrai.",
      de: "Die Stücke kamen sehr schön verpackt an und die Verarbeitung ist live noch schöner.",
      zh: "饰品包装非常精致，实物的质感比照片更美。",
    },
    rating: 5,
    location: "Lisboa",
    source: "other",
    isVerified: true,
    isPublished: true,
  },
  {
    id: "testemunho-exemplo-2",
    customerName: "Cliente exemplo",
    text: "Uma experiência simples e cuidada, desde a escolha até à entrega.",
    translations: {
      en: "A simple and thoughtful experience, from selection to delivery.",
      es: "Una experiencia sencilla y cuidada, desde la elección hasta la entrega.",
      fr: "Une expérience simple et soignée, du choix jusqu'à la livraison.",
      de: "Eine einfache und sorgfältige Erfahrung, von der Auswahl bis zur Lieferung.",
      zh: "从挑选到配送，整个体验简单而细致。",
    },
    rating: 5,
    location: "Porto",
    source: "other",
    isVerified: true,
    isPublished: true,
  },
  {
    id: "testemunho-exemplo-3",
    customerName: "Cliente exemplo",
    text: "Gostei especialmente da delicadeza da peça e da atenção aos detalhes.",
    translations: {
      en: "I especially loved the delicacy of the piece and the attention to detail.",
      es: "Me gustó especialmente la delicadeza de la pieza y la atención al detalle.",
      fr: "J'ai particulièrement aimé la délicatesse de la pièce et l'attention portée aux détails.",
      de: "Besonders gefallen haben mir die Zartheit des Stücks und die Liebe zum Detail.",
      zh: "我特别喜欢这件饰品的精致感和对细节的用心。",
    },
    rating: 5,
    location: "Coimbra",
    source: "other",
    isVerified: true,
    isPublished: true,
  },
];

export const publishedTestimonials = testimonials
  .filter((testimonial) => testimonial.isPublished)
  .slice(0, 6);
