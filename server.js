/**
 * Servidor de Automação - Organizador de Arquivos EPUB pCloud
 * 
 * Este servidor:
 * 1. Faz login direto via API pCloud (email/senha)
 * 2. Obtém auth token com permissões completas
 * 3. Executa a organização dos arquivos
 */

const express = require('express');
const axios = require('axios');

// ============================================================
// CONFIGURAÇÃO
// ============================================================
const BASE_URL = 'https://api.pcloud.com';
const SOURCE_FOLDER_ID = 27008662289;
const BATCH_SIZE = 200;
const WRITE_DELAY = 300;

// Armazena o token em memória
let authToken = null;
let userEmail = null;
let isProcessing = false;
let lastResults = null;

// ============================================================
// MAPEAMENTO DE CATEGORIAS
// ============================================================
const CATEGORY_MAPPING = {
  // === FANTASIA ===
  "Fantasia": [
    // Autores
    "sarah j. maas", "holly black", "leigh bardugo", "brandon sanderson",
    "cassandra clare", "laini taylor", "victoria aveyard", "patrick rothfuss",
    "robin hobb", "joe abercrombie", "george r.r. martin", "r.r. martin",
    "trudi canavan", "andrzej sapkowski", "robert jordan", "terry goodkind",
    "terry pratchett", "neil gaiman", "ursula k. le guin", "j.r.r. tolkien",
    "c.s. lewis", "diana wynne jones", "juliet marillier", "maria v. snyder",
    "jennifer l. armentrout", "rebecca yarros", "maggie stiefvater", "v.e. schwab",
    "naomi novik", "samantha shannon", "tomi adeyemi", "sabaa tahir",
    "brigid kemmerer", "kerri maniscalco", "renee ahdieh", "leigh bardugo",
    "marissa meyer", "kristin cashore", "rae carson", "maria lu",
    "shelby mahurin", "olivie blake", "elizabeth lim", "alexandra bracken",
    // Séries
    "corte de espinhos", "trono de vidro", "crescent city", "casa de terra",
    "povo do ar", "sombra e osso", "six of crows", "nascidos da bruma",
    "stormlight", "roda do tempo", "cronicas de gelo e fogo", "game of thrones",
    "instrumentos mortais", "cacadores de sombras", "dark artifices",
    "grisha", "rei corvo", "quarta asa", "chama de ferro", "empyrean",
    // Palavras-chave
    "dragao", "magia", "feiticeira", "bruxo", "elfo", "reino", "trono",
    "coroa", "principe", "princesa", "rei", "rainha", "cavaleiro", "espada"
  ],

  // === ROMANCE ===
  "Romance": [
    // Autores contemporâneos
    "colleen hoover", "anna todd", "nicholas sparks", "sally thorne",
    "christina lauren", "ali hazelwood", "emily henry", "tessa bailey",
    "helena hunting", "penelope douglas", "elle kennedy", "lj shen",
    "monica murphy", "brittainy c. cherry", "mia sheridan", "tillie cole",
    "kristen callihan", "meghan quinn", "melanie harlow", "kate canterbary",
    "claire kingsley", "penny reid", "mariana zapata", "kristen ashley",
    "devney perry", "elsie silver", "sara cate", "jessa kane", "alexa riley",
    // Autores históricos
    "julia quinn", "lisa kleypas", "eloisa james", "sarah maclean",
    "tessa dare", "lorraine heath", "mary balogh", "courtney milan",
    "joanna shupe", "lenora bell", "eva leigh", "grace burrowes",
    "elizabeth hoyt", "madeline hunter", "sabrina jeffries", "sophie jordan",
    "jennifer ashley", "anna campbell", "stephanie laurens", "meredith duran",
    // Séries
    "bridgertons", "ravenels", "wallflowers", "hathaways", "spindle cove",
    "duque e eu", "visconde", "condessa", "marquês", "lorde", "lady",
    // Palavras-chave
    "romance", "amor", "paixao", "seducao", "casamento", "noiva", "duque"
  ],

  // === SUSPENSE E THRILLER ===
  "Suspense e Thriller": [
    // Autores
    "gillian flynn", "paula hawkins", "ruth ware", "a.j. finn",
    "b.a. paris", "shari lapena", "karin slaughter", "lisa gardner",
    "tess gerritsen", "michael connelly", "lee child", "harlan coben",
    "james patterson", "dan brown", "john grisham", "jo nesbo",
    "stieg larsson", "camilla lackberg", "lars kepler", "jeffery deaver",
    "sebastian fitzek", "pierre lemaitre", "robert harris", "tom clancy",
    // Palavras-chave
    "thriller", "suspense", "assassino", "crime", "detetive", "investigacao",
    "policial", "fbi", "serial killer", "misterio", "enigma", "morte"
  ],

  // === HORROR ===
  "Horror": [
    // Autores
    "stephen king", "richard bachman", "clive barker", "dean koontz",
    "peter straub", "shirley jackson", "h.p. lovecraft", "edgar allan poe",
    "joe hill", "paul tremblay", "grady hendrix", "josh malerman",
    "riley sager", "rachel harrison", "silvia moreno-garcia", "t. kingfisher",
    // Palavras-chave
    "horror", "terror", "assombracao", "fantasma", "monstro", "vampiro",
    "demonio", "maldito", "pesadelo", "sobrenatural", "arrepiante"
  ],

  // === FICÇÃO CIENTÍFICA ===
  "Ficção Científica": [
    // Autores
    "frank herbert", "isaac asimov", "arthur c. clarke", "philip k. dick",
    "ray bradbury", "ursula k. le guin", "william gibson", "dan simmons",
    "orson scott card", "ann leckie", "n.k. jemisin", "liu cixin",
    "andy weir", "blake crouch", "margaret atwood", "cixin liu",
    "aldous huxley", "george orwell", "h.g. wells", "jules verne",
    // Séries
    "duna", "fundacao", "2001", "expanse", "three body problem",
    // Palavras-chave
    "ficcao cientifica", "sci-fi", "espacial", "futuro", "distopia",
    "inteligencia artificial", "robos", "alienigena", "galaxia"
  ],

  // === JOVEM ADULTO (YA) ===
  "Jovem Adulto": [
    // Autores
    "suzanne collins", "veronica roth", "marie lu", "rainbow rowell",
    "john green", "jenny han", "becky albertalli", "adam silvera",
    "angie thomas", "nicola yoon", "stephanie perkins", "morgan matson",
    "kasie west", "jennifer niven", "gayle forman", "colleen houck",
    "tahereh mafi", "ally condie", "lauren oliver", "kiera cass",
    "kami garcia", "margie stohl", "sara shepard", "richelle mead",
    "rachel caine", "rachel hawkins", "melissa de la cruz",
    // Séries
    "jogos vorazes", "divergente", "selecao", "maze runner", "estilhaca-me",
    "pretty little liars", "voltando a virgin river", "terra de historias",
    "crepusculo", "twilight", "fallen", "hush hush",
    // Palavras-chave
    "young adult", "teen", "adolescente", "escola", "prova", "revolucao"
  ],

  // === AUTOAJUDA E DESENVOLVIMENTO PESSOAL ===
  "Autoajuda": [
    // Autores
    "jordan peterson", "brene brown", "simon sinek", "james clear",
    "cal newport", "ryan holiday", "mark manson", "dale carnegie",
    "napoleon hill", "stephen covey", "tony robbins", "robin sharma",
    "paulo vieira", "augusto cury", "flavio augusto", "lair ribeiro",
    "gustavo cerbasi", "daniel goleman", "carol dweck", "gretchen rubin",
    "marie kondo", "jay shetty", "mel robbins", "brendon burchard",
    // Palavras-chave
    "autoajuda", "habitos", "produtividade", "sucesso", "mindset",
    "motivacao", "superacao", "lideranca", "inteligencia emocional",
    "felicidade", "proposito", "mentalidade", "realizacao"
  ],

  // === LITERATURA CLÁSSICA ===
  "Literatura Clássica": [
    // Autores
    "machado de assis", "jose saramago", "jorge amado", "eca de queiros",
    "fernando pessoa", "clarice lispector", "jane austen", "charles dickens",
    "leo tolstoy", "fyodor dostoevsky", "fiodor dostoievski", "dostoievski",
    "franz kafka", "virginia woolf", "ernest hemingway", "f. scott fitzgerald",
    "oscar wilde", "mark twain", "victor hugo", "honore de balzac",
    "gustave flaubert", "stendhal", "emily bronte", "charlotte bronte",
    "thomas hardy", "george eliot", "henry james", "herman melville",
    "nathaniel hawthorne", "edgar allan poe",
    // Palavras-chave
    "classico", "seculo xix", "seculo xviii", "literatura"
  ],

  // === NEGÓCIOS E ECONOMIA ===
  "Negócios e Economia": [
    // Autores
    "peter drucker", "robert kiyosaki", "warren buffett", "ray dalio",
    "nassim taleb", "benjamin graham", "phil knight", "reed hastings",
    "eric ries", "peter thiel", "tim ferriss", "gary vaynerchuk",
    "seth godin", "malcolm gladwell", "daniel kahneman", "richard thaler",
    "walter isaacson", "ben horowitz", "niall ferguson", "michael porter",
    // Palavras-chave
    "negocios", "economia", "empreendedorismo", "startups", "investimento",
    "financas", "marketing", "gestao", "lideranca empresarial", "vendas",
    "estrategia", "inovacao", "dinheiro", "riqueza", "bolsa"
  ],

  // === RELIGIÃO E ESPIRITUALIDADE ===
  "Religião e Espiritualidade": [
    // Autores
    "c.s. lewis", "timothy keller", "max lucado", "joyce meyer",
    "john piper", "augusto cury", "padre marcelo rossi", "papa francisco",
    "dalai lama", "thich nhat hanh", "eckhart tolle", "deepak chopra",
    "paulo coelho", "allan kardec", "chico xavier", "zibia gasparetto",
    "monja coen", "osho", "richard rohr", "thomas merton",
    // Palavras-chave
    "biblia", "deus", "jesus", "espirito", "fe", "oracao", "igreja",
    "evangelico", "catolico", "espirita", "budismo", "meditacao",
    "espiritualidade", "alma", "karma", "zen", "patristica"
  ],

  // === HISTÓRIA ===
  "História": [
    // Autores
    "yuval noah harari", "laurentino gomes", "eduardo bueno", "mary del priore",
    "boris fausto", "lilia schwarcz", "antony beevor", "ian kershaw",
    "max hastings", "dan jones", "tom holland", "simon sebag montefiore",
    "niall ferguson", "jared diamond", "eric hobsbawm", "fernand braudel",
    // Palavras-chave
    "historia", "guerra mundial", "segunda guerra", "primeira guerra",
    "imperio", "revolucao", "civilizacao", "antiguidade", "medieval",
    "brasil colonia", "1808", "1822", "1889", "1964"
  ],

  // === FILOSOFIA ===
  "Filosofia": [
    // Autores
    "seneca", "marco aurelio", "epicteto", "platao", "aristoteles",
    "nietzsche", "schopenhauer", "kant", "hegel", "descartes",
    "sartre", "camus", "foucault", "deleuze", "slavoj zizek",
    "byung-chul han", "mario sergio cortella", "leandro karnal",
    "clóvis de barros filho", "luiz felipe ponde",
    // Palavras-chave
    "filosofia", "estoicismo", "existencialismo", "metafisica",
    "etica", "moral", "pensamento", "razao", "reflexao"
  ],

  // === PSICOLOGIA ===
  "Psicologia": [
    // Autores
    "sigmund freud", "carl jung", "viktor frankl", "irvin yalom",
    "carl rogers", "b.f. skinner", "albert bandura", "daniel goleman",
    "martin seligman", "carol dweck", "mihaly csikszentmihalyi",
    // Palavras-chave
    "psicologia", "psicanalise", "terapia", "mente", "comportamento",
    "ansiedade", "depressao", "trauma", "inconsciente", "cognitivo"
  ],

  // === POLICIAL ===
  "Policial e Mistério": [
    // Autores
    "agatha christie", "arthur conan doyle", "sherlock holmes", "hercule poirot",
    "miss marple", "andrea camilleri", "robert galbraith", "richard osman",
    "louise penny", "peter robinson", "ian rankin", "michael connelly",
    // Séries
    "cormoran strike", "mortal", "j.d. robb", "nora roberts",
    // Palavras-chave
    "detetive", "investigacao", "crime", "assassinato", "mistério",
    "policia", "evidencia", "caso", "pista"
  ],

  // === ROMANCE ERÓTICO ===
  "Romance Erótico": [
    // Autores
    "e.l. james", "sylvia day", "meredith wild", "anna zaires",
    "pepper winters", "kitty thomas", "sierra simone", "alexa riley",
    // Séries e palavras-chave
    "cinquenta tons", "fifty shades", "dark romance", "erotico",
    "bdsm", "submissa", "dominador", "proibido", "pecado"
  ],

  // === HQs, MANGÁS E GRAPHIC NOVELS ===
  "HQs e Mangás": [
    "hq", "manga", "graphic novel", "quadrinho", "comic", "marvel",
    "dc comics", "batman", "spider-man", "x-men", "avengers",
    "naruto", "one piece", "attack on titan", "death note",
    "turma da monica", "mauricio de sousa"
  ],

  // === INFANTIL ===
  "Infantil": [
    // Autores
    "roald dahl", "dr. seuss", "julia donaldson", "ruth stiles gannett",
    "monteiro lobato", "sitio do picapau", "ana maria machado",
    "ruth rocha", "ziraldo", "mary pope osborne",
    // Palavras-chave
    "infantil", "crianca", "fabula", "conto de fadas", "disney",
    "principe", "principezinho", "pequeno principe"
  ],

  // === SAÚDE E BEM-ESTAR ===
  "Saúde e Bem-Estar": [
    // Palavras-chave
    "saude", "medicina", "dieta", "nutricao", "emagrecimento",
    "exercicio", "fitness", "yoga", "corpo", "alimentacao",
    "jejum", "low carb", "receitas saudaveis"
  ],

  // === DIREITO ===
  "Direito": [
    "direito", "juridico", "lei", "codigo civil", "codigo penal",
    "constituicao", "tribunal", "advocacia", "processo", "jurisprudencia"
  ],

  // === CULINÁRIA ===
  "Culinária": [
    "receita", "culinaria", "gastronomia", "cozinha", "chef",
    "bolo", "sobremesa", "doce", "salgado", "panelinha"
  ],

  // === CIÊNCIAS ===
  "Ciências": [
    "fisica", "quimica", "biologia", "matematica", "astronomia",
    "neurociencia", "evolucao", "darwin", "einstein", "hawking",
    "universo", "cosmos", "cerebro", "dna", "genes"
  ],

  "Outros": []
};

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function categorizeFile(filename) {
  const normalized = normalizeString(filename);

  let bestCategory = 'Outros';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
    if (category === 'Outros') continue;

    let matches = 0;
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeString(keyword);
      if (normalized.includes(normalizedKeyword)) {
        matches++;
      }
    }

    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    } else if (matches === maxMatches && matches > 0) {
      if (category < bestCategory) {
        bestCategory = category;
      }
    }
  }

  return bestCategory;
}

