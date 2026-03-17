
export interface HelpRecord {
  id: string;
  description: string;
  date: string;
  category: string;
  value: number;
}

export interface PoliticalProfile {
  name: string;
  party: string;
  office: string; // Cargo (Ex: Vereador, Prefeito)
  scope: 'municipal' | 'estadual';
  slogan: string;
  voteGoal?: number; // Meta de votos
  number?: string;
  phone?: string; // Telefone para receber lembretes de agenda
}

export interface CaboEleitoral {
  id: string;
  name: string;
  phone: string;
  location: string; // Bairro se municipal, Cidade se estadual
  voterGoal: number; // Quantos eleitores este cabo pretende trazer
  hiredAt: string;
}

export interface Voter {
  id: string;
  name: string;
  birthDate: string; // ISO string YYYY-MM-DD
  gender: 'Masculino' | 'Feminino' | 'Outro';
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string; 
  observations: string;
  isFamilyMember: boolean;
  helpRecords?: HelpRecord[];
  createdAt: string;
  caboId?: string; // ID do cabo eleitoral responsável por este eleitor
}

export interface Appointment {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string YYYY-MM-DD
  time: string;
  location: string;
  voterId?: string;
  status: 'pending' | 'completed';
  type: 'visita' | 'reuniao' | 'evento' | 'outro';
}

export interface VoterFormData extends Omit<Voter, 'id' | 'createdAt' | 'helpRecords'> {}

export interface CommemorativeDate {
  id: string;
  day: number;
  month: number;
  title: string;
  message: string;
  category: 'feriado' | 'social' | 'religioso' | 'outro';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string YYYY-MM-DD
  type: 'entrada' | 'saida';
  category: 'alimentacao' | 'transporte' | 'marketing' | 'pessoal' | 'eventos' | 'doacao' | 'recurso_proprio' | 'partidario' | 'outros';
  paymentMethod: 'dinheiro' | 'cartao' | 'pix' | 'transferencia';
}

