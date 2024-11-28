// Tipos de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  photos?: string[];
  bio?: string;
  interests?: string[];
  availability?: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  plansCreated?: number;
  plansJoined?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Tipos de plan
export interface Plan {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  avatar?: string;
  creator: User;
  participants: User[];
  maxParticipants: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  privacy: 'public' | 'private';
  tags?: string[];
}

// Tipos de mensaje
export interface Message {
  id: string;
  text: string;
  sender: User;
  timestamp: Date;
  planId: string;
  attachments?: MessageAttachment[];
  status: 'sent' | 'delivered' | 'read';
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  thumbnail?: string;
  name?: string;
  size?: number;
}

// Tipos de notificación
export interface Notification {
  id: string;
  type: 'CHAT_MESSAGE' | 'PLAN_UPDATE' | 'PLAN_REMINDER' | 'NEW_MATCH';
  title: string;
  body: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

// Estados de la aplicación
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  connectionStatus: ConnectionStatus;
  notifications: Notification[];
  settings: AppSettings;
}

// Configuración de la aplicación
export interface AppSettings {
  notifications: {
    enabled: boolean;
    chatMessages: boolean;
    planUpdates: boolean;
    reminders: boolean;
  };
  privacy: {
    shareLocation: boolean;
    publicProfile: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}

// Tipos de error
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Tipos de filtros
export interface PlanFilters {
  category?: string;
  date?: {
    start?: Date;
    end?: Date;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // en kilómetros
  };
  participantsRange?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  status?: Plan['status'];
}

// Tipos de eventos del socket
export interface SocketEvents {
  connect: () => void;
  disconnect: (reason: string) => void;
  join_plan: (planId: string) => void;
  leave_plan: (planId: string) => void;
  send_message: (data: { planId: string; message: string }) => void;
  new_message: (message: Message) => void;
  plan_update: (plan: Plan) => void;
}

// Tipos de analíticas
export interface Analytics {
  plansCreated: number;
  plansJoined: number;
  messagesSent: number;
  connections: number;
  activeTime: number; // en minutos
}

// Tipos de geolocalización
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// Tipos de caché
export interface CacheEntry<T> {
  value: T;
  expiry: number;
}

// Tipos de perfil
export interface ProfileData {
  bio: string;
  interests: string[];
  avatar?: string;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
}
