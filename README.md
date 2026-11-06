# GELAÊ — Marketplace de bebidas

Projeto inicial completo para demonstração de um marketplace de depósitos de bebidas em cidades do interior.

## Tecnologias
- Frontend: HTML, CSS e JavaScript puro (sem React)
- Backend: Node.js + Express
- Banco: MySQL
- Persistência de carrinho e pedidos de demonstração: localStorage do navegador

## Rodar a demonstração visual
1. Instale Node.js (versão 18 ou superior).
2. Extraia o projeto.
3. Abra o terminal na pasta `gelae-marketplace`.
4. Execute `npm install`.
5. Execute `npm start`.
6. Acesse `http://localhost:3000`.

A demonstração visual funciona sem MySQL: o catálogo, carrinho e pedidos de teste ficam salvos no navegador. O backend e os endpoints MySQL estão incluídos para a próxima etapa de integração.

## Configurar MySQL
1. Abra o MySQL Workbench ou outro cliente MySQL.
2. Execute o conteúdo de `schema.sql`.
3. Copie `.env.example` para `.env`.
4. Preencha host, porta, usuário, senha e nome do banco.
5. Reinicie o servidor.

Endpoints incluídos:
- `GET /api/health`
- `GET /api/stores`
- `GET /api/products?store_id=1`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:id/status`

## Regras de negócio já refletidas no esboço
- Marketplace com vários depósitos.
- Cada depósito administra seu catálogo.
- Limite de até 30 produtos ativos por depósito (a validação definitiva deve ser aplicada no cadastro administrativo/API de produtos).
- Categorias: cervejas, destilados, refrigerantes, energéticos, águas, sucos, gelos e drinks prontos.
- Um carrinho pertence a um único depósito por compra.
- Cada depósito define sua taxa de entrega.
- Interface em português.
- Aviso de maioridade e lembrete de conferência de idade na entrega.

## Importante antes de publicar
Este é um MVP demonstrativo, não um sistema pronto para operação comercial. Antes de receber pedidos reais, implemente autenticação segura para cliente, depósito e administrador; validação de estoque e limite de 30 produtos no servidor; integração de pagamento; gestão real de entregadores; proteção contra fraude; logs; política de privacidade; termos de uso; controles de idade e revisão jurídica. Nunca coloque credenciais do MySQL no frontend.