// ============================================================
// FUNÇÕES DA API pCloud
// ============================================================

async function loginPCloud(email, password) {
  // Primeiro, tenta login na API dos EUA
  let response = await axios.get(`${BASE_URL}/userinfo`, {
    params: {
      getauth: 1,
      logout: 1,
      username: email,
      password: password
    }
  });

  // Se erro 2000, tenta API da Europa
  if (response.data.result === 2000) {
    response = await axios.get('https://eapi.pcloud.com/userinfo', {
      params: {
        getauth: 1,
        logout: 1,
        username: email,
        password: password
      }
    });
  }

  if (response.data.result !== 0) {
    throw new Error(response.data.error || `Erro de login: ${response.data.result}`);
  }

  return response.data.auth;
}

async function listFolder(folderId) {
  const response = await axios.get(`${BASE_URL}/listfolder`, {
    params: {
      folderid: folderId,
      auth: authToken
    }
  });

  if (response.data.result !== 0) {
    throw new Error(`Erro API: ${response.data.error || response.data.result}`);
  }

  return response.data.metadata;
}

async function createFolderIfNotExists(parentFolderId, folderName) {
  const response = await axios.get(`${BASE_URL}/createfolderifnotexists`, {
    params: {
      folderid: parentFolderId,
      name: folderName,
      auth: authToken
    }
  });

  if (response.data.result !== 0) {
    throw new Error(`Erro ao criar pasta: ${response.data.error || response.data.result}`);
  }

  return response.data.metadata;
}

