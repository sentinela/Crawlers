# Crawler em NodeJs para Diárias

## O que o Crawler faz ?

Hoje temos duas fontes de dados de `Diárias`:

- [https://gravatai.atende.net/?pg=transparencia#!/grupo/3/item/9/tipo/1](https://gravatai.atende.net/?pg=transparencia#!/grupo/3/item/9/tipo/1)
- [https://www.cmgravatai.rs.gov.br/?pg=transparencia#!/grupo/3/item/9/tipo/1](https://www.cmgravatai.rs.gov.br/?pg=transparencia#!/grupo/3/item/9/tipo/1)

O que o crawler faz, é pegar os dados de ambas URL's e salvar localmente num diretório.

## Como Executar ?

### 1 - Clone o repositório

```bash
$ git clone https://github.com/sentinela/Crawlers
```

### 2 - Vá até o diretório node

```bash
$ cd Crawlers/nodejs
```

### 3 - Instale as dependências

```bash
$ npm install
```

### 4 - Para executar, você precisa passar 2 parametros que são a ``fonte`` e o ``ano`` desejado.

Quando executar o comando, os arquivos serão salvos em formato ``json`` dentro da pasta ``data`` conforme ``fonte`` e ``ano`` escolhidos.

As fontes são: ``camara`` ou ``prefeitura``

Os anos são de  ``2010`` à ``2017``

```bash
$ node app.js prefeitura 2016
```


## Como enviar para API Sentinela ?

Logo coloco a documentação de como transformar esses dados, salvar localmente no mongoDb, para enviar para a API Sentinela.



