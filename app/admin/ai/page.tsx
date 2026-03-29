export default function AIConfigPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Configuração IA</h1>
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
        <p className="mb-3">Configure sua chave de IA para habilitar Chat e Resumo de Editais.</p>
        <p>
          Crie sua API Key gratuita em:{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            aistudio.google.com/apikey
          </a>
        </p>
        <p className="mt-3 text-sm">
          Depois adicione como variável de ambiente no Vercel:{' '}
          <code className="bg-white/10 px-2 py-1 rounded text-white">GOOGLE_GENERATIVE_AI_API_KEY</code>
        </p>
      </div>
    </div>
  )
}
