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
  "Artes, Cinema e Fotografia": [
    "arte", "cinema", "fotografia", "pintura", "escultura",
    "musica", "teatro", "danca", "filme", "diretor"
  ],

  "Autoajuda": [
    "autoajuda", "motivacao", "superacao", "habitos", "sucesso",
    "produtividade", "mindset", "crescimento", "desenvolvimento", "inspiracao"
  ],

  "Bebês e Crianças": [
    "bebe", "crianca", "infantil", "pediatria", "maternidade",
    "gravidez", "educacao infantil", "puericultura", "amamentacao", "desenvolvimento infantil"
  ],

  "Biografias e Histórias Reais": [
    "biografia", "autobiografia", "memorias", "historia real", "vida",
    "trajetoria", "testemunho", "relato", "historia verdadeira", "perfil"
  ],

  "Ciências e Engenharia": [
    "ciencia", "engenharia", "fisica", "quimica", "biologia",
    "matematica", "tecnologia", "pesquisa", "experimento", "astronomia"
  ],

  "Computação, Informática e Mídias Digitais": [
    "programacao", "software", "computador", "internet", "digital",
    "codigo", "algoritmo", "desenvolvimento", "web", "tecnologia da informacao"
  ],

  "Culinária e Gastronomia": [
    "culinaria", "receita", "gastronomia", "cozinha", "chef",
    "alimento", "comida", "prato", "ingrediente", "sabor"
  ],

  "Direito": [
    "direito", "lei", "juridico", "advocacia", "justica",
    "tribunal", "codigo", "constitucional", "penal", "civil"
  ],

  "Educação, Referência e Didáticos": [
    "educacao", "ensino", "didatico", "pedagogia", "aprendizagem",
    "escola", "professor", "curso", "apostila", "guia"
  ],

  "Esportes, Lazer e Viagens": [
    "esporte", "viagem", "turismo", "aventura", "lazer",
    "futebol", "corrida", "destino", "guia de viagem", "fitness"
  ],

  "Fantasia, Horror e Ficção Científica": [
    "fantasia", "magia", "dragao", "elfo", "sci-fi",
    "ficcao cientifica", "horror", "terror", "monstro", "espacial"
  ],

  "HQs, Mangás e Graphic Novels": [
    "hq", "quadrinho", "manga", "comic", "graphic novel",
    "gibi", "heroi", "super-heroi", "anime", "marvel"
  ],

  "Inglês e Outras Línguas": [
    "ingles", "idioma", "lingua", "traducao", "gramatica",
    "vocabulario", "conversacao", "fluencia", "language", "dictionary"
  ],

  "Jovem Adulto": [
    "jovem adulto", "young adult", "adolescente", "teen", "juventude",
    "coming of age", "distopia jovem", "romance jovem", "ya", "novo adulto"
  ],

  "Literatura e Ficção": [
    "romance", "ficcao", "literatura", "conto", "novela",
    "prosa", "narrativa", "classico", "contemporaneo", "historia"
  ],

  "Negócios e Economia": [
    "negocios", "economia", "empresarial", "gestao", "marketing",
    "financas", "empreendedorismo", "administracao", "mercado", "investimento"
  ],

  "Religião e Espiritualidade": [
    "religiao", "fe", "deus", "espiritualidade", "biblia",
    "igreja", "oracao", "meditacao", "espiritual", "sagrado"
  ],

  "Saúde, Emagrecimento e Bem-Estar": [
    "saude", "emagrecimento", "dieta", "bem-estar", "nutricao",
    "exercicio", "corpo", "medicina", "tratamento", "cura"
  ],

  "Sexualidade e Relacionamentos": [
    "sexo", "relacionamento", "amor", "casal", "intimidade",
    "namoro", "casamento", "paixao", "sexualidade", "parceiro"
  ],

  "Sociologia e Ciências Sociais": [
    "sociologia", "sociedade", "social", "antropologia", "cultura",
    "politica", "filosofia", "historia", "psicologia social", "comportamento"
  ],

  "Suspense, Policial e Thriller": [
    "suspense", "thriller", "policial", "crime", "detetive",
    "investigacao", "misterio", "assassinato", "noir", "acao"
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
const CLASSIFICATION_PROMPT = `Classifique cada arquivo EPUB em UMA categoria:

CATEGORIAS:
1-Fantasia, 2-Romance, 3-Jovem Adulto, 4-Ficção Científica, 5-Horror/Terror, 6-Suspense/Thriller, 7-Policial/Mistério, 8-Literatura Clássica, 9-Literatura Contemporânea, 10-Autoajuda, 11-Biografias, 12-Negócios/Economia, 13-Religião/Espiritualidade, 14-Saúde/Bem-Estar, 15-Ciências, 16-Computação/Tecnologia, 17-HQs/Mangás, 18-Infantil, 19-Erótico, 20-Outros

REGRAS:
- Sarah J. Maas, Holly Black, Leigh Bardugo = Fantasia
- Anna Todd, Colleen Hoover = Romance
- Suzanne Collins, Victoria Aveyard = Jovem Adulto
- Pesquise autores desconhecidos na internet

RESPONDA APENAS com JSON:
{"arquivo.epub":"Categoria",...}`;

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
