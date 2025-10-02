import Icon from './ui/icon';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-700 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">График управления</h3>
            <p className="text-sm text-blue-200 font-body">
              Система планирования депутата Государственной Думы Российской Федерации
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">Контакты</h3>
            <div className="space-y-2 text-sm text-blue-200 font-body">
              <div className="flex items-center gap-2">
                <Icon name="Mail" size={16} />
                <span>info@deputy.gov.ru</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Phone" size={16} />
                <span>+7 (495) 000-00-00</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={16} />
                <span>г. Москва, Охотный Ряд, 1</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">Навигация</h3>
            <div className="space-y-2 text-sm text-blue-200 font-body">
              <a href="#" className="block hover:text-white transition-colors">
                График мероприятий
              </a>
              <a href="#" className="block hover:text-white transition-colors">
                Архив событий
              </a>
              <a href="#" className="block hover:text-white transition-colors">
                Документы
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-400 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-blue-200 font-body text-center sm:text-left">
            © {currentYear} График управления. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-blue-200 hover:text-white transition-colors"
              aria-label="Telegram"
            >
              <Icon name="Send" size={20} />
            </a>
            <a
              href="#"
              className="text-blue-200 hover:text-white transition-colors"
              aria-label="VK"
            >
              <Icon name="Share2" size={20} />
            </a>
            <a
              href="#"
              className="text-blue-200 hover:text-white transition-colors"
              aria-label="Email"
            >
              <Icon name="Mail" size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
