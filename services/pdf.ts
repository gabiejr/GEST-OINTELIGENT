
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Voter, PoliticalProfile, CaboEleitoral } from "../types";

function addPoliticianHeader(doc: jsPDF, politician?: PoliticalProfile, isLandscape = true) {
  const width = isLandscape ? 283 : 196;
  if (politician) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text(`${politician.office.toUpperCase()} ${politician.name.toUpperCase()}`, 14, 8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Partido: ${politician.party} | ${politician.slogan}`, 14, 12);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 14, width, 14);
  }
}

export function exportVotersToPDF(voters: Voter[], politician?: PoliticalProfile) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const now = new Date().toLocaleString("pt-BR");
  addPoliticianHeader(doc, politician, true);

  doc.setFontSize(18);
  doc.setTextColor(67, 56, 202);
  doc.text("Relatório Geral de Eleitores", 14, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em: ${now}`, 14, 32);
  doc.text(`Total de registros: ${voters.length}`, 14, 37);

  const tableColumn = ["Nome", "Nascimento", "Sexo", "Telefone", "Bairro", "Cidade", "Família"];
  const tableRows = voters.map((voter) => [
    voter.name,
    new Date(voter.birthDate).toLocaleDateString('pt-BR'),
    voter.gender || 'N/I',
    voter.phone,
    voter.neighborhood,
    voter.city || 'N/I',
    voter.isFamilyMember ? "Sim" : "Não"
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [67, 56, 202] },
    styles: { fontSize: 8 },
    columnStyles: {
      2: { halign: 'center' },
      6: { halign: 'center' }
    }
  });

  doc.save(`relatorio_eleitores_${new Date().getTime()}.pdf`);
}

export function exportDetailedFinancialReportPDF(voters: Voter[], politician: PoliticalProfile) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const now = new Date().toLocaleString("pt-BR");
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  addPoliticianHeader(doc, politician, true);

  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text("Relatório Detalhado de Investimentos e Auxílios", 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Documento de prestação de contas interna | Gerado em: ${now}`, 14, 32);

  const allRecords: any[] = [];
  let totalValue = 0;

  voters.forEach(voter => {
    voter.helpRecords?.forEach(record => {
      totalValue += record.value || 0;
      allRecords.push([
        new Date(record.date).toLocaleDateString('pt-BR'),
        voter.name,
        record.category,
        record.description,
        formatCurrency(record.value || 0)
      ]);
    });
  });

  // Ordenar por data (mais recente primeiro)
  allRecords.sort((a, b) => {
    const dateA = a[0].split('/').reverse().join('-');
    const dateB = b[0].split('/').reverse().join('-');
    return dateB.localeCompare(dateA);
  });

  (doc as any).autoTable({
    head: [["Data", "Eleitor", "Categoria", "O que foi ajudado", "Valor Destinado"]],
    body: allRecords,
    startY: 40,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' },
      1: { fontStyle: 'bold' }
    },
    didDrawPage: (data: any) => {
      // Rodapé em cada página se necessário, ou apenas no fim
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 50;
  
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(190, finalY + 5, 93, 15, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL GERAL INVESTIDO:", 195, finalY + 14);
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(totalValue), 245, finalY + 14);

  doc.save(`financeiro_detalhado_${new Date().getTime()}.pdf`);
}

export function exportFullCampaignOverviewPDF(voters: Voter[], cabos: CaboEleitoral[], politician: PoliticalProfile) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("pt-BR");
  
  addPoliticianHeader(doc, politician, false);

  doc.setFontSize(22);
  doc.setTextColor(67, 56, 202);
  doc.text("Resumo Geral da Campanha", 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Data do Relatório: ${now}`, 14, 38);

  // Stats Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 45, 182, 40, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.text("INDICADORES CHAVE", 20, 55);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Total de Eleitores Base: ${voters.length}`, 20, 65);
  doc.text(`Total de Lideranças (Cabos): ${cabos.length}`, 20, 72);
  doc.text(`Meta de Votos: ${politician.voteGoal || 0}`, 20, 79);
  
  const progress = politician.voteGoal ? ((voters.length + cabos.length) / politician.voteGoal * 100).toFixed(1) : "0";
  doc.setFont("helvetica", "bold");
  doc.setTextColor(67, 56, 202);
  doc.text(`PROGRESSO DA META: ${progress}%`, 120, 65);

  // Cabos Table
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("Desempenho por Liderança", 14, 100);

  const caboRows = cabos.map(c => {
    const count = voters.filter(v => v.caboId === c.id).length;
    const perf = c.voterGoal ? (count / c.voterGoal * 100).toFixed(0) : "0";
    return [c.name, c.location, c.voterGoal.toString(), count.toString(), `${perf}%`];
  });

  (doc as any).autoTable({
    head: [["Nome", "Localização", "Meta", "Alcançado", "%"]],
    body: caboRows,
    startY: 105,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 9 }
  });

  // Neighborhood Summary
  const lastY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("Distribuição Geográfica (Top Bairros/Cidades)", 14, lastY);
  
  const neighborhoodStats: Record<string, number> = {};
  voters.forEach(v => {
    const label = `${v.neighborhood}${v.city ? ` (${v.city})` : ''}`;
    neighborhoodStats[label] = (neighborhoodStats[label] || 0) + 1;
  });
  
  const neighborhoodRows = Object.entries(neighborhoodStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => [name, count.toString()]);

  (doc as any).autoTable({
    head: [["Localidade", "Qtd. Eleitores"]],
    body: neighborhoodRows,
    startY: lastY + 5,
    theme: 'grid',
    headStyles: { fillColor: [100, 116, 139] },
    styles: { fontSize: 9 }
  });

  doc.save(`resumo_campanha_${new Date().getTime()}.pdf`);
}