async function renameFile(fileId, options = {}) {
  const params = {
    fileid: fileId,
    auth: authToken
  };

  if (options.tofolderid) {
    params.tofolderid = options.tofolderid;
  }
  if (options.toname) {
    params.toname = options.toname;
  }

  const response = await axios.get(`${BASE_URL}/renamefile`, {
    params
  });

  if (response.data.result !== 0) {
    throw new Error(`Erro ao renomear/mover arquivo: ${response.data.error || response.data.result}`);
  }

  return response.data.metadata;
}

// ============================================================
// FUNÇÃO PRINCIPAL DE ORGANIZAÇÃO
// ============================================================

async function organizeEpubFiles() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ORGANIZADOR DE ARQUIVOS EPUB - pCloud');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\nIniciando em: ${new Date().toISOString()}`);

  const results = {
    totalProcessed: 0,
    totalMoved: 0,
    totalErrors: 0,
    totalRenamed: 0,
    totalDuplicates: 0,
    categoryCount: {},
    errors: [],
    logs: []
  };

  const folderCache = new Map();
  const seenFiles = new Map();

  try {
    // 1. Listar arquivos
    results.logs.push('📂 Listando arquivos da pasta fonte...');
    const folderData = await listFolder(SOURCE_FOLDER_ID);
    const allContents = folderData.contents || [];

    results.logs.push(`Total de itens na pasta: ${allContents.length}`);

    // 2. Filtrar apenas .epub
    const epubFiles = allContents.filter(item =>
      !item.isfolder && item.name.toLowerCase().endsWith('.epub')
    );

    results.logs.push(`Arquivos EPUB encontrados: ${epubFiles.length}`);

    // 3. Limitar ao batch
    const batch = epubFiles.slice(0, BATCH_SIZE);
    results.logs.push(`Arquivos no lote de processamento: ${batch.length}`);

    if (batch.length === 0) {
      results.logs.push('⚠️ Nenhum arquivo EPUB encontrado para processar.');
      return results;
    }

    // Processar cada arquivo
    for (let i = 0; i < batch.length; i++) {
      const file = batch[i];
      const progress = `[${i + 1}/${batch.length}]`;

      results.totalProcessed++;

      try {
        let currentFileName = file.name;
        let currentFileId = file.fileid;

        // PASSO 1: SANITIZAÇÃO
        if (currentFileName.startsWith('_')) {
          const newName = currentFileName.substring(1);
          results.logs.push(`${progress} 🔧 Sanitizando: "${currentFileName}" → "${newName}"`);

          await renameFile(currentFileId, { toname: newName });
          await delay(WRITE_DELAY);

          currentFileName = newName;
          results.totalRenamed++;
        }

        // PASSO 2: DEDUPLICAÇÃO
        const fileKey = `${currentFileName}|${file.size}`;

        if (seenFiles.has(fileKey)) {
          results.logs.push(`${progress} 🔄 Duplicado detectado: "${currentFileName}"`);

          if (!folderCache.has('Duplicados')) {
            const dupFolder = await createFolderIfNotExists(SOURCE_FOLDER_ID, 'Duplicados');
            folderCache.set('Duplicados', dupFolder.folderid);
            await delay(WRITE_DELAY);
          }

          const dupFolderId = folderCache.get('Duplicados');
          await renameFile(currentFileId, { tofolderid: dupFolderId });
          await delay(WRITE_DELAY);

          results.totalDuplicates++;
          results.totalMoved++;
          results.categoryCount['Duplicados'] = (results.categoryCount['Duplicados'] || 0) + 1;
          continue;
        }

        seenFiles.set(fileKey, { id: currentFileId, name: currentFileName });

        // PASSO 3: CATEGORIZAÇÃO
        const category = categorizeFile(currentFileName);
        results.logs.push(`${progress} 📖 "${currentFileName}" → ${category}`);

        // PASSO 4: MOVIMENTAÇÃO
        if (!folderCache.has(category)) {
          const categoryFolder = await createFolderIfNotExists(SOURCE_FOLDER_ID, category);
          folderCache.set(category, categoryFolder.folderid);
          await delay(WRITE_DELAY);
        }

        const targetFolderId = folderCache.get(category);

        await renameFile(currentFileId, { tofolderid: targetFolderId });
        await delay(WRITE_DELAY);

        results.totalMoved++;
        results.categoryCount[category] = (results.categoryCount[category] || 0) + 1;

      } catch (error) {
        results.totalErrors++;
        results.errors.push({
          file: file.name,
          error: error.message
        });
        results.logs.push(`${progress} ❌ ERRO: ${file.name} - ${error.message}`);
      }
    }

    results.logs.push(`\n✅ Processo concluído em: ${new Date().toISOString()}`);
    return results;

  } catch (error) {
    results.logs.push(`💥 ERRO FATAL: ${error.message}`);
    results.errors.push({ file: 'FATAL', error: error.message });
    throw error;
  }
}

