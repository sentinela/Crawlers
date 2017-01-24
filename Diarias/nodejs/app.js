const Nightmare = require('nightmare');
const vo = require('vo');
const URL = 'https://gravatai.atende.net/?pg=transparencia#!/grupo/3/item/9/tipo/1';
const YEAR = 2016;
const save = require('./save')(YEAR);

vo(run)(function(err, result) {
  if (err) throw err;
});

function* run() {
  const nightmare = Nightmare();
  const total = yield nightmare
    .goto(URL)
    .select('select[name="loaano"]', YEAR)
    .wait('.div_botao_acao.div_botao_acao_group.div_botao_acao_button')
    .click('.div_botao_acao.div_botao_acao_group.div_botao_acao_button')
    .wait('.linha_dados.linha_normal')
    .evaluate(() => {
      const t = $('.dados_consulta.dados tbody tr.linha_dados').length;
      return {
        pages: +$('.paginadora tr').first().find('td').eq(2).text().split(' ')[1],
        lines: t > 15 ? 15 : t
      };
    });

  const totalPages = total.pages;
  var totalLines = total.lines;

  yield nightmare
    .inject('js', __dirname + '/inject/evil.js')
    .evaluate(() => {});

  var array = [];
  var i = 0;
  while(i++ < totalLines) {
    var jsFile = `${__dirname}/inject/${i === 1 ? 'empty' : 'evil1'}.js`;
    array.push(
      yield nightmare
        .inject('js', jsFile)
        .click('.acao_consulta_inline input')
        .wait('.campo_label_dois_pontos.campo_label.campo_label_leitura')
        .evaluate(() => {
          var tr = $('.div_conteudo_dados_consulta').find('tr').first();
          var z = [];
          $(tr).find('td').each((k, td) => {
            z.push($(td).text());
          });
          z.push($('[name="historico"]').text());
          return z;
        }));
    console.log('page 1: line', i, 'done');
  }

  save(1, array);

  var indexPages = 1;
  while(indexPages++ < totalPages) {
    var totalLines = yield nightmare
      .inject('js', __dirname + '/inject/evil2.js')
      .click('.paginadora tr td span')
      .wait(5000)
      .evaluate(() => {
        const t = $('.dados_consulta.dados tbody tr.linha_dados').length;
        return t > 15 ? 15 : t;
      });
    var i = 0;
    var array = [];
    while(i++ < totalLines) {
      var jsFile = `${__dirname}/inject/${i === 1 ? 'empty' : 'evil1'}.js`;
      array.push(
        yield nightmare
          .inject('js', jsFile)
          .click('.acao_consulta_inline input')
          .wait(1000)
          .wait('.campo_label_dois_pontos.campo_label.campo_label_leitura')
          .evaluate(() => {
            var tr = $('.div_conteudo_dados_consulta').find('tr').first();
            var z = [];
            $(tr).find('td').each((k, td) => {
              z.push($(td).text());
            });
            z.push($('[name="historico"]').text());
            return z;
          }));
      console.log('page', indexPages ,': line', i, 'of', totalLines);
    }
    save(indexPages, array);
  }

  yield nightmare.end();
}