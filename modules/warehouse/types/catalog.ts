export interface CatalogDirectoryNode {
  material: string;
  grupoCode: string;
  totalProdutos: number;
  categorias: Array<{
    categoria: string;
    categoryId: number;
    count: number;
    produtos: Array<{
      idProd: number;
      codigo: string | null;
      descricao: string | null;
      saldoPorFilial: Record<number, number>;
    }>;
  }>;
}

export interface WarehouseCatalogResponse {
  syncedAt: string;
  stats: {
    totalProdutos: number;
    produtosClassificados: number;
    produtosSemClassificacao: number;
    saldosComQuantidade: number;
    filiais: number;
  };
  filiais: Array<{
    codigoDaFilial: number;
    descricaoDaFilial: string;
    nomeFantasia: string;
  }>;
  directory: CatalogDirectoryNode[];
}
