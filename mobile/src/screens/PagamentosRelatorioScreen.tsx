import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getPagamentos, getJogadores, Pagamento, Jogador } from "../services/api";

export default function PagamentosRelatorioScreen() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);

  const agora = new Date();
  const [mesSel, setMesSel] = useState<number>(agora.getMonth() + 1);
  const [anoSel, setAnoSel] = useState<number>(agora.getFullYear());

  const carregar = async () => {
    try {
      const data = await getPagamentos();
      setPagamentos(data.pagamentos);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Erro ao carregar pagamentos");
    }
  };

  const carregarJogadores = async () => {
    try {
      const data = await getJogadores();
      setJogadores(data);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Erro ao carregar jogadores");
    }
  };

  useEffect(() => {
    carregar();
    carregarJogadores();
  }, []);

  const nomeMes = (m: number) => [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ][m - 1] || `${m}`;

  const mesesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    pagamentos.forEach(p => set.add(`${p.mes}-${p.ano}`));
    const arr = Array.from(set).map(key => {
      const [m, a] = key.split("-");
      return { mes: parseInt(m), ano: parseInt(a) };
    }).sort((x, y) => x.ano === y.ano ? x.mes - y.mes : x.ano - y.ano);
    return arr;
  }, [pagamentos]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatório de Pagamentos</Text>
      <View style={styles.relatorio}>
        <Text style={styles.relatorioTitle}>Relatório por mês</Text>
        <View style={styles.mesSelector}>
          <TouchableOpacity
            style={styles.btnMes}
            onPress={() => {
              const novoMes = mesSel - 1;
              if (novoMes < 1) { setMesSel(12); setAnoSel(anoSel - 1); }
              else setMesSel(novoMes);
            }}
          >
            <Text style={styles.btnText}>Anterior</Text>
          </TouchableOpacity>
          <Text style={styles.mesLabel}>{nomeMes(mesSel)} / {anoSel}</Text>
          <TouchableOpacity
            style={styles.btnMes}
            onPress={() => {
              const novoMes = mesSel + 1;
              if (novoMes > 12) { setMesSel(1); setAnoSel(anoSel + 1); }
              else setMesSel(novoMes);
            }}
          >
            <Text style={styles.btnText}>Próximo</Text>
          </TouchableOpacity>
        </View>
        {mesesDisponiveis.length > 0 ? (
          <View style={styles.mesesChips}>
            {mesesDisponiveis.map(({ mes, ano }) => {
              const active = mes === mesSel && ano === anoSel;
              return (
                <TouchableOpacity key={`${mes}-${ano}`} style={[styles.chip, active && styles.chipActive]} onPress={() => { setMesSel(mes); setAnoSel(ano); }}>
                  <Text style={active ? styles.chipTextActive : styles.chipText}>{nomeMes(mes)} {ano}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
        {(() => {
          const isFuturo = (
            anoSel > agora.getFullYear() ||
            (anoSel === agora.getFullYear() && mesSel > (agora.getMonth() + 1))
          );
          if (isFuturo) {
            // Mês futuro: manter a área de relatório em branco (não mostrar listas)
            return null;
          }
          const pagamentosMes = pagamentos.filter(p => p.mes === mesSel && p.ano === anoSel);
          const totalPorJogadorMes = new Map<number, number>();
          pagamentosMes.forEach(p => {
            const atual = totalPorJogadorMes.get(p.jogadorId) || 0;
            totalPorJogadorMes.set(p.jogadorId, atual + p.valor);
          });
          const pagosSet = new Set<number>();
          pagamentosMes.forEach(p => { if (p.pago) pagosSet.add(p.jogadorId); });

          // Total pago no mês (somente pagamentos com status 'pago')
          const totalPagoMes = pagamentosMes.reduce((sum, p) => p.pago ? sum + p.valor : sum, 0);

          const jogadoresPagaram = jogadores.filter(j => pagosSet.has(j.id));
          const jogadoresPendentesMensalistas = jogadores.filter(j => j.tipo === "MENSALISTA" && !pagosSet.has(j.id));
          const jogadoresPendentesAvulsos = jogadores.filter(j => j.tipo === "AVULSO" && !pagosSet.has(j.id));
          return (
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionTitle}>Total pago no mês: R$ {totalPagoMes.toFixed(2)}</Text>
              <Text style={styles.sectionTitle}>Pagaram ({jogadoresPagaram.length})</Text>
              {jogadoresPagaram.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum pagamento registrado no mês selecionado.</Text>
              ) : (
                jogadoresPagaram.map(j => (
                  <Text key={j.id} style={styles.itemLine}>
                    • {j.nome} — R$ {totalPorJogadorMes.get(j.id) || 0}
                  </Text>
                ))
              )}
              <Text style={styles.sectionTitle}>Pendentes Mensalistas ({jogadoresPendentesMensalistas.length})</Text>
              {jogadoresPendentesMensalistas.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum mensalista pendente.</Text>
              ) : (
                jogadoresPendentesMensalistas.map(j => <Text key={j.id} style={[styles.itemLine, styles.alertText]}>• {j.nome}</Text>)
              )}
              <Text style={styles.sectionTitle}>Pendentes Avulsos ({jogadoresPendentesAvulsos.length})</Text>
              {jogadoresPendentesAvulsos.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum avulso pendente.</Text>
              ) : (
                jogadoresPendentesAvulsos.map(j => <Text key={j.id} style={[styles.itemLine, styles.alertText]}>• {j.nome}</Text>)
              )}
            </View>
          );
        })()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  relatorio: { padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#ddd", borderRadius: 8, marginBottom: 16 },
  relatorioTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  mesSelector: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  mesLabel: { fontWeight: "600" },
  btnMes: { backgroundColor: "#6c757d", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sectionTitle: { fontWeight: "600" },
  emptyText: { color: "#555" },
  itemLine: { color: "#333" },
  alertText: { color: "#c1121f", fontWeight: "600" },
  mesesChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#aaa", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  chipActive: { backgroundColor: "#007bff", borderColor: "#007bff" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
});