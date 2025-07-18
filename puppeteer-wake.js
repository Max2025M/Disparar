import asyncio
import logging
from pyppeteer import launch
from pyppeteer.errors import TimeoutError

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s - %(message)s')

URL_RENDER = "https://texten-1kdb.onrender.com"

async def verificar_render():
    try:
        logging.info(f"🔵 Acessando Render: {URL_RENDER}")
        browser = await launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        page = await browser.newPage()

        await page.goto(URL_RENDER, {
            'timeout': 60000,
            'waitUntil': 'networkidle2'
        })

        # Espera 5 segundos para garantir que qualquer JS seja executado
        await asyncio.sleep(5)

        # Pega o texto puro do corpo da página
        conteudo = await page.evaluate('() => document.body.textContent')

        logging.info(f"📋 Resposta do Render: {conteudo.strip()}")

        await browser.close()
        return True

    except TimeoutError:
        logging.error("⏰ Tempo excedido ao tentar acessar o Render.")
        return False
    except Exception as e:
        logging.error(f"❌ Erro ao acessar o Render: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(verificar_render())
