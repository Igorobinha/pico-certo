/* Regiões e picos do Pico Certo.
 *
 * Cada região agrupa os picos de uma mesma praia ou cidade. Em cada pico:
 *   facing = para onde a praia "olha" (a direção do mar, vista da areia), em graus:
 *            0 = norte, 90 = leste, 135 = sudeste, 180 = sul, 270 = oeste.
 *            É com isso que o app decide se o vento é terral ou maral e se a ondulação entra de frente.
 *   aproximado: true = posição estimada. No app, o botão "Estou no pico: salvar posição" corrige.
 *   acesso: [lat, lon] (opcional) = onde estacionar, se for longe do pico. A rota leva até lá.
 *   ficha (opcional) = o que o surfista local sabe do pico. Tudo dentro dela é opcional:
 *     fundo:     'areia' | 'coral' | 'pedra' | 'areia e pedra'
 *     mare:      'cheia' | 'seca' | 'meia' | 'enchendo' | 'vazando' | 'qualquer'   (a nota cai fora dessa maré)
 *     ondulacao: ['S', 'SE']   melhores direções da ondulação: N, NE, L, SE, S, SO, O, NO (a nota cai com as outras)
 *     nivel:     'iniciante' | 'intermediario' | 'avancado'   (o app avisa quem tem nível abaixo)
 *     perigos:   'Pedras no canto esquerdo, corrente forte na vazante'
 *     estrutura: 'Estacionamento na orla, ducha, quiosques'
 *     dica:      'Funciona melhor de manhã com terral'
 */