export function exportVoterHistoryPDF(voter: Voter, politician?: PoliticalProfile) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("pt-BR");
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (politician) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text(`${politician.office.toUpperCase()} ${politician.name.toUpperCase()}`, 14, 8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Partido: ${politician.party} | ${politician.slogan}`, 14, 12);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 14, 196, 14);
  }

  doc.setFontSize(20);
  doc.setTextColor(67, 56, 202);
  doc.text("Relatório de Atendimento Individual", 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Eleitor: ${voter.name} (${voter.gender || 'N/I'})`, 14, 40);
  doc.text(`Local: ${voter.neighborhood}${voter.city ? `, ${voter.city}` : ''}`, 14, 45);
  doc.text(`Telefone: ${voter.phone}`, 14, 50);
  doc.text(`Gerado em: ${now}`, 14, 55);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 60, 196, 60);

  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85);
  doc.text("Histórico de Ajudas e Atendimentos", 14, 70);

  if (!voter.helpRecords || voter.helpRecords.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text("Nenhum registro encontrado para este eleitor.", 14, 80);
  } else {
    const totalSpent = voter.helpRecords.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const tableColumn = ["Data", "Categoria", "Valor", "Descrição"];
    const tableRows = voter.helpRecords.map((record) => [
      new Date(record.date).toLocaleDateString('pt-BR'),
      record.category,
      formatCurrency(record.value || 0),
      record.description
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        2: { fontStyle: 'bold' },
        3: { cellWidth: 80 }
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 90;
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL INVESTIDO NESTE ELEITOR: ${formatCurrency(totalSpent)}`, 14, finalY + 10);
  }

  doc.save(`historico_${voter.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}

export function exportMonthlyFinancialReportPDF(voters: Voter[], politician?: PoliticalProfile) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("pt-BR");
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (politician) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text(`${politician.office.toUpperCase()} ${politician.name.toUpperCase()}`, 14, 8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Partido: ${politician.party} | ${politician.slogan}`, 14, 12);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 14, 196, 14);
  }

  const stats: Record<string, number> = {};
  let totalOverall = 0;

  voters.forEach(v => {
    v.helpRecords?.forEach(record => {
      const d = new Date(record.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const value = record.value || 0;
      stats[key] = (stats[key] || 0) + value;
      totalOverall += value;
    });
  });

  const sortedStats = Object.entries(stats)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => b.month.localeCompare(a.month));

  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  doc.text("Balanço Financeiro Mensal", 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Consolidado de investimentos por período", 14, 38);
  doc.text(`Data: ${now}`, 14, 43);

  doc.setDrawColor(241, 245, 249);
  doc.line(14, 50, 196, 50);

  if (sortedStats.length === 0) {
    doc.setFontSize(12);
    doc.text("Sem registros financeiros.", 14, 65);
  } else {
    const tableColumn = ["Período", "Investido"];
    const tableRows = sortedStats.map(stat => {
      const [year, month] = stat.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      return [monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), formatCurrency(stat.total)];
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 11, cellPadding: 6 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 70;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, finalY + 10, 182, 25, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL ACUMULADO", 20, finalY + 20);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(formatCurrency(totalOverall), 20, finalY + 30);
  }

  doc.save(`financeiro_${new Date().getTime()}.pdf`);
}
