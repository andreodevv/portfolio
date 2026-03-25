# Smart Resume - Senior Software Engineering Portfolio

Este projeto representa o estado da arte em portfólios técnicos para engenharia de software de alta performance. Diferente de currículos estáticos ou aplicações baseadas em frameworks pesados, esta solução foca em carregamento instantâneo, métricas perfeitas de Core Web Vitals e uma arquitetura de dados baseada em Single Source of Truth (SSoT).

## 1. Arquitetura e Decisões de Engenharia

### 1.1. Filosofia Zero-Dependency
A decisão de não utilizar frameworks de UI (React, Vue ou Angular) foi baseada em uma análise de custo-benefício de performance. Para um conteúdo predominantemente estático e informacional, a introdução de um runtime de JavaScript e processos de hidratação resultaria em overhead desnecessário. 
* **Benefício:** Redução drástica do Time to Interactive (TTI) e eliminação total de vulnerabilidades em cadeias de dependências (Supply Chain Attacks).
* **Stack:** Vanilla HTML5 (Semântico), CSS3 (Modern Features) e ES6+ JavaScript.

### 1.2. Single Source of Truth (SSoT) para Documentação
A gestão do currículo em PDF foi desacoplada do ciclo de build da aplicação.
* **Mecanismo:** O sistema consome rotas estáticas do Google Drive via API de exportação.
* **Trade-off:** Ao invés de versionar binários (PDFs) no Git, o que polui o histórico do repositório, o link de download aponta para a versão produtiva no Drive. Isso garante que qualquer atualização no documento original seja refletida imediatamente no portfólio sem necessidade de novo deploy.

## 2. Implementações Técnicas de Destaque

### 2.1. Motor de Temas e Acessibilidade (A11y)
O sistema de temas foi implementado utilizando CSS Custom Properties e uma lógica de priorização em três camadas:
1. **Preferência Explícita:** Persistência via LocalStorage.
2. **Preferência do Sistema:** Verificação de Media Queries (prefers-color-scheme).
3. **Fallback Seguro:** Padrão Dark Mode para alinhamento com a identidade visual de engenharia.
A implementação evita o Flash of Unstyled Content (FOUC) ao injetar o script de detecção no cabeçalho crítico da página.

### 2.2. Performance e Assets
* **Ícones:** Utilização de SVG Inline para eliminar requisições HTTP adicionais e garantir nitidez em qualquer densidade de pixels (Retina/4K).
* **Tipografia:** Implementação de fontes seguras e carregamento otimizado para evitar Layout Shifts (CLS).
* **Lighthouse Score:** Otimizado para atingir 100/100 em Performance, Acessibilidade, Boas Práticas e SEO.

### 2.3. SEO e Open Graph (OG)
Arquitetura de meta-tags otimizada para motores de busca e crawlers de redes sociais (LinkedIn, WhatsApp, Slack). O uso de tags Open Graph garante que o compartilhamento do link gere Rich Cards com metadados precisos e imagens de preview de alta resolução, aumentando a taxa de conversão em processos seletivos.

## 3. Infraestrutura: Vercel e Supabase

### 3.1. Deploy Zero-Config e Edge Network (Vercel)
A aplicação dispensa a criação de esteiras manuais de CI/CD (como arquivos YAML do GitHub Actions). A infraestrutura de entrega utiliza o modelo GitOps nativo da **Vercel**.
* **Fluxo de Entrega:** O repositório está conectado diretamente à Vercel. Ao realizar um `git push` para a branch `main`, a plataforma intercepta o webhook, realiza a validação estática e distribui os assets em sua Edge CDN global em questão de segundos. Isso garante alta disponibilidade, latência mínima e zero esforço de DevOps.

### 3.2. Backend as a Service e Persistência (Supabase)
Para suportar recursos dinâmicos (como métricas de acesso, formulários de contato avançados ou analytics customizado), a arquitetura utiliza o **Supabase** (BaaS construído sobre PostgreSQL).
* **Vantagem:** Permite escalar o portfólio para uma aplicação Full-Stack mantendo a filosofia Serverless do front-end. Toda a persistência e autenticação (quando necessária) é tratada via API REST direta com o banco, protegida por Row Level Security (RLS).

### 3.3. Segurança (Security by Design)
O projeto foi estruturado para ser hospedado em ambientes que suportam HSTS Preloaded (como o domínio .dev). 
* **Segurança de Transporte:** Exigência de HTTPS nativo imposta pela Edge Network da Vercel.
* **Headers de Segurança:** Configuração de Content Security Policy (CSP) restritiva para mitigar vetores de XSS.