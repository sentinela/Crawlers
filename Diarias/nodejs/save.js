const fs = require('fs');

module.exports = function (ano, fonte) {
  const baseDir = `${__dirname}/data`;
  const anoDir = `${baseDir}/${ano}`;
  const dir = `${anoDir}/${fonte}`;
  [baseDir, anoDir, dir].forEach(d => {
    if (!fs.existsSync(d)){
      fs.mkdirSync(d);
    }
  });
  return (index, data) => {
    const fileName = `page-${index}.json`;
    const path = `${dir}/${fileName}`;
    fs.exists(path, exists => {
      if (exists) {
        fs.unlinkSync(path);
      }
      data
        .map(arr => {
          let obj = {
            entidade: arr[0],
            credor: arr[1],
            cargo: arr[2],
            empenho: arr[3],
            emissao: arr[4].split('/').reverse().join('-'),
            valor: parseFloat(arr[5].replace('.','').replace(',', '.'),10),
            historico: arr[8],
            ano: parseInt(arr[3].split('/')[1], 10)
          };
          fs.appendFile(path, JSON.stringify(obj) + ",\n" , function (err) {
            if (err) console.log(err);
          });
      });
      console.log(fileName, 'saved');
    });
  };
};
