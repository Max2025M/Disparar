const axios = require('axios');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const BASE_URL = 'http://localhost:21465'; // Porta padrão do WPConnect
const SESSION = 'default-session';

const numero = process.env.NUMERO;
const mensagem = process.env.MENSAGEM;

(async () => {
  try {
    // Aguarda o servidor estar de pé e autenticado
    console.log('⏳ Aguardando autenticação no WhatsApp...');
    let conectado = false;
    for (let i = 0; i < 20; i++) {
      const { data } = await axios.get(`${BASE_URL}/api/${SESSION}/status-session`);
      if (data.status === 'CONNECTED') {
        conectado = true;
        break;
      }
      await delay(3000);
    }

    if (!conectado) {
      console.error('❌ WhatsApp não autenticado a tempo.');
      process.exit(1);
    }

    console.log('✅ WhatsApp conectado com sucesso! Enviando mensagem...');

    // Envia mensagem para o número
    await axios.post(`${BASE_URL}/api/${SESSION}/send-message`, {
      phone: numero,
      message: mensagem,
    });

    console.log(`📤 Mensagem enviada para ${numero}: "${mensagem}"`);

    // Escuta por resposta por 2 minutos
    console.log(`👂 Aguardando resposta de ${numero} por até 2 minutos...`);
    const startTime = Date.now();
    while (Date.now() - startTime < 120000) {
      const { data } = await axios.get(`${BASE_URL}/api/${SESSION}/chats`);

      const chat = data.find(chat => chat.id?.includes(numero));
      if (chat && chat.unreadCount > 0) {
        // Pegou resposta nova
        const { data: mensagens } = await axios.get(`${BASE_URL}/api/${SESSION}/messages/${chat.id}`);
        const resposta = mensagens?.[mensagens.length - 1]?.body;
        console.log(`💬 Resposta recebida de ${numero}: "${resposta}"`);

        // Envia resposta automática
        await axios.post(`${BASE_URL}/api/${SESSION}/send-message`, {
          phone: numero,
          message: 'Siga nossas páginas de Facebook!',
        });

        console.log(`📢 Resposta enviada: "Siga nossas páginas de Facebook!"`);
        break;
      }

      await delay(5000); // Espera antes de verificar de novo
    }

    console.log('✅ Processo concluído.');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
