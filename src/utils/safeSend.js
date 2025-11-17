export async function safeSend(bot, chatId, text, options = {}) {
    const retries = 3;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await bot.sendMessage(chatId, text, options);
        console.log(`[SEND] message_id=${res.message_id}`);
        return res;
      } catch (err) {
        console.error(`[SEND] попытка ${i+1} ошибка:`, err.code || err.message);
        if (i === retries-1) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }