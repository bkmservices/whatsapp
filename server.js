const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const clients = {}; // Stocker les clients WhatsApp

// Endpoint pour générer le QR Code
app.post('/start', async (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
        return res.status(400).json({ error: "Numéro requis" });
    }

    if (clients[phone]) {
        return res.json({ message: "Déjà connecté !" });
    }

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: phone })
    });

    clients[phone] = client;

    client.on('qr', async (qr) => {
        const qrImage = await qrcode.toDataURL(qr);
        res.json({ qr: qrImage });
    });

    client.on('ready', () => {
        console.log(`${phone} est connecté à WhatsApp`);
    });

    client.initialize();
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur WhatsApp API sur http://localhost:${port}`);
});
