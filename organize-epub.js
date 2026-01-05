/**
 * Script de Automação - Organizador de Arquivos EPUB pCloud
 * 
 * Funcionalidades:
 * 1. Lista arquivos .epub da pasta raiz
 * 2. Sanitiza nomes (remove _ inicial)
 * 3. Detecta duplicados por nome+tamanho
 * 4. Categoriza por palavras-chave
 * 5. Move arquivos para pastas de categoria
 * 6. Gera relatório final
 */

const axios = require('axios');

// ============================================================
// CONFIGURAÇÃO - INSIRA SEU TOKEN AQUI
// ============================================================
const ACCESS_TOKEN = 'SEU_TOKEN_AQUI';

// Configurações gerais
const BASE_URL = 'https://api.pcloud.com';
const SOURCE_FOLDER_ID = 27008662289;
const BATCH_SIZE = 200;
const WRITE_DELAY = 300;

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

/**
 * Delay entre requisições (rate limiting)
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 */
function normalizeString(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ');
}

/**
 * Determina a categoria de um arquivo baseado em palavras-chave
 */
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
            // Em caso de empate, escolhe a primeira alfabeticamente
            if (category < bestCategory) {
                bestCategory = category;
            }
        }
    }

    return bestCategory;
}

/**
 * Cria headers de autenticação
 */
function getHeaders() {
    return {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    };
}

// ============================================================
// FUNÇÕES DA API pCloud
// ============================================================

/**
 * Lista conteúdo de uma pasta
 */
