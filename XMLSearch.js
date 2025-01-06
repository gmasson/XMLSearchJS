/**
 * Classe XMLSearch - Busca genérica em arquivos XML
 * Permite configurar a estrutura do XML e como os dados devem ser processados
 */
class XMLSearch {
	/**
	 * @param {string} xmlPath - Caminho para o arquivo XML
	 * @param {Object} config - Configurações da busca
	 */
	constructor(xmlPath, config = {}) {
		// Caminho do arquivo XML
		this.xmlPath = xmlPath;

		// Configurações padrão mescladas com as configurações fornecidas
		this.config = {
			// Estrutura do XML
			itemSelector: config.itemSelector || "item", // Seletor XPath ou tag para os itens
			mapeamentoCampos: config.mapeamentoCampos || {  // Como mapear campos do XML para o objeto de dados
				// Exemplo: { titulo: "title", descricao: "description" }
			},
			campoData: config.campoData, // Campo que contém a data (opcional)
			formatoData: config.formatoData, // Formato da data no XML (opcional)

			// Configurações de busca
			camposBusca: config.camposBusca || [], // Campos onde realizar a busca
			camposExibicao: config.camposExibicao || [], // Campos a serem exibidos
			parametroBusca: config.parametroBusca || "s", // Parâmetro URL para busca

			// Configurações de exibição
			itensPorPagina: config.itensPorPagina || 10,
			paginacao: config.paginacao || false,
			ordenacao: config.ordenacao || null, // { campo, direcao }
			destacarBusca: config.destacarBusca || true,
			
			// IDs dos containers
			containerResultados: config.containerResultados || "resultados",
			containerPaginacao: config.containerPaginacao || "paginacao",
			containerTotalResultados: config.containerTotalResultados || "total-resultados",

			// Funções de callback personalizadas
			onAntesDaBusca: config.onAntesDaBusca || null,
			onDepoisDaBusca: config.onDepoisDaBusca || null,
			onErro: config.onErro || null,

			// Templates personalizados
			templateItem: config.templateItem || null,
			templateSemResultados: config.templateSemResultados || null,
			templateErro: config.templateErro || null
		};

		// Estado interno
		this.dados = [];
		this.resultados = [];
		this.paginaAtual = 1;
		this.termoBuscaAtual = '';

		// Inicialização
		this._init();
	}

	/**
	 * Inicializa o sistema
	 */
	async _init() {
		try {
			await this.carregarXML();
			this.aplicarFiltrosURL();
			this.atualizarResultados();
			this.exibirTotalResultados();
			this.exibirResultados();
			if (this.config.paginacao) {
				this.exibirPaginacao();
			}
		} catch (erro) {
			this.tratarErro(erro);
		}
	}

	/**
	 * Carrega e processa o arquivo XML
	 */
	async carregarXML() {
		try {
			const resposta = await fetch(this.xmlPath);
			if (!resposta.ok) throw new Error("Erro ao carregar o XML");
			
			const textoXML = await resposta.text();
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(textoXML, "application/xml");

			// Extrai os itens usando o seletor configurado
			const itens = Array.from(xmlDoc.getElementsByTagName(this.config.itemSelector));
			
			// Mapeia os itens para objetos usando o mapeamento configurado
			this.dados = itens.map(item => {
				const obj = {};
				
				// Processa cada campo configurado no mapeamento
				Object.entries(this.config.mapeamentoCampos).forEach(([chave, valor]) => {
					const elemento = item.getElementsByTagName(valor)[0];
					obj[chave] = elemento ? elemento.textContent : "";
				});

				// Processa campo de data se configurado
				if (this.config.campoData && this.config.mapeamentoCampos[this.config.campoData]) {
					const dataElemento = item.getElementsByTagName(
						this.config.mapeamentoCampos[this.config.campoData]
					)[0];
					
					if (dataElemento) {
						obj[this.config.campoData] = this.processarData(dataElemento.textContent);
					}
				}

				return obj;
			});
		} catch (erro) {
			this.tratarErro(erro);
		}
	}

	/**
	 * Processa uma string de data no formato configurado
	 * @param {string} dataString - String contendo a data
	 * @returns {Date} Objeto Date processado
	 */
	processarData(dataString) {
		if (!dataString) return null;
		
		try {
			if (this.config.formatoData) {
				// Aqui pode-se implementar um parser de data customizado
				// baseado no formato configurado
				return new Date(dataString);
			}
			return new Date(dataString);
		} catch (erro) {
			console.warn("Erro ao processar data:", erro);
			return null;
		}
	}

	/**
	 * Aplica filtros baseados nos parâmetros da URL
	 */
	aplicarFiltrosURL() {
		const params = new URLSearchParams(window.location.search);
		const termoBusca = params.get(this.config.parametroBusca);

		if (termoBusca) {
			// Sanitiza o termo de busca diretamente, escapando caracteres especiais
			this.termoBuscaAtual = termoBusca.replace(/[<>"'&]/g, function (match) {
				const mapaDeCaracteres = {
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#39;',
					'&': '&amp;',
				};
				return mapaDeCaracteres[match];
			});

			// Executa callback se configurado
			if (this.config.onAntesDaBusca) {
				this.config.onAntesDaBusca(this.termoBuscaAtual);
			}
		}
	}

