const express = require('express');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.get('/', (req, res) => {
  res.send('🚀 Twitter Monitor is running!');
});

app.listen(port, () => {
  console.log(`✅ Сервер запущен на порту ${port}`);
});
