
// -4658057891

async function sendMail(name, phone, message) {
    let http = require('request')
    let msg = `Имя: ${name}\nТелефон: ${phone}\nСообщение: ${message}`
    msg = encodeURI(msg)

    http.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHATID}&parse_mode=html&text=${msg}`, function (error, response, body) {  
        console.log('error:', error); 
        console.log('statusCode:', response && response.statusCode); 
        console.log('body:', body); 
        if(response.statusCode===200){
          res.status(200).json({status: 'ok', message: 'Успешно отправлено!'});
        }
        if(response.statusCode!==200){
          res.status(400).json({status: 'error', message: 'Произошла ошибка!'});
        }
      });

}

module.exports = { sendMail };
