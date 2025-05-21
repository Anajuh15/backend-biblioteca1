import multer from 'multer'; // Importa o Multer, responsável por lidar com uploads
import path from 'path'; // Módulo para trabalhar com caminhos de arquivos
import crypto from 'crypto'; // Módulo para gerar valores aleatórios

// Função para gerar um nome aleatório de 16 caracteres (letras e números)
function gerarNomeAleatorio(tamanho = 16): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nome = '';
  for (let i = 0; i < tamanho; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    nome += caracteres[indice];
  }
  return nome;
}

// ===================== UPLOAD DE USUÁRIOS ===================== //

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', '..', 'uploads')); // Caminho para "uploads"
  },

  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(6).toString('hex'); // Gera hash aleatório
    const ext = path.extname(file.originalname); // Pega a extensão
    const uuid = (req.body?.uuid || req.params?.uuid || req.query?.uuid || 'sem-uuid');
    const filename = `${uuid}-${hash}-${file.originalname}`;
    cb(null, filename);
  }
});

// Exporta o middleware para upload de imagem de perfil
export const upload = multer({ storage });


// ===================== UPLOAD DE CAPAS DE LIVRO ===================== //

const storageCapa = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', '..', 'uploads/cover')); // Caminho para "uploads/cover"
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Extrai a extensão original
    const nomeAleatorio = gerarNomeAleatorio();  // Gera nome aleatório de 16 caracteres
    const filename = `${nomeAleatorio}${ext}`;   // Ex: "A1b2C3d4E5f6G7h8.png"
    cb(null, filename); // Define nome final do arquivo
  }
});

// Exporta o middleware para upload de capa de livro
export const uploadCapa = multer({ storage: storageCapa });
