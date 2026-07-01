import type {
  CreateEntradaPayload,
  CreateSaidaPayload,
  GestioMovimentacaoEntrada,
  GestioMovimentacaoSaida,
  GestioProjeto,
  GestioRequisicaoCompra,
} from "@/types/gestio-extended";
import type {
  GestioAlmoxarifado,
  GestioApiResponse,
  GestioAuthResponse,
  GestioCategoria,
  GestioFilial,
  GestioGrupo,
  GestioProduto,
  GestioSaldoEstoque,
  GestioSecao,
  GestioTipo,
} from "@/types/gestio";

const GESTIO_API_BASE =
  process.env.GESTIO_API_BASE_URL ?? "https://api.otkweb.com.br";

export class GestioClient {
  private token: string | null = null;

  constructor(
    private readonly email: string,
    private readonly password: string,
  ) {}

  async authenticate(): Promise<string> {
    const response = await fetch(`${GESTIO_API_BASE}/v2/autenticar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.email,
        password: this.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gestio auth failed: ${response.status}`);
    }

    const data = (await response.json()) as GestioAuthResponse;
    if (!data.authenticated || !data.accessToken) {
      throw new Error("Gestio authentication rejected");
    }

    this.token = data.accessToken;
    return data.accessToken;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.token) {
      await this.authenticate();
    }

    const response = await fetch(`${GESTIO_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (response.status === 401) {
      await this.authenticate();
      return this.request<T>(path, init);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gestio API ${path}: ${response.status} — ${body}`);
    }

    return response.json() as Promise<T>;
  }

  private async getData<T>(path: string): Promise<T> {
    const result = await this.request<GestioApiResponse<T> | T>(path);
    if (result && typeof result === "object" && "data" in result) {
      return (result as GestioApiResponse<T>).data;
    }
    return result as T;
  }

  getFiliais(): Promise<GestioFilial[]> {
    return this.getData<GestioFilial[]>("/v2/filial");
  }

  getCategorias(): Promise<GestioCategoria[]> {
    return this.getData<GestioCategoria[]>("/v2/categoria-de-produto");
  }

  getGrupos(): Promise<GestioGrupo[]> {
    return this.getData<GestioGrupo[]>("/v2/grupo-de-produto");
  }

  getTipos(): Promise<GestioTipo[]> {
    return this.getData<GestioTipo[]>("/v2/tipo-de-produto");
  }

  getProdutos(): Promise<GestioProduto[]> {
    return this.getData<GestioProduto[]>("/v2/produto");
  }

  getAlmoxarifados(codigoDaFilial: number): Promise<GestioAlmoxarifado[]> {
    return this.getData<GestioAlmoxarifado[]>(
      `/v2/estoque/almoxarifado?codigoDaFilial=${codigoDaFilial}`,
    );
  }

  getSecoes(codigoDaFilial: number): Promise<GestioSecao[]> {
    return this.getData<GestioSecao[]>(
      `/v2/estoque/secao?codigoDaFilial=${codigoDaFilial}`,
    );
  }

  getSaldosPorFilial(codigoDaFilial: number): Promise<GestioSaldoEstoque[]> {
    return this.getData<GestioSaldoEstoque[]>(
      `/v2/estoque/filial/${codigoDaFilial}`,
    );
  }

  getTodosSaldos(): Promise<GestioSaldoEstoque[]> {
    return this.getData<GestioSaldoEstoque[]>("/v2/estoque");
  }

  async updateProduto(produto: GestioProduto): Promise<GestioProduto> {
    return this.request<GestioProduto>("/v2/produto", {
      method: "PUT",
      body: JSON.stringify(produto),
    });
  }

  getProjetos(): Promise<GestioProjeto[]> {
    return this.getData<GestioProjeto[]>("/v2/projeto");
  }

  getEntradas(): Promise<GestioMovimentacaoEntrada[]> {
    return this.getData<GestioMovimentacaoEntrada[]>("/v2/estoque/entrada");
  }

  getSaidas(): Promise<GestioMovimentacaoSaida[]> {
    return this.getData<GestioMovimentacaoSaida[]>("/v2/estoque/saida");
  }

  getMovimentacoesProduto(idProd: number): Promise<unknown[]> {
    return this.getData<unknown[]>(`/v2/estoque/movimentacoes/produto/${idProd}`);
  }

  getRequisicoesCompraAbertas(): Promise<GestioRequisicaoCompra[]> {
    return this.getData<GestioRequisicaoCompra[]>("/v2/compras/requisicao/abertas");
  }

  getRequisicoesCompraEncerradas(): Promise<GestioRequisicaoCompra[]> {
    return this.getData<GestioRequisicaoCompra[]>(
      "/v2/compras/requisicao/encerradas",
    );
  }

  createEntrada(payload: CreateEntradaPayload): Promise<GestioMovimentacaoEntrada> {
    return this.request<GestioMovimentacaoEntrada>("/v2/estoque/entrada", {
      method: "POST",
      body: JSON.stringify({
        codigoDaFilial: payload.codigoDaFilial,
        codigoDoAlmoxarifado: payload.codigoDoAlmoxarifado,
        idProd: payload.idProd,
        quantidade: payload.quantidade,
        codigoDaSecao: payload.codigoDaSecao ?? "1",
        codigoDoProjeto: payload.codigoDoProjeto ?? 0,
        observacao: payload.observacao ?? "SteelMind — entrada",
      }),
    });
  }

  createSaida(payload: CreateSaidaPayload): Promise<GestioMovimentacaoSaida> {
    return this.request<GestioMovimentacaoSaida>("/v2/estoque/saida", {
      method: "POST",
      body: JSON.stringify({
        codigoDaFilial: payload.codigoDaFilial,
        codigoDoAlmoxarifado: payload.codigoDoAlmoxarifado,
        idProd: payload.idProd,
        quantidade: payload.quantidade,
        codigoDaSecao: payload.codigoDaSecao ?? "1",
        codigoDoProjeto: payload.codigoDoProjeto ?? 0,
        observacao: payload.observacao ?? "SteelMind — saída",
      }),
    });
  }
}

export function createGestioClient(): GestioClient {
  const email = process.env.GESTIO_EMAIL;
  const password = process.env.GESTIO_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "GESTIO_EMAIL and GESTIO_PASSWORD must be set in environment",
    );
  }

  return new GestioClient(email, password);
}
