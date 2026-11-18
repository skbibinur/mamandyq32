import type { AppSection } from '../types/career';

interface FooterProps {
  onNavigate: (section: AppSection) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#DCE4EE] bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-[#546E7A]">
        <div>
          <p className="font-bold text-[#243B64]">Оңай көмек</p>
          <p className="text-xs text-[#546E7A] mt-1">
            Мектеп оқушыларына арналған профориентациялық бағыттаушы. Кәсіби диагноз болып
            табылмайды.
          </p>
        </div>

        <nav aria-label="Төменгі мәзір" className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#263238]">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-[#4F8FEA] transition-colors cursor-pointer"
          >
            Басты бет
          </button>
          <button
            type="button"
            onClick={() => onNavigate('quiz')}
            className="hover:text-[#4F8FEA] transition-colors cursor-pointer"
          >
            Тест
          </button>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="hover:text-[#4F8FEA] transition-colors cursor-pointer"
          >
            Каталог
          </button>
          <button
            type="button"
            onClick={() => onNavigate('compare')}
            className="hover:text-[#4F8FEA] transition-colors cursor-pointer"
          >
            Салыстыру
          </button>
          <button
            type="button"
            onClick={() => onNavigate('counselor')}
            className="hover:text-[#4F8FEA] transition-colors cursor-pointer"
          >
            AI кеңесші
          </button>
        </nav>
      </div>
    </footer>
  );
}
