# Guia de Contribuição e Padrões de Código

Bem-vindo ao Big Chat Brasil! Para manter a qualidade e a consistência do código, seguimos os padrões descritos abaixo.

## 1. Convenções de Código

### Backend (NestJS)
*   **Linguagem**: TypeScript.
*   **Estilo**: Seguir o [Style Guide Oficial do NestJS](https://docs.nestjs.com/).
*   **Linting**: ESLint com a configuração de base do NestJS.
*   **Formatação**: Prettier (configuração inclusa no repositório).
*   **Nomenclatura**:
    *   Classes: `PascalCase` (ex: `MessageService`).
    *   Arquivos: `kebab-case.type.ts` (ex: `message.controller.ts`).
    *   Métodos e Variáveis: `camelCase`.

### Frontend (Angular)
*   **Linguagem**: TypeScript.
*   **Estilo**: [Angular Coding Style Guide](https://angular.io/guide/styleguide).
*   **Componentes**: Utilizar componentes **Standalone** sempre que possível.
*   **Gerenciamento de Estado**: Preferir **Signals** para estados locais e reatividade simples.

## 2. Padrões de Git

### Commits
Seguimos o padrão **Conventional Commits**:
*   `feat: ...` para novas funcionalidades.
*   `fix: ...` para correção de bugs.
*   `docs: ...` para alterações em documentação.
*   `refactor: ...` para melhorias de código sem alterar funcionalidade.
*   `chore: ...` para atualizações de dependências e build.

### Branches
*   `main`: Branch de produção.
*   `develop`: Branch de integração.
*   `feature/nome-da-feature`: Para novas funcionalidades.
*   `hotfix/nome-do-fix`: Para correções críticas.

## 3. Qualidade e Testes

*   **Testes Unitários**: Todo novo serviço ou lógica de negócio deve vir acompanhado de testes unitários (`.spec.ts`).
*   **Execução**:
    *   Backend: `npm run test`
    *   Frontend: `npm run test`

## 4. Tipagem
*   **Strict Mode**: O TypeScript está configurado em modo estrito. Evite o uso de `any`.
*   **Interfaces e DTOs**: Sempre defina interfaces para payloads de API e utilize DTOs com `class-validator` para validação de entrada no backend.
