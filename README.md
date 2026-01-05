# Organizador de Arquivos EPUB - pCloud

Script de automação para organizar arquivos EPUB no pCloud.

## Funcionalidades

1. **Sanitização**: Remove underscore (`_`) do início dos nomes de arquivos
2. **Deduplicação**: Move arquivos com mesmo nome e tamanho para pasta "Duplicados"
3. **Categorização**: Classifica arquivos por palavras-chave em 21 categorias
4. **Movimentação**: Move arquivos para pastas de categoria
5. **Relatório**: Exibe resumo da distribuição por categoria

## Instalação

```bash
npm install
```

## Configuração

Edite o arquivo `organize-epub.js` e substitua o token:

```javascript
const ACCESS_TOKEN = 'SEU_TOKEN_PCLOUD_AQUI';
```

## Uso

```bash
npm start
# ou
node organize-epub.js
```

## Configurações

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ACCESS_TOKEN` | Token OAuth do pCloud | - |
| `SOURCE_FOLDER_ID` | ID da pasta fonte | 27008662289 |
| `BATCH_SIZE` | Limite de arquivos por execução | 200 |
| `WRITE_DELAY` | Delay entre operações (ms) | 300 |

## Categorias

- Artes, Cinema e Fotografia
- Autoajuda
- Bebês e Crianças
- Biografias e Histórias Reais
- Ciências e Engenharia
- Computação, Informática e Mídias Digitais
- Culinária e Gastronomia
- Direito
- Educação, Referência e Didáticos
- Esportes, Lazer e Viagens
- Fantasia, Horror e Ficção Científica
- HQs, Mangás e Graphic Novels
- Inglês e Outras Línguas
- Jovem Adulto
- Literatura e Ficção
- Negócios e Economia
- Religião e Espiritualidade
- Saúde, Emagrecimento e Bem-Estar
- Sexualidade e Relacionamentos
- Sociologia e Ciências Sociais
- Suspense, Policial e Thriller
- Outros (fallback)
- Duplicados (arquivos duplicados)
