/**
 * Define o contrato de um item que pode receber promoção.
 * Toda classe que implementar esta interface precisa informar
 * quanto será abatido do preço por meio de um cupom.
 */
public interface Promocional {
    double aplicarCupom();
}
