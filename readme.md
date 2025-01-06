# XMLSearchJS

Busca em Arquivos XML usando JavaScript

A classe `XMLSearch` permite realizar buscas genéricas em arquivos XML, oferecendo uma maneira flexível e configurável de processar dados. Você pode configurar a estrutura do XML, o mapeamento de campos, e personalizar a exibição e a busca. Ideal para projetos que necessitam extrair informações de arquivos XML e exibir os resultados de forma interativa.

## Funcionalidades

- **Carregamento e processamento de XML**: Carrega o arquivo XML e mapeia os dados conforme configurado.
- **Busca flexível**: Realiza buscas em campos configuráveis com parâmetros definidos na URL.
- **Exibição de resultados**: Exibe os resultados com paginação e destaque do termo de busca.
- **Paginacão**: Suporta paginação automática para exibição de resultados por páginas.
- **Tratamento de erros**: Permite definir ações de tratamento de erros, exibindo mensagens customizadas.

## Como Usar

### 1. Instalação

Clone o repositório ou adicione o arquivo da classe `XMLSearch` ao seu projeto.

```bash
git clone https://github.com/gmasson/XMLSearchJS.git
```

Ou adicione o arquivo `XMLSearch.js` diretamente ao seu projeto.

### 2. Exemplo de Uso

```javascript
const config = {
  itemSelector: "item", // Seletor para os itens no XML
  mapeamentoCampos: {
    titulo: "title",
    descricao: "description"
  },
  camposBusca: ["titulo", "descricao"], // Campos para busca
  camposExibicao: ["titulo", "descricao"], // Campos a exibir
  parametroBusca: "s", // Parâmetro URL de busca
  itensPorPagina: 10, // Resultados por página
  paginacao: true, // Habilitar paginação
  containerResultados: "resultados", // ID do container de resultados
  containerPaginacao: "paginacao", // ID do container de paginação
  containerTotalResultados: "total-resultados", // ID do container de total de resultados
};

const xmlSearch = new XMLSearch('caminho/para/o/arquivo.xml', config);
```

### 3. Configurações

Você pode personalizar o comportamento da busca, exibição e paginação com as seguintes configurações:

- **xmlPath**: Caminho para o arquivo XML a ser carregado.
- **itemSelector**: Seletor (tag ou XPath) para identificar os itens no XML (padrão: `"item"`).
- **mapeamentoCampos**: Mapeamento dos campos do XML para as propriedades do objeto de dados.
- **campoData**: Nome do campo de data (opcional).
- **formatoData**: Formato da data no XML (opcional).
- **camposBusca**: Campos onde a busca será realizada (array de strings).
- **camposExibicao**: Campos a serem exibidos nos resultados (array de strings).
- **parametroBusca**: Parâmetro da URL que define o termo de busca (padrão: `"s"`).
- **itensPorPagina**: Número de itens a exibir por página (padrão: `10`).
- **paginacao**: Habilitar ou desabilitar a paginação (padrão: `false`).
- **ordenacao**: Configuração para ordenação dos resultados (opcional).
- **destacarBusca**: Destacar o termo de busca nos resultados (padrão: `true`).
- **onAntesDaBusca**: Função de callback a ser executada antes da busca (opcional).
- **onDepoisDaBusca**: Função de callback a ser executada após a busca (opcional).
- **onErro**: Função de callback para erros (opcional).
- **templateItem**: Função para personalizar o template de exibição de um item (opcional).
- **templateSemResultados**: Template para exibição quando não há resultados (opcional).
- **templateErro**: Template para exibição de erro (opcional).

### 4. Exemplo de Resultados

A classe irá renderizar os resultados no container configurado (`containerResultados`), com a possibilidade de destacar o termo de busca e exibir a paginação.

#### Exibição de Resultados:

- **Com busca**: Os resultados serão filtrados com base no termo de busca fornecido na URL.
- **Com paginação**: Os resultados serão exibidos por página, com navegação entre elas.
- **Sem resultados**: Caso não haja resultados, a classe exibirá uma mensagem padrão ou customizada.

### 5. Funções de Callback

A classe permite definir funções de callback para ações específicas durante o processo de busca:

- **onAntesDaBusca(termoBusca)**: Executado antes de realizar a busca, com o termo de busca.
- **onDepoisDaBusca(resultados)**: Executado após a busca, com os resultados encontrados.
- **onErro(erro)**: Executado em caso de erro durante o processamento.

### 6. Personalização de Templates

Você pode personalizar os templates de exibição de resultados, sem resultados e erro usando as funções `templateItem`, `templateSemResultados` e `templateErro`. 

## Exemplo de Estrutura XML

Exemplo de um arquivo XML esperado para ser processado pela classe:

```xml
<root>
  <item>
    <title>Produto 1</title>
    <description>Descrição do Produto 1</description>
  </item>
  <item>
    <title>Produto 2</title>
    <description>Descrição do Produto 2</description>
  </item>
</root>
```

## Contribuindo

1. Faça um fork do repositório.
2. Crie uma nova branch (`git checkout -b minha-branch`).
3. Faça as alterações necessárias e envie um pull request.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