// ============================================================
// FUNÇÃO DE ANÁLISE - GERA LISTA SIMPLES
// ============================================================

async function analyzeAllFiles() {
  console.log('Analisando todos os arquivos...');

  const folderData = await listFolder(SOURCE_FOLDER_ID);
  const allContents = folderData.contents || [];

  const epubFiles = allContents.filter(item =>
    !item.isfolder && item.name.toLowerCase().endsWith('.epub')
  );

  // Lista simples de todos os arquivos (um por linha)
  const fileList = epubFiles.map(f => f.name).join('\n');

  return {
    totalFiles: epubFiles.length,
    fileList,
    files: epubFiles.map(f => ({ name: f.name, fileid: f.fileid, size: f.size }))
  };
}

// Prompt otimizado (separado da lista)
const CLASSIFICATION_PROMPT = `TAREFA: Para cada arquivo EPUB listado abaixo, determine a categoria correta.

CATEGORIAS DISPONÍVEIS:
Fantasia, Romance, Jovem Adulto, Ficção Científica, Horror, Suspense, Policial, Literatura Clássica, Literatura Contemporânea, Autoajuda, Biografias, Negócios, Religião, Saúde, Ciências, Computação, HQs e Mangás, Infantil, Erótico, Outros

DICAS DE AUTORES:
- Sarah J. Maas, Holly Black, Leigh Bardugo, Brandon Sanderson = Fantasia
- Colleen Hoover, Anna Todd, Nicholas Sparks, Tessa Dare = Romance  
- Suzanne Collins, Victoria Aveyard, Veronica Roth = Jovem Adulto
- Stephen King = Horror
- Agatha Christie = Policial

FORMATO DE RESPOSTA OBRIGATÓRIO:
Retorne APENAS um JSON válido assim:
{
  "nome_do_arquivo.epub": "Categoria",
  "outro_arquivo.epub": "Categoria"
}

NÃO escreva explicações. APENAS o JSON.
Pesquise na internet autores que você não conhece.

LISTA DE ARQUIVOS PARA CLASSIFICAR:`;

