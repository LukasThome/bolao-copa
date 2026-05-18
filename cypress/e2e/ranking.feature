Feature: Participantes acompanham o ranking

  Scenario: Visualizar ranking com pontuações
    Given que existem participantes com palpites calculados
    When qualquer visitante acessa a página inicial
    Then deve ver uma tabela com nome, pontos e posição de cada participante
    And o participante com mais pontos deve aparecer em primeiro lugar

  Scenario: Ver marmitas no pódio
    Given que existem participantes com palpites calculados
    When qualquer visitante acessa a página inicial
    Then o primeiro colocado deve ver "3 marmitas" ao lado de sua posição
    And o segundo colocado deve ver "1 marmita" ao lado de sua posição

  Scenario: Desempate por acertos de placar exato
    Given que "Lucas" e "Ana" têm a mesma pontuação total
    But "Ana" tem mais acertos de placar exato que "Lucas"
    When qualquer visitante acessa o ranking
    Then "Ana" deve aparecer antes de "Lucas"
