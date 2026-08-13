import { companyAddress, companyConfig } from "@/config/company";
import { legalConfig } from "@/config/legal";
import { paymentConfig } from "@/config/payments";
import { shippingConfig } from "@/config/shipping";

export type LegalSection = { title: string; body: string[] };
export type LegalPage = { slug: string; title: string; description: string; updatedAt: string; sections: LegalSection[] };

const legalNotice = "Texto preparado para operação da loja e sujeito a revisão jurídica antes do lançamento definitivo.";
const pt = shippingConfig.regions.find((region) => region.id === "PT")!;
const eu = shippingConfig.regions.find((region) => region.id === "EU")!;

export const legalPages: LegalPage[] = [
  {
    slug: "politica-de-privacidade",
    title: "Política de Privacidade",
    description: "Como a Andrea's Mystery trata dados pessoais no contexto da loja online.",
    updatedAt: legalConfig.lastReviewDate,
    sections: [
      { title: "Nota de revisão", body: [legalNotice] },
      { title: "Responsável pelo tratamento", body: [`A loja Andrea's Mystery é gerida por ${companyConfig.ownerName}, NIF ${companyConfig.taxId}, com morada em ${companyAddress}. Para questões de privacidade, contacte ${companyConfig.email}.`] },
      { title: "Dados recolhidos", body: ["No checkout podemos recolher nome, telefone, email, morada, código postal, localidade, país, método de entrega, método de pagamento, observações da encomenda e consentimento de privacidade.", "No backoffice podem existir notas internas sobre a encomenda, usadas apenas para gestão operacional e não apresentadas ao cliente."] },
      { title: "Finalidades", body: ["Os dados são usados para validar produtos e disponibilidade, processar encomendas, contactar o cliente, preparar envio ou recolha, gerir pagamentos, prestar apoio e cumprir obrigações legais aplicáveis."] },
      { title: "Prestadores de serviços", body: ["A operação técnica pode envolver Supabase para base de dados/autenticação, Vercel para alojamento, Resend para email transacional, Stripe para pagamentos online e DPD para transporte quando a encomenda é enviada.", "Os meios de pagamento disponíveis no lançamento são MB Way e cartão de crédito através de Stripe Checkout, além de transferência bancária manual."] },
      { title: "Direitos e contactos", body: [`Pode solicitar acesso, correção ou eliminação dos seus dados através de ${companyConfig.email}. A resposta será tratada de acordo com a legislação aplicável.`] },
      { title: "Cookies", body: ["Os cookies necessários garantem funcionamento do site, carrinho e preferências. Cookies estatísticos e de marketing estão preparados como categorias futuras, mas não são carregados sem consentimento válido."] },
    ],
  },
  {
    slug: "termos-e-condicoes",
    title: "Termos e Condições",
    description: "Condições gerais de utilização e encomenda na Andrea's Mystery.",
    updatedAt: legalConfig.lastReviewDate,
    sections: [
      { title: "Nota de revisão", body: [legalNotice] },
      { title: "Identificação", body: [`Andrea's Mystery, titular ${companyConfig.ownerName}, NIF ${companyConfig.taxId}, ${companyAddress}. Contacto: ${companyConfig.email} ou ${companyConfig.phone}.`] },
      { title: "Âmbito e utilização", body: ["O site permite consultar peças de bijuteria premium e submeter pedidos de encomenda. A utilização deve respeitar a lei, a boa-fé e a disponibilidade real dos produtos."] },
      { title: "Produtos, preços e disponibilidade", body: ["As fotografias procuram representar as peças com rigor, mas podem existir pequenas diferenças de cor ou brilho consoante o ecrã.", "Os preços estão em euros. A encomenda fica sujeita a confirmação de disponibilidade, entrega e pagamento pela equipa Andrea's Mystery."] },
      { title: "Pagamentos", body: [`Os métodos ativos são MB Way (${paymentConfig.mbWayPhone}) e cartão de crédito através de Stripe Checkout, além de transferência bancária manual. A referência Multibanco está preparada para futuro, mas não está ativa por defeito. A encomenda só é considerada paga após confirmação segura do pagamento ou validação manual da transferência.`] },
      { title: "Envios", body: [`Portugal: ${pt.carrier}, portes de ${pt.price.toFixed(2).replace(".", ",")} €, prazo estimado de ${pt.estimatedDelivery}. Europa: ${eu.carrier}, portes de ${eu.price.toFixed(2).replace(".", ",")} €, prazo estimado de ${eu.estimatedDelivery}. Os prazos contam após confirmação do pagamento e podem sofrer atrasos da transportadora.`] },
      { title: "Cancelamento, trocas e devoluções", body: ["Pedidos de cancelamento, troca ou devolução devem ser comunicados pelos contactos oficiais. Consulte a página Trocas e Devoluções para o processo detalhado."] },
      { title: "Propriedade intelectual e responsabilidade", body: ["Textos, fotografias, marca e composição visual pertencem à Andrea's Mystery ou aos respetivos titulares. A loja não se responsabiliza por interrupções técnicas temporárias ou uso indevido do site."] },
      { title: "Lei aplicável", body: ["As presentes condições são regidas pela lei portuguesa. Meios de resolução de litígios devem ser preenchidos/validados antes de produção quando existir URL oficial configurado."] },
    ],
  },
  {
    slug: "politica-de-cookies",
    title: "Política de Cookies",
    description: "Cookies necessários e preferências de consentimento da Andrea's Mystery.",
    updatedAt: legalConfig.lastReviewDate,
    sections: [
      { title: "Nota de revisão", body: [legalNotice] },
      { title: "Cookies necessários", body: ["Usamos cookies ou armazenamento local necessários para carrinho, favoritos, preferências de cookies e funcionamento básico do site."] },
      { title: "Categorias futuras", body: ["O site está preparado para categorias estatísticas e marketing, mas scripts como Google Analytics, Google Tag Manager, Meta Pixel, TikTok Pixel ou Hotjar não devem carregar antes de consentimento válido e configuração real."] },
      { title: "Alterar preferências", body: ["Pode alterar ou retirar consentimento através da opção de preferências de cookies no footer. Recusar opcionais não bloqueia o acesso à loja."] },
    ],
  },
  {
    slug: "envios-e-entregas",
    title: "Envios e Entregas",
    description: "Métodos de envio, portes e prazos estimados.",
    updatedAt: legalConfig.lastReviewDate,
    sections: [
      { title: "Portugal", body: [`Transportadora: ${pt.carrier}. Portes: ${pt.price.toFixed(2).replace(".", ",")} €. Prazo estimado: ${pt.estimatedDelivery}, após confirmação do pagamento e salvo atrasos da transportadora.`] },
      { title: "Europa", body: [`Transportadora: ${eu.carrier}. Portes: ${eu.price.toFixed(2).replace(".", ",")} €. Prazo estimado: ${eu.estimatedDelivery}, após confirmação do pagamento e salvo atrasos da transportadora.`] },
      { title: "Responsabilidade da morada", body: ["O cliente deve indicar uma morada completa e correta. Em caso de problema de entrega, contacte a Andrea's Mystery com o número da encomenda."] },
    ],
  },
  {
    slug: "trocas-e-devolucoes",
    title: "Trocas e Devoluções",
    description: "Processo de troca, devolução e artigos com defeito.",
    updatedAt: legalConfig.lastReviewDate,
    sections: [
      { title: "Prazo", body: ["O cliente pode solicitar troca ou devolução no prazo de 14 dias, contactando previamente a Andrea's Mystery e indicando o número da encomenda."] },
      { title: "Condições", body: ["O artigo deve ser devolvido em condições adequadas, com embalagem e elementos recebidos, sempre que possível. Esta informação não limita direitos legais relativos a produtos defeituosos."] },
      { title: "Custos", body: ["Os custos de devolução são suportados pelo comprador, exceto em caso de erro da Andrea's Mystery ou produto defeituoso confirmado."] },
      { title: "Processo", body: [`Antes de devolver, contacte ${companyConfig.email} ou ${companyConfig.phone} para receber instruções.`] },
    ],
  },
  {
    slug: "contactos",
    title: "Contactos",
    description: "Contactos oficiais da Andrea's Mystery.",
    updatedAt: legalConfig.lastReviewDate,
    sections: [
      { title: "Andrea's Mystery", body: [`Titular: ${companyConfig.ownerName}`, `NIF: ${companyConfig.taxId}`, `Morada: ${companyAddress}`, `Telefone/WhatsApp: ${companyConfig.phone}`, `Email: ${companyConfig.email}`, `Instagram: ${companyConfig.instagramUrl}`] },
      { title: "Livro de Reclamações", body: [legalConfig.complaintBookUrl ? legalConfig.complaintBookUrl : "[PREENCHER URL oficial do Livro de Reclamações, sem inventar endereço]"] },
    ],
  },
];

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
