const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { token } = require('./config.json');
var webscrape = require('webscrape');
var scraper = webscrape.default();
let online = "0/1000";
let myServerName = 'WestPort';
let minutesForUpdate = 1;
var timer = null;

client.on('ready', () => {
  console.log("Бот запущен и приступил к обновлению онлайна.")
  client.user.setUsername(myServerName);
  timer = setInterval(() => {
    scrapOnline();
  }, 60000 * minutesForUpdate);
});

async function scrapOnline() {
  try {
    const result = await scraper.get('https://cdn.rage.mp/master/');
    if (result) {
      const servers = JSON.parse(result.body);
      let server = Object.values(servers).find((el) => el.name.includes(myServerName) === true);
      if (server !== undefined) {
        online = server.players + "/" + server.maxplayers;
        UpdateChannelName(online);
      } else {
        console.log("[RAGE:MP] Сервер не найден в мастер листе ")
      }
    }
  } catch (error) {
    console.log(error)
  }
}

function UpdateChannelName(tempOnline = "0/1000") {
  let cache = client.channels.cache;
  let channelElement = cache.find((el) => new String(el.name).toLowerCase().includes("онлайн:") === true);
  if (channelElement === undefined) {
    return console.log("Категория не найдена. Проверьте название категории");
  }
  const channel = client.channels.cache.get(channelElement.id);
  if (!channel) return console.error("Канал или Категория не найдены");
  channel.setName("Онлайн: " + tempOnline)
  let date = new Date();
  console.log(date.getHours() + ":" + date.getMinutes() + " | " + "Текущий онлайн: " + tempOnline);
  client.user.setPresence({
    activities: [{ name: myServerName + " | RageMP" + " - " + tempOnline }],
    status: 'online',
  })
}

client.login(token);