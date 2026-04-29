const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cnprY3podHd2YXlsZ2F2amFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTk3OTAsImV4cCI6MjA4OTU5NTc5MH0.ugGHOT198Zn1Tcucir_Ig_a4Q9OQ5Wy-mK5pLozZIeM';
const url = 'https://wyrzkczhtwvaylgavjaq.supabase.co/rest/v1/eventos?limit=1';

fetch(url, {
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('COLUMNAS DE EVENTO:', Object.keys(data[0] || {}));
  console.log('DATOS:', data[0]);
})
.catch(err => console.error(err));
