/**
 * Servidor de Automação - Organizador de Arquivos EPUB pCloud
 * 
 * Este servidor:
 * 1. Inicia o fluxo OAuth
 * 2. Recebe o callback com o código
 * 3. Troca o código pelo Access Token
 * 4. Executa a organização dos arquivos
 */

const express = require('express');
const axios = require('axios');

// ============================================================
// CONFIGURAÇÃO - CREDENCIAIS DO APP pCloud
// ============================================================
const CLIENT_ID = 'MTXhjRNV8hH';
const CLIENT_SECRET = 'K7Y1fmFLMXm6dtbgrtUSO5y8hFjy';
const REDIRECT_URI = 'https://geral-epub-script.r954jc.easypanel.host/callback';

// Configurações gerais
const BASE_URL = 'https://api.pcloud.com';
const SOURCE_FOLDER_ID = 27008662289;
const BATCH_SIZE = 200;
const WRITE_DELAY = 300;

// Armazena o token em memória (em produção, use banco de dados)
let accessToken = null;
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

function getHeaders() {
    return {
        'Authorization': `Bearer ${accessToken}`
    };
}

// ============================================================
// FUNÇÕES DA API pCloud
// ============================================================

async function listFolder(folderId) {
    const response = await axios.get(`${BASE_URL}/listfolder`, {
        params: { folderid: folderId },
        headers: getHeaders()
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
            name: folderName
        },
        headers: getHeaders()
    });

    if (response.data.result !== 0) {
        throw new Error(`Erro ao criar pasta: ${response.data.error || response.data.result}`);
    }

    return response.data.metadata;
}

async function renameFile(fileId, options = {}) {
    const params = { fileid: fileId };

    if (options.tofolderid) {
        params.tofolderid = options.tofolderid;
    }
    if (options.toname) {
        params.toname = options.toname;
    }

    const response = await axios.get(`${BASE_URL}/renamefile`, {
        params,
        headers: getHeaders()
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
// SERVIDOR EXPRESS
// ============================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Página inicial
app.get('/', (req, res) => {
    const authUrl = `https://my.pcloud.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

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
        .status { 
          padding: 15px; 
          border-radius: 8px; 
          margin: 15px 0;
        }
        .status.success { background: rgba(0, 255, 136, 0.2); border: 1px solid #00ff88; }
        .status.error { background: rgba(255, 68, 68, 0.2); border: 1px solid #ff4444; }
        .status.info { background: rgba(0, 217, 255, 0.2); border: 1px solid #00d9ff; }
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📚 Organizador EPUB - pCloud</h1>
        
        <div class="card">
          <h2>Status da Conexão</h2>
  `;

    if (accessToken) {
        html += `
          <div class="status success">✅ Conectado ao pCloud</div>
          <p style="margin: 15px 0;">Token ativo. Você pode executar a organização dos arquivos.</p>
          <a href="/run" class="btn" ${isProcessing ? 'disabled' : ''}>
            ${isProcessing ? '⏳ Processando...' : '🚀 Executar Organização'}
          </a>
          <a href="/logout" class="btn" style="background: #ff4444; margin-left: 10px;">Desconectar</a>
    `;
    } else {
        html += `
          <div class="status info">🔌 Não conectado</div>
          <p style="margin: 15px 0;">Clique no botão abaixo para autorizar o acesso ao pCloud.</p>
          <a href="${authUrl}" class="btn">🔐 Conectar ao pCloud</a>
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

// Callback OAuth
app.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.send(`
      <h1>Erro na autorização</h1>
      <p>${error}</p>
      <a href="/">Voltar</a>
    `);
    }

    if (!code) {
        return res.send(`
      <h1>Código não recebido</h1>
      <a href="/">Voltar</a>
    `);
    }

    try {
        // Trocar código por token
        const tokenResponse = await axios.get(`${BASE_URL}/oauth2_token`, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code
            }
        });

        if (tokenResponse.data.error) {
            throw new Error(tokenResponse.data.error);
        }

        accessToken = tokenResponse.data.access_token;
        console.log('✅ Token obtido com sucesso!');

        res.redirect('/');

    } catch (error) {
        console.error('Erro ao obter token:', error.message);
        res.send(`
      <h1>Erro ao obter token</h1>
      <p>${error.message}</p>
      <a href="/">Voltar</a>
    `);
    }
});

// Executar organização
app.get('/run', async (req, res) => {
    if (!accessToken) {
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

// Logout
app.get('/logout', (req, res) => {
    accessToken = null;
    lastResults = null;
    res.redirect('/');
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', connected: !!accessToken });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📌 Callback configurado: ${REDIRECT_URI}`);
});
