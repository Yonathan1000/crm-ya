import React from 'react';

export function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mb-6 font-medium inline-flex items-center">
          &larr; Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>
        <div className="prose prose-sm text-gray-700 space-y-4">
          <p><strong>Última actualización:</strong> Octubre 2026</p>
          <p>En Nivel Dios CRM ("nosotros", "nuestro"), respetamos tu privacidad y estamos comprometidos a proteger tus datos personales. Esta política describe cómo recopilamos, usamos y compartimos tu información.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">1. Información que recopilamos</h2>
          <p>Recopilamos información que nos proporcionas directamente al crear una cuenta o conectar tus canales de comunicación (Meta, WhatsApp, etc.). Esto incluye tu nombre, correo electrónico, y los mensajes que gestionas a través de nuestra plataforma mediante las APIs oficiales.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">2. Uso de la información</h2>
          <p>Utilizamos tu información para proporcionar y mantener el servicio, procesar tus pagos, enviarte actualizaciones técnicas y brindarte soporte. Los mensajes de tus clientes (procesados mediante la API de Meta) solo se utilizan para mostrarlos en tu bandeja de entrada y permitirte responder.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Compartir información</h2>
          <p>No vendemos tus datos a terceros. Solo compartimos la información estrictamente necesaria con proveedores de servicios autorizados (como plataformas de pago y servicios en la nube) para el funcionamiento del CRM.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Seguridad</h2>
          <p>Implementamos medidas de seguridad técnicas (como encriptación TLS y hashing de contraseñas) para proteger tus datos contra acceso no autorizado. Los webhooks de comunicación están protegidos por firmas criptográficas.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Uso de las APIs de Meta</h2>
          <p>Nivel Dios CRM utiliza las APIs oficiales de Facebook e Instagram. Nuestro uso de la información recibida a través de estas APIs cumple con las Políticas de la Plataforma de Meta. No utilizamos los datos de mensajería para perfilamiento publicitario.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">6. Contacto</h2>
          <p>Si tienes preguntas sobre esta política, contáctanos a soporte@niveldioscrm.com.</p>
        </div>
      </div>
    </div>
  );
}

export function TermsOfService({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mb-6 font-medium inline-flex items-center">
          &larr; Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Términos de Servicio</h1>
        <div className="prose prose-sm text-gray-700 space-y-4">
          <p><strong>Última actualización:</strong> Octubre 2026</p>
          <p>Bienvenido a Nivel Dios CRM. Al utilizar nuestra plataforma, aceptas estos términos y condiciones en su totalidad.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">1. Uso del Servicio</h2>
          <p>Nivel Dios CRM es una plataforma B2B (Business to Business) diseñada para centralizar la comunicación con clientes. Debes ser mayor de edad y tener autoridad para vincular a la empresa que representas a estos términos.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">2. Cuentas y Seguridad</h2>
          <p>Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Nos reservamos el derecho de suspender cuentas que violen estos términos o que realicen actividades sospechosas o de SPAM.</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Pagos y Suscripciones</h2>
          <p>El uso del CRM requiere una suscripción de pago (mensual o anual). Los pagos se realizan de manera anticipada. En caso de pagos manuales (Criptomonedas), el servicio se activará únicamente tras la confirmación en la red (blockchain).</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Integraciones de Terceros</h2>
          <p>Al conectar cuentas de terceros (como Meta, Instagram o WhatsApp), aceptas cumplir con las políticas y términos de servicio de dichas plataformas. Nivel Dios CRM no se hace responsable de bloqueos, baneos o suspensiones originadas por el mal uso de los canales de comunicación por parte del cliente (ej. envío masivo de SPAM).</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Disponibilidad del Servicio</h2>
          <p>Hacemos todo lo posible por garantizar un uptime del 99.9%, pero no garantizamos que el servicio será ininterrumpido o libre de errores. El servicio se proporciona "tal cual".</p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">6. Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Notificaremos a los usuarios activos sobre cambios significativos.</p>
        </div>
      </div>
    </div>
  );
}
