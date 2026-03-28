import Link from 'next/link'
import {
  Bot,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Shield,
  Star,
  TrendingUp,
  Zap,
  Bell,
  BarChart2,
  ArrowRight,
  Users,
  Award,
  Activity,
} from 'lucide-react'

// ─── Static data ──────────────────────────────────────────────────────────────

const steps = [
  {
    num: '01',
    icon: Bot,
    title: 'Coleta Automática 24/7',
    description:
      'Nossos robôs monitoram os 19 maiores portais públicos de licitação do Brasil continuamente — PNCP, Compras.gov, BLL e portais municipais — sem nenhuma ação sua.',
    highlight: '19 portais monitorados',
  },
  {
    num: '02',
    icon: Zap,
    title: 'IA Analisa em Segundos',
    description:
      'Cada edital coletado é processado pela nossa IA Gemini Pro, que extrai automaticamente objeto, requisitos, prazos, itens e red flags — gerando um resumo executivo completo.',
    highlight: '0.8s tempo médio',
  },
  {
    num: '03',
    icon: Bell,
    title: 'Você Gerencia com Precisão',
    description:
      'Receba alertas personalizados por e-mail, organize suas disputas no Kanban integrado e converse diretamente com a IA sobre qualquer edital para esclarecer dúvidas.',
    highlight: 'Alertas diários às 7h',
  },
]

const features = [
  {
    icon: Search,
    title: 'Busca Inteligente com IA',
    description:
      'Pesquise editais por palavras-chave em qualquer campo do documento, incluindo o texto completo dos PDFs. Filtros avançados por estado, valor, modalidade e data de abertura.',
    badge: null,
    color: 'neon',
  },
  {
    icon: MessageSquare,
    title: 'Converse com o Edital',
    description:
      'Chat direto com IA generativa (Gemini Pro) sobre qualquer edital. Pergunte sobre requisitos técnicos, habilitação jurídica, critérios de julgamento ou qualquer cláusula.',
    badge: 'PRO',
    color: 'purple',
  },
  {
    icon: LayoutDashboard,
    title: 'Kanban de Disputas',
    description:
      'Gerencie sua pipeline de licitações como um CRM profissional. Mova editais entre Lead, Avaliando, Encaminhado e Vencido. Adicione notas, alertas e acompanhe valores.',
    badge: 'PRO',
    color: 'neon',
  },
  {
    icon: Bell,
    title: 'Alertas Automáticos',
    description:
      'Receba um e-mail consolidado toda manhã com os novos editais que correspondem ao seu perfil. Configure palavras-chave, estados, valores mínimos e portais preferidos.',
    badge: 'PRO',
    color: 'purple',
  },
  {
    icon: BarChart2,
    title: 'Dashboard Analítico',
    description:
      'Visualize sua taxa de conversão, valores em disputa, contratos ganhos por período e distribuição por portal. Tome decisões baseadas em dados reais do seu negócio.',
    badge: 'PRO',
    color: 'neon',
  },
  {
    icon: Shield,
    title: 'Módulo Jurídico',
    description:
      'Checklists automáticos de conformidade documental, validação de certidões, alertas de vencimento e análise de cláusulas restritivas. Em desenvolvimento avançado.',
    badge: 'EM BREVE',
    color: 'purple',
  },
]

