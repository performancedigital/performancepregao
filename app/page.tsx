import Link from 'next/link'
import {
  Bot,
  CheckCircle,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  ShieldCheck,
  Target,
  Award,
  TrendingUp,
  Landmark,
  Bell,
  BarChart2,
  Activity,
  MessageCircle,
  Scale,
  Gavel,
  ClipboardCheck,
  Briefcase,
} from 'lucide-react'

// WhatsApp da consultoria
const WHATSAPP = '5531987551055'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  'Olá! Vim pelo site da Brasília Consultoria em Licitações e quero saber mais.'
)}`

// ─── Conteúdo ───────────────────────────────────────────────────────────────

// Os 4 serviços da consultoria
const services = [
  {
    icon: Search,
    title: 'Plataforma de pesquisa',
    description:
      'Assinatura da plataforma para pesquisa de licitações em diversos portais — toda a base oficial do PNCP (federal, estadual e municipal) em um só lugar, atualizada diariamente.',
  },
  {
    icon: Target,
    title: 'Curadoria por perfil',
    description:
      'Seleção das licitações de acordo com o setor e o perfil do seu cliente. Você recebe as oportunidades que realmente fazem sentido para o seu negócio, sem ruído.',
  },
  {
    icon: Scale,
    title: 'Análise de viabilidade',
    description:
      'Análise jurídica, documental e de viabilidade para participação. Avaliamos exigências de habilitação, riscos e a real chance de êxito antes de você investir tempo.',
  },
  {
    icon: Gavel,
    title: 'Gestão do pregão',
    description:
      'Gestão completa da participação em pregões eletrônicos — do envio de documentos ao acompanhamento da disputa, com suporte operacional especializado.',
  },
]

// Atuação ponta a ponta
const steps = [
  {
    num: '01',
    icon: Landmark,
    title: 'Identificação da oportunidade',
    description:
      'Monitoramos o PNCP 24/7 e selecionamos os editais que combinam com o seu setor. Você para de garimpar portais — a oportunidade certa chega até você.',
    highlight: 'Cobertura nacional',
  },
  {
    num: '02',
    icon: ClipboardCheck,
    title: 'Análise e preparação',
    description:
      'IA resume cada edital (objeto, valores, prazos e pontos de atenção) e nossa consultoria avalia a viabilidade jurídica e documental para participar com segurança.',
    highlight: 'Decisão com base sólida',
  },
  {
    num: '03',
    icon: Briefcase,
    title: 'Participação no pregão',
    description:
      'Organize as disputas num Kanban profissional e conte com suporte operacional na condução do pregão eletrônico, da habilitação ao lance final.',
    highlight: 'Da oportunidade ao contrato',
  },
]

const features = [
  {
    icon: Search,
    title: 'Busca Inteligente',
    description:
      'Pesquise editais por palavra-chave, com filtros avançados por estado, valor, modalidade e prazo. Encontre em segundos o que levaria horas garimpando portais.',
    badge: null,
  },
  {
    icon: MessageSquare,
    title: 'Converse com o Edital',
    description:
      'Chat com IA sobre qualquer edital: pergunte sobre prazos, valores, modalidade, habilitação e critérios. Decida rápido se vale a pena participar.',
    badge: 'PRO',
  },
  {
    icon: LayoutDashboard,
    title: 'Kanban de Disputas',
    description:
      'Gerencie sua pipeline como um CRM: mova editais entre Lead, Avaliando, Encaminhado e Vencido, com notas e acompanhamento de valores.',
    badge: 'PRO',
  },
  {
    icon: Bell,
    title: 'Alertas das Oportunidades',
    description:
      'Seja avisado das licitações que combinam com o seu perfil — por estado, valor mínimo e palavras-chave — sem ficar checando o sistema o dia todo.',
    badge: 'PRO',
  },
  {
    icon: BarChart2,
    title: 'Painel Analítico',
    description:
      'Acompanhe disputas ativas, valores em jogo e taxa de vitória. Tome decisões baseadas em dados reais do seu negócio.',
    badge: 'PRO',
  },
  {
    icon: ShieldCheck,
    title: 'Consultoria Especializada',
    description:
      'Mais que software: nosso time apoia sua empresa na análise, habilitação e estratégia das disputas. Fale com um especialista quando precisar.',
    badge: null,
  },
]

// Pilares da marca
const pillars = [
  {
    icon: ShieldCheck,
    title: 'Segurança',
    description: 'Informação oficial direto do PNCP e análise jurídica antes de cada disputa.',
  },
  {
    icon: Target,
    title: 'Estratégia',
    description: 'IA + consultoria para você participar das disputas certas, no momento certo.',
  },
  {
    icon: Award,
    title: 'Excelência',
    description: 'Processo organizado de ponta a ponta, da descoberta do edital à proposta.',
  },
  {
    icon: TrendingUp,
    title: 'Resultados',
    description: 'Mais tempo, menos esforço operacional e mais contratos públicos conquistados.',
  },
]

const plans = [
  {
    name: 'FREE',
    label: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para começar a explorar as licitações públicas.',
    features: [
      'Busca de editais do PNCP',
      'Filtros por estado e modalidade',
      'Visualização do edital no portal',
      'Sem resumo por IA',
      'Suporte por e-mail',
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'outline',
    highlight: false,
    badge: null,
  },
  {
    name: 'PRO',
    label: 'Pro',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para licitantes que querem velocidade e inteligência.',
    features: [
      'Tudo do plano Grátis',
      'Resumo e chat com IA nos editais',
      'Alertas das oportunidades',
      'Kanban de disputas',
      'Painel analítico',
      'Suporte prioritário',
    ],
    cta: 'Assinar PRO',
    ctaVariant: 'outline-neon',
    highlight: true,
    badge: null,
  },
  {
    name: 'INFINITY_PLUS',
    label: 'Infinity+',
    price: 'R$ 243',
    period: '/mês',
    description: 'Para empresas que não querem perder nenhuma disputa.',
    features: [
      'Tudo do plano Pro',
      'IA com prioridade e limites maiores',
      'Curadoria por perfil do negócio',
      'Análise de viabilidade e habilitação',
      'Consultoria e gestão do pregão',
      'Suporte 24/7 por WhatsApp',
    ],
    cta: 'Assinar Infinity+',
    ctaVariant: 'filled',
    highlight: false,
    badge: 'MAIS COMPLETO',
  },
]

const stats = [
  { value: 'Nacional', label: 'cobertura via PNCP (federal, estadual e municipal)', icon: Landmark },
  { value: 'Diária', label: 'atualização automática de novos editais', icon: Activity },
  { value: 'IA', label: 'análise e chat em cada edital', icon: Bot },
  { value: 'Ponta a ponta', label: 'da identificação à participação no pregão', icon: Briefcase },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-700 overflow-x-hidden">
      {/* ── Navegação ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center ring-1 ring-gold/40">
            <Landmark size={18} className="text-gold" />
          </div>
          <span className="font-bold text-navy text-sm leading-tight tracking-tight">
            BRASÍLIA{' '}
            <span className="text-[#9a7d1f] text-[11px] font-semibold uppercase block sm:inline">Consultoria em Licitações</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#servicos" className="text-slate-600 hover:text-navy text-sm font-medium transition-colors">Serviços</a>
          <a href="#como-funciona" className="text-slate-600 hover:text-navy text-sm font-medium transition-colors">Como Funciona</a>
          <a href="#funcionalidades" className="text-slate-600 hover:text-navy text-sm font-medium transition-colors">Plataforma</a>
          <a href="#planos" className="text-slate-600 hover:text-navy text-sm font-medium transition-colors">Planos</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-slate-600 hover:text-navy text-sm font-medium transition-colors px-4 py-2">Entrar</Link>
          <Link
            href="/login"
            className="bg-navy text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#16345f] hover:shadow-lg transition-all duration-200"
          >
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-navy/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-8 border border-gold/30 shadow-sm">
              <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <span className="text-[#9a7d1f] text-xs font-semibold tracking-wider uppercase">
                Segurança • Estratégia • Excelência • Resultados
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] text-navy mb-6 tracking-tight">
              Sua empresa vendendo para o <span className="gradient-text">governo</span>, com segurança
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl lg:max-w-none">
              Somos especialistas em licitações públicas. Ajudamos sua empresa a{' '}
              <strong className="text-navy">encontrar oportunidades</strong>, avaliar editais e participar de
              pregões eletrônicos com mais segurança e organização — da identificação ao contrato.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 bg-gold text-navy font-bold text-base px-8 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Começar Agora — É Grátis
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-navy font-semibold text-base px-8 py-4 rounded-xl hover:border-gold hover:bg-gold/5 transition-all duration-200"
              >
                <MessageCircle size={18} className="text-[#25D366]" />
                Falar no WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Landmark, text: 'Cobertura nacional (PNCP)' },
                { icon: FileText, text: 'Milhares de editais' },
                { icon: Bot, text: 'IA incluída' },
              ].map((s) => (
                <div key={s.text} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-slate-200 shadow-sm">
                  <s.icon size={14} className="text-gold" />
                  <span className="text-slate-700 text-sm font-medium">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup do painel */}
          <div className="flex-1 w-full max-w-2xl animate-float">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl shadow-navy/10">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 bg-white border border-slate-200 rounded-md h-6 flex items-center px-3">
                  <span className="text-slate-400 text-xs">app · painel de oportunidades</span>
                </div>
              </div>

              <div className="p-5 bg-white">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Disputas ativas', value: '—', color: 'text-navy' },
                    { label: 'Valor em jogo', value: '—', color: 'text-navy' },
                    { label: 'Taxa de vitória', value: '—', color: 'text-green-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-slate-500 text-[10px] mb-1">{s.label}</p>
                      <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Aquisição de equipamentos de TI', value: 'R$ 234.500', time: '2d 4h', urgent: false },
                    { title: 'Serviços de limpeza predial', value: 'R$ 89.000', time: '18h', urgent: true },
                    { title: 'Mobiliário para secretaria municipal', value: 'R$ 145.200', time: '5d 2h', urgent: false },
                  ].map((b) => (
                    <div key={b.title} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 hover:border-gold/40 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-navy text-xs font-medium truncate">{b.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#9a7d1f] text-[10px] font-mono font-semibold">PNCP</span>
                          <span className="text-slate-400 text-[10px]">•</span>
                          <span className="text-slate-500 text-[10px]">{b.value}</span>
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-md ${b.urgent ? 'bg-red-100 text-red-600' : 'bg-gold/15 text-[#9a7d1f]'}`}>
                        {b.time}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-navy/[0.03] rounded-xl p-3 border border-gold/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-gold" />
                    <span className="text-navy text-xs font-semibold">Resumo IA do edital</span>
                    <div className="ml-auto flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Pregão eletrônico para fornecimento de equipamentos de TI. Veja objeto, valor estimado,
                    prazo de propostas e pontos de atenção — e pergunte o que quiser à IA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Serviços ── */}
      <section id="servicos" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#9a7d1f] text-sm font-semibold tracking-widest uppercase">O que fazemos</span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy mt-3 mb-4">
              Consultoria completa em <span className="gradient-text">licitações públicas</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Tecnologia, curadoria, análise e suporte operacional para empresas que querem vender para
              órgãos públicos — tudo em um só parceiro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-gold/40 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center mb-5 ring-1 ring-gold/30">
                  <s.icon size={22} className="text-gold" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como Funciona / Atuação ── */}
      <section id="como-funciona" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#9a7d1f] text-sm font-semibold tracking-widest uppercase">Como Funciona</span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy mt-3 mb-4">
              Da oportunidade à participação <span className="gradient-text">sem complicação</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Atuamos desde a identificação da oportunidade até a participação no processo licitatório.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-gold/40 to-transparent z-0 -translate-y-px" />
                )}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:border-gold/40 transition-all duration-300 group relative z-10">
                  <div className="text-6xl font-black text-slate-100 absolute top-4 right-6 select-none">{step.num}</div>
                  <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mb-6 ring-1 ring-gold/30 group-hover:ring-gold/60 transition-all">
                    <step.icon size={24} className="text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">{step.description}</p>
                  <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-3 py-1.5">
                    <CheckCircle size={12} className="text-[#9a7d1f]" />
                    <span className="text-[#9a7d1f] text-xs font-semibold">{step.highlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section id="funcionalidades" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#9a7d1f] text-sm font-semibold tracking-widest uppercase">A Plataforma</span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy mt-3 mb-4">
              Tudo para <span className="gradient-text">dominar as disputas</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Tecnologia e consultoria juntas, num só lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-gold/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center ring-1 ring-gold/30 group-hover:ring-gold/60 transition-all">
                    <feature.icon size={22} className="text-gold" />
                  </div>
                  {feature.badge && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gold/15 text-[#9a7d1f] border border-gold/30">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#9a7d1f] text-sm font-semibold tracking-widest uppercase">Planos & Preços</span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy mt-3 mb-4">
              Invista em <span className="gradient-text">resultados</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Um único contrato ganho já paga a assinatura. Escolha o plano do tamanho do seu negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative bg-white rounded-2xl p-8 flex flex-col transition-all duration-300 ${plan.name === 'INFINITY_PLUS' ? 'border-2 border-gold shadow-xl scale-[1.02]' : plan.highlight ? 'border border-navy/30 shadow-md hover:shadow-lg' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy text-xs font-black px-4 py-1.5 rounded-full tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-navy">{plan.label}</h3>
                    {plan.name === 'INFINITY_PLUS' && (
                      <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                        <Award size={14} className="text-navy" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-black text-navy">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-slate-600 text-sm">{plan.description}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-gold" />
                      <span className="text-slate-700">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full text-center font-bold py-3.5 rounded-xl transition-all duration-200 ${plan.ctaVariant === 'filled' ? 'bg-gold text-navy hover:shadow-lg hover:scale-105' : plan.ctaVariant === 'outline-neon' ? 'bg-navy text-white hover:bg-[#16345f] hover:shadow-lg' : 'border border-slate-300 text-navy hover:border-navy hover:bg-slate-50'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            Cancele quando quiser. Dúvidas? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-[#9a7d1f] font-semibold hover:underline">Fale com um especialista</a>.
          </p>
        </div>
      </section>

      {/* ── Números + Pilares ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center hover:border-gold/40 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center mx-auto mb-4 ring-1 ring-gold/30">
                  <stat.icon size={18} className="text-gold" />
                </div>
                <p className="text-2xl font-black text-navy mb-1">{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <span className="text-[#9a7d1f] text-sm font-semibold tracking-widest uppercase">Nossos Pilares</span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy mt-3">
              Por que a <span className="gradient-text">Brasília Consultoria</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-lg hover:border-gold/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center mb-5 ring-1 ring-gold/30">
                  <p.icon size={22} className="text-gold" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{p.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-12 bg-navy text-center relative overflow-hidden shadow-2xl shadow-navy/20">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-6">
                <Landmark size={28} className="text-navy" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                Comece a vender para o governo com <span className="text-gold">inteligência</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Cadastre-se gratuitamente e acesse o painel em segundos. Sem cartão de crédito.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="group flex items-center justify-center gap-2 bg-gold text-navy font-bold text-base px-8 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Criar Conta Gratuita
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <MessageCircle size={18} className="text-[#25D366]" />
                  Falar com Especialista
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-12 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center ring-1 ring-gold/40">
                <Landmark size={18} className="text-gold" />
              </div>
              <div>
                <span className="font-bold text-navy text-sm tracking-tight">BRASÍLIA</span>
                <p className="text-[#9a7d1f] text-[10px] font-semibold uppercase tracking-wide">Consultoria em Licitações</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
              <Link href="/termos" className="text-slate-500 hover:text-navy text-sm transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="text-slate-500 hover:text-navy text-sm transition-colors">Política de Privacidade</Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-navy text-sm transition-colors">WhatsApp</a>
              <Link href="/login" className="text-slate-500 hover:text-navy text-sm transition-colors">Entrar</Link>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2026 Brasília Consultoria em Licitações. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-slate-500 text-xs">Todos os sistemas operacionais</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
