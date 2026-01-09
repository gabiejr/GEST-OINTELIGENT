
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
  city: string; // Nova propriedade
  observations: string;
  isFamilyMember: boolean;
  helpRecords?: HelpRecord[];
  createdAt: string;
  caboId?: string; // ID do cabo eleitoral responsável por este eleitor
}

export interface VoterFormData extends Omit<Voter, 'id' | 'createdAt' | 'helpRecords'> {}
