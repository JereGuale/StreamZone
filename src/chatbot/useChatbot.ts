import { generateResetToken } from '../lib/supabase';
import { fmt, getServiceDescription } from '../utils/helpers';

export function useChatbot(services: readonly any[], combos: readonly any[]) {
  const answer = async (q: string, context: string[] = []) => {
    const text = q.toLowerCase().trim();
    const fullContext = [...context, text].join(' '); // Combinar contexto con pregunta actual

    // Debug para ver qué está recibiendo
    console.log('Chatbot recibió:', text);
    console.log('Servicios disponibles:', services.length);
    console.log('Combos disponibles:', combos.length);

    // Saludos y bienvenida
    if (/hola|buenas|hey|hi|hello|buenos|buenas tardes|buenas noches|buenos días/.test(text)) {
      return "¡Hola! Bienvenido a StreamZone. Soy su asistente especializado en streaming. Puedo ayudarle con:\n\n💰 Ver precios - Catálogo completo de servicios\n🎯 Combos especiales - Grandes ahorros\n📺 Contenido disponible - Por plataforma\n🛒 Cómo comprar - Proceso paso a paso\n📱 Información de cuentas - Dispositivos y perfiles\n🔐 Recuperar contraseña - Si olvidó su acceso\n💳 Métodos de pago - Información bancaria\n🛠️ Soporte técnico - Ayuda y problemas\n\nComandos rápidos:\n• Escriba \"ver precios\" para el catálogo\n• Escriba \"combos\" para ofertas especiales\n• Escriba \"cómo comprar\" para el proceso\n• Escriba \"métodos de pago\" para información bancaria\n\n¿En qué puedo ayudarle?";
    }

    // Recuperación de contraseña
    if (/olvide|olvidé|contraseña|password|recuperar|reset|resetear/.test(text)) {
      return "🔐 RECUPERACIÓN DE CONTRASEÑA\n\nNo se preocupe, puedo ayudarle a recuperar su contraseña.\n\nProporcione su email y le generaré un código de recuperación.\n\nEjemplo: miemail@gmail.com\n\nImportante: El código se mostrará aquí en el chat, no se envía por email.\n\n¿Cuál es su email registrado?";
    }

    // Detectar email para generar token
    if (/@.*\./.test(text) && !/netflix|disney|hbo|amazon|spotify/.test(text)) {
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        const email = emailMatch[1];
        try {
          console.log('🔍 Chatbot generando token para:', email);
          const result = await generateResetToken(email);
          console.log('🔍 Chatbot resultado completo:', result);
          console.log('🔍 Token generado:', result.data?.token);
          console.log('🔍 Usuario:', result.data?.user);

          if (result.data) {
            return `🔐 **¡CÓDIGO GENERADO EXITOSAMENTE!** ✅\n\n📧 Email: ${email}\n🔑 **Tu código de recuperación:**\n\n**${result.data.token}**\n\n📋 **Instrucciones:**\n1. Ve a "Iniciar sesión" → "¿Olvidaste tu contraseña?"\n2. Ingresa tu email: ${email}\n3. Copia y pega este código: **${result.data.token}**\n4. Crea tu nueva contraseña\n\n⏰ **El código expira en 30 minutos**\n\n💡 ¡Guarda este código en un lugar seguro!`;
          } else {
            console.log('🔍 Error en resultado:', result.error);
            return `❌ **Error generando código**\n\n📧 Email: ${email}\n🚫 ${result.error?.message || 'Error desconocido'}\n\n💡 **Posibles causas:**\n• El email no está registrado\n• Problema de conexión\n\n🔧 **Solución:**\n• Verifica que el email sea correcto\n• Intenta crear una cuenta nueva si no tienes una`;
          }
        } catch (error) {
          console.log('🔍 Chatbot error en catch:', error);
          return `❌ **Error en el proceso**\n\n📧 Email: ${email}\n🚫 Error: ${error}\n\n💡 Intenta de nuevo o contacta soporte.`;
        }
      }
    }

    // Recomendaciones inteligentes por género/preferencias
    if (/recomendar|recomendación|recomendaciones|qué|que ver|mejor|sugerir|cuál|que plataforma|anime|familia|marvel|star wars|hbo|blockbuster|presupuesto bajo|dame|quiero ver|ayuda|opciones/.test(text)) {

      // Recomendaciones específicas por contenido
      if (/anime|manga|japonés|japones/.test(text)) {
        return "🎌 Para ANIME te recomiendo:\n\n1️⃣ **Crunchyroll** - El catálogo más grande de anime\n   Ejemplos: Attack on Titan, Demon Slayer, Jujutsu Kaisen\n\n2️⃣ **Netflix** - Anime original y clásicos\n   Ejemplos: Naruto, One Piece, Castlevania\n\n💡 ¿Prefieres anime clásico o series nuevas?";
      }

      if (/familia|niños|kids|disney|marvel|star wars|pixar/.test(text)) {
        return "👨‍👩‍👧‍👦 Para CONTENIDO FAMILIAR te recomiendo:\n\n1️⃣ **Disney+** - Marvel, Star Wars, Pixar\n   Ejemplos: Loki, The Mandalorian, Encanto\n\n2️⃣ **Combo Netflix + Disney+** - $6/mes (¡Ahorro!) 💰\n\n🎭 ¿Buscas contenido para adultos o toda la familia?";
      }

      if (/hbo|warner|premiadas|premios|calidad|premium/.test(text)) {
        return "🏆 Para SERIES PREMIUM te recomiendo:\n\n1️⃣ **Max (HBO)** - Contenido de alta calidad\n   Ejemplos: House of the Dragon, The Last of Us, Succession\n\n2️⃣ **Combo Max + Prime Video** - $5.50/mes\n\n🎬 ¿Te gustan las series dramáticas o prefieres acción?";
      }

      if (/blockbuster|películas|peliculas|acción|accion|superhéroes/.test(text)) {
        return "🎬 Para BLOCKBUSTERS te recomiendo:\n\n1️⃣ **Prime Video** - Películas + canales\n   Ejemplos: The Boys, Jack Ryan, Fast & Furious\n\n2️⃣ **Netflix** - Originales y éxitos\n   Ejemplos: Stranger Things, The Witcher, Extraction\n\n💥 ¿Prefieres películas de acción o series?";
      }

      if (/presupuesto bajo|barato|económico|economico|combo|ahorro/.test(text)) {
        return "💰 Para PRESUPUESTO BAJO te recomiendo:\n\n1️⃣ **Netflix + Disney+** - $6/mes (¡50% descuento!)\n2️⃣ **Netflix + Max** - $5.50/mes\n3️⃣ **Prime Video + Disney+** - $5.75/mes\n\n🎯 Todos incluyen: 1 perfil + 1 dispositivo\n💡 ¿Cuánto quieres gastar al mes?";
      }

      // Recomendación general
      const popular = services.slice(0, 3);
      return "🎯 Te recomiendo estas opciones populares:\n\n" + popular.map((s, i) =>
        `${i + 1}️⃣ **${s.name}** - ${fmt(s.price)}/${s.billing === 'annual' ? 'año' : 'mes'}\n   ${getServiceDescription(s.id)}`
      ).join('\n\n') + "\n\n🤔 ¿Qué tipo de contenido te gusta más? (anime, familia, acción, etc.)";
    }

    // Información detallada sobre contenido por plataforma
    if (/película|pelicula|serie|contenido|qué hay|que hay|disponible|ver|catálogo|catalogo/.test(text)) {
      if (/netflix/.test(text)) {
        return "📺 **NETFLIX** - Catálogo completo:\n\n🎬 **Series Originales:**\n• Stranger Things, The Crown, La Casa de Papel\n• Bridgerton, Ozark, The Witcher\n• Wednesday, Dahmer, Money Heist\n\n🎭 **Géneros:** Drama, Thriller, Comedia, Documentales\n🌍 **Países:** Disponible en Ecuador y Latinoamérica\n\n💡 ¿Te interesa algún género específico?";
      }

      if (/disney/.test(text)) {
        return "🏰 **DISNEY+** - Catálogo completo:\n\n🦸 **Marvel:** Loki, WandaVision, Hawkeye, Moon Knight\n⭐ **Star Wars:** The Mandalorian, Obi-Wan Kenobi\n🎨 **Pixar:** Soul, Luca, Turning Red\n🏰 **Disney Clásico:** Frozen, Moana, Encanto\n\n👨‍👩‍👧‍👦 **Perfecto para:** Familias, fans de Marvel/Star Wars\n\n🎯 ¿Buscas contenido para niños o adultos?";
      }

      if (/max|hbo/.test(text)) {
        return "👑 **MAX (HBO)** - Contenido Premium:\n\n🐉 **Series Épicas:** Game of Thrones, House of the Dragon\n🎮 **Videojuegos:** The Last of Us, Arcane\n💼 **Drama:** Succession, Euphoria, White Lotus\n🎬 **Películas:** Batman, Dune, Matrix\n\n🏆 **Calidad:** 4K, HDR, Dolby Atmos\n\n🎭 ¿Prefieres series dramáticas o películas épicas?";
      }

      if (/prime/.test(text)) {
        return "📦 **PRIME VIDEO** - Exclusivas + Beneficios:\n\n🦸 **Originales:** The Boys, The Marvelous Mrs. Maisel\n🎬 **Blockbusters:** Jack Ryan, Tom Clancy's\n📚 **Beneficios Extra:** Envío gratis Amazon\n\n🌍 **Disponibilidad:** Ecuador, Latinoamérica\n💰 **Valor:** Incluye envíos de Amazon\n\n🛒 ¿Te interesan las exclusivas o los beneficios de Amazon?";
      }

      if (/spotify/.test(text)) {
        return "🎵 **SPOTIFY** - Música Sin Límites:\n\n🎶 **Música:** 100M+ canciones\n🎧 **Podcasts:** Joe Rogan, Serial, Crime Junkie\n🎤 **Audiolibros:** Harry Potter, El Principito\n\n📱 **Dispositivos:** Móvil, PC, TV, Auto\n🎯 **Perfecto para:** Música, podcasts, audiolibros\n\n🎧 ¿Prefieres música, podcasts o audiolibros?";
      }

      return "📺 **CATÁLOGOS DISPONIBLES:**\n\n🎬 **Netflix:** Series originales, thrillers, documentales\n🏰 **Disney+:** Marvel, Star Wars, Pixar, Disney clásico\n👑 **Max:** HBO premium, Game of Thrones, películas épicas\n📦 **Prime Video:** Exclusivas, blockbusters + Amazon\n🎵 **Spotify:** Música, podcasts, audiolibros\n\n🤔 ¿Qué plataforma te interesa más?";
    }

    // Información sobre precios y combos
    if (/precio|precios|cuánto|cuesta|costar|combo|ahorro|descuento|barato|económico|economico/.test(text)) {
      if (/combo/.test(text)) {
        return "💰 **COMBOS DISPONIBLES:**\n\n" + combos.map(c => 
          `🎯 **${c.name}** - ${fmt(c.price)}/mes\n   💡 Ahorro significativo vs individual`
        ).join('\n\n') + "\n\n🎯 ¿Te interesa algún combo específico?";
      }

      return "💰 **PRECIOS INDIVIDUALES:**\n\n" + services.slice(0, 5).map(s => 
        `📺 **${s.name}** - ${fmt(s.price)}/${s.billing === 'annual' ? 'año' : 'mes'}`
      ).join('\n\n') + "\n\n💡 **Tip:** Los combos ofrecen grandes ahorros. Escribe \"combos\" para ver ofertas.";
    }

    // Proceso de compra
    if (/cómo comprar|como comprar|comprar|proceso|pasos|reservar|pagar|pago|metodo|método/.test(text)) {
      return "🛒 **PROCESO DE COMPRA:**\n\n1️⃣ **Selecciona** tu servicio o combo\n2️⃣ **Reserva** por WhatsApp (+593 98 428 0334)\n3️⃣ **Paga** por transferencia bancaria\n4️⃣ **Recibe** tus credenciales al instante\n5️⃣ **Disfruta** de tu entretenimiento\n\n💳 **Métodos de pago:**\n• Banco Pichincha\n• Banco de Guayaquil\n• Banco del Pacífico\n• PayPal\n• Transferencia móvil\n\n📱 **WhatsApp:** +593 98 428 0334\n\n¿Necesitas ayuda con algún paso específico?";
    }

    // Información de cuentas y dispositivos
    if (/cuenta|perfil|dispositivo|dispositivos|usuario|usuario|sesión|sesion|login|acceso/.test(text)) {
      return "👤 **INFORMACIÓN DE CUENTAS:**\n\n📱 **Dispositivos:**\n• Móvil (Android/iOS)\n• Smart TV (Samsung, LG, Sony)\n• Computadora (Windows/Mac)\n• Tablet (iPad, Android)\n\n👥 **Perfiles:**\n• 1 perfil por servicio\n• Contraseña personalizada\n• Acceso desde cualquier dispositivo\n\n🔐 **Seguridad:**\n• Cambio de contraseña disponible\n• Recuperación por email\n• Soporte 24/7\n\n💡 ¿Necesitas ayuda con algún dispositivo específico?";
    }

    // Métodos de pago
    if (/método|metodo|pago|pagar|banco|transferencia|paypal|pichincha|guayaquil|pacifico/.test(text)) {
      return "💳 **MÉTODOS DE PAGO:**\n\n🏦 **Bancos Nacionales:**\n• Banco Pichincha\n• Banco de Guayaquil\n• Banco del Pacífico\n\n💚 **PayPal:**\n• Pago internacional\n• Tarjeta de crédito/débito\n\n📱 **Transferencia Móvil:**\n• Pago desde tu celular\n• Rápido y seguro\n\n💰 **Proceso:**\n1. Reserva por WhatsApp\n2. Te enviamos datos bancarios\n3. Realizas la transferencia\n4. Recibes credenciales al instante\n\n📱 **WhatsApp:** +593 98 428 0334\n\n¿Prefieres algún método específico?";
    }

    // Soporte técnico
    if (/soporte|ayuda|problema|error|no funciona|no carga|técnico|tecnico|bug|falla/.test(text)) {
      return "🛠️ **SOPORTE TÉCNICO:**\n\n📱 **Problemas comunes:**\n• No carga el contenido → Reinicia la app\n• Error de login → Verifica credenciales\n• Lento → Cierra otras apps\n• No reproduce → Actualiza la app\n\n🔧 **Soluciones:**\n• Reinicia el dispositivo\n• Actualiza la aplicación\n• Verifica tu conexión a internet\n• Contacta soporte si persiste\n\n📞 **Contacto:**\n• WhatsApp: +593 98 428 0334\n• Email: soporte@streamzone.com\n• Disponible 24/7\n\n¿Qué problema específico tienes?";
    }

    // Información general sobre StreamZone
    if (/streamzone|stream zone|qué es|que es|información|info|acerca|sobre/.test(text)) {
      return "🎬 **STREAMZONE** - Tu entretenimiento digital:\n\n✨ **¿Qué somos?**\n• Plataforma de streaming premium\n• Acceso a todas las plataformas\n• Precios increíbles\n• Soporte 24/7\n\n🎯 **Nuestros servicios:**\n• Netflix, Disney+, Max, Prime Video\n• Spotify, Crunchyroll, YouTube Premium\n• Combos especiales con ahorros\n\n💰 **Ventajas:**\n• Precios más bajos que individual\n• Activación inmediata\n• Soporte personalizado\n• Renovación automática\n\n🛒 **¿Cómo funciona?**\n1. Selecciona tu servicio\n2. Reserva por WhatsApp\n3. Paga y recibe credenciales\n4. ¡Disfruta!\n\n📱 **Contacto:** +593 98 428 0334\n\n¿Te interesa algún servicio específico?";
    }

    // Respuesta por defecto
    return "🤔 No estoy seguro de entender tu pregunta. Puedo ayudarte con:\n\n💰 **Precios y combos**\n📺 **Contenido disponible**\n🛒 **Cómo comprar**\n🔐 **Recuperar contraseña**\n💳 **Métodos de pago**\n🛠️ **Soporte técnico**\n\n💡 **Comandos útiles:**\n• \"ver precios\" - Catálogo completo\n• \"combos\" - Ofertas especiales\n• \"cómo comprar\" - Proceso paso a paso\n• \"métodos de pago\" - Información bancaria\n\n¿En qué más puedo ayudarte?";
  };

  return { answer };
}