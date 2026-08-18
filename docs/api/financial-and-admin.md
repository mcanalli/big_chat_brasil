# Módulo Financeiro e Administrativo

Este documento descreve as regras de negócio e os endpoints para gestão de clientes e faturamento.

## Modelos de Faturamento

### 1. Pré-pago (prepaid)
* O cliente adiciona créditos antes de utilizar os serviços.
* Cada mensagem enviada debita o valor correspondente do saldo.
* Se o saldo for insuficiente, o envio é bloqueado.

### 2. Pós-pago (postpaid)
* O cliente possui um limite de crédito mensal.
* O consumo é acumulado ao longo do mês.
* Se o consumo atingir o limite, o envio é bloqueado até que o limite seja aumentado ou a fatura paga (reset do consumo).

## Endpoints Administrativos

### Autenticação
* `POST /auth`: Realiza o login administrativo para obter o token de acesso.

### Gestão de Clientes
* `GET /clients`: Lista todos os clientes.
* `POST /clients`: Cria um novo cliente (define plano e saldo/limite inicial).
* `GET /clients/:id`: Detalhes do cliente.
* `PUT /clients/:id`: Atualiza dados cadastrais.
* `GET /clients/:id/balance`: Consulta saldo disponível ou limite/consumo.

### Operações Financeiras (Admin)
* `POST /admin/clients/:id/credits`: Adiciona créditos (apenas Pré-pago). Registra transação `CREDIT_PURCHASE`.
* `PATCH /admin/clients/:id/limit`: Ajusta o limite de crédito (apenas Pós-pago).
* `POST /admin/clients/:id/convert-plan`: Altera a modalidade do plano (Pré <-> Pós).
* `GET /admin/clients/:id/transactions`: Extrato de movimentações financeiras.

## Regras de Transação
Todas as adições de crédito e débitos por envio de mensagem devem registrar uma entrada na tabela `financial_transactions` para fins de auditoria.
