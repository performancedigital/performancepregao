import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso | Brasília Consultoria em Licitações',
}

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-white text-slate-600">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-[#9a7d1f] font-semibold text-sm hover:underline">← Voltar ao início</Link>
        <h1 className="text-3xl font-black text-navy mt-6 mb-2">Termos de Uso</h1>
        <p className="text-slate-500 text-sm mb-10">Brasília Consultoria em Licitações</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">1. Aceitação</h2>
            <p>
              Ao usar a plataforma da Brasília Consultoria em Licitações, você concorda com estes Termos
              de Uso e com a nossa{' '}
              <Link href="/privacidade" className="text-[#9a7d1f] font-semibold hover:underline">Política de Privacidade</Link>.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">2. O serviço</h2>
            <p>
              Oferecemos uma ferramenta de busca, análise (com inteligência artificial) e gestão de
              licitações públicas, além de consultoria especializada. As informações de editais provêm de
              fontes públicas oficiais (PNCP).
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">3. Natureza informativa</h2>
            <p>
              Os resumos gerados por IA e os dados exibidos têm caráter informativo e de apoio à decisão.
              Recomendamos sempre conferir o edital original no portal oficial antes de participar de
              qualquer disputa. Não nos responsabilizamos por decisões tomadas exclusivamente com base na
              plataforma.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">4. Conta e uso</h2>
            <p>
              Você é responsável por manter a confidencialidade das suas credenciais e por todas as
              atividades realizadas na sua conta. É proibido usar a plataforma para fins ilícitos.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">5. Planos e pagamentos</h2>
            <p>
              Os planos pagos são cobrados conforme descrito na página de planos. Você pode cancelar a
              qualquer momento; o acesso permanece ativo até o fim do período já pago.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">6. Contato</h2>
            <p>
              Dúvidas sobre estes termos? Fale conosco pelo{' '}
              <a href="https://wa.me/5531987551055" target="_blank" rel="noopener noreferrer" className="text-[#9a7d1f] font-semibold hover:underline">WhatsApp</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