async function listFolder(folderId) {
    try {
        const response = await axios.get(`${BASE_URL}/listfolder`, {
            params: { folderid: folderId },
            headers: getHeaders()
        });

        if (response.data.result !== 0) {
            throw new Error(`Erro API: ${response.data.error || response.data.result}`);
        }

        return response.data.metadata;
    } catch (error) {
        console.error('Erro ao listar pasta:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Cria pasta se não existir
 */
async function createFolderIfNotExists(parentFolderId, folderName) {
    try {
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
    } catch (error) {
        console.error(`Erro ao criar pasta "${folderName}":`, error.response?.data || error.message);
        throw error;
    }
}

/**
 * Renomeia/Move arquivo
 */
async function renameFile(fileId, options = {}) {
    try {
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
    } catch (error) {
        console.error('Erro ao renomear/mover arquivo:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

async function organizeEpubFiles() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ORGANIZADOR DE ARQUIVOS EPUB - pCloud');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nIniciando em: ${new Date().toISOString()}`);
    console.log(`Pasta fonte: ${SOURCE_FOLDER_ID}`);
    console.log(`Tamanho do lote: ${BATCH_SIZE}`);
    console.log(`Delay entre operações: ${WRITE_DELAY}ms\n`);

    // Estrutura de resultados
    const results = {
        totalProcessed: 0,
        totalMoved: 0,
        totalErrors: 0,
        totalRenamed: 0,
        totalDuplicates: 0,
        categoryCount: {},
        errors: []
    };

    // Cache de pastas criadas (categoria -> folderId)
    const folderCache = new Map();

    // Mapa para detectar duplicados (nome+tamanho -> fileInfo)
    const seenFiles = new Map();

    try {
        // 1. Listar arquivos da pasta fonte
        console.log('📂 Listando arquivos da pasta fonte...');
        const folderData = await listFolder(SOURCE_FOLDER_ID);
        const allContents = folderData.contents || [];

        console.log(`   Total de itens na pasta: ${allContents.length}`);

        // 2. Filtrar apenas arquivos .epub
        const epubFiles = allContents.filter(item =>
            !item.isfolder && item.name.toLowerCase().endsWith('.epub')
        );

        console.log(`   Arquivos EPUB encontrados: ${epubFiles.length}`);

        // 3. Limitar ao batch de teste
        const batch = epubFiles.slice(0, BATCH_SIZE);
        console.log(`   Arquivos no lote de processamento: ${batch.length}\n`);

        if (batch.length === 0) {
            console.log('⚠️  Nenhum arquivo EPUB encontrado para processar.');
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

                // ========================================
                // PASSO 1: SANITIZAÇÃO (remover _ inicial)
                // ========================================
                if (currentFileName.startsWith('_')) {
                    const newName = currentFileName.substring(1);
                    console.log(`${progress} 🔧 Sanitizando: "${currentFileName}" → "${newName}"`);

                    await renameFile(currentFileId, { toname: newName });
                    await delay(WRITE_DELAY);

                    currentFileName = newName;
                    results.totalRenamed++;
                }

                // ========================================
                // PASSO 2: DEDUPLICAÇÃO SIMPLES
                // ========================================
                const fileKey = `${currentFileName}|${file.size}`;

                if (seenFiles.has(fileKey)) {
                    // É um duplicado - mover para pasta "Duplicados"
                    console.log(`${progress} 🔄 Duplicado detectado: "${currentFileName}"`);

                    // Criar/obter pasta Duplicados
                    if (!folderCache.has('Duplicados')) {
                        const dupFolder = await createFolderIfNotExists(SOURCE_FOLDER_ID, 'Duplicados');
                        folderCache.set('Duplicados', dupFolder.folderid);
                        console.log(`   📁 Pasta "Duplicados" criada/encontrada (ID: ${dupFolder.folderid})`);
                        await delay(WRITE_DELAY);
                    }

                    const dupFolderId = folderCache.get('Duplicados');
                    await renameFile(currentFileId, { tofolderid: dupFolderId });
                    await delay(WRITE_DELAY);

                    results.totalDuplicates++;
                    results.totalMoved++;
                    results.categoryCount['Duplicados'] = (results.categoryCount['Duplicados'] || 0) + 1;

                    console.log(`   ✓ Movido para "Duplicados"`);
                    continue; // Próximo arquivo
                }

                // Registrar arquivo visto
                seenFiles.set(fileKey, { id: currentFileId, name: currentFileName });

                // ========================================
                // PASSO 3: CATEGORIZAÇÃO
                // ========================================
                const category = categorizeFile(currentFileName);
                console.log(`${progress} 📖 "${currentFileName}" → ${category}`);

                // ========================================
                // PASSO 4: MOVIMENTAÇÃO
                // ========================================

                // Criar/obter pasta da categoria
                if (!folderCache.has(category)) {
                    const categoryFolder = await createFolderIfNotExists(SOURCE_FOLDER_ID, category);
                    folderCache.set(category, categoryFolder.folderid);
                    console.log(`   📁 Pasta "${category}" criada/encontrada (ID: ${categoryFolder.folderid})`);
                    await delay(WRITE_DELAY);
                }

                const targetFolderId = folderCache.get(category);

                // Mover arquivo
                await renameFile(currentFileId, { tofolderid: targetFolderId });
                await delay(WRITE_DELAY);

                results.totalMoved++;
                results.categoryCount[category] = (results.categoryCount[category] || 0) + 1;

                console.log(`   ✓ Movido com sucesso`);

            } catch (error) {
                results.totalErrors++;
                results.errors.push({
                    file: file.name,
                    error: error.message
                });
                console.error(`${progress} ❌ ERRO: ${file.name} - ${error.message}`);
            }
        }

        // ========================================
        // RELATÓRIO FINAL
        // ========================================
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('   RELATÓRIO FINAL');
        console.log('═══════════════════════════════════════════════════════════\n');

        // Tabela de distribuição por categoria
        console.log('📊 DISTRIBUIÇÃO POR CATEGORIA:');
        console.log('─────────────────────────────────────────────────────────────');
        console.log('| Categoria                                    | Quantidade |');
        console.log('─────────────────────────────────────────────────────────────');

        // Ordenar categorias alfabeticamente
        const sortedCategories = Object.entries(results.categoryCount)
            .sort((a, b) => a[0].localeCompare(b[0]));

        for (const [category, count] of sortedCategories) {
            const paddedCategory = category.padEnd(44);
            const paddedCount = String(count).padStart(10);
            console.log(`| ${paddedCategory} | ${paddedCount} |`);
        }

        console.log('─────────────────────────────────────────────────────────────\n');

        // Resumo geral
        console.log('📈 RESUMO GERAL:');
        console.log(`   • Total de Arquivos Processados: ${results.totalProcessed}`);
        console.log(`   • Total de Arquivos Movidos: ${results.totalMoved}`);
        console.log(`   • Arquivos Sanitizados (removido _): ${results.totalRenamed}`);
        console.log(`   • Duplicados Detectados: ${results.totalDuplicates}`);
        console.log(`   • Total de Erros: ${results.totalErrors}`);

        if (results.errors.length > 0) {
            console.log('\n❌ DETALHES DOS ERROS:');
            for (const err of results.errors) {
                console.log(`   • ${err.file}: ${err.error}`);
            }
        }

        console.log(`\n✅ Processo concluído em: ${new Date().toISOString()}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        return results;

    } catch (error) {
        console.error('\n💥 ERRO FATAL:', error.message);
        throw error;
    }
}

// ============================================================
// EXECUÇÃO
// ============================================================

// Verificar se o token foi configurado
if (ACCESS_TOKEN === 'SEU_TOKEN_AQUI') {
    console.error('❌ ERRO: Por favor, configure o ACCESS_TOKEN no início do arquivo.');
    console.error('   Substitua "SEU_TOKEN_AQUI" pelo seu token OAuth do pCloud.');
    process.exit(1);
}

// Executar
organizeEpubFiles()
    .then(results => {
        console.log('Script finalizado com sucesso!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Script finalizado com erro:', error.message);
        process.exit(1);
    });
