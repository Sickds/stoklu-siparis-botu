const fs = require('fs');
const path = require('path');

function eventYukle(client) {
    const eventlerKlasoru = path.join(__dirname, '..', 'eventler');
    
    if (!fs.existsSync(eventlerKlasoru)) {
        console.log('Eventler klasörü bulunamadı!');
        return;
    }

    const eventDosyalari = fs.readdirSync(eventlerKlasoru).filter(file => file.endsWith('.js'));
    
    for (const dosya of eventDosyalari) {
        const event = require(path.join(eventlerKlasoru, dosya));
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        
        console.log(`✅ ${event.name} eventi yüklendi!`);
    }
}

module.exports = eventYukle;