const plans = [
  {
    name: 'FREE',
    label: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para começar a explorar o mundo das licitações públicas.',
    features: [
      '5 editais por dia',
      '1 portal monitorado',
      'Busca básica',
      'Sem resumo por IA',
      'Sem alertas automáticos',
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
    description: 'Para licitantes que querem velocidade e inteligência real.',
    features: [
      '100 editais por dia',
      '5 portais monitorados',
      'Resumo IA de cada edital',
      'Alertas diários por e-mail',
      'Kanban de disputas',
      'Dashboard analítico',
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
    description: 'Para empresas que não podem se dar ao luxo de perder uma disputa.',
    features: [
      'Editais ilimitados',
      '19 portais monitorados',
      'Chat IA completo com editais',
      'Alertas customizados',
      'Kanban avançado',
      'Dashboard + relatórios',
      'Módulo Jurídico (beta)',
      'Onboarding personalizado',
      'Suporte 24/7 WhatsApp',
    ],
    cta: 'Assinar Infinity+',
    ctaVariant: 'filled',
    highlight: false,
    badge: 'MAIS POPULAR',
  },
]

const testimonials = [
  {
    name: 'Ricardo Alves',
    role: 'Diretor Comercial',
    company: 'Alves Soluções Tecnológicas — SP',
    avatar: 'RA',
    text: 'Antes gastávamos 3 horas por dia vasculhando portais. Com o Performance Pregão, em 15 minutos já temos um panorama completo. Ganhamos 4 contratos no primeiro mês que nem teríamos visto a tempo.',
    stars: 5,
  },
  {
    name: 'Fernanda Costa',
    role: 'Gestora de Licitações',
    company: 'GovTech Serviços — MG',
    avatar: 'FC',
    text: 'O chat com IA é absurdamente útil. Coloco o edital e pergunto diretamente sobre os requisitos de habilitação — em segundos sei se vale a pena entrar. Isso mudou completamente meu fluxo de trabalho.',
    stars: 5,
  },
  {
    name: 'Carlos Mendonça',
    role: 'Sócio-fundador',
    company: 'Mendonça Engenharia — RS',
    avatar: 'CM',
    text: 'O Kanban integrado transformou nossa gestão. Tenho 23 disputas ativas e sei exatamente em que fase está cada uma, com alertas automáticos antes das datas de abertura. Indispensável.',
    stars: 5,
  },
]

const stats = [
  { value: 'R$ 2.4M', label: 'em contratos ganhos este mês', icon: Award },
  { value: '98%', label: 'de satisfação dos clientes', icon: Star },
  { value: '0.8s', label: 'tempo médio de resposta da IA', icon: Activity },
  { value: '47%', label: 'de ganho de tempo comprovado', icon: TrendingUp },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 glass-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center">
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Performance <span className="text-neon">Pregão</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-slate-400 hover:text-white text-sm transition-colors">
            Como Funciona
          </a>
          <a href="#funcionalidades" className="text-slate-400 hover:text-white text-sm transition-colors">
            Funcionalidades
          </a>
          <a href="#planos" className="text-slate-400 hover:text-white text-sm transition-colors">
            Planos
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-slate-400 hover:text-white text-sm transition-colors px-4 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="bg-neon text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:shadow-neon hover:scale-105 transition-all duration-200"
          >
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* ── SECTION 1: Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 grid-bg">
        {/* Animated background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-neon-purple/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-neon/20">
              <div className="w-2 h-2 bg-neon rounded-full animate-pulse" />
              <span className="text-neon text-xs font-semibold tracking-wider uppercase">
                IA Generativa em Licitações
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] text-white mb-6 tracking-tight">
              A Inteligência que te coloca{' '}
              <span className="gradient-text">à frente</span> da concorrência
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl lg:max-w-none">
              Monitore <strong className="text-white">19 portais públicos</strong> automaticamente, receba
              resumos de editais em segundos com IA Gemini e gerencie suas disputas com um Kanban profissional.
              Nunca mais perca um contrato por falta de informação ou tempo.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 bg-neon text-black font-bold text-base px-8 py-4 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-200"
              >
                Começar Agora — É Grátis
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#como-funciona"
                className="flex items-center justify-center gap-2 glass border border-white/20 text-white font-semibold text-base px-8 py-4 rounded-xl hover:border-neon/40 hover:bg-neon/5 transition-all duration-200"
              >
                Ver Demo
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Floating stat badges */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Activity, text: '19 portais monitorados' },
                { icon: FileText, text: '+3.200 editais/dia' },
                { icon: Bot, text: 'IA generativa incluída' },
              ].map((stat) => (
                <div
                  key={stat.text}
                  className="flex items-center gap-2 glass rounded-full px-4 py-2 border border-white/10"
                >
                  <stat.icon size={14} className="text-neon" />
                  <span className="text-white text-sm font-medium">{stat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="flex-1 w-full max-w-2xl animate-float">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.1)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded-md h-6 flex items-center px-3">
                  <span className="text-slate-500 text-xs">performancepregao.online/dashboard</span>
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="p-5 bg-dark-800/80">
                {/* Top stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Disputas Ativas', value: '23', color: 'text-neon' },
                    { label: 'Valor em Jogo', value: 'R$ 847K', color: 'text-neon' },
                    { label: 'Taxa de Vitória', value: '34%', color: 'text-green-400' },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-xl p-3">
                      <p className="text-slate-500 text-[10px] mb-1">{s.label}</p>
                      <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Fake bidding rows */}
                <div className="space-y-2">
                  {[
                    {
                      title: 'Fornecimento de Material de TI — 480 itens',
                      portal: 'PNCP',
                      value: 'R$ 234.500',
                      time: '2d 4h',
                      urgent: false,
                    },
                    {
                      title: 'Contratação de Serviços de Limpeza Predial',
                      portal: 'Compras.gov',
                      value: 'R$ 89.000',
                      time: '18h',
                      urgent: true,
                    },
                    {
                      title: 'Aquisição de Mobiliário para Secretaria Municipal',
                      portal: 'BLL',
                      value: 'R$ 145.200',
                      time: '5d 2h',
                      urgent: false,
                    },
                  ].map((b) => (
                    <div
                      key={b.title}
                      className="flex items-center gap-3 glass rounded-lg p-3 hover:border-neon/20 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{b.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-neon text-[10px] font-mono">{b.portal}</span>
                          <span className="text-slate-500 text-[10px]">•</span>
                          <span className="text-slate-400 text-[10px]">{b.value}</span>
                        </div>
                      </div>
                      <div
                        className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          b.urgent
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-neon/10 text-neon'
                        }`}
                      >
                        {b.time}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI summary indicator */}
                <div className="mt-4 glass rounded-xl p-3 border border-neon/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-neon" />
                    <span className="text-neon text-xs font-semibold">Resumo IA — Edital #2847</span>
                    <div className="ml-auto flex gap-1">
                      <div className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Pregão Eletrônico para fornecimento de equipamentos de TI. Empresa deve ter CNPJ ativo
                    há min. 2 anos. Habilitação técnica exige atestado de capacidade...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse-neon">
          <span className="text-slate-600 text-xs">Role para ver mais</span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-neon rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: How It Works ── */}
      <section id="como-funciona" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-800/50 to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-neon text-sm font-semibold tracking-widest uppercase">Como Funciona</span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mt-3 mb-4">
              De zero a oportunidade qualificada{' '}
              <span className="gradient-text">em 3 passos</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Automatizamos todo o trabalho operacional para que você foque no que realmente importa:
              preparar propostas vencedoras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-neon/30 to-transparent z-0 -translate-y-px" />
                )}

                <div className="glass rounded-2xl p-8 border border-white/10 hover:border-neon/30 hover:shadow-neon transition-all duration-300 group relative z-10">
                  {/* Number */}
                  <div className="text-6xl font-black text-white/5 absolute top-4 right-6 select-none">
                    {step.num}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center mb-6 group-hover:bg-neon/20 group-hover:border-neon/40 transition-all">
                    <step.icon size={24} className="text-neon" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{step.description}</p>

                  {/* Highlight */}
                  <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/20 rounded-full px-3 py-1.5">
                    <CheckCircle size={12} className="text-neon" />
                    <span className="text-neon text-xs font-semibold">{step.highlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Features ── */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-neon text-sm font-semibold tracking-widest uppercase">Funcionalidades</span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mt-3 mb-4">
              Tudo que você precisa para{' '}
              <span className="gradient-text">dominar as disputas</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Uma plataforma completa que combina automação, inteligência artificial e gestão profissional
              de licitações em um único lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-7 border border-white/10 hover:border-neon/30 hover:shadow-neon transition-all duration-300 group card-hover"
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      feature.color === 'neon'
                        ? 'bg-neon/10 border border-neon/20 group-hover:bg-neon/20'
                        : 'bg-neon-purple/10 border border-neon-purple/20 group-hover:bg-neon-purple/20'
                    } transition-all`}
                  >
                    <feature.icon
                      size={22}
                      className={feature.color === 'neon' ? 'text-neon' : 'text-neon-purple'}
                    />
                  </div>
                  {feature.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        feature.badge === 'EM BREVE'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : feature.color === 'neon'
                          ? 'bg-neon/10 text-neon border border-neon/20'
                          : 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20'
                      }`}
                    >
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Pricing ── */}
      <section id="planos" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-800/30 to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-neon text-sm font-semibold tracking-widest uppercase">Planos & Preços</span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mt-3 mb-4">
              Invista em resultados,{' '}
              <span className="gradient-text">não em processos manuais</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Um único contrato ganho por mês já paga anos de assinatura. Escolha o plano que
              corresponde ao volume do seu negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative glass rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                  plan.name === 'INFINITY_PLUS'
                    ? 'border-2 border-neon shadow-neon-lg scale-[1.02]'
                    : plan.highlight
                    ? 'border border-neon/40 hover:border-neon/70'
                    : 'border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon text-black text-xs font-black px-4 py-1.5 rounded-full tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{plan.label}</h3>
                    {plan.name === 'INFINITY_PLUS' && (
                      <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center">
                        <Zap size={14} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <CheckCircle
                        size={16}
                        className={`flex-shrink-0 mt-0.5 ${
                          plan.name === 'INFINITY_PLUS' ? 'text-neon' : 'text-neon/70'
                        }`}
                      />
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`w-full text-center font-bold py-3.5 rounded-xl transition-all duration-200 ${
                    plan.ctaVariant === 'filled'
                      ? 'bg-neon text-black hover:shadow-neon-lg hover:scale-105'
                      : plan.ctaVariant === 'outline-neon'
                      ? 'border border-neon text-neon hover:bg-neon/10 hover:shadow-neon'
                      : 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-600 text-sm mt-8">
            Todos os planos incluem 7 dias de garantia. Cancele quando quiser, sem multa.
          </p>
        </div>
      </section>

      {/* ── SECTION 5: Social Proof / ROI ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 border border-white/10 text-center hover:border-neon/30 hover:shadow-neon transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon size={18} className="text-neon" />
                </div>
                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ROI headline */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 glass rounded-2xl px-6 py-4 border border-neon/20 mb-8">
              <TrendingUp size={20} className="text-neon" />
              <span className="text-white font-bold text-lg">
                47% de ganho de tempo comprovado
              </span>
              <span className="text-slate-500 text-sm">em pesquisa com 200+ clientes</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Quem usa, <span className="gradient-text">vence mais</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Mais de 400 empresas brasileiras já usam o Performance Pregão para encontrar e ganhar
              contratos públicos com muito mais eficiência.
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass rounded-2xl p-7 border border-white/10 hover:border-neon/20 hover:shadow-neon transition-all duration-300 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} fill="#FCD34D" className="text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{t.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-black text-xs">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                    <p className="text-slate-600 text-xs">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-12 border border-neon/20 shadow-neon text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-neon-purple/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mx-auto mb-6">
                <Zap size={28} className="text-neon" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                Comece a ganhar contratos com{' '}
                <span className="gradient-text">inteligência real</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                Cadastre-se gratuitamente e acesse o painel em segundos. Sem cartão de crédito,
                sem pegadinha. Apenas resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="group flex items-center justify-center gap-2 bg-neon text-black font-bold text-base px-8 py-4 rounded-xl hover:shadow-neon-lg hover:scale-105 transition-all duration-200"
                >
                  Criar Conta Gratuita
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="mailto:contato@performancepregao.online"
                  className="flex items-center justify-center gap-2 glass border border-white/20 text-white font-semibold text-base px-8 py-4 rounded-xl hover:border-white/40 transition-all duration-200"
                >
                  Falar com Especialista
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Footer ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center">
                <Zap size={16} className="text-black" />
              </div>
              <div>
                <span className="font-bold text-white text-lg tracking-tight">
                  Performance <span className="text-neon">Pregão</span>
                </span>
                <p className="text-slate-600 text-xs">Inteligência em Licitações</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-6 justify-center">
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">
                Política de Privacidade
              </a>
              <a
                href="mailto:contato@performancepregao.online"
                className="text-slate-500 hover:text-white text-sm transition-colors"
              >
                Contato
              </a>
              <Link href="/login" className="text-slate-500 hover:text-white text-sm transition-colors">
                Entrar
              </Link>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              © 2024 Performance Pregão. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-slate-600 text-xs">Todos os sistemas operacionais</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
