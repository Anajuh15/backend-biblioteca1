import { Livro } from "../model/Livro";
import { Request, Response } from "express";
import fs from 'fs';
import path from 'path';

/**
 * Interface LivroDTO
 * Define os atributos que devem ser recebidos do cliente nas requisições
 */
interface LivroDTO {
    titulo: string;
    autor: string;
    editora: string;
    anoPublicacao?: number;
    isbn?: string;
    quantTotal: number;
    quantDisponivel: number;
    valorAquisicao?: number;
    statusLivroEmprestado?: string
}

/**
 * Controlador para operações relacionadas aos Livros.
 */
class LivroController extends Livro {
    static async todos(req: Request, res: Response) {
        try {
            const listaDeLivros = await Livro.listarLivros();
            res.status(200).json(listaDeLivros);
        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);
            res.status(400).json("Erro ao recuperar as informações do Livro");
        }
    }

    static async cadastrar(req: Request, res: Response) {
        try {
            const dadosRecebidos: LivroDTO = req.body;

            // Instanciando objeto Livro
            const novoLivro = new Livro(
                dadosRecebidos.titulo,
                dadosRecebidos.autor,
                dadosRecebidos.editora,
                (dadosRecebidos.anoPublicacao ?? 0).toString(),
                dadosRecebidos.isbn ?? '',
                dadosRecebidos.quantTotal,
                dadosRecebidos.quantDisponivel,
                dadosRecebidos.valorAquisicao ?? 0,
                dadosRecebidos.statusLivroEmprestado ?? 'Disponível'
            );

            // Chama o método para persistir o livro no banco de dados
            const result = await Livro.cadastrarLivro(novoLivro);

            // Verifica se o cadastro foi bem-sucedido
            if (result.queryResult && result.idLivro) {
                novoLivro.setIdLivro(result.idLivro);

                // Inserindo capa do livro, se informada
                if (req.file) {
                    const nomeArquivo = req.file.filename;
                    await Livro.atualizarImagemCapa(nomeArquivo, novoLivro.getIdLivro());
                }

                // Retorno de sucesso com o ID do livro
                return res.status(200).json({mensagem: 'Livro cadastrado com sucesso'});
            } else {
                return res.status(400).json({mensagem: 'Não foi possível cadastrar o livro no banco de dados'});
            }
        } catch (error) {
            console.error(`Erro ao cadastrar o livro: ${error}`);
            return res.status(500).json({
                mensagem: 'Erro ao cadastrar o livro'
            });
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idLivro = parseInt(req.query.idLivro as string);
            const result = await Livro.removerLivro(idLivro);

            if (result) {
                return res.status(200).json('Livro removido com sucesso');
            } else {
                return res.status(401).json('Erro ao deletar livro');
            }
        } catch (error) {
            console.log("Erro ao remover o Livro");
            console.log(error);
            return res.status(500).send("error");
        }
    }

    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos: LivroDTO = req.body;

            const livro = new Livro(
                dadosRecebidos.titulo,
                dadosRecebidos.autor,
                dadosRecebidos.editora,
                (dadosRecebidos.anoPublicacao ?? 0).toString(),
                dadosRecebidos.isbn ?? '',
                dadosRecebidos.quantTotal,
                dadosRecebidos.quantDisponivel,
                dadosRecebidos.valorAquisicao ?? 0,
                dadosRecebidos.statusLivroEmprestado ?? 'Disponível'
            );

            livro.setIdLivro(parseInt(req.query.idLivro as string));

            if (await Livro.atualizarCadastroLivro(livro)) {
                return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso!" });
            } else {
                return res.status(400).json('Não foi possível atualizar o livro no banco de dados');
            }
        } catch (error) {
            console.error(`Erro no modelo: ${error}`);
            return res.json({ mensagem: "Erro ao atualizar aluno." });
        }
    }
}

export default LivroController;
