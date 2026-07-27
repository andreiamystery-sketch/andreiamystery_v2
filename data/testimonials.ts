export type Testimonial = {
  id: string;
  customerName: string;
  text: string;
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
    rating: 5,
    location: "Coimbra",
    source: "other",
    isVerified: true,
    isPublished: true,
  },
];

export const publishedTestimonials = testimonials.filter((testimonial) => testimonial.isPublished).slice(0, 6);
