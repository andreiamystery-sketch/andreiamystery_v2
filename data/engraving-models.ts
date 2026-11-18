export type EngravingModel = {
  id: string;
  name: string;
  format: string;
  image: string;
  description: string;
  price?: number;
  bestSeller?: boolean;
  newArrival?: boolean;
};

export const engravingModels: EngravingModel[] = [
  { id: "arvore-familia-redonda-prata", name: "Árvore da Família", format: "Medalha redonda · prata", image: "/images/gravacoes/arvore-familia-redonda-prata.jpg", description: "Uma árvore de família com nomes gravados.", bestSeller: true },
  { id: "arvore-familia-retangular-prata", name: "Árvore da Família", format: "Placa retangular · prata", image: "/images/gravacoes/arvore-familia-retangular-prata.jpg", description: "Uma placa com espaço para nomes e uma mensagem especial.", newArrival: true },
  { id: "colar-familia-madeira", name: "Memória a Dois", format: "Medalha gravada · prata", image: "/images/gravacoes/colar-familia-madeira.jpg", description: "Uma data ou dedicatória para recordar um momento importante." },
  { id: "placa-cao-rex", name: "Placa para Animal", format: "Formato osso · dourado", image: "/images/gravacoes/placa-cao-rex.jpg", description: "Personalizada com nome e contacto para a coleira.", bestSeller: true },
  { id: "medalha-cao-buddy", name: "Medalha para Animal", format: "Formato osso · prata", image: "/images/gravacoes/medalha-cao-buddy.jpg", description: "Uma medalha com nome e fotografia do teu companheiro." },
  { id: "medalhao-pai-leao", name: "Mensagem para Pai", format: "Placa retangular · prata", image: "/images/gravacoes/medalhao-pai-leao.jpg", description: "Uma mensagem especial acompanhada por uma imagem gravada." },
  { id: "arvore-da-vida-prata", name: "Árvore da Vida", format: "Placa retangular · prata", image: "/images/gravacoes/arvore-da-vida-prata.jpg", description: "Nomes da família organizados numa árvore da vida." },
  { id: "coracao-familia-prata-foto", name: "Coração da Família", format: "Coração · fotografia", image: "/images/gravacoes/coracao-familia-prata-foto.jpg", description: "Uma fotografia de família gravada num medalhão em coração.", bestSeller: true },
  { id: "medalhao-mae-filho-prata", name: "Mãe e Filho", format: "Coração · prata", image: "/images/gravacoes/medalhao-mae-filho-prata.jpg", description: "Uma fotografia e uma dedicatória para guardar junto ao coração." },
  { id: "coracao-familia-dourado", name: "Família no Coração", format: "Coração · dourado", image: "/images/gravacoes/coracao-familia-dourado.jpg", description: "Nomes e uma pequena mensagem num acabamento dourado.", bestSeller: true },
  { id: "medalhao-mae-filhos-dourado", name: "Mãe e Filhos", format: "Medalha redonda · dourado", image: "/images/gravacoes/medalhao-mae-filhos-dourado.jpg", description: "Uma ilustração e uma mensagem dedicadas à mãe.", newArrival: true },
  { id: "medalhao-meus-tesouros", name: "Os Meus Tesouros", format: "Medalha oval · prata", image: "/images/gravacoes/medalhao-meus-tesouros.jpg", description: "Fotografia e texto personalizado numa medalha oval.", newArrival: true },
  { id: "pendente-nossa-familia", name: "A Nossa Família", format: "Coração · dourado", image: "/images/gravacoes/pendente-nossa-familia-dourado.jpg", description: "Um coração simples com o nome da família.", newArrival: true },
];
