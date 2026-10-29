const https = require('https');
const FOLDER_ID = '1HGCJBeNcDf7X8YnsVZPoFsnlOfz-PnUl';
const url = 'https://drive.google.com/embeddedfolderview?id=' + FOLDER_ID + '#list';

https.get(url, {headers: {'User-Agent': 'Mozilla/5.0 Chrome/120'}}, function(res) {
  let d = '';
  res.on('data', function(c) { d += c; });
  res.on('end', function() {
    const matches = d.match(/"(1[a-zA-Z0-9_\-]{32,44})"/g) || [];
    const ids = [];
    const seen = {};
    matches.forEach(function(m) {
      const id = m.replace(/"/g, '');
      if (id.length >= 33 && !seen[id]) {
        seen[id] = true;
        ids.push(id);
      }
    });
    console.log('Found ' + ids.length + ' IDs');
    ids.forEach(function(id) {
      console.log('https://drive.google.com/uc?export=view&id=' + id);
    });
  });
}).on('error', function(e) { console.log('Error: ' + e.message); });
