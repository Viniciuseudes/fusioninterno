import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1625] text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-8 text-gray-400">Página não encontrada</h2>
      <Link
        href="/"
        className="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