// ============================================================
// SERVIDOR EXPRESS
// ============================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing de formulário
app.use(express.urlencoded({ extended: true }));

// Página inicial
app.get('/', (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Organizador EPUB - pCloud</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          min-height: 100vh;
          color: #fff;
          padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; margin-bottom: 30px; color: #00d9ff; }
        h2 { margin-bottom: 20px; }
        .card {
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }
        .btn {
          display: inline-block;
          padding: 15px 30px;
          background: linear-gradient(135deg, #00d9ff 0%, #0077ff 100%);
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,217,255,0.3); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-danger { background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); }
        .status { 
          padding: 15px; 
          border-radius: 8px; 
          margin: 15px 0;
        }
        .status.success { background: rgba(0, 255, 136, 0.2); border: 1px solid #00ff88; }
        .status.error { background: rgba(255, 68, 68, 0.2); border: 1px solid #ff4444; }
        .status.info { background: rgba(0, 217, 255, 0.2); border: 1px solid #00d9ff; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; color: #00d9ff; }
        .form-group input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          background: rgba(0,0,0,0.3);
          color: #fff;
          font-size: 16px;
        }
        .form-group input:focus {
          outline: none;
          border-color: #00d9ff;
        }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        th { color: #00d9ff; }
        .logs { 
          background: #0a0a0f; 
          padding: 15px; 
          border-radius: 8px; 
          max-height: 300px; 
          overflow-y: auto;
          font-family: monospace;
          font-size: 12px;
          white-space: pre-wrap;
        }
        .user-info { color: #00ff88; font-size: 14px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📚 Organizador EPUB - pCloud</h1>
        
        <div class="card">
          <h2>Status da Conexão</h2>
  `;

  if (authToken) {
    html += `
          <div class="status success">✅ Conectado ao pCloud</div>
          <p class="user-info">Logado como: <strong>${userEmail}</strong></p>
          <p style="margin: 15px 0;">Token ativo. Você pode executar a organização dos arquivos.</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
            <a href="/run" class="btn" ${isProcessing ? 'disabled' : ''}>
              ${isProcessing ? '⏳ Processando...' : '🚀 Executar Organização'}
            </a>
            <a href="/analyze" class="btn" style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);">
              📊 Gerar Análise (Markdown)
            </a>
            <a href="/logout" class="btn btn-danger">Desconectar</a>
          </div>
    `;
  } else {
    html += `
          <div class="status info">🔌 Não conectado</div>
          <p style="margin: 15px 0;">Faça login com suas credenciais do pCloud:</p>
          
          <form action="/login" method="POST">
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required placeholder="seu@email.com">
            </div>
            <div class="form-group">
              <label for="password">Senha:</label>
              <input type="password" id="password" name="password" required placeholder="Sua senha do pCloud">
            </div>
            <button type="submit" class="btn">🔐 Entrar</button>
          </form>
    `;
  }

  html += `
        </div>
  `;

  // Mostrar último resultado
  if (lastResults) {
    html += `
        <div class="card">
          <h2>📊 Último Resultado</h2>
          
          <h3 style="margin: 20px 0 10px;">Distribuição por Categoria</h3>
          <table>
            <tr><th>Categoria</th><th>Quantidade</th></tr>
    `;

    const sortedCategories = Object.entries(lastResults.categoryCount)
      .sort((a, b) => b[1] - a[1]);

    for (const [category, count] of sortedCategories) {
      html += `<tr><td>${category}</td><td>${count}</td></tr>`;
    }

    html += `
          </table>
          
          <h3 style="margin: 20px 0 10px;">Resumo</h3>
          <ul style="list-style: none;">
            <li>📁 Total Processados: <strong>${lastResults.totalProcessed}</strong></li>
            <li>✅ Total Movidos: <strong>${lastResults.totalMoved}</strong></li>
            <li>🔧 Sanitizados: <strong>${lastResults.totalRenamed}</strong></li>
            <li>🔄 Duplicados: <strong>${lastResults.totalDuplicates}</strong></li>
            <li>❌ Erros: <strong>${lastResults.totalErrors}</strong></li>
          </ul>
          
          <h3 style="margin: 20px 0 10px;">Logs</h3>
          <div class="logs">${lastResults.logs.join('\n')}</div>
        </div>
    `;
  }

  html += `
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send(`
      <h1>Erro</h1>
      <p>Email e senha são obrigatórios.</p>
      <a href="/">Voltar</a>
    `);
  }

  try {
    authToken = await loginPCloud(email, password);
    userEmail = email;
    console.log('✅ Login realizado com sucesso!');
    res.redirect('/');
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 40px; background: #1a1a2e; color: #fff; }
          .error { background: rgba(255,68,68,0.2); border: 1px solid #ff4444; padding: 20px; border-radius: 8px; }
          a { color: #00d9ff; }
        </style>
      </head>
      <body>
        <h1>❌ Erro no Login</h1>
        <div class="error">
          <p>${error.message}</p>
        </div>
        <p style="margin-top: 20px;"><a href="/">← Voltar e tentar novamente</a></p>
      </body>
      </html>
    `);
  }
});

// Executar organização
app.get('/run', async (req, res) => {
  if (!authToken) {
    return res.redirect('/');
  }

  if (isProcessing) {
    return res.send(`
      <h1>Processamento em andamento</h1>
      <p>Aguarde a conclusão do processamento atual.</p>
      <a href="/">Voltar</a>
    `);
  }

  isProcessing = true;

  try {
    lastResults = await organizeEpubFiles();
    isProcessing = false;
    res.redirect('/');
  } catch (error) {
    isProcessing = false;
    res.send(`
      <h1>Erro durante processamento</h1>
      <p>${error.message}</p>
      <a href="/">Voltar</a>
    `);
  }
});

// Analisar arquivos - gera lista simples
app.get('/analyze', async (req, res) => {
  if (!authToken) {
    return res.redirect('/');
  }

  try {
    const analysis = await analyzeAllFiles();

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Análise - Organizador EPUB</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
          }
          .container { max-width: 1000px; margin: 0 auto; }
          h1 { text-align: center; margin-bottom: 30px; color: #00d9ff; }
          h2 { margin-bottom: 15px; color: #00d9ff; }
          .card {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
          }
          .btn {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #00d9ff 0%, #0077ff 100%);
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            border: none;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
          }
          .btn:hover { opacity: 0.9; transform: translateY(-2px); }
          .btn-copy { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); }
          .btn-list { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); }
          .text-box {
            background: #0a0a0f;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid rgba(255,255,255,0.2);
            margin: 15px 0;
          }
          .prompt-box { border-color: #00d9ff; }
          .stats { color: #00ff88; font-size: 20px; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Análise de Arquivos EPUB</h1>
          
          <div class="card">
            <h2>📈 Estatísticas</h2>
            <p class="stats">Total: <strong>${analysis.totalFiles}</strong> arquivos EPUB</p>
          </div>

          <div class="card">
            <h2>📝 Prompt</h2>
            <p style="margin-bottom: 10px;">Copie e cole na IA junto com a lista de arquivos:</p>
            <button class="btn btn-copy" onclick="copyPrompt()">📋 Copiar Prompt</button>
            <div class="text-box prompt-box" id="prompt-content">${CLASSIFICATION_PROMPT.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>

          <div class="card">
            <h2>� Lista de Arquivos</h2>
            <p style="margin-bottom: 10px;">Copie a lista completa e cole na IA:</p>
            <button class="btn btn-list" onclick="copyList()">📋 Copiar Lista Completa (${analysis.totalFiles} arquivos)</button>
            <div class="text-box" id="list-content">${analysis.fileList.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>

          <div class="card">
            <a href="/" class="btn">← Voltar</a>
          </div>
        </div>
        
        <script>
          const prompt = ${JSON.stringify(CLASSIFICATION_PROMPT)};
          const fileList = ${JSON.stringify(analysis.fileList)};
          
          function copyPrompt() {
            navigator.clipboard.writeText(prompt).then(() => {
              alert('✅ Prompt copiado!');
            });
          }
          
          function copyList() {
            navigator.clipboard.writeText(fileList).then(() => {
              alert('✅ Lista copiada! (${analysis.totalFiles} arquivos)');
            });
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.send('<h1>Erro</h1><p>' + error.message + '</p><a href="/">Voltar</a>');
  }
});

// Logout
app.get('/logout', (req, res) => {
  authToken = null;
  userEmail = null;
  lastResults = null;
  res.redirect('/');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connected: !!authToken });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
