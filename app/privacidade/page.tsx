import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade | Brasília Consultoria em Licitações',
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-white text-slate-600">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-[#9a7d1f] font-semibold text-sm hover:underline">← Voltar ao início</Link>
        <h1 className="text-3xl font-black text-navy mt-6 mb-2">Política de Privacidade</h1>
        <p className="text-slate-500 text-sm mb-10">Brasília Consultoria em Licitações</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">1. Dados que coletamos</h2>
            <p>
              Coletamos os dados que você fornece ao criar sua conta (nome, e-mail, empresa e telefone)
              e os dados de uso da plataforma (licitações salvas, filtros e interações), necessários
              para prestar o serviço.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">2. Como usamos seus dados</h2>
            <p>
              Utilizamos seus dados para autenticar seu acesso, exibir oportunidades relevantes, enviar
              alertas que você configurar e melhorar a plataforma. Não vendemos seus dados a terceiros.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">3. Dados públicos de licitações</h2>
            <p>
              As informações de editais são obtidas de fontes públicas oficiais (PNCP – Portal Nacional
              de Contratações Públicas) e exibidas para sua consulta.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">4. Segurança</h2>
            <p>
              Adotamos medidas técnicas para proteger seus dados, incluindo senhas criptografadas e
              controle de acesso por perfil. Ainda assim, nenhum sistema é 100% infalível.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">5. Seus direitos (LGPD)</h2>
            <p>
              Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento,
              entrando em contato pelos nossos canais de atendimento.
            </p>
          </section>
          <section>
            <h2 className="text-navy font-bold text-lg mb-2">6. Contato</h2>
            <p>
              Dúvidas sobre privacidade? Fale conosco pelo{' '}
              <a href="https://wa.me/5531987551055" target="_blank" rel="noopener noreferrer" className="text-[#9a7d1f] font-semibold hover:underline">WhatsApp</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