window.REGIOES = [
  // Espírito Santo, de norte a sul
  { id: 'itaunas', nome: 'Itaúnas', cidade: 'Conceição da Barra, ES', picos: [
    { id: 'itaunas', nome: 'Itaúnas', lat: -18.430, lon: -39.700, facing: 85 },
  ] },
  { id: 'guriri', nome: 'Guriri', cidade: 'São Mateus, ES', picos: [
    { id: 'guriri', nome: 'Guriri', lat: -18.730, lon: -39.740, facing: 90 },
  ] },
  { id: 'regencia', nome: 'Regência', cidade: 'Linhares, ES', picos: [
    { id: 'regencia', nome: 'Regência', lat: -19.660, lon: -39.830, facing: 125 },
  ] },
  { id: 'aracruz', nome: 'Aracruz', cidade: 'Aracruz, ES', picos: [
    { id: 'barra-do-sahy', nome: 'Barra do Sahy', lat: -19.880, lon: -40.080, facing: 115 },
  ] },
  { id: 'nova-almeida', nome: 'Nova Almeida', cidade: 'Serra, ES', picos: [
    { id: 'nova-almeida', nome: 'Nova Almeida', lat: -20.050, lon: -40.190, facing: 100 },
  ] },
  { id: 'jacaraipe', nome: 'Jacaraípe', cidade: 'Serra, ES', picos: [
    { id: 'coral-de-castelandia', nome: 'Coral de Castelândia', lat: -20.128, lon: -40.180, facing: 95, aproximado: true,
      ficha: { fundo: 'coral' } },
    { id: 'curva-da-baleia',      nome: 'Curva da Baleia',      lat: -20.138, lon: -40.182, facing: 95, aproximado: true },
    { id: 'jeffreys-bay',         nome: 'Jeffreys Bay',         lat: -20.145, lon: -40.184, facing: 95, aproximado: true },
    { id: 'barrote',              nome: 'Barrote',              lat: -20.150, lon: -40.185, facing: 95, aproximado: true },
    { id: 'coral-do-cha',         nome: 'Coral do Chá',         lat: -20.157, lon: -40.187, facing: 95, aproximado: true,
      ficha: { fundo: 'coral' } },
    { id: 'solemar',              nome: 'Solemar',              lat: -20.168, lon: -40.190, facing: 95, aproximado: true },
  ] },
  { id: 'manguinhos', nome: 'Manguinhos', cidade: 'Serra, ES', picos: [
    { id: 'manguinhos', nome: 'Manguinhos', lat: -20.190, lon: -40.190, facing: 95 },
  ] },
  { id: 'vila-velha', nome: 'Vila Velha', cidade: 'Vila Velha, ES', picos: [
    { id: 'praia-da-costa', nome: 'Praia da Costa', lat: -20.340, lon: -40.280, facing: 110 },
    { id: 'itapua',         nome: 'Itapuã',         lat: -20.370, lon: -40.290, facing: 112 },
    { id: 'barra-do-jucu',  nome: 'Barra do Jucu',  lat: -20.430, lon: -40.320, facing: 115 },
    { id: 'ponta-da-fruta', nome: 'Ponta da Fruta', lat: -20.520, lon: -40.360, facing: 120 },
  ] },
  { id: 'guarapari', nome: 'Guarapari', cidade: 'Guarapari, ES', picos: [
    { id: 'setiba',         nome: 'Setiba',         lat: -20.630, lon: -40.430, facing: 125 },
    { id: 'praia-do-morro', nome: 'Praia do Morro', lat: -20.650, lon: -40.490, facing: 120 },
    { id: 'meaipe',         nome: 'Meaípe',         lat: -20.740, lon: -40.540, facing: 135 },
  ] },
  { id: 'anchieta', nome: 'Anchieta', cidade: 'Anchieta, ES', picos: [
    { id: 'ubu', nome: 'Ubu', lat: -20.800, lon: -40.590, facing: 140 },
  ] },
  { id: 'marataizes', nome: 'Marataízes', cidade: 'Marataízes, ES', picos: [
    { id: 'marataizes', nome: 'Marataízes', lat: -21.040, lon: -40.830, facing: 135 },
  ] },

  // Bahia e Nordeste
  { id: 'itacare', nome: 'Itacaré', cidade: 'Itacaré, BA', picos: [
    { id: 'tiririca', nome: 'Tiririca', lat: -14.280, lon: -38.990, facing: 100 },
  ] },
  { id: 'salvador', nome: 'Salvador', cidade: 'Salvador, BA', picos: [
    { id: 'stella-maris', nome: 'Stella Maris', lat: -12.940, lon: -38.330, facing: 125 },
  ] },
  { id: 'ipojuca', nome: 'Ipojuca', cidade: 'Ipojuca, PE', picos: [
    { id: 'maracaipe', nome: 'Maracaípe', lat: -8.530, lon: -35.010, facing: 105 },
  ] },
  { id: 'pipa', nome: 'Pipa', cidade: 'Tibau do Sul, RN', picos: [
    { id: 'pipa', nome: 'Praia do Amor', lat: -6.230, lon: -35.050, facing: 80 },
  ] },
  { id: 'taiba', nome: 'Taíba', cidade: 'São Gonçalo do Amarante, CE', picos: [
    { id: 'taiba', nome: 'Taíba', lat: -3.510, lon: -38.900, facing: 20 },
  ] },
  { id: 'noronha', nome: 'Fernando de Noronha', cidade: 'Fernando de Noronha, PE', picos: [
    { id: 'cacimba', nome: 'Cacimba do Padre', lat: -3.840, lon: -32.440, facing: 320 },
  ] },

  // Rio de Janeiro
  { id: 'saquarema', nome: 'Saquarema', cidade: 'Saquarema, RJ', picos: [
    { id: 'itauna', nome: 'Itaúna', lat: -22.930, lon: -42.490, facing: 165 },
  ] },
  { id: 'buzios', nome: 'Búzios', cidade: 'Armação dos Búzios, RJ', picos: [
    { id: 'geriba', nome: 'Geribá', lat: -22.780, lon: -41.910, facing: 160 },
  ] },
  { id: 'niteroi', nome: 'Niterói', cidade: 'Niterói, RJ', picos: [
    { id: 'itacoatiara', nome: 'Itacoatiara', lat: -22.975, lon: -43.030, facing: 175 },
  ] },
  { id: 'rio', nome: 'Rio de Janeiro', cidade: 'Rio de Janeiro, RJ', picos: [
    { id: 'arpoador',     nome: 'Arpoador',        lat: -22.989, lon: -43.192, facing: 180 },
    { id: 'barra-tijuca', nome: 'Barra da Tijuca', lat: -23.012, lon: -43.360, facing: 175 },
    { id: 'prainha',      nome: 'Prainha',         lat: -23.041, lon: -43.506, facing: 180 },
  ] },

  // São Paulo
  { id: 'ubatuba', nome: 'Ubatuba', cidade: 'Ubatuba, SP', picos: [
    { id: 'itamambuca', nome: 'Itamambuca', lat: -23.400, lon: -45.010, facing: 125 },
  ] },
  { id: 'sao-sebastiao', nome: 'São Sebastião', cidade: 'São Sebastião, SP', picos: [
    { id: 'maresias', nome: 'Maresias', lat: -23.790, lon: -45.560, facing: 185 },
  ] },
  { id: 'guaruja', nome: 'Guarujá', cidade: 'Guarujá, SP', picos: [
    { id: 'pitangueiras', nome: 'Pitangueiras', lat: -24.000, lon: -46.260, facing: 170 },
  ] },

  // Sul
  { id: 'matinhos', nome: 'Matinhos', cidade: 'Matinhos, PR', picos: [
    { id: 'matinhos', nome: 'Matinhos', lat: -25.820, lon: -48.530, facing: 100 },
  ] },
  { id: 'florianopolis', nome: 'Florianópolis', cidade: 'Florianópolis, SC', picos: [
    { id: 'praia-mole-sc', nome: 'Praia Mole', lat: -27.600, lon: -48.430, facing: 95 },
    { id: 'joaquina',      nome: 'Joaquina',   lat: -27.630, lon: -48.450, facing: 95 },
  ] },
  { id: 'guarda', nome: 'Guarda do Embaú', cidade: 'Palhoça, SC', picos: [
    { id: 'guarda', nome: 'Guarda do Embaú', lat: -27.900, lon: -48.590, facing: 100 },
  ] },
  { id: 'garopaba', nome: 'Garopaba', cidade: 'Garopaba, SC', picos: [
    { id: 'silveira', nome: 'Silveira', lat: -28.030, lon: -48.610, facing: 105 },
  ] },
  { id: 'imbituba', nome: 'Imbituba', cidade: 'Imbituba, SC', picos: [
    { id: 'praia-da-vila', nome: 'Praia da Vila', lat: -28.230, lon: -48.650, facing: 115 },
  ] },
  { id: 'torres', nome: 'Torres', cidade: 'Torres, RS', picos: [
    { id: 'torres', nome: 'Prainha', lat: -29.340, lon: -49.720, facing: 115 },
  ] },
];
