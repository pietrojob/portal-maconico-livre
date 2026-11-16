# Portal Maçônico Livre

Sistema open source para administração de lojas maçônicas, com área social, financeiro, biblioteca, cadastro de membros, frequência, gestão interna e controle de acesso.

Este repositório contém somente dados fictícios e configurações de exemplo. Nenhuma informação da organização que originou o projeto faz parte desta versão.

## Acesso de demonstração

- Usuário: `admin`
- Senha: `admin`

Essas credenciais são públicas e servem apenas para demonstração. Troque a senha antes de disponibilizar o sistema na internet.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
copy .env.example .env
```

Para desenvolvimento local, defina `PORTAL_LOCAL=1` e execute:

```bash
npm start
```

Abra `http://127.0.0.1:8080`.

## Docker

```bash
docker compose up --build -d
```

Edite `PORTAL_HOSTS` no arquivo `.env` com o hostname real antes da publicação.

## Dados e segurança

- Os dados persistentes ficam em `data/`, pasta ignorada pelo Git.
- Arquivos `.env`, resultados de testes, logs e pacotes compactados também são ignorados.
- Não publique bancos, uploads, cópias de segurança ou credenciais reais.
- Consulte [SECURITY.md](SECURITY.md) antes de colocar o sistema em produção.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
