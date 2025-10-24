/**
 * Zaizah Fragrance v2 - Node.js server with M-Pesa Daraja (SANDBOX) integration
 */
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

const DAR_AU = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const DAR_STK = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

function base64(str){ return Buffer.from(str).toString('base64'); }

async function getToken(){
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if(!key || !secret) throw new Error('Missing MPESA_CONSUMER_KEY/SECRET in env');
  const creds = base64(key+':'+secret);
  const res = await fetch(DAR_AU, { method:'GET', headers: { Authorization: 'Basic ' + creds } });
  const json = await res.json();
  return json.access_token;
}

function getTimestamp(){
  const d = new Date();
  const pad = (n)=> (n<10? '0'+n: n);
  const y = d.getFullYear(), m=pad(d.getMonth()+1), day=pad(d.getDate()), hr=pad(d.getHours()), min=pad(d.getMinutes()), sec=pad(d.getSeconds());
  return ''+y+m+day+hr+min+sec;
}

app.post('/api/mpesa/stkpush', async (req,res)=>{
  try{
    const { phone, amount } = req.body;
    if(!phone) return res.status(400).json({ error: 'phone required' });
    const token = await getToken();
    const timestamp = getTimestamp();
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10a7b5d';
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');
    const body = {
      "BusinessShortCode": shortcode,
      "Password": password,
      "Timestamp": timestamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": amount || 1,
      "PartyA": phone,
      "PartyB": shortcode,
      "PhoneNumber": phone,
      "CallBackURL": process.env.MPESA_CALLBACK_URL || "https://example.com/mpesa/callback",
      "AccountReference": "ZaizahOrder",
      "TransactionDesc": "Pagamento Zaizah Fragrance"
    };
    const resp = await fetch(DAR_STK, {
      method:'POST',
      headers:{ 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    return res.json({ daraja: data });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Zaizah server running on', PORT));
