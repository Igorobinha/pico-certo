# Pico Certo

App de previsão de surf que funciona no navegador do celular e pode ser instalado na tela inicial.
Com a localização da pessoa, ele:

- acha os picos perto dela (lista em `picos.js`);
- baixa ondulação, vento, chuva e maré dos próximos 7 dias;
- dá uma nota de 0 a 10 pra cada hora de cada pico e mostra o melhor pico e o melhor horário;
- desconta o tempo de estrada e mostra o gasto de gasolina, pra dizer se vale a viagem;
- mostra o mapa com a rota até o pico, o passo a passo e um modo de navegação com voz,
  tudo dentro do app.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | A tela e o visual |
| `app.js` | A lógica: busca de dados, nota, mapa e navegação |
| `picos.js` | A lista de picos. Dá pra editar e acrescentar |
| `manifest.webmanifest`, `sw.js`, `icon-*.png`, `icon.svg` | O que faz ele virar "app" no celular |

## Testar no computador

Dentro da pasta `pico-certo`:

```bash
python -m http.server 8765
```

Abra `http://localhost:8765`. Pra testar sem GPS, passe a posição no endereço:
`http://localhost:8765/?lat=-20.264&lon=-40.417&nome=Cariacica`

## Colocar no ar e usar no celular

O GPS do celular só funciona em site com **https**. O jeito mais fácil:

1. Crie uma conta grátis na Netlify e abra `app.netlify.com/drop`.
2. Arraste a pasta `pico-certo` inteira pra página.
3. Ela gera um endereço tipo `https://nome-qualquer.netlify.app`.

GitHub Pages, Cloudflare Pages e Vercel também servem.

**Instalar no celular:**
- Android (Chrome): abra o endereço, toque no menu ⋮ e depois em "Instalar app" ou "Adicionar à tela inicial".
- iPhone (Safari): toque em Compartilhar e depois em "Adicionar à Tela de Início".

## Instalador Android (.apk)

A pasta `pico-certo-android` gera o `pico-certo.apk`, com este app dentro. O GPS, a voz da
navegação e a tela acesa usam os recursos nativos do Android. Depois de mudar qualquer arquivo
desta pasta, gere uma versão nova (aumente o número a cada vez, senão o celular não atualiza):

```bash
powershell -ExecutionPolicy Bypass -File ..\pico-certo-android\construir.ps1 -Versao 2
```

As ferramentas (Java 17 e o kit Android) ficam em `%LOCALAPPDATA%\PicoCertoBuild`. A chave que
assina o app é `pico-certo-android\chave-pico-certo.jks`. Guarde essa chave, porque uma versão nova
só instala por cima da antiga se for assinada com ela. Pra Play Store, crie uma chave própria com senha forte.

## Atualização automática

O app fica publicado no GitHub Pages, e o instalador Android abre esse site. Pra mandar uma
mudança pra todo mundo, rode na pasta acima desta:

```bash
powershell -ExecutionPolicy Bypass -File publicar.ps1 -Mensagem "O que mudou"
```

Quem abrir o app depois disso já vê a versão nova, sem baixar nada. Só é preciso gerar e
instalar um .apk novo quando mudar a parte Android (`pico-certo-android`), o que é raro.

## Editar os picos

`picos.js` é organizado por **região** (por exemplo Jacaraípe), e cada região tem seus **picos**
(Solemar, Barrote, Coral do Chá…). No app, a categoria Picos mostra as regiões perto da pessoa e,
ao tocar numa região, os picos dela. Pra criar uma região, copie um bloco `{ id, nome, cidade, picos: [...] }`.

Cada pico tem nome, coordenadas e `facing`, que é para onde a praia
olha: 90 = leste, 135 = sudeste, 180 = sul. Pico com `aproximado: true` aparece como
"posição aproximada" até alguém salvar a posição certa na areia (botão "Estou no pico: salvar posição"). O `facing` é o mais importante. É com ele que o
app sabe se o vento é terral ou maral e se a ondulação entra de frente. As coordenadas e direções
que estão lá são aproximadas.

Também dá pra salvar um pico pelo próprio app (em "Ajustes e seus picos"), estando na areia.

Se a entrada da praia (estacionamento) for longe do ponto do pico, acrescente
`acesso: [lat, lon]` no pico pra rota levar até lá.

## Como a nota é calculada

1. **Tamanho na praia:** a altura e o período do mar aberto viram uma estimativa da onda na
   arrebentação, descontando a parte da ondulação que não entra de frente na praia.
2. **Tamanho certo pro nível:** iniciante, intermediário e avançado têm faixas ideais diferentes.
3. **Vento:** terral ou sem vento conta a favor. Maral e lateral tiram pontos conforme a força,
   e as rajadas também contam.
4. **Período:** ondulação de período longo vale mais que mar de vento.
5. **Viagem:** pra escolher o melhor pico, a nota perde 1 ponto por hora de estrada.

Só entram horas com luz do dia. Hoje só contam as horas em que dá tempo de chegar.

## Limites e próximos passos

- **É estimativa.** Os dados são de modelos de mar aberto. Bancada, fundo e maré mudam muito a onda
  de verdade. Calibrar a nota com relatos e câmeras de cada pico é o próximo grande ganho.
- **Dados de onda (Open-Meteo):** grátis pra uso não comercial. Se o app tiver anúncio ou assinatura,
  precisa do plano pago deles.
- **Rotas (OSRM):** o servidor usado é o público de demonstração, bom pra testar mas não pra
  muitos usuários. Pra lançar: servidor OSRM próprio ou um serviço pago (Mapbox, Google, etc.).
- **Mapa (OpenStreetMap):** os mapas do servidor oficial servem pra pouco uso. Com muitos usuários,
  use um provedor de mapas (MapTiler, Stadia, Mapbox), que têm plano grátis.
- **Navegação:** funciona com a tela aberta. Pra navegar em segundo plano, como o Waze, com trânsito
  em tempo real, precisa virar app nativo com um SDK de navegação (Mapbox ou Google Navigation SDK).
- **Lojas:** dá pra empacotar este app pra Play Store com o PWABuilder (pwabuilder.com). A conta de
  desenvolvedor Google custa uma taxa única. Na App Store é preciso a conta Apple, que é anual.
