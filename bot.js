const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
//replace the value below with your token
const token = 'YOUR TOKEN';
const bot = new TelegramBot(token, { polling: true });

let chatId;

bot.on('message', (msg) => {
  chatId = msg.chat.id;
  if(msg.location !== undefined){
    let lat = msg.location.latitude;
    let lon = msg.location.longitude;
    getWeather(lat, lon);
  }
  else if (msg.text.includes('/weather')) {
    const opts = {
      reply_markup: JSON.stringify({
        keyboard: [
          [{text: 'Send Location', request_location: true}],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      }),
    };
    bot.sendMessage(msg.chat.id, 'Send Your Location', opts);
  }
  else{
    bot.sendMessage(chatId, 'Received your message');
  }
});

function getWeather(lat, lon) {
  let message;
  let data;
  let url = getCurrentWeatherURL(lat, lon);
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data = JSON.parse(body);
      message = 'position: ' + data.sys.country + ' ' + data.name + '\n';
      message += 'datatime: ' + getFormatDate((data.dt + data.timezone) * 1000) + '\n';
      let tmp = data.main.temp - 273.15;
      message += 'temperature: ' + tmp.toFixed(2) + 'Cel ' + data.weather[0].description;
      url = getForecastWeatherURL(lat, lon);
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          data = JSON.parse(body);
          let time = getFormatDate((data.list[0].dt + data.city.timezone) * 1000).substring(0, 10);
          message += '\n\n*******' + time + '*******';
          for (let arr of data.list) {
            if (getFormatDate((arr.dt + data.city.timezone) * 1000).substring(0, 10) !== time) {
              time = getFormatDate((arr.dt + data.city.timezone) * 1000).substring(0, 10);
              message += '\n\n*******' + time+ '*******';
            }
            message += '\n' + getFormatDate((arr.dt + data.city.timezone) * 1000).substring(11, 16);
            let tmp = arr.main.temp - 273.15;
            message += ' ' + tmp.toFixed(2)  + 'Cel ' + arr.weather[0].description;

          }
          bot.sendMessage(chatId, message);
        }
      });

    }
  });
}
//replace the value below with your key
function getCurrentWeatherURL(lat, lon) {
  return 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=YOUR_API_KEY';
}
//replace the value below with your key
function getForecastWeatherURL(lat, lon) {
  return 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=YOUR_API_KEY';
}

function getFormatDate(time) {
  if (typeof (time) === undefined) {
    return "";
  }
  let oDate = new Date(time),
    oYear = oDate.getFullYear(),
    oMonth = oDate.getMonth() + 1,
    oDay = oDate.getDate(),
    oHour = oDate.getHours(),
    oMin = oDate.getMinutes(),
    oTime = oYear + '-' + getzf(oMonth) + '-' + getzf(oDay) + ' ' + getzf(oHour) + ':' + getzf(oMin);

  return oTime;
};

function getzf(num) {
  if (parseInt(num) < 10) {
    num = '0' + num;
  }
  return num;
}