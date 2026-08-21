# Frontend - Big Chat Brasil

## Arquitetura Reativa (Angular v22 + Signals + SSE)

O **Frontend** do Big Chat Brasil foi desenvolvido em **Angular v22** utilizando componentes *Standalone*, **Angular Signals** para reatividade granular de estado, e um cliente **SSE (*Server-Sent Events*)** para receber atualizações em tempo real do backend sem necessidade de *polling*.

---

## Configuração do Vitest + MSW (+92% de Cobertura)

Os testes unitários e de integração são executados através do **Vitest** em conjunto com o **MSW (Mock Service Worker)** para interceptação de requisições HTTP e fluxos reativos, garantindo uma cobertura superior a 92%.

---

## Comandos de Execução e Teste

```bash
# Instalação de dependências
npm install

# Execução do servidor de desenvolvimento
ng serve

# Execução de testes unitários com Vitest
ng test

# Execução de testes com relatório de cobertura (+92%)
npm run test:coverage

# Build de produção
ng build
```
