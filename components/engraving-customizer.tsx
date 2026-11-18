"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { EngravingModel } from "@/data/engraving-models";

type EngravingCustomizerProps = {
  models: EngravingModel[];
  whatsappNumber: string;
  locale: string;
  hideIntro?: boolean;
};

export function EngravingCustomizer({ models, whatsappNumber, locale, hideIntro = false }: EngravingCustomizerProps) {
  const [selected, setSelected] = useState<EngravingModel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modelQuery, setModelQuery] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [notice, setNotice] = useState("");
  const isPortuguese = locale === "pt";
  const categories = [
    { id: "plates", label: isPortuguese ? "Placas" : "Plates", matches: (model: EngravingModel) => model.format.toLocaleLowerCase().includes("placa") },
    { id: "medals", label: isPortuguese ? "Medalhas" : "Medallions", matches: (model: EngravingModel) => model.format.toLocaleLowerCase().includes("medalha") || model.format.toLocaleLowerCase().includes("oval") || model.format.toLocaleLowerCase().includes("cora") },
    { id: "pets", label: isPortuguese ? "Animais" : "Pets", matches: (model: EngravingModel) => `${model.format} ${model.name}`.toLocaleLowerCase().match(/osso|animal|c[aã]o|pet/) !== null },
    { id: "photos", label: isPortuguese ? "Fotografias" : "Photos", matches: (model: EngravingModel) => `${model.format} ${model.description}`.toLocaleLowerCase().includes("fotografia") || `${model.format} ${model.description}`.toLocaleLowerCase().includes("photo") },
  ].map((category) => ({ ...category, model: models.find(category.matches) })).filter((category) => category.model);
  const visibleModels = models.filter((model) => {
    const matchesCategory = !selectedCategory || categories.find((category) => category.id === selectedCategory)?.matches(model);
    const query = modelQuery.trim().toLocaleLowerCase();
    const matchesQuery = !query || `${model.name} ${model.format} ${model.description}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
  const newArrivalModels = models.filter((model) => model.newArrival).slice(0, 4);
  const bestSellerModels = models.filter((model) => model.bestSeller).slice(0, 4);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  function chooseModel(model: EngravingModel) {
    setSelected(model);
    setNotice("");
    window.setTimeout(() => document.getElementById("personalizar")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function choosePhoto(file: File | null) {
    setNotice("");
    if (file && file.size > 8 * 1024 * 1024) {
      setNotice(isPortuguese ? "A fotografia tem de ter menos de 8 MB." : "The photo must be smaller than 8 MB.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
  }

  async function sendPersonalization() {
    if (!selected || !name.trim() || !photo) {
      setNotice(isPortuguese ? "Escolhe um modelo, indica o nome e adiciona uma fotografia." : "Choose a model, enter a name and add a photo.");
      return;
    }

    const details = [
      isPortuguese ? "Olá! Quero pedir uma peça personalizada Andrea's Mystery." : "Hello! I would like to order a personalized Andrea's Mystery piece.",
      `${isPortuguese ? "Modelo" : "Model"}: ${selected.name} — ${selected.format}`,
      `${isPortuguese ? "Nome a gravar" : "Name to engrave"}: ${name.trim()}`,
      message.trim() ? `${isPortuguese ? "Mensagem" : "Message"}: ${message.trim()}` : "",
      `${isPortuguese ? "Fotografia" : "Photo"}: ${isPortuguese ? "incluída nesta partilha" : "included in this share"}`,
    ].filter(Boolean).join("\n");
    const number = whatsappNumber.replace(/\D/g, "");

    if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [photo] })) {
      try {
        await navigator.share({ title: selected.name, text: details, files: [photo] });
        setNotice(isPortuguese ? "Abre o WhatsApp no menu de partilha para enviar o pedido e a fotografia." : "Choose WhatsApp in the share menu to send your request and photo.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    const fallbackText = `${details}\n\n${isPortuguese ? "O meu navegador não anexou a fotografia. Vou enviá-la nesta conversa do WhatsApp." : "My browser did not attach the photo. I will send it in this WhatsApp chat."}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(fallbackText)}`, "_blank", "noopener,noreferrer");
    setNotice(isPortuguese ? "A conversa abriu no WhatsApp. Anexa a fotografia que escolheste para concluir o pedido." : "WhatsApp opened. Attach the photo you selected to finish your request.");
  }

  return (
    <div className="bg-obsidian text-ivory">
      {!hideIntro && <section className="border-b border-gold/20 px-5 pb-14 pt-16 text-center md:px-10 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Andrea&apos;s Mystery · {isPortuguese ? "Peças únicas" : "One of a kind"}</p>
          <h1 className="mt-4 font-serif text-[clamp(2.8rem,7vw,5.5rem)] leading-none text-ivory">{isPortuguese ? "Gravações personalizadas" : "Personalized engravings"}</h1>
          <p className="mt-6 font-serif text-lg leading-relaxed text-smoke">{isPortuguese ? "Escolhe um modelo, adiciona uma fotografia e indica o nome ou a mensagem que queres gravar." : "Choose a model, add a photo and enter the name or message you would like engraved."}</p>
        </div>
      </section>}

      <section className="bg-obsidian px-5 py-20 md:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">{isPortuguese ? "Gravações personalizadas" : "Personalised engravings"}</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-none text-ivory">{isPortuguese ? "Escolhe uma peça com significado" : "Choose a piece with meaning"}</h2>
            <p className="mt-5 font-serif text-lg leading-relaxed text-smoke">{isPortuguese ? "Escolhe o formato, abre um modelo e personaliza-o com fotografia, nome ou mensagem." : "Choose a format, open a model and personalise it with a photo, name or message."}</p>
          </div>
          <div className="mx-auto mt-12 flex max-w-6xl flex-wrap justify-center gap-x-5 gap-y-4">
            <button type="button" onClick={() => setSelectedCategory(null)} aria-pressed={selectedCategory === null} className="group flex w-20 flex-col items-center gap-2 text-center">
              <span className={`grid h-20 w-20 place-items-center rounded-full border font-serif text-lg text-gold transition ${selectedCategory === null ? "border-gold bg-gold/10" : "border-gold/35 group-hover:border-gold"}`}>AM</span>
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-champagne">{isPortuguese ? "Ver tudo" : "View all"}</span>
            </button>
            {categories.map((category) => <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} aria-pressed={selectedCategory === category.id} className="group flex w-20 flex-col items-center gap-2 text-center">
              <span className={`relative block h-20 w-20 overflow-hidden rounded-full border transition ${selectedCategory === category.id ? "border-gold ring-1 ring-gold/60" : "border-gold/35 group-hover:border-gold"}`}><Image src={category.model!.image} alt="" fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-110" /></span>
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-champagne">{category.label}</span>
            </button>)}
          </div>
          <label className="mx-auto mt-10 flex min-h-12 max-w-md items-center gap-3 border border-gold/30 bg-black-warm px-4 text-sm text-smoke">
            <span aria-hidden="true">⌕</span>
            <input value={modelQuery} onChange={(event) => setModelQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-ivory outline-none placeholder:text-smoke" placeholder={isPortuguese ? "Coração, fotografia, medalha…" : "Heart, photo, medallion…"} aria-label={isPortuguese ? "Pesquisar modelos de gravação" : "Search engraving models"} />
          </label>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleModels.map((model) => (
              <button key={model.id} type="button" onClick={() => chooseModel(model)} aria-pressed={selected?.id === model.id} className={`group overflow-hidden border bg-black-warm text-left transition duration-300 hover:-translate-y-1 hover:border-gold/60 ${selected?.id === model.id ? "border-gold ring-1 ring-gold/50" : "border-gold/15"}`}>
                <span className="relative block aspect-[4/3] overflow-hidden bg-graphite"><Image src={model.image} alt={model.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" /></span>
                <span className="grid gap-2 p-5"><span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-light">{model.format}</span><span className="font-serif text-2xl">{model.name}</span><span className="text-sm leading-relaxed text-warm-gray">{model.description}</span><span className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-champagne">{selected?.id === model.id ? (isPortuguese ? "Modelo escolhido ✓" : "Model selected ✓") : (isPortuguese ? "Escolher este modelo →" : "Choose this model →")}</span></span>
              </button>
            ))}
            {visibleModels.length === 0 && <p className="border border-gold/20 px-5 py-10 text-center font-serif text-lg text-smoke sm:col-span-2 lg:col-span-3 xl:col-span-4">{isPortuguese ? "Não encontrámos modelos com essa pesquisa." : "No models match your search."}</p>}
          </div>
        </div>
      </section>

      {newArrivalModels.length > 0 && <section className="border-t border-gold/10 bg-obsidian px-5 py-16 md:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">{isPortuguese ? "Novos modelos de gravação" : "New engraving designs"}</p>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none text-ivory">{isPortuguese ? "Acabado de chegar" : "Just arrived"}</h2>
          <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-smoke">{isPortuguese ? "Descobre as últimas ideias para guardar nomes, fotografias e momentos especiais." : "Explore the latest ways to keep names, photos and special moments close."}</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {newArrivalModels.map((model) => <button key={model.id} type="button" onClick={() => chooseModel(model)} className="group overflow-hidden border border-gold/15 bg-black-warm text-left transition hover:-translate-y-1 hover:border-gold/60">
              <span className="relative block aspect-[4/3] overflow-hidden bg-graphite"><Image src={model.image} alt={model.name} fill sizes="(min-width: 1280px) 20vw, 45vw" className="object-cover transition duration-700 group-hover:scale-105" /></span>
              <span className="block p-4"><span className="inline-flex border border-gold/30 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-gold-light">{isPortuguese ? "Novo" : "New"}</span><span className="mt-3 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-light">{model.format}</span><span className="mt-2 block font-serif text-xl text-ivory">{model.name}</span><span className="mt-3 block text-xs font-bold uppercase tracking-[0.15em] text-champagne">{isPortuguese ? "Personalizar este modelo →" : "Personalise this model →"}</span></span>
            </button>)}
          </div>
        </div>
      </section>}

      {bestSellerModels.length > 0 && <section className="border-t border-gold/10 bg-black-warm px-5 py-16 md:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">{isPortuguese ? "Favoritos Andrea’s Mystery" : "Andrea’s Mystery favourites"}</p>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none text-ivory">Best Sellers</h2>
          <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-smoke">{isPortuguese ? "Modelos de gravação escolhidos para transformar nomes, fotografias e memórias em presentes especiais." : "Engraving designs chosen to turn names, photos and memories into special gifts."}</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {bestSellerModels.map((model) => <button key={model.id} type="button" onClick={() => chooseModel(model)} className="group overflow-hidden border border-gold/15 bg-obsidian text-left transition hover:-translate-y-1 hover:border-gold/60">
              <span className="relative block aspect-[4/3] overflow-hidden bg-graphite"><Image src={model.image} alt={model.name} fill sizes="(min-width: 1280px) 20vw, 45vw" className="object-cover transition duration-700 group-hover:scale-105" /></span>
              <span className="block p-4"><span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-light">{model.format}</span><span className="mt-2 block font-serif text-xl text-ivory">{model.name}</span><span className="mt-3 block text-xs font-bold uppercase tracking-[0.15em] text-champagne">{isPortuguese ? "Personalizar este modelo →" : "Personalise this model →"}</span></span>
            </button>)}
          </div>
        </div>
      </section>}

      {selected && <section id="personalizar" className="scroll-mt-8 border-y border-gold/20 bg-[#100f0d] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="relative min-h-[360px] overflow-hidden bg-graphite sm:min-h-[520px]">
            <Image src={selected.image} alt={selected.name} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-6 pt-24">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-light">{selected.format}</p>
              <h2 className="mt-2 font-serif text-4xl">{selected.name}</h2>
              {selected.price !== undefined && <p className="mt-2 font-serif text-2xl text-champagne">{new Intl.NumberFormat(isPortuguese ? "pt-PT" : "en-GB", { style: "currency", currency: "EUR" }).format(selected.price)}</p>}
            </div>
          </div>

          <div className="self-center">
            <p className="eyebrow">{isPortuguese ? "Agora, torna-a tua" : "Now make it yours"}</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">{isPortuguese ? "Personaliza a tua peça" : "Personalize your piece"}</h2>
            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm text-smoke">{isPortuguese ? "Nome a gravar" : "Name to engrave"}<input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} className="min-h-12 border border-gold/25 bg-black px-4 text-ivory outline-none focus:border-gold" placeholder={isPortuguese ? "Ex.: Maria" : "e.g. Maria"} /></label>
              <label className="grid gap-2 text-sm text-smoke">{isPortuguese ? "Mensagem, data ou dedicatória (opcional)" : "Message, date or dedication (optional)"}<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={140} rows={3} className="border border-gold/25 bg-black px-4 py-3 text-ivory outline-none focus:border-gold" placeholder={isPortuguese ? "Ex.: A nossa maior riqueza" : "e.g. Our greatest treasure"} /></label>
              <label className="grid gap-2 text-sm text-smoke">{isPortuguese ? "Fotografia para gravar" : "Photo to engrave"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)} className="min-h-12 border border-gold/25 bg-black p-2 text-sm text-ivory file:mr-3 file:border-0 file:bg-gold file:px-3 file:py-2 file:font-bold file:text-obsidian"/><span className="text-xs text-warm-gray">{isPortuguese ? "JPG, PNG ou WebP · até 8 MB. A fotografia fica no teu dispositivo até a partilhares." : "JPG, PNG or WebP · up to 8 MB. The photo stays on your device until you share it."}</span></label>
            </div>

            <div className="mt-6 grid gap-4 border border-gold/20 bg-black/45 p-5 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="relative grid aspect-square place-items-center overflow-hidden rounded-full border border-gold/30 bg-graphite">{photoPreview ? <Image src={photoPreview} alt={isPortuguese ? "Pré-visualização da tua fotografia" : "Preview of your photo"} fill unoptimized className="object-cover" /> : <span className="px-3 text-center text-xs text-warm-gray">{isPortuguese ? "A tua fotografia aparece aqui" : "Your photo preview appears here"}</span>}</div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">{isPortuguese ? "Pré-visualização" : "Preview"}</p><p className="mt-2 font-serif text-2xl">{name.trim() || (isPortuguese ? "O teu nome" : "Your name")}</p><p className="mt-1 whitespace-pre-wrap text-sm text-smoke">{message.trim() || (isPortuguese ? "A tua mensagem" : "Your message")}</p><p className="mt-3 text-xs text-warm-gray">{isPortuguese ? "A gravação final é preparada pela equipa Andrea's Mystery a partir do teu pedido." : "The Andrea's Mystery team prepares the final engraving from your request."}</p></div>
            </div>

            {notice && <p role="status" className="mt-5 border border-gold/25 p-4 text-sm text-champagne">{notice}</p>}
            <button type="button" onClick={sendPersonalization} className="mt-6 min-h-12 w-full bg-gold px-6 text-xs font-extrabold uppercase tracking-[0.16em] text-obsidian transition hover:bg-champagne sm:w-auto">{isPortuguese ? "ENVIAR PEDIDO E FOTOGRAFIA PELO WHATSAPP" : "SEND REQUEST AND PHOTO VIA WHATSAPP"}</button>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-warm-gray">{isPortuguese ? "O pedido abre o WhatsApp. Se o teu dispositivo não oferecer a partilha direta da fotografia, anexa-a manualmente na conversa antes de enviar." : "The request opens WhatsApp. If your device does not offer direct photo sharing, attach the photo manually in the conversation before sending."}</p>
          </div>
        </div>
      </section>}
    </div>
  );
}
