export interface GestioApiResponse<T> {
  success: boolean;
  data: T;
}

export interface GestioAuthResponse {
  authenticated: boolean;
  accessToken: string;
  expiration: string;
  created: string;
}

export interface GestioFilial {
  codigoDaFilial: number;
  descricaoDaFilial: string;
  nomeFantasia: string;
  cnpj: string;
  ativo: boolean;
}

export interface GestioCategoria {
  codigoDaCategoriaDeProduto: number;
  descricaoDaCategoriaDeProduto: string;
}

export interface GestioGrupo {
  codigoDoGrupoDeProduto: string;
  descricaoDoGrupoDeProduto: string;
}

export interface GestioTipo {
  codigoDoTipoDeProduto: number;
  descricaoDoTipoDeProduto: string;
}

export interface GestioProduto {
  idProd: number;
  codigoInterno: string | null;
  codigoDeBarras: string | null;
  codigoDoTipoDeProduto: number | null;
  codigoDoGrupoDeProduto: string | null;
  codigoDaCategoriaDeProduto: number | null;
  descricaoDoProduto: string | null;
  complemento: string | null;
  marca: string | null;
  simboloDaUnidadeDeMedida: string | null;
  estoqueMinimo: number | null;
  estoqueMaximo: number | null;
  quantidadeEmEstoque: number | null;
  ncm: string | null;
  controleDeEstoque: boolean;
  ativo: boolean;
}

export interface GestioAlmoxarifado {
  codigoDaFilial: number;
  descricaoDaFilial: string;
  codigoDoAlmoxarifado: number;
  descricaoDoAlmoxarifado: string;
  ativo: boolean;
}

export interface GestioSecao {
  codigoDaSecao: string;
  descricaoDaSecao: string;
  codigoDaFilial: number | null;
  codigoDoAlmoxarifado: number | null;
  ativo: boolean;
}

export interface GestioSaldoEstoque {
  codigoDaFilial: number;
  descricaoDaFilial: string;
  codigoDoAlmoxarifado: number;
  descricaoDoAlmoxarifado: string;
  idProd: number;
  descricaoDoProduto: string;
  quantidadeTotal: number;
  valorTotal: number;
  codigoDoProjeto: number;
  descricaoDoProjeto: string | null;
}

export interface GestioSyncSnapshot {
  syncedAt: string;
  empresa: string;
  filiais: GestioFilial[];
  categorias: GestioCategoria[];
  grupos: GestioGrupo[];
  tipos: GestioTipo[];
  almoxarifados: GestioAlmoxarifado[];
  produtos: GestioProduto[];
  saldos: GestioSaldoEstoque[];
  stats: GestioSyncStats;
}

export interface GestioSyncStats {
  totalProdutos: number;
  produtosClassificados: number;
  produtosSemClassificacao: number;
  saldosComQuantidade: number;
  filiais: number;
}

export interface ProductClassification {
  codigoDoGrupoDeProduto: string;
  codigoDaCategoriaDeProduto: number;
  codigoDoTipoDeProduto: number;
  material: string;
  categoria: string;
  tipo: string;
  source: "code" | "description" | "existing";
}
