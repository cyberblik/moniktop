const express = require('express');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Эндпоинт для CRC проверки (GET)
app.get('/webhook/twitter', (req, res) => {
  const crcToken = req.query.crc_token;
  
  if (!crcToken) {
    return res.status(400).send('crc_token missing');
  }

  const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
  
  const hmac = crypto.createHmac('sha256', consumerSecret)
    .update(crcToken)
    .digest('base64');

  res.json({ response_token: `sha256=${hmac}` });
  console.log('✅ CRC check passed');
});

// Эндпоинт для событий (POST)
app.post('/webhook/twitter', (req, res) => {
  const event = req.body;
  console.log('📨 Получено событие:', JSON.stringify(event, null, 2));
  
  if (event.tweet_create_events) {
    event.tweet_create_events.forEach(tweet => {
      console.log(`🆕 Новый твит от @${tweet.user.screen_name}: ${tweet.text}`);
    });
  }
  
  res.sendStatus(200);
});

// ✅ НОВЫЙ ЭНДПОИНТ для регистрации вебхука
app.post('/register-webhook', async (req, res) => {
  try {
    const twitterResponse = await fetch('https://api.twitter.com/2/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAFPi8AEAAAAAA6xJS%2BHhK8asB%2B1J2BF3PdkZpGBI%3DEbzPFoRj3xyDHuNEqb3KypR7oYHEepXMA9mcG6Rt1fMGmz2Cj',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://moniktop-production.up.railway.app/webhook/twitter'
      })
    });

    const data = await twitterResponse.json();
    res.status(twitterResponse.status).json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: 'Failed to forward request' });
  }
});

// Простой эндпоинт для проверки
app.get('/', (req, res) => {
  res.send('🚀 Twitter Monitor is running!');
});

app.listen(port, () => {
  console.log(`✅ Сервер запущен на порту ${port}`);
});

