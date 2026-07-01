export interface GestioProjeto {
  codigoDoProjeto: number;
  descricaoDoProjeto: string;
  seuCodigo: string | null;
  ativo: boolean;
}

export interface GestioMovimentacaoEntrada {
  numeroDaEntrada: number;
  seq: number;
  codigoDaFilial: number;
  descricaoDaFilial: string;
  codigoDoAlmoxarifado: number;
  idProd: number;
  codigoInterno: string | null;
  descricaoDoProduto: string | null;
  quantidade: number;
  dataDaEntrada?: string;
  codigoDoProjeto?: number | null;
  observacao?: string | null;
}

export interface GestioMovimentacaoSaida {
  numeroDaSaida: number;
  seq: number;
  codigoDaFilial: number;
  idProd: number;
  codigoInterno: string | null;
  descricaoDoProduto: string | null;
  quantidade: number;
  dataDaSaida?: string;
  codigoDoProjeto?: number | null;
  observacao?: string | null;
}

export interface GestioRequisicaoCompra {
  numeroDaRequisicao: number;
  dataDaRequisicao: string;
  descricaoDaRequisicao: string | null;
  codigoDaFilial: number | null;
  codigoDoProjeto: number | null;
  descricaoDoProjeto: string | null;
  pendente: boolean;
  observacao: string | null;
}

export interface CreateEntradaPayload {
  codigoDaFilial: number;
  codigoDoAlmoxarifado: number;
  idProd: number;
  quantidade: number;
  codigoDaSecao?: string;
  codigoDoProjeto?: number;
  observacao?: string;
}

export interface CreateSaidaPayload {
  codigoDaFilial: number;
  codigoDoAlmoxarifado: number;
  idProd: number;
  quantidade: number;
  codigoDaSecao?: string;
  codigoDoProjeto?: number;
  observacao?: string;
}
