const Nightmare = require('nightmare');
const vo = require('vo');

const FONTES = [
  {
    fonte: 'prefeitura', url: 'https://gravatai.atende.net/?pg=transparencia#!/grupo/3/item/9/tipo/1'
  },{
    fonte: 'camara',     url: 'https://www.cmgravatai.rs.gov.br/?pg=transparencia#!/grupo/3/item/9/tipo/1'
  }
];

const { argv } = process;
if (argv.length < 4) {
  console.error("\x1b[31m", "Passe os parametros corretamente: EX: node app.js prefeitura 2016");
  return;
}

const FONTE = argv[2];
const ANO = argv[3];

const URL = FONTES.reduce((acc, f) => (FONTE === f.fonte ? f.url : acc), '');

if (!URL) {
  console.error("\x1b[31m", "Informe");
  console.log(FONTES.map(f => f.fonte).join(' ou '));
  return;
}

if (ANO < 2010 || ANO > 2017) {
  console.error("\x1b[31m", "Informe de 2010 à 2017");
  return;
}

const save = require('./save')(ANO, FONTE);

vo(run)((err, result) => {
  console.log(result);
  if (err) throw err;
});

function* run() {
  const nightmare = Nightmare({
    show: true
  });

  // Seleciona o ANO, de pois verifica a quandidade de páginas e linhas do ano selecionado
  const total = yield nightmare
    .goto(URL)
    .select('select[name="loaano"]', ANO)
    .wait('.div_botao_acao.div_botao_acao_group.div_botao_acao_button')
    .click('.div_botao_acao.div_botao_acao_group.div_botao_acao_button')
    .wait('.linha_dados.linha_normal')
    .evaluate(() => {
      const linesLimit = $('.dados_consulta.dados tbody tr.linha_dados').length;
      const totalPages = +$('.paginadora tr').first().find('td').eq(2).text().split(' ')[1];
      return {
        linesLimit,
        totalPages
      }
    });

  const { totalPages, linesLimit } = total;
  console.log('Temos', totalPages, ' páginas, com no máximo ', linesLimit, 'linhas');
  // Ajustamos o elemento da paginação pra podermos clicar na próxima página
  // Faço isso removendo todos elementos deixando apenas o botão para o Próximo
  yield nightmare
    .inject('js', __dirname + '/inject/adjustNextPage.js')
    .evaluate(() => {});

  // Agora vamos percorrer cada pagina e linha
  let indexPage = 0;
  while(indexPage++ < totalPages) {
    console.log('\x1b[32m', `=== Pagina ${indexPage}`);

    let totalLines = yield nightmare
      .evaluate(() => {
        const tam = $('.dados_consulta.dados tbody tr.linha_dados').length;
        return tam < 15 ? tam : 15;
      });

    let lineIndex = 0;
    let array = [];
    while (lineIndex++ < totalLines) {
      console.log('\x1b[36m', '    Linha ', lineIndex);
      let jsFile = `${__dirname}/inject/${lineIndex === 1 ? 'empty' : 'removeLine'}.js`;
      array.push(
        yield nightmare
          .inject('js', jsFile)
          .click('.acao_consulta_inline input')
          .wait('.campo_label_dois_pontos.campo_label.campo_label_leitura')
          .evaluate(() => {
            const tr = $('.div_conteudo_dados_consulta').find('tr').first();
            const x = [];
            $(tr).find('td')
              .each((k, td) => {
                x.push($(td).text());
              });
            x.push($('[name="historico"]').text());
            return x;
          })
      );
    }
    save(indexPage, array);
    yield nightmare
      .click('.paginadora tr td span')
      .wait(5000);
  }
  yield nightmare.end();
}