	/**
	 * Atualiza a lista de resultados aplicando filtros e ordenação
	 */
	atualizarResultados() {
		let resultados = [...this.dados];

		// Aplica filtro de busca
		if (this.termoBuscaAtual) {
			resultados = resultados.filter(item => 
				this.config.camposBusca.some(campo => 
					item[campo] && item[campo].toLowerCase().includes(this.termoBuscaAtual.toLowerCase())
				)
			);
		}

		// Aplica ordenação se configurada
		if (this.config.ordenacao) {
			const { campo, direcao } = this.config.ordenacao;
			resultados.sort((a, b) => {
				const valA = String(a[campo] || '').toLowerCase();
				const valB = String(b[campo] || '').toLowerCase();
				return direcao === 'asc' ? 
					valA.localeCompare(valB) : 
					valB.localeCompare(valA);
			});
		}

		this.resultados = resultados;

		// Executa callback se configurado
		if (this.config.onDepoisDaBusca) {
			this.config.onDepoisDaBusca(this.resultados);
		}
	}

	/**
	 * Exibe os resultados usando template configurado ou padrão
	 */
	exibirResultados() {
		const container = document.getElementById(this.config.containerResultados);
		if (!container) return;

		container.innerHTML = "";

		// Calcula intervalo para paginação
		const inicio = (this.paginaAtual - 1) * this.config.itensPorPagina;
		const fim = this.paginaAtual * this.config.itensPorPagina;
		const itens = this.config.paginacao ? this.resultados.slice(inicio, fim) : this.resultados;

		// Sem resultados
		if (itens.length === 0) {
			container.innerHTML = this.config.templateSemResultados ?
				this.config.templateSemResultados(this.termoBuscaAtual) :
				this.templateSemResultadosPadrao();
			return;
		}

		// Cria lista de resultados
		const resultadosDiv = document.createElement('div');

		// Processa cada item
		itens.forEach(item => {
			const itemHTML = this.config.templateItem ?
				this.config.templateItem(item, this.termoBuscaAtual) :
				this.template(item);

			const itemDiv = document.createElement('div');
			itemDiv.innerHTML = itemHTML;
			resultadosDiv.appendChild(itemDiv);
		});

		container.appendChild(resultadosDiv);
	}

	/**
	 * Template padrão
	 */
	template(item) {
		let html = '';
		
		this.config.camposExibicao.forEach(campo => {
			if (item[campo]) {
				html += `<p><strong>${campo}:</strong> ${this.destacarTexto(item[campo], this.termoBuscaAtual)}</p>`;
			}
		});

		return html;
	}

	/**
	 * Template padrão para sem resultados
	 */
	templateSemResultadosPadrao() {
		return `<div class="alert alert-info">
			Nenhum resultado encontrado${this.termoBuscaAtual ? ` para "${this.termoBuscaAtual}"` : ''}.
		</div>`;
	}

	/**
	 * Destaca termo buscado no texto
	 */
	destacarTexto(texto, termo) {
		if (!this.config.destacarBusca || !termo) return texto;
		const regex = new RegExp(`(${termo})`, 'gi');
		return texto.replace(regex, '<mark>$1</mark>');
	}

	/**
	 * Trata erros ocorridos durante o processamento
	 */
	tratarErro(erro) {
		console.error("Erro:", erro);
		
		if (this.config.onErro) {
			this.config.onErro(erro);
		}

		const container = document.getElementById(this.config.containerResultados);
		if (container) {
			container.innerHTML = this.config.templateErro ?
				this.config.templateErro(erro) :
				`<div class="alert alert-danger">Erro ao processar dados: ${erro.message}</div>`;
		}
	}

	/**
	 * Exibe mensagem de erro no container de resultados
	 * @param {string} mensagem - Mensagem de erro
	 */
	exibirErro(mensagem) {
		const container = document.getElementById(this.config.containerResultados);
		if (container) {
			container.innerHTML = `<div class="alert alert-danger" role="alert">${mensagem}</div>`;
		}
	}

	/**
	 * Exibe a paginação no DOM
	 */
	exibirPaginacao() {
		const container = document.getElementById(this.config.containerPaginacao);
		if (!container) return;

		container.innerHTML = "";

		const totalPaginas = Math.ceil(this.resultados.length / this.config.itensPorPagina);
		if (totalPaginas <= 1) return;

		// Cria elementos de navegação
		const nav = document.createElement('nav');
		const ul = document.createElement('ul');
		ul.className = 'pagination justify-content-center';

		// Botão "Anterior"
		const liAnterior = document.createElement('li');
		liAnterior.className = `page-item ${this.paginaAtual === 1 ? 'disabled' : ''}`;
		liAnterior.innerHTML = `<button class="page-link">Anterior</button>`;
		liAnterior.addEventListener('click', () => {
			if (this.paginaAtual > 1) {
				this.paginaAtual--;
				this.exibirResultados();
				this.exibirPaginacao();
			}
		});
		ul.appendChild(liAnterior);

		// Botões de página
		for (let i = 1; i <= totalPaginas; i++) {
			const li = document.createElement('li');
			li.className = `page-item ${i === this.paginaAtual ? 'active' : ''}`;
			li.innerHTML = `<button class="page-link">${i}</button>`;
			li.addEventListener('click', () => {
				this.paginaAtual = i;
				this.exibirResultados();
				this.exibirPaginacao();
			});
			ul.appendChild(li);
		}

		// Botão "Próximo"
		const liProximo = document.createElement('li');
		liProximo.className = `page-item ${this.paginaAtual === totalPaginas ? 'disabled' : ''}`;
		liProximo.innerHTML = `<button class="page-link">Próximo</button>`;
		liProximo.addEventListener('click', () => {
			if (this.paginaAtual < totalPaginas) {
				this.paginaAtual++;
				this.exibirResultados();
				this.exibirPaginacao();
			}
		});
		ul.appendChild(liProximo);

		nav.appendChild(ul);
		container.appendChild(nav);
	}

	/**
	 * Exibe o total de resultados encontrados
	 */
	exibirTotalResultados() {
		const container = document.getElementById(this.config.containerTotalResultados);
		if (!container) return;

		container.innerHTML = `${this.resultados.length}`;
	}
